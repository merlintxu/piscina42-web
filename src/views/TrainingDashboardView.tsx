import React, { useState, useMemo, useEffect } from "react";
import { 
  TrainingState, 
  SkillCategory,
  TrainingProfile 
} from "../training/types";
import { 
  SKILL_DEFINITIONS, 
  DEFAULT_TARGET_DATE 
} from "../training/config";
import { calculateReadiness } from "../training/skillEngine";
import { generateDailyMission, getTodayDateString } from "../training/dailyMissionEngine";
import { generateTrainingPlan } from "../training/trainingPlan";
import { 
  saveDailyMissionToState, 
  toggleMissionItemInState, 
  updateTrainingProfile,
  saveMissionDebrief 
} from "../training/trainingStorage";
import { ContentJSON, UserProgress } from "../types";
import { 
  TrainingCountdown,
  TrainingPlanCard,
  ReadinessCard,
  DailyMissionCard,
  SkillMatrix,
  TrainingSettings,
  TrainingDebriefModal
} from "../components/training";

interface TrainingDashboardViewProps {
  content: ContentJSON;
  progress: UserProgress;
  trainingState: TrainingState;
  onUpdateTrainingState: (newState: TrainingState) => void;
}

export const TrainingDashboardView: React.FC<TrainingDashboardViewProps> = ({
  content,
  progress,
  trainingState,
  onUpdateTrainingState
}) => {
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | "all">("all");
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isDebriefOpen, setIsDebriefOpen] = useState<boolean>(false);
  const [expandedPeerItemId, setExpandedPeerItemId] = useState<string | null>(null);

  const todayStr = getTodayDateString();

  // Compute readiness metrics (exact deterministic engine)
  const readiness = useMemo(
    () => calculateReadiness(trainingState, content, progress),
    [trainingState, content, progress]
  );

  // Compute adaptive training plan derived directly from trainingPlan.ts
  const trainingPlan = useMemo(() => {
    return generateTrainingPlan({
      currentDate: todayStr,
      targetDate: trainingState.profile.targetDate,
      trainingState,
      content,
      progress
    });
  }, [todayStr, trainingState, content, progress]);

  // Get or generate today's daily mission
  const dailyMission = useMemo(() => {
    return generateDailyMission(todayStr, trainingState, content, progress);
  }, [todayStr, trainingState, content, progress]);

  // Ensure today's mission is persisted if newly generated
  useEffect(() => {
    if (!trainingState.dailyMissions[todayStr]) {
      const updated = saveDailyMissionToState(trainingState, dailyMission);
      onUpdateTrainingState(updated);
    }
  }, [todayStr]);

  const existingDebrief = trainingState.debriefs?.[todayStr] || dailyMission.debrief;

  const handleToggleMissionItem = (itemId: string) => {
    const item = dailyMission.items.find(i => i.id === itemId);
    if (item?.type === "debrief") {
      setIsDebriefOpen(true);
      return;
    }
    const updated = toggleMissionItemInState(trainingState, todayStr, itemId);
    onUpdateTrainingState(updated);
  };

  const handleSaveDebrief = (debrief: {
    difficultyRating: number;
    confidenceRating: number;
    hardestThing?: string;
  }) => {
    const updated = saveMissionDebrief(trainingState, todayStr, debrief);
    onUpdateTrainingState(updated);
  };

  const handleSaveProfileSettings = (updatedProfile: {
    targetDate: string;
    availableHoursPerWeek: number;
    pace: "relaxed" | "standard" | "intensive";
    dailyCommitmentMinutes: number;
  }) => {
    let updated = updateTrainingProfile(trainingState, updatedProfile);

    // If today's mission has not been started yet, regenerate it with the newly chosen budget
    const currentMission = updated.dailyMissions[todayStr];
    const hasCompletedItems = currentMission?.items?.some(i => i.completed);
    if (!hasCompletedItems) {
      const stateWithoutToday = {
        ...updated,
        dailyMissions: { ...updated.dailyMissions }
      };
      delete stateWithoutToday.dailyMissions[todayStr];
      const regeneratedMission = generateDailyMission(todayStr, stateWithoutToday, content, progress);
      updated = saveDailyMissionToState(stateWithoutToday, regeneratedMission);
    }

    onUpdateTrainingState(updated);
    setIsSettingsOpen(false);
  };

  const filteredSkills = useMemo(() => {
    if (selectedCategory === "all") return SKILL_DEFINITIONS;
    return SKILL_DEFINITIONS.filter(s => s.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="space-y-8 pb-16">
      {/* Target Date Countdown & Header Banner */}
      <TrainingCountdown
        targetDate={trainingState.profile.targetDate || DEFAULT_TARGET_DATE}
        readiness={readiness}
        trainingProfile={trainingState.profile}
        diagnostic={trainingState.diagnostic}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Adaptive Training Plan Section (Derived from trainingPlan.ts) */}
      <TrainingPlanCard
        trainingPlan={trainingPlan}
        trainingState={trainingState}
      />

      {/* Grid: Readiness Score Gauge + Today's Mission */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ReadinessCard
          readiness={readiness}
          streakDays={trainingState.streakDays}
          totalMissionsCompleted={trainingState.totalMissionsCompleted}
        />

        <DailyMissionCard
          dailyMission={dailyMission}
          streakDays={trainingState.streakDays}
          existingDebrief={existingDebrief}
          expandedPeerItemId={expandedPeerItemId}
          onTogglePeerAccordion={(itemId) => 
            setExpandedPeerItemId(expandedPeerItemId === itemId ? null : itemId)
          }
          onToggleMissionItem={handleToggleMissionItem}
          onOpenDebrief={() => setIsDebriefOpen(true)}
        />
      </div>

      {/* Skill Matrix Section */}
      <SkillMatrix
        skills={filteredSkills}
        trainingState={trainingState}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        expandedSkillId={expandedSkillId}
        onToggleExpandSkill={(skillId) => 
          setExpandedSkillId(expandedSkillId === skillId ? null : skillId)
        }
      />

      {/* Settings Modal */}
      <TrainingSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={trainingState.profile}
        onSave={handleSaveProfileSettings}
      />

      {/* Technical Debrief Modal */}
      <TrainingDebriefModal
        isOpen={isDebriefOpen}
        onClose={() => setIsDebriefOpen(false)}
        date={dailyMission.date}
        existingDebrief={existingDebrief}
        onSaveDebrief={handleSaveDebrief}
      />
    </div>
  );
};
