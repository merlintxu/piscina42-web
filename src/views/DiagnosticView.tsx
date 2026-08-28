import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DIAGNOSTIC_QUESTIONS } from "../training/diagnosticQuestions";
import { evaluateDiagnostic } from "../training/diagnostic";
import { applyDiagnosticToState } from "../training/trainingStorage";
import { TrainingState, DiagnosticResult } from "../training/types";
import { SKILL_CATEGORIES } from "../training/config";
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Sparkles, 
  ShieldCheck, 
  Terminal, 
  Code2, 
  Flame, 
  Award,
  AlertTriangle,
  BookOpen
} from "lucide-react";

interface DiagnosticViewProps {
  trainingState: TrainingState;
  onUpdateTrainingState: (newState: TrainingState) => void;
}

export const DiagnosticView: React.FC<DiagnosticViewProps> = ({
  trainingState,
  onUpdateTrainingState
}) => {
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>(trainingState.diagnostic?.answers || {});
  const [showResults, setShowResults] = useState<boolean>(!!trainingState.diagnostic);
  const [result, setResult] = useState<DiagnosticResult | null>(trainingState.diagnostic);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const totalQuestions = DIAGNOSTIC_QUESTIONS.length;
  const currentQuestion = DIAGNOSTIC_QUESTIONS[currentIdx];
  const currentCategory = SKILL_CATEGORIES[currentQuestion?.category || "c_prog"];

  const answeredCount = Object.keys(answers).length;
  const progressPct = Math.round((answeredCount / totalQuestions) * 100);

  const handleSelectOption = (optionId: string) => {
    setSelectedOption(optionId);
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionId
    }));
  };

  const handleNext = () => {
    if (currentIdx < totalQuestions - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setSelectedOption(answers[DIAGNOSTIC_QUESTIONS[nextIdx].id] || null);
    } else {
      // Calculate results
      const res = evaluateDiagnostic(answers);
      setResult(res);
      const updatedState = applyDiagnosticToState(trainingState, res);
      onUpdateTrainingState(updatedState);
      setShowResults(true);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      const prevIdx = currentIdx - 1;
      setCurrentIdx(prevIdx);
      setSelectedOption(answers[DIAGNOSTIC_QUESTIONS[prevIdx].id] || null);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setSelectedOption(null);
    setCurrentIdx(0);
    setShowResults(false);
    setResult(null);
  };

  if (showResults && result) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-16">
        {/* Results Banner */}
        <div className="bg-[#141927] border border-[#2A2F3C] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#4CAF50]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#03A9F4]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-3 py-1 text-xs font-mono font-bold bg-[#4CAF50]/15 text-[#4CAF50] border border-[#4CAF50]/30 rounded-lg flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  Diagnóstico Completado
                </span>
                <span className="text-xs font-mono text-[#9FA7B8]">24 Preguntas Evaluadas</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#ECEFF4] tracking-tight">
                Tu Perfil Técnico y Nivel Inicial
              </h1>

              <p className="text-sm text-[#9FA7B8] leading-relaxed">
                Hemos calibrado tu matriz de competencias de acuerdo a los estándares de la Piscina de 42 Madrid. Tus misiones diarias se adaptarán a tus puntos de refuerzo.
              </p>
            </div>

            {/* Score Wheel Gauge */}
            <div className="bg-[#0b0f19] border border-[#2A2F3C] p-6 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-inner">
              <div className="text-3xl font-extrabold font-mono text-[#4CAF50]">
                {result.score} <span className="text-lg font-normal text-[#9FA7B8]">/ {result.totalQuestions}</span>
              </div>
              <div className="text-xs font-mono text-[#9FA7B8] mt-1">
                {result.percentage}% de precisión
              </div>
              <span className={`text-[10px] font-mono font-bold mt-2 px-2 py-0.5 rounded border ${
                result.percentage >= 75
                  ? "bg-[#4CAF50]/15 text-[#4CAF50] border-[#4CAF50]/30"
                  : result.percentage >= 50
                  ? "bg-[#FFC107]/15 text-[#FFC107] border-[#FFC107]/30"
                  : "bg-[#FF5722]/15 text-[#FF5722] border-[#FF5722]/30"
              }`}>
                {result.percentage >= 75 ? "Base Sólida" : result.percentage >= 50 ? "Nivel Intermedio" : "En Iniciación"}
              </span>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl p-6 shadow-xl space-y-6">
          <h2 className="text-lg font-bold text-[#ECEFF4] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FFC107]" />
            <span>Puntuación por Ejes Competenciales</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.keys(SKILL_CATEGORIES) as Array<keyof typeof SKILL_CATEGORIES>).map(catKey => {
              const cat = SKILL_CATEGORIES[catKey];
              const pct = result.categoryScores[catKey] || 0;
              return (
                <div key={catKey} className="p-4 bg-[#0b0f19] border border-[#2A2F3C] rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className={`font-bold ${cat.color.primary}`}>{cat.name}</span>
                    <span className="text-[#ECEFF4] font-bold">{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#141927] rounded-full overflow-hidden border border-[#2A2F3C]">
                    <div
                      className={`h-full ${pct >= 70 ? "bg-[#4CAF50]" : pct >= 40 ? "bg-[#FFC107]" : "bg-[#FF5722]"} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tailored Recommendations */}
        <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-[#ECEFF4] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#03A9F4]" />
            <span>Recomendaciones Pedagógicas Personalizadas</span>
          </h2>

          <ul className="space-y-2.5">
            {result.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#CAD2E2] leading-relaxed">
                <span className="w-5 h-5 rounded-full bg-[#03A9F4]/15 border border-[#03A9F4]/30 text-[#03A9F4] flex items-center justify-center shrink-0 text-xs font-mono font-bold mt-0.5">
                  {idx + 1}
                </span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Detailed Question Review */}
        <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#2A2F3C] pb-4">
            <h2 className="text-lg font-bold text-[#ECEFF4] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#4CAF50]" />
              <span>Revisión de las 24 Preguntas</span>
            </h2>
            <span className="text-xs font-mono text-[#9FA7B8]">
              {result.score} correctas / {result.totalQuestions - result.score} incorrectas
            </span>
          </div>

          <div className="space-y-4">
            {DIAGNOSTIC_QUESTIONS.map((q, idx) => {
              const selectedOptId = result.answers[q.id];
              const correctOpt = q.options.find(o => o.isCorrect);
              const selectedOpt = q.options.find(o => o.id === selectedOptId);
              const isCorrect = selectedOptId === correctOpt?.id;

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isCorrect ? "bg-[#0b0f19] border-[#4CAF50]/30" : "bg-[#0b0f19] border-[#FF5722]/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-[#141927] border border-[#2A2F3C] text-[11px] font-mono font-bold text-[#9FA7B8] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-[#ECEFF4]">{q.title}</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                      isCorrect ? "bg-[#4CAF50]/15 text-[#4CAF50] border-[#4CAF50]/30" : "bg-[#FF5722]/15 text-[#FF5722] border-[#FF5722]/30"
                    }`}>
                      {isCorrect ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {isCorrect ? "Correcta" : "Incorrecta"}
                    </span>
                  </div>

                  <p className="text-xs text-[#9FA7B8] mb-2">{q.question}</p>

                  {q.codeSnippet && (
                    <pre className="bg-[#141927] p-2.5 rounded-lg text-xs font-mono text-[#4CAF50] border border-[#2A2F3C] overflow-x-auto mb-2">
                      <code>{q.codeSnippet}</code>
                    </pre>
                  )}

                  <div className="text-xs font-mono space-y-1">
                    {!isCorrect && selectedOpt && (
                      <div className="text-rose-400">
                        Tu respuesta: <span className="text-[#ECEFF4]">{selectedOpt.text}</span>
                      </div>
                    )}
                    <div className="text-emerald-400">
                      Respuesta correcta: <span className="text-[#ECEFF4]">{correctOpt?.text}</span>
                    </div>
                    {correctOpt?.explanation && (
                      <div className="text-[11px] text-[#9FA7B8] mt-1 italic pl-2 border-l-2 border-[#03A9F4]/40">
                        {correctOpt.explanation}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <button
            onClick={handleRestart}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#141927] hover:bg-[#1a2236] border border-[#2A2F3C] text-[#ECEFF4] font-mono text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Repetir Diagnóstico</span>
          </button>

          <button
            onClick={() => navigate("/training")}
            className="w-full sm:w-auto px-6 py-3 bg-[#4CAF50] hover:bg-[#43a047] text-[#0b0f19] font-bold text-sm rounded-xl shadow-lg shadow-[#4CAF50]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Ir al Panel de Entrenamiento (Training OS)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-[#2A2F3C] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#03A9F4]/15 text-[#03A9F4] border border-[#03A9F4]/30 rounded">
              Pregunta {currentIdx + 1} de {totalQuestions}
            </span>
            <span className={`text-xs font-mono font-bold ${currentCategory.color.primary}`}>
              {currentCategory.name}
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#ECEFF4] mt-1">
            Evaluación Diagnóstica Inicial
          </h1>
        </div>

        <div className="text-right font-mono">
          <span className="text-xs text-[#9FA7B8]">Respondidas</span>
          <div className="text-sm font-bold text-[#4CAF50]">{answeredCount}/{totalQuestions}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-[#141927] rounded-full overflow-hidden border border-[#2A2F3C]">
        <div
          className="h-full bg-gradient-to-r from-[#03A9F4] to-[#4CAF50] transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-mono text-[#9FA7B8] uppercase tracking-wider">
            {currentQuestion.title}
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-[#ECEFF4] leading-relaxed">
            {currentQuestion.question}
          </h2>
        </div>

        {currentQuestion.codeSnippet && (
          <div className="bg-[#0b0f19] border border-[#2A2F3C] rounded-xl p-4 overflow-x-auto">
            <pre className="text-xs sm:text-sm font-mono text-[#ECEFF4]">
              <code>{currentQuestion.codeSnippet}</code>
            </pre>
          </div>
        )}

        {/* Options List */}
        <div className="space-y-3">
          {currentQuestion.options.map((opt, oIdx) => {
            const isSelected = selectedOption === opt.id || answers[currentQuestion.id] === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                  isSelected
                    ? "bg-[#03A9F4]/15 border-[#03A9F4] text-[#ECEFF4] ring-1 ring-[#03A9F4]/30"
                    : "bg-[#0b0f19] hover:bg-[#182035] border-[#2A2F3C] text-[#CAD2E2]"
                }`}
              >
                <span className={`w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                  isSelected ? "bg-[#03A9F4] text-[#0b0f19]" : "bg-[#141927] text-[#9FA7B8] border border-[#2A2F3C]"
                }`}>
                  {String.fromCharCode(65 + oIdx)}
                </span>
                <span className="text-xs sm:text-sm leading-relaxed">{opt.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className={`px-4 py-2.5 rounded-xl border text-xs font-mono flex items-center gap-2 transition-all ${
            currentIdx === 0
              ? "opacity-40 cursor-not-allowed bg-[#141927] border-[#2A2F3C] text-[#555E70]"
              : "bg-[#141927] hover:bg-[#1a2236] border-[#2A2F3C] text-[#ECEFF4] cursor-pointer"
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Anterior</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleNext}
            disabled={!answers[currentQuestion.id]}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              !answers[currentQuestion.id]
                ? "opacity-50 cursor-not-allowed bg-[#2A2F3C] text-[#9FA7B8]"
                : currentIdx === totalQuestions - 1
                ? "bg-[#4CAF50] hover:bg-[#43a047] text-[#0b0f19] shadow-lg shadow-[#4CAF50]/20"
                : "bg-[#03A9F4] hover:bg-[#0288D1] text-[#0b0f19] shadow-lg shadow-[#03A9F4]/20"
            }`}
          >
            <span>{currentIdx === totalQuestions - 1 ? "Finalizar y Calibrar" : "Siguiente"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
