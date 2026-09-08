import {
  runGhVersionProbe,
  runGdbVersionProbe,
  runJqVersionProbe,
  runNorminetteVersionProbe,
  runRipgrepVersionProbe,
  runValgrindVersionProbe,
} from "./runner";
import { probeDocker, type DockerProbeResult } from "./docker";
import { createToolStatus } from "./types";

export interface ToolingProbeResult {
  tools: ReturnType<typeof createToolStatus>[];
  docker: DockerProbeResult;
}

export async function probeTooling(): Promise<ToolingProbeResult> {
  const [norminette, gdb, valgrind, gh, jq, ripgrep, docker] = await Promise.all([
    runNorminetteVersionProbe(),
    runGdbVersionProbe(),
    runValgrindVersionProbe(),
    runGhVersionProbe(),
    runJqVersionProbe(),
    runRipgrepVersionProbe(),
    probeDocker(),
  ]);

  return {
    docker,
    tools: [
      createToolStatus({ id: "norminette", label: "Norminette", category: "required" }, norminette),
      createToolStatus({ id: "gdb", label: "GDB", category: "required" }, gdb),
      createToolStatus({ id: "valgrind", label: "Valgrind", category: "required" }, valgrind),
      createToolStatus({ id: "gh", label: "GitHub CLI", category: "recommended" }, gh),
      createToolStatus({ id: "jq", label: "jq", category: "recommended" }, jq),
      createToolStatus({ id: "ripgrep", label: "ripgrep", category: "recommended" }, ripgrep),
    ],
  };
}