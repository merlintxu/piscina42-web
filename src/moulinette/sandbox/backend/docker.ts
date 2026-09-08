import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { SandboxRequest } from "../types";
import type { SandboxProcessResult } from "../types";
import type {
  SandboxBackend,
  SandboxBackendInfo,
  SandboxExecutionContext,
  SandboxExecutionPlan,
  SandboxLifecycleResult,
} from "./types";

const execFileAsync = promisify(execFile);
const DOCKER_SMOKE_IMAGE = "alpine:3.22";
const DOCKER_SMOKE_TIMEOUT_MS = 5_000;
const DOCKER_SMOKE_MAX_OUTPUT_BYTES = 16 * 1024;
const DOCKER_SMOKE_ARGS = [
  "run",
  "--rm",
  "--network",
  "none",
  "--read-only",
  "--cap-drop",
  "ALL",
  "--security-opt",
  "no-new-privileges",
  "--pids-limit",
  "32",
  "--memory",
  "128m",
  "--cpus",
  "0.5",
  "--user",
  "65534:65534",
  DOCKER_SMOKE_IMAGE,
  "/usr/bin/printf",
  "sandbox-ok",
] as const;

export interface DockerCapabilityProbe {
  cliAvailable: boolean;
  daemonAvailable: boolean;
  version?: string;
  operatingSystem?: string;
  architecture?: string;
  message?: string;
}

export async function runDockerSandboxSmokeTest(): Promise<SandboxProcessResult> {
  const startedAt = Date.now();

  try {
    const result = await execFileAsync("docker", [...DOCKER_SMOKE_ARGS], {
      encoding: "utf8",
      maxBuffer: DOCKER_SMOKE_MAX_OUTPUT_BYTES,
      shell: false,
      timeout: DOCKER_SMOKE_TIMEOUT_MS,
      windowsHide: true,
    });

    return {
      exitCode: 0,
      stdout: result.stdout,
      stderr: result.stderr,
      durationMs: Date.now() - startedAt,
      timedOut: false,
    };
  } catch (error) {
    const smokeError = error as NodeJS.ErrnoException & {
      killed?: boolean;
      signal?: string;
      stdout?: string;
      stderr?: string;
    };
    const timedOut = smokeError.killed || smokeError.code === "ETIMEDOUT";

    return {
      exitCode: typeof smokeError.code === "number" ? smokeError.code : null,
      ...(smokeError.signal ? { signal: smokeError.signal } : {}),
      stdout: smokeError.stdout ?? "",
      stderr: smokeError.stderr ?? smokeError.message ?? "Docker smoke test failed.",
      durationMs: Date.now() - startedAt,
      timedOut,
    };
  }
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