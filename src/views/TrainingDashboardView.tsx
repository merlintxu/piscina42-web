import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  TrainingState, 
  SkillCategory, 
  SkillLevel,
  TrainingProfile 
} from "../training/types";
import { 
  SKILL_DEFINITIONS, 
  SKILL_CATEGORIES, 
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
  Calendar, 
  Clock, 
  CheckCircle2, 
  Flame, 
  Sparkles, 
  ShieldCheck, 
  Terminal, 
  Code2, 
  GitBranch, 
  Settings, 
  ArrowRight, 
  Play, 
  Award, 
  ChevronDown, 
  ChevronUp, 
  Layers,
  AlertCircle,
  HelpCircle,
  X,
  ExternalLink,
  BookOpen,
  Users,
  ClipboardCheck,
  RefreshCw,
  MessageSquare,
  Target,
  Flag,
  TrendingUp,
  AlertTriangle,
  Compass,
  CheckSquare
} from "lucide-react";

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
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | "all">("all");
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [expandedPeerItemId, setExpandedPeerItemId] = useState<string | null>(null);

  // Debrief modal state
  const [isDebriefOpen, setIsDebriefOpen] = useState<boolean>(false);
  const [debriefDifficulty, setDebriefDifficulty] = useState<number>(3);
  const [debriefConfidence, setDebriefConfidence] = useState<number>(3);
  const [debriefHardestThing, setDebriefHardestThing] = useState<string>("");

  // Settings form state
  const [targetDateInput, setTargetDateInput] = useState<string>(trainingState.profile.targetDate || DEFAULT_TARGET_DATE);
  const [hoursPerWeekInput, setHoursPerWeekInput] = useState<number>(trainingState.profile.availableHoursPerWeek || 15);
  const [paceInput, setPaceInput] = useState<"relaxed" | "standard" | "intensive">(trainingState.profile.pace || "standard");
  const [dailyCommitmentInput, setDailyCommitmentInput] = useState<number>(trainingState.profile.dailyCommitmentMinutes || 90);

  // Synchronize modal inputs when opening settings
  useEffect(() => {
    if (isSettingsOpen) {
      setTargetDateInput(trainingState.profile.targetDate || DEFAULT_TARGET_DATE);
      setHoursPerWeekInput(trainingState.profile.availableHoursPerWeek || 15);
      setPaceInput(trainingState.profile.pace || "standard");
      setDailyCommitmentInput(trainingState.profile.dailyCommitmentMinutes || 90);
    }
  }, [isSettingsOpen, trainingState.profile]);

  const todayStr = getTodayDateString();

  // Compute readiness metrics
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
  React.useEffect(() => {
    if (!trainingState.dailyMissions[todayStr]) {
      const updated = saveDailyMissionToState(trainingState, dailyMission);
      onUpdateTrainingState(updated);
    }
  }, [todayStr]);

  // Initialize debrief inputs when existing debrief is present
  const existingDebrief = trainingState.debriefs?.[todayStr] || dailyMission.debrief;
  useEffect(() => {
    if (existingDebrief) {
      setDebriefDifficulty(existingDebrief.difficultyRating);
      setDebriefConfidence(existingDebrief.confidenceRating);
      setDebriefHardestThing(existingDebrief.hardestThing || "");
    }
  }, [existingDebrief]);

  const handleToggleMissionItem = (itemId: string) => {
    const item = dailyMission.items.find(i => i.id === itemId);
    if (item?.type === "debrief") {
      setIsDebriefOpen(true);
      return;
    }
    const updated = toggleMissionItemInState(trainingState, todayStr, itemId);
    onUpdateTrainingState(updated);
  };

  const handleSaveDebrief = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveMissionDebrief(trainingState, todayStr, {
      difficultyRating: debriefDifficulty,
      confidenceRating: debriefConfidence,
      hardestThing: debriefHardestThing
    });
    onUpdateTrainingState(updated);
    setIsDebriefOpen(false);
  };

  const handleSaveProfileSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const validMinutes = Math.min(360, Math.max(30, Number(dailyCommitmentInput) || 90));
    let updated = updateTrainingProfile(trainingState, {
      targetDate: targetDateInput,
      availableHoursPerWeek: Number(hoursPerWeekInput),
      pace: paceInput,
      dailyCommitmentMinutes: validMinutes
    });

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

  const missionProgressPct = useMemo(() => {
    if (!dailyMission.items || dailyMission.items.length === 0) return 0;
    const completed = dailyMission.items.filter(i => i.completed).length;
    return Math.round((completed / dailyMission.items.length) * 100);
  }, [dailyMission.items]);

  return (
    <div className="space-y-8 pb-16">
      {/* Target Date Countdown & Header Banner */}
      <div className="bg-[#141927] border border-[#2A2F3C] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#4CAF50]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#03A9F4]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 text-xs font-mono font-bold bg-[#4CAF50]/15 text-[#4CAF50] border border-[#4CAF50]/30 rounded-lg flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Piscina42 Training OS · Fase 2.1
              </span>
              <span className="text-xs font-mono text-[#9FA7B8]">
                Entrenamiento Adaptativo Diario
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#ECEFF4] tracking-tight">
              Panel de Preparación y Readiness
            </h1>

            <p className="text-xs sm:text-sm text-[#9FA7B8] leading-relaxed">
              Sistema diario de acondicionamiento técnico para superar la Piscina de 42 Madrid. Misiones adaptadas a tus puntos débiles, cálculo conservador de preparación y matriz de competencias.
            </p>
          </div>

          {/* Countdown Card */}
          <div className="bg-[#0b0f19] border border-[#2A2F3C] p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-5 shrink-0 shadow-inner">
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 text-xs font-mono text-[#9FA7B8] mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#03A9F4]" />
                <span>Fecha Objetivo: {trainingState.profile.targetDate}</span>
              </div>
              <div className="text-3xl font-extrabold font-mono text-[#ECEFF4]">
                {readiness.daysRemaining} <span className="text-sm font-normal text-[#9FA7B8]">días ({readiness.weeksRemaining} sem)</span>
              </div>
              <div className="text-xs text-[#9FA7B8] font-mono mt-0.5">
                ~{readiness.projectedHoursAvailable}h disponibles ({trainingState.profile.availableHoursPerWeek}h/sem · {trainingState.profile.dailyCommitmentMinutes || 90}m/día)
              </div>
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 rounded-xl bg-[#141927] hover:bg-[#1a2236] border border-[#2A2F3C] text-[#9FA7B8] hover:text-[#ECEFF4] transition-colors cursor-pointer"
              title="Configurar perfil de entrenamiento"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Diagnostic Prompt Banner (if not completed) */}
      {!trainingState.diagnostic ? (
        <div className="bg-gradient-to-r from-[#141927] via-[#1b253b] to-[#141927] border border-[#03A9F4]/40 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#03A9F4] text-[#0b0f19] rounded-md">
                Paso Recomendado
              </span>
              <h2 className="text-base font-bold text-[#ECEFF4]">
                Calibra tu nivel con la Evaluación Diagnóstica
              </h2>
            </div>
            <p className="text-xs text-[#CAD2E2]">
              Realiza el test de 24 preguntas sobre C, Terminal, Git, Norminette y buenas prácticas para calibrar tu Matriz de Habilidades.
            </p>
          </div>

          <Link
            to="/diagnostic"
            className="px-5 py-2.5 bg-[#03A9F4] hover:bg-[#0288D1] text-[#0b0f19] font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-[#03A9F4]/20 flex items-center justify-center gap-2 transition-all shrink-0"
          >
            <span>Realizar Diagnóstico</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" />
            <span className="text-[#ECEFF4]">
              Diagnóstico inicial realizado: <strong className="text-[#4CAF50]">{trainingState.diagnostic.score}/{trainingState.diagnostic.totalQuestions} ({trainingState.diagnostic.percentage}%)</strong>
            </span>
          </div>
          <Link
            to="/diagnostic"
            className="text-[#03A9F4] hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Ver desglose completo o repetir</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Adaptive Training Plan Section (Derived from trainingPlan.ts) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2A2F3C] pb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#03A9F4]" />
            <div>
              <h2 className="text-lg font-bold text-[#ECEFF4]">
                Plan de Entrenamiento Adaptativo
              </h2>
              <p className="text-xs font-mono text-[#9FA7B8]">
                Estrategia por etapas, objetivos semanales y prioridades derivadas de tus competencias
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-mono bg-[#0b0f19] border border-[#2A2F3C] rounded-lg text-[#CAD2E2]">
              Semana <strong className="text-[#ECEFF4]">{trainingPlan.currentWeek}</strong> de <strong className="text-[#ECEFF4]">{trainingPlan.totalWeeks}</strong>
            </span>
            <span className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border uppercase ${
              trainingPlan.trainingIntensity === "intensive"
                ? "bg-[#FF5722]/15 text-[#FF5722] border-[#FF5722]/30"
                : trainingPlan.trainingIntensity === "relaxed"
                ? "bg-[#03A9F4]/15 text-[#03A9F4] border-[#03A9F4]/30"
                : "bg-[#4CAF50]/15 text-[#4CAF50] border-[#4CAF50]/30"
            }`}>
              Ritmo {trainingPlan.trainingIntensity === "intensive" ? "Intensivo" : trainingPlan.trainingIntensity === "relaxed" ? "Relajado" : "Estándar"}
            </span>
          </div>
        </div>

        {/* 4 Cards Grid: ETAPA ACTUAL, ESTA SEMANA, TOP 3 PRIORIDADES, PRÓXIMO MILESTONE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Card 1: ETAPA ACTUAL */}
          <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#2A2F3C] pb-2.5">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#03A9F4]" />
                  <span className="text-xs font-mono font-bold text-[#9FA7B8] uppercase tracking-wider">
                    Etapa Actual
                  </span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#03A9F4]/15 text-[#03A9F4] border border-[#03A9F4]/30 rounded uppercase">
                  {trainingPlan.currentStage}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#ECEFF4]">
                  {trainingPlan.stageTitle}
                </h3>
                <p className="text-xs text-[#CAD2E2] leading-relaxed">
                  {trainingPlan.stageDescription}
                </p>
              </div>

              {/* Blocker or Normal Progression State */}
              {trainingPlan.isBlockedByWeakPointersOrMemory && trainingPlan.blockerReason ? (
                <div className="p-3 bg-[#FF5722]/10 border border-[#FF5722]/30 rounded-xl flex items-start gap-2.5 text-xs text-[#FF8A65]">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-[#FF5722] mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold font-mono text-[#FF5722]">
                      Consolidación Prioritaria Requerida:
                    </span>
                    <p className="text-[11px] leading-relaxed text-[#FFCCBC]">
                      {trainingPlan.blockerReason}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-[#0b0f19] border border-[#2A2F3C] rounded-xl flex items-center justify-between text-xs font-mono">
                  <span className="text-[#9FA7B8]">Estado de la etapa:</span>
                  <span className="text-[#4CAF50] font-bold">En avance activo según competencias</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#2A2F3C] flex items-center justify-between text-xs font-mono text-[#9FA7B8]">
              <span>Progreso de etapas 42:</span>
              <span className="text-[#ECEFF4] font-bold">
                {trainingPlan.allMilestones.filter(m => m.isCompleted).length} de {trainingPlan.allMilestones.length} hitos alcanzados
              </span>
            </div>
          </div>

          {/* Card 2: ESTA SEMANA */}
          <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#2A2F3C] pb-2.5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#4CAF50]" />
                  <span className="text-xs font-mono font-bold text-[#9FA7B8] uppercase tracking-wider">
                    Esta Semana
                  </span>
                </div>
                <span className="text-xs font-mono text-[#4CAF50] font-bold">
                  Semana {trainingPlan.currentWeek} ({trainingPlan.daysRemaining} días restantes)
                </span>
              </div>

              {/* Weekly Objectives List */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-[#9FA7B8] uppercase font-bold tracking-wider block">
                  Objetivos Deterministas de la Semana:
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {trainingPlan.weeklyObjectives.map((objective, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-[#0b0f19] border border-[#2A2F3C] rounded-xl flex items-start gap-2 text-xs text-[#ECEFF4]"
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-[#4CAF50] shrink-0 mt-0.5" />
                      <span className="leading-snug text-[11px] sm:text-xs">
                        {objective}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommended Key Modules */}
            {trainingPlan.recommendedModules.length > 0 && (
              <div className="pt-3 border-t border-[#2A2F3C] space-y-1.5">
                <span className="text-[10px] font-mono text-[#9FA7B8] uppercase font-bold block">
                  Módulos Clave Recomendados:
                </span>
                <div className="flex flex-wrap gap-2">
                  {trainingPlan.recommendedModules.slice(0, 3).map((mod) => (
                    <Link
                      key={mod.id}
                      to={`/module/${mod.slug || mod.id}`}
                      className="px-2.5 py-1 text-xs font-mono bg-[#0b0f19] hover:bg-[#1a2236] border border-[#2A2F3C] text-[#03A9F4] rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <BookOpen className="w-3 h-3 text-[#03A9F4]" />
                      <span>{mod.title}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card 3: TOP 3 PRIORIDADES */}
          <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#2A2F3C] pb-2.5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#FF9800]" />
                  <span className="text-xs font-mono font-bold text-[#9FA7B8] uppercase tracking-wider">
                    Top 3 Prioridades
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#9FA7B8]">
                  Foco de mayor impacto
                </span>
              </div>

              <div className="space-y-2.5">
                {trainingPlan.prioritySkills.slice(0, 3).map((skill, idx) => {
                  const mastery = trainingState.skills[skill.id] || { level: 0, confidence: 0, evidenceCount: 0 };
                  const cat = SKILL_CATEGORIES[skill.category];
                  const currentCrit = skill.levels.find(l => l.level === mastery.level) || skill.levels[0];

                  return (
                    <div
                      key={skill.id}
                      className="p-3 bg-[#0b0f19] border border-[#2A2F3C] rounded-xl space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-[#FF9800]/15 text-[#FF9800] border border-[#FF9800]/30 flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                            #{idx + 1}
                          </span>
                          <span className="text-xs font-bold text-[#ECEFF4]">
                            {skill.title}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded border ${cat.color.badge}`}>
                          {cat.shortName}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-[#9FA7B8] truncate max-w-[200px]">
                          {currentCrit.label}
                        </span>
                        <span className="text-[#4CAF50] font-bold">
                          {mastery.level} / 5
                        </span>
                      </div>

                      <div className="w-full h-1.5 bg-[#141927] rounded-full overflow-hidden border border-[#2A2F3C]">
                        <div
                          className="h-full bg-[#FF9800] rounded-full"
                          style={{ width: `${(mastery.level / 5) * 100}%` }}
                        />
                      </div>

                      <p className="text-[10px] text-[#9FA7B8] leading-tight line-clamp-1">
                        {skill.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-[#2A2F3C] flex items-center justify-between text-xs font-mono text-[#9FA7B8]">
              <span>Criterio de ordenación:</span>
              <span className="text-[#CAD2E2]">Menor nivel técnico + peso en Piscina</span>
            </div>
          </div>

          {/* Card 4: PRÓXIMO MILESTONE */}
          <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#2A2F3C] pb-2.5">
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4 text-[#BA68C8]" />
                  <span className="text-xs font-mono font-bold text-[#9FA7B8] uppercase tracking-wider">
                    Próximo Milestone
                  </span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${
                  trainingPlan.nextMilestone.isCompleted
                    ? "bg-[#4CAF50]/15 text-[#4CAF50] border-[#4CAF50]/30"
                    : "bg-[#BA68C8]/15 text-[#BA68C8] border-[#BA68C8]/30"
                }`}>
                  {trainingPlan.nextMilestone.isCompleted ? "✓ Completado" : "En Curso"}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#0b0f19] border border-[#2A2F3C] text-[#BA68C8] rounded uppercase">
                    {trainingPlan.nextMilestone.stage}
                  </span>
                  <h3 className="text-sm font-bold text-[#ECEFF4]">
                    {trainingPlan.nextMilestone.title}
                  </h3>
                </div>
                <p className="text-xs text-[#CAD2E2] leading-relaxed">
                  {trainingPlan.nextMilestone.description}
                </p>
              </div>

              {/* Target criteria */}
              <div className="p-3 bg-[#0b0f19] border border-[#2A2F3C] rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-[#BA68C8] font-bold uppercase block">
                  Criterio de Desbloqueo:
                </span>
                <p className="text-xs font-mono text-[#ECEFF4] leading-relaxed">
                  {trainingPlan.nextMilestone.targetCriteria}
                </p>
              </div>
            </div>

            {/* Milestones progression track */}
            <div className="pt-3 border-t border-[#2A2F3C] space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#9FA7B8]">
                <span>Secuencia de 7 Hitos 42</span>
                <span className="text-[#ECEFF4] font-bold">
                  {trainingPlan.allMilestones.filter(m => m.isCompleted).length} / {trainingPlan.allMilestones.length}
                </span>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {trainingPlan.allMilestones.map((ms) => {
                  const isCurrent = ms.id === trainingPlan.nextMilestone.id;
                  return (
                    <div
                      key={ms.id}
                      className={`h-2 rounded-full border transition-all ${
                        ms.isCompleted
                          ? "bg-[#4CAF50] border-[#4CAF50]"
                          : isCurrent
                          ? "bg-[#BA68C8] border-[#BA68C8] animate-pulse"
                          : "bg-[#0b0f19] border-[#2A2F3C]"
                      }`}
                      title={`${ms.title} (${ms.isCompleted ? "Completado" : isCurrent ? "En progreso" : "Pendiente"})`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Grid: Readiness Score Gauge + Today's Mission */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Readiness Score Breakdown Card */}
        <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-[#2A2F3C] pb-3">
            <h2 className="text-sm font-bold text-[#ECEFF4] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#4CAF50]" />
              <span>Readiness Score (Estimación de entrenamiento)</span>
            </h2>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
              readiness.paceStatus === "ahead"
                ? "bg-[#4CAF50]/15 text-[#4CAF50] border-[#4CAF50]/30"
                : readiness.paceStatus === "on_track"
                ? "bg-[#03A9F4]/15 text-[#03A9F4] border-[#03A9F4]/30"
                : "bg-[#FF5722]/15 text-[#FF5722] border-[#FF5722]/30"
            }`}>
              {readiness.paceStatus === "ahead" ? "Avanzado" : readiness.paceStatus === "on_track" ? "En Ruta" : "Atención"}
            </span>
          </div>

          {/* Big Circular Metric */}
          <div className="flex items-center justify-center py-2">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#0b0f19]"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#4CAF50] transition-all duration-1000 ease-out"
                  strokeDasharray={`${readiness.overallScore}, 100`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-extrabold font-mono text-[#ECEFF4]">
                  {readiness.overallScore}%
                </span>
                <span className="text-[9px] font-mono text-[#9FA7B8] uppercase tracking-wider">
                  Técnico
                </span>
              </div>
            </div>
          </div>

          {/* Sub-metrics bars */}
          <div className="space-y-3 pt-2 text-xs font-mono">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#9FA7B8]">C Core & Punteros (35%)</span>
                <span className="text-[#ECEFF4] font-bold">{readiness.cMastery}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#0b0f19] rounded-full overflow-hidden border border-[#2A2F3C]">
                <div className="h-full bg-[#4CAF50] rounded-full" style={{ width: `${readiness.cMastery}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#9FA7B8]">Terminal & Git (20%)</span>
                <span className="text-[#ECEFF4] font-bold">{readiness.unixAndGit}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#0b0f19] rounded-full overflow-hidden border border-[#2A2F3C]">
                <div className="h-full bg-[#03A9F4] rounded-full" style={{ width: `${readiness.unixAndGit}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#9FA7B8]">Rigor & Norminette (25%)</span>
                <span className="text-[#ECEFF4] font-bold">{readiness.rigorAndNorminette}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#0b0f19] rounded-full overflow-hidden border border-[#2A2F3C]">
                <div className="h-full bg-[#E91E63] rounded-full" style={{ width: `${readiness.rigorAndNorminette}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#9FA7B8]">Examshell Simulator (20%)</span>
                <span className="text-[#ECEFF4] font-bold">{readiness.examshellReadiness}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#0b0f19] rounded-full overflow-hidden border border-[#2A2F3C]">
                <div className="h-full bg-[#FFC107] rounded-full" style={{ width: `${readiness.examshellReadiness}%` }} />
              </div>
            </div>

            <div className="pt-2 border-t border-[#2A2F3C]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#CAD2E2] flex items-center gap-1">
                  <Flame className="w-3 h-3 text-[#FF9800]" />
                  Consistencia de Entrenamiento
                </span>
                <span className="text-[#FF9800] font-bold">{readiness.trainingConsistency}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#0b0f19] rounded-full overflow-hidden border border-[#2A2F3C]">
                <div className="h-full bg-[#FF9800] rounded-full" style={{ width: `${readiness.trainingConsistency}%` }} />
              </div>
              <span className="text-[10px] text-[#9FA7B8] block mt-1">
                Rachas, misiones y hábitos completados (independiente del score técnico).
              </span>
            </div>
          </div>
        </div>

        {/* Daily Mission Card */}
        <div className="bg-[#141927] border border-[#4CAF50]/40 rounded-2xl p-6 shadow-xl space-y-5 lg:col-span-2 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2A2F3C] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#4CAF50] text-[#0b0f19] rounded-md flex items-center gap-1">
                    <Play className="w-3 h-3 fill-current" />
                    Misión del Día
                  </span>
                  <span className="text-xs font-mono text-[#9FA7B8]">{dailyMission.date}</span>
                </div>
                <h2 className="text-lg font-bold text-[#ECEFF4] mt-1">
                  Plan de Entrenamiento Diario
                </h2>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0b0f19] border border-[#2A2F3C] rounded-lg">
                  <Flame className="w-3.5 h-3.5 text-[#FFC107]" />
                  <span className="text-[#ECEFF4] font-bold">Racha: {trainingState.streakDays} d</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0b0f19] border border-[#2A2F3C] rounded-lg">
                  <Clock className="w-3.5 h-3.5 text-[#03A9F4]" />
                  <span className="text-[#ECEFF4] font-bold">~{dailyMission.estimatedMinutes} min</span>
                </div>
              </div>
            </div>

            {/* Rationale Quote */}
            <div className="p-3 bg-[#0b0f19]/70 border border-[#2A2F3C] rounded-xl text-xs text-[#CAD2E2] leading-relaxed">
              <span className="text-[#4CAF50] font-bold font-mono">Enfoque pedagógico: </span>
              {dailyMission.rationale}
            </div>

            {/* Mission Items Checklist */}
            <div className="space-y-3">
              {dailyMission.items.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    item.completed
                      ? "bg-[#4CAF50]/10 border-[#4CAF50]/40 text-[#4CAF50]"
                      : "bg-[#0b0f19] border-[#2A2F3C] text-[#ECEFF4]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      onClick={() => handleToggleMissionItem(item.id)}
                      className="flex items-start gap-3 flex-1 text-left cursor-pointer pt-0.5"
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors mt-0.5 ${
                        item.completed ? "bg-[#4CAF50] border-[#4CAF50] text-[#0b0f19]" : "border-[#2A2F3C] bg-[#141927]"
                      }`}>
                        {item.completed && <CheckCircle2 className="w-4 h-4 fill-current" />}
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-xs sm:text-sm font-medium ${item.completed ? "line-through opacity-80" : ""}`}>
                            {item.title}
                          </span>
                          
                          {/* Mode Badge (learn vs prove) */}
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase ${
                            item.mode === "prove" 
                              ? "bg-[#00BCD4]/15 text-[#00BCD4] border border-[#00BCD4]/30" 
                              : "bg-[#9C27B0]/15 text-[#BA68C8] border border-[#9C27B0]/30"
                          }`}>
                            {item.mode === "prove" ? "Demostrar" : "Aprender"}
                          </span>

                          {/* Item Type Badge */}
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#141927] border border-[#2A2F3C] text-[#9FA7B8] rounded uppercase">
                            {item.type}
                          </span>
                        </div>

                        {item.description && (
                          <p className="text-[11px] text-[#9FA7B8] leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </button>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-[#9FA7B8] hidden sm:inline">
                        {item.estimatedMinutes} min
                      </span>

                      {(item.type === "challenge" || item.type === "recall" || item.type === "practice") && (
                        <Link
                          to={item.referenceId.startsWith("shell") || item.referenceId.startsWith("c0") ? `/module/${item.referenceId}` : `/challenge/${item.referenceId}`}
                          className="px-2.5 py-1 text-xs font-mono bg-[#141927] hover:bg-[#1f2840] border border-[#2A2F3C] text-[#03A9F4] rounded-lg transition-colors flex items-center gap-1"
                        >
                          <span>Abrir</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}

                      {item.type === "concept" && (
                        item.externalUrl ? (
                          <a
                            href={item.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 text-xs font-mono bg-[#141927] hover:bg-[#1f2840] border border-[#2A2F3C] text-[#9C27B0] rounded-lg transition-colors flex items-center gap-1"
                          >
                            <span>Recurso</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <Link
                            to={`/module/${item.referenceId}`}
                            className="px-2.5 py-1 text-xs font-mono bg-[#141927] hover:bg-[#1f2840] border border-[#2A2F3C] text-[#9C27B0] rounded-lg transition-colors flex items-center gap-1"
                          >
                            <span>Módulo</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        )
                      )}

                      {item.type === "peer" && (
                        <button
                          type="button"
                          onClick={() => setExpandedPeerItemId(expandedPeerItemId === item.id ? null : item.id)}
                          className="px-2.5 py-1 text-xs font-mono bg-[#141927] hover:bg-[#1f2840] border border-[#2A2F3C] text-[#00BCD4] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>Edge Cases</span>
                          {expandedPeerItemId === item.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}

                      {item.type === "review" && (
                        <Link
                          to="/norminette"
                          className="px-2.5 py-1 text-xs font-mono bg-[#141927] hover:bg-[#1f2840] border border-[#2A2F3C] text-[#E91E63] rounded-lg transition-colors flex items-center gap-1"
                        >
                          <span>Norminette</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}

                      {item.type === "habit" && (
                        <Link
                          to="/habits"
                          className="px-2.5 py-1 text-xs font-mono bg-[#141927] hover:bg-[#1f2840] border border-[#2A2F3C] text-[#FFC107] rounded-lg transition-colors flex items-center gap-1"
                        >
                          <span>Hábitos</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}

                      {item.type === "debrief" && (
                        <button
                          type="button"
                          onClick={() => setIsDebriefOpen(true)}
                          className="px-2.5 py-1 text-xs font-mono bg-[#141927] hover:bg-[#1f2840] border border-[#2A2F3C] text-[#8BC34A] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>{item.completed ? "Editar Debrief" : "Rellenar"}</span>
                          <ClipboardCheck className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Peer Evaluation Edge Cases Accordion */}
                  {item.type === "peer" && expandedPeerItemId === item.id && (
                    <div className="mt-3 pt-3 border-t border-[#2A2F3C] space-y-2 bg-[#141927]/60 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#00BCD4] font-mono">
                        <Users className="w-3.5 h-3.5" />
                        <span>Checklist de defensa en voz alta y decisiones de diseño:</span>
                      </div>
                      <p className="text-[11px] text-[#CAD2E2]">
                        Explica ante tu peer por qué elegiste cada tipo de datos, cómo gestionas la memoria y valida estos casos límite:
                      </p>
                      {item.edgeCases && item.edgeCases.length > 0 ? (
                        <ul className="space-y-1 pl-2">
                          {item.edgeCases.map((ec, idx) => (
                            <li key={idx} className="text-[11px] text-[#ECEFF4] flex items-start gap-1.5 font-mono">
                              <span className="text-[#00BCD4] font-bold">›</span>
                              <span>{ec}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[11px] text-[#9FA7B8] font-mono">
                          › Punteros NULL, buffers vacíos, límites de tipos enteros y Norminette v3.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Debrief Saved Summary preview */}
                  {item.type === "debrief" && (item.debriefData || existingDebrief) && (
                    <div className="mt-2.5 pt-2.5 border-t border-[#2A2F3C] flex flex-wrap items-center gap-2 text-[11px] font-mono">
                      <span className="px-2 py-0.5 bg-[#141927] border border-[#2A2F3C] rounded text-[#8BC34A]">
                        Dificultad: {(item.debriefData || existingDebrief)?.difficultyRating}/5
                      </span>
                      <span className="px-2 py-0.5 bg-[#141927] border border-[#2A2F3C] rounded text-[#03A9F4]">
                        Confianza: {(item.debriefData || existingDebrief)?.confidenceRating}/5
                      </span>
                      {(item.debriefData || existingDebrief)?.hardestThing && (
                        <span className="text-[#9FA7B8] italic truncate max-w-xs sm:max-w-md">
                          "{(item.debriefData || existingDebrief)?.hardestThing}"
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mission Progress Bar & Status */}
          <div className="pt-4 border-t border-[#2A2F3C] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#9FA7B8]">Completitud de la misión:</span>
                <span className="text-[#ECEFF4] font-bold">{missionProgressPct}%</span>
              </div>
              <div className="w-full h-2 bg-[#0b0f19] rounded-full overflow-hidden border border-[#2A2F3C]">
                <div
                  className="h-full bg-[#4CAF50] transition-all duration-500"
                  style={{ width: `${missionProgressPct}%` }}
                />
              </div>
            </div>

            {dailyMission.completed && (
              <span className="px-3 py-1 bg-[#4CAF50]/15 border border-[#4CAF50]/30 text-[#4CAF50] text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 self-start sm:self-auto">
                <CheckCircle2 className="w-3.5 h-3.5" />
                ¡Misión Diaria Superada!
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Skill Matrix Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#ECEFF4] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#03A9F4]" />
              <span>Matriz de Competencias 42 (Skill Matrix)</span>
            </h2>
            <p className="text-xs text-[#9FA7B8] mt-0.5">
              Escala objetiva de 0 a 5 por habilidad técnica, con criterios pedagógicos y evidencias acumuladas.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-[#141927] p-1 rounded-xl border border-[#2A2F3C]">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-[#0b0f19] text-[#4CAF50] font-bold shadow-sm"
                  : "text-[#9FA7B8] hover:text-[#ECEFF4]"
              }`}
            >
              Todas ({SKILL_DEFINITIONS.length})
            </button>
            {(Object.keys(SKILL_CATEGORIES) as SkillCategory[]).map(catKey => {
              const cat = SKILL_CATEGORIES[catKey];
              const count = SKILL_DEFINITIONS.filter(s => s.category === catKey).length;
              return (
                <button
                  key={catKey}
                  onClick={() => setSelectedCategory(catKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    selectedCategory === catKey
                      ? "bg-[#0b0f19] text-[#4CAF50] font-bold shadow-sm"
                      : "text-[#9FA7B8] hover:text-[#ECEFF4]"
                  }`}
                >
                  {cat.shortName} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Skill Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSkills.map(skill => {
            const mastery = trainingState.skills[skill.id] || { level: 0, confidence: 0, evidenceCount: 0 };
            const cat = SKILL_CATEGORIES[skill.category];
            const isExpanded = expandedSkillId === skill.id;
            const currentCriterion = skill.levels.find(l => l.level === mastery.level) || skill.levels[0];
            const nextCriterion = skill.levels.find(l => l.level === (mastery.level + 1));

            return (
              <div
                key={skill.id}
                className="bg-[#141927] border border-[#2A2F3C] hover:border-[#4CAF50]/40 rounded-2xl p-5 shadow-xl space-y-4 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${cat.color.badge}`}>
                      {cat.name}
                    </span>

                    {/* Level Badge */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0b0f19] border border-[#2A2F3C] rounded-lg">
                      <span className="text-[10px] font-mono text-[#9FA7B8]">Nivel</span>
                      <span className="text-xs font-bold font-mono text-[#4CAF50]">
                        {mastery.level}/5
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#ECEFF4]">{skill.title}</h3>
                    <p className="text-xs text-[#9FA7B8] mt-1 line-clamp-2 leading-relaxed">
                      {skill.description}
                    </p>
                  </div>

                  {/* Level progress dots */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map(lvl => (
                      <div
                        key={lvl}
                        className={`h-2 flex-1 rounded-full border transition-all ${
                          lvl <= mastery.level
                            ? "bg-[#4CAF50] border-[#4CAF50]"
                            : "bg-[#0b0f19] border-[#2A2F3C]"
                        }`}
                        title={`Nivel ${lvl}`}
                      />
                    ))}
                  </div>

                  {/* Current Mastery Criteria */}
                  <div className="p-2.5 bg-[#0b0f19] rounded-xl border border-[#2A2F3C] text-xs font-mono space-y-1">
                    <div className="text-[11px] text-[#4CAF50] font-bold">
                      {currentCriterion.label} (Nivel {mastery.level})
                    </div>
                    <p className="text-[11px] text-[#9FA7B8] leading-tight">
                      {currentCriterion.criteria}
                    </p>
                  </div>

                  {/* Expandable all levels criteria */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-[#2A2F3C] space-y-2 text-xs font-mono">
                      <span className="text-[10px] text-[#9FA7B8] uppercase font-bold block">
                        Criterios de progresión (0 a 5):
                      </span>
                      <div className="space-y-1.5">
                        {skill.levels.map(l => (
                          <div
                            key={l.level}
                            className={`p-2 rounded-lg border text-[11px] ${
                              l.level === mastery.level
                                ? "bg-[#4CAF50]/15 border-[#4CAF50]/30 text-[#ECEFF4]"
                                : "bg-[#0b0f19] border-[#2A2F3C] text-[#9FA7B8]"
                            }`}
                          >
                            <span className="font-bold text-[#ECEFF4]">Nv {l.level} · {l.label}:</span>{" "}
                            {l.criteria}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#2A2F3C] flex items-center justify-between text-xs font-mono">
                  <button
                    onClick={() => setExpandedSkillId(isExpanded ? null : skill.id)}
                    className="text-[#03A9F4] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isExpanded ? "Ocultar niveles" : "Ver 5 niveles"}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <span className="text-[#9FA7B8] text-[11px]">
                    {mastery.evidenceCount} evidencias
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#2A2F3C] pb-3">
              <h2 className="text-base font-bold text-[#ECEFF4] flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#4CAF50]" />
                <span>Configurar Perfil de Entrenamiento</span>
              </h2>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 rounded-lg text-[#9FA7B8] hover:text-[#ECEFF4] hover:bg-[#1a2236]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfileSettings} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#9FA7B8] block">
                  Fecha Objetivo de la Piscina
                </label>
                <input
                  type="date"
                  value={targetDateInput}
                  onChange={(e) => setTargetDateInput(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-[#2A2F3C] rounded-xl px-3 py-2 text-xs font-mono text-[#ECEFF4] focus:outline-none focus:border-[#4CAF50]"
                  required
                />
                <span className="text-[10px] text-[#9FA7B8]">Por defecto: 2026-10-26</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#9FA7B8] block">
                  Horas disponibles a la semana
                </label>
                <select
                  value={hoursPerWeekInput}
                  onChange={(e) => setHoursPerWeekInput(Number(e.target.value))}
                  className="w-full bg-[#0b0f19] border border-[#2A2F3C] rounded-xl px-3 py-2 text-xs font-mono text-[#ECEFF4] focus:outline-none focus:border-[#4CAF50]"
                >
                  <option value={10}>10 horas / semana (Ritmo relajado)</option>
                  <option value={15}>15 horas / semana (Estándar recomendado)</option>
                  <option value={25}>25 horas / semana (Intensivo)</option>
                  <option value={40}>40 horas / semana (Full-time / Inmersivo)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#9FA7B8] block">
                  Compromiso diario (minutos de misión)
                </label>
                <select
                  value={dailyCommitmentInput}
                  onChange={(e) => setDailyCommitmentInput(Number(e.target.value))}
                  className="w-full bg-[#0b0f19] border border-[#2A2F3C] rounded-xl px-3 py-2 text-xs font-mono text-[#ECEFF4] focus:outline-none focus:border-[#4CAF50]"
                >
                  <option value={45}>45 min / día (Mantenimiento rápido)</option>
                  <option value={60}>60 min / día (1 hora base)</option>
                  <option value={90}>90 min / día (1.5 horas - Recomendado 42)</option>
                  <option value={120}>120 min / día (2 horas - Intensivo)</option>
                  <option value={180}>180 min / día (3 horas - Inmersión total)</option>
                  <option value={240}>240 min / día (4 horas - Modo Maratón)</option>
                </select>
                <span className="text-[10px] text-[#9FA7B8]">Calibra el volumen de la misión diaria sin cortar retos.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#9FA7B8] block">
                  Ritmo de progreso
                </label>
                <select
                  value={paceInput}
                  onChange={(e) => setPaceInput(e.target.value as any)}
                  className="w-full bg-[#0b0f19] border border-[#2A2F3C] rounded-xl px-3 py-2 text-xs font-mono text-[#ECEFF4] focus:outline-none focus:border-[#4CAF50]"
                >
                  <option value="relaxed">Relajado (priorizar afianzamiento)</option>
                  <option value="standard">Estándar (equilibrio velocidad y profundidad)</option>
                  <option value="intensive">Intensivo (alta exigencia diaria)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[#2A2F3C] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 bg-[#0b0f19] hover:bg-[#1a2236] border border-[#2A2F3C] text-[#ECEFF4] text-xs font-mono rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4CAF50] hover:bg-[#43a047] text-[#0b0f19] font-bold text-xs font-mono rounded-xl shadow-md cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Technical Debrief Modal */}
      {isDebriefOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#2A2F3C] pb-3">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-[#8BC34A]" />
                <div>
                  <h2 className="text-base font-bold text-[#ECEFF4]">
                    Debrief Técnico de Sesión
                  </h2>
                  <p className="text-[10px] font-mono text-[#9FA7B8]">
                    {dailyMission.date} · Calibración determinista (sin IA)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDebriefOpen(false)}
                className="p-1 rounded-lg text-[#9FA7B8] hover:text-[#ECEFF4] hover:bg-[#1a2236] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[#0b0f19] border border-[#2A2F3C] rounded-xl text-xs text-[#CAD2E2] leading-relaxed">
              <p>
                <span className="text-[#8BC34A] font-bold font-mono">Pedagogía 42: </span>
                El debrief registra tu autoevaluación reflexiva y nivel de dificultad percibido. Permite calibrar futuras sesiones de entrenamiento adaptativo.
              </p>
              <p className="text-[10px] text-[#9FA7B8] mt-1 italic">
                * Nota: El debrief no aumenta directamente el mastery técnico.
              </p>
            </div>

            <form onSubmit={handleSaveDebrief} className="space-y-4">
              {/* Difficulty Rating 1-5 */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-[#ECEFF4] flex items-center justify-between">
                  <span>Dificultad Percibida en la Sesión</span>
                  <span className="text-[#8BC34A] font-bold">{debriefDifficulty} / 5</span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { val: 1, label: "Muy fácil" },
                    { val: 2, label: "Asequible" },
                    { val: 3, label: "Adecuada" },
                    { val: 4, label: "Exigente" },
                    { val: 5, label: "Extrema" }
                  ].map(({ val, label }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setDebriefDifficulty(val)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        debriefDifficulty === val
                          ? "bg-[#8BC34A]/20 border-[#8BC34A] text-[#8BC34A] font-bold shadow-sm"
                          : "bg-[#0b0f19] border-[#2A2F3C] text-[#9FA7B8] hover:border-[#8BC34A]/40"
                      }`}
                    >
                      <div className="text-sm font-mono font-bold">{val}</div>
                      <div className="text-[9px] truncate">{label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Confidence Rating 1-5 */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-[#ECEFF4] flex items-center justify-between">
                  <span>Nivel de Confianza Técnico Alcanzado</span>
                  <span className="text-[#03A9F4] font-bold">{debriefConfidence} / 5</span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { val: 1, label: "Inseguro" },
                    { val: 2, label: "Con dudas" },
                    { val: 3, label: "Asimilado" },
                    { val: 4, label: "Sólido" },
                    { val: 5, label: "Dominio" }
                  ].map(({ val, label }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setDebriefConfidence(val)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        debriefConfidence === val
                          ? "bg-[#03A9F4]/20 border-[#03A9F4] text-[#03A9F4] font-bold shadow-sm"
                          : "bg-[#0b0f19] border-[#2A2F3C] text-[#9FA7B8] hover:border-[#03A9F4]/40"
                      }`}
                    >
                      <div className="text-sm font-mono font-bold">{val}</div>
                      <div className="text-[9px] truncate">{label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hardest Thing Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#ECEFF4] block">
                  Obstáculo más complejo o lección aprendida (opcional)
                </label>
                <textarea
                  rows={3}
                  value={debriefHardestThing}
                  onChange={(e) => setDebriefHardestThing(e.target.value)}
                  placeholder="Ej: Gestionar el caso extremo de INT_MIN en ft_putnbr, o evitar fugas de memoria con free() en caso de fallo de malloc..."
                  className="w-full bg-[#0b0f19] border border-[#2A2F3C] rounded-xl p-3 text-xs text-[#ECEFF4] placeholder-[#5A6275] focus:outline-none focus:border-[#8BC34A] resize-none"
                />
              </div>

              <div className="pt-3 border-t border-[#2A2F3C] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDebriefOpen(false)}
                  className="px-4 py-2 bg-[#0b0f19] hover:bg-[#1a2236] border border-[#2A2F3C] text-[#ECEFF4] text-xs font-mono rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#8BC34A] hover:bg-[#7cb342] text-[#0b0f19] font-bold text-xs font-mono rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Guardar Debrief</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
