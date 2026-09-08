export type MoulinetteJobStatus =
  | "pending"
  | "preparing"
  | "compiling"
  | "testing"
  | "checking_style"
  | "checking_memory"
  | "completed"
  | "failed"
  | "cancelled";

export type MoulinetteCheckType =
  | "compile"
  | "strict_flags"
  | "norminette"
  | "functional"
  | "memory"
  | "timeout";

export type MoulinetteCheckStatus = "pass" | "fail" | "skipped" | "error";

export interface MoulinetteCheckResult {
  type: MoulinetteCheckType;
  status: MoulinetteCheckStatus;
  message: string;
  durationMs?: number;
  details?: Record<string, unknown>;
}

export type MoulinetteFinalResult = "pass" | "fail" | "incomplete" | "error";

export interface MoulinetteJob {
  id: string;
  challengeId: string;
  createdAt: string;
  updatedAt: string;
  status: MoulinetteJobStatus;
  mode: "learn" | "prove";
  checks: MoulinetteCheckResult[];
  finalResult: MoulinetteFinalResult;
}

export interface MoulinetteExecutionPolicy {
  maxExecutionMs: number;
  maxCompileMs: number;
  maxMemoryMb: number;
  maxOutputBytes: number;
  networkAllowed: boolean;
  writableFilesystem: boolean;
  maxProcesses: number;
}