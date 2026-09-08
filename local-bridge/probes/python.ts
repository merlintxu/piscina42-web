import { runPipxVersionProbe, runPythonVersionProbe } from "./runner";
import { createToolStatus } from "./types";

export async function probePython() {
  const [python, pipx] = await Promise.all([runPythonVersionProbe(), runPipxVersionProbe()]);

  return [
    createToolStatus({ id: "python3", label: "Python 3", category: "recommended" }, python),
    createToolStatus({ id: "pipx", label: "pipx", category: "recommended" }, pipx),
  ];
}