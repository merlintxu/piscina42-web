import type {
  KnowledgeSourceInfo,
  LocalAIProviderInfo,
} from "./types";

export const mockOllamaAvailableWithChat: LocalAIProviderInfo = {
  provider: "ollama",
  status: "available",
  models: [
    {
      id: "local-chat-model",
      provider: "ollama",
      name: "Local chat model",
      capabilities: ["chat", "coding"],
      status: "available",
    },
  ],
};

export const mockOllamaAvailableWithoutModels: LocalAIProviderInfo = {
  provider: "ollama",
  status: "available",
  models: [],
};

export const mockHermesAvailable: LocalAIProviderInfo = {
  provider: "hermes",
  status: "available",
  models: [
    {
      id: "local-reasoning-model",
      provider: "hermes",
      name: "Local reasoning model",
      capabilities: ["reasoning"],
      status: "available",
    },
  ],
};

export const mockObsidianAvailable: KnowledgeSourceInfo = {
  kind: "obsidian",
  status: "available",
  location: "configured-vault",
};

export const mockAllUnavailable: {
  providers: LocalAIProviderInfo[];
  knowledgeSources: KnowledgeSourceInfo[];
} = {
  providers: [
    {
      provider: "ollama",
      status: "unavailable",
      models: [],
    },
    {
      provider: "hermes",
      status: "unknown",
      models: [],
    },
  ],
  knowledgeSources: [
    {
      kind: "obsidian",
      status: "unknown",
    },
  ],
};
