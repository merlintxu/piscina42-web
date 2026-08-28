import { ContentJSON, UserProgress, Phase, Module, Challenge, ExamSimulation, Habit } from "../types";
import { getTodayDateStr, calculateHabitStreak } from "./storage";

export interface DifficultyStats {
  total: number;
  completed: number;
  pct: number;
}

export interface GlobalProgressSummary {
  totalChallenges: number;
  completedChallenges: number;
  percentage: number;
  byDifficulty: {
    easy: DifficultyStats;
    medium: DifficultyStats;
    hard: DifficultyStats;
  };
  totalModules: number;
  completedModules: number;
  totalPhases: number;
  completedPhases: number;
  totalExams: number;
  completedExams: number;
  activeHabitsCount: number;
  totalHabitsCount: number;
  bestStreak: number;
}

export interface ModuleProgressSummary {
  module: Module;
  totalChallenges: number;
  completedChallenges: number;
  percentage: number;
  isCompleted: boolean;
  status: "not_started" | "in_progress" | "completed";
  challenges: Challenge[];
  completedList: Challenge[];
  pendingList: Challenge[];
}

export interface PhaseProgressSummary {
  phase: Phase;
  totalChallenges: number;
  completedChallenges: number;
  percentage: number;
  isCompleted: boolean;
  status: "not_started" | "in_progress" | "completed";
  modules: ModuleProgressSummary[];
  totalModules: number;
  completedModules: number;
}

export interface ExamProgressItem {
  exam: ExamSimulation;
  isCompleted: boolean;
  score?: number;
  completedAt?: string;
  isPassed: boolean;
}

export interface ExamsProgressSummary {
  totalExams: number;
  completedCount: number;
  passedCount: number;
  averageScore: number;
  bestScore: number;
  exams: ExamProgressItem[];
}

export interface HabitActivityDay {
  dateStr: string;
  dayName: string;
  formattedDate: string;
  count: number;
  isToday: boolean;
  completedHabitIds: string[];
}

export interface HabitActivitySummary {
  days: HabitActivityDay[];
  weeklyCheckins: number;
  maxStreak: number;
  activeHabitsCount: number;
  totalHabitsCount: number;
}

export interface NextChallengeInfo {
  challenge: Challenge;
  module: Module;
  phase?: Phase;
}

/**
 * Retrieves all challenges that belong to a module.
 */
export function getChallengesForModule(module: Module, allChallenges: Challenge[]): Challenge[] {
  // If module explicitly lists challenges
  if (module.challenges && module.challenges.length > 0) {
    const list: Challenge[] = [];
    for (const ref of module.challenges) {
      const found = allChallenges.find((c) => c.id === ref || c.slug === ref);
      if (found && !list.some((item) => item.id === found.id)) {
        list.push(found);
      }
    }
    // Also include any challenges whose module property matches mod id/slug
    for (const ch of allChallenges) {
      if ((ch.module === module.id || ch.module === module.slug) && !list.some((item) => item.id === ch.id)) {
        list.push(ch);
      }
    }
    return list;
  }

  // Fallback: match by module property
  return allChallenges.filter((c) => c.module === module.id || c.module === module.slug);
}

/**
 * Calculates progress for a single module.
 */
export function calculateModuleProgress(
  module: Module,
  allChallenges: Challenge[],
  userCompletedIds: string[]
): ModuleProgressSummary {
  const challenges = getChallengesForModule(module, allChallenges);
  const total = challenges.length;
  const completedList = challenges.filter((c) => userCompletedIds.includes(c.id));
  const pendingList = challenges.filter((c) => !userCompletedIds.includes(c.id));
  const completedCount = completedList.length;
  const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const isCompleted = total > 0 && completedCount === total;

  let status: "not_started" | "in_progress" | "completed" = "not_started";
  if (isCompleted) {
    status = "completed";
  } else if (completedCount > 0) {
    status = "in_progress";
  }

  return {
    module,
    totalChallenges: total,
    completedChallenges: completedCount,
    percentage,
    isCompleted,
    status,
    challenges,
    completedList,
    pendingList,
  };
}

/**
 * Calculates progress for a single phase.
 */
export function calculatePhaseProgress(
  phase: Phase,
  content: ContentJSON,
  userCompletedIds: string[]
): PhaseProgressSummary {
  // Find modules belonging to this phase
  const phaseModules: Module[] = [];
  if (phase.modules && phase.modules.length > 0) {
    for (const mRef of phase.modules) {
      const found = content.modules.find((m) => m.id === mRef || m.slug === mRef);
      if (found && !phaseModules.some((item) => item.id === found.id)) {
        phaseModules.push(found);
      }
    }
  }
  for (const m of content.modules) {
    if ((m.phase === phase.id || m.phase === phase.slug) && !phaseModules.some((item) => item.id === m.id)) {
      phaseModules.push(m);
    }
  }

  // Sort modules by order if present
  phaseModules.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const moduleSummaries = phaseModules.map((m) =>
    calculateModuleProgress(m, content.challenges, userCompletedIds)
  );

  // Aggregate unique challenges for this phase
  const challengeMap = new Map<string, Challenge>();
  moduleSummaries.forEach((ms) => {
    ms.challenges.forEach((c) => challengeMap.set(c.id, c));
  });

  // Also include any challenge directly having phase matching this phase
  content.challenges.forEach((c) => {
    if (c.phase === phase.id || c.phase === phase.slug) {
      challengeMap.set(c.id, c);
    }
  });

  const totalChallenges = challengeMap.size;
  let completedChallenges = 0;
  challengeMap.forEach((c) => {
    if (userCompletedIds.includes(c.id)) {
      completedChallenges++;
    }
  });

  const percentage = totalChallenges > 0 ? Math.round((completedChallenges / totalChallenges) * 100) : 0;
  const isCompleted = totalChallenges > 0 && completedChallenges === totalChallenges;
  const completedModules = moduleSummaries.filter((m) => m.isCompleted).length;

  let status: "not_started" | "in_progress" | "completed" = "not_started";
  if (isCompleted) {
    status = "completed";
  } else if (completedChallenges > 0) {
    status = "in_progress";
  }

  return {
    phase,
    totalChallenges,
    completedChallenges,
    percentage,
    isCompleted,
    status,
    modules: moduleSummaries,
    totalModules: moduleSummaries.length,
    completedModules,
  };
}

/**
 * Calculates global progress statistics across challenges, modules, phases, habits, and exams.
 */
export function calculateGlobalProgress(content: ContentJSON, progress: UserProgress): GlobalProgressSummary {
  const userCompleted = progress.completedChallenges || [];
  const totalChallenges = content.challenges.length;
  const completedChallenges = content.challenges.filter((c) => userCompleted.includes(c.id)).length;
  const percentage = totalChallenges > 0 ? Math.round((completedChallenges / totalChallenges) * 100) : 0;

  // By difficulty
  const difficulties: ("easy" | "medium" | "hard")[] = ["easy", "medium", "hard"];
  const byDifficulty = difficulties.reduce(
    (acc, diff) => {
      const diffChallenges = content.challenges.filter((c) => c.difficulty === diff);
      const total = diffChallenges.length;
      const completed = diffChallenges.filter((c) => userCompleted.includes(c.id)).length;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      acc[diff] = { total, completed, pct };
      return acc;
    },
    {} as Record<"easy" | "medium" | "hard", DifficultyStats>
  );

  // Modules summary
  const moduleSummaries = content.modules.map((m) =>
    calculateModuleProgress(m, content.challenges, userCompleted)
  );
  const totalModules = moduleSummaries.length;
  const completedModules = moduleSummaries.filter((m) => m.isCompleted).length;

  // Phases summary
  const phaseSummaries = content.phases.map((p) => calculatePhaseProgress(p, content, userCompleted));
  const totalPhases = phaseSummaries.length;
  const completedPhases = phaseSummaries.filter((p) => p.isCompleted).length;

  // Exams summary
  const totalExams = content.exams.length;
  const completedExams = Object.keys(progress.completedExams || {}).length;

  // Habits best streak
  let bestStreak = 0;
  if (progress.habitHistory) {
    Object.values(progress.habitHistory).forEach((history) => {
      const s = calculateHabitStreak(history);
      if (s > bestStreak) bestStreak = s;
    });
  }
  if (bestStreak === 0 && progress.habitStreaks) {
    Object.values(progress.habitStreaks).forEach((s) => {
      if (s > bestStreak) bestStreak = s;
    });
  }

  return {
    totalChallenges,
    completedChallenges,
    percentage,
    byDifficulty,
    totalModules,
    completedModules,
    totalPhases,
    completedPhases,
    totalExams,
    completedExams,
    activeHabitsCount: (progress.activeHabits || []).length,
    totalHabitsCount: content.habits.length,
    bestStreak,
  };
}

/**
 * Calculates exam statistics and results.
 */
export function calculateExamsProgress(content: ContentJSON, progress: UserProgress): ExamsProgressSummary {
  const completedExamsRecord = progress.completedExams || {};
  let totalScore = 0;
  let scoredCount = 0;
  let bestScore = 0;
  let passedCount = 0;

  const exams: ExamProgressItem[] = content.exams.map((exam) => {
    const record = completedExamsRecord[exam.id];
    const isCompleted = Boolean(record);
    const score = record ? record.score : undefined;
    const completedAt = record ? record.completedAt : undefined;
    const isPassed = typeof score === "number" && score >= 75;

    if (typeof score === "number") {
      totalScore += score;
      scoredCount++;
      if (score > bestScore) bestScore = score;
      if (isPassed) passedCount++;
    }

    return {
      exam,
      isCompleted,
      score,
      completedAt,
      isPassed,
    };
  });

  const completedCount = scoredCount;
  const averageScore = scoredCount > 0 ? Math.round(totalScore / scoredCount) : 0;

  return {
    totalExams: content.exams.length,
    completedCount,
    passedCount,
    averageScore,
    bestScore,
    exams,
  };
}

/**
 * Calculates habit activity over the last 7 calendar days.
 */
export function calculateHabitActivity(content: ContentJSON, progress: UserProgress): HabitActivitySummary {
  const days: HabitActivityDay[] = [];
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const monthNames = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let weeklyCheckins = 0;

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const dayName = dayNames[d.getDay()];
    const formattedDate = `${d.getDate()} ${monthNames[d.getMonth()]}`;

    const completedHabitIds: string[] = [];
    if (progress.habitHistory) {
      Object.entries(progress.habitHistory).forEach(([habitId, historyList]) => {
        if (historyList && historyList.includes(dateStr)) {
          completedHabitIds.push(habitId);
        }
      });
    }

    const count = completedHabitIds.length;
    weeklyCheckins += count;

    days.push({
      dateStr,
      dayName,
      formattedDate,
      count,
      isToday: i === 0,
      completedHabitIds,
    });
  }

  let maxStreak = 0;
  if (progress.habitHistory) {
    Object.values(progress.habitHistory).forEach((history) => {
      const s = calculateHabitStreak(history);
      if (s > maxStreak) maxStreak = s;
    });
  }
  if (maxStreak === 0 && progress.habitStreaks) {
    Object.values(progress.habitStreaks).forEach((s) => {
      if (s > maxStreak) maxStreak = s;
    });
  }

  return {
    days,
    weeklyCheckins,
    maxStreak,
    activeHabitsCount: (progress.activeHabits || []).length,
    totalHabitsCount: content.habits.length,
  };
}

/**
 * Finds the next pending challenge according to the curriculum hierarchy:
 * Phases (ordered) -> Modules (ordered) -> Challenges (ordered).
 */
export function getNextPendingChallenge(
  content: ContentJSON,
  progress: UserProgress
): NextChallengeInfo | null {
  const userCompleted = progress.completedChallenges || [];

  // Sort phases by order
  const sortedPhases = [...content.phases].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  for (const phase of sortedPhases) {
    // Get phase modules
    const phaseModules: Module[] = [];
    if (phase.modules && phase.modules.length > 0) {
      for (const mRef of phase.modules) {
        const found = content.modules.find((m) => m.id === mRef || m.slug === mRef);
        if (found && !phaseModules.some((item) => item.id === found.id)) {
          phaseModules.push(found);
        }
      }
    }
    for (const m of content.modules) {
      if ((m.phase === phase.id || m.phase === phase.slug) && !phaseModules.some((item) => item.id === m.id)) {
        phaseModules.push(m);
      }
    }
    phaseModules.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    for (const module of phaseModules) {
      const moduleChallenges = getChallengesForModule(module, content.challenges);
      for (const ch of moduleChallenges) {
        if (!userCompleted.includes(ch.id)) {
          return {
            challenge: ch,
            module,
            phase,
          };
        }
      }
    }
  }

  // Fallback: Check any remaining challenges not reached in hierarchy
  for (const ch of content.challenges) {
    if (!userCompleted.includes(ch.id)) {
      const module = content.modules.find((m) => m.id === ch.module || m.slug === ch.module) || content.modules[0];
      const phase = content.phases.find((p) => p.id === ch.phase || p.slug === ch.phase || p.id === module?.phase);
      return {
        challenge: ch,
        module: module || {
          id: ch.module,
          slug: ch.module,
          title: ch.module,
          phase: "fase1",
          level: "basic",
          concepts: [],
          cognitive_difficulties: [],
          challenges: [ch.id],
          resources: [],
          body: "",
        },
        phase,
      };
    }
  }

  return null;
}
