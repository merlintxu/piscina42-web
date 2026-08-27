import React, { useState, useEffect } from "react";
import { ExamSimulation, Challenge, UserProgress } from "../types";
import {
  Clock,
  Play,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Award,
  ShieldAlert,
  Terminal,
  Sparkles,
  Trophy,
  ShieldCheck,
  AlertTriangle,
  FileCode,
  Check,
  Info,
  ArrowRight,
  Code2
} from "lucide-react";
import confetti from "canvas-confetti";
import { ExamSimulationCard } from "./ExamSimulationCard";
import { getExamLevelSpec, validateExamSubmission, ExamValidationResult } from "../lib/examValidator";

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
  onSaveExamScore
}) => {
  const [selectedExam, setSelectedExam] = useState<ExamSimulation | null>(exams[0] || null);
  const [activeSession, setActiveSession] = useState<{
    examId: string;
    timeLeft: number; // in seconds
    isRunning: boolean;
    currentLevelIndex: number;
    completedLevels: number[];
  } | null>(null);

  const [submittedCode, setSubmittedCode] = useState<Record<number, string>>({});
  const [evalResults, setEvalResults] = useState<Record<number, ExamValidationResult | null>>({});

  // Countdown timer effect
  useEffect(() => {
    let timer: any = null;
    if (activeSession && activeSession.isRunning && activeSession.timeLeft > 0) {
      timer = setInterval(() => {
        setActiveSession(prev => {
          if (!prev) return null;
          if (prev.timeLeft <= 1) {
            clearInterval(timer);
            return { ...prev, timeLeft: 0, isRunning: false };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeSession?.isRunning, activeSession?.timeLeft]);

  const handleStartExam = (exam: ExamSimulation) => {
    setSelectedExam(exam);
    const initialCodes: Record<number, string> = {};

    // Prepopulate first level code template
    if (exam.levels && exam.levels.length > 0) {
      const firstSpec = getExamLevelSpec(exam.levels[0], allChallenges);
      initialCodes[0] = firstSpec.starterTemplate;
    }

    setSubmittedCode(initialCodes);
    setEvalResults({});
    setActiveSession({
      examId: exam.id,
      timeLeft: exam.duration_minutes * 60,
      isRunning: true,
      currentLevelIndex: 0,
      completedLevels: []
    });
  };

  const handleStopExam = () => {
    if (!activeSession || !selectedExam) return;
    const finalScore = Math.round((activeSession.completedLevels.length / Math.max(1, selectedExam.levels.length)) * 100);
    onSaveExamScore(selectedExam.id, finalScore);
    if (finalScore >= 75) {
      confetti({ particleCount: 80, spread: 100, origin: { y: 0.6 } });
    }
    setActiveSession(null);
  };

  const handleSelectLevel = (idx: number) => {
    if (!activeSession || !selectedExam) return;
    const currentLevelId = selectedExam.levels[idx];
    if (!submittedCode[idx]) {
      const spec = getExamLevelSpec(currentLevelId, allChallenges);
      setSubmittedCode(prev => ({ ...prev, [idx]: spec.starterTemplate }));
    }
    setActiveSession({ ...activeSession, currentLevelIndex: idx });
  };

  const handleResetTemplate = (lvlIdx: number) => {
    if (!selectedExam) return;
    const spec = getExamLevelSpec(selectedExam.levels[lvlIdx], allChallenges);
    setSubmittedCode(prev => ({ ...prev, [lvlIdx]: spec.starterTemplate }));
    setEvalResults(prev => ({ ...prev, [lvlIdx]: null }));
  };

  const handleGradeLevel = (lvlIdx: number) => {
    if (!activeSession || !selectedExam) return;
    const currentLevelId = selectedExam.levels[lvlIdx];
    const spec = getExamLevelSpec(currentLevelId, allChallenges);
    const code = submittedCode[lvlIdx] || "";

    // Run deep static analysis (Norminette + signature/behavior checks)
    const result = validateExamSubmission(code, spec);
    setEvalResults(prev => ({ ...prev, [lvlIdx]: result }));

    if (result.passed) {
      const nextCompleted = Array.from(new Set([...activeSession.completedLevels, lvlIdx]));
      const nextIdx = Math.min(lvlIdx + 1, selectedExam.levels.length - 1);

      // Prepopulate next level template if empty
      if (!submittedCode[nextIdx] && selectedExam.levels[nextIdx]) {
        const nextSpec = getExamLevelSpec(selectedExam.levels[nextIdx], allChallenges);
        setSubmittedCode(prev => ({ ...prev, [nextIdx]: nextSpec.starterTemplate }));
      }

      setActiveSession(prev => prev ? {
        ...prev,
        completedLevels: nextCompleted,
        currentLevelIndex: nextIdx
      } : null);

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.65 },
        colors: ["#4CAF50", "#03A9F4", "#FFC107"]
      });
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const currentLevelId = selectedExam && activeSession ? selectedExam.levels[activeSession.currentLevelIndex] : "";
  const currentSpec = currentLevelId ? getExamLevelSpec(currentLevelId, allChallenges) : null;
  const currentEvaluation = activeSession ? evalResults[activeSession.currentLevelIndex] : null;

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
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
              Practica bajo las condiciones reales de los exámenes de los viernes: cronómetro estricto, sin acceso a apuntes ni internet, validación rigurosa de <strong>Norminette</strong> y corrección estática de <strong>Moulinette</strong>.
            </p>
          </div>

          <div className="bg-[#0b0f19] border border-[#2A2F3C] p-4 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#4CAF50]/15 border border-[#4CAF50]/30 flex items-center justify-center text-[#4CAF50]">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono text-[#9FA7B8]">Exámenes Rendidos</div>
              <div className="text-lg font-bold text-[#ECEFF4] font-mono">
                {Object.keys(progress.completedExams).length} / {exams.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Exam Session Screen */}
      {activeSession && selectedExam && currentSpec ? (
        <div className="bg-[#141927] border-2 border-[#03A9F4] rounded-2xl p-6 shadow-2xl space-y-6 animate-fadeIn">
          {/* Active Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#2A2F3C]">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4CAF50] animate-pulse"></span>
                <span className="text-xs font-mono text-[#4CAF50] uppercase font-bold">Examen en Curso</span>
              </div>
              <h3 className="text-xl font-bold text-[#ECEFF4] mt-1">{selectedExam.title}</h3>
            </div>

            <div className="flex items-center gap-4">
              {/* Timer clock */}
              <div className={`px-4 py-2 rounded-xl font-mono text-xl font-bold border flex items-center gap-2 ${
                activeSession.timeLeft < 600
                  ? "bg-rose-500/15 border-rose-500 text-rose-400 animate-pulse"
                  : "bg-[#0b0f19] border-[#2A2F3C] text-[#03A9F4]"
              }`}>
                <Clock className="w-5 h-5" />
                <span>{formatTime(activeSession.timeLeft)}</span>
              </div>

              <button
                onClick={handleStopExam}
                className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-400 font-bold text-xs transition-colors"
              >
                Terminar Examen
              </button>
            </div>
          </div>

          {/* Level Progress Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {selectedExam.levels.map((lvl, idx) => {
              const isCompleted = activeSession.completedLevels.includes(idx);
              const isCurrent = activeSession.currentLevelIndex === idx;
              const levelSpec = getExamLevelSpec(lvl, allChallenges);

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectLevel(idx)}
                  className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 border whitespace-nowrap ${
                    isCurrent
                      ? "bg-[#03A9F4] text-[#0b0f19] border-[#03A9F4] shadow-md shadow-[#03A9F4]/20"
                      : isCompleted
                      ? "bg-[#4CAF50]/15 border-[#4CAF50]/40 text-[#4CAF50]"
                      : "bg-[#0b0f19] border-[#2A2F3C] text-[#9FA7B8] hover:text-[#ECEFF4]"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                  <span>L{idx}: {levelSpec.assignmentName}</span>
                </button>
              );
            })}
          </div>

          {/* Current Level Challenge Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Assignment Subject */}
            <div className="bg-[#0b0f19] border border-[#2A2F3C] rounded-xl p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#03A9F4] uppercase font-bold flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    Enunciado Oficial · Nivel {activeSession.currentLevelIndex}
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
                    <span className="text-[#9FA7B8] block mb-1">Prototipo oficial:</span>
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

              <div className="p-3 bg-[#FFC107]/10 border border-[#FFC107]/20 rounded-xl text-xs text-[#FFC107] flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="block">Evaluación estricta Moulinette:</strong>
                  <span>El evaluador analiza estáticamente el código y la Norminette. Cualquier fallo de firma o norma otorgará nota 0 en este nivel.</span>
                </div>
              </div>
            </div>

            {/* Right: Simulated Workspace & Moulinette Tester */}
            <div className="bg-[#0b0f19] border border-[#2A2F3C] rounded-xl p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-[#9FA7B8]">
                    <FileCode className="w-3.5 h-3.5 text-[#03A9F4]" />
                    <span>{currentSpec.expectedFile}</span>
                  </div>
                  <button
                    onClick={() => handleResetTemplate(activeSession.currentLevelIndex)}
                    className="text-[11px] text-[#9FA7B8] hover:text-[#ECEFF4] hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restablecer plantilla</span>
                  </button>
                </div>

                <textarea
                  value={submittedCode[activeSession.currentLevelIndex] ?? currentSpec.starterTemplate}
                  onChange={(e) => setSubmittedCode({ ...submittedCode, [activeSession.currentLevelIndex]: e.target.value })}
                  placeholder={`// Escribe o pega tu código C aquí...\n${currentSpec.signature}\n{\n\t// tu código...\n}`}
                  rows={13}
                  className="w-full bg-[#141927] border border-[#2A2F3C] rounded-xl p-3.5 text-xs font-mono text-[#ECEFF4] focus:outline-none focus:border-[#4CAF50] resize-y font-normal leading-relaxed"
                />

                {/* Moulinette / Grademe Feedback Area */}
                {currentEvaluation && (
                  <div className={`p-4 rounded-xl border space-y-3 animate-fadeIn ${
                    currentEvaluation.passed
                      ? "bg-[#4CAF50]/10 border-[#4CAF50]/30 text-[#4CAF50]"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-mono font-bold text-xs sm:text-sm">
                        {currentEvaluation.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                        )}
                        <span>{currentEvaluation.summary}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${
                        currentEvaluation.passed
                          ? "bg-[#4CAF50]/20 border-[#4CAF50]/40 text-[#4CAF50]"
                          : "bg-rose-500/20 border-rose-500/40 text-rose-300"
                      }`}>
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
                          {item.type === "error" && <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />}
                          {item.type === "warning" && <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />}
                          {item.type === "ok" && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />}
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
                  <span>Comando: <code className="text-[#ECEFF4]">grademe</code></span>
                </div>

                <button
                  onClick={() => handleGradeLevel(activeSession.currentLevelIndex)}
                  className="px-5 py-2.5 bg-[#4CAF50] hover:bg-[#43a047] text-[#0b0f19] font-bold text-xs rounded-xl shadow-lg shadow-[#4CAF50]/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Enviar a Moulinette (Grademe)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Available Exam Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => (
          <ExamSimulationCard
            key={exam.id}
            exam={exam}
            pastResult={progress.completedExams[exam.id]}
            onStartExam={handleStartExam}
          />
        ))}
      </div>
    </div>
  );
};
