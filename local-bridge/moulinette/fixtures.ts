import {
  mockCompileFailureMoulinetteRunInput,
  mockMemoryLeakMoulinetteRunInput,
  mockNorminetteFailureMoulinetteRunInput,
  mockStandardMoulinetteRunInput,
} from "../../src/moulinette/orchestrator/mocks";
import { getMoulinetteCheckProfile } from "../../src/moulinette/evaluation";
import type { MoulinetteRunInput } from "../../src/moulinette/orchestrator";
import type { MoulinetteFixtureId, MoulinetteProfile } from "./types";

export function resolveMoulinetteFixture(
  fixtureId: MoulinetteFixtureId,
  profile: MoulinetteProfile,
): MoulinetteRunInput {
  switch (fixtureId) {
    case "valid":
      return {
        ...mockStandardMoulinetteRunInput,
        profile: getMoulinetteCheckProfile(profile),
      };
    case "compile-fail":
      return {
        ...mockCompileFailureMoulinetteRunInput,
        profile: getMoulinetteCheckProfile(profile),
      };
    case "norminette-fail":
      return {
        ...mockNorminetteFailureMoulinetteRunInput,
        profile: getMoulinetteCheckProfile(profile),
      };
    case "memory-leak":
      return {
        ...mockMemoryLeakMoulinetteRunInput,
        profile: getMoulinetteCheckProfile(profile),
      };
  }
}
