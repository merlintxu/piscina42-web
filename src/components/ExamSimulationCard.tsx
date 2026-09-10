import React from "react";
import { ExamSimulation } from "../types";
import { Clock, Play, Award, ArrowRight, Layers } from "lucide-react";

interface ExamSimulationCardProps {
  exam: ExamSimulation;
  pastResult?: { score: number; date?: string };
  onStartExam: (exam: ExamSimulation) => void;
  onOpenDetail?: (exam: ExamSimulation) => void;
}

export const ExamSimulationCard: React.FC<ExamSimulationCardProps> = ({
  exam,
  pastResult,
  onStartExam,
  onOpenDetail,
}) => {
  const handleClick = () => {
    if (onOpenDetail) {
      onOpenDetail(exam);
    } else {
      onStartExam(exam);
    }
  };

  const isPassed = pastResult && pastResult.score >= 75;

  return (
    <div
      id={`exam-card-${exam.id}`}
      onClick={handleClick}
      className="group bg-[#141927] hover:bg-[#181f30] border border-[#2A2F3C] hover:border-[#4CAF50]/60 rounded-2xl p-5 sm:p-6 transition-all duration-300 shadow-lg flex flex-col justify-between cursor-pointer relative overflow-hidden"
    >
      {/* Top subtle accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#4CAF50]/30 to-transparent group-hover:via-[#4CAF50] transition-all duration-300" />

      <div>
        {/* Top Header & Duration badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#4CAF50]/15 text-[#4CAF50] border border-[#4CAF50]/30 rounded-lg">
              {exam.id}
            </span>
            <span className="text-[11px] font-mono text-[#9FA7B8] bg-[#0b0f19] px-2 py-0.5 rounded border border-[#2A2F3C]">
              Examshell
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono text-[#9FA7B8] bg-[#0b0f19] px-2.5 py-1 rounded-lg border border-[#2A2F3C]">
            <Clock className="w-3.5 h-3.5 text-[#03A9F4]" />
            <span>
              {exam.duration_minutes} min ({Math.round(exam.duration_minutes / 60)}h)
            </span>
          </div>
        </div>

        {/* Título */}
        <h3 className="text-xl font-bold text-[#ECEFF4] group-hover:text-[#4CAF50] transition-colors mb-1">
          {exam.title}
        </h3>

        {/* Subtítulo: Fase, Módulo, Dificultad */}
        <div className="text-xs font-mono text-[#9FA7B8] mb-3 flex flex-wrap items-center gap-2">
          <span>Examen Oficial</span>
          <span>•</span>
          <span className="text-[#03A9F4]">{exam.duration_minutes} min cronometrados</span>
          <span>•</span>
          <span className="text-[#FFC107]">{exam.levels?.length || 0} Niveles</span>
        </div>

        {/* Descripción */}
        {exam.description && (
          <p className="text-xs text-[#9FA7B8] leading-relaxed mb-4 line-clamp-2">
            {exam.description}
          </p>
        )}

        {/* Chips de tags / Niveles del examen */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-[#9FA7B8]">
            <Layers className="w-3.5 h-3.5 text-[#03A9F4]" />
            <span>Niveles de prueba ({exam.levels?.length || 0}):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {exam.levels?.map((lvl, i) => (
              <span
                key={i}
                className="px-2.5 py-1 text-xs font-mono bg-[#0b0f19] border border-[#2A2F3C] text-[#ECEFF4] rounded-lg"
              >
                L{i}: {lvl}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer con historial y botón 'Ver detalle' / Comenzar */}
      <div className="pt-4 border-t border-[#2A2F3C] flex items-center justify-between gap-2">
        <div>
          {pastResult ? (
            <span
              className={`text-xs font-mono font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${
                isPassed
                  ? "bg-[#4CAF50]/15 text-[#4CAF50] border-[#4CAF50]/30"
                  : "bg-amber-500/15 text-amber-400 border-amber-500/30"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Nota: {pastResult.score}/100</span>
            </span>
          ) : (
            <span className="text-xs font-mono text-[#9FA7B8] bg-[#0b0f19] px-2 py-1 rounded border border-[#2A2F3C]">
              No realizado
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Botón o link 'Ver detalle' */}
          <span className="text-xs font-semibold text-[#03A9F4] group-hover:translate-x-0.5 transition-all inline-flex items-center gap-1">
            <span>Ver detalle</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartExam(exam);
            }}
            className="px-3.5 py-1.5 bg-[#4CAF50] hover:bg-[#43a047] text-[#0b0f19] font-bold text-xs rounded-xl shadow-md shadow-[#4CAF50]/15 flex items-center gap-1.5 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-[#0b0f19]" />
            <span>Simular</span>
          </button>
        </div>
      </div>
    </div>
  );
};
