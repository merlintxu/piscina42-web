import { mockSuccessfulJob } from "../mocks";
import { createSandboxRequestFromJob } from "./validation";
import type {
  SandboxCompileResult,
  SandboxProcessResult,
  SandboxRequest,
} from "./types";

const sourceFiles = [
  { path: "src/main.c", content: "int main(void) { return 0; }\n" },
];

export const mockValidSandboxRequest = createSandboxRequestFromJob(
  mockSuccessfulJob,
  sourceFiles,
);

export const mockTraversalSandboxRequest: SandboxRequest = {
  ...mockValidSandboxRequest,
  job: {
    ...mockValidSandboxRequest.job,
    files: [{ path: "../secret", content: "not allowed" }],
  },
};

export const mockDuplicatePathSandboxRequest: SandboxRequest = {
  ...mockValidSandboxRequest,
  job: {
    ...mockValidSandboxRequest.job,
    files: [
      { path: "src/main.c", content: "int main(void) { return 0; }\n" },
      { path: "src/main.c", content: "duplicate" },
    ],
  },
};

export const mockUnsafeNetworkSandboxRequest: SandboxRequest = {
  ...mockValidSandboxRequest,
  limits: {
    ...mockValidSandboxRequest.limits,
    networkAllowed: true,
  },
};

const successfulProcess: SandboxProcessResult = {
  exitCode: 0,
  stdout: "",
  stderr: "",
  durationMs: 180,
  timedOut: false,
};

export const mockSandboxCompileSuccessResult: SandboxCompileResult = {
  status: "pass",
  process: successfulProcess,
};

export const mockSandboxTimeoutResult: SandboxCompileResult = {
  status: "error",
  process: {
    exitCode: null,
    signal: "SIGTERM",
    stdout: "",
    stderr: "Compilation timed out.",
    durationMs: 1_500,
    timedOut: true,
  },
};