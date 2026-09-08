import express from "express";
import { BRIDGE_HOST, BRIDGE_PORT, BRIDGE_VERSION } from "./config";
import { probeWorkstation } from "./probes";

const app = express();
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
  next();
});

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

app.use((_request, response) => {
  response.status(404).json({ error: "Endpoint not found" });
});

app.listen(BRIDGE_PORT, BRIDGE_HOST, () => {
  console.log(`Local Training Bridge listening on http://${BRIDGE_HOST}:${BRIDGE_PORT}`);
});