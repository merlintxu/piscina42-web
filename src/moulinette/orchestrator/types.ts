import type { MoulinetteJob } from "../types";
import type { MoulinetteCheckProfile } from "../evaluation/types";
import type { SandboxRequest, SandboxRunResult } from "../sandbox/types";

export interface MoulinetteRunInput {
  job: MoulinetteJob;
  request: SandboxRequest;
  profile: MoulinetteCheckProfile;
}

export interface MoulinetteRunResult {
  job: MoulinetteJob;
  sandboxResult: SandboxRunResult;
  startedAt: string;
  completedAt: string;
}
