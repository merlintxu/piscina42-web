import { 
  TrainingState, 
  SkillMastery, 
  SkillDefinition, 
  TrainingPlanStage, 
  Milestone, 
  TrainingPlan 
} from "./types";
import { SKILL_DEFINITIONS } from "./config";
import { ContentJSON, UserProgress, Module } from "../types";
import { getSkillsForModule } from "./skillMapping";

export interface GenerateTrainingPlanParams {
  currentDate?: Date | string;
  targetDate?: string;
  trainingState: TrainingState;
  content: ContentJSON;
  progress: UserProgress;
}

export const STAGE_CONFIG: Record<TrainingPlanStage, {
  title: string;
  description: string;
  stageSkills: string[];
  keyModules: string[];
}> = {
  FOUNDATION: {
    title: "Fundamentos Unix & Workflow 42",
    description: "Dominio de terminal CLI, permisos octales, pipes, redirecciones y flujo estricto de Git/Vogsphere.",
    stageSkills: ["term-nav-files", "term-permissions", "term-redirection-pipes", "git-basics", "git-vogsphere"],
    keyModules: ["shell00-shell01"]
  },
  CORE_C: {
    title: "C Core & Rigor Norminette",
    description: "Sintaxis C pura, syscall write(1), bucles while, control de flujo y compilación estricta con -Wall -Wextra -Werror.",
    stageSkills: ["c-basics-types", "c-control-flow", "eng-norminette", "eng-compilation-flags"],
    keyModules: ["c00-intro"]
  },
  POINTERS_STRINGS: {
    title: "Punteros, Direcciones & Cadenas",
    description: "Punteros simples y dobles, paso por referencia, aritmética de punteros, arrays y manipulación segura de char* ('\\0').",
    stageSkills: ["c-pointers-basics", "c-pointers-arrays", "c-strings-buffers", "eng-norminette"],
    keyModules: ["c01-punteros", "c02-c03-cadenas"]
  },
  MEMORY: {
    title: "Memoria Dinámica & Algoritmia",
    description: "Asignación en Heap con malloc/free, detección de memory leaks con Valgrind, conversiones numéricas y recursión.",
    stageSkills: ["c-dynamic-memory", "eng-memory-leaks-valgrind", "c-conversions-putnbr", "c-recursion"],
    keyModules: ["c04-c05-conversion-recursion", "c07-asignacion-dinamica"]
  },
  ADVANCED: {
    title: "Línea de Comandos & Estructuras Avanzadas",
    description: "Manejo de argc/argv, parsing CLI, algoritmos recursivos complejos (backtracking) y modularización con Makefiles.",
    stageSkills: ["c-cli-args", "c-dynamic-memory", "c-recursion", "eng-compilation-flags"],
    keyModules: ["c06-cli-args", "c07-asignacion-dinamica"]
  },
  SIMULATION: {
    title: "Simulación Examshell & Resiliencia",
    description: "Simulacros de exámenes de 4 horas en entorno estricto sin internet, gestión del tiempo y defensas peer-to-peer.",
    stageSkills: ["meta-exam-pressure", "eng-peer-evaluation", "meta-autonomy-search", "c-strings-buffers", "c-pointers-basics"],
    keyModules: ["c00-intro", "c01-punteros", "c02-c03-cadenas", "c04-c05-conversion-recursion"]
  },
  FINAL_REVIEW: {
    title: "Consolidación Final & Alta Intensidad",
    description: "Revisión integral rápida de C00 a C07, blindaje contra edge cases (INT_MIN, NULL, leaks), stamina física y mental.",
    stageSkills: ["c-pointers-basics", "c-dynamic-memory", "eng-norminette", "meta-exam-pressure", "eng-memory-leaks-valgrind"],
    keyModules: ["c00-intro", "c01-punteros", "c02-c03-cadenas", "c04-c05-conversion-recursion", "c07-asignacion-dinamica"]
  }
};

/**
 * Pure helper to extract skill mastery safely
 */
export function getSkillMastery(
  skills: Record<string, SkillMastery>, 
  skillId: string
): SkillMastery {
  return skills[skillId] || {
    skillId,
    level: 0,
    confidence: 0,
    evidenceCount: 0,
    lastAssessedAt: new Date().toISOString(),
    history: []
  };
}

/**
 * Stage gate check functions.
 * Stages MUST advance based on demonstrated competence and evidence, NEVER merely due to elapsed time.
 */
export function checkStagePrerequisites(
  skills: Record<string, SkillMastery>,
  progress: UserProgress
): {
  foundationPassed: boolean;
  coreCPassed: boolean;
  pointersPassed: boolean;
  memoryPassed: boolean;
  advancedPassed: boolean;
  simulationPassed: boolean;
  pointersWeak: boolean;
  memoryWeak: boolean;
} {
  const termNav = getSkillMastery(skills, "term-nav-files");
  const termPerm = getSkillMastery(skills, "term-permissions");
  const termPipes = getSkillMastery(skills, "term-redirection-pipes");
  const gitBasics = getSkillMastery(skills, "git-basics");
  const gitVog = getSkillMastery(skills, "git-vogsphere");

  const cBasics = getSkillMastery(skills, "c-basics-types");
  const cControl = getSkillMastery(skills, "c-control-flow");
  const norminette = getSkillMastery(skills, "eng-norminette");
  const compFlags = getSkillMastery(skills, "eng-compilation-flags");

  const cPointers = getSkillMastery(skills, "c-pointers-basics");
  const cArrays = getSkillMastery(skills, "c-pointers-arrays");
  const cStrings = getSkillMastery(skills, "c-strings-buffers");

  const cDynamic = getSkillMastery(skills, "c-dynamic-memory");
  const valgrind = getSkillMastery(skills, "eng-memory-leaks-valgrind");
  const cConversions = getSkillMastery(skills, "c-conversions-putnbr");
  const cRecursion = getSkillMastery(skills, "c-recursion");

  const cCliArgs = getSkillMastery(skills, "c-cli-args");
  const examPressure = getSkillMastery(skills, "meta-exam-pressure");

  // Gate 1: Foundation (Terminal + Git basics)
  const foundationPassed = 
    termNav.level >= 2 &&
    termPerm.level >= 2 &&
    termPipes.level >= 1 &&
    gitBasics.level >= 2 &&
    gitVog.level >= 1;

  // Gate 2: Core C
  const coreCPassed = 
    foundationPassed &&
    cBasics.level >= 2 &&
    cControl.level >= 2 &&
    norminette.level >= 2;

  // Gate 3: Pointers & Strings
  // Pointers are the heart of 42: requires solid mastery
  const pointersWeak = cPointers.level < 2 || (cPointers.level === 2 && cPointers.confidence < 0.4) || cStrings.level < 2;
  const pointersPassed = 
    coreCPassed &&
    !pointersWeak &&
    (cPointers.level >= 3 || (cPointers.level >= 2 && cArrays.level >= 2)) &&
    cStrings.level >= 2;

  // Gate 4: Dynamic Memory & Leaks
  const memoryWeak = cDynamic.level < 2 || valgrind.level < 2;
  const memoryPassed = 
    pointersPassed &&
    !memoryWeak &&
    cDynamic.level >= 2 &&
    valgrind.level >= 2 &&
    cConversions.level >= 2 &&
    cRecursion.level >= 1;

  // Gate 5: Advanced (CLI args & multi-file compilation)
  const advancedPassed = 
    memoryPassed &&
    cCliArgs.level >= 2 &&
    cDynamic.level >= 3 &&
    cStrings.level >= 3;

  // Gate 6: Simulation (Exam readiness)
  const passedExams = Object.values(progress.completedExams || {}).filter(e => e.score >= 75);
  const simulationPassed = 
    advancedPassed &&
    passedExams.length >= 1 &&
    examPressure.level >= 3;

  return {
    foundationPassed,
    coreCPassed,
    pointersPassed,
    memoryPassed,
    advancedPassed,
    simulationPassed,
    pointersWeak,
    memoryWeak
  };
}

/**
 * Deterministically determines the current training stage based on actual competence.
 * Enforces rule: Never advance stage purely due to time if technical foundations (pointers/memory) are weak.
 */
export function determineCurrentStage(
  skills: Record<string, SkillMastery>,
  progress: UserProgress,
  daysRemaining: number
): {
  currentStage: TrainingPlanStage;
  isBlockedByWeakPointersOrMemory: boolean;
  blockerReason?: string;
} {
  const gates = checkStagePrerequisites(skills, progress);

  // Check foundational sequence step by step
  if (!gates.foundationPassed) {
    return {
      currentStage: "FOUNDATION",
      isBlockedByWeakPointersOrMemory: false
    };
  }

  if (!gates.coreCPassed) {
    return {
      currentStage: "CORE_C",
      isBlockedByWeakPointersOrMemory: false
    };
  }

  if (!gates.pointersPassed) {
    const isUrgent = daysRemaining <= 30;
    return {
      currentStage: "POINTERS_STRINGS",
      isBlockedByWeakPointersOrMemory: true,
      blockerReason: isUrgent
        ? "La fecha de la Piscina está próxima pero el dominio de Punteros y Cadenas aún requiere afianzamiento. Es prioritario dominar direcciones de memoria antes de avanzar."
        : "Consolidación de punteros y aritmética de memoria antes de abordar memoria dinámica."
    };
  }

  if (!gates.memoryPassed) {
    const isUrgent = daysRemaining <= 21;
    return {
      currentStage: "MEMORY",
      isBlockedByWeakPointersOrMemory: gates.memoryWeak,
      blockerReason: isUrgent && gates.memoryWeak
        ? "Memoria dinámica (malloc/free) y control de fugas con Valgrind necesitan solidez práctica antes de pasar a simulacros de examen."
        : undefined
    };
  }

  if (!gates.advancedPassed) {
    return {
      currentStage: "ADVANCED",
      isBlockedByWeakPointersOrMemory: false
    };
  }

  if (!gates.simulationPassed) {
    return {
      currentStage: "SIMULATION",
      isBlockedByWeakPointersOrMemory: false
    };
  }

  return {
    currentStage: "FINAL_REVIEW",
    isBlockedByWeakPointersOrMemory: false
  };
}

/**
 * Pure calculation of training intensity
 */
export function determineTrainingIntensity(
  daysRemaining: number,
  readinessScore: number,
  profilePace?: "relaxed" | "standard" | "intensive"
): "relaxed" | "standard" | "intensive" {
  if (profilePace === "intensive") return "intensive";
  if (daysRemaining <= 21 && readinessScore < 70) return "intensive";
  if (daysRemaining <= 45 && readinessScore < 50) return "intensive";
  if (profilePace === "relaxed" && readinessScore >= 60) return "relaxed";
  return "standard";
}

/**
 * Generates deterministic milestones for all stages
 */
export function generateMilestones(
  skills: Record<string, SkillMastery>,
  progress: UserProgress
): Milestone[] {
  const gates = checkStagePrerequisites(skills, progress);

  return [
    {
      id: "ms-foundation",
      stage: "FOUNDATION",
      title: "Hito 1: Flujo Unix & Vogsphere",
      description: "Operar fluidamente en CLI, permisos octales y commits limpios sin archivos temporales.",
      targetCriteria: "Terminal y Git >= Nivel 2 en la matriz de competencias.",
      isCompleted: gates.foundationPassed
    },
    {
      id: "ms-core-c",
      stage: "CORE_C",
      title: "Hito 2: C Core & Norminette 0 Errores",
      description: "Implementación con syscall write(1), control de flujo con bucles while y respeto estricto de Norminette.",
      targetCriteria: "C Basics, Control Flow y Norminette >= Nivel 2.",
      isCompleted: gates.coreCPassed
    },
    {
      id: "ms-pointers",
      stage: "POINTERS_STRINGS",
      title: "Hito 3: Dominio de Punteros & Strings",
      description: "Punteros simples y dobles, arrays en stack y manipulación manual de strings con '\\0'.",
      targetCriteria: "Punteros Básicos y Cadenas >= Nivel 3.",
      isCompleted: gates.pointersPassed
    },
    {
      id: "ms-memory",
      stage: "MEMORY",
      title: "Hito 4: Memoria Dinámica & Valgrind",
      description: "Malloc, free y erradicación total de fugas de memoria (0 leaks) con Valgrind.",
      targetCriteria: "Memoria Dinámica y Valgrind >= Nivel 2, putnbr y recursión afianzados.",
      isCompleted: gates.memoryPassed
    },
    {
      id: "ms-advanced",
      stage: "ADVANCED",
      title: "Hito 5: CLI Args & Algoritmia 42",
      description: "argc/argv, parseo de argumentos CLI y algoritmos de división/combinatoria.",
      targetCriteria: "Argumentos CLI >= Nivel 2 y asignación dinámica avanzada (ft_split).",
      isCompleted: gates.advancedPassed
    },
    {
      id: "ms-simulation",
      stage: "SIMULATION",
      title: "Hito 6: Examshell Aprobado",
      description: "Simulacros de examen de 4 horas aprobados bajo tiempo y sin acceso a internet.",
      targetCriteria: "Al menos 1 examen aprobado >= 75 puntos y Presión Examen >= Nivel 3.",
      isCompleted: gates.simulationPassed
    },
    {
      id: "ms-final-review",
      stage: "FINAL_REVIEW",
      title: "Hito 7: Piscina Ready",
      description: "Consolidación total de competencias técnicas, peer-evaluation y resiliencia mental.",
      targetCriteria: "Readiness técnico >= 75% y todos los módulos C00-C07 cubiertos.",
      isCompleted: gates.simulationPassed && (skills["c-dynamic-memory"]?.level || 0) >= 3
    }
  ];
}

/**
 * Returns prioritized skills for the current stage, sorting weakest skills first.
 */
export function getPrioritySkillsForStage(
  stage: TrainingPlanStage,
  skills: Record<string, SkillMastery>,
  focusSkillIds?: string[]
): SkillDefinition[] {
  const stageSkillIds = STAGE_CONFIG[stage].stageSkills;
  
  // Find matching definitions
  const stageDefs = SKILL_DEFINITIONS.filter(def => stageSkillIds.includes(def.id));

  // Also include user profile focus skills if not already present
  if (focusSkillIds) {
    for (const fId of focusSkillIds) {
      if (!stageDefs.some(d => d.id === fId)) {
        const extraDef = SKILL_DEFINITIONS.find(d => d.id === fId);
        if (extraDef) stageDefs.push(extraDef);
      }
    }
  }

  // Sort: lowest level first, then lowest confidence, then highest weight
  return stageDefs.sort((a, b) => {
    const mastA = getSkillMastery(skills, a.id);
    const mastB = getSkillMastery(skills, b.id);

    if (mastA.level !== mastB.level) {
      return mastA.level - mastB.level;
    }
    if (mastA.confidence !== mastB.confidence) {
      return mastA.confidence - mastB.confidence;
    }
    return b.weightInReadiness - a.weightInReadiness;
  });
}

/**
 * Returns recommended modules for the current stage.
 */
export function getRecommendedModulesForStage(
  stage: TrainingPlanStage,
  content: ContentJSON,
  skills: Record<string, SkillMastery>,
  progress: UserProgress
): Module[] {
  const keyModuleIds = STAGE_CONFIG[stage].keyModules;
  const stageModules = content.modules.filter(m => keyModuleIds.includes(m.id) || keyModuleIds.includes(m.slug));

  // Score modules by how many pending/weak skills they address
  return stageModules.sort((a, b) => {
    const skillsA = getSkillsForModule(a);
    const skillsB = getSkillsForModule(b);

    const calcGap = (matchList: { skillId: string; weight: number }[]) => {
      let gap = 0;
      for (const m of matchList) {
        const mast = getSkillMastery(skills, m.skillId);
        gap += (5 - mast.level) * m.weight * (1.2 - mast.confidence);
      }
      return gap;
    };

    return calcGap(skillsB) - calcGap(skillsA);
  });
}

/**
 * Generates deterministic weekly objectives tailored to current stage and bottlenecks.
 */
export function generateWeeklyObjectives(
  stage: TrainingPlanStage,
  prioritySkills: SkillDefinition[],
  isBlocked: boolean,
  blockerReason?: string
): string[] {
  const objectives: string[] = [];

  if (isBlocked && blockerReason) {
    objectives.push(`🚨 Prioridad Bloqueante: ${blockerReason}`);
  }

  switch (stage) {
    case "FOUNDATION":
      objectives.push("Dominar comandos de terminal (`ls -la`, `chmod` en modos octales y pipes con `grep`).");
      objectives.push("Configurar Git con workflow de commits atómicos y verificar envíos a Vogsphere sin archivos basura.");
      objectives.push("Completar retos de Shell00 y Shell01 con tiempo cronometrado.");
      break;

    case "CORE_C":
      objectives.push("Escribir programas en C usando exclusivamente la syscall `write(1, ...)` de `unistd.h`.");
      objectives.push("Construir bucles `while` y condicionales sin violar los límites de 25 líneas de Norminette.");
      objectives.push("Compilar con flags estrictos (`-Wall -Wextra -Werror`) erradicando todo warning.");
      break;

    case "POINTERS_STRINGS":
      objectives.push("Implementar `ft_swap` y funciones con paso por referencia (`int *`, `int **`).");
      objectives.push("Dominar la naturaleza de cadenas en C (`char *`) y el byte nulo terminador `\\0`.");
      objectives.push("Reescribir funciones estándar (`ft_strlen`, `ft_strcpy`, `ft_strcmp`, `ft_strcat`) con punteros.");
      break;

    case "MEMORY":
      objectives.push("Reservar memoria dinámica en Heap (`malloc`) y verificar siempre retornos `NULL`.");
      objectives.push("Liberar toda la memoria con `free()` y verificar 0 fugas con `valgrind --leak-check=full`.");
      objectives.push("Implementar `ft_putnbr` con recursión y resolver casos límites como `INT_MIN` (-2147483648).");
      break;

    case "ADVANCED":
      objectives.push("Parsear y ordenar parámetros de línea de comandos mediante `argc` y `char **argv`.");
      objectives.push("Implementar `ft_split` con asignación bidimensional y liberación preventiva ante fallos.");
      objectives.push("Estructurar proyectos modulares con Makefiles y reglas `all`, `clean`, `fclean`, `re`.");
      break;

    case "SIMULATION":
      objectives.push("Realizar al menos un simulacro Examshell de 4 horas en entorno cerrado sin internet.");
      objectives.push("Practicar la defensa técnica en peer-evaluations explicando tu código línea a línea.");
      objectives.push("Entrenar la gestión de la frustración y verificación minuciosa antes de invocar `grademe`.");
      break;

    case "FINAL_REVIEW":
      objectives.push("Speed-run de ejercicios clave de C00 a C07 bajo cronómetro.");
      objectives.push("Auditoría de edge cases críticos: punteros NULL, cadenas vacías, desbordamientos de enteros.");
      objectives.push("Ajuste de hábitos: descanso adecuado, hidratación y resistencia para las 8h del examen final.");
      break;
  }

  // Add objective for the top weakest priority skill
  if (prioritySkills.length > 0) {
    const topWeak = prioritySkills[0];
    objectives.push(`Foco individual: Elevar competencia en '${topWeak.title}' hacia el siguiente nivel.`);
  }

  return objectives;
}

/**
 * Main Pure Function: Generates the deterministic training plan.
 */
export function generateTrainingPlan(
  paramsOrCurrentDate: GenerateTrainingPlanParams | Date | string,
  targetDateInput?: string,
  trainingStateInput?: TrainingState,
  contentInput?: ContentJSON,
  progressInput?: UserProgress
): TrainingPlan {
  let currentDate: Date;
  let targetDateStr: string;
  let trainingState: TrainingState;
  let content: ContentJSON;
  let progress: UserProgress;

  if (typeof paramsOrCurrentDate === "object" && "trainingState" in paramsOrCurrentDate) {
    currentDate = paramsOrCurrentDate.currentDate 
      ? new Date(paramsOrCurrentDate.currentDate) 
      : new Date();
    targetDateStr = paramsOrCurrentDate.targetDate || paramsOrCurrentDate.trainingState.profile.targetDate || "2026-10-26";
    trainingState = paramsOrCurrentDate.trainingState;
    content = paramsOrCurrentDate.content;
    progress = paramsOrCurrentDate.progress;
  } else {
    currentDate = paramsOrCurrentDate ? new Date(paramsOrCurrentDate) : new Date();
    targetDateStr = targetDateInput || trainingStateInput?.profile.targetDate || "2026-10-26";
    trainingState = trainingStateInput!;
    content = contentInput!;
    progress = progressInput!;
  }

  // 1. Calculate time metrics
  const target = new Date(targetDateStr + "T00:00:00");
  const diffTime = target.getTime() - currentDate.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const totalWeeks = Math.max(1, Math.ceil(daysRemaining / 7));

  // Current week index (1-based relative to total preparation cycle or profile)
  const currentWeek = Math.max(1, Math.ceil(daysRemaining / 7));

  // 2. Determine current stage based strictly on skill mastery (not elapsed time)
  const { currentStage, isBlockedByWeakPointersOrMemory, blockerReason } = determineCurrentStage(
    trainingState.skills,
    progress,
    daysRemaining
  );

  const stageMeta = STAGE_CONFIG[currentStage];

  // 3. Milestones
  const allMilestones = generateMilestones(trainingState.skills, progress);
  const nextMilestone = allMilestones.find(m => !m.isCompleted) || allMilestones[allMilestones.length - 1];

  // 4. Priority skills & recommendations
  const prioritySkills = getPrioritySkillsForStage(
    currentStage, 
    trainingState.skills, 
    trainingState.profile.focusSkillIds
  );

  const recommendedModules = getRecommendedModulesForStage(
    currentStage,
    content,
    trainingState.skills,
    progress
  );

  // 5. Weekly objectives
  const weeklyObjectives = generateWeeklyObjectives(
    currentStage,
    prioritySkills,
    isBlockedByWeakPointersOrMemory,
    blockerReason
  );

  // 6. Training intensity
  const trainingIntensity = determineTrainingIntensity(
    daysRemaining,
    trainingState.readinessScore,
    trainingState.profile.pace
  );

  return {
    currentStage,
    stageTitle: stageMeta.title,
    stageDescription: stageMeta.description,
    currentWeek,
    totalWeeks,
    daysRemaining,
    weeklyObjectives,
    prioritySkills,
    recommendedModules,
    nextMilestone,
    allMilestones,
    trainingIntensity,
    isBlockedByWeakPointersOrMemory,
    blockerReason
  };
}
