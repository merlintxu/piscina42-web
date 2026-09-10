import type { WorkstationSnapshot } from "../types";

export type BridgeHealthStatus = "ok" | "degraded" | "offline";

export interface BridgeHealth {
  status: BridgeHealthStatus;
  version: string;
  generatedAt: string;
}

export interface WorkstationProbeResult {
  snapshot: WorkstationSnapshot;
  health: BridgeHealth;
}

export interface BridgeError {
  code: string;
  message: string;
  recoverable: boolean;
}