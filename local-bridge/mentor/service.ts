import {
  createLocalMentorCapabilities,
  type LocalMentorCapabilities,
} from "../../src/mentor";
import { probeHermes, probeObsidian, probeOllama } from "./probes";

export async function probeLocalMentorCapabilities(): Promise<LocalMentorCapabilities> {
  const [ollama, hermes, obsidian] = await Promise.all([
    probeOllama(),
    probeHermes(),
    probeObsidian(),
  ]);

  return createLocalMentorCapabilities(
    new Date().toISOString(),
    [ollama, hermes],
    [obsidian],
  );
}
