import { isMentorAssistanceAllowed } from "../provider";
import type { MentorMode } from "../provider";
import type { MentorPedagogyPolicy } from "./types";

export function createMentorPedagogyPolicy(mode: MentorMode): MentorPedagogyPolicy {
  const assistanceAllowed = isMentorAssistanceAllowed(mode);
  return {
    mode,
    assistanceAllowed,
    askBeforeTelling: assistanceAllowed,
    preferHints: assistanceAllowed,
    avoidFullSolution: assistanceAllowed,
    explainErrors: assistanceAllowed,
    encourageVerification: assistanceAllowed,
    preserveStudentOwnership: assistanceAllowed,
    maxHintLevel: assistanceAllowed ? 3 : 0,
    guidanceKinds: assistanceAllowed
      ? ["question", "hint", "explanation", "feedback", "partial_example"]
      : [],
  };
}
