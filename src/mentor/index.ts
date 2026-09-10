export {
  calculateMentorAvailability,
  createLocalMentorCapabilities,
} from "./capabilities";
export {
  mockAllUnavailable,
  mockHermesAvailable,
  mockObsidianAvailable,
  mockOllamaAvailableWithChat,
  mockOllamaAvailableWithoutModels,
} from "./mocks";
export type {
  KnowledgeSourceInfo,
  KnowledgeSourceKind,
  KnowledgeSourceStatus,
  LocalAIModelCapability,
  LocalAIModelInfo,
  LocalAIProvider,
  LocalAIProviderInfo,
  LocalAIProviderStatus,
  LocalMentorCapabilities,
  ModelCapabilityEvidence,
} from "./types";
export {
  isMentorAssistanceAllowed,
  selectMentorModel,
} from "./provider";
export type {
  MentorCapabilityInventory,
  MentorMessage,
  MentorMode,
  MentorModelSelection,
  MentorProvider,
  MentorProviderError,
  MentorRequest,
  MentorResponse,
  MentorRole,
} from "./provider";
export {
  buildMentorSystemPrompt,
  createMentorPedagogyPolicy,
  MENTOR_PROMPT_VERSION,
} from "./policy";
export type {
  HintLevel,
  MentorGuidanceKind,
  MentorPedagogyPolicy,
} from "./policy";
