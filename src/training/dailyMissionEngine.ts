import { 
  DailyMission, 
  DailyMissionItem, 
  TrainingState, 
  SkillCategory,
  getDefaultModeForMissionItemType 
} from "./types";
import { SKILL_DEFINITIONS } from "./config";
import { ContentJSON, UserProgress, Challenge, Module } from "../types";
import { getSkillsForChallenge, getSkillsForModule, getSkillsForHabit } from "./skillMapping";
import { generateTrainingPlan, getSkillMastery } from "./trainingPlan";

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Deterministic hash from date string to cycle items consistently on a given day.
 */
function getDateHash(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generates an adaptive, deterministic daily training mission reflecting:
 * - ~60% Weaknesses (reforzar habilidades con menor nivel o baja confianza)
 * - ~25% Active Recall (retos ya completados para resolver otra vez sin mirar)
 * - ~15% Curriculum Advance (siguiente paso en el temario según el plan de entrenamiento)
 */
export function generateDailyMission(
  dateStr: string,
  state: TrainingState,
  content: ContentJSON,
  progress: UserProgress
): DailyMission {
  // If a mission already exists for this exact date in state, return it to preserve state consistency
  if (state.dailyMissions[dateStr]) {
    return state.dailyMissions[dateStr];
  }

  const dateHash = getDateHash(dateStr);

  // 1. Generate Training Plan for stage & priority context
  const plan = generateTrainingPlan({
    currentDate: dateStr,
    targetDate: state.profile.targetDate,
    trainingState: state,
    content,
    progress
  });

  const completedSet = new Set(progress.completedChallenges || []);
  const pendingChallenges = content.challenges.filter(c => !completedSet.has(c.id));
  const completedChallengesList = content.challenges.filter(c => completedSet.has(c.id));

  // 2. Identify priority weak skills
  // Sort priority skills from the training plan and overall skills by mastery gap (level ascending, confidence ascending)
  const sortedWeakSkills = [...SKILL_DEFINITIONS].map(def => {
    const mastery = getSkillMastery(state.skills, def.id);
    return {
      def,
      mastery,
      // Gap formula: lower level and lower confidence = higher gap score
      gapScore: (5 - mastery.level) * 20 + (1 - mastery.confidence) * 10 + (def.weightInReadiness || 3) * 2
    };
  }).sort((a, b) => b.gapScore - a.gapScore);

  const primaryWeakDef = plan.prioritySkills[0] || sortedWeakSkills[0].def;
  const primaryWeakMastery = getSkillMastery(state.skills, primaryWeakDef.id);
  const targetCategory: SkillCategory = primaryWeakDef.category;

  // --------------------------------------------------------------------------
  // PART A: ~60% DEBILIDADES (Weakness Focus)
  // --------------------------------------------------------------------------
  // Find the most suitable pending challenge addressing weak skills or current stage modules
  let mainChallenge: Challenge | undefined = undefined;

  // Attempt 1: Pending challenge directly matching top priority weak skills
  for (const priorityDef of plan.prioritySkills) {
    const matched = pendingChallenges.find(c => {
      const chSkills = getSkillsForChallenge(c);
      return chSkills.some(s => s.skillId === priorityDef.id);
    });
    if (matched) {
      mainChallenge = matched;
      break;
    }
  }

  // Attempt 2: Pending challenge belonging to the recommended modules of current stage
  if (!mainChallenge && plan.recommendedModules.length > 0) {
    const recModIds = plan.recommendedModules.map(m => m.id);
    mainChallenge = pendingChallenges.find(c => recModIds.includes(c.module));
  }

  // Attempt 3: Any pending challenge in chronological order
  if (!mainChallenge && pendingChallenges.length > 0) {
    mainChallenge = pendingChallenges[0];
  }

  // Find an optional secondary challenge for additional weakness practice
  let secondaryChallenge: Challenge | undefined = undefined;
  if (pendingChallenges.length > 1) {
    const candidateSecondary = pendingChallenges.filter(c => c.id !== mainChallenge?.id);
    // Prefer one matching secondary weak skills
    for (const weak of sortedWeakSkills.slice(1)) {
      const match = candidateSecondary.find(c => {
        const chSkills = getSkillsForChallenge(c);
        return chSkills.some(s => s.skillId === weak.def.id);
      });
      if (match) {
        secondaryChallenge = match;
        break;
      }
    }
    if (!secondaryChallenge && candidateSecondary.length > 0) {
      secondaryChallenge = candidateSecondary[0];
    }
  }

  // --------------------------------------------------------------------------
  // PART B: ~25% ACTIVE RECALL (Repaso de Retos Ya Completados)
  // --------------------------------------------------------------------------
  let recallChallenge: Challenge | undefined = undefined;
  if (completedChallengesList.length > 0) {
    // Pick a completed challenge whose associated skills have lower confidence or need reinforcement
    const scoredCompleted = completedChallengesList.map(c => {
      const cSkills = getSkillsForChallenge(c);
      let lowestConf = 1.0;
      for (const cs of cSkills) {
        const m = getSkillMastery(state.skills, cs.skillId);
        if (m.confidence < lowestConf) lowestConf = m.confidence;
      }
      return { challenge: c, lowestConf };
    }).sort((a, b) => a.lowestConf - b.lowestConf);

    // Pick deterministically among the top candidates needing recall
    const candidatePool = scoredCompleted.slice(0, Math.min(3, scoredCompleted.length));
    recallChallenge = candidatePool[dateHash % candidatePool.length].challenge;
  }

  // --------------------------------------------------------------------------
  // PART C: ~15% CURRICULUM ADVANCE (Siguiente Paso Temario)
  // --------------------------------------------------------------------------
  let advanceModule: Module | undefined = plan.recommendedModules[0];
  if (!advanceModule && content.modules.length > 0) {
    advanceModule = content.modules[0];
  }

  // --------------------------------------------------------------------------
  // SELECT HABIT
  // --------------------------------------------------------------------------
  let selectedHabit = content.habits[0];
  if (progress.activeHabits && progress.activeHabits.length > 0) {
    const selectedHabitId = progress.activeHabits[dateHash % progress.activeHabits.length];
    const found = content.habits.find(h => h.id === selectedHabitId);
    if (found) selectedHabit = found;
  } else if (content.habits.length > 0) {
    selectedHabit = content.habits[dateHash % content.habits.length];
  }

  // --------------------------------------------------------------------------
  // CONSTRUCT MISSION ITEMS
  // --------------------------------------------------------------------------
  const items: DailyMissionItem[] = [];
  const targetSkills: string[] = [];

  const registerSkill = (skillId: string) => {
    if (skillId && !targetSkills.includes(skillId)) {
      targetSkills.push(skillId);
    }
  };

  // 1. Warmup / Recall conceptual (5-10 min)
  if (recallChallenge) {
    const recallSkills = getSkillsForChallenge(recallChallenge);
    const primaryRecallSkill = recallSkills[0]?.skillId || "c-basics-types";
    registerSkill(primaryRecallSkill);

    items.push({
      id: `item-recall-${recallChallenge.id}`,
      type: "recall",
      title: `Active Recall (sin mirar): Re-implementar ${recallChallenge.title}`,
      referenceId: recallChallenge.slug || recallChallenge.id,
      targetSkillId: primaryRecallSkill,
      estimatedMinutes: Math.min(30, Math.max(15, Math.round((recallChallenge.estimated_time_minutes || 30) * 0.6))),
      completed: false,
      mode: "prove"
    });
  } else {
    // When no completed challenge exists yet, provide a foundational recall item
    const warmupSkillId = plan.prioritySkills[0]?.id || "term-nav-files";
    registerSkill(warmupSkillId);

    items.push({
      id: `item-recall-foundations-${dateStr}`,
      type: "recall",
      title: "Active Recall: Repaso mental de comandos y reglas base sin apuntes",
      referenceId: "shell00-shell01",
      targetSkillId: warmupSkillId,
      estimatedMinutes: 15,
      completed: false,
      mode: "prove"
    });
  }

  // 2. Main Challenge (Debilidad principal ~60% core)
  if (mainChallenge) {
    const chSkills = getSkillsForChallenge(mainChallenge);
    chSkills.forEach(s => registerSkill(s.skillId));
    const primaryChSkill = chSkills[0]?.skillId || primaryWeakDef.id;

    items.push({
      id: `item-ch-${mainChallenge.id}`,
      type: "challenge",
      title: `Reto Principal (Debilidad): ${mainChallenge.title}`,
      referenceId: mainChallenge.slug || mainChallenge.id,
      targetSkillId: primaryChSkill,
      estimatedMinutes: mainChallenge.estimated_time_minutes || 45,
      completed: false,
      mode: "prove"
    });

    // Rigor / Norminette review for the main challenge
    registerSkill("eng-norminette");
    items.push({
      id: `item-norm-${mainChallenge.id}`,
      type: "review",
      title: `Auditoría Norminette v3 & Flags estrictos para ${mainChallenge.title}`,
      referenceId: "norminette",
      targetSkillId: "eng-norminette",
      estimatedMinutes: 15,
      completed: false,
      mode: "learn"
    });
  }

  // 3. Secondary Challenge or Focused Practice (Weakness reinforcement)
  if (secondaryChallenge && items.length < 5) {
    const secSkills = getSkillsForChallenge(secondaryChallenge);
    secSkills.forEach(s => registerSkill(s.skillId));
    // ALWAYS obtain targetSkillId via skillMapping (never assign a fake skill)
    const primarySecSkill = secSkills[0]?.skillId || primaryWeakDef.id;

    items.push({
      id: `item-ch2-${secondaryChallenge.id}`,
      type: "challenge",
      title: `Reto Refuerzo: ${secondaryChallenge.title}`,
      referenceId: secondaryChallenge.slug || secondaryChallenge.id,
      targetSkillId: primarySecSkill,
      estimatedMinutes: secondaryChallenge.estimated_time_minutes || 30,
      completed: false,
      mode: "prove"
    });
  }

  // 4. Curriculum Advance (~15% Avance)
  if (advanceModule) {
    const modSkills = getSkillsForModule(advanceModule);
    const advanceSkillId = modSkills[0]?.skillId || primaryWeakDef.id;
    registerSkill(advanceSkillId);

    items.push({
      id: `item-concept-${advanceModule.id}`,
      type: "concept",
      title: `Avance Curricular: Conceptos clave de ${advanceModule.title}`,
      referenceId: advanceModule.slug || advanceModule.id,
      targetSkillId: advanceSkillId,
      estimatedMinutes: 15,
      completed: false,
      mode: "learn"
    });
  }

  // 5. Daily Habit & Resilience
  if (selectedHabit) {
    const habitSkills = getSkillsForHabit(selectedHabit);
    const habitSkillId = habitSkills[0]?.skillId || "meta-deep-work";
    registerSkill(habitSkillId);

    items.push({
      id: `item-habit-${selectedHabit.id}`,
      type: "habit",
      title: `Hábito de Piscina: ${selectedHabit.title}`,
      referenceId: selectedHabit.slug || selectedHabit.id,
      targetSkillId: habitSkillId,
      estimatedMinutes: 15,
      completed: false,
      mode: "learn"
    });
  }

  const totalMinutes = items.reduce((acc, curr) => acc + curr.estimatedMinutes, 0);

  // --------------------------------------------------------------------------
  // RATIONALE GENERATION
  // --------------------------------------------------------------------------
  let rationale = `Misión del día calibrada en ${plan.stageTitle}: ~60% ataque a debilidades en '${primaryWeakDef.title}', ~25% active recall y ~15% avance curricular. `;
  if (mainChallenge) {
    rationale += `Reto foco: '${mainChallenge.title}'. `;
  }
  if (recallChallenge) {
    rationale += `Recall activo: '${recallChallenge.title}' para fijación a largo plazo. `;
  }
  if (plan.isBlockedByWeakPointersOrMemory && plan.blockerReason) {
    rationale += `Nota de rigor: ${plan.blockerReason}`;
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
