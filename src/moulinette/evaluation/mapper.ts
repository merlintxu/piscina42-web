import { calculateFinalJobResult } from "../policy";
import type {
  MoulinetteCheckProfile,
  MoulinetteCheckProfileName,
  SandboxEvaluation,
} from "./types";
import type {
  MoulinetteCheckResult,
  MoulinetteJob,
} from "../types";
import type { SandboxRunResult } from "../sandbox/types";

const PROFILE_DEFINITIONS: Record<MoulinetteCheckProfileName, MoulinetteCheckProfile> = {
  "compile-only": {
    name: "compile-only",
    requiredChecks: ["compile", "strict_flags", "functional"],
  },
  standard: {
    name: "standard",
    requiredChecks: ["compile", "strict_flags", "norminette", "functional", "memory"],
  },
};

export function getMoulinetteCheckProfile(
  name: MoulinetteCheckProfileName,
): MoulinetteCheckProfile {
  return PROFILE_DEFINITIONS[name];
}

function compileCheck(result: SandboxRunResult): MoulinetteCheckResult {
  const { process } = result.compile;
  // A timeout is an execution/infrastructure error, so it must not look like a source failure.
  const message = process.timedOut
    ? "Compilation timed out."
    : result.compile.status === "pass"
      ? "Compilation completed."
      : result.compile.status === "fail"
        ? "Compilation failed."
        : "Compilation returned an internal error.";

  return {
    type: "compile",
    status: process.timedOut ? "error" : result.compile.status,
    message,
    durationMs: process.durationMs,
    details: { exitCode: process.exitCode, timedOut: process.timedOut },
  };
}

function functionalCheck(result: SandboxRunResult): MoulinetteCheckResult {
  if (result.tests.length === 0) {
    return {
      type: "functional",
      status: "skipped",
      message: "Skipped because compilation did not pass.",
    };
  }

  const hasError = result.tests.some((test) => test.status === "error");
  const hasFailure = result.tests.some((test) => test.status === "fail");
  const durationMs = result.tests.reduce(
    (total, test) => total + (test.process?.durationMs ?? 0),
    0,
  );

  return {
    type: "functional",
    status: hasError ? "error" : hasFailure ? "fail" : "pass",
    message: hasError
      ? "At least one functional test returned an error."
      : hasFailure
        ? "At least one functional test failed."
        : "Functional tests passed.",
    ...(durationMs ? { durationMs } : {}),
    details: {
      tests: result.tests.map((test) => ({ testId: test.testId, status: test.status })),
    },
  };
}

export function mapSandboxResultToChecks(result: SandboxRunResult): MoulinetteCheckResult[] {
  return [
    compileCheck(result),
    {
      type: "strict_flags",
      status: result.compile.status === "pass" ? "pass" : "skipped",
      message:
        result.compile.status === "pass"
          ? "Controlled strict compiler flags passed."
          : "Skipped after compilation did not pass.",
    },
    functionalCheck(result),
    {
      type: "norminette",
      status: result.norminette
        ? result.norminette.timedOut || result.norminette.exitCode === null
          ? "error"
          : result.norminette.exitCode === 0
            ? "pass"
            : "fail"
        : "skipped",
      message: result.norminette
        ? result.norminette.timedOut
          ? "Norminette check timed out."
          : result.norminette.exitCode === null
            ? "Norminette check returned an internal error."
            : result.norminette.exitCode === 0
              ? "Norminette checks passed."
              : "Norminette violations found."
        : "Norminette check not executed yet.",
      ...(result.norminette?.durationMs !== undefined
        ? { durationMs: result.norminette.durationMs }
        : {}),
    },
    {
      type: "memory",
      status: "skipped",
      message: "Memory check not executed yet.",
    },
  ];
}

export function applySandboxResultToJob(
  job: MoulinetteJob,
  result: SandboxRunResult,
  profileName: MoulinetteCheckProfileName,
  timestamp = new Date().toISOString(),
): MoulinetteJob {
  const checks = mapSandboxResultToChecks(result);
  const profile = getMoulinetteCheckProfile(profileName);
  const finalResult = result.error?.code === "internal_docker_error"
    ? "error"
    : calculateFinalJobResult(checks, profile.requiredChecks);

  return {
    ...job,
    updatedAt: timestamp,
    checks,
    finalResult,
    status: finalResult === "pass" || finalResult === "incomplete" ? "completed" : "failed",
  };
}

export type { SandboxEvaluation } from "./types";
