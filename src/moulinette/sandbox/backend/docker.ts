import type { SandboxRequest } from "../types";
import type {
  SandboxBackend,
  SandboxBackendInfo,
  SandboxExecutionContext,
  SandboxExecutionPlan,
  SandboxLifecycleResult,
} from "./types";

export interface DockerCapabilityProbe {
  cliAvailable: boolean;
  daemonAvailable: boolean;
  version?: string;
  operatingSystem?: string;
  architecture?: string;
  message?: string;
}

export function dockerBackendInfoFromProbe(
  probe: DockerCapabilityProbe,
): SandboxBackendInfo {
  if (!probe.cliAvailable) {
    return {
      kind: "docker",
      status: "unavailable",
      message: probe.message ?? "Docker CLI is unavailable.",
    };
  }

  return {
    kind: "docker",
    status: probe.daemonAvailable ? "available" : "degraded",
    ...(probe.version ? { version: probe.version } : {}),
    message:
      probe.message ??
      (probe.daemonAvailable
        ? [probe.operatingSystem, probe.architecture].filter(Boolean).join(" / ") || undefined
        : "Docker CLI is available but the daemon is inaccessible."),
  };
}

/**
 * Typed placeholder for a future Docker backend. A real implementation must
 * use an ephemeral container with disabled network, a read-only root
 * filesystem, a temporary bounded workspace, CPU/memory/PID limits, bounded
 * output, a strict timeout, a non-root user, no privileged mode, no general
 * host mounts, no Docker socket, and mandatory cleanup.
 */
export class DockerSandboxBackend implements SandboxBackend {
  constructor(private readonly capability?: DockerCapabilityProbe) {}

  getInfo(): SandboxBackendInfo {
    if (this.capability) {
      return dockerBackendInfoFromProbe(this.capability);
    }

    return {
      kind: "docker",
      status: "unavailable",
      version: "stub",
      message: "Docker sandbox execution is not implemented.",
    };
  }

  async prepare(_request: SandboxRequest): Promise<SandboxLifecycleResult> {
    return {
      executionId: "stub-execution",
      status: "failed",
      message: "Docker sandbox preparation is not implemented.",
    };
  }

  async run(_plan: SandboxExecutionPlan): Promise<SandboxLifecycleResult> {
    return {
      executionId: "stub-execution",
      status: "failed",
      message: "Docker sandbox execution is not implemented.",
    };
  }

  async destroy(context: SandboxExecutionContext): Promise<SandboxLifecycleResult> {
    return {
      executionId: context.executionId,
      status: "destroyed",
      message: "Docker sandbox cleanup is not implemented.",
    };
  }
}