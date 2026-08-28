import { 
  TrainingState, 
  TrainingProfile, 
  DiagnosticResult, 
  SkillMastery, 
  DailyMission,
  DailyMissionItem,
  SkillEvidence,
  getDefaultModeForMissionItemType
} from "./types";
import { SKILL_DEFINITIONS, DEFAULT_TRAINING_PROFILE } from "./config";
import { UserProgress, ContentJSON } from "../types";
import { getSkillsForChallenge, getSkillsForExam } from "./skillMapping";
import { recalculateSkillMastery } from "./skillEngine";

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

    // Ensure all defined skills exist in state and normalize using pure recalculateSkillMastery
    const mergedSkills: Record<string, SkillMastery> = { ...initial.skills };
    if (parsed.skills) {
      for (const key of Object.keys(parsed.skills)) {
        if (mergedSkills[key]) {
          const rawSkill = {
            ...mergedSkills[key],
            ...parsed.skills[key]
          };
          mergedSkills[key] = recalculateSkillMastery(rawSkill);
        }
      }
    }

    // Normalize daily missions to ensure backwards compatibility with stored items
    const mergedDailyMissions: Record<string, DailyMission> = {};
    if (parsed.dailyMissions && typeof parsed.dailyMissions === "object") {
      for (const [dateKey, mission] of Object.entries(parsed.dailyMissions as Record<string, DailyMission>)) {
        if (mission && Array.isArray(mission.items)) {
          mergedDailyMissions[dateKey] = {
            ...mission,
            items: mission.items.map(item => ({
              ...item,
              mode: item.mode || getDefaultModeForMissionItemType(item.type)
            }))
          };
        } else if (mission) {
          mergedDailyMissions[dateKey] = mission;
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
      dailyMissions: mergedDailyMissions,
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

    const evidence: SkillEvidence = {
      sourceType: "diagnostic",
      sourceId: "diag-result-" + now,
      timestamp: now,
      score: scoreInfo.percentage,
      mode: "prove",
      weight: 1.0,
      independence: 1.0,
      notes: `Evaluación diagnóstica: ${scoreInfo.correct}/${scoreInfo.total} acertadas (${scoreInfo.percentage}%)`
    };

    const newHistory = [...(current.history || []), evidence];
    updatedSkills[skillId] = recalculateSkillMastery(skillId, newHistory, now);
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

  // Track completed challenges to calculate practical mastery evidence
  const challengeMap = new Map(content.challenges.map(c => [c.id, c]));

  for (const completedId of progress.completedChallenges) {
    const ch = challengeMap.get(completedId);
    if (!ch) continue;

    const matchedSkills = getSkillsForChallenge(ch);
    for (const match of matchedSkills) {
      const current = updatedSkills[match.skillId];
      if (!current) continue;

      // Check if this evidence is already recorded
      const alreadyHas = current.history?.some(h => h.sourceId === completedId && h.sourceType === "challenge");
      if (!alreadyHas) {
        changed = true;
        const evidence: SkillEvidence = {
          sourceType: "challenge",
          sourceId: completedId,
          timestamp: now,
          score: 100,
          mode: "learn",
          weight: match.weight ? match.weight * 1.5 : 1.5,
          independence: 0.8,
          notes: `Reto completado: ${ch.title}`
        };

        const newHistory = [...(current.history || []), evidence];
        updatedSkills[match.skillId] = recalculateSkillMastery(match.skillId, newHistory, now);
      }
    }
  }

  // Check exam simulations
  if (progress.completedExams) {
    for (const [examId, examData] of Object.entries(progress.completedExams)) {
      const examSim = content.exams?.find(e => e.id === examId || e.slug === examId);
      const matchedExamSkills = examSim 
        ? getSkillsForExam(examSim)
        : [{ skillId: "meta-exam-pressure", weight: 1.0 }];

      for (const match of matchedExamSkills) {
        const skill = updatedSkills[match.skillId];
        if (!skill) continue;

        const alreadyHasExam = skill.history?.some(h => h.sourceId === examId && h.sourceType === "exam");
        if (!alreadyHasExam) {
          changed = true;
          const examEvidence: SkillEvidence = {
            sourceType: "exam",
            sourceId: examId,
            timestamp: examData.completedAt || now,
            score: examData.score,
            mode: "prove",
            weight: match.weight ? match.weight * 2.5 : 2.5,
            independence: 1.0,
            notes: `Simulación de examen: ${examData.score}/100`
          };

          const newHistory = [...(skill.history || []), examEvidence];
          updatedSkills[match.skillId] = recalculateSkillMastery(match.skillId, newHistory, examData.completedAt || now);
        }
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
  const normalizedMission: DailyMission = {
    ...mission,
    items: (mission.items || []).map(item => ({
      ...item,
      mode: item.mode || getDefaultModeForMissionItemType(item.type)
    }))
  };

  const updated: TrainingState = {
    ...state,
    dailyMissions: {
      ...state.dailyMissions,
      [mission.date]: normalizedMission
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
