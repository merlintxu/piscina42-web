import { randomUUID } from "node:crypto";
import { runMoulinetteJob } from "../../src/moulinette/orchestrator";
import type { MoulinetteRunResult } from "../../src/moulinette/orchestrator";
import { getMoulinetteCheckProfile } from "../../src/moulinette/evaluation";
import { createSandboxRequestFromJob, validateSandboxSourcePath } from "../../src/moulinette/sandbox";
import type { MoulinetteJob } from "../../src/moulinette/types";
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
  MoulinetteSubmitRequestBody,
  MoulinetteSubmitResponse,
} from "./types";

const REQUEST_KEYS = new Set(["fixtureId", "profile"]);
const SUBMIT_KEYS = new Set(["challengeId", "profile", "files"]);
const MAX_SUBMIT_FILES = 10;
const MAX_SUBMIT_FILE_BYTES = 32 * 1024;
const MAX_SUBMIT_TOTAL_BYTES = 96 * 1024;
const MAX_SUBMIT_PATH_LENGTH = 120;
const MAX_CHALLENGE_ID_LENGTH = 80;

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

function parseSubmitRequest(value: unknown): MoulinetteSubmitRequestBody {
  if (!isRecord(value)) {
    throw new MoulinetteServiceError("invalid_request", "Request body must be a JSON object.");
  }
  const keys = Object.keys(value);
  if (keys.length !== SUBMIT_KEYS.size || keys.some((key) => !SUBMIT_KEYS.has(key))) {
    throw new MoulinetteServiceError(
      "invalid_request",
      "Request body must contain only challengeId, profile and files.",
    );
  }
  if (
    typeof value.challengeId !== "string" ||
    value.challengeId.length === 0 ||
    value.challengeId.length > MAX_CHALLENGE_ID_LENGTH ||
    !/^[A-Za-z0-9_-]+$/.test(value.challengeId)
  ) {
    throw new MoulinetteServiceError("invalid_request", "Invalid challengeId.");
  }
  if (!isProfile(value.profile)) {
    throw new MoulinetteServiceError("invalid_request", "Unknown Moulinette profile.");
  }
  if (!Array.isArray(value.files) || value.files.length === 0 || value.files.length > MAX_SUBMIT_FILES) {
    throw new MoulinetteServiceError("invalid_request", "Invalid source file count.");
  }

  let totalBytes = 0;
  let cFileCount = 0;
  const files = value.files.map((file) => {
    if (!isRecord(file) || Object.keys(file).length !== 2 || !("path" in file) || !("content" in file)) {
      throw new MoulinetteServiceError("invalid_request", "Each file must contain only path and content.");
    }
    if (
      typeof file.path !== "string" ||
      file.path.length === 0 ||
      file.path.length > MAX_SUBMIT_PATH_LENGTH ||
      !validateSandboxSourcePath(file.path) ||
      !/\.(c|h)$/.test(file.path)
    ) {
      throw new MoulinetteServiceError("invalid_request", "Invalid source path.");
    }
    if (typeof file.content !== "string") {
      throw new MoulinetteServiceError("invalid_request", "Source content must be a string.");
    }
    const fileBytes = new TextEncoder().encode(file.content).byteLength;
    if (fileBytes > MAX_SUBMIT_FILE_BYTES) {
      throw new MoulinetteServiceError("invalid_request", "Source file exceeds the size limit.");
    }
    totalBytes += fileBytes;
    if (totalBytes > MAX_SUBMIT_TOTAL_BYTES) {
      throw new MoulinetteServiceError("invalid_request", "Total source exceeds the size limit.");
    }
    if (file.path.endsWith(".c")) cFileCount += 1;
    return { path: file.path, content: file.content };
  });

  if (cFileCount !== 1) {
    throw new MoulinetteServiceError("invalid_request", "Exactly one C source file is required.");
  }
  return { challengeId: value.challengeId, profile: value.profile, files };
}

export async function runLocalMoulinetteSubmission(
  value: unknown,
): Promise<MoulinetteSubmitResponse> {
  const request = parseSubmitRequest(value);
  const now = new Date().toISOString();
  const job: MoulinetteJob = {
    id: `job-${randomUUID()}`,
    challengeId: request.challengeId,
    createdAt: now,
    updatedAt: now,
    status: "pending",
    mode: "prove",
    checks: [],
    finalResult: "incomplete",
  };
  const sandboxRequest = createSandboxRequestFromJob(
    job,
    request.files,
    { compiler: "gcc", strictFlags: true },
  );
  const result = await runMoulinetteJob({
    job,
    request: sandboxRequest,
    profile: getMoulinetteCheckProfile(request.profile),
  });
  return sanitizeResult(result);
}
