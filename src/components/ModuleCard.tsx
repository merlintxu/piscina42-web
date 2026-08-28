import React from "react";
import { useNavigate } from "react-router-dom";
import { Module, Challenge, UserProgress } from "../types";
import { ArrowRight, Code2, AlertTriangle, CheckCircle2, Tag } from "lucide-react";

interface ModuleCardProps {
  module: Module;
  challenges: Challenge[];
  onOpenModule?: (moduleId: string) => void;
  progress: UserProgress;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  challenges,
  onOpenModule,
  progress,
}) => {
  const navigate = useNavigate();
  const moduleChallenges = challenges.filter(
    (c) => c.module === module.id || module.challenges?.includes(c.id)
  );
  const completedCount = moduleChallenges.filter((c) =>
    progress.completedChallenges.includes(c.id)
  ).length;

  const levelBadge = {
    basic: {
      label: "Básico",
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/30",
    },
    intermediate: {
      label: "Intermedio",
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/30",
    },
    advanced: {
      label: "Avanzado",
      bg: "bg-rose-500/10",
      text: "text-rose-400",
      border: "border-rose-500/30",
    },
  }[module.level || "basic"] || {
    label: "Básico",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
  };

  const isCompleted =
    moduleChallenges.length > 0 && completedCount === moduleChallenges.length;

  const handleClick = () => {
    if (onOpenModule) {
      onOpenModule(module.id);
    } else {
      navigate(`/module/${module.slug || module.id}`);
    }
  };

  return (
    <div
      id={`module-card-${module.id}`}
      onClick={handleClick}
      className="group bg-[#141927] hover:bg-[#181f30] border border-[#2A2F3C] hover:border-[#03A9F4]/60 rounded-2xl p-5 sm:p-6 transition-all duration-300 shadow-md flex flex-col justify-between cursor-pointer relative overflow-hidden"
    >
      {/* Top subtle accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#03A9F4]/30 to-transparent group-hover:via-[#03A9F4] transition-all duration-300" />

      <div>
        {/* Top Chips & Progress Indicator */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border ${levelBadge.bg} ${levelBadge.text} ${levelBadge.border}`}
            >
              {levelBadge.label}
            </span>
            <span className="text-[11px] font-mono text-[#9FA7B8] bg-[#0b0f19] px-2 py-0.5 rounded border border-[#2A2F3C]">
              {module.id}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono text-[#9FA7B8] bg-[#0b0f19] px-2.5 py-1 rounded-lg border border-[#2A2F3C]">
            <CheckCircle2
              className={`w-3.5 h-3.5 ${
                isCompleted ? "text-[#4CAF50]" : completedCount > 0 ? "text-[#03A9F4]" : "text-[#9FA7B8]"
              }`}
            />
            <span>
              {completedCount}/{moduleChallenges.length}
            </span>
          </div>
        </div>

        {/* Título */}
        <h4 className="text-lg font-bold text-[#ECEFF4] group-hover:text-[#03A9F4] transition-colors mb-1">
          {module.title}
        </h4>

        {/* Subtítulo: Fase, Módulo, Dificultad */}
        <div className="text-xs font-mono text-[#9FA7B8] mb-3 flex flex-wrap items-center gap-2">
          <span>Fase: {module.phase || "fase1"}</span>
          <span>•</span>
          <span className={levelBadge.text}>Nivel {levelBadge.label}</span>
          <span>•</span>
          <span>{moduleChallenges.length} retos</span>
        </div>

        {/* Chips de tags / Conceptos clave */}
        {module.concepts && module.concepts.length > 0 && (
          <div className="mb-4 space-y-1.5">
            <div className="flex items-center gap-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-[#9FA7B8]">
              <Tag className="w-3 h-3 text-[#03A9F4]" />
              <span>Conceptos clave:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {module.concepts.slice(0, 3).map((concept, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 text-xs font-mono bg-[#0b0f19] border border-[#2A2F3C] text-[#ECEFF4] rounded-lg truncate max-w-[200px]"
                >
                  {concept}
                </span>
              ))}
              {module.concepts.length > 3 && (
                <span className="px-2 py-1 text-xs font-mono bg-[#0b0f19] text-[#9FA7B8] rounded-lg border border-[#2A2F3C]">
                  +{module.concepts.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Alerta de dificultad cognitiva si existe */}
        {module.cognitive_difficulties && module.cognitive_difficulties.length > 0 && (
          <div className="mb-4 p-2.5 rounded-xl bg-[#FFC107]/5 border border-[#FFC107]/20 text-xs text-[#FFC107] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#FFC107]" />
            <p className="line-clamp-2 leading-relaxed">
              <span className="font-semibold">Dificultad clave:</span> {module.cognitive_difficulties[0]}
            </p>
          </div>
        )}
      </div>

      {/* Footer con info secundaria y botón 'Ver detalle' */}
      <div className="pt-4 border-t border-[#2A2F3C] flex items-center justify-between text-xs gap-2">
        <span className="font-mono text-[#9FA7B8] flex items-center gap-1.5">
          <Code2 className="w-3.5 h-3.5 text-[#4CAF50]" />
          {moduleChallenges.length} retos asignados
        </span>

        {/* Botón o link 'Ver detalle' */}
        <span className="inline-flex items-center gap-1.5 font-semibold text-[#03A9F4] group-hover:translate-x-1 transition-all">
          <span>Ver detalle</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};

