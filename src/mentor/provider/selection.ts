import type { LocalAIModelCapability, LocalMentorCapabilities } from "../types";
import type {
  MentorModelSelection,
  MentorRequest,
} from "./types";

type SelectableCapability = Extract<LocalAIModelCapability, "chat" | "coding" | "reasoning">;

function findSelection(
  capabilities: LocalMentorCapabilities,
  requestedCapability: SelectableCapability,
): MentorModelSelection | undefined {
  for (const provider of capabilities.providers) {
    if (provider.status !== "available") continue;
    const model = provider.models.find(
      (candidate) =>
        candidate.status === "available" &&
        candidate.capabilities.includes(requestedCapability),
    );
    if (model) {
      return {
        provider: provider.provider,
        modelId: model.id,
        capability: requestedCapability,
        reason: `Selected available ${requestedCapability} model from ${provider.provider}.`,
      };
    }
  }
  return undefined;
}

export function selectMentorModel(
  capabilities: LocalMentorCapabilities,
  request: MentorRequest,
): MentorModelSelection | undefined {
  const preferredCapability = request.preferredCapability;
  if (preferredCapability) {
    const preferred = findSelection(capabilities, preferredCapability);
    if (preferred) return preferred;

    if (preferredCapability === "coding" && request.allowFallback === true) {
      const fallback = findSelection(capabilities, "chat");
      if (fallback) {
        return {
          ...fallback,
          reason: "Coding model unavailable; explicit fallback to chat was allowed.",
        };
      }
    }
    return undefined;
  }

  return findSelection(capabilities, "chat");
}

export function isMentorAssistanceAllowed(mode: MentorRequest["mode"]): boolean {
  return mode === "learn";
}
