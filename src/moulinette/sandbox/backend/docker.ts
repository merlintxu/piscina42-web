import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { chmod, lstat, mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { promisify } from "node:util";
import type {
  SandboxCompileResult,
  SandboxProcessResult,
  SandboxRequest,
  SandboxRunResult,
  SandboxSourceFile,
} from "../types";
import { DEFAULT_MOULINETTE_POLICY } from "../../policy";
import { validateSandboxRequest, validateSandboxSourcePath } from "../validation";
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

const SANDBOX_C_IMAGES = {
  gcc: "gcc:15",
  clang: "clang:18",
} as const;
const SANDBOX_OUTPUT_PATH = "/output/program";

interface DockerProcessAttempt {
  process: SandboxProcessResult;
  dockerError: boolean;
}

function sandboxProcessFailure(message: string): SandboxProcessResult {
  return {
    exitCode: null,
    stdout: "",
    stderr: message,
    durationMs: 0,
    timedOut: false,
  };
}

function sandboxResultWithError(
  code: "invalid_request" | "workspace_error",
  message: string,
): SandboxRunResult {
  return {
    compile: {
      status: "error",
      process: sandboxProcessFailure(message),
    },
    tests: [],
    completedAt: new Date().toISOString(),
    error: { code, message },
  };
}

function isDockerInvocationError(error: unknown): boolean {
  const code = (error as { code?: unknown }).code;
  return code === "ENOENT" || code === 125;
}

function sandboxCompileResult(attempt: DockerProcessAttempt): SandboxCompileResult {
  return {
    status:
      attempt.process.timedOut || attempt.dockerError
        ? "error"
        : attempt.process.exitCode === 0
          ? "pass"
          : "fail",
    process: attempt.process,
  };
}

async function ensureSafeDirectoryTree(root: string, directory: string): Promise<void> {
  const relativeDirectory = relative(root, directory);
  let current = root;

  for (const segment of relativeDirectory.split(sep).filter(Boolean)) {
    current = join(current, segment);
    try {
      const entry = await lstat(current);
      if (entry.isSymbolicLink() || !entry.isDirectory()) {
        throw new Error(`Unsafe workspace directory: ${relativeDirectory}`);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
      await mkdir(current);
      const createdEntry = await lstat(current);
      if (createdEntry.isSymbolicLink() || !createdEntry.isDirectory()) {
        throw new Error(`Unsafe workspace directory: ${relativeDirectory}`);
      }
    }
  }
}

async function materializeSandboxSource(
  sourceRoot: string,
  sourceFile: SandboxSourceFile,
): Promise<string> {
  if (!validateSandboxSourcePath(sourceFile.path)) {
    throw new Error(`Invalid sandbox source path: ${sourceFile.path}`);
  }

  const destination = resolve(sourceRoot, sourceFile.path);
  const relativeDestination = relative(sourceRoot, destination);
  if (
    !relativeDestination ||
    relativeDestination.startsWith(`..${sep}`) ||
    isAbsolute(relativeDestination)
  ) {
    throw new Error(`Sandbox source path escapes workspace: ${sourceFile.path}`);
  }

  await ensureSafeDirectoryTree(sourceRoot, dirname(destination));
  await writeFile(destination, sourceFile.content, {
    encoding: "utf8",
    flag: "wx",
    mode: 0o444,
  });
  const entry = await lstat(destination);
  if (entry.isSymbolicLink() || !entry.isFile()) {
    throw new Error(`Unsafe sandbox source file: ${sourceFile.path}`);
  }

  return relativeDestination;
}

async function compileSandboxRequest(
  request: SandboxRequest,
  sourceRoot: string,
  sourcePath: string,
  outputRoot: string,
): Promise<DockerProcessAttempt> {
  const startedAt = Date.now();
  const containerName = `piscina42-request-${randomUUID()}`;
  const flags = request.compile.strictFlags ? ["-Wall", "-Wextra", "-Werror"] : [];
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
    String(request.limits.maxProcesses),
    "--memory",
    `${request.limits.memoryMb}m`,
    "--cpus",
    "0.5",
    "--user",
    "65534:65534",
    "--tmpfs",
    "/tmp:rw,noexec,nosuid,nodev,size=16m",
    "--mount",
    `type=bind,src=${sourceRoot},dst=/workspace,readonly`,
    "--mount",
    `type=bind,src=${outputRoot},dst=/output`,
    SANDBOX_C_IMAGES[request.compile.compiler],
    request.compile.compiler,
    ...flags,
    `/workspace/${sourcePath}`,
    "-o",
    SANDBOX_OUTPUT_PATH,
  ] as const;

  try {
    const result = await execFileAsync("docker", [...args], {
      encoding: "utf8",
      maxBuffer: request.limits.outputBytes,
      shell: false,
      timeout: request.limits.compileMs,
      windowsHide: true,
    });
    return {
      dockerError: false,
      process: {
        exitCode: 0,
        stdout: result.stdout,
        stderr: result.stderr,
        durationMs: Date.now() - startedAt,
        timedOut: false,
      },
    };
  } catch (error) {
    return {
      dockerError: isDockerInvocationError(error),
      process: processResultFromError(error, startedAt),
    };
  } finally {
    await removeControlledContainer(containerName);
  }
}

async function executeSandboxRequest(
  request: SandboxRequest,
  outputRoot: string,
): Promise<DockerProcessAttempt> {
  const startedAt = Date.now();
  const containerName = `piscina42-request-${randomUUID()}`;
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
    String(request.limits.maxProcesses),
    "--memory",
    `${request.limits.memoryMb}m`,
    "--cpus",
    "0.5",
    "--user",
    "65534:65534",
    "--mount",
    `type=bind,src=${outputRoot},dst=/output,readonly`,
    SANDBOX_C_IMAGES[request.compile.compiler],
    SANDBOX_OUTPUT_PATH,
  ] as const;

  try {
    const result = await execFileAsync("docker", [...args], {
      encoding: "utf8",
      maxBuffer: request.limits.outputBytes,
      shell: false,
      timeout: request.limits.executionMs,
      windowsHide: true,
    });
    return {
      dockerError: false,
      process: {
        exitCode: 0,
        stdout: result.stdout,
        stderr: result.stderr,
        durationMs: Date.now() - startedAt,
        timedOut: false,
      },
    };
  } catch (error) {
    return {
      dockerError: isDockerInvocationError(error),
      process: processResultFromError(error, startedAt),
    };
  } finally {
    await removeControlledContainer(containerName);
  }
}

export async function runSandboxRequest(request: SandboxRequest): Promise<SandboxRunResult> {
  if (!validateSandboxRequest(request)) {
    return sandboxResultWithError("invalid_request", "Sandbox request is invalid.");
  }

  if (
    request.job.files.length !== 1 ||
    !request.job.files[0].path.endsWith(".c") ||
    !request.job.files.every((file) => validateSandboxSourcePath(file.path))
  ) {
    return sandboxResultWithError(
      "invalid_request",
      "Sandbox request must contain exactly one validated .c source file.",
    );
  }

  let workspaceDir: string | undefined;
  try {
    workspaceDir = await mkdtemp(join(tmpdir(), "piscina42-request-"));
    const sourceRoot = join(workspaceDir, "source");
    const outputRoot = join(workspaceDir, "output");
    await mkdir(sourceRoot);
    await mkdir(outputRoot);
    await chmod(workspaceDir, 0o755);
    await chmod(sourceRoot, 0o755);
    await chmod(outputRoot, 0o733);
    const sourcePath = await materializeSandboxSource(sourceRoot, request.job.files[0]);

    const compileAttempt = await compileSandboxRequest(
      request,
      sourceRoot,
      sourcePath,
      outputRoot,
    );
    const compile = sandboxCompileResult(compileAttempt);
    if (compile.status !== "pass") {
      return {
        compile,
        tests: [],
        completedAt: new Date().toISOString(),
        ...(compileAttempt.process.timedOut
          ? { error: { code: "compile_timeout" as const, message: "Sandbox compilation timed out." } }
          : compileAttempt.dockerError
            ? { error: { code: "internal_docker_error" as const, message: "Docker compilation failed." } }
            : {}),
      };
    }

    const executionAttempt = await executeSandboxRequest(request, outputRoot);
    const execution = executionAttempt.process;
    const test = {
      testId: "functional",
      status: execution.timedOut || executionAttempt.dockerError
        ? "error" as const
        : execution.exitCode === 0
          ? "pass" as const
          : "fail" as const,
      process: execution,
    };

    return {
      compile,
      tests: [test],
      completedAt: new Date().toISOString(),
      ...(execution.timedOut
        ? { error: { code: "execution_timeout" as const, message: "Sandbox execution timed out." } }
        : executionAttempt.dockerError
          ? { error: { code: "internal_docker_error" as const, message: "Docker execution failed." } }
          : {}),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sandbox workspace failed.";
    return sandboxResultWithError("workspace_error", message);
  } finally {
    if (workspaceDir) {
      await rm(workspaceDir, { recursive: true, force: true });
    }
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