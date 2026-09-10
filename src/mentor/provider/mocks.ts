import type { LocalMentorCapabilities, LocalAIProviderInfo } from "../types";
import type {
  MentorProvider,
  MentorRequest,
  MentorResponse,
} from "./types";

const chatProvider: LocalAIProviderInfo = {
  provider: "ollama",
  status: "available",
  models: [
    {
      id: "chat-model",
      provider: "ollama",
      name: "Chat model",
      capabilities: ["chat"],
      status: "available",
    },
  ],
};

const codingProvider: LocalAIProviderInfo = {
  provider: "ollama",
  status: "available",
  models: [
    {
      id: "coding-model",
      provider: "ollama",
      name: "Coding model",
      capabilities: ["coding"],
      status: "available",
    },
  ],
};

const reasoningUnavailableCapabilities: LocalMentorCapabilities = {
  generatedAt: "2026-09-10T00:00:00.000Z",
  providers: [chatProvider],
  knowledgeSources: [],
  mentorAvailable: true,
};

export const mockChatRequest: MentorRequest = {
  mode: "learn",
  messages: [{ role: "student", content: "Explain pointers." }],
};

export const mockCodingRequest: MentorRequest = {
  mode: "learn",
  preferredCapability: "coding",
  messages: [{ role: "student", content: "Review this function." }],
};

export const mockReasoningRequestWithoutModel: MentorRequest = {
  mode: "learn",
  preferredCapability: "reasoning",
  messages: [{ role: "student", content: "Compare these approaches." }],
};

export const mockCodingFallbackRequest: MentorRequest = {
  ...mockCodingRequest,
  allowFallback: true,
};

export const mockProveRequest: MentorRequest = {
  mode: "prove",
  messages: [{ role: "student", content: "Solve this exercise." }],
};

export const mockChatCapabilities: LocalMentorCapabilities = {
  ...reasoningUnavailableCapabilities,
};

export const mockCodingCapabilities: LocalMentorCapabilities = {
  ...reasoningUnavailableCapabilities,
  providers: [codingProvider, chatProvider],
};

export const mockReasoningUnavailableCapabilities = reasoningUnavailableCapabilities;
export const mockCodingFallbackCapabilities = mockChatCapabilities;

export const mockProvider: MentorProvider = {
  getCapabilities: () => chatProvider,
  complete: async (_request: MentorRequest, _selection): Promise<MentorResponse> => ({
    provider: "ollama",
    model: "chat-model",
    content: "Mock provider response.",
    generatedAt: "2026-09-10T00:00:00.000Z",
    finishReason: "mock",
  }),
};
