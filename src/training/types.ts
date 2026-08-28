import { Module } from "../types";

export type SkillCategory = "terminal" | "git" | "c_prog" | "engineering" | "meta";

export type SkillLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface SkillLevelCriterion {
  level: SkillLevel;
  label: string;
  criteria: string;
}

export interface SkillDefinition {
  id: string;
  title: string;
  category: SkillCategory;
  description: string;
  maxLevel: 5;
  levels: SkillLevelCriterion[];
  relatedModuleIds: string[];
  relatedChallengeIds: string[];
  weightInReadiness: number; // weight multiplier for calculating overall readiness
}

export type TrainingMode = "learn" | "prove";

export interface SkillEvidence {
  sourceType: "challenge" | "diagnostic" | "exam" | "mission" | "manual";
  sourceId: string;
  timestamp: string;
  score?: number; // e.g., 0 to 100 or 1 for pass
  notes?: string;
  mode?: TrainingMode; // "learn" | "prove"
  independence?: number; // e.g., 0 to 1 or 1 to 5
  weight?: number; // custom weight multiplier
}

export interface SkillMastery {
  skillId: string;
  level: SkillLevel; // 0 to 5
  confidence: number; // 0.0 to 1.0
  evidenceCount: number;
  lastAssessedAt: string;
  history?: SkillEvidence[];
}

export interface TrainingProfile {
  availableHoursPerWeek: number; // e.g. 10, 15, 25, 40
  targetDate: string; // ISO format: "2026-10-26"
  pace: "relaxed" | "standard" | "intensive";
  focusSkillIds: string[];
  levelPreference: "guided" | "autonomous";
  dailyCommitmentMinutes: number; // e.g. 60, 120
}

export interface DiagnosticOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface DiagnosticQuestion {
  id: string;
  skillId: string;
  category: SkillCategory;
  title: string;
  question: string;
  codeSnippet?: string;
  options: DiagnosticOption[];
  difficulty: "basic" | "intermediate" | "advanced";
  points: number;
}

export interface DiagnosticSkillScore {
  skillId: string;
  skillTitle: string;
  category: SkillCategory;
  correct: number;
  total: number;
  percentage: number;
  calculatedLevel: SkillLevel;
}

export interface DiagnosticResult {
  completedAt: string;
  score: number; // total correct questions
  totalQuestions: number;
  percentage: number;
  skillScores: Record<string, DiagnosticSkillScore>;
  categoryScores: Record<SkillCategory, number>; // category -> percentage
  answers: Record<string, string>; // questionId -> selectedOptionId
  recommendations: string[];
  weakestSkills: string[];
  strongestSkills: string[];
}

export type DailyMissionItemType =
  | "warmup"
  | "recall"
  | "concept"
  | "practice"
  | "challenge"
  | "peer"
  | "debrief"
  | "exam"
  | "habit"
  | "review";

export type DailyMissionItemMode = "learn" | "prove";

export function getDefaultModeForMissionItemType(type: DailyMissionItemType): DailyMissionItemMode {
  switch (type) {
    case "concept":
    case "practice":
    case "debrief":
    case "warmup":
    case "review":
    case "habit":
      return "learn";
    case "recall":
    case "exam":
    case "peer":
    case "challenge":
      return "prove";
    default:
      return "learn";
  }
}

export interface DailyMissionDebrief {
  date: string;
  difficultyRating: number; // 1 to 5
  confidenceRating: number; // 1 to 5
  hardestThing?: string;
  completedAt: string;
}

export interface DailyMissionItem {
  id: string;
  type: DailyMissionItemType;
  title: string;
  referenceId: string;
  targetSkillId: string;
  estimatedMinutes: number;
  completed: boolean;
  mode?: DailyMissionItemMode;
  description?: string;
  referenceType?: "module" | "resource" | "challenge" | "habit" | "exam" | "peer" | "debrief";
  externalUrl?: string;
  edgeCases?: string[];
  debriefData?: DailyMissionDebrief;
}

export interface DailyMission {
  date: string; // YYYY-MM-DD
  mainChallengeId?: string;
  secondaryChallengeId?: string;
  habitId?: string;
  examId?: string;
  items: DailyMissionItem[];
  rationale: string;
  focusCategory: SkillCategory;
  estimatedMinutes: number;
  targetSkills: string[];
  completed: boolean;
  completedAt?: string;
  debrief?: DailyMissionDebrief;
}

export interface ReadinessBreakdown {
  overallScore: number; // 0 to 100 (pure technical readiness)
  technicalReadiness: number; // 0 to 100 (pure technical competence)
  trainingConsistency: number; // 0 to 100 (streaks, missions, habits consistency)
  cMastery: number; // 0 to 100
  unixAndGit: number; // 0 to 100
  rigorAndNorminette: number; // 0 to 100
  examshellReadiness: number; // 0 to 100
  daysRemaining: number;
  weeksRemaining: number;
  projectedHoursAvailable: number;
  paceStatus: "on_track" | "ahead" | "needs_attention" | "critical";
}

export interface TrainingState {
  version: number;
  profile: TrainingProfile;
  diagnostic: DiagnosticResult | null;
  skills: Record<string, SkillMastery>;
  dailyMissions: Record<string, DailyMission>;
  debriefs?: Record<string, DailyMissionDebrief>;
  lastTrainedDate: string | null;
  streakDays: number;
  readinessScore: number;
  totalMissionsCompleted: number;
}

export type TrainingPlanStage =
  | "FOUNDATION"
  | "CORE_C"
  | "POINTERS_STRINGS"
  | "MEMORY"
  | "ADVANCED"
  | "SIMULATION"
  | "FINAL_REVIEW";

export interface Milestone {
  id: string;
  stage: TrainingPlanStage;
  title: string;
  description: string;
  targetCriteria: string;
  isCompleted: boolean;
}

export interface TrainingPlan {
  currentStage: TrainingPlanStage;
  stageTitle: string;
  stageDescription: string;
  currentWeek: number;
  totalWeeks: number;
  daysRemaining: number;
  weeklyObjectives: string[];
  prioritySkills: SkillDefinition[];
  recommendedModules: Module[];
  nextMilestone: Milestone;
  allMilestones: Milestone[];
  trainingIntensity: "relaxed" | "standard" | "intensive";
  isBlockedByWeakPointersOrMemory: boolean;
  blockerReason?: string;
}
