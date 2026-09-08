import express from "express";
import { BRIDGE_HOST, BRIDGE_PORT, BRIDGE_VERSION } from "./config";
import { probeWorkstation } from "./probes";

const app = express();

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