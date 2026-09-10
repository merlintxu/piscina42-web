import express from "express";
import { BRIDGE_HOST, BRIDGE_PORT, BRIDGE_VERSION } from "./config";
import {
  MoulinetteServiceError,
  runLocalMoulinetteFixture,
} from "./moulinette";
import { probeWorkstation } from "./probes";

const app = express();
const MOULINETTE_JSON_LIMIT = "8kb";
let moulinetteRunActive = false;
const ALLOWED_DEV_ORIGINS = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

app.use((request, response, next) => {
  const origin = request.header("origin");
  if (origin && ALLOWED_DEV_ORIGINS.has(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
  }
  if (request.method === "OPTIONS") {
    response.setHeader("Access-Control-Allow-Methods", "GET, POST");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return response.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: MOULINETTE_JSON_LIMIT }));

app.get("/health", (_request, response) => {
  response.json({
    status: "ok",
    version: BRIDGE_VERSION,
    generatedAt: new Date().toISOString(),
  });
});

app.get("/workstation", async (_request, response) => {
  response.json({
    snapshot: await probeWorkstation(),
    health: {
      status: "ok",
      version: BRIDGE_VERSION,
      generatedAt: new Date().toISOString(),
    },
  });
});

app.post("/moulinette/run", async (request, response) => {
  if (!request.is("application/json")) {
    response.status(400).json({
      error: {
        code: "invalid_content_type",
        message: "Content-Type must be application/json.",
      },
    });
    return;
  }

  if (moulinetteRunActive) {
    response.status(409).json({
      error: {
        code: "moulinette_busy",
        message: "A Moulinette run is already in progress.",
      },
    });
    return;
  }

  moulinetteRunActive = true;
  try {
    const result = await runLocalMoulinetteFixture(request.body);
    response.status(200).json(result);
  } catch (error) {
    if (error instanceof MoulinetteServiceError) {
      response.status(error.code === "fixture_not_found" ? 404 : 400).json({
        error: { code: error.code, message: error.message },
      });
      return;
    }

    console.error("Moulinette request failed.", error instanceof Error ? error.message : "unknown error");
    response.status(500).json({
      error: {
        code: "internal_error",
        message: "Moulinette execution failed.",
      },
    });
  } finally {
    moulinetteRunActive = false;
  }
});

app.use((error: unknown, _request: express.Request, response: express.Response, next: express.NextFunction) => {
  const bodyError = error as { type?: string; status?: number };
  if (bodyError.type === "entity.parse.failed" || bodyError.type === "entity.too.large") {
    response.status(400).json({
      error: {
        code: "invalid_request",
        message: "Request body must be valid JSON within the allowed size.",
      },
    });
    return;
  }
  next(error);
});

app.use((_request, response) => {
  response.status(404).json({ error: "Endpoint not found" });
});

app.listen(BRIDGE_PORT, BRIDGE_HOST, () => {
  console.log(`Local Training Bridge listening on http://${BRIDGE_HOST}:${BRIDGE_PORT}`);
});