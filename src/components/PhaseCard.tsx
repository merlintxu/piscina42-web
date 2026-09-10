import React from "react";
import { useNavigate } from "react-router-dom";
import { Phase, Module, UserProgress } from "../types";
import { ArrowRight, CheckCircle2, Code2, Flame, Layers } from "lucide-react";

interface PhaseCardProps {
  phase: Phase;
  modules: Module[];
  onOpenPhase?: (phaseId: string) => void;
  progress: UserProgress;
}

export const PhaseCard: React.FC<PhaseCardProps> = ({
  phase,
  modules,
  onOpenPhase,
  progress,
}) => {
  const navigate = useNavigate();
  const phaseModules = modules.filter(
    (m) => phase.modules?.includes(m.id) || m.phase === phase.id
  );
  const totalChallenges = phase.challenges?.length || 0;
  const completedChallenges = (phase.challenges || []).filter((cId) =>
    progress.completedChallenges.includes(cId)
  ).length;

  const pct =
    totalChallenges > 0
      ? Math.round((completedChallenges / totalChallenges) * 100)
      : 0;
  const targetUrl = `/phase/${phase.slug || phase.id}`;

  const handleClick = () => {
    if (onOpenPhase) {
      onOpenPhase(phase.id);
    } else {
      navigate(targetUrl);
    }
  };

  return (
    <div
      id={`phase-card-${phase.id}`}
      onClick={handleClick}
      className="group bg-[#141927] hover:bg-[#181f30] border border-[#2A2F3C] hover:border-[#4CAF50]/60 rounded-2xl p-5 sm:p-6 transition-all duration-300 shadow-lg flex flex-col justify-between cursor-pointer relative overflow-hidden"
    >
      {/* Top subtle accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#4CAF50]/30 to-transparent group-hover:via-[#4CAF50] transition-all duration-300" />

      <div>
        {/* Card Top Category & Progress indicator */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#4CAF50]/15 text-[#4CAF50] border border-[#4CAF50]/30 rounded-lg">
              Fase {phase.order || "·"}
            </span>
            <span className="text-[11px] font-mono text-[#9FA7B8]">
              {phaseModules.length} módulos
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono text-[#9FA7B8] bg-[#0b0f19] px-2.5 py-1 rounded-lg border border-[#2A2F3C]">
            <CheckCircle2
              className={`w-3.5 h-3.5 ${
                pct === 100 ? "text-[#4CAF50]" : pct > 0 ? "text-[#03A9F4]" : "text-[#9FA7B8]"
              }`}
            />
            <span className={pct === 100 ? "text-[#4CAF50] font-bold" : "text-[#ECEFF4]"}>
              {pct}%
            </span>
          </div>
        </div>

        {/* Título */}
        <h3 className="text-xl font-bold text-[#ECEFF4] group-hover:text-[#4CAF50] transition-colors mb-1">
          {phase.title}
        </h3>

        {/* Subtítulo: Fase, Módulo, Dificultad */}
        <div className="text-xs font-mono text-[#9FA7B8] mb-3 flex flex-wrap items-center gap-2">
          <span>Fase {phase.order || "·"}</span>
          <span>•</span>
          <span className="text-[#03A9F4]">{phaseModules.length} módulos técnicos</span>
          <span>•</span>
          <span className="text-[#4CAF50]">{totalChallenges} retos de código</span>
        </div>

        {/* Descripción */}
        <p className="text-sm text-[#9FA7B8] leading-relaxed mb-4 line-clamp-2">
          {phase.summary ||
            "Contenido y preparación estructurada para esta fase de la Piscina de 42."}
        </p>

        {/* Chips de tags / Módulos */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-[#9FA7B8]">
            <Layers className="w-3.5 h-3.5 text-[#03A9F4]" />
            <span>Módulos incluidos:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {phaseModules.slice(0, 4).map((mod) => (
              <span
                key={mod.id}
                className="px-2.5 py-1 text-xs font-mono bg-[#0b0f19] border border-[#2A2F3C] text-[#ECEFF4] rounded-lg group-hover:border-[#2A2F3C]/80"
              >
                {mod.title.split(":")[0] || mod.id}
              </span>
            ))}
            {phaseModules.length > 4 && (
              <span className="px-2 py-1 text-xs font-mono bg-[#0b0f19] border border-[#2A2F3C] text-[#9FA7B8] rounded-lg">
                +{phaseModules.length - 4} más
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer con métricas y botón/link 'Ver detalle' */}
      <div className="pt-4 border-t border-[#2A2F3C] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs font-mono text-[#9FA7B8]">
          <span className="flex items-center gap-1">
            <Code2 className="w-3.5 h-3.5 text-[#4CAF50]" />
            {completedChallenges}/{totalChallenges} retos
          </span>
          <span className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-[#FFC107]" />
            {phase.habits?.length || 0} hábitos
          </span>
        </div>

        {/* Botón o link 'Ver detalle' */}
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4CAF50] group-hover:translate-x-1 transition-all">
          <span>Ver detalle</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};

