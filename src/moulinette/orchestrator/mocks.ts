import { getMoulinetteCheckProfile } from "../evaluation/mapper";
import {
  mockControlledCompileFailSandboxRequest,
  mockNorminetteCompliantSandboxRequest,
  mockNorminetteViolationSandboxRequest,
  mockTraversalSandboxRequest,
  mockValidSandboxRequest,
} from "../sandbox/mocks";
import { mockSuccessfulJob } from "../mocks";
import type { MoulinetteRunInput } from "./types";

const leakSource = `#include <stdlib.h>

int\tmain(void)
{
\tvoid *memory = malloc(4);
\t(void)memory;
\treturn (0);
}
`;

export const mockStandardMoulinetteRunInput: MoulinetteRunInput = {
  job: mockSuccessfulJob,
  request: mockNorminetteCompliantSandboxRequest,
  profile: getMoulinetteCheckProfile("standard"),
};

export const mockCompileOnlyMoulinetteRunInput: MoulinetteRunInput = {
  job: mockSuccessfulJob,
  request: mockValidSandboxRequest,
  profile: getMoulinetteCheckProfile("compile-only"),
};

export const mockNorminetteFailureMoulinetteRunInput: MoulinetteRunInput = {
  job: mockSuccessfulJob,
  request: mockNorminetteViolationSandboxRequest,
  profile: getMoulinetteCheckProfile("standard"),
};

export const mockMemoryLeakMoulinetteRunInput: MoulinetteRunInput = {
  job: mockSuccessfulJob,
  request: {
    ...mockNorminetteCompliantSandboxRequest,
    job: {
      ...mockNorminetteCompliantSandboxRequest.job,
      files: [{ path: "src/main.c", content: leakSource }],
    },
  },
  profile: getMoulinetteCheckProfile("standard"),
};

export const mockCompileFailureMoulinetteRunInput: MoulinetteRunInput = {
  job: mockSuccessfulJob,
  request: mockControlledCompileFailSandboxRequest,
  profile: getMoulinetteCheckProfile("standard"),
};

export const mockInvalidMoulinetteRunInput: MoulinetteRunInput = {
  job: mockSuccessfulJob,
  request: mockTraversalSandboxRequest,
  profile: getMoulinetteCheckProfile("standard"),
};
