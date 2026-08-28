import { 
  TrainingState, 
  TrainingProfile, 
  DiagnosticResult, 
  SkillMastery, 
  DailyMission,
  DailyMissionItem,
  SkillLevel,
  SkillEvidence
} from "./types";
import { SKILL_DEFINITIONS, DEFAULT_TRAINING_PROFILE } from "./config";
import { UserProgress, ContentJSON } from "../types";
import { getSkillsForChallenge } from "./skillMapping";

export const TRAINING_STORAGE_KEY = "piscina42_training_v1";

export function createInitialTrainingState(): TrainingState {
  const initialSkills: Record<string, SkillMastery> = {};
  const now = new Date().toISOString();

  for (const def of SKILL_DEFINITIONS) {
    initialSkills[def.id] = {
      skillId: def.id,
      level: 0,
      confidence: 0,
      evidenceCount: 0,
      lastAssessedAt: now,
      history: []
    };
  }

  return {
    version: 1,
    profile: { ...DEFAULT_TRAINING_PROFILE },
    diagnostic: null,
    skills: initialSkills,
    dailyMissions: {},
    lastTrainedDate: null,
    streakDays: 0,
    readinessScore: 0,
    totalMissionsCompleted: 0
  };
}

export function loadTrainingState(): TrainingState {
  try {
    const raw = localStorage.getItem(TRAINING_STORAGE_KEY);
    if (!raw) {
      const initial = createInitialTrainingState();
      saveTrainingState(initial);
      return initial;
    }

    const parsed = JSON.parse(raw);
    const initial = createInitialTrainingState();

    // Ensure all defined skills exist in state
    const mergedSkills: Record<string, SkillMastery> = { ...initial.skills };
    if (parsed.skills) {
      for (const key of Object.keys(parsed.skills)) {
        if (mergedSkills[key]) {
          mergedSkills[key] = {
            ...mergedSkills[key],
            ...parsed.skills[key]
          };
        }
      }
    }

    return {
      version: parsed.version || 1,
      profile: {
        ...DEFAULT_TRAINING_PROFILE,
        ...(parsed.profile || {})
      },
      diagnostic: parsed.diagnostic || null,
      skills: mergedSkills,
      dailyMissions: parsed.dailyMissions || {},
      lastTrainedDate: parsed.lastTrainedDate || null,
      streakDays: typeof parsed.streakDays === "number" ? parsed.streakDays : 0,
      readinessScore: typeof parsed.readinessScore === "number" ? parsed.readinessScore : 0,
      totalMissionsCompleted: typeof parsed.totalMissionsCompleted === "number" ? parsed.totalMissionsCompleted : 0
    };
  } catch (err) {
    console.error("Error loading training state, initializing defaults:", err);
    return createInitialTrainingState();
  }
}

export function saveTrainingState(state: TrainingState): void {
  try {
    localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Failed to save training state to localStorage", err);
  }
}

export function updateTrainingProfile(
  state: TrainingState,
  profileUpdates: Partial<TrainingProfile>
): TrainingState {
  const updated: TrainingState = {
    ...state,
    profile: {
      ...state.profile,
      ...profileUpdates
    }
  };
  saveTrainingState(updated);
  return updated;
}

export function applyDiagnosticToState(
  state: TrainingState,
  diagnosticResult: DiagnosticResult
): TrainingState {
  const updatedSkills = { ...state.skills };
  const now = new Date().toISOString();

  for (const [skillId, scoreInfo] of Object.entries(diagnosticResult.skillScores)) {
    const current = updatedSkills[skillId] || {
      skillId,
      level: 0,
      confidence: 0,
      evidenceCount: 0,
      lastAssessedAt: now,
      history: []
    };

    // Calculate level bump from diagnostic score
    const newLevel: SkillLevel = scoreInfo.calculatedLevel;
    const confidence = scoreInfo.total > 0 ? scoreInfo.correct / scoreInfo.total : 0.5;

    const evidence: SkillEvidence = {
      sourceType: "diagnostic",
      sourceId: "diag-result-" + now,
      timestamp: now,
      score: scoreInfo.percentage,
      notes: `Evaluación diagnóstica: ${scoreInfo.correct}/${scoreInfo.total} acertadas (${scoreInfo.percentage}%)`
    };

    updatedSkills[skillId] = {
      ...current,
      level: Math.max(current.level, newLevel) as SkillLevel,
      confidence: Math.max(current.confidence, confidence),
      evidenceCount: current.evidenceCount + 1,
      lastAssessedAt: now,
      history: [...(current.history || []), evidence]
    };
  }

  const updated: TrainingState = {
    ...state,
    diagnostic: diagnosticResult,
    skills: updatedSkills
  };

  saveTrainingState(updated);
  return updated;
}

export function syncSkillsWithUserProgress(
  state: TrainingState,
  progress: UserProgress,
  content: ContentJSON
): TrainingState {
  const updatedSkills = { ...state.skills };
  const now = new Date().toISOString();
  let changed = false;

  // Track completed challenges to calculate mastery evidence
  const challengeMap = new Map(content.challenges.map(c => [c.id, c]));

  for (const completedId of progress.completedChallenges) {
    const ch = challengeMap.get(completedId);
    if (!ch) continue;

    const matchedSkills = getSkillsForChallenge(ch);
    for (const match of matchedSkills) {
      const current = updatedSkills[match.skillId];
      if (!current) continue;

      // Check if this evidence is already recorded
      const alreadyHas = current.history?.some(h => h.sourceId === completedId);
      if (!alreadyHas) {
        changed = true;
        const newEvidenceCount = current.evidenceCount + 1;
        // Gradual level increment based on challenges completed
        // E.g., 1-2 challenges = level 1-2, 3-4 = level 3, etc.
        let calculatedLevel = current.level;
        if (newEvidenceCount >= 6 && current.level < 4) calculatedLevel = 4;
        else if (newEvidenceCount >= 4 && current.level < 3) calculatedLevel = 3;
        else if (newEvidenceCount >= 2 && current.level < 2) calculatedLevel = 2;
        else if (newEvidenceCount >= 1 && current.level < 1) calculatedLevel = 1;

        const evidence: SkillEvidence = {
          sourceType: "challenge",
          sourceId: completedId,
          timestamp: now,
          score: 100,
          notes: `Reto completado: ${ch.title}`
        };

        updatedSkills[match.skillId] = {
          ...current,
          level: Math.max(current.level, calculatedLevel) as SkillLevel,
          confidence: Math.min(1.0, current.confidence + 0.1),
          evidenceCount: newEvidenceCount,
          lastAssessedAt: now,
          history: [...(current.history || []), evidence]
        };
      }
    }
  }

  // Also check exams passed
  for (const [examId, examData] of Object.entries(progress.completedExams)) {
    if (examData.score >= 75) {
      const examSkill = updatedSkills["meta-exam-pressure"];
      if (examSkill && !examSkill.history?.some(h => h.sourceId === examId)) {
        changed = true;
        updatedSkills["meta-exam-pressure"] = {
          ...examSkill,
          level: Math.max(examSkill.level, 3) as SkillLevel,
          confidence: 0.9,
          evidenceCount: examSkill.evidenceCount + 1,
          lastAssessedAt: now,
          history: [
            ...(examSkill.history || []),
            {
              sourceType: "exam",
              sourceId: examId,
              timestamp: examData.completedAt || now,
              score: examData.score,
              notes: `Simulación aprobada: ${examData.score}/100`
            }
          ]
        };
      }
    }
  }

  if (changed) {
    const updated: TrainingState = {
      ...state,
      skills: updatedSkills
    };
    saveTrainingState(updated);
    return updated;
  }

  return state;
}

export function saveDailyMissionToState(
  state: TrainingState,
  mission: DailyMission
): TrainingState {
  const updated: TrainingState = {
    ...state,
    dailyMissions: {
      ...state.dailyMissions,
      [mission.date]: mission
    }
  };
  saveTrainingState(updated);
  return updated;
}

export function toggleMissionItemInState(
  state: TrainingState,
  date: string,
  itemId: string
): TrainingState {
  const mission = state.dailyMissions[date];
  if (!mission) return state;

  const updatedItems = mission.items.map(item => {
    if (item.id === itemId) {
      return { ...item, completed: !item.completed };
    }
    return item;
  });

  const allCompleted = updatedItems.length > 0 && updatedItems.every(i => i.completed);
  const wasCompletedBefore = mission.completed;
  const now = new Date().toISOString();

  const updatedMission: DailyMission = {
    ...mission,
    items: updatedItems,
    completed: allCompleted,
    completedAt: allCompleted ? (mission.completedAt || now) : undefined
  };

  let newStreak = state.streakDays;
  let totalMissions = state.totalMissionsCompleted;

  if (allCompleted && !wasCompletedBefore) {
    totalMissions += 1;
    newStreak += 1;
  } else if (!allCompleted && wasCompletedBefore) {
    totalMissions = Math.max(0, totalMissions - 1);
    newStreak = Math.max(0, newStreak - 1);
  }

  const updated: TrainingState = {
    ...state,
    dailyMissions: {
      ...state.dailyMissions,
      [date]: updatedMission
    },
    lastTrainedDate: allCompleted ? date : state.lastTrainedDate,
    streakDays: newStreak,
    totalMissionsCompleted: totalMissions
  };

  saveTrainingState(updated);
  return updated;
}
