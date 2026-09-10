import type { MentorMode } from "../provider";

export const MENTOR_PROMPT_VERSION = "socratic-v1";

export type HintLevel = 0 | 1 | 2 | 3;

export type MentorGuidanceKind =
  | "question"
  | "hint"
  | "explanation"
  | "feedback"
  | "partial_example";

export interface MentorPedagogyPolicy {
  mode: MentorMode;
  assistanceAllowed: boolean;
  askBeforeTelling: boolean;
  preferHints: boolean;
  avoidFullSolution: boolean;
  explainErrors: boolean;
  encourageVerification: boolean;
  preserveStudentOwnership: boolean;
  maxHintLevel: HintLevel;
  guidanceKinds: MentorGuidanceKind[];
}
