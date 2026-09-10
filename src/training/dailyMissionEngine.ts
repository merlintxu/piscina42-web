import { 
  DailyMission, 
  DailyMissionItem, 
  TrainingState, 
  SkillCategory,
  getDefaultModeForMissionItemType 
} from "./types";
import { SKILL_DEFINITIONS } from "./config";
import { ContentJSON, UserProgress, Challenge, Module, Resource } from "../types";
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
 * Pedagogical Rules:
 * - DEBRIEF is ALWAYS the last block of the mission.
 * - Total duration must stay at or below budget +10%.
 * - A challenge is never truncated; if the main challenge does not fit, it is skipped
 *   and the session falls back to recall/concept/review items that fit the budget.
 * - Peer/Norminette blocks tied to the main challenge are only included when that
 *   challenge itself is included.
 */
export function fitMissionItemsToBudget(params: FitMissionBudgetParams): DailyMissionItem[] {
  const targetBudget = Math.min(360, Math.max(30, params.budgetMinutes || 90));
  const maxAllowed = Math.round(targetBudget * 1.10);

  const selectedItems: DailyMissionItem[] = [];
  const selectedIds = new Set<string>();

  // Reserve the debrief before selecting any other item so the final mission,
  // including debrief, can never exceed the +10% ceiling.
  const debriefMinutes = params.debriefItem ? params.debriefItem.estimatedMinutes : 0;
  const contentMaxAllowed = Math.max(0, maxAllowed - debriefMinutes);

  const tryAddItem = (item?: DailyMissionItem): boolean => {
    if (!item || selectedIds.has(item.id) || item === params.debriefItem) return false;
    const currentTotal = selectedItems.reduce((acc, curr) => acc + curr.estimatedMinutes, 0);

    if (currentTotal + item.estimatedMinutes <= contentMaxAllowed) {
      selectedItems.push(item);
      selectedIds.add(item.id);
      return true;
    }
    return false;
  };

  // 1. Primary weakness anchor. It is NOT exempt from the time ceiling.
  const mainChallengeAdded = params.mainChallengeItem
    ? tryAddItem(params.mainChallengeItem)
    : false;

  // 2. Active recall item (~25% Spaced Repetition)
  if (params.recallItem) {
    tryAddItem(params.recallItem);
  }

  // 3. Concepts for weak skills
  if (params.conceptItem) {
    tryAddItem(params.conceptItem);
  }

  // 4. Peer evaluation only makes sense if its main challenge was actually done.
  if (mainChallengeAdded && params.peerItem && targetBudget >= 60) {
    tryAddItem(params.peerItem);
  }

  // 5. Norminette/strict-flags review is tied to the main challenge too.
  if (mainChallengeAdded && targetBudget >= 60 && params.reviewItem) {
    tryAddItem(params.reviewItem);
  }

  // 6. Habit for budgets >= 90m
  if (targetBudget >= 90 && params.habitItem) {
    tryAddItem(params.habitItem);
  }

  // 7. Secondary Challenge for budgets >= 120m
  if (targetBudget >= 120 && params.secondaryChallengeItem) {
    tryAddItem(params.secondaryChallengeItem);
  }

  // 8. Large budgets (>= 180m): Extra practice
  if (targetBudget >= 180 && params.extraPracticeChallengeItem) {
    tryAddItem(params.extraPracticeChallengeItem);
  }

  // 9. Fine-grained filler. When the main challenge did not fit, prefer
  // independent recall/concept items instead of challenge-dependent peer/review.
  const fillCandidates = mainChallengeAdded
    ? [
        params.conceptItem,
        params.peerItem,
        params.recallItem,
        params.reviewItem,
        params.habitItem,
        params.secondaryRecallItem,
        params.secondaryChallengeItem
      ]
    : [
        params.recallItem,
        params.conceptItem,
        params.secondaryRecallItem,
        params.habitItem,
        params.secondaryChallengeItem,
        params.extraPracticeChallengeItem
      ];

  let currentTotal = selectedItems.reduce((acc, curr) => acc + curr.estimatedMinutes, 0);
  while (currentTotal < targetBudget - debriefMinutes) {
    const remaining = (targetBudget - debriefMinutes) - currentTotal;
    if (remaining < 5) break;

    let addedAny = false;
    for (const cand of fillCandidates) {
      if (cand && !selectedIds.has(cand.id) && cand !== params.debriefItem) {
        if (currentTotal + cand.estimatedMinutes <= contentMaxAllowed) {
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

  // 10. ALWAYS append DEBRIEF as the LAST BLOCK of the mission.
  // Standard debrief is 10m and the minimum supported budget is 30m.
  if (params.debriefItem) {
    selectedItems.push(params.debriefItem);
    selectedIds.add(params.debriefItem.id);
  }

  return selectedItems;
}

/**
 * Generates an adaptive, deterministic daily training mission reflecting:
 * - ~60% Weaknesses (reforzar habilidades con menor nivel o baja confianza)
 * - ~25% Active Recall (retos ya completados para resolver otra vez sin mirar)
 * - ~15% Curriculum Advance & Concepts (siguiente paso en el temario según el plan de entrenamiento)
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

  // Filter skills with low mastery / low confidence (< 3 level or < 0.7 confidence)
  const lowMasteryOrConfSkills = sortedWeakSkills.filter(s => s.mastery.level < 3 || s.mastery.confidence < 0.7);
  const weakSkillForConcept = lowMasteryOrConfSkills[0]?.def || primaryWeakDef;

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
  // PART C: CONCEPT (Para skills con mastery/confidence bajos - Sin IA)
  // --------------------------------------------------------------------------
  let conceptResource: Resource | undefined = undefined;
  let conceptModule: Module | undefined = undefined;

  if (content.resources && content.resources.length > 0) {
    conceptResource = content.resources.find(r => 
      r.modules && r.modules.some(mId => weakSkillForConcept.relatedModuleIds.includes(mId))
    );
    if (!conceptResource && weakSkillForConcept.category === "c_prog") {
      conceptResource = content.resources.find(r => r.title.toLowerCase().includes("cs50") || r.title.toLowerCase().includes("c"));
    }
  }

  if (!conceptResource && content.modules && content.modules.length > 0) {
    conceptModule = content.modules.find(m => weakSkillForConcept.relatedModuleIds.includes(m.id)) 
      || plan.recommendedModules[0] 
      || content.modules[0];
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
      referenceType: "challenge",
      targetSkillId: primaryChSkill,
      estimatedMinutes: mainChallenge.estimated_time_minutes || 45,
      completed: false,
      mode: "prove",
      description: `Implementa y depura ${mainChallenge.title} enfocado en superar debilidades técnicas en ${primaryWeakDef.title}.`
    };

    reviewItem = {
      id: `item-norm-${mainChallenge.id}`,
      type: "review",
      title: `Auditoría Norminette v3 & Flags estrictos para ${mainChallenge.title}`,
      referenceId: "norminette",
      targetSkillId: "eng-norminette",
      estimatedMinutes: 15,
      completed: false,
      mode: "learn",
      description: "Verifica -Wall -Wextra -Werror, funciones prohibidas y formato Norminette v3."
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
      referenceType: "challenge",
      targetSkillId: primaryRecallSkill,
      estimatedMinutes: Math.min(30, Math.max(15, Math.round((recallChallenge.estimated_time_minutes || 30) * 0.5))),
      completed: false,
      mode: "prove",
      description: `Reescribe ${recallChallenge.title} desde cero sin consultar código previo ni apuntes.`
    };
  } else {
    const warmupSkillId = plan.prioritySkills[0]?.id || "term-nav-files";
    recallItem = {
      id: `item-recall-foundations-${dateStr}`,
      type: "recall",
      title: "Active Recall: Repaso mental de comandos y sintaxis sin apuntes",
      referenceId: "shell00-shell01",
      referenceType: "module",
      targetSkillId: warmupSkillId,
      estimatedMinutes: 15,
      completed: false,
      mode: "prove",
      description: "Recuperación activa de comandos de terminal y reglas sintácticas de C."
    };
  }

  // 3. CONCEPT Item (para skills con mastery/confidence bajos, enlazando a Module o Resource existente sin IA)
  if (conceptResource) {
    conceptItem = {
      id: `item-concept-${conceptResource.id}-${dateStr}`,
      type: "concept",
      title: `Fundamentos Teóricos: ${conceptResource.title} (${weakSkillForConcept.title})`,
      referenceId: conceptResource.id,
      referenceType: "resource",
      externalUrl: conceptResource.url,
      targetSkillId: weakSkillForConcept.id,
      estimatedMinutes: 15,
      completed: false,
      mode: "learn",
      description: conceptResource.description || `Lectura y asimilación conceptual de ${conceptResource.title} para afianzar ${weakSkillForConcept.title}.`
    };
  } else if (conceptModule) {
    conceptItem = {
      id: `item-concept-${conceptModule.id}-${dateStr}`,
      type: "concept",
      title: `Concepto Clave: ${conceptModule.title} (${weakSkillForConcept.title})`,
      referenceId: conceptModule.slug || conceptModule.id,
      referenceType: "module",
      targetSkillId: weakSkillForConcept.id,
      estimatedMinutes: 15,
      completed: false,
      mode: "learn",
      description: `Estudio estructurado de conceptos y dificultades cognitivas en ${conceptModule.title}.`
    };
  }

  // 4. PEER Item (pedir explicar en voz alta el reto realizado, incluir edge cases y decisiones de implementación, mode="prove")
  const peerChallengeTitle = mainChallenge ? mainChallenge.title : (recallChallenge ? recallChallenge.title : "el reto asignado");
  const peerChallengeMod = mainChallenge?.module || "";

  let peerEdgeCases: string[] = [];
  if (peerChallengeMod.includes("c01") || peerChallengeMod.includes("puntero") || peerChallengeMod.includes("c02") || peerChallengeMod.includes("c03")) {
    peerEdgeCases = [
      "Punteros NULL recibidos como argumentos de entrada",
      "Cadenas vacías (\"\\0\") y tamaño límite de buffers",
      "Aritmética de punteros vs indexación por corchetes",
      "Cumplimiento estricto de Norminette v3 (máx 25 líneas, 5 funciones/archivo)"
    ];
  } else if (peerChallengeMod.includes("c04") || peerChallengeMod.includes("c05") || peerChallengeMod.includes("conversion")) {
    peerEdgeCases = [
      "Valor extremo INT_MIN (-2147483648) en ft_putnbr/ft_atoi",
      "Comportamiento con el valor 0 y signos redundantes (+/-)",
      "Límites de recursión (evitar stack overflow y verificar caso base)",
      "Restricción de funciones externas prohibidas"
    ];
  } else if (peerChallengeMod.includes("c07") || peerChallengeMod.includes("asignacion") || peerChallengeMod.includes("memoria")) {
    peerEdgeCases = [
      "Protección obligatoria de malloc (comprobar if (!ptr) return (NULL))",
      "Liberación de memoria con free() en todas las ramas de salida",
      "Comprobación con Valgrind (cero leaks, cero invalid reads/writes)",
      "Asignación de 0 bytes malloc(0)"
    ];
  } else if (peerChallengeMod.includes("shell") || peerChallengeMod.includes("term")) {
    peerEdgeCases = [
      "Permisos de ficheros octales exactos (chmod / umask)",
      "Gestión de espacios en rutas y nombres de ficheros",
      "Redirecciones de stdout/stderr y tuberías compuestas"
    ];
  } else {
    peerEdgeCases = [
      "Punteros NULL y valores frontera (boundaries)",
      "Justificación de decisiones algorítmicas y tipos de datos",
      "Cumplimiento estricto de las normas de estilo 42 (Norminette)"
    ];
  }

  peerItem = {
    id: `item-peer-${mainChallenge ? mainChallenge.id : dateStr}`,
    type: "peer",
    title: `Simulación Peer-Evaluation: Explicar en voz alta ${peerChallengeTitle}`,
    referenceId: mainChallenge ? (mainChallenge.slug || mainChallenge.id) : "peer-evaluation",
    referenceType: "peer",
    targetSkillId: "eng-peer-evaluation",
    estimatedMinutes: 15,
    completed: false,
    mode: "prove",
    description: `Explica en voz alta tu solución línea a línea ante un compañero de 42: defiende cada decisión de implementación (estructuras de control, tipos de datos, punteros) y demuestra el manejo de edge cases críticos.`,
    edgeCases: peerEdgeCases
  };

  // 5. Secondary Challenge Item
  if (secondaryChallenge) {
    const secSkills = getSkillsForChallenge(secondaryChallenge);
    const primarySecSkill = secSkills[0]?.skillId || primaryWeakDef.id;

    secondaryChallengeItem = {
      id: `item-ch2-${secondaryChallenge.id}`,
      type: "challenge",
      title: `Reto Refuerzo: ${secondaryChallenge.title}`,
      referenceId: secondaryChallenge.slug || secondaryChallenge.id,
      referenceType: "challenge",
      targetSkillId: primarySecSkill,
      estimatedMinutes: secondaryChallenge.estimated_time_minutes || 30,
      completed: false,
      mode: "prove",
      description: `Práctica secundaria para consolidar competencias en ${primarySecSkill}.`
    };
  }

  // 6. Extra Practice Challenge (for long sessions)
  if (tertiaryChallenge) {
    const tertSkills = getSkillsForChallenge(tertiaryChallenge);
    const tertSkillId = tertSkills[0]?.skillId || primaryWeakDef.id;

    extraPracticeChallengeItem = {
      id: `item-ch3-${tertiaryChallenge.id}`,
      type: "practice",
      title: `Práctica Adicional: ${tertiaryChallenge.title}`,
      referenceId: tertiaryChallenge.slug || tertiaryChallenge.id,
      referenceType: "challenge",
      targetSkillId: tertSkillId,
      estimatedMinutes: tertiaryChallenge.estimated_time_minutes || 30,
      completed: false,
      mode: "prove"
    };
  }

  // 7. Habit Item
  if (selectedHabit) {
    const habitSkills = getSkillsForHabit(selectedHabit);
    const habitSkillId = habitSkills[0]?.skillId || "meta-deep-work";

    habitItem = {
      id: `item-habit-${selectedHabit.id}`,
      type: "habit",
      title: `Hábito de Piscina: ${selectedHabit.title}`,
      referenceId: selectedHabit.slug || selectedHabit.id,
      referenceType: "habit",
      targetSkillId: habitSkillId,
      estimatedMinutes: 15,
      completed: false,
      mode: "learn",
      description: selectedHabit.description || "Hábito clave de resiliencia y metodología 42."
    };
  }

  // 8. DEBRIEF Item (Último bloque de la misión, guarda difficultyRating 1-5, confidenceRating 1-5, hardestThing?)
  debriefItem = {
    id: `item-debrief-${dateStr}`,
    type: "debrief",
    title: "Debrief de Sesión: Registro de Dificultad y Calibración",
    referenceId: "debrief",
    referenceType: "debrief",
    targetSkillId: "meta-autonomy-search",
    estimatedMinutes: 10,
    completed: false,
    mode: "learn",
    description: "Último bloque: calibra la dificultad (1-5), tu nivel de confianza alcanzado (1-5) y documenta el obstáculo o edge case más complejo de hoy."
  };

  // 9. Secondary Recall Item
  if (secondaryRecallChallenge) {
    const secRecSkills = getSkillsForChallenge(secondaryRecallChallenge);
    secondaryRecallItem = {
      id: `item-recall2-${secondaryRecallChallenge.id}`,
      type: "recall",
      title: `Active Recall complementario: ${secondaryRecallChallenge.title}`,
      referenceId: secondaryRecallChallenge.slug || secondaryRecallChallenge.id,
      referenceType: "challenge",
      targetSkillId: secRecSkills[0]?.skillId || "c-basics-types",
      estimatedMinutes: 15,
      completed: false,
      mode: "prove"
    };
  }

  // --------------------------------------------------------------------------
  // ADJUST AND FIT TO DAILY TIME BUDGET (DEBRIEF is always the last block)
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
  const mainChallengeIncluded = !!mainChallengeItem && items.some(item => item.id === mainChallengeItem?.id);
  const secondaryChallengeIncluded = !!secondaryChallengeItem && items.some(item => item.id === secondaryChallengeItem?.id);
  const recallIncluded = !!recallItem && items.some(item => item.id === recallItem?.id);

  // --------------------------------------------------------------------------
  // RATIONALE GENERATION
  // --------------------------------------------------------------------------
  let rationale = `Misión del día ajustada a ~${dailyBudget} min (${totalMinutes} min estimados) en etapa ${plan.stageTitle}: ~60% debilidades, ~25% active recall, fundamentos y debrief reflexivo. `;
  if (mainChallengeIncluded && mainChallenge) {
    rationale += `Reto ancla: '${mainChallenge.title}'. `;
  } else if (mainChallenge && !mainChallengeIncluded) {
    rationale += `El reto prioritario '${mainChallenge.title}' no cabe completo en el presupuesto de hoy; se sustituye por bloques de refuerzo que sí caben sin recortar ejercicios. `;
  }
  if (recallIncluded && recallChallenge) {
    rationale += `Recall activo: '${recallChallenge.title}'. `;
  }
  if (plan.isBlockedByWeakPointersOrMemory && plan.blockerReason) {
    rationale += `Nota de rigor: ${plan.blockerReason}`;
  }

  const nowIso = new Date().toISOString();

  return {
    date: dateStr,
    mainChallengeId: mainChallengeIncluded ? mainChallenge?.id : undefined,
    secondaryChallengeId: secondaryChallengeIncluded ? secondaryChallenge?.id : undefined,
    habitId: selectedHabit?.id,
    items,
    rationale,
    focusCategory: targetCategory,
    estimatedMinutes: totalMinutes,
    targetSkills,
    completed: false,
    generatedAt: nowIso,
    generationVersion: 3
  };
}

/**
 * Calculates active training streak based on unique consecutive days where mission.completed === true.
 * 
 * Rules:
 * - Deterministic evaluation from recorded dailyMissions.
 * - Counts unique consecutive completed dates leading up to today (or yesterday if today is not completed yet).
 * - Avoids arbitrary counter increments/decrements.
 */
export function calculateTrainingStreak(
  dailyMissions: Record<string, DailyMission> | undefined,
  referenceDateStr?: string
): number {
  if (!dailyMissions || typeof dailyMissions !== "object") return 0;

  const completedDates = new Set<string>();
  for (const [dateStr, mission] of Object.entries(dailyMissions)) {
    if (mission && mission.completed === true) {
      completedDates.add(dateStr);
    }
  }

  if (completedDates.size === 0) return 0;

  const refDateStr = referenceDateStr || getTodayDateString();

  const getDateWithOffset = (baseDateStr: string, offsetDays: number): string => {
    const parts = baseDateStr.split("-").map(Number);
    if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
      return baseDateStr;
    }
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    d.setDate(d.getDate() + offsetDays);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  let streak = 0;

  if (completedDates.has(refDateStr)) {
    // Today's mission is already completed -> count backwards starting from today
    streak = 1;
    let offset = -1;
    while (completedDates.has(getDateWithOffset(refDateStr, offset))) {
      streak += 1;
      offset -= 1;
    }
  } else {
    // Today's mission is pending -> check if yesterday was completed to keep the active streak alive
    const yesterdayStr = getDateWithOffset(refDateStr, -1);
    if (completedDates.has(yesterdayStr)) {
      streak = 1;
      let offset = -2;
      while (completedDates.has(getDateWithOffset(refDateStr, offset))) {
        streak += 1;
        offset -= 1;
      }
    } else {
      streak = 0;
    }
  }

  return streak;
}

/**
 * Counts total unique missions completed across all dates.
 */
export function countCompletedMissions(
  dailyMissions: Record<string, DailyMission> | undefined
): number {
  if (!dailyMissions || typeof dailyMissions !== "object") return 0;
  return Object.values(dailyMissions).filter(m => m && m.completed === true).length;
}
