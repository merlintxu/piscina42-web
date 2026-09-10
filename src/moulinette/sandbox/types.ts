import type { MoulinetteJob } from "../types";

export interface SandboxSourceFile {
  path: string;
  content: string;
}

export interface SandboxJobInput {
  jobId: string;
  challengeId: string;
  files: SandboxSourceFile[];
  mode: "learn" | "prove";
}

export interface SandboxCompileConfig {
  compiler: "gcc" | "clang";
  standard?: string;
  strictFlags: boolean;
}

export interface SandboxLimits {
  executionMs: number;
  compileMs: number;
  memoryMb: number;
  outputBytes: number;
  maxProcesses: number;
  networkAllowed: boolean;
  writableFilesystem: boolean;
}

export interface SandboxRequest {
  job: SandboxJobInput;
  compile: SandboxCompileConfig;
  limits: SandboxLimits;
}

export interface SandboxProcessResult {
  exitCode: number | null;
  signal?: string;
  stdout: string;
  stderr: string;
  durationMs: number;
  timedOut: boolean;
}

export interface SandboxCompileResult {
  status: "pass" | "fail" | "error";
  process: SandboxProcessResult;
}

export interface SandboxTestResult {
  testId: string;
  status: "pass" | "fail" | "error";
  process?: SandboxProcessResult;
  message?: string;
}

export type SandboxRunErrorCode =
  | "invalid_request"
  | "workspace_error"
  | "compile_timeout"
  | "execution_timeout"
  | "internal_docker_error";

export interface SandboxRunError {
  code: SandboxRunErrorCode;
  message: string;
}

export interface SandboxRunResult {
  compile: SandboxCompileResult;
  tests: SandboxTestResult[];
  completedAt: string;
  norminette?: SandboxProcessResult;
  error?: SandboxRunError;
}

export type SandboxRequestSourceJob = Pick<
  MoulinetteJob,
  "id" | "challengeId" | "mode"
>;