import { runClangVersionProbe, runGccVersionProbe, runMakeVersionProbe } from "./runner";
import { createToolStatus } from "./types";

export async function probeCompilerTools() {
  const [gcc, clang, make] = await Promise.all([
    runGccVersionProbe(),
    runClangVersionProbe(),
    runMakeVersionProbe(),
  ]);

  return [
    createToolStatus({ id: "gcc", label: "GCC", category: "required" }, gcc),
    createToolStatus({ id: "clang", label: "Clang", category: "required" }, clang),
    createToolStatus({ id: "make", label: "Make", category: "required" }, make),
  ];
}