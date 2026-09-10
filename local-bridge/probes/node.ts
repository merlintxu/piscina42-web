import { runNodeVersionProbe, runNpmVersionProbe } from "./runner";
import { createToolStatus } from "./types";

export async function probeNode() {
  const [node, npm] = await Promise.all([runNodeVersionProbe(), runNpmVersionProbe()]);

  return [
    createToolStatus({ id: "node", label: "Node.js", category: "required" }, node),
    createToolStatus({ id: "npm", label: "npm", category: "required" }, npm),
  ];
}