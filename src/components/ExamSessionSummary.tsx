import React from "react";
import { ExamSimulation, Challenge } from "../types";
import {
  Trophy,
  Clock,
  RotateCcw,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  Layers,
  Sparkles,
  ShieldCheck,
  Target
} from "lucide-react";
import { getExamLevelSpec } from "../lib/examValidator";
import { ExamFinishReason } from "../hooks/useExamSession";

interface ExamSessionSummaryProps {
  exam: ExamSimulation;
  score: number;
  completedLevels: number[];
  timeSpentSeconds: number;
  finishReason: ExamFinishReason | null;
  attemptsByLevel: Record<number, number>;
  failedAttemptsByLevel: Record<number, number>;
  allChallenges: Challenge[];
  onRestart: () => void;
  onExit: () => void;
}

export const ExamSessionSummary: React.FC<ExamSessionSummaryProps> = ({
  exam,
  score,
  completedLevels,
  timeSpentSeconds,
  finishReason,
  attemptsByLevel,
  failedAttemptsByLevel,
  allChallenges,
  onRestart,
  onExit,
}) => {
  const isPassed = score >= 75;
  const totalLevels = exam.levels ? exam.levels.length : 0;
  const completedCount = completedLevels.length;

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  const totalAttempts = Object.values(attemptsByLevel).reduce((acc, n) => acc + n, 0);
  const totalFailed = Object.values(failedAttemptsByLevel).reduce((acc, n) => acc + n, 0);

  const getReasonBadge = () => {
    switch (finishReason) {
      case "completed":
        return {
          label: "Todos los niveles superados",
          color: "bg-[#4CAF50]/15 text-[#4CAF50] border-[#4CAF50]/30",
          icon: Trophy,
          description: "Has superado con éxito todos los niveles del simulacro de examen.",
        };
      case "timeout":
        return {
          label: "Tiempo Agotado",
          color: "bg-rose-500/15 text-rose-400 border-rose-500/30",
          icon: Clock,
          description: "El cronómetro oficial de la sesión ha llegado a 00:00:00.",
        };
      case "abandoned":
        return {
          label: "Sesión Abandonada",
          color: "bg-amber-500/15 text-amber-400 border-amber-500/30",
          icon: AlertTriangle,
          description: "Abandonaste el examen antes de concluir la prueba.",
        };
      case "voluntary":
      default:
        return {
          label: "Entrega Voluntaria",
          color: "bg-[#03A9F4]/15 text-[#03A9F4] border-[#03A9F4]/30",
          icon: Target,
          description: "Has finalizado y entregado tu examen voluntariamente.",
        };
    }
  };

  const reasonInfo = getReasonBadge();
  const ReasonIcon = reasonInfo.icon;

  return (
    <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Top Banner Result */}
      <div
        className={`p-6 sm:p-8 rounded-2xl border text-center space-y-4 relative overflow-hidden ${
          isPassed
            ? "bg-gradient-to-b from-[#4CAF50]/15 to-[#141927] border-[#4CAF50]/40"
            : "bg-gradient-to-b from-rose-500/10 to-[#141927] border-rose-500/30"
        }`}
      >
        <div className="flex justify-center">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center border shadow-xl ${
              isPassed
                ? "bg-[#4CAF50]/20 text-[#4CAF50] border-[#4CAF50]/50 shadow-[#4CAF50]/20"
                : "bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-rose-500/15"
            }`}
          >
            {isPassed ? <Trophy className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
          </div>
        </div>

        <div className="space-y-1">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold rounded-lg border uppercase tracking-wider ${reasonInfo.color}`}
          >
            <ReasonIcon className="w-3.5 h-3.5" />
            {reasonInfo.label}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ECEFF4] tracking-tight">
            {isPassed ? "¡Examen Aprobado!" : "Examen No Superado"}
          </h2>
          <p className="text-xs sm:text-sm text-[#9FA7B8] max-w-lg mx-auto">
            {reasonInfo.description}
          </p>
        </div>

        {/* Big Score Display */}
        <div className="inline-flex items-baseline gap-2 bg-[#0b0f19] px-6 py-3 rounded-2xl border border-[#2A2F3C] shadow-inner">
          <span className="text-xs font-mono text-[#9FA7B8] uppercase">Calificación:</span>
          <span
            className={`text-3xl sm:text-4xl font-extrabold font-mono ${
              isPassed ? "text-[#4CAF50]" : "text-rose-400"
            }`}
          >
            {score}
          </span>
          <span className="text-sm font-mono text-[#9FA7B8]">/ 100</span>
        </div>
      </div>

      {/* Metric summary grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Metric 1: Niveles superados */}
        <div className="bg-[#0b0f19] border border-[#2A2F3C] p-4 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#9FA7B8]">
            <Layers className="w-3.5 h-3.5 text-[#03A9F4]" />
            <span>Niveles</span>
          </div>
          <div className="text-xl font-bold font-mono text-[#ECEFF4]">
            {completedCount} <span className="text-xs text-[#9FA7B8] font-normal">/ {totalLevels}</span>
          </div>
          <div className="text-[11px] text-[#9FA7B8]">
            {Math.round((completedCount / Math.max(1, totalLevels)) * 100)}% de progreso
          </div>
        </div>

        {/* Metric 2: Tiempo empleado */}
        <div className="bg-[#0b0f19] border border-[#2A2F3C] p-4 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#9FA7B8]">
            <Clock className="w-3.5 h-3.5 text-[#FFC107]" />
            <span>Tiempo Usado</span>
          </div>
          <div className="text-xl font-bold font-mono text-[#ECEFF4]">
            {formatDuration(timeSpentSeconds)}
          </div>
          <div className="text-[11px] text-[#9FA7B8]">
            de {exam.duration_minutes} min totales
          </div>
        </div>

        {/* Metric 3: Total Intentos */}
        <div className="bg-[#0b0f19] border border-[#2A2F3C] p-4 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#9FA7B8]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#4CAF50]" />
            <span>Intentos Totales</span>
          </div>
          <div className="text-xl font-bold font-mono text-[#ECEFF4]">{totalAttempts}</div>
          <div className="text-[11px] text-[#9FA7B8]">a través de Moulinette</div>
        </div>

        {/* Metric 4: Intentos Fallidos */}
        <div className="bg-[#0b0f19] border border-[#2A2F3C] p-4 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#9FA7B8]">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Intentos Fallidos</span>
          </div>
          <div className="text-xl font-bold font-mono text-[#ECEFF4]">{totalFailed}</div>
          <div className="text-[11px] text-[#9FA7B8]">fallos de norma o firma</div>
        </div>
      </div>

      {/* Level by level breakdown table */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#9FA7B8] flex items-center gap-2">
          <Award className="w-4 h-4 text-[#03A9F4]" />
          Desglose por Niveles del Examen
        </h4>

        <div className="space-y-2">
          {exam.levels?.map((levelId, idx) => {
            const isLevelPassed = completedLevels.includes(idx);
            const spec = getExamLevelSpec(levelId, allChallenges);
            const attempts = attemptsByLevel[idx] || 0;
            const fails = failedAttemptsByLevel[idx] || 0;

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isLevelPassed
                    ? "bg-[#0b0f19] border-[#4CAF50]/30"
                    : "bg-[#0b0f19]/60 border-[#2A2F3C]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                      isLevelPassed
                        ? "bg-[#4CAF50]/20 text-[#4CAF50] border border-[#4CAF50]/40"
                        : "bg-[#141927] text-[#9FA7B8] border border-[#2A2F3C]"
                    }`}
                  >
                    L{idx}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#ECEFF4]">
                        {spec.assignmentName}
                      </span>
                      <span className="text-[11px] font-mono text-[#9FA7B8]">
                        ({spec.expectedFile})
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#9FA7B8] flex items-center gap-2 mt-0.5">
                      <span>Prototipo: <code className="text-[#03A9F4]">{spec.signature}</code></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="text-[#9FA7B8] text-right">
                    <span>{attempts} intentos</span>
                    {fails > 0 && (
                      <span className="text-rose-400 ml-1">({fails} fallos)</span>
                    )}
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border ${
                      isLevelPassed
                        ? "bg-[#4CAF50]/15 text-[#4CAF50] border-[#4CAF50]/30"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}
                  >
                    {isLevelPassed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>OK (100)</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>KO (0)</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="pt-4 border-t border-[#2A2F3C] flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={onExit}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0b0f19] hover:bg-[#181f30] text-[#ECEFF4] border border-[#2A2F3C] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo de Exámenes</span>
        </button>

        <button
          onClick={onRestart}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#4CAF50] hover:bg-[#43a047] text-[#0b0f19] text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#4CAF50]/20 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 fill-[#0b0f19]" />
          <span>Repetir este Examen</span>
        </button>
      </div>
    </div>
  );
};
