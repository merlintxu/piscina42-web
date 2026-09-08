import {
  runGhVersionProbe,
  runGdbVersionProbe,
  runJqVersionProbe,
  runNorminetteVersionProbe,
  runRipgrepVersionProbe,
  runValgrindVersionProbe,
} from "./runner";
import { createToolStatus } from "./types";

export async function probeTooling() {
  const [norminette, gdb, valgrind, gh, jq, ripgrep] = await Promise.all([
    runNorminetteVersionProbe(),
    runGdbVersionProbe(),
    runValgrindVersionProbe(),
    runGhVersionProbe(),
    runJqVersionProbe(),
    runRipgrepVersionProbe(),
  ]);

  return [
    createToolStatus({ id: "norminette", label: "Norminette", category: "required" }, norminette),
    createToolStatus({ id: "gdb", label: "GDB", category: "required" }, gdb),
    createToolStatus({ id: "valgrind", label: "Valgrind", category: "required" }, valgrind),
    createToolStatus({ id: "gh", label: "GitHub CLI", category: "recommended" }, gh),
    createToolStatus({ id: "jq", label: "jq", category: "recommended" }, jq),
    createToolStatus({ id: "ripgrep", label: "ripgrep", category: "recommended" }, ripgrep),
  ];
}