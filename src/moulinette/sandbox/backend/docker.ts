import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { chmod, mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import type {
  SandboxCompileResult,
  SandboxProcessResult,
  SandboxRequest,
} from "../types";
import { DEFAULT_MOULINETTE_POLICY } from "../../policy";
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
const CONTROLLED_C_IMAGE = "gcc:15";
const CONTROLLED_C_MAX_OUTPUT_BYTES = DEFAULT_MOULINETTE_POLICY.maxOutputBytes;
const CONTROLLED_C_SOURCE = `int main(void)
{
  return 0;
}
`;
const CONTROLLED_C_OUTPUT_SOURCE = `#include <stdio.h>

int main(void)
{
  printf("fixture-ok");
  return 0;
}
`;
const CONTROLLED_C_INVALID_SOURCE = `int main(void)
{
  return ;
}
`;

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

export interface ControlledCFixtureResult {
  baseline: SandboxCompileResult;
  valid: {
    compile: SandboxCompileResult;
    execution?: SandboxProcessResult;
  };
  invalid: SandboxCompileResult;
}

function processResultFromError(
  error: unknown,
  startedAt: number,
): SandboxProcessResult {
  const processError = error as NodeJS.ErrnoException & {
    killed?: boolean;
    signal?: string;
    stdout?: string;
    stderr?: string;
  };
  const timedOut = processError.killed === true || processError.code === "ETIMEDOUT";

  return {
    exitCode: typeof processError.code === "number" ? processError.code : null,
    ...(processError.signal ? { signal: processError.signal } : {}),
    stdout: processError.stdout ?? "",
    stderr: processError.stderr ?? processError.message ?? "Docker process failed.",
    durationMs: Date.now() - startedAt,
    timedOut,
  };
}

async function removeControlledContainer(containerName: string): Promise<void> {
  try {
    await execFileAsync("docker", ["rm", "--force", containerName], {
      encoding: "utf8",
      maxBuffer: 4 * 1024,
      shell: false,
      timeout: 1_000,
      windowsHide: true,
    });
  } catch {
    // The --rm flag handles normal completion; cleanup is best effort after a timeout.
  }
}

async function compileControlledCFixture(
  sourceDir: string,
  outputDir: string,
  sourceFile: string,
  outputFile: string,
): Promise<SandboxProcessResult> {
  const startedAt = Date.now();
  const containerName = `piscina42-c-${randomUUID()}`;
  const args = [
    "run",
    "--rm",
    "--name",
    containerName,
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
    "--tmpfs",
    "/tmp:rw,noexec,nosuid,nodev,size=16m",
    "--mount",
    `type=bind,src=${sourceDir},dst=/workspace,readonly`,
    "--mount",
    `type=bind,src=${outputDir},dst=/output`,
    CONTROLLED_C_IMAGE,
    "gcc",
    "-Wall",
    "-Wextra",
    "-Werror",
    `/workspace/${sourceFile}`,
    "-o",
    `/output/${outputFile}`,
  ] as const;

  try {
    const result = await execFileAsync("docker", [...args], {
      encoding: "utf8",
      maxBuffer: CONTROLLED_C_MAX_OUTPUT_BYTES,
      shell: false,
      timeout: DEFAULT_MOULINETTE_POLICY.maxCompileMs,
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
    return processResultFromError(error, startedAt);
  } finally {
    await removeControlledContainer(containerName);
  }
}

async function executeControlledCFixture(
  outputDir: string,
): Promise<SandboxProcessResult> {
  const startedAt = Date.now();
  const containerName = `piscina42-c-${randomUUID()}`;
  const args = [
    "run",
    "--rm",
    "--name",
    containerName,
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
    "--mount",
    `type=bind,src=${outputDir},dst=/output,readonly`,
    CONTROLLED_C_IMAGE,
    "/output/fixture-output",
  ] as const;

  try {
    const result = await execFileAsync("docker", [...args], {
      encoding: "utf8",
      maxBuffer: CONTROLLED_C_MAX_OUTPUT_BYTES,
      shell: false,
      timeout: DEFAULT_MOULINETTE_POLICY.maxExecutionMs,
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
    return processResultFromError(error, startedAt);
  } finally {
    await removeControlledContainer(containerName);
  }
}

function compileResult(process: SandboxProcessResult): SandboxCompileResult {
  return {
    status: process.timedOut ? "error" : process.exitCode === 0 ? "pass" : "fail",
    process,
  };
}

export async function runControlledCFixture(): Promise<ControlledCFixtureResult> {
  const workspaceDir = await mkdtemp(join(tmpdir(), "piscina42-c-fixture-"));
  const sourceDir = join(workspaceDir, "source");
  const outputDir = join(workspaceDir, "output");

  try {
    await mkdir(sourceDir);
    await mkdir(outputDir);
    await chmod(workspaceDir, 0o755);
    await chmod(sourceDir, 0o755);
    await chmod(outputDir, 0o733);
    await writeFile(join(sourceDir, "fixture.c"), CONTROLLED_C_SOURCE, { mode: 0o444 });
    await writeFile(join(sourceDir, "fixture-output.c"), CONTROLLED_C_OUTPUT_SOURCE, {
      mode: 0o444,
    });
    await writeFile(join(sourceDir, "fixture-invalid.c"), CONTROLLED_C_INVALID_SOURCE, {
      mode: 0o444,
    });

    const baselineCompile = compileResult(
      await compileControlledCFixture(
        sourceDir,
        outputDir,
        "fixture.c",
        "fixture",
      ),
    );
    const validCompileProcess = await compileControlledCFixture(
      sourceDir,
      outputDir,
      "fixture-output.c",
      "fixture-output",
    );
    const validCompile = compileResult(validCompileProcess);
    const execution =
      validCompile.status === "pass"
        ? await executeControlledCFixture(outputDir)
        : undefined;
    const invalidCompile = compileResult(
      await compileControlledCFixture(
        sourceDir,
        outputDir,
        "fixture-invalid.c",
        "fixture-invalid",
      ),
    );

    return {
      baseline: baselineCompile,
      valid: { compile: validCompile, ...(execution ? { execution } : {}) },
      invalid: invalidCompile,
    };
  } finally {
    await rm(workspaceDir, { recursive: true, force: true });
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