export type LocalAIProvider = "ollama" | "hermes";

export type LocalAIProviderStatus =
  | "available"
  | "unavailable"
  | "degraded"
  | "unknown";

export type LocalAIModelCapability =
  | "chat"
  | "reasoning"
  | "coding"
  | "embeddings"
  | "vision";

export interface LocalAIModelInfo {
  id: string;
  provider: LocalAIProvider;
  name: string;
  capabilities: LocalAIModelCapability[];
  contextWindow?: number;
  parameterSize?: string;
  quantization?: string;
  status: LocalAIProviderStatus;
}

export interface LocalAIProviderInfo {
  provider: LocalAIProvider;
  status: LocalAIProviderStatus;
  version?: string;
  endpoint?: string;
  models: LocalAIModelInfo[];
  message?: string;
}

export type KnowledgeSourceKind = "obsidian";

export type KnowledgeSourceStatus = "available" | "unavailable" | "unknown";

export interface KnowledgeSourceInfo {
  kind: KnowledgeSourceKind;
  status: KnowledgeSourceStatus;
  location?: string;
  message?: string;
}

export interface LocalMentorCapabilities {
  generatedAt: string;
  providers: LocalAIProviderInfo[];
  knowledgeSources: KnowledgeSourceInfo[];
  mentorAvailable: boolean;
}
