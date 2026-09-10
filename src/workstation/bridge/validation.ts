import { calculateWorkstationReadiness } from "../readiness";
import type { WorkstationSnapshot, WorkstationToolStatus } from "../types";

const categories = new Set(["required", "recommended", "optional"]);
const states = new Set(["pass", "warn", "fail", "unknown"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isWorkstationToolStatus(value: unknown): value is WorkstationToolStatus {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.label === "string" &&
    typeof value.category === "string" &&
    categories.has(value.category) &&
    typeof value.installed === "boolean" &&
    typeof value.status === "string" &&
    states.has(value.status) &&
    (value.version === undefined || typeof value.version === "string") &&
    (value.path === undefined || typeof value.path === "string") &&
    (value.message === undefined || typeof value.message === "string")
  );
}

export function hasWorkstationTools(
  value: unknown,
): value is Pick<WorkstationSnapshot, "tools"> {
  return (
    isRecord(value) &&
    Array.isArray(value.tools) &&
    value.tools.every(isWorkstationToolStatus)
  );
}

export function normalizeWorkstationSnapshot(
  value: unknown,
): WorkstationSnapshot | null {
  if (!hasWorkstationTools(value)) {
    return null;
  }

  const source = value as Partial<WorkstationSnapshot>;
  const snapshotBase = {
    generatedAt: typeof source.generatedAt === "string" ? source.generatedAt : "",
    platform: typeof source.platform === "string" ? source.platform : "",
    environment: typeof source.environment === "string" ? source.environment : "",
    tools: source.tools.map((tool) => ({ ...tool })),
  };

  return {
    ...snapshotBase,
    ...calculateWorkstationReadiness(snapshotBase),
  };
}