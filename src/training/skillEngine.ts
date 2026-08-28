import { TrainingState, ReadinessBreakdown, SkillCategory } from "./types";
import { SKILL_DEFINITIONS } from "./config";
import { ContentJSON, UserProgress } from "../types";

export function calculateCountdown(targetDateStr: string) {
  const target = new Date(targetDateStr + "T00:00:00");
  const now = new Date();
  // Set both to start of day for accurate calendar day count
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const weeksRemaining = Math.max(0, Math.floor(diffDays / 7));
  return { daysRemaining: diffDays, weeksRemaining };
}

export function calculateCategoryMastery(
  category: SkillCategory,
  state: TrainingState
): { score: number; currentLevelSum: number; maxLevelSum: number } {
  const catSkills = SKILL_DEFINITIONS.filter(s => s.category === category);
  if (catSkills.length === 0) return { score: 0, currentLevelSum: 0, maxLevelSum: 0 };

  let currentLevelSum = 0;
  let maxLevelSum = 0;
  let weightedPoints = 0;
  let totalWeight = 0;

  for (const def of catSkills) {
    const mastery = state.skills[def.id] || { level: 0, confidence: 0 };
    const level = mastery.level || 0;
    currentLevelSum += level;
    maxLevelSum += def.maxLevel;

    // Weight factor
    const weight = def.weightInReadiness || 4;
    totalWeight += weight * def.maxLevel;
    weightedPoints += weight * level;
  }

  const score = totalWeight > 0 ? Math.round((weightedPoints / totalWeight) * 100) : 0;
  return { score, currentLevelSum, maxLevelSum };
}

export function calculateReadiness(
  state: TrainingState,
  content: ContentJSON,
  progress: UserProgress
): ReadinessBreakdown {
  const { daysRemaining, weeksRemaining } = calculateCountdown(state.profile.targetDate);
  const projectedHoursAvailable = weeksRemaining * (state.profile.availableHoursPerWeek || 15);

  // 1. C Core Mastery (weight 35%)
  const cStats = calculateCategoryMastery("c_prog", state);
  const cMastery = cStats.score;

  // 2. Unix & Git (weight 20%)
  const termStats = calculateCategoryMastery("terminal", state);
  const gitStats = calculateCategoryMastery("git", state);
  const unixAndGit = Math.round((termStats.score + gitStats.score) / 2);

  // 3. Rigor & Norminette (weight 25%)
  const engStats = calculateCategoryMastery("engineering", state);
  const rigorAndNorminette = engStats.score;

  // 4. Examshell Readiness (weight 20%)
  const metaStats = calculateCategoryMastery("meta", state);
  const examCount = Object.keys(progress.completedExams || {}).length;
  const examPassedCount = Object.values(progress.completedExams || {}).filter(e => e.score >= 75).length;
  let examshellScore = metaStats.score * 0.5;
  if (examCount > 0) {
    const examBonus = Math.min(50, examPassedCount * 25 + (examCount - examPassedCount) * 10);
    examshellScore += examBonus;
  }
  const examshellReadiness = Math.min(100, Math.round(examshellScore));

  // Overall conservative composite score (0-100)
  // 35% C + 20% Unix/Git + 25% Rigor + 20% Exams
  let composite = Math.round(
    cMastery * 0.35 +
    unixAndGit * 0.20 +
    rigorAndNorminette * 0.25 +
    examshellReadiness * 0.20
  );

  // Boost slightly if user has diagnostic and active streaks
  if (state.diagnostic) {
    composite = Math.min(100, composite + 2);
  }
  if (state.streakDays >= 7) {
    composite = Math.min(100, composite + 3);
  }

  // Determine Pace Status
  // Rule of thumb: Need ~150-200 hours of quality prep for 42 Piscine
  let paceStatus: "on_track" | "ahead" | "needs_attention" | "critical" = "on_track";
  if (composite >= 70) {
    paceStatus = "ahead";
  } else if (daysRemaining < 30 && composite < 50) {
    paceStatus = "critical";
  } else if (daysRemaining < 60 && composite < 40) {
    paceStatus = "needs_attention";
  } else {
    paceStatus = "on_track";
  }

  return {
    overallScore: Math.min(100, Math.max(0, composite)),
    cMastery,
    unixAndGit,
    rigorAndNorminette,
    examshellReadiness,
    daysRemaining,
    weeksRemaining,
    projectedHoursAvailable,
    paceStatus
  };
}
