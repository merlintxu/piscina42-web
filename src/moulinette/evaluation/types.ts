import type {
  MoulinetteCheckType,
  MoulinetteJob,
} from "../types";

export type MoulinetteCheckProfileName = "compile-only" | "standard";

export interface MoulinetteCheckProfile {
  name: MoulinetteCheckProfileName;
  requiredChecks: readonly MoulinetteCheckType[];
}

export interface SandboxEvaluation {
  checks: MoulinetteJob["checks"];
  finalResult: MoulinetteJob["finalResult"];
  job: MoulinetteJob;
}
