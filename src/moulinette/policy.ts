import type {
  MoulinetteCheckResult,
  MoulinetteCheckType,
  MoulinetteExecutionPolicy,
  MoulinetteFinalResult,
} from "./types";

/** Conservative local defaults: short runs, bounded output, memory, and process count. */
export const DEFAULT_MOULINETTE_POLICY: MoulinetteExecutionPolicy = {
  maxExecutionMs: 3_000,
  maxCompileMs: 1_500,
  maxMemoryMb: 256,
  maxOutputBytes: 64 * 1024,
  networkAllowed: false,
  writableFilesystem: false,
  maxProcesses: 8,
};

const REQUIRED_CHECK_TYPES: MoulinetteCheckType[] = [
  "compile",
  "strict_flags",
  "norminette",
  "functional",
  "memory",
  "timeout",
];

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

export function validateMoulinettePolicy(
  value: unknown,
): value is MoulinetteExecutionPolicy {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const policy = value as Record<string, unknown>;
  return (
    isPositiveInteger(policy.maxExecutionMs) &&
    isPositiveInteger(policy.maxCompileMs) &&
    policy.maxCompileMs <= policy.maxExecutionMs &&
    isPositiveInteger(policy.maxMemoryMb) &&
    isPositiveInteger(policy.maxOutputBytes) &&
    policy.networkAllowed === false &&
    policy.writableFilesystem === false &&
    isPositiveInteger(policy.maxProcesses) &&
    policy.maxProcesses <= 64
  );
}

/**
 * Compile errors are terminal errors; failed checks are ordinary failures.
 * Missing or skipped mandatory checks keep a job incomplete.
 */
export function calculateFinalJobResult(
  checks: readonly MoulinetteCheckResult[],
  requiredCheckTypes: readonly MoulinetteCheckType[] = REQUIRED_CHECK_TYPES,
): MoulinetteFinalResult {
  if (checks.some((check) => check.status === "error")) {
    return "error";
  }

  if (checks.some((check) => check.status === "fail")) {
    return "fail";
  }

  const hasEveryRequiredCheck = requiredCheckTypes.every((type) =>
    checks.some((check) => check.type === type && check.status === "pass"),
  );
  if (
    !hasEveryRequiredCheck ||
    checks.some(
      (check) => requiredCheckTypes.includes(check.type) && check.status === "skipped",
    )
  ) {
    return "incomplete";
  }

  return "pass";
}