import { runMoulinetteJob } from "../../src/moulinette/orchestrator";
import type { MoulinetteRunResult } from "../../src/moulinette/orchestrator";
import { resolveMoulinetteFixture } from "./fixtures";
import {
  MOULINETTE_FIXTURE_IDS,
  MOULINETTE_PROFILES,
  MoulinetteServiceError,
} from "./types";
import type {
  MoulinetteFixtureId,
  MoulinetteProfile,
  MoulinetteRunRequestBody,
  MoulinetteRunResponse,
} from "./types";

const REQUEST_KEYS = new Set(["fixtureId", "profile"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFixtureId(value: unknown): value is MoulinetteFixtureId {
  return typeof value === "string" && MOULINETTE_FIXTURE_IDS.includes(value as MoulinetteFixtureId);
}

function isProfile(value: unknown): value is MoulinetteProfile {
  return typeof value === "string" && MOULINETTE_PROFILES.includes(value as MoulinetteProfile);
}

function parseRequest(value: unknown): MoulinetteRunRequestBody {
  if (!isRecord(value)) {
    throw new MoulinetteServiceError("invalid_request", "Request body must be a JSON object.");
  }

  const keys = Object.keys(value);
  if (keys.some((key) => !REQUEST_KEYS.has(key)) || keys.length !== 2) {
    throw new MoulinetteServiceError(
      "invalid_request",
      "Request body must contain only fixtureId and profile.",
    );
  }
  if (!isFixtureId(value.fixtureId)) {
    throw new MoulinetteServiceError("fixture_not_found", "Unknown Moulinette fixture.");
  }
  if (!isProfile(value.profile)) {
    throw new MoulinetteServiceError("invalid_request", "Unknown Moulinette profile.");
  }

  return { fixtureId: value.fixtureId, profile: value.profile };
}

function sanitizeResult(result: MoulinetteRunResult): MoulinetteRunResponse {
  return {
    job: {
      id: result.job.id,
      challengeId: result.job.challengeId,
      status: result.job.status,
      finalResult: result.job.finalResult,
      checks: result.job.checks,
    },
    startedAt: result.startedAt,
    completedAt: result.completedAt,
  };
}

export async function runLocalMoulinetteFixture(
  value: unknown,
): Promise<MoulinetteRunResponse> {
  const request = parseRequest(value);
  const input = resolveMoulinetteFixture(request.fixtureId, request.profile);
  const result = await runMoulinetteJob(input);
  return sanitizeResult(result);
}
