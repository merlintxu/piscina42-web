import type { DockerCapabilityProbe } from "../../src/moulinette/sandbox/backend/docker";
import type { WorkstationToolStatus } from "../../src/workstation/types";
import { runDockerInfoProbe, runDockerVersionProbe } from "./runner";

interface DockerInfoPayload {
  ServerVersion?: string;
  OperatingSystem?: string;
  OSType?: string;
  Architecture?: string;
}

export interface DockerProbeResult {
  capability: DockerCapabilityProbe;
  tool: WorkstationToolStatus;
}

function parseDockerInfo(output: string): DockerInfoPayload | null {
  const [ServerVersion, OperatingSystem, OSType, Architecture] = output.trim().split("|");
  if (!ServerVersion || !OperatingSystem || !OSType || !Architecture) {
    return null;
  }

  return { ServerVersion, OperatingSystem, OSType, Architecture };
}

export async function probeDocker(): Promise<DockerProbeResult> {
  const [cli, info] = await Promise.all([runDockerVersionProbe(), runDockerInfoProbe()]);
  const cliAvailable = cli.outcome === "pass";
  const infoPayload = info.outcome === "pass" ? parseDockerInfo(info.stdout) : null;
  const daemonAvailable = infoPayload !== null;
  const message = !cliAvailable
    ? "Docker CLI not found."
    : daemonAvailable
      ? undefined
      : info.message ?? "Docker daemon is not accessible.";
  const capability: DockerCapabilityProbe = {
    cliAvailable,
    daemonAvailable,
    ...(cli.stdout.trim() ? { version: cli.stdout.trim().split(/\r?\n/, 1)[0] } : {}),
    ...(infoPayload?.OperatingSystem ? { operatingSystem: infoPayload.OperatingSystem } : {}),
    ...(infoPayload?.Architecture ? { architecture: infoPayload.Architecture } : {}),
    ...(message ? { message } : {}),
  };

  return {
    capability,
    tool: {
      id: "docker",
      label: "Docker",
      category: "optional",
      installed: cliAvailable,
      ...(capability.version ? { version: capability.version } : {}),
      status: !cliAvailable ? "unknown" : daemonAvailable ? "pass" : "warn",
      ...(message ? { message } : {}),
    },
  };
}