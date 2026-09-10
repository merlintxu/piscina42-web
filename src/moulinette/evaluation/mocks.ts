import type { SandboxRunResult } from "../sandbox/types";

const process = (overrides: Partial<SandboxRunResult["compile"]["process"]> = {}) => ({
  exitCode: 0,
  stdout: "",
  stderr: "",
  durationMs: 100,
  timedOut: false,
  ...overrides,
});

export const mockValidSandboxResult: SandboxRunResult = {
  compile: { status: "pass", process: process() },
  tests: [
    {
      testId: "functional",
      status: "pass",
      process: process({ stdout: "fixture-ok", durationMs: 40 }),
    },
  ],
  completedAt: "2026-09-10T10:00:00.000Z",
};

export const mockCompileFailureSandboxResult: SandboxRunResult = {
  compile: {
    status: "fail",
    process: process({ exitCode: 1, stderr: "compile error", durationMs: 80 }),
  },
  tests: [],
  completedAt: "2026-09-10T10:00:01.000Z",
};

export const mockSandboxInternalErrorResult: SandboxRunResult = {
  compile: {
    status: "error",
    process: process({ exitCode: null, stderr: "Docker error", durationMs: 20 }),
  },
  tests: [],
  completedAt: "2026-09-10T10:00:02.000Z",
  error: { code: "internal_docker_error", message: "Docker execution failed." },
};

export const mockFunctionalFailureSandboxResult: SandboxRunResult = {
  compile: { status: "pass", process: process() },
  tests: [
    {
      testId: "functional",
      status: "fail",
      process: process({ exitCode: 1, stderr: "program failed", durationMs: 60 }),
    },
  ],
  completedAt: "2026-09-10T10:00:03.000Z",
};

export const mockNorminettePassSandboxResult: SandboxRunResult = {
  ...mockValidSandboxResult,
  norminette: process({ stdout: "OK!", durationMs: 50 }),
};

export const mockNorminetteFailureSandboxResult: SandboxRunResult = {
  ...mockValidSandboxResult,
  norminette: process({
    exitCode: 1,
    stderr: "Error: INVALID_HEADER",
    durationMs: 50,
  }),
};

export const mockNorminetteErrorSandboxResult: SandboxRunResult = {
  ...mockValidSandboxResult,
  norminette: process({ exitCode: null, stderr: "Norminette container error", durationMs: 50 }),
};
