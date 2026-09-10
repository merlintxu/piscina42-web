import type {
  MentorModelSelection,
  MentorProvider,
  MentorProviderError,
  MentorRequest,
  MentorResponse,
} from "../../../src/mentor/provider";
import type { LocalAIProviderInfo } from "../../../src/mentor";
import {
  buildMentorSystemPrompt,
  createMentorPedagogyPolicy,
} from "../../../src/mentor/policy";

const OLLAMA_CHAT_ENDPOINT = "http://127.0.0.1:11434/api/chat";
const OLLAMA_TIMEOUT_MS = 60_000;

interface OllamaChatResponse {
  model?: unknown;
  message?: {
    content?: unknown;
  };
  done_reason?: unknown;
  prompt_eval_count?: unknown;
  eval_count?: unknown;
}

interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class MentorProviderException extends Error implements MentorProviderError {
  constructor(
    public readonly code: string,
    message: string,
    public readonly recoverable: boolean,
  ) {
    super(message);
    this.name = "MentorProviderException";
  }
}

function toOllamaMessages(request: MentorRequest): OllamaMessage[] {
  return [
    {
      role: "system",
      content: buildMentorSystemPrompt(
        createMentorPedagogyPolicy(request.mode),
        request.taskContext,
      ),
    },
    ...request.messages.map((message) => ({
      role: message.role === "mentor" ? "assistant" as const : "user" as const,
      content: message.content,
    })),
  ];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export class OllamaMentorProvider implements MentorProvider {
  constructor(private readonly capabilities: LocalAIProviderInfo) {}

  getCapabilities(): LocalAIProviderInfo {
    return this.capabilities;
  }

  async complete(
    request: MentorRequest,
    selection: MentorModelSelection,
  ): Promise<MentorResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);
    let response: Response;

    try {
      response = await fetch(OLLAMA_CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selection.modelId,
          messages: toOllamaMessages(request),
          stream: false,
        }),
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new MentorProviderException("timeout", "Ollama request timed out.", true);
      }
      throw new MentorProviderException("connection_error", "Ollama API is not reachable.", true);
    }
    clearTimeout(timeout);

    if (response.status === 404) {
      throw new MentorProviderException("model_unavailable", "Selected Ollama model is unavailable.", false);
    }
    if (!response.ok) {
      throw new MentorProviderException(
        "provider_error",
        `Ollama API returned HTTP ${response.status}.`,
        true,
      );
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new MentorProviderException("invalid_response", "Ollama returned invalid JSON.", true);
    }

    if (!isRecord(payload) || !isRecord(payload.message) || typeof payload.message.content !== "string") {
      throw new MentorProviderException(
        "invalid_response",
        "Ollama response did not contain message.content.",
        true,
      );
    }

    const ollamaResponse = payload as OllamaChatResponse;
    const usage = {
      ...(numberValue(ollamaResponse.prompt_eval_count) !== undefined
        ? { promptTokens: numberValue(ollamaResponse.prompt_eval_count) as number }
        : {}),
      ...(numberValue(ollamaResponse.eval_count) !== undefined
        ? { completionTokens: numberValue(ollamaResponse.eval_count) as number }
        : {}),
    };

    return {
      provider: "ollama",
      model: typeof ollamaResponse.model === "string" ? ollamaResponse.model : selection.modelId,
      content: payload.message.content,
      generatedAt: new Date().toISOString(),
      ...(Object.keys(usage).length ? { usage } : {}),
      ...(typeof ollamaResponse.done_reason === "string"
        ? { finishReason: ollamaResponse.done_reason }
        : {}),
    };
  }
}
