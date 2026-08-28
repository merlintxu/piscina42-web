import React from "react";
import { Link } from "react-router-dom";
import { 
  Compass, 
  Target, 
  Calendar, 
  TrendingUp, 
  Flag, 
  CheckSquare, 
  AlertTriangle, 
  BookOpen, 
  ArrowRight 
} from "lucide-react";
import { TrainingPlan, TrainingState } from "../../training/types";
import { SKILL_CATEGORIES } from "../../training/config";

interface TrainingPlanCardProps {
  trainingPlan: TrainingPlan;
  trainingState: TrainingState;
}

export const TrainingPlanCard: React.FC<TrainingPlanCardProps> = ({
  trainingPlan,
  trainingState
}) => {
  return (
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
  );
};
