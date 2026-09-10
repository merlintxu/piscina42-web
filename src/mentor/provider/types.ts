import type {
  LocalAIModelCapability,
  LocalAIProviderInfo,
  LocalMentorCapabilities,
} from "../types";

export type MentorMode = "learn" | "prove";
export type MentorRole = "student" | "mentor";

export interface MentorMessage {
  role: MentorRole;
  content: string;
}

export interface MentorRequest {
  mode: MentorMode;
  messages: MentorMessage[];
  taskContext?: string;
  preferredCapability?: Extract<LocalAIModelCapability, "chat" | "coding" | "reasoning">;
  allowFallback?: boolean;
}

export interface MentorResponse {
  provider: string;
  model: string;
  content: string;
  generatedAt: string;
  usage?: Record<string, number>;
  finishReason?: string;
}

export interface MentorProviderError {
  code: string;
  message: string;
  recoverable: boolean;
}

export interface MentorModelSelection {
  provider: string;
  modelId: string;
  capability: Extract<LocalAIModelCapability, "chat" | "coding" | "reasoning">;
  reason: string;
}

export interface MentorProvider {
  getCapabilities(): LocalAIProviderInfo;
  complete(
    request: MentorRequest,
    selection: MentorModelSelection,
  ): Promise<MentorResponse>;
}

export type MentorCapabilityInventory = Pick<LocalMentorCapabilities, "providers">;
