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

const norminetteCompliantSource = `/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   main.c                                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: a <a@42.fr>                         +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/09/10 00:00:00 by a              #+#    #+#             */
/*   Updated: 2026/09/10 00:00:00 by a             ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

int\tmain(void)
{
	return (0);
}
`;

export const mockNorminetteCompliantSandboxRequest: SandboxRequest = {
  ...mockValidSandboxRequest,
  job: {
    ...mockValidSandboxRequest.job,
    files: [{ path: "src/main.c", content: norminetteCompliantSource }],
  },
};

export const mockNorminetteViolationSandboxRequest: SandboxRequest = {
  ...mockNorminetteCompliantSandboxRequest,
  job: {
    ...mockNorminetteCompliantSandboxRequest.job,
    files: [{ path: "src/main.c", content: "int main(void){return 0;}\n" }],
  },
};

export const mockControlledCompileFailSandboxRequest: SandboxRequest = {
  ...mockValidSandboxRequest,
  job: {
    ...mockValidSandboxRequest.job,
    files: [{ path: "src/main.c", content: "int main(void) { return ; }\n" }],
  },
};

export const mockControlledTraversalSandboxRequest: SandboxRequest = {
  ...mockValidSandboxRequest,
  job: {
    ...mockValidSandboxRequest.job,
    files: [{ path: "../evil.c", content: "int main(void) { return 0; }\n" }],
  },
};

export const mockControlledNetworkSandboxRequest: SandboxRequest = {
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