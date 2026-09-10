import type {
  WorkstationToolCategory,
  WorkstationToolState,
  WorkstationToolStatus,
} from "../../src/workstation/types";

export interface ProbeExecution {
  outcome: "pass" | "missing" | "timeout" | "error";
  stdout: string;
  stderr: string;
  message?: string;
}

export interface ToolProbeDefinition {
  id: string;
  label: string;
  category: WorkstationToolCategory;
}

export interface ShellProbeResult {
  tools: WorkstationToolStatus[];
  environment: string;
}

export function createToolStatus(
  definition: ToolProbeDefinition,
  execution: ProbeExecution,
): WorkstationToolStatus {
  const output = execution.stdout.trim().split(/\r?\n/, 1)[0]?.trim();
  let status: WorkstationToolState;
  let message: string | undefined;

  if (execution.outcome === "pass") {
    status = "pass";
  } else if (execution.outcome === "missing") {
    status = definition.category === "required" ? "fail" : "unknown";
    message = "Command not found.";
  } else {
    status = definition.category === "required" ? "warn" : "warn";
    message = execution.message ?? "Probe did not complete successfully.";
  }

  return {
    ...definition,
    installed: execution.outcome === "pass",
    ...(output ? { version: output } : {}),
    status,
    ...(message ? { message } : {}),
  };
}