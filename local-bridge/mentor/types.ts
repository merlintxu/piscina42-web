export interface OllamaTagsResponse {
  models?: Array<{
    name?: unknown;
    model?: unknown;
    details?: {
      parameter_size?: unknown;
      quantization_level?: unknown;
    };
  }>;
}

export interface LocalProbeExecution {
  outcome: "pass" | "missing" | "timeout" | "error";
  stdout: string;
  stderr: string;
  message?: string;
}
