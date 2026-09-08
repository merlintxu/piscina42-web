import { runGitVersionProbe } from "./runner";
import { createToolStatus } from "./types";

export async function probeGit() {
  return createToolStatus(
    { id: "git", label: "Git", category: "required" },
    await runGitVersionProbe(),
  );
}