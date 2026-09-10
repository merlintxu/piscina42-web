import { mockValidSandboxRequest } from "../mocks";
import { createExecutionContext, createExecutionPlan } from "./lifecycle";
import type {
  SandboxBackendInfo,
  SandboxExecutionContext,
  SandboxExecutionPlan,
  SandboxLifecycleResult,
} from "./types";

export const mockAvailableBackend: SandboxBackendInfo = {
  kind: "docker",
  status: "available",
  version: "24.0-stub",
  message: "Simulated backend availability.",
};

export const mockUnavailableBackend: SandboxBackendInfo = {
  kind: "docker",
  status: "unavailable",
  message: "Docker backend is unavailable in this contract mock.",
};

export const mockCreatedExecutionContext: SandboxExecutionContext = createExecutionContext(
  "job-successful-001",
  {
    executionId: "execution-mock-001",
    workspaceId: "workspace-mock-001",
    createdAt: "2026-09-08T00:00:00.000Z",
    expiresAt: "2026-09-08T00:05:00.000Z",
  },
);

export const mockExecutionPlan: SandboxExecutionPlan = createExecutionPlan(
  mockValidSandboxRequest,
  mockCreatedExecutionContext,
);

export const mockCompletedLifecycle: SandboxLifecycleResult = {
  executionId: mockCreatedExecutionContext.executionId,
  status: "completed",
  message: "Simulated completed lifecycle.",
};

export const mockFailedLifecycle: SandboxLifecycleResult = {
  executionId: mockCreatedExecutionContext.executionId,
  status: "failed",
  message: "Simulated failed lifecycle.",
};