import { 
  TrainingState, 
  TrainingProfile, 
  DiagnosticResult, 
  SkillMastery, 
  DailyMission,
  DailyMissionItem,
  DailyMissionDebrief,
  SkillEvidence,
  getDefaultModeForMissionItemType
} from "./types";
import { SKILL_DEFINITIONS, DEFAULT_TRAINING_PROFILE } from "./config";
import { UserProgress, ContentJSON } from "../types";
import { getSkillsForChallenge, getSkillsForExam } from "./skillMapping";
import { recalculateSkillMastery } from "./skillEngine";
import { calculateTrainingStreak, countCompletedMissions } from "./dailyMissionEngine";

export { calculateTrainingStreak, countCompletedMissions };

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
    debriefs: {},
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
    const mergedDebriefs: Record<string, DailyMissionDebrief> = { ...(parsed.debriefs || {}) };

    if (parsed.dailyMissions && typeof parsed.dailyMissions === "object") {
      for (const [dateKey, mission] of Object.entries(parsed.dailyMissions as Record<string, DailyMission>)) {
        if (mission && Array.isArray(mission.items)) {
          mergedDailyMissions[dateKey] = {
            ...mission,
            generatedAt: mission.generatedAt || new Date().toISOString(),
            generationVersion: typeof mission.generationVersion === "number" ? mission.generationVersion : 1,
            items: mission.items.map(item => ({
              ...item,
              mode: item.mode || getDefaultModeForMissionItemType(item.type)
            }))
          };
          if (mission.debrief && !mergedDebriefs[dateKey]) {
            mergedDebriefs[dateKey] = mission.debrief;
          }
        } else if (mission) {
          mergedDailyMissions[dateKey] = {
            ...mission,
            generatedAt: mission.generatedAt || new Date().toISOString(),
            generationVersion: typeof mission.generationVersion === "number" ? mission.generationVersion : 1
          };
        }
      }
    }

    const calculatedStreak = calculateTrainingStreak(mergedDailyMissions);
    const calculatedTotalMissions = countCompletedMissions(mergedDailyMissions);

    return {
      version: parsed.version || 1,
      profile: {
        ...DEFAULT_TRAINING_PROFILE,
        ...(parsed.profile || {})
      },
      diagnostic: parsed.diagnostic || null,
      skills: mergedSkills,
      dailyMissions: mergedDailyMissions,
      debriefs: mergedDebriefs,
      lastTrainedDate: parsed.lastTrainedDate || null,
      streakDays: calculatedStreak,
      readinessScore: typeof parsed.readinessScore === "number" ? parsed.readinessScore : 0,
      totalMissionsCompleted: calculatedTotalMissions
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
    generatedAt: mission.generatedAt || new Date().toISOString(),
    generationVersion: typeof mission.generationVersion === "number" ? mission.generationVersion : 2,
    items: (mission.items || []).map(item => ({
      ...item,
      mode: item.mode || getDefaultModeForMissionItemType(item.type)
    }))
  };

  const updatedDailyMissions = {
    ...state.dailyMissions,
    [mission.date]: normalizedMission
  };

  const updated: TrainingState = {
    ...state,
    dailyMissions: updatedDailyMissions,
    streakDays: calculateTrainingStreak(updatedDailyMissions),
    totalMissionsCompleted: countCompletedMissions(updatedDailyMissions)
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
  const now = new Date().toISOString();

  const updatedMission: DailyMission = {
    ...mission,
    items: updatedItems,
    completed: allCompleted,
    completedAt: allCompleted ? (mission.completedAt || now) : undefined
  };

  const updatedDailyMissions = {
    ...state.dailyMissions,
    [date]: updatedMission
  };

  const updated: TrainingState = {
    ...state,
    dailyMissions: updatedDailyMissions,
    lastTrainedDate: allCompleted ? date : state.lastTrainedDate,
    streakDays: calculateTrainingStreak(updatedDailyMissions),
    totalMissionsCompleted: countCompletedMissions(updatedDailyMissions)
  };

  saveTrainingState(updated);
  return updated;
}

export function saveMissionDebrief(
  state: TrainingState,
  date: string,
  debriefInput: { difficultyRating: number; confidenceRating: number; hardestThing?: string }
): TrainingState {
  const mission = state.dailyMissions[date];
  const now = new Date().toISOString();

  const debriefRecord: DailyMissionDebrief = {
    date,
    difficultyRating: Math.min(5, Math.max(1, Math.round(debriefInput.difficultyRating))),
    confidenceRating: Math.min(5, Math.max(1, Math.round(debriefInput.confidenceRating))),
    hardestThing: debriefInput.hardestThing?.trim() || undefined,
    completedAt: now
  };

  if (mission) {
    const updatedItems = mission.items.map(item => {
      if (item.type === "debrief") {
        return {
          ...item,
          completed: true,
          debriefData: debriefRecord
        };
      }
      return item;
    });

    const allCompleted = updatedItems.length > 0 && updatedItems.every(i => i.completed);

    const updatedMission: DailyMission = {
      ...mission,
      items: updatedItems,
      debrief: debriefRecord,
      completed: allCompleted,
      completedAt: allCompleted ? (mission.completedAt || now) : undefined
    };

    const updatedDailyMissions = {
      ...state.dailyMissions,
      [date]: updatedMission
    };

    const updated: TrainingState = {
      ...state,
      dailyMissions: updatedDailyMissions,
      debriefs: {
        ...(state.debriefs || {}),
        [date]: debriefRecord
      },
      lastTrainedDate: allCompleted ? date : state.lastTrainedDate,
      streakDays: calculateTrainingStreak(updatedDailyMissions),
      totalMissionsCompleted: countCompletedMissions(updatedDailyMissions)
    };

    saveTrainingState(updated);
    return updated;
  } else {
    const updated: TrainingState = {
      ...state,
      debriefs: {
        ...(state.debriefs || {}),
        [date]: debriefRecord
      }
    };
    saveTrainingState(updated);
    return updated;
  }
}
