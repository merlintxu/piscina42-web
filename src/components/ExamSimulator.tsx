import React, { useState } from "react";
import { ExamSimulation, Challenge, UserProgress } from "../types";
import {
  Clock,
  Play,
  RotateCcw,
  Trophy,
  ShieldCheck,
  AlertTriangle,
  FileCode,
  Check,
  ArrowRight,
  ArrowLeft,
  Lock,
  CheckCircle2,
  Terminal,
  ShieldAlert,
  Award,
  Layers,
  Sparkles,
  Info,
  HelpCircle
} from "lucide-react";
import { ExamSimulationCard } from "./ExamSimulationCard";
import { ExamSessionSummary } from "./ExamSessionSummary";
import { useExamSession } from "../hooks/useExamSession";
import { getExamLevelSpec } from "../lib/examValidator";

interface ExamSimulatorProps {
  exams: ExamSimulation[];
  allChallenges: Challenge[];
  progress: UserProgress;
  onSaveExamScore: (examId: string, score: number) => void;
}

export const ExamSimulator: React.FC<ExamSimulatorProps> = ({
  exams,
  allChallenges,
  progress,
  onSaveExamScore,
}) => {
  const {
    selectedExam,
    status,
    currentLevelIndex,
    unlockedLevelMaxIndex,
    completedLevels,
    timeLeft,
    timeSpentSeconds,
    submittedCode,
    evalResults,
    attemptsByLevel,
    failedAttemptsByLevel,
    finishReason,
    finalScore,
    openPreflight,
    startExam,
    cancelPreflight,
    selectLevel,
    updateCode,
    resetLevelTemplate,
    gradeCurrentLevel,
    finishExam,
    restartExam,
  } = useExamSession(allChallenges, onSaveExamScore);

  const [showAbandonConfirm, setShowAbandonConfirm] = useState<boolean>(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState<boolean>(false);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const currentLevelId =
    selectedExam && selectedExam.levels && selectedExam.levels[currentLevelIndex]
      ? selectedExam.levels[currentLevelIndex]
      : "";
  const currentSpec = currentLevelId
    ? getExamLevelSpec(currentLevelId, allChallenges)
    : null;
  const currentEvaluation = evalResults[currentLevelIndex];

  return (
    <div className="space-y-8">
      {/* Overview Banner - shown in idle and preflight */}
      {status === "idle" && (
        <div className="bg-gradient-to-r from-[#141927] to-[#182035] border border-[#2A2F3C] rounded-2xl p-6 md:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#FFC107]/15 text-[#FFC107] border border-[#FFC107]/30 rounded-lg flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Simulador Examshell
                </span>
                <span className="text-xs font-mono text-[#9FA7B8]">Entorno Real 42</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#ECEFF4] tracking-tight">
                Simulador de Exámenes de la Piscina
              </h2>
              <p className="text-sm text-[#9FA7B8] leading-relaxed">
                Entrena bajo las condiciones de examen de 42: cronómetro estricto, flujo por niveles secuenciales y validación estricta de <strong>Norminette</strong> antes de la corrección de <strong>Moulinette</strong>.
              </p>
            </div>

            <div className="bg-[#0b0f19] border border-[#2A2F3C] p-4 rounded-xl flex items-center gap-4 shrink-0">
              <div className="w-12 h-12 rounded-xl bg-[#4CAF50]/15 border border-[#4CAF50]/30 flex items-center justify-center text-[#4CAF50]">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-mono text-[#9FA7B8]">Exámenes Realizados</div>
                <div className="text-lg font-bold text-[#ECEFF4] font-mono">
                  {Object.keys(progress.completedExams).length} / {exams.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. PREFLIGHT SCREEN (Estado Preflight)                         */}
      {/* ------------------------------------------------------------- */}
      {status === "preflight" && selectedExam && (
        <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-8 animate-fadeIn max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#2A2F3C]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#03A9F4]/15 text-[#03A9F4] border border-[#03A9F4]/30 rounded-lg">
                  Preflight Check
                </span>
                <span className="text-xs font-mono text-[#9FA7B8]">
                  ID: {selectedExam.id}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ECEFF4] tracking-tight">
                {selectedExam.title}
              </h2>
            </div>

            <button
              onClick={cancelPreflight}
              className="self-start sm:self-center px-4 py-2 rounded-xl bg-[#0b0f19] hover:bg-[#181f30] text-[#9FA7B8] hover:text-[#ECEFF4] border border-[#2A2F3C] text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Catálogo</span>
            </button>
          </div>

          {/* Key Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#0b0f19] border border-[#2A2F3C] p-4 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#9FA7B8]">
                <Clock className="w-3.5 h-3.5 text-[#03A9F4]" />
                <span>Duración Estricta</span>
              </div>
              <div className="text-xl font-bold font-mono text-[#ECEFF4]">
                {selectedExam.duration_minutes} minutos
              </div>
              <div className="text-[11px] text-[#9FA7B8]">
                ({Math.round(selectedExam.duration_minutes / 60)} horas de cronómetro)
              </div>
            </div>

            <div className="bg-[#0b0f19] border border-[#2A2F3C] p-4 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#9FA7B8]">
                <Layers className="w-3.5 h-3.5 text-[#FFC107]" />
                <span>Niveles de Retos</span>
              </div>
              <div className="text-xl font-bold font-mono text-[#ECEFF4]">
                {selectedExam.levels?.length || 0} Niveles
              </div>
              <div className="text-[11px] text-[#9FA7B8]">
                Secuenciales (L0 a L{(selectedExam.levels?.length || 1) - 1})
              </div>
            </div>

            <div className="bg-[#0b0f19] border border-[#2A2F3C] p-4 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#9FA7B8]">
                <Award className="w-3.5 h-3.5 text-[#4CAF50]" />
                <span>Criterio de Aprobado</span>
              </div>
              <div className="text-xl font-bold font-mono text-[#4CAF50]">
                ≥ 75 / 100
              </div>
              <div className="text-[11px] text-[#9FA7B8]">
                Norminette limpia obligatoria
              </div>
            </div>
          </div>

          {/* Description */}
          {selectedExam.description && (
            <div className="p-4 bg-[#0b0f19] border border-[#2A2F3C] rounded-xl text-xs sm:text-sm text-[#CAD2E2] leading-relaxed">
              <strong className="text-[#ECEFF4] block mb-1">Descripción:</strong>
              {selectedExam.description}
            </div>
          )}

          {/* Exam Rules & Norminette requirements */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#9FA7B8] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#FFC107]" />
              Reglas y Condiciones del Examen (Modo Examshell)
            </h4>

            <div className="bg-[#0b0f19] border border-[#2A2F3C] p-5 rounded-xl space-y-3 text-xs leading-relaxed text-[#9FA7B8]">
              {selectedExam.rules && selectedExam.rules.length > 0 ? (
                <ul className="space-y-2">
                  {selectedExam.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-[#ECEFF4]">
                      <span className="text-[#03A9F4] font-mono font-bold">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="pt-3 border-t border-[#2A2F3C] space-y-2">
                <span className="text-[#FFC107] font-semibold block">Condiciones de entrega obligatorias:</span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#CAD2E2]">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#4CAF50] shrink-0" />
                    <span>Encabezado oficial de 42 al inicio del archivo.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#4CAF50] shrink-0" />
                    <span>Prohibido el uso de for, do-while, switch o goto.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#4CAF50] shrink-0" />
                    <span>Máximo 25 líneas por función y 80 columnas.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#4CAF50] shrink-0" />
                    <span>Firma exacta y nombres de función solicitados.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Level Preview List */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#9FA7B8] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#03A9F4]" />
              Secuencia de Niveles
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedExam.levels?.map((lvl, idx) => {
                const spec = getExamLevelSpec(lvl, allChallenges);
                return (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#0b0f19] border border-[#2A2F3C] rounded-xl flex items-center justify-between gap-3 text-xs font-mono"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-[#141927] border border-[#2A2F3C] text-[#03A9F4] font-bold rounded-lg">
                        L{idx}
                      </span>
                      <div>
                        <span className="text-[#ECEFF4] font-bold block">{spec.assignmentName}</span>
                        <span className="text-[11px] text-[#9FA7B8]">{spec.expectedFile}</span>
                      </div>
                    </div>

                    <span className="text-[11px] text-[#9FA7B8] bg-[#141927] px-2 py-1 rounded border border-[#2A2F3C]">
                      {idx === 0 ? "Inicial" : "Bloqueado"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Warning & Start Exam CTA */}
          <div className="pt-4 border-t border-[#2A2F3C] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#9FA7B8] flex items-center gap-2">
              <Info className="w-4 h-4 text-[#03A9F4] shrink-0" />
              <span>Al pulsar Comenzar se activará el temporizador de {selectedExam.duration_minutes} minutos.</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={cancelPreflight}
                className="w-1/2 sm:w-auto px-5 py-3 rounded-xl bg-[#0b0f19] hover:bg-[#181f30] text-[#ECEFF4] border border-[#2A2F3C] text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                id="btn-start-exam-session"
                onClick={startExam}
                className="w-1/2 sm:w-auto px-7 py-3 rounded-xl bg-[#4CAF50] hover:bg-[#43a047] text-[#0b0f19] text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-[#4CAF50]/20 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-[#0b0f19]" />
                <span>Comenzar Examen</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. RUNNING EXAM SCREEN (Sesión en Curso)                      */}
      {/* ------------------------------------------------------------- */}
      {status === "running" && selectedExam && currentSpec && (
        <div className="bg-[#141927] border-2 border-[#03A9F4] rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6 animate-fadeIn">
          {/* Active Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#2A2F3C]">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4CAF50] animate-pulse"></span>
                <span className="text-xs font-mono text-[#4CAF50] uppercase font-bold">
                  Examen en Curso · Modo Examshell
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#ECEFF4] mt-1">
                {selectedExam.title}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              {/* Countdown Clock */}
              <div
                className={`px-4 py-2 rounded-xl font-mono text-lg sm:text-xl font-bold border flex items-center gap-2 shadow-inner ${
                  timeLeft < 600
                    ? "bg-rose-500/15 border-rose-500 text-rose-400 animate-pulse"
                    : "bg-[#0b0f19] border-[#2A2F3C] text-[#03A9F4]"
                }`}
              >
                <Clock className="w-5 h-5" />
                <span>{formatTime(timeLeft)}</span>
              </div>

              {/* Finish Exam Button */}
              <button
                onClick={() => setShowFinishConfirm(true)}
                className="px-3.5 py-2 rounded-xl bg-[#4CAF50]/15 hover:bg-[#4CAF50]/25 border border-[#4CAF50]/30 text-[#4CAF50] font-bold text-xs transition-colors cursor-pointer"
              >
                Entregar Examen
              </button>

              {/* Abandon Exam Button */}
              <button
                onClick={() => setShowAbandonConfirm(true)}
                className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-xs transition-colors cursor-pointer"
              >
                Abandonar
              </button>
            </div>
          </div>

          {/* Sequential Level Tabs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-[#9FA7B8]">
              <span>Niveles de examen:</span>
              <span>
                Superados: {completedLevels.length} / {selectedExam.levels.length}
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {selectedExam.levels?.map((lvl, idx) => {
                const isCompleted = completedLevels.includes(idx);
                const isCurrent = currentLevelIndex === idx;
                const isUnlocked = idx <= unlockedLevelMaxIndex || isCompleted;
                const levelSpec = getExamLevelSpec(lvl, allChallenges);

                return (
                  <button
                    key={idx}
                    disabled={!isUnlocked}
                    onClick={() => isUnlocked && selectLevel(idx)}
                    className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 border whitespace-nowrap ${
                      isCurrent
                        ? "bg-[#03A9F4] text-[#0b0f19] border-[#03A9F4] shadow-md shadow-[#03A9F4]/20 cursor-default"
                        : isCompleted
                        ? "bg-[#4CAF50]/15 border-[#4CAF50]/40 text-[#4CAF50] hover:bg-[#4CAF50]/25 cursor-pointer"
                        : isUnlocked
                        ? "bg-[#0b0f19] border-[#2A2F3C] text-[#ECEFF4] hover:border-[#03A9F4]/50 cursor-pointer"
                        : "bg-[#0b0f19]/40 border-[#2A2F3C]/40 text-[#9FA7B8]/40 cursor-not-allowed opacity-60"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : !isUnlocked ? (
                      <Lock className="w-3.5 h-3.5 text-[#9FA7B8]/40" />
                    ) : null}
                    <span>
                      L{idx}: {levelSpec.assignmentName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Level Workspace: Subject & Editor */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Assignment Subject */}
            <div className="bg-[#0b0f19] border border-[#2A2F3C] rounded-xl p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#03A9F4] uppercase font-bold flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    Enunciado Oficial · Nivel {currentLevelIndex}
                  </span>
                  <span className="text-xs font-mono text-[#9FA7B8] bg-[#141927] px-2.5 py-1 rounded border border-[#2A2F3C]">
                    ID: {currentLevelId}
                  </span>
                </div>

                <div className="p-4 bg-[#141927] border border-[#2A2F3C] rounded-xl text-xs sm:text-sm font-mono leading-relaxed space-y-2.5 text-[#ECEFF4]">
                  <div className="flex items-center justify-between border-b border-[#2A2F3C] pb-2">
                    <span className="text-[#9FA7B8]">Assignment name:</span>
                    <span className="text-[#4CAF50] font-bold">{currentSpec.assignmentName}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#2A2F3C] pb-2">
                    <span className="text-[#9FA7B8]">Expected files:</span>
                    <span className="text-[#ECEFF4] font-semibold">{currentSpec.expectedFile}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#2A2F3C] pb-2">
                    <span className="text-[#9FA7B8]">Allowed functions:</span>
                    <span className="text-[#FFC107] font-semibold">{currentSpec.allowedFunctions}</span>
                  </div>

                  <div className="pt-2">
                    <span className="text-[#9FA7B8] block mb-1">Prototipo oficial requerido:</span>
                    <div className="p-2.5 bg-[#0b0f19] border border-[#2A2F3C] rounded-lg text-[#03A9F4] font-bold overflow-x-auto text-xs">
                      {currentSpec.signature}
                    </div>
                  </div>

                  <div className="pt-2 text-xs leading-relaxed text-[#9FA7B8]">
                    <p className="text-[#ECEFF4] mb-2">{currentSpec.description}</p>
                    <p>
                      Escribe la función en C cumpliendo estrictamente con <code className="text-[#FFC107]">La Norma (Norminette)</code>:
                    </p>
                    <ul className="list-disc list-inside space-y-1 mt-1 text-[11px] text-[#9FA7B8]">
                      <li>Encabezado oficial de 42 al inicio.</li>
                      <li>Prohibido el uso de <code className="text-rose-400">for</code>, <code className="text-rose-400">do-while</code>, <code className="text-rose-400">switch</code> o <code className="text-rose-400">goto</code>.</li>
                      <li>Máximo 25 líneas por función y máximo 80 columnas por línea.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Status footer for this level */}
              <div className="p-3 bg-[#0b0f19] border border-[#2A2F3C] rounded-xl flex items-center justify-between text-xs font-mono">
                <span className="text-[#9FA7B8]">
                  Intentos en este nivel: {attemptsByLevel[currentLevelIndex] || 0}
                </span>
                {completedLevels.includes(currentLevelIndex) && (
                  <span className="text-[#4CAF50] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Superado
                  </span>
                )}
              </div>
            </div>

            {/* Right: Code Editor & Moulinette Tester */}
            <div className="bg-[#0b0f19] border border-[#2A2F3C] rounded-xl p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-[#9FA7B8]">
                    <FileCode className="w-3.5 h-3.5 text-[#03A9F4]" />
                    <span>{currentSpec.expectedFile}</span>
                  </div>
                  <button
                    onClick={() => resetLevelTemplate(currentLevelIndex)}
                    className="text-[11px] text-[#9FA7B8] hover:text-[#ECEFF4] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restablecer plantilla</span>
                  </button>
                </div>

                <textarea
                  value={
                    submittedCode[currentLevelIndex] ?? currentSpec.starterTemplate
                  }
                  onChange={(e) => updateCode(currentLevelIndex, e.target.value)}
                  placeholder={`// Escribe o pega tu código C aquí...\n${currentSpec.signature}\n{\n\t// tu código...\n}`}
                  rows={13}
                  className="w-full bg-[#141927] border border-[#2A2F3C] rounded-xl p-3.5 text-xs font-mono text-[#ECEFF4] focus:outline-none focus:border-[#4CAF50] resize-y font-normal leading-relaxed"
                />

                {/* Moulinette / Grademe Feedback Area */}
                {currentEvaluation && (
                  <div
                    className={`p-4 rounded-xl border space-y-3 animate-fadeIn ${
                      currentEvaluation.passed
                        ? "bg-[#4CAF50]/10 border-[#4CAF50]/30 text-[#4CAF50]"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-mono font-bold text-xs sm:text-sm">
                        {currentEvaluation.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                        )}
                        <span>{currentEvaluation.summary}</span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${
                          currentEvaluation.passed
                            ? "bg-[#4CAF50]/20 border-[#4CAF50]/40 text-[#4CAF50]"
                            : "bg-rose-500/20 border-rose-500/40 text-rose-300"
                        }`}
                      >
                        Nota: {currentEvaluation.score}/100
                      </span>
                    </div>

                    {/* Detailed feedback list */}
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {currentEvaluation.items.map((item, i) => (
                        <div
                          key={i}
                          className={`p-2 rounded text-[11px] font-mono flex items-start gap-2 border ${
                            item.type === "error"
                              ? "bg-rose-950/40 border-rose-500/20 text-rose-200"
                              : item.type === "warning"
                              ? "bg-amber-950/40 border-amber-500/20 text-amber-200"
                              : "bg-emerald-950/40 border-emerald-500/20 text-emerald-200"
                          }`}
                        >
                          {item.type === "error" && (
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                          )}
                          {item.type === "warning" && (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          )}
                          {item.type === "ok" && (
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          )}
                          <span className="leading-tight">{item.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#2A2F3C]">
                <div className="text-xs font-mono text-[#9FA7B8] flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#03A9F4]" />
                  <span>
                    Comando: <code className="text-[#ECEFF4]">grademe</code>
                  </span>
                </div>

                <button
                  id="btn-grademe"
                  onClick={() => gradeCurrentLevel(currentLevelIndex)}
                  className="px-5 py-2.5 bg-[#4CAF50] hover:bg-[#43a047] text-[#0b0f19] font-bold text-xs rounded-xl shadow-lg shadow-[#4CAF50]/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Enviar a Moulinette (Grademe)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Modal / Dialog Confirm Abandon */}
          {showAbandonConfirm && (
            <div className="fixed inset-0 z-50 bg-[#0b0f19]/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#141927] border border-rose-500/40 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fadeIn">
                <div className="flex items-center gap-3 text-rose-400">
                  <AlertTriangle className="w-6 h-6 shrink-0" />
                  <h4 className="text-base font-bold text-[#ECEFF4]">¿Abandonar simulación de examen?</h4>
                </div>
                <p className="text-xs text-[#9FA7B8] leading-relaxed">
                  Si abandonas ahora, la sesión terminará inmediatamente y se computará como no superado.
                </p>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowAbandonConfirm(false)}
                    className="px-4 py-2 rounded-xl bg-[#0b0f19] hover:bg-[#181f30] text-[#ECEFF4] border border-[#2A2F3C] text-xs font-bold transition-colors cursor-pointer"
                  >
                    Continuar Examen
                  </button>
                  <button
                    onClick={() => {
                      setShowAbandonConfirm(false);
                      finishExam("abandoned");
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Sí, Abandonar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal / Dialog Confirm Voluntary Finish */}
          {showFinishConfirm && (
            <div className="fixed inset-0 z-50 bg-[#0b0f19]/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fadeIn">
                <div className="flex items-center gap-3 text-[#4CAF50]">
                  <Award className="w-6 h-6 shrink-0" />
                  <h4 className="text-base font-bold text-[#ECEFF4]">¿Entregar y finalizar examen?</h4>
                </div>
                <p className="text-xs text-[#9FA7B8] leading-relaxed">
                  Has completado <strong className="text-[#ECEFF4]">{completedLevels.length}</strong> de{" "}
                  <strong className="text-[#ECEFF4]">{selectedExam.levels.length}</strong> niveles. Se calculará tu nota final en base a los retos superados con Moulinette.
                </p>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowFinishConfirm(false)}
                    className="px-4 py-2 rounded-xl bg-[#0b0f19] hover:bg-[#181f30] text-[#ECEFF4] border border-[#2A2F3C] text-xs font-bold transition-colors cursor-pointer"
                  >
                    Seguir Programando
                  </button>
                  <button
                    onClick={() => {
                      setShowFinishConfirm(false);
                      finishExam("voluntary");
                    }}
                    className="px-5 py-2 rounded-xl bg-[#4CAF50] hover:bg-[#43a047] text-[#0b0f19] text-xs font-extrabold transition-colors cursor-pointer"
                  >
                    Confirmar Entrega
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. FINISHED EXAM SCREEN (Resumen de Sesión)                    */}
      {/* ------------------------------------------------------------- */}
      {status === "finished" && selectedExam && (
        <ExamSessionSummary
          exam={selectedExam}
          score={finalScore}
          completedLevels={completedLevels}
          timeSpentSeconds={timeSpentSeconds}
          finishReason={finishReason}
          attemptsByLevel={attemptsByLevel}
          failedAttemptsByLevel={failedAttemptsByLevel}
          allChallenges={allChallenges}
          onRestart={restartExam}
          onExit={cancelPreflight}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. EXAMS CATALOG (Grid de tarjetas disponibles)               */}
      {/* ------------------------------------------------------------- */}
      {status === "idle" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <ExamSimulationCard
              key={exam.id}
              exam={exam}
              pastResult={progress.completedExams[exam.id]}
              onStartExam={openPreflight}
              onOpenDetail={openPreflight}
            />
          ))}
        </div>
      )}
    </div>
  );
};
