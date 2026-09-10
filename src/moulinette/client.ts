const MOULINETTE_ENDPOINT = "http://127.0.0.1:4242/moulinette/submit";
const MAX_SOURCE_BYTES = 32 * 1024;

export type MoulinetteProfile = "compile-only" | "standard";
export type MoulinetteCheckStatus = "pass" | "fail" | "skipped" | "error";

export interface MoulinetteCheck {
  type: "compile" | "strict_flags" | "norminette" | "functional" | "memory";
  status: MoulinetteCheckStatus;
  message: string;
}

export interface MoulinetteResponse {
  job: {
    id: string;
    challengeId: string;
    status: string;
    finalResult: "pass" | "fail" | "incomplete" | "error";
    checks: MoulinetteCheck[];
  };
  startedAt: string;
  completedAt: string;
}

export type MoulinetteClientErrorKind = "offline" | "busy" | "invalid-response";

export class MoulinetteClientError extends Error {
  constructor(
    public readonly kind: MoulinetteClientErrorKind,
    message: string,
  ) {
    super(message);
    this.name = "MoulinetteClientError";
  }
}

export function validateMoulinetteSource(challengeId: string, source: string): string | null {
  if (!challengeId.trim()) return "Challenge ID is required.";
  if (!source.trim()) return "Source code is required.";
  if (new TextEncoder().encode(source).byteLength > MAX_SOURCE_BYTES) {
    return "Source code must be 32 KB or smaller.";
  }
  return null;
}

function isResponse(value: unknown): value is MoulinetteResponse {
  if (typeof value !== "object" || value === null) return false;
  const payload = value as Record<string, unknown>;
  const job = payload.job;
  if (typeof job !== "object" || job === null) return false;
  const jobValue = job as Record<string, unknown>;
  return (
    typeof jobValue.id === "string" &&
    typeof jobValue.challengeId === "string" &&
    typeof jobValue.status === "string" &&
    ["pass", "fail", "incomplete", "error"].includes(String(jobValue.finalResult)) &&
    Array.isArray(jobValue.checks) &&
    typeof payload.startedAt === "string" &&
    typeof payload.completedAt === "string"
  );
}

export async function submitMoulinetteSource(
  challengeId: string,
  profile: MoulinetteProfile,
  source: string,
): Promise<MoulinetteResponse> {
  const validationError = validateMoulinetteSource(challengeId, source);
  if (validationError) {
    throw new MoulinetteClientError("invalid-response", validationError);
  }

  let response: Response;
  try {
    response = await fetch(MOULINETTE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        challengeId: challengeId.trim(),
        profile,
        files: [{ path: "main.c", content: source }],
      }),
    });
  } catch {
    throw new MoulinetteClientError("offline", "Local Training Bridge no disponible");
  }

  if (response.status === 409) {
    throw new MoulinetteClientError("busy", "Moulinette is already running.");
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new MoulinetteClientError("invalid-response", "Bridge response was not valid JSON.");
  }

  if (!response.ok) {
    throw new MoulinetteClientError(
      "invalid-response",
      typeof payload === "object" && payload !== null && "error" in payload
        ? "Moulinette request was rejected."
        : `Bridge responded with HTTP ${response.status}.`,
    );
  }
  if (!isResponse(payload)) {
    throw new MoulinetteClientError("invalid-response", "Bridge response has an invalid structure.");
  }
  return payload;
}
