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

export interface FitMissionBudgetParams {
  budgetMinutes: number;
  mainChallengeItem?: DailyMissionItem;
  recallItem?: DailyMissionItem;
  reviewItem?: DailyMissionItem;
  conceptItem?: DailyMissionItem;
  habitItem?: DailyMissionItem;
  secondaryChallengeItem?: DailyMissionItem;
  extraPracticeChallengeItem?: DailyMissionItem;
  peerItem?: DailyMissionItem;
  debriefItem?: DailyMissionItem;
  secondaryRecallItem?: DailyMissionItem;
}

/**
 * Pure function that adjusts and fits daily mission items into the daily time budget.
 *
 * Rules:
 * - Tolerancia máxima aproximada: +10% (e.g. 60m -> max 66m, 90m -> max 99m, 180m -> max 198m).
 * - Prioriza ítems pedagógicamente cruciales (Reto principal ~60% debilidad, Active recall ~25%, etc.).
 * - NUNCA corta un reto a la mitad (se respeta su estimated_time_minutes completo).
 * - Si sobra poco tiempo, rellena inteligentemente con recall, peer o debrief.
 */
export function fitMissionItemsToBudget(params: FitMissionBudgetParams): DailyMissionItem[] {
  const targetBudget = Math.min(360, Math.max(30, params.budgetMinutes || 90));
  const maxAllowed = Math.round(targetBudget * 1.10);

  const selectedItems: DailyMissionItem[] = [];
  const selectedIds = new Set<string>();

  const tryAddItem = (item?: DailyMissionItem): boolean => {
    if (!item || selectedIds.has(item.id)) return false;
    const currentTotal = selectedItems.reduce((acc, curr) => acc + curr.estimatedMinutes, 0);
    
    // Always permit the main challenge as the initial anchor item even if it takes most/all of the budget
    if (selectedItems.length === 0 && item === params.mainChallengeItem) {
      selectedItems.push(item);
      selectedIds.add(item.id);
      return true;
    }

    if (currentTotal + item.estimatedMinutes <= maxAllowed) {
      selectedItems.push(item);
      selectedIds.add(item.id);
      return true;
    }
    return false;
  };

  // 1. Primary weakness anchor (Main Challenge)
  if (params.mainChallengeItem) {
    tryAddItem(params.mainChallengeItem);
  }

  // 2. Active recall item (~25% Spaced Repetition)
  if (params.recallItem) {
    tryAddItem(params.recallItem);
  }

  // 3. Norminette & Strict Flags Review
  if (targetBudget >= 60 && params.reviewItem) {
    tryAddItem(params.reviewItem);
  }

  // 4. Curriculum advance or Habit for budgets >= 90m
  if (targetBudget >= 90) {
    if (params.conceptItem) tryAddItem(params.conceptItem);
    if (params.habitItem) tryAddItem(params.habitItem);
  }

  // 5. Secondary Challenge for budgets >= 120m
  if (targetBudget >= 120 && params.secondaryChallengeItem) {
    tryAddItem(params.secondaryChallengeItem);
  }

  // 6. Large budgets (>= 180m): Extra practice, Peer simulation, Technical debrief
  if (targetBudget >= 180) {
    if (params.extraPracticeChallengeItem) tryAddItem(params.extraPracticeChallengeItem);
    if (params.peerItem) tryAddItem(params.peerItem);
    if (params.debriefItem) tryAddItem(params.debriefItem);
  }

  // 7. Fine-grained filler if budget has remaining capacity:
  // Use recall, peer, debrief, review, habit or concept without exceeding maxAllowed (+10%)
  const fillCandidates = [
    params.recallItem,
    params.reviewItem,
    params.conceptItem,
    params.habitItem,
    params.peerItem,
    params.debriefItem,
    params.secondaryRecallItem,
    params.secondaryChallengeItem
  ];

  let currentTotal = selectedItems.reduce((acc, curr) => acc + curr.estimatedMinutes, 0);
  while (currentTotal < targetBudget) {
    const remaining = targetBudget - currentTotal;
    if (remaining < 5) break;

    let addedAny = false;
    for (const cand of fillCandidates) {
      if (cand && !selectedIds.has(cand.id)) {
        if (currentTotal + cand.estimatedMinutes <= maxAllowed) {
          selectedItems.push(cand);
          selectedIds.add(cand.id);
          currentTotal += cand.estimatedMinutes;
          addedAny = true;
          break;
        }
      }
    }
    if (!addedAny) break;
  }

  return selectedItems;
}

/**
 * Generates an adaptive, deterministic daily training mission reflecting:
 * - ~60% Weaknesses (reforzar habilidades con menor nivel o baja confianza)
 * - ~25% Active Recall (retos ya completados para resolver otra vez sin mirar)
 * - ~15% Curriculum Advance (siguiente paso en el temario según el plan de entrenamiento)
 * - Exact adjustment to trainingState.profile.dailyCommitmentMinutes (e.g. 60m, 90m, 180m).
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
  const dailyBudget = Math.min(360, Math.max(30, state.profile.dailyCommitmentMinutes || 90));

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
  const sortedWeakSkills = [...SKILL_DEFINITIONS].map(def => {
    const mastery = getSkillMastery(state.skills, def.id);
    return {
      def,
      mastery,
      gapScore: (5 - mastery.level) * 20 + (1 - mastery.confidence) * 10 + (def.weightInReadiness || 3) * 2
    };
  }).sort((a, b) => b.gapScore - a.gapScore);

  const primaryWeakDef = plan.prioritySkills[0] || sortedWeakSkills[0].def;
  const targetCategory: SkillCategory = primaryWeakDef.category;

  // --------------------------------------------------------------------------
  // PART A: ~60% DEBILIDADES (Weakness Focus)
  // --------------------------------------------------------------------------
  let mainChallenge: Challenge | undefined = undefined;

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

  if (!mainChallenge && plan.recommendedModules.length > 0) {
    const recModIds = plan.recommendedModules.map(m => m.id);
    mainChallenge = pendingChallenges.find(c => recModIds.includes(c.module));
  }

  if (!mainChallenge && pendingChallenges.length > 0) {
    mainChallenge = pendingChallenges[0];
  }

  let secondaryChallenge: Challenge | undefined = undefined;
  let tertiaryChallenge: Challenge | undefined = undefined;

  if (pendingChallenges.length > 1) {
    const candidateSecondary = pendingChallenges.filter(c => c.id !== mainChallenge?.id);
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

    if (candidateSecondary.length > 1) {
      tertiaryChallenge = candidateSecondary.find(c => c.id !== secondaryChallenge?.id);
    }
  }

  // --------------------------------------------------------------------------
  // PART B: ~25% ACTIVE RECALL (Repaso de Retos Ya Completados)
  // --------------------------------------------------------------------------
  let recallChallenge: Challenge | undefined = undefined;
  let secondaryRecallChallenge: Challenge | undefined = undefined;

  if (completedChallengesList.length > 0) {
    const scoredCompleted = completedChallengesList.map(c => {
      const cSkills = getSkillsForChallenge(c);
      let lowestConf = 1.0;
      for (const cs of cSkills) {
        const m = getSkillMastery(state.skills, cs.skillId);
        if (m.confidence < lowestConf) lowestConf = m.confidence;
      }
      return { challenge: c, lowestConf };
    }).sort((a, b) => a.lowestConf - b.lowestConf);

    const candidatePool = scoredCompleted.slice(0, Math.min(3, scoredCompleted.length));
    recallChallenge = candidatePool[dateHash % candidatePool.length].challenge;

    if (candidatePool.length > 1) {
      secondaryRecallChallenge = candidatePool[(dateHash + 1) % candidatePool.length].challenge;
    }
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
  // PREPARE CANDIDATE ITEMS
  // --------------------------------------------------------------------------
  let mainChallengeItem: DailyMissionItem | undefined = undefined;
  let reviewItem: DailyMissionItem | undefined = undefined;
  let recallItem: DailyMissionItem | undefined = undefined;
  let secondaryChallengeItem: DailyMissionItem | undefined = undefined;
  let extraPracticeChallengeItem: DailyMissionItem | undefined = undefined;
  let conceptItem: DailyMissionItem | undefined = undefined;
  let habitItem: DailyMissionItem | undefined = undefined;
  let peerItem: DailyMissionItem | undefined = undefined;
  let debriefItem: DailyMissionItem | undefined = undefined;
  let secondaryRecallItem: DailyMissionItem | undefined = undefined;

  // 1. Main Challenge Item
  if (mainChallenge) {
    const chSkills = getSkillsForChallenge(mainChallenge);
    const primaryChSkill = chSkills[0]?.skillId || primaryWeakDef.id;

    mainChallengeItem = {
      id: `item-ch-${mainChallenge.id}`,
      type: "challenge",
      title: `Reto Principal (Debilidad): ${mainChallenge.title}`,
      referenceId: mainChallenge.slug || mainChallenge.id,
      targetSkillId: primaryChSkill,
      estimatedMinutes: mainChallenge.estimated_time_minutes || 45,
      completed: false,
      mode: "prove"
    };

    reviewItem = {
      id: `item-norm-${mainChallenge.id}`,
      type: "review",
      title: `Auditoría Norminette v3 & Flags estrictos para ${mainChallenge.title}`,
      referenceId: "norminette",
      targetSkillId: "eng-norminette",
      estimatedMinutes: 15,
      completed: false,
      mode: "learn"
    };
  }

  // 2. Active Recall Item
  if (recallChallenge) {
    const recallSkills = getSkillsForChallenge(recallChallenge);
    const primaryRecallSkill = recallSkills[0]?.skillId || "c-basics-types";

    recallItem = {
      id: `item-recall-${recallChallenge.id}`,
      type: "recall",
      title: `Active Recall (sin mirar): Re-implementar ${recallChallenge.title}`,
      referenceId: recallChallenge.slug || recallChallenge.id,
      targetSkillId: primaryRecallSkill,
      estimatedMinutes: Math.min(30, Math.max(15, Math.round((recallChallenge.estimated_time_minutes || 30) * 0.5))),
      completed: false,
      mode: "prove"
    };
  } else {
    const warmupSkillId = plan.prioritySkills[0]?.id || "term-nav-files";
    recallItem = {
      id: `item-recall-foundations-${dateStr}`,
      type: "recall",
      title: "Active Recall: Repaso mental de comandos y sintaxis sin apuntes",
      referenceId: "shell00-shell01",
      targetSkillId: warmupSkillId,
      estimatedMinutes: 15,
      completed: false,
      mode: "prove"
    };
  }

  // 3. Secondary Challenge Item
  if (secondaryChallenge) {
    const secSkills = getSkillsForChallenge(secondaryChallenge);
    const primarySecSkill = secSkills[0]?.skillId || primaryWeakDef.id;

    secondaryChallengeItem = {
      id: `item-ch2-${secondaryChallenge.id}`,
      type: "challenge",
      title: `Reto Refuerzo: ${secondaryChallenge.title}`,
      referenceId: secondaryChallenge.slug || secondaryChallenge.id,
      targetSkillId: primarySecSkill,
      estimatedMinutes: secondaryChallenge.estimated_time_minutes || 30,
      completed: false,
      mode: "prove"
    };
  }

  // 4. Extra Practice Challenge (for long sessions)
  if (tertiaryChallenge) {
    const tertSkills = getSkillsForChallenge(tertiaryChallenge);
    const tertSkillId = tertSkills[0]?.skillId || primaryWeakDef.id;

    extraPracticeChallengeItem = {
      id: `item-ch3-${tertiaryChallenge.id}`,
      type: "practice",
      title: `Práctica Adicional: ${tertiaryChallenge.title}`,
      referenceId: tertiaryChallenge.slug || tertiaryChallenge.id,
      targetSkillId: tertSkillId,
      estimatedMinutes: tertiaryChallenge.estimated_time_minutes || 30,
      completed: false,
      mode: "prove"
    };
  }

  // 5. Concept Item (Avance)
  if (advanceModule) {
    const modSkills = getSkillsForModule(advanceModule);
    const advanceSkillId = modSkills[0]?.skillId || primaryWeakDef.id;

    conceptItem = {
      id: `item-concept-${advanceModule.id}`,
      type: "concept",
      title: `Avance Curricular: Conceptos clave de ${advanceModule.title}`,
      referenceId: advanceModule.slug || advanceModule.id,
      targetSkillId: advanceSkillId,
      estimatedMinutes: 15,
      completed: false,
      mode: "learn"
    };
  }

  // 6. Habit Item
  if (selectedHabit) {
    const habitSkills = getSkillsForHabit(selectedHabit);
    const habitSkillId = habitSkills[0]?.skillId || "meta-deep-work";

    habitItem = {
      id: `item-habit-${selectedHabit.id}`,
      type: "habit",
      title: `Hábito de Piscina: ${selectedHabit.title}`,
      referenceId: selectedHabit.slug || selectedHabit.id,
      targetSkillId: habitSkillId,
      estimatedMinutes: 15,
      completed: false,
      mode: "learn"
    };
  }

  // 7. Peer Evaluation Simulation Item
  peerItem = {
    id: `item-peer-${dateStr}`,
    type: "peer",
    title: "Simulación Peer-Evaluation: Explicación de código y edge cases con checklist 42",
    referenceId: "peer-evaluation",
    targetSkillId: "eng-peer-evaluation",
    estimatedMinutes: 15,
    completed: false,
    mode: "prove"
  };

  // 8. Technical Debrief Item
  debriefItem = {
    id: `item-debrief-${dateStr}`,
    type: "debrief",
    title: "Debrief Técnico: Registro de fallos, fugas de memoria (Valgrind) y lecciones",
    referenceId: "debrief",
    targetSkillId: "meta-autonomy-search",
    estimatedMinutes: 10,
    completed: false,
    mode: "learn"
  };

  // 9. Secondary Recall Item
  if (secondaryRecallChallenge) {
    const secRecSkills = getSkillsForChallenge(secondaryRecallChallenge);
    secondaryRecallItem = {
      id: `item-recall2-${secondaryRecallChallenge.id}`,
      type: "recall",
      title: `Active Recall complementario: ${secondaryRecallChallenge.title}`,
      referenceId: secondaryRecallChallenge.slug || secondaryRecallChallenge.id,
      targetSkillId: secRecSkills[0]?.skillId || "c-basics-types",
      estimatedMinutes: 15,
      completed: false,
      mode: "prove"
    };
  }

  // --------------------------------------------------------------------------
  // ADJUST AND FIT TO DAILY TIME BUDGET
  // --------------------------------------------------------------------------
  const items = fitMissionItemsToBudget({
    budgetMinutes: dailyBudget,
    mainChallengeItem,
    recallItem,
    reviewItem,
    conceptItem,
    habitItem,
    secondaryChallengeItem,
    extraPracticeChallengeItem,
    peerItem,
    debriefItem,
    secondaryRecallItem
  });

  const targetSkills: string[] = [];
  items.forEach(it => {
    if (it.targetSkillId && !targetSkills.includes(it.targetSkillId)) {
      targetSkills.push(it.targetSkillId);
    }
  });

  const totalMinutes = items.reduce((acc, curr) => acc + curr.estimatedMinutes, 0);

  // --------------------------------------------------------------------------
  // RATIONALE GENERATION
  // --------------------------------------------------------------------------
  let rationale = `Misión del día ajustada a ~${dailyBudget} min (${totalMinutes} min estimados) en etapa ${plan.stageTitle}: ~60% debilidades en '${primaryWeakDef.title}', ~25% active recall y ~15% avance. `;
  if (mainChallenge) {
    rationale += `Reto ancla: '${mainChallenge.title}'. `;
  }
  if (recallChallenge) {
    rationale += `Recall activo: '${recallChallenge.title}'. `;
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

