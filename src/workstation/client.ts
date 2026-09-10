import { normalizeWorkstationSnapshot } from "./bridge";
import type { BridgeHealth, WorkstationProbeResult } from "./bridge";

const WORKSTATION_ENDPOINT = "http://127.0.0.1:4242/workstation";
const REQUEST_TIMEOUT_MS = 2_500;

export type WorkstationClientErrorKind = "offline" | "invalid-response";

export class WorkstationClientError extends Error {
  constructor(
    public readonly kind: WorkstationClientErrorKind,
    message: string,
  ) {
    super(message);
    this.name = "WorkstationClientError";
  }
}

function isBridgeHealth(value: unknown): value is BridgeHealth {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const health = value as Record<string, unknown>;
  return (
    (health.status === "ok" || health.status === "degraded" || health.status === "offline") &&
    typeof health.version === "string" &&
    typeof health.generatedAt === "string"
  );
}

export async function fetchWorkstationSnapshot(): Promise<WorkstationProbeResult> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    let response: Response;
    try {
      response = await fetch(WORKSTATION_ENDPOINT, {
        method: "GET",
        signal: controller.signal,
      });
    } catch {
      throw new WorkstationClientError(
        "offline",
        "Local Training Bridge no disponible.",
      );
    }

    if (!response.ok) {
      throw new WorkstationClientError(
        "invalid-response",
        `El bridge respondió con HTTP ${response.status}.`,
      );
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new WorkstationClientError(
        "invalid-response",
        "El bridge devolvió una respuesta JSON inválida.",
      );
    }

    if (typeof payload !== "object" || payload === null) {
      throw new WorkstationClientError(
        "invalid-response",
        "La respuesta del bridge no tiene la estructura esperada.",
      );
    }

    const result = payload as Record<string, unknown>;
    const snapshot = normalizeWorkstationSnapshot(result.snapshot);
    if (!snapshot || !isBridgeHealth(result.health)) {
      throw new WorkstationClientError(
        "invalid-response",
        "La respuesta del bridge no tiene la estructura esperada.",
      );
    }

    return { snapshot, health: result.health };
  } finally {
    window.clearTimeout(timeout);
  }
}