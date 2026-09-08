import type { SandboxRequest } from "../types";

export type SandboxBackendKind = "docker";

export type SandboxBackendStatus = "available" | "unavailable" | "degraded";

export interface SandboxBackendInfo {
  kind: SandboxBackendKind;
  status: SandboxBackendStatus;
  version?: string;
  message?: string;
}

export type SandboxExecutionStatus =
  | "created"
  | "prepared"
  | "running"
  | "completed"
  | "failed"
  | "destroyed";

export interface SandboxExecutionContext {
  executionId: string;
  jobId: string;
  workspaceId: string;
  createdAt: string;
  expiresAt: string;
  status: SandboxExecutionStatus;
}

export interface SandboxExecutionPlan {
  context: SandboxExecutionContext;
  request: SandboxRequest;
  backend: SandboxBackendKind;
}

export interface SandboxLifecycleResult {
  executionId: string;
  status: SandboxExecutionStatus;
  message?: string;
}

export interface SandboxBackend {
  getInfo(): SandboxBackendInfo;
  prepare(request: SandboxRequest): Promise<SandboxLifecycleResult>;
  run(plan: SandboxExecutionPlan): Promise<SandboxLifecycleResult>;
  destroy(context: SandboxExecutionContext): Promise<SandboxLifecycleResult>;
}