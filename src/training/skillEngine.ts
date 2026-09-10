import { 
  TrainingState, 
  ReadinessBreakdown, 
  SkillCategory, 
  SkillMastery, 
  SkillEvidence, 
  SkillLevel 
} from "./types";
import { SKILL_DEFINITIONS } from "./config";
import { ContentJSON, UserProgress } from "../types";
import { calculateTrainingStreak, countCompletedMissions } from "./dailyMissionEngine";

/**
 * Pure central function to recalculate a SkillMastery object based on its history and evidence.
 * 
 * Rules:
 * 1. NO raw evidenceCount mapping to levels.
 * 2. Diagnostic provides initial theoretical baseline (weight 1.0), and diagnostic alone can NEVER exceed Level 3.
 * 3. Completed challenges provide practical evidence (mode="learn" | "prove", weight 1.5).
 * 4. Passed exams (score >= 75) provide high-rigor evidence (mode="prove", weight 2.5). Failed exams (< 50) penalize.
 * 5. Missions / habits do NOT automatically increase technical skill mastery.
 * 6. Evidence count increases confidence, but does not produce levels mechanically.
 * 7. Mastery can rise OR fall depending on recent performance and weighted evidence scores.
 * 8. All historical evidences are strictly preserved.
 */
export function recalculateSkillMastery(
  skillIdOrMastery: string | SkillMastery | { skillId: string; history?: SkillEvidence[]; lastAssessedAt?: string },
  historyInput?: SkillEvidence[],
  lastAssessedAtInput?: string
): SkillMastery {
  let skillId: string;
  let history: SkillEvidence[];
  let lastAssessedAt: string;

  if (typeof skillIdOrMastery === "string") {
    skillId = skillIdOrMastery;
    history = historyInput || [];
    lastAssessedAt = lastAssessedAtInput || (history.length > 0 ? history[history.length - 1].timestamp : new Date().toISOString());
  } else {
    skillId = skillIdOrMastery.skillId;
    history = historyInput || skillIdOrMastery.history || [];
    lastAssessedAt = lastAssessedAtInput || skillIdOrMastery.lastAssessedAt || (history.length > 0 ? history[history.length - 1].timestamp : new Date().toISOString());
  }

  const def = SKILL_DEFINITIONS.find(s => s.id === skillId);
  const maxAllowedLevel: SkillLevel = (def?.maxLevel || 5) as SkillLevel;

  // If no history exists, return baseline level 0
  if (!history || history.length === 0) {
    return {
      skillId,
      level: 0,
      confidence: 0,
      evidenceCount: 0,
      lastAssessedAt,
      history: []
    };
  }

  // Filter out non-technical evidences (e.g. daily missions, habits)
  // Requirement: "mission completada NO aumenta automáticamente mastery técnico", "hábitos NO aumentan mastery técnico"
  const nonMissionEvidences = history.filter(e => e.sourceType !== "mission");

  if (nonMissionEvidences.length === 0) {
    return {
      skillId,
      level: 0,
      confidence: 0,
      evidenceCount: history.length,
      lastAssessedAt,
      history: [...history]
    };
  }

  // Find the latest diagnostic evidence to serve as the active diagnostic baseline
  const diagnosticEvidences = nonMissionEvidences.filter(e => e.sourceType === "diagnostic");
  const latestDiagnostic = diagnosticEvidences.length > 0
    ? [...diagnosticEvidences].sort((a, b) => (new Date(b.timestamp).getTime() || 0) - (new Date(a.timestamp).getTime() || 0))[0]
    : null;

  // Active evidences for level calculation: non-diagnostic evidences + ONLY the latest diagnostic as baseline
  // This satisfies: "conservar diagnósticos anteriores en el historial de evidencias; el diagnóstico más reciente sustituye al baseline diagnóstico"
  const activeEvidences = nonMissionEvidences.filter(e => {
    if (e.sourceType !== "diagnostic") return true;
    return e === latestDiagnostic;
  });

  // Sort active evidences chronologically
  const sorted = [...activeEvidences].sort((a, b) => {
    const tA = new Date(a.timestamp).getTime() || 0;
    const tB = new Date(b.timestamp).getTime() || 0;
    return tA - tB;
  });

  const N = sorted.length;
  let totalWeightedScore = 0;
  let totalEffectiveWeight = 0;

  let diagnosticOnly = true;
  let practicalChallengesCount = 0;
  let examCount = 0;
  let passedExamCount = 0;
  let latestExamScore: number | null = null;

  for (let i = 0; i < N; i++) {
    const ev = sorted[i];
    
    // Score normalization [0, 100]
    let score = typeof ev.score === "number" ? Math.max(0, Math.min(100, ev.score)) : 100;
    
    // Base weight by source type
    let baseWeight = 1.0;
    if (ev.sourceType === "exam") {
      baseWeight = 2.5;
      diagnosticOnly = false;
      examCount += 1;
      latestExamScore = score;
      if (score >= 75) passedExamCount += 1;
    } else if (ev.sourceType === "challenge") {
      baseWeight = 1.5;
      diagnosticOnly = false;
      practicalChallengesCount += 1;
    } else if (ev.sourceType === "diagnostic") {
      baseWeight = 1.0;
    } else if (ev.sourceType === "manual") {
      baseWeight = 1.0;
      diagnosticOnly = false;
    }

    if (ev.weight !== undefined && ev.weight > 0) {
      baseWeight = ev.weight;
    }

    // Independence factor [0.2 - 1.0]
    const independence = ev.independence !== undefined 
      ? Math.max(0.2, Math.min(1.0, ev.independence))
      : (ev.mode === "prove" ? 1.0 : 0.8);

    // Recency factor: newer evidences have higher weighting [0.6 to 1.0]
    const recency = 0.6 + 0.4 * ((i + 1) / N);

    const effectiveWeight = baseWeight * independence * recency;

    totalWeightedScore += score * effectiveWeight;
    totalEffectiveWeight += effectiveWeight;
  }

  const performanceScore = totalEffectiveWeight > 0 
    ? Math.round(totalWeightedScore / totalEffectiveWeight) 
    : 0;

  // Level determination:
  let calculatedLevel: SkillLevel = 0;

  if (diagnosticOnly) {
    // Diagnostic alone can NEVER exceed Level 3
    if (performanceScore >= 85) calculatedLevel = 3;
    else if (performanceScore >= 60) calculatedLevel = 2;
    else if (performanceScore >= 30) calculatedLevel = 1;
    else calculatedLevel = 0;
  } else {
    // Has practical and/or exam evidence
    // Level 5: High performance (>=85), multiple challenges, passed exam or exceptional practical autonomy
    if (
      performanceScore >= 85 &&
      practicalChallengesCount >= 2 &&
      (passedExamCount >= 1 || practicalChallengesCount >= 4) &&
      (latestExamScore === null || latestExamScore >= 70)
    ) {
      calculatedLevel = 5;
    } 
    // Level 4: Solid performance (>=70), at least 2 practical challenges or 1 passed exam
    else if (
      performanceScore >= 70 &&
      (practicalChallengesCount >= 2 || passedExamCount >= 1) &&
      (latestExamScore === null || latestExamScore >= 50)
    ) {
      calculatedLevel = 4;
    }
    // Level 3: Competent (>=50), has at least 1 practical challenge or solid diagnostic baseline
    else if (
      performanceScore >= 50 &&
      (practicalChallengesCount >= 1 || passedExamCount >= 1 || performanceScore >= 75) &&
      (latestExamScore === null || latestExamScore >= 40)
    ) {
      calculatedLevel = 3;
    }
    // Level 2: Basic practical or standard diagnostic (>=30)
    else if (performanceScore >= 30) {
      calculatedLevel = 2;
    }
    // Level 1: Initial familiarity (>=15)
    else if (performanceScore >= 15) {
      calculatedLevel = 1;
    }
    // Level 0: Under 15 or poor scores
    else {
      calculatedLevel = 0;
    }
  }

  // Cap level at skill's defined maxLevel (typically 5)
  calculatedLevel = Math.min(calculatedLevel, maxAllowedLevel) as SkillLevel;

  // Calculate confidence [0.0 - 1.0]
  // Confidence grows with evidence count and diversity, but does not mechanically alter level
  const baseCountConfidence = Math.min(0.5, 0.15 * Math.sqrt(sorted.length));
  let sourceDiversityBonus = 0;
  if (!diagnosticOnly && sorted.some(e => e.sourceType === "diagnostic")) sourceDiversityBonus += 0.15;
  if (practicalChallengesCount > 0) sourceDiversityBonus += 0.15;
  if (sorted.some(e => e.mode === "prove" || e.sourceType === "exam")) sourceDiversityBonus += 0.20;

  // Consistency penalty if recent exam failed badly
  let consistencyMultiplier = 1.0;
  if (latestExamScore !== null && latestExamScore < 50) {
    consistencyMultiplier = 0.75;
  }

  const confidence = Math.max(
    0.1,
    Math.min(1.0, Math.round((baseCountConfidence + sourceDiversityBonus) * consistencyMultiplier * 100) / 100)
  );

  return {
    skillId,
    level: calculatedLevel,
    confidence,
    evidenceCount: history.length,
    lastAssessedAt,
    history: [...history]
  };
}

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
  const completedExamsList = Object.values(progress.completedExams || {});
  const passedExamsList = completedExamsList.filter(e => e.score >= 75);
  
  // Base readiness from meta skills
  let examshellScore = metaStats.score * 0.5;
  // A passed exam increases exam readiness; failed attempts do NOT add technical points
  if (passedExamsList.length > 0) {
    const avgPassedScore = passedExamsList.reduce((acc, e) => acc + e.score, 0) / passedExamsList.length;
    const passedBonus = Math.min(50, (passedExamsList.length * 25) * (avgPassedScore / 100));
    examshellScore += passedBonus;
  }
  const examshellReadiness = Math.min(100, Math.round(examshellScore));

  // Pure technical readiness (0-100):
  // 35% C + 20% Unix/Git + 25% Rigor + 20% Exams
  // NO direct bonuses for diagnostic completion or streak >= 7 to prevent inflation
  const technicalReadiness = Math.min(100, Math.max(0, Math.round(
    cMastery * 0.35 +
    unixAndGit * 0.20 +
    rigorAndNorminette * 0.25 +
    examshellReadiness * 0.20
  )));

  // Separate Training Consistency Metric (0-100):
  // Measures behavioral consistency based purely on confirmed accomplishments:
  // 1. Real consecutive daily streak from calculateTrainingStreak
  // 2. Verified completed daily missions (DailyMission.completed === true)
  // 3. Verified habit check-in history (completedHabitDays / habitHistory)
  const realStreak = calculateTrainingStreak(state.dailyMissions);
  const realCompletedMissions = countCompletedMissions(state.dailyMissions);

  // Real habit check-in occurrences across all habits
  let realHabitCheckins = 0;
  const habitIds = new Set([
    ...Object.keys(progress.completedHabitDays || {}),
    ...Object.keys(progress.habitHistory || {})
  ]);
  for (const habitId of habitIds) {
    const daysCount = progress.completedHabitDays?.[habitId] || 0;
    const historyCount = Array.isArray(progress.habitHistory?.[habitId]) ? progress.habitHistory[habitId].length : 0;
    realHabitCheckins += Math.max(daysCount, historyCount);
  }

  const streakPoints = Math.min(40, realStreak * 5.7);
  const missionPoints = Math.min(35, realCompletedMissions * 5);
  const habitPoints = Math.min(25, realHabitCheckins * 2.5);
  const trainingConsistency = Math.min(100, Math.max(0, Math.round(streakPoints + missionPoints + habitPoints)));

  // overallScore reflects technical readiness directly
  const overallScore = technicalReadiness;

  // Determine Pace Status
  // Rule of thumb: Need ~150-200 hours of quality prep for 42 Piscine
  let paceStatus: "on_track" | "ahead" | "needs_attention" | "critical" = "on_track";
  if (overallScore >= 70) {
    paceStatus = "ahead";
  } else if (daysRemaining < 30 && overallScore < 50) {
    paceStatus = "critical";
  } else if (daysRemaining < 60 && overallScore < 40) {
    paceStatus = "needs_attention";
  } else {
    paceStatus = "on_track";
  }

  return {
    overallScore,
    technicalReadiness,
    trainingConsistency,
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
