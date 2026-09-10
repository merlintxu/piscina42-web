import { WorkstationReadiness, WorkstationSnapshot } from "./types";

/**
 * Calculates workstation readiness from tools in the required category only.
 * A required tool contributes only when its status is "pass".
 */
export function calculateWorkstationReadiness(
  snapshot: Pick<WorkstationSnapshot, "tools">,
): WorkstationReadiness {
  const requiredTools = snapshot.tools.filter((tool) => tool.category === "required");
  const requiredPassed = requiredTools.filter((tool) => tool.status === "pass").length;
  const requiredTotal = requiredTools.length;
  const readinessPercent =
    requiredTotal === 0 ? 0 : Math.round((requiredPassed / requiredTotal) * 100);

  return {
    requiredPassed,
    requiredTotal,
    readinessPercent,
  };
}
