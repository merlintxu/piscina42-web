import { normalizeWorkstationSnapshot } from "./validation";
import type { BridgeHealth, WorkstationProbeResult } from "./types";

export const mockPartialWorkstationSnapshot = {
  generatedAt: "2026-09-08T00:00:00.000Z",
  platform: "Linux",
  environment: "Local workstation",
  tools: [
    {
      id: "git",
      label: "Git",
      category: "required" as const,
      installed: true,
      status: "pass" as const,
    },
    {
      id: "norminette",
      label: "Norminette",
      category: "required" as const,
      installed: false,
      status: "unknown" as const,
    },
  ],
  requiredPassed: 99,
  requiredTotal: 99,
  readinessPercent: 100,
};

const normalizedMockSnapshot = normalizeWorkstationSnapshot(mockPartialWorkstationSnapshot);

if (!normalizedMockSnapshot) {
  throw new Error("Invalid workstation snapshot mock");
}

export const mockHealthyBridge: WorkstationProbeResult = {
  snapshot: normalizedMockSnapshot,
  health: {
    status: "ok",
    version: "0.1.0",
    generatedAt: "2026-09-08T00:00:00.000Z",
  },
};

export const mockOfflineBridge: BridgeHealth = {
  status: "offline",
  version: "0.1.0",
  generatedAt: "2026-09-08T00:00:00.000Z",
};