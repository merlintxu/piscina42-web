import { calculateWorkstationReadiness } from "../../src/workstation/readiness";
import type { WorkstationSnapshot, WorkstationToolStatus } from "../../src/workstation/types";
import { probeCompilerTools } from "./compiler";
import { probeGit } from "./git";
import { probeNode } from "./node";
import { probePython } from "./python";
import { probeShell } from "./shell";
import { probeTooling } from "./tooling";

function unknownOptionalTool(id: string, label: string): WorkstationToolStatus {
  return {
    id,
    label,
    category: "optional",
    installed: false,
    status: "unknown",
    message: "Probe not implemented yet.",
  };
}

export async function probeWorkstation(): Promise<WorkstationSnapshot> {
  const [git, compilerTools, tooling, node, python, shell] = await Promise.all([
    probeGit(),
    probeCompilerTools(),
    probeTooling(),
    probeNode(),
    probePython(),
    probeShell(),
  ]);
  const tools = [
    shell.tools,
    [git],
    compilerTools,
    tooling.tools,
    node,
    python,
    [tooling.docker.tool, unknownOptionalTool("ollama", "Ollama")],
  ].flat();
  const snapshotBase = {
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    environment: shell.environment,
    tools,
  };

  return {
    ...snapshotBase,
    ...calculateWorkstationReadiness(snapshotBase),
  };
}