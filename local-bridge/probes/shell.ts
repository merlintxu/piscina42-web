import { readFile } from "node:fs/promises";
import { runTmuxVersionProbe, runVimVersionProbe } from "./runner";
import type { ShellProbeResult } from "./types";
import { createToolStatus } from "./types";

async function readSystemFile(path: string): Promise<string | null> {
  try {
    return await readFile(path, "utf8");
  } catch {
    return null;
  }
}

async function probeWsl() {
  const runtimeText = `${process.env.WSL_DISTRO_NAME ?? ""}\n${
    (await readSystemFile("/proc/version")) ?? ""
  }\n${(await readSystemFile("/proc/sys/kernel/osrelease")) ?? ""}`.toLowerCase();
  const detected = runtimeText.includes("microsoft") || runtimeText.includes("wsl");

  return {
    id: "wsl",
    label: "WSL",
    category: "required" as const,
    installed: detected,
    status: detected ? ("pass" as const) : ("fail" as const),
    ...(detected ? {} : { message: "WSL runtime not detected." }),
  };
}

async function probeUbuntu() {
  const osRelease = await readSystemFile("/etc/os-release");
  const id = osRelease?.match(/^ID=(.*)$/m)?.[1]?.replaceAll('"', "").toLowerCase();
  const detected = id === "ubuntu";
  const version = osRelease?.match(/^VERSION_ID=(.*)$/m)?.[1]?.replaceAll('"', "");

  return {
    id: "ubuntu",
    label: "Ubuntu",
    category: "required" as const,
    installed: detected,
    ...(detected && version ? { version } : {}),
    status: detected ? ("pass" as const) : ("fail" as const),
    ...(detected ? {} : { message: "Ubuntu identification not detected." }),
  };
}

export async function probeShell(): Promise<ShellProbeResult> {
  const [wsl, ubuntu, vim, tmux] = await Promise.all([
    probeWsl(),
    probeUbuntu(),
    runVimVersionProbe(),
    runTmuxVersionProbe(),
  ]);
  const environment = wsl.installed
    ? ubuntu.installed
      ? "WSL / Ubuntu"
      : "WSL"
    : process.platform === "linux"
      ? "Linux"
      : process.platform;

  return {
    environment,
    tools: [
      wsl,
      ubuntu,
      createToolStatus({ id: "vim", label: "Vim", category: "recommended" }, vim),
      createToolStatus({ id: "tmux", label: "tmux", category: "recommended" }, tmux),
    ],
  };
}