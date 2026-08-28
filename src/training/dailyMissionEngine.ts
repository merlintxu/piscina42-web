import { DailyMission, DailyMissionItem, TrainingState, SkillCategory } from "./types";
import { SKILL_DEFINITIONS } from "./config";
import { ContentJSON, UserProgress, Challenge } from "../types";
import { getSkillsForChallenge } from "./skillMapping";

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function generateDailyMission(
  dateStr: string,
  state: TrainingState,
  content: ContentJSON,
  progress: UserProgress
): DailyMission {
  // If a mission already exists for this exact date in state, return it to keep consistency
  if (state.dailyMissions[dateStr]) {
    return state.dailyMissions[dateStr];
  }

  // 1. Identify weakest skills and user focus
  const skillsList = SKILL_DEFINITIONS.map(def => ({
    def,
    mastery: state.skills[def.id] || { level: 0, confidence: 0 }
  })).sort((a, b) => {
    // Sort by level ascending, then by weight descending
    if (a.mastery.level !== b.mastery.level) {
      return a.mastery.level - b.mastery.level;
    }
    return (b.def.weightInReadiness || 4) - (a.def.weightInReadiness || 4);
  });

  const weakestSkill = skillsList[0]?.def || SKILL_DEFINITIONS[0];
  const targetCategory: SkillCategory = weakestSkill.category;

  // 2. Find suitable pending challenges
  const completedSet = new Set(progress.completedChallenges || []);
  const pendingChallenges = content.challenges.filter(c => !completedSet.has(c.id));

  // Find a challenge that matches the weakest skill or target category
  let mainChallenge: Challenge | undefined = pendingChallenges.find(c => {
    const matched = getSkillsForChallenge(c);
    return matched.some(m => m.skillId === weakestSkill.id);
  });

  // If none matches the specific weakest skill, take the next pending challenge in chronological order
  if (!mainChallenge && pendingChallenges.length > 0) {
    mainChallenge = pendingChallenges[0];
  }

  // Find an optional secondary challenge (e.g. next in line or easy practice)
  let secondaryChallenge: Challenge | undefined = undefined;
  if (pendingChallenges.length > 1) {
    secondaryChallenge = pendingChallenges.find(c => c.id !== mainChallenge?.id);
  }

  // 3. Select a habit
  let selectedHabitId = "habit-norminette-daily";
  if (progress.activeHabits && progress.activeHabits.length > 0) {
    // Pick habit based on day of month hash for deterministic variety
    const dayNum = parseInt(dateStr.replace(/-/g, ""), 10) || 1;
    selectedHabitId = progress.activeHabits[dayNum % progress.activeHabits.length];
  }

  const selectedHabit = content.habits.find(h => h.id === selectedHabitId) || content.habits[0];

  // 4. Construct Mission Items
  const items: DailyMissionItem[] = [];
  const targetSkills: string[] = [];

  if (mainChallenge) {
    const chSkills = getSkillsForChallenge(mainChallenge);
    chSkills.forEach(s => {
      if (!targetSkills.includes(s.skillId)) targetSkills.push(s.skillId);
    });

    items.push({
      id: `item-ch-${mainChallenge.id}`,
      type: "challenge",
      title: `Resolver reto principal: ${mainChallenge.title}`,
      referenceId: mainChallenge.slug || mainChallenge.id,
      targetSkillId: chSkills[0]?.skillId || weakestSkill.id,
      estimatedMinutes: mainChallenge.estimated_time_minutes || 45,
      completed: false
    });

    items.push({
      id: `item-norm-${mainChallenge.id}`,
      type: "review",
      title: `Auditoría Norminette v3 & -Wall -Wextra -Werror para ${mainChallenge.title}`,
      referenceId: "norminette",
      targetSkillId: "eng-norminette",
      estimatedMinutes: 15,
      completed: false
    });
  }

  if (selectedHabit) {
    items.push({
      id: `item-habit-${selectedHabit.id}`,
      type: "habit",
      title: `Hábito del día: ${selectedHabit.title}`,
      referenceId: selectedHabit.slug || selectedHabit.id,
      targetSkillId: selectedHabit.id.includes("peer") ? "eng-peer-evaluation" : "meta-deep-work",
      estimatedMinutes: 15,
      completed: false
    });
  }

  if (secondaryChallenge && items.length < 4) {
    items.push({
      id: `item-ch2-${secondaryChallenge.id}`,
      type: "challenge",
      title: `Reto secundario / Refuerzo: ${secondaryChallenge.title}`,
      referenceId: secondaryChallenge.slug || secondaryChallenge.id,
      targetSkillId: weakestSkill.id,
      estimatedMinutes: secondaryChallenge.estimated_time_minutes || 30,
      completed: false
    });
  }

  const totalMinutes = items.reduce((acc, curr) => acc + curr.estimatedMinutes, 0);

  // 5. Generate Rationale
  let rationale = `Entrenamiento enfocado en ${weakestSkill.title} (${weakestSkill.description}). `;
  if (mainChallenge) {
    rationale += `Resolveremos '${mainChallenge.title}' para consolidar la sintaxis y verificar la ausencia total de errores con la Norminette.`;
  } else {
    rationale += `Has resuelto todos los retos técnicos: hoy consolidamos simulaciones de examen y hábitos de alto rendimiento.`;
  }

  return {
    date: dateStr,
    mainChallengeId: mainChallenge?.id,
    secondaryChallengeId: secondaryChallenge?.id,
    habitId: selectedHabit?.id,
    items,
    rationale,
    focusCategory: targetCategory,
    estimatedMinutes: totalMinutes,
    targetSkills,
    completed: false
  };
}
