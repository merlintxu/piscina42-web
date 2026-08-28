import { SKILL_DEFINITIONS } from "./config";
import { Challenge, Module, ExamSimulation, Habit } from "../types";

export interface SkillMatch {
  skillId: string;
  weight: number; // 0.1 to 1.0
}

/**
 * Returns skill associations for a given Challenge
 */
export function getSkillsForChallenge(challenge: Challenge): SkillMatch[] {
  const matches: SkillMatch[] = [];
  const addMatch = (skillId: string, weight: number) => {
    if (!matches.some(m => m.skillId === skillId)) {
      matches.push({ skillId, weight });
    }
  };

  // 1. Direct match by challenge.module
  if (challenge.module === "shell00-shell01") {
    addMatch("term-nav-files", 0.9);
    addMatch("term-permissions", 0.8);
    addMatch("term-redirection-pipes", 0.8);
    addMatch("git-basics", 0.7);
  } else if (challenge.module === "c00-intro") {
    addMatch("c-basics-types", 1.0);
    addMatch("c-control-flow", 0.9);
    addMatch("eng-norminette", 0.8);
    addMatch("eng-compilation-flags", 0.7);
  } else if (challenge.module === "c01-punteros") {
    addMatch("c-pointers-basics", 1.0);
    addMatch("c-pointers-arrays", 0.8);
    addMatch("eng-norminette", 0.7);
  } else if (challenge.module === "c02-c03-cadenas") {
    addMatch("c-strings-buffers", 1.0);
    addMatch("c-pointers-basics", 0.7);
    addMatch("eng-norminette", 0.8);
  } else if (challenge.module === "c04-c05-conversion-recursion") {
    addMatch("c-conversions-putnbr", 0.9);
    addMatch("c-recursion", 0.9);
    addMatch("c-strings-buffers", 0.6);
  } else if (challenge.module === "c06-cli-args") {
    addMatch("c-cli-args", 1.0);
    addMatch("c-strings-buffers", 0.7);
    addMatch("c-pointers-arrays", 0.6);
  } else if (challenge.module === "c07-asignacion-dinamica") {
    addMatch("c-dynamic-memory", 1.0);
    addMatch("eng-memory-leaks-valgrind", 0.9);
    addMatch("c-strings-buffers", 0.8);
  }

  // 2. Specific challenge tag matches
  if (challenge.tags) {
    for (const tag of challenge.tags) {
      const lower = tag.toLowerCase();
      if (lower.includes("puntero") || lower.includes("pointer")) {
        addMatch("c-pointers-basics", 0.9);
      }
      if (lower.includes("memoria") || lower.includes("malloc") || lower.includes("free")) {
        addMatch("c-dynamic-memory", 0.9);
        addMatch("eng-memory-leaks-valgrind", 0.8);
      }
      if (lower.includes("cadena") || lower.includes("string") || lower.includes("strlen")) {
        addMatch("c-strings-buffers", 0.9);
      }
      if (lower.includes("recursion") || lower.includes("recursivo")) {
        addMatch("c-recursion", 0.9);
      }
      if (lower.includes("args") || lower.includes("argv") || lower.includes("argc")) {
        addMatch("c-cli-args", 0.9);
      }
      if (lower.includes("norminette")) {
        addMatch("eng-norminette", 1.0);
      }
      if (lower.includes("examshell")) {
        addMatch("meta-exam-pressure", 0.8);
      }
    }
  }

  // 3. Fallback check from config relatedChallengeIds
  for (const skill of SKILL_DEFINITIONS) {
    if (skill.relatedChallengeIds.includes(challenge.id)) {
      addMatch(skill.id, 1.0);
    }
  }

  if (matches.length === 0) {
    addMatch("c-basics-types", 0.5);
  }

  return matches;
}

/**
 * Returns skill associations for a given Module
 */
export function getSkillsForModule(mod: Module): SkillMatch[] {
  const matches: SkillMatch[] = [];
  const addMatch = (skillId: string, weight: number) => {
    if (!matches.some(m => m.skillId === skillId)) {
      matches.push({ skillId, weight });
    }
  };

  for (const skill of SKILL_DEFINITIONS) {
    if (skill.relatedModuleIds.includes(mod.id)) {
      addMatch(skill.id, 1.0);
    }
  }

  if (mod.id === "shell00-shell01") {
    addMatch("term-nav-files", 1.0);
    addMatch("term-permissions", 0.9);
    addMatch("term-redirection-pipes", 0.9);
    addMatch("git-basics", 0.8);
    addMatch("git-vogsphere", 0.8);
  } else if (mod.id === "c00-intro") {
    addMatch("c-basics-types", 1.0);
    addMatch("c-control-flow", 0.9);
    addMatch("eng-norminette", 0.8);
  } else if (mod.id === "c01-punteros") {
    addMatch("c-pointers-basics", 1.0);
    addMatch("c-pointers-arrays", 0.9);
    addMatch("eng-norminette", 0.7);
  } else if (mod.id === "c02-c03-cadenas") {
    addMatch("c-strings-buffers", 1.0);
    addMatch("c-pointers-basics", 0.7);
    addMatch("eng-norminette", 0.8);
  } else if (mod.id === "c04-c05-conversion-recursion") {
    addMatch("c-conversions-putnbr", 1.0);
    addMatch("c-recursion", 1.0);
  } else if (mod.id === "c06-cli-args") {
    addMatch("c-cli-args", 1.0);
    addMatch("c-strings-buffers", 0.7);
  } else if (mod.id === "c07-asignacion-dinamica") {
    addMatch("c-dynamic-memory", 1.0);
    addMatch("eng-memory-leaks-valgrind", 0.9);
  }

  return matches;
}

/**
 * Returns skill associations for an ExamSimulation
 */
export function getSkillsForExam(exam: ExamSimulation): SkillMatch[] {
  return [
    { skillId: "meta-exam-pressure", weight: 1.0 },
    { skillId: "c-basics-types", weight: 0.7 },
    { skillId: "c-strings-buffers", weight: 0.8 },
    { skillId: "c-pointers-basics", weight: 0.8 },
    { skillId: "eng-norminette", weight: 0.6 }
  ];
}

/**
 * Returns skill associations for a Habit
 */
export function getSkillsForHabit(habit: Habit): SkillMatch[] {
  if (habit.id.includes("norminette")) {
    return [{ skillId: "eng-norminette", weight: 1.0 }];
  }
  if (habit.id.includes("peer")) {
    return [{ skillId: "eng-peer-evaluation", weight: 1.0 }];
  }
  if (habit.id.includes("terminal")) {
    return [{ skillId: "term-nav-files", weight: 0.9 }, { skillId: "term-redirection-pipes", weight: 0.7 }];
  }
  if (habit.id.includes("sleep") || habit.id.includes("focus") || habit.id.includes("deep")) {
    return [{ skillId: "meta-deep-work", weight: 1.0 }];
  }
  return [{ skillId: "meta-deep-work", weight: 0.7 }];
}
