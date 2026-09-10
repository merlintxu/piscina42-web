import type {
  KnowledgeSourceInfo,
  LocalAIProviderInfo,
  LocalMentorCapabilities,
} from "./types";

export function calculateMentorAvailability(
  providers: readonly LocalAIProviderInfo[],
): boolean {
  return providers.some(
    (provider) =>
      provider.status === "available" &&
      provider.models.some(
        (model) =>
          model.status === "available" &&
            model.capabilities.some(
              (capability) => capability === "chat" || capability === "reasoning",
            ),
      ),
  );
}

export function createLocalMentorCapabilities(
  generatedAt: string,
  providers: readonly LocalAIProviderInfo[],
  knowledgeSources: readonly KnowledgeSourceInfo[],
): LocalMentorCapabilities {
  return {
    generatedAt,
    providers: providers.map((provider) => ({
      ...provider,
      models: provider.models.map((model) => ({
        ...model,
        capabilities: [...model.capabilities],
      })),
    })),
    knowledgeSources: knowledgeSources.map((source) => ({ ...source })),
    mentorAvailable: calculateMentorAvailability(providers),
  };
}
