import {
  isMentorAssistanceAllowed,
  selectMentorModel,
} from "../../../src/mentor/provider";
import type {
  MentorProviderError,
  MentorRequest,
  MentorResponse,
} from "../../../src/mentor/provider";
import { probeLocalMentorCapabilities } from "../service";
import { MentorProviderException, OllamaMentorProvider } from "./ollama";

export async function completeMentorRequest(
  request: MentorRequest,
): Promise<MentorResponse> {
  if (!isMentorAssistanceAllowed(request.mode)) {
    throw new MentorProviderException(
      "assistance_not_allowed",
      "AI mentor assistance is not allowed in prove mode.",
      false,
    );
  }

  const capabilities = await probeLocalMentorCapabilities();
  const selection = selectMentorModel(capabilities, request);
  if (!selection || selection.provider !== "ollama") {
    throw new MentorProviderException(
      "model_unavailable",
      "No compatible Ollama mentor model is available.",
      false,
    );
  }

  const ollama = capabilities.providers.find((provider) => provider.provider === "ollama");
  if (!ollama || ollama.status !== "available") {
    throw new MentorProviderException(
      "model_unavailable",
      "Ollama provider is not available.",
      false,
    );
  }

  return new OllamaMentorProvider(ollama).complete(request, selection);
}

export type { MentorProviderError };
