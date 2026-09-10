import { applySandboxResultToJob } from "../evaluation/mapper";
import type { MoulinetteRunInput, MoulinetteRunResult } from "./types";
import {
  runNorminetteCheck,
  runSandboxRequest,
  runValgrindCheck,
} from "../sandbox";
import { validateSandboxRequest } from "../sandbox/validation";
import type { SandboxProcessResult, SandboxRunResult } from "../sandbox/types";

function internalProcessResult(message: string): SandboxProcessResult {
  return {
    exitCode: null,
    stdout: "",
    stderr: message,
    durationMs: 0,
    timedOut: false,
  };
}

function unexpectedResult(message: string): SandboxRunResult {
  return {
    compile: {
      status: "error",
      process: internalProcessResult(message),
    },
    tests: [],
    completedAt: new Date().toISOString(),
    error: {
      code: "internal_docker_error",
      message,
    },
  };
}

export async function runMoulinetteJob(
  input: MoulinetteRunInput,
): Promise<MoulinetteRunResult> {
  const startedAt = new Date().toISOString();
  let sandboxResult: SandboxRunResult;

  if (!validateSandboxRequest(input.request)) {
    sandboxResult = await runSandboxRequest(input.request);
  } else {
    try {
      sandboxResult = await runSandboxRequest(input.request);

      if (input.profile.name === "standard") {
        // Norminette is independent of compilation; it still runs after a compile failure.
        sandboxResult = {
          ...sandboxResult,
          norminette: await runNorminetteCheck(input.request),
        };

        if (sandboxResult.compile.status === "pass") {
          sandboxResult = {
            ...sandboxResult,
            memory: await runValgrindCheck(input.request),
          };
        }
      }
    } catch (error) {
      sandboxResult = unexpectedResult(
        error instanceof Error ? error.message : "Unexpected Moulinette error.",
      );
    }
  }

  const completedAt = new Date().toISOString();
  const job = applySandboxResultToJob(
    input.job,
    sandboxResult,
    input.profile.name,
    completedAt,
  );

  return {
    job,
    sandboxResult,
    startedAt,
    completedAt,
  };
}
