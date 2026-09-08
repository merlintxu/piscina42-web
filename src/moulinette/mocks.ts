import { calculateFinalJobResult } from "./policy";
import type { MoulinetteCheckResult, MoulinetteJob } from "./types";

const timestamps = {
  createdAt: "2026-09-08T00:00:00.000Z",
  updatedAt: "2026-09-08T00:00:04.000Z",
};

function createMockJob(
  id: string,
  checks: MoulinetteCheckResult[],
  status: MoulinetteJob["status"],
): MoulinetteJob {
  return {
    id,
    challengeId: "reto-c01-swap-int",
    ...timestamps,
    status,
    mode: "prove",
    checks,
    finalResult: calculateFinalJobResult(checks),
  };
}

const successfulChecks: MoulinetteCheckResult[] = [
  { type: "compile", status: "pass", message: "Compilation completed.", durationMs: 120 },
  { type: "strict_flags", status: "pass", message: "Strict flags accepted.", durationMs: 40 },
  { type: "norminette", status: "pass", message: "Style checks passed.", durationMs: 80 },
  { type: "functional", status: "pass", message: "Functional checks passed.", durationMs: 240 },
  { type: "memory", status: "pass", message: "Memory checks passed.", durationMs: 180 },
  { type: "timeout", status: "pass", message: "Execution stayed within limits.", durationMs: 5 },
];

export const mockSuccessfulJob = createMockJob(
  "job-successful-001",
  successfulChecks,
  "completed",
);

export const mockCompileFailureJob = createMockJob(
  "job-compile-failure-001",
  [
    { type: "compile", status: "fail", message: "Compilation failed.", durationMs: 95 },
    { type: "strict_flags", status: "skipped", message: "Skipped after compile failure." },
    { type: "norminette", status: "skipped", message: "Skipped after compile failure." },
    { type: "functional", status: "skipped", message: "Skipped after compile failure." },
    { type: "memory", status: "skipped", message: "Skipped after compile failure." },
    { type: "timeout", status: "skipped", message: "Skipped after compile failure." },
  ],
  "failed",
);

export const mockTimeoutJob = createMockJob(
  "job-timeout-001",
  [
    { type: "compile", status: "pass", message: "Compilation completed.", durationMs: 120 },
    { type: "strict_flags", status: "pass", message: "Strict flags accepted.", durationMs: 40 },
    { type: "norminette", status: "pass", message: "Style checks passed.", durationMs: 80 },
    { type: "functional", status: "error", message: "Execution timed out.", durationMs: 3_000 },
    { type: "memory", status: "skipped", message: "Skipped after timeout." },
    { type: "timeout", status: "fail", message: "Execution exceeded the time limit." },
  ],
  "failed",
);

export const mockNorminetteFailureJob = createMockJob(
  "job-norminette-failure-001",
  [
    { type: "compile", status: "pass", message: "Compilation completed.", durationMs: 120 },
    { type: "strict_flags", status: "pass", message: "Strict flags accepted.", durationMs: 40 },
    { type: "norminette", status: "fail", message: "Style violations found.", durationMs: 80 },
    { type: "functional", status: "skipped", message: "Skipped after style failure." },
    { type: "memory", status: "skipped", message: "Skipped after style failure." },
    { type: "timeout", status: "skipped", message: "Skipped after style failure." },
  ],
  "failed",
);