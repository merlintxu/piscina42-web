import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { ProbeExecution } from "./types";

const execFileAsync = promisify(execFile);
const PROBE_TIMEOUT_MS = 3_000;
const PROBE_MAX_OUTPUT_BYTES = 16 * 1024;

async function runFixedProbe(
  executable: string,
  args: readonly string[],
): Promise<ProbeExecution> {
  try {
    const result = await execFileAsync(executable, [...args], {
      encoding: "utf8",
      maxBuffer: PROBE_MAX_OUTPUT_BYTES,
      shell: false,
      timeout: PROBE_TIMEOUT_MS,
      windowsHide: true,
    });

    return {
      outcome: "pass",
      stdout: result.stdout,
      stderr: result.stderr,
    };
  } catch (error) {
    const probeError = error as NodeJS.ErrnoException & {
      killed?: boolean;
      stdout?: string;
      stderr?: string;
    };
    const timedOut = probeError.killed || probeError.code === "ETIMEDOUT";

    return {
      outcome: timedOut ? "timeout" : probeError.code === "ENOENT" ? "missing" : "error",
      stdout: probeError.stdout ?? "",
      stderr: probeError.stderr ?? "",
      message: timedOut
        ? "Probe timed out."
        : probeError.stderr?.trim() || probeError.message || "Probe failed.",
    };
  }
}

export function runGitVersionProbe(): Promise<ProbeExecution> {
  return runFixedProbe("git", ["--version"]);
}

export function runGccVersionProbe(): Promise<ProbeExecution> {
  return runFixedProbe("gcc", ["--version"]);
}

export function runClangVersionProbe(): Promise<ProbeExecution> {
  return runFixedProbe("clang", ["--version"]);
}

export function runMakeVersionProbe(): Promise<ProbeExecution> {
  return runFixedProbe("make", ["--version"]);
}

export function runNorminetteVersionProbe(): Promise<ProbeExecution> {
  return runFixedProbe("norminette", ["--version"]);
}

export function runGdbVersionProbe(): Promise<ProbeExecution> {
  return runFixedProbe("gdb", ["--version"]);
}

export function runValgrindVersionProbe(): Promise<ProbeExecution> {
  return runFixedProbe("valgrind", ["--version"]);
}

export function runNodeVersionProbe(): Promise<ProbeExecution> {
  return runFixedProbe("node", ["--version"]);
}

export function runNpmVersionProbe(): Promise<ProbeExecution> {
  return runFixedProbe("npm", ["--version"]);
}

export function runVimVersionProbe(): Promise<ProbeExecution> {
  return runFixedProbe("vim", ["--version"]);
}

export function runTmuxVersionProbe(): Promise<ProbeExecution> {
  return runFixedProbe("tmux", ["-V"]);
}

export function runPythonVersionProbe(): Promise<ProbeExecution> {
  return runFixedProbe("python3", ["--version"]);
}

export function runPipxVersionProbe(): Promise<ProbeExecution> {
  return runFixedProbe("pipx", ["--version"]);
}

export function runGhVersionProbe(): Promise<ProbeExecution> {
  return runFixedProbe("gh", ["--version"]);
}

export function runJqVersionProbe(): Promise<ProbeExecution> {
  return runFixedProbe("jq", ["--version"]);
}

export function runRipgrepVersionProbe(): Promise<ProbeExecution> {
  return runFixedProbe("rg", ["--version"]);
}