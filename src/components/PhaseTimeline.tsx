import React from "react";
import { useNavigate } from "react-router-dom";
import { Phase, UserProgress } from "../types";
import { CheckCircle2, Circle, Compass } from "lucide-react";

interface PhaseTimelineProps {
  phases: Phase[];
  selectedPhaseId?: string;
  onSelectPhase?: (phaseId: string) => void;
  progress: UserProgress;
}

export const PhaseTimeline: React.FC<PhaseTimelineProps> = ({
  phases,
  selectedPhaseId,
  onSelectPhase,
  progress
}) => {
  const navigate = useNavigate();

  const handlePhaseClick = (phase: Phase) => {
    if (onSelectPhase) {
      onSelectPhase(phase.id);
    } else {
      navigate(`/phase/${phase.slug || phase.id}`);
    }
  };

  return (
    <div className="w-full bg-[#141927] border border-[#2A2F3C] rounded-2xl p-4 md:p-6 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#4CAF50]" />
            <h2 className="text-lg font-bold text-[#ECEFF4]">Ruta de Aprendizaje · 42 Piscine</h2>
          </div>
          <p className="text-xs text-[#9FA7B8] mt-0.5">
            4 fases progresivas desde el primer comando en terminal hasta la simulación del examen final.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#9FA7B8]">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#4CAF50]"></span>
          <span>4 Fases</span>
          <span className="text-[#2A2F3C]">|</span>
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#03A9F4]"></span>
          <span>9 Módulos</span>
        </div>
      </div>

      {/* Steps Horizontal Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
        {phases.map((phase, idx) => {
          const isSelected = selectedPhaseId === phase.id;
          const orderNum = phase.order ?? idx + 1;
          
          // Calculate phase challenges completion
          const phaseChallenges = phase.challenges || [];
          const completedInPhase = phaseChallenges.filter(id => progress.completedChallenges.includes(id)).length;
          const isAllDone = phaseChallenges.length > 0 && completedInPhase === phaseChallenges.length;

          return (
            <div
              key={phase.id}
              id={`timeline-step-${phase.id}`}
              onClick={() => handlePhaseClick(phase)}
              className={`relative flex flex-col p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                isSelected
                  ? "bg-[#1a2236] border-[#4CAF50] ring-2 ring-[#4CAF50]/30 shadow-lg shadow-[#4CAF50]/10"
                  : "bg-[#0b0f19] border-[#2A2F3C] hover:border-[#9FA7B8]/40 hover:bg-[#0f1523]"
              }`}
            >
              {/* Header inside card */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                    isSelected 
                      ? "bg-[#4CAF50] text-[#0b0f19]" 
                      : isAllDone
                      ? "bg-[#4CAF50]/20 text-[#4CAF50] border border-[#4CAF50]"
                      : "bg-[#2A2F3C] text-[#ECEFF4]"
                  }`}>
                    {orderNum}
                  </span>
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-[#9FA7B8]">
                    Fase {orderNum}
                  </span>
                </div>
                {isAllDone ? (
                  <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-[#2A2F3C]" />
                )}
              </div>

              {/* Title & summary */}
              <h3 className="font-bold text-sm text-[#ECEFF4] line-clamp-1 mb-1 group-hover:text-[#4CAF50]">
                {phase.title}
              </h3>
              <p className="text-xs text-[#9FA7B8] line-clamp-2 leading-relaxed flex-1">
                {phase.summary || "Objetivos y módulos clave de esta fase formativa."}
              </p>

              {/* Footer mini stats */}
              <div className="mt-3 pt-3 border-t border-[#2A2F3C] flex items-center justify-between text-[11px] font-mono text-[#9FA7B8]">
                <span>{phase.modules?.length || 0} Módulos</span>
                <span>{phase.challenges?.length || 0} Retos</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
