import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type {
  KnowledgeSourceInfo,
  LocalAIModelCapability,
  LocalAIModelInfo,
  LocalAIProviderInfo,
  ModelCapabilityEvidence,
} from "../../src/mentor";
import type {
  LocalProbeExecution,
  OllamaShowResponse,
  OllamaTagsResponse,
} from "./types";

const execFileAsync = promisify(execFile);
const PROBE_TIMEOUT_MS = 2_000;
const PROBE_MAX_OUTPUT_BYTES = 16 * 1024;
const OLLAMA_TAGS_ENDPOINT = "http://127.0.0.1:11434/api/tags";
const OLLAMA_ENDPOINT = "http://127.0.0.1:11434";

async function runFixedProbe(
  executable: string,
  args: readonly string[],
): Promise<LocalProbeExecution> {
  try {
    const result = await execFileAsync(executable, [...args], {
      encoding: "utf8",
      maxBuffer: PROBE_MAX_OUTPUT_BYTES,
      shell: false,
      timeout: PROBE_TIMEOUT_MS,
      windowsHide: true,
    });
    return { outcome: "pass", stdout: result.stdout, stderr: result.stderr };
  } catch (error) {
    const probeError = error as NodeJS.ErrnoException & {
      killed?: boolean;
      stdout?: string;
      stderr?: string;
    };
    const timedOut = probeError.killed === true || probeError.code === "ETIMEDOUT";
    return {
      outcome: timedOut ? "timeout" : probeError.code === "ENOENT" ? "missing" : "error",
      stdout: probeError.stdout ?? "",
      stderr: probeError.stderr ?? "",
      message: timedOut
        ? "Probe timed out."
        : probeError.stderr?.trim() || probeError.message || "Probe failed.",
    };
  }
}

function firstLine(value: string): string | undefined {
  return value.trim().split(/\r?\n/, 1)[0]?.trim() || undefined;
}

async function fetchOllamaShow(modelName: string): Promise<OllamaShowResponse | undefined> {
  try {
    const response = await fetch(`${OLLAMA_ENDPOINT}/api/show`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: modelName }),
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    if (!response.ok) return undefined;
    const payload: unknown = await response.json();
    return typeof payload === "object" && payload !== null
      ? (payload as OllamaShowResponse)
      : undefined;
  } catch {
    return undefined;
  }
}

function stringValue(record: Record<string, unknown> | undefined, key: string): string | undefined {
  return typeof record?.[key] === "string" ? record[key] as string : undefined;
}

function numberValue(record: Record<string, unknown> | undefined, key: string): number | undefined {
  return typeof record?.[key] === "number" ? record[key] as number : undefined;
}

function classifyModelCapabilities(
  show: OllamaShowResponse | undefined,
): { capabilities: LocalAIModelCapability[]; evidence: ModelCapabilityEvidence[] } {
  const modelInfo = show?.model_info;
  const template = typeof show?.template === "string" ? show.template : "";
  const capabilities: LocalAIModelCapability[] = [];
  const evidence: ModelCapabilityEvidence[] = [];

  if (template.includes(".Messages") && template.includes("Role \"user\"") && template.includes("Role \"assistant\"")) {
    capabilities.push("chat");
    evidence.push({
      capability: "chat",
      source: "api/show.template",
      confidence: "explicit",
      detail: "Template explicitly handles user and assistant message roles.",
    });
  }

  const basename = stringValue(modelInfo, "general.basename");
  if (basename?.toLowerCase().includes("coder")) {
    capabilities.push("coding");
    evidence.push({
      capability: "coding",
      source: "api/show.model_info.general.basename",
      confidence: "explicit",
      detail: basename,
    });
  }

  return { capabilities, evidence };
}

export async function probeOllama(): Promise<LocalAIProviderInfo> {
  const cli = await runFixedProbe("ollama", ["--version"]);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  let daemonOnline = false;
  let tags: OllamaTagsResponse | undefined;
  let daemonMessage: string | undefined;
  try {
    const response = await fetch(OLLAMA_TAGS_ENDPOINT, {
      method: "GET",
      signal: controller.signal,
    });
    if (response.ok) {
      const payload: unknown = await response.json();
      if (typeof payload === "object" && payload !== null) {
        tags = payload as OllamaTagsResponse;
        daemonOnline = true;
      } else {
        daemonMessage = "Ollama returned an invalid tags response.";
      }
    } else {
      daemonMessage = `Ollama API returned HTTP ${response.status}.`;
    }
  } catch {
    daemonMessage = "Ollama daemon is not accessible.";
  } finally {
    clearTimeout(timeout);
  }

  if (!daemonOnline) {
    return {
      provider: "ollama",
      status: cli.outcome === "pass" ? "degraded" : "unavailable",
      ...(firstLine(cli.stdout) ? { version: firstLine(cli.stdout) } : {}),
      endpoint: OLLAMA_ENDPOINT,
      models: [],
      message:
        cli.outcome === "pass"
          ? daemonMessage
          : "Ollama API and CLI are unavailable.",
    };
  }

  const models: LocalAIModelInfo[] = (await Promise.all((tags?.models ?? [])
    .filter((model) => typeof model.name === "string" || typeof model.model === "string")
    .map(async (model) => {
      const id = typeof model.model === "string" ? model.model : String(model.name);
      const name = typeof model.name === "string" ? model.name : id;
      const parameterSize = model.details?.parameter_size;
      const quantization = model.details?.quantization_level;
      const show = await fetchOllamaShow(id);
      const showInfo = show?.model_info;
      const showDetails = show?.details as Record<string, unknown> | undefined;
      const { capabilities, evidence } = classifyModelCapabilities(show);
      const family = stringValue(showDetails, "family") ?? stringValue(model.details as Record<string, unknown> | undefined, "family");
      const families = Array.isArray(showDetails?.families)
        ? showDetails.families.filter((value): value is string => typeof value === "string")
        : Array.isArray(model.details?.families)
          ? model.details.families.filter((value): value is string => typeof value === "string")
          : undefined;
      const contextWindow = numberValue(showInfo, `${family ?? ""}.context_length`) ??
        numberValue(model.details as Record<string, unknown> | undefined, "context_length");
      return {
        id,
        provider: "ollama" as const,
        name,
        capabilities,
        ...(evidence.length ? { capabilityEvidence: evidence } : {}),
        ...(family ? { family } : {}),
        ...(families?.length ? { families } : {}),
        ...(stringValue(showDetails, "format") ?? stringValue(model.details as Record<string, unknown> | undefined, "format")
          ? { format: stringValue(showDetails, "format") ?? stringValue(model.details as Record<string, unknown> | undefined, "format") }
          : {}),
        ...(family ? { architecture: stringValue(showInfo, "general.architecture") ?? family } : {}),
        ...(contextWindow ? { contextWindow } : {}),
        ...(typeof parameterSize === "string" ? { parameterSize } : {}),
        ...(typeof quantization === "string" ? { quantization } : {}),
        status: "available" as const,
      };
    })));

  return {
    provider: "ollama",
    status: "available",
    ...(firstLine(cli.stdout) ? { version: firstLine(cli.stdout) } : {}),
    endpoint: OLLAMA_ENDPOINT,
    models,
    message:
      cli.outcome === "missing"
        ? "Ollama API available; CLI not found in PATH."
        : models.length === 0
          ? "Ollama daemon is available; no models installed."
          : undefined,
  };
}

export async function probeHermes(): Promise<LocalAIProviderInfo> {
  const executable = await runFixedProbe("which", ["hermes"]);
  if (executable.outcome === "missing") {
    return {
      provider: "hermes",
      status: "unavailable",
      models: [],
      message: "Hermes executable not found.",
    };
  }
  if (executable.outcome !== "pass") {
    return {
      provider: "hermes",
      status: "degraded",
      models: [],
      message: "Hermes executable detection failed.",
    };
  }

  const version = await runFixedProbe("hermes", ["--version"]);
  if (version.outcome !== "pass") {
    return {
      provider: "hermes",
      status: "degraded",
      models: [],
      message: "Hermes executable detected but version probe failed.",
    };
  }

  return {
    provider: "hermes",
    status: "available",
    version: firstLine(version.stdout),
    models: [],
    message: "Hermes CLI detected; model capabilities are not probed yet.",
  };
}

export async function probeObsidian(): Promise<KnowledgeSourceInfo> {
  const executable = await runFixedProbe("which", ["obsidian"]);
  if (executable.outcome === "pass") {
    return {
      kind: "obsidian",
      status: "available",
      message: "Obsidian executable detected; vault content was not read.",
    };
  }
  return {
    kind: "obsidian",
    status: "unavailable",
    message: "Obsidian executable not found.",
  };
}
