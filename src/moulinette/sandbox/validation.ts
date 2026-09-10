import {
  DEFAULT_MOULINETTE_POLICY,
} from "../policy";
import type { MoulinetteJob } from "../types";
import type {
  SandboxCompileConfig,
  SandboxJobInput,
  SandboxLimits,
  SandboxRequest,
  SandboxSourceFile,
} from "./types";

const MAX_SOURCE_FILE_BYTES = 256 * 1024;
const MAX_FILE_COUNT = 128;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPositiveInteger(value: unknown, maximum: number): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0 &&
    value <= maximum
  );
}

export function validateSandboxSourcePath(path: unknown): path is string {
  if (typeof path !== "string" || path.length === 0 || path.includes("\0")) {
    return false;
  }

  if (path.startsWith("/") || path.includes("\\")) {
    return false;
  }

  const segments = path.split("/");
  return (
    segments.every((segment) => /^[A-Za-z0-9._-]+$/.test(segment)) &&
    segments.every((segment) => segment !== "." && segment !== "..")
  );
}

function isSandboxSourceFile(value: unknown): value is SandboxSourceFile {
  return (
    isRecord(value) &&
    validateSandboxSourcePath(value.path) &&
    typeof value.content === "string" &&
    new TextEncoder().encode(value.content).byteLength <= MAX_SOURCE_FILE_BYTES
  );
}

function validateSandboxJob(value: unknown): value is SandboxJobInput {
  if (!isRecord(value) || typeof value.jobId !== "string" || value.jobId.length === 0) {
    return false;
  }

  if (
    typeof value.challengeId !== "string" ||
    value.challengeId.length === 0 ||
    (value.mode !== "learn" && value.mode !== "prove") ||
    !Array.isArray(value.files) ||
    value.files.length === 0 ||
    value.files.length > MAX_FILE_COUNT ||
    !value.files.every(isSandboxSourceFile)
  ) {
    return false;
  }

  const paths = value.files.map((file) => file.path);
  return new Set(paths).size === paths.length;
}

function validateSandboxCompile(value: unknown): value is SandboxCompileConfig {
  return (
    isRecord(value) &&
    (value.compiler === "gcc" || value.compiler === "clang") &&
    typeof value.strictFlags === "boolean" &&
    (value.standard === undefined ||
      (typeof value.standard === "string" && value.standard.length > 0))
  );
}

function validateSandboxLimits(value: unknown): value is SandboxLimits {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isPositiveInteger(value.executionMs, DEFAULT_MOULINETTE_POLICY.maxExecutionMs) &&
    isPositiveInteger(value.compileMs, DEFAULT_MOULINETTE_POLICY.maxCompileMs) &&
    value.compileMs <= value.executionMs &&
    isPositiveInteger(value.memoryMb, DEFAULT_MOULINETTE_POLICY.maxMemoryMb) &&
    isPositiveInteger(value.outputBytes, DEFAULT_MOULINETTE_POLICY.maxOutputBytes) &&
    isPositiveInteger(value.maxProcesses, DEFAULT_MOULINETTE_POLICY.maxProcesses) &&
    value.networkAllowed === false &&
    value.writableFilesystem === false
  );
}

export function validateSandboxRequest(value: unknown): value is SandboxRequest {
  if (!isRecord(value)) {
    return false;
  }

  return (
    validateSandboxJob(value.job) &&
    validateSandboxCompile(value.compile) &&
    validateSandboxLimits(value.limits)
  );
}

export function createSandboxRequestFromJob(
  job: Pick<MoulinetteJob, "id" | "challengeId" | "mode">,
  files: SandboxSourceFile[],
  compile: SandboxCompileConfig = { compiler: "gcc", strictFlags: true },
): SandboxRequest {
  return {
    job: {
      jobId: job.id,
      challengeId: job.challengeId,
      files: files.map((file) => ({ ...file })),
      mode: job.mode,
    },
    compile: { ...compile },
    limits: {
      executionMs: DEFAULT_MOULINETTE_POLICY.maxExecutionMs,
      compileMs: DEFAULT_MOULINETTE_POLICY.maxCompileMs,
      memoryMb: DEFAULT_MOULINETTE_POLICY.maxMemoryMb,
      outputBytes: DEFAULT_MOULINETTE_POLICY.maxOutputBytes,
      maxProcesses: DEFAULT_MOULINETTE_POLICY.maxProcesses,
      networkAllowed: false,
      writableFilesystem: false,
    },
  };
}