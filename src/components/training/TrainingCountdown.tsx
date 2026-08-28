import React from "react";
import { Link } from "react-router-dom";
import { 
  Sparkles, 
  Calendar, 
  Settings, 
  ArrowRight, 
  CheckCircle2 
} from "lucide-react";
import { ReadinessBreakdown, TrainingProfile, DiagnosticResult } from "../../training/types";

interface TrainingCountdownProps {
  targetDate: string;
  readiness: ReadinessBreakdown;
  trainingProfile: TrainingProfile;
  diagnostic: DiagnosticResult | null;
  onOpenSettings: () => void;
}

export const TrainingCountdown: React.FC<TrainingCountdownProps> = ({
  targetDate,
  readiness,
  trainingProfile,
  diagnostic,
  onOpenSettings
}) => {
  return (
    <div className="space-y-6">
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
                <span>Fecha Objetivo: {targetDate}</span>
              </div>
              <div className="text-3xl font-extrabold font-mono text-[#ECEFF4]">
                {readiness.daysRemaining} <span className="text-sm font-normal text-[#9FA7B8]">días ({readiness.weeksRemaining} sem)</span>
              </div>
              <div className="text-xs text-[#9FA7B8] font-mono mt-0.5">
                ~{readiness.projectedHoursAvailable}h disponibles ({trainingProfile.availableHoursPerWeek}h/sem · {trainingProfile.dailyCommitmentMinutes || 90}m/día)
              </div>
            </div>

            <button
              onClick={onOpenSettings}
              className="p-2.5 rounded-xl bg-[#141927] hover:bg-[#1a2236] border border-[#2A2F3C] text-[#9FA7B8] hover:text-[#ECEFF4] transition-colors cursor-pointer"
              title="Configurar perfil de entrenamiento"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Diagnostic Prompt Banner */}
      {!diagnostic ? (
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
              Diagnóstico inicial realizado: <strong className="text-[#4CAF50]">{diagnostic.score}/{diagnostic.totalQuestions} ({diagnostic.percentage}%)</strong>
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
    </div>
  );
};
