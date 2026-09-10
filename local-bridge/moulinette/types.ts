import type { MoulinetteRunResult } from "../../src/moulinette/orchestrator";

export const MOULINETTE_FIXTURE_IDS = [
  "valid",
  "compile-fail",
  "norminette-fail",
  "memory-leak",
] as const;

export const MOULINETTE_PROFILES = ["compile-only", "standard"] as const;

export type MoulinetteFixtureId = (typeof MOULINETTE_FIXTURE_IDS)[number];
export type MoulinetteProfile = (typeof MOULINETTE_PROFILES)[number];

export interface MoulinetteRunRequestBody {
  fixtureId: MoulinetteFixtureId;
  profile: MoulinetteProfile;
}

export interface MoulinetteRunResponse {
  job: Pick<
    MoulinetteRunResult["job"],
    "id" | "challengeId" | "status" | "finalResult" | "checks"
  >;
  startedAt: string;
  completedAt: string;
}

export type MoulinetteServiceErrorCode =
  | "invalid_request"
  | "fixture_not_found"
  | "moulinette_busy";

export class MoulinetteServiceError extends Error {
  constructor(
    public readonly code: MoulinetteServiceErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "MoulinetteServiceError";
  }
}
