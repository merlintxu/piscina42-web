import { randomUUID } from "node:crypto";
import type { SandboxRequest } from "../types";
import type {
  SandboxExecutionContext,
  SandboxExecutionPlan,
  SandboxExecutionStatus,
} from "./types";

export interface ExecutionContextOptions {
  executionId?: string;
  workspaceId?: string;
  createdAt?: string;
  expiresAt?: string;
}

export function createExecutionContext(
  jobId: string,
  options: ExecutionContextOptions = {},
): SandboxExecutionContext {
  const createdAt = options.createdAt ?? new Date().toISOString();
  const expiresAt =
    options.expiresAt ?? new Date(Date.parse(createdAt) + 5 * 60 * 1000).toISOString();

  return {
    executionId: options.executionId ?? randomUUID(),
    jobId,
    workspaceId: options.workspaceId ?? randomUUID(),
    createdAt,
    expiresAt,
    status: "created",
  };
}

export function createExecutionPlan(
  request: SandboxRequest,
  context: SandboxExecutionContext,
): SandboxExecutionPlan {
  return {
    context,
    request,
    backend: "docker",
  };
}

const ALLOWED_TRANSITIONS: Record<
  SandboxExecutionStatus,
  readonly SandboxExecutionStatus[]
> = {
  created: ["prepared", "failed"],
  prepared: ["running", "failed"],
  running: ["completed", "failed"],
  completed: ["destroyed"],
  failed: ["destroyed"],
  destroyed: [],
};

export function canTransitionExecutionStatus(
  from: SandboxExecutionStatus,
  to: SandboxExecutionStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}