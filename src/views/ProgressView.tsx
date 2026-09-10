import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ContentJSON, UserProgress } from "../types";
import {
  calculateGlobalProgress,
  calculatePhaseProgress,
  calculateExamsProgress,
  calculateHabitActivity,
  getNextPendingChallenge,
} from "../lib/progress";
import {
  CheckCircle2,
  Clock,
  Flame,
  ArrowRight,
  Sparkles,
  BookOpen,
  Terminal,
  Code2,
  Layers,
  Zap,
  TrendingUp,
  Award,
  Calendar,
  Check,
  AlertCircle,
  Play,
  RotateCcw
} from "lucide-react";

interface ProgressViewProps {
  content: ContentJSON;
  progress: UserProgress;
  onToggleChallengeComplete?: (challengeId: string) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  content,
  progress,
  onToggleChallengeComplete,
}) => {
  const navigate = useNavigate();

  // Compute all metrics using pure functions
  const globalSummary = useMemo(() => calculateGlobalProgress(content, progress), [content, progress]);
  const phaseSummaries = useMemo(
    () => content.phases.map((p) => calculatePhaseProgress(p, content, progress.completedChallenges || [])),
    [content, progress.completedChallenges]
  );
  const examsSummary = useMemo(() => calculateExamsProgress(content, progress), [content, progress]);
  const habitSummary = useMemo(() => calculateHabitActivity(content, progress), [content, progress]);
  const nextPending = useMemo(() => getNextPendingChallenge(content, progress), [content, progress]);

  const difficultyColors = {
    easy: { text: "text-[#4CAF50]", bg: "bg-[#4CAF50]", lightBg: "bg-[#4CAF50]/15", border: "border-[#4CAF50]/30", label: "Fácil" },
    medium: { text: "text-[#FFC107]", bg: "bg-[#FFC107]", lightBg: "bg-[#FFC107]/15", border: "border-[#FFC107]/30", label: "Media" },
    hard: { text: "text-[#FF5722]", bg: "bg-[#FF5722]", lightBg: "bg-[#FF5722]/15", border: "border-[#FF5722]/30", label: "Difícil" },
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-[#141927] border border-[#2A2F3C] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#4CAF50]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#03A9F4]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-mono font-bold bg-[#4CAF50]/15 text-[#4CAF50] border border-[#4CAF50]/30 rounded-lg flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Panel de Progreso
              </span>
              <span className="text-xs font-mono text-[#9FA7B8]">Piscina 42 Madrid</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#ECEFF4] tracking-tight">
              Tu Estado y Próximos Pasos en la Piscina
            </h1>
            <p className="text-xs sm:text-sm text-[#9FA7B8] leading-relaxed">
              Monitorea en tiempo real tu avance por fases, retos de código, simulaciones de examen y hábitos de alto rendimiento para asegurar tu plaza.
            </p>
          </div>

          {/* Global Progress Big Metric */}
          <div className="bg-[#0b0f19] border border-[#2A2F3C] p-5 rounded-2xl flex items-center gap-5 shrink-0 shadow-inner">
            <div className="relative w-20 h-20 flex items-center justify-center">
              {/* Circular SVG gauge */}
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#141927]"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#4CAF50] transition-all duration-1000 ease-out"
                  strokeDasharray={`${globalSummary.percentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-lg font-extrabold font-mono text-[#ECEFF4]">
                  {globalSummary.percentage}%
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono text-[#9FA7B8] uppercase tracking-wider block">
                Progreso Global
              </span>
              <div className="text-base font-bold text-[#ECEFF4] font-mono">
                {globalSummary.completedChallenges} / {globalSummary.totalChallenges}{" "}
                <span className="text-xs font-normal text-[#9FA7B8]">retos</span>
              </div>
              <div className="text-xs text-[#9FA7B8] font-mono">
                {globalSummary.completedModules} de {globalSummary.totalModules} módulos listos
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main CTA: Siguiente Acción Recomendada */}
      <div id="next-action-card" className="bg-gradient-to-r from-[#141927] to-[#162036] border border-[#4CAF50]/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[11px] font-mono font-bold bg-[#4CAF50] text-[#0b0f19] rounded-md flex items-center gap-1">
                <Play className="w-3 h-3 fill-current" />
                Siguiente Reto Pendiente
              </span>
              {nextPending?.phase && (
                <span className="text-xs font-mono text-[#9FA7B8]">
                  {nextPending.phase.title} · {nextPending.module.title}
                </span>
              )}
            </div>

            {nextPending ? (
              <>
                <h2 className="text-xl sm:text-2xl font-bold text-[#ECEFF4] flex items-center gap-2">
                  <span>{nextPending.challenge.title}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded border font-mono font-normal ${
                      difficultyColors[nextPending.challenge.difficulty].lightBg
                    } ${difficultyColors[nextPending.challenge.difficulty].text} ${
                      difficultyColors[nextPending.challenge.difficulty].border
                    }`}
                  >
                    {difficultyColors[nextPending.challenge.difficulty].label}
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-[#CAD2E2] max-w-2xl leading-relaxed">
                  {nextPending.challenge.body
                    ? nextPending.challenge.body.slice(0, 140).replace(/#|\*|`/g, "") + "..."
                    : "Continúa avanzando en tu ruta de preparación técnica."}
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl sm:text-2xl font-bold text-[#4CAF50] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#FFC107]" />
                  <span>¡Has completado todos los retos del temario!</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#CAD2E2] max-w-2xl leading-relaxed">
                  ¡Enhorabuena! Has resuelto los 55 retos de código. Pon a prueba tu velocidad en el simulador de exámenes o repasa los módulos clave.
                </p>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {nextPending ? (
              <button
                id="continue-next-challenge-btn"
                onClick={() =>
                  navigate(`/challenge/${nextPending.challenge.slug || nextPending.challenge.id}`)
                }
                className="px-6 py-3 bg-[#4CAF50] hover:bg-[#43a047] text-[#0b0f19] font-bold text-sm rounded-xl shadow-lg shadow-[#4CAF50]/20 flex items-center gap-2 transition-all cursor-pointer group"
              >
                <span>Continuar</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                onClick={() => navigate("/exams")}
                className="px-6 py-3 bg-[#03A9F4] hover:bg-[#0288D1] text-[#0b0f19] font-bold text-sm rounded-xl shadow-lg shadow-[#03A9F4]/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                <span>Ir al Simulador de Exámenes</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Difficulty Stats & Habit 7-Day Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Retos por Dificultad */}
        <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#2A2F3C] pb-3">
            <h3 className="text-sm font-bold text-[#ECEFF4] flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#4CAF50]" />
              <span>Retos por Dificultad</span>
            </h3>
            <span className="text-xs font-mono text-[#9FA7B8]">
              {globalSummary.completedChallenges} / {globalSummary.totalChallenges}
            </span>
          </div>

          <div className="space-y-3.5">
            {(["easy", "medium", "hard"] as const).map((diff) => {
              const stats = globalSummary.byDifficulty[diff];
              const conf = difficultyColors[diff];
              return (
                <div key={diff} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className={`font-semibold ${conf.text}`}>{conf.label}</span>
                    <span className="text-[#ECEFF4]">
                      {stats.completed} / {stats.total}{" "}
                      <span className="text-[#9FA7B8]">({stats.pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#0b0f19] rounded-full overflow-hidden border border-[#2A2F3C]/50">
                    <div
                      className={`h-full ${conf.bg} rounded-full transition-all duration-500`}
                      style={{ width: `${stats.pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#2A2F3C] flex items-center justify-between text-[11px] font-mono text-[#9FA7B8]">
            <span>Pendientes: {globalSummary.totalChallenges - globalSummary.completedChallenges}</span>
            <Link
              to="/challenges"
              className="text-[#03A9F4] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Actividad de Hábitos en los últimos 7 días */}
        <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl p-6 shadow-xl space-y-4 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2A2F3C] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#ECEFF4] flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#FFC107]" />
                <span>Hábitos · Últimos 7 Días</span>
              </h3>
              <p className="text-xs text-[#9FA7B8]">Constancia y disciplina diaria</p>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0b0f19] border border-[#2A2F3C] rounded-lg">
                <Zap className="w-3.5 h-3.5 text-[#FF5722] fill-[#FF5722]" />
                <span className="text-[#ECEFF4] font-bold">Racha: {habitSummary.maxStreak} d</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0b0f19] border border-[#2A2F3C] rounded-lg">
                <Check className="w-3.5 h-3.5 text-[#4CAF50]" />
                <span className="text-[#ECEFF4] font-bold">{habitSummary.weeklyCheckins} check-ins</span>
              </div>
            </div>
          </div>

          {/* 7 Day Grid */}
          <div className="grid grid-cols-7 gap-2 pt-1">
            {habitSummary.days.map((day, idx) => {
              const hasActivity = day.count > 0;
              return (
                <div
                  key={day.dateStr}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-between min-h-[90px] transition-all ${
                    day.isToday
                      ? "bg-[#182035] border-[#FFC107]/50 ring-1 ring-[#FFC107]/20"
                      : "bg-[#0b0f19] border-[#2A2F3C]"
                  }`}
                >
                  <div className="text-[11px] font-mono font-semibold text-[#9FA7B8] flex flex-col items-center">
                    <span>{day.dayName}</span>
                    <span className="text-[9px] text-[#555E70]">{day.formattedDate}</span>
                  </div>

                  <div className="my-1 flex flex-col items-center justify-center">
                    {hasActivity ? (
                      <div className="w-8 h-8 rounded-full bg-[#FFC107]/15 border border-[#FFC107]/40 flex items-center justify-center text-[#FFC107] font-mono font-bold text-xs shadow-sm">
                        {day.count}
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#141927] border border-[#2A2F3C] flex items-center justify-center text-[#555E70] text-xs">
                        -
                      </div>
                    )}
                  </div>

                  <span
                    className={`text-[9px] font-mono font-bold uppercase ${
                      day.isToday ? "text-[#FFC107]" : "text-[#555E70]"
                    }`}
                  >
                    {day.isToday ? "Hoy" : ""}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#2A2F3C] flex items-center justify-between text-[11px] font-mono text-[#9FA7B8]">
            <span>{habitSummary.activeHabitsCount} hábitos activos de {habitSummary.totalHabitsCount}</span>
            <Link to="/habits" className="text-[#FFC107] hover:underline flex items-center gap-1 font-semibold">
              <span>Gestionar hábitos</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Progresión por Fases */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#ECEFF4] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#FFC107]" />
              <span>Avance por Fases de la Piscina</span>
            </h2>
            <p className="text-xs text-[#9FA7B8]">4 fases secuenciales desde el entorno hasta los proyectos avanzados</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {phaseSummaries.map((ps, idx) => {
            const phase = ps.phase;
            return (
              <div
                key={phase.id}
                id={`phase-progress-card-${phase.id}`}
                className="bg-[#141927] border border-[#2A2F3C] hover:border-[#FFC107]/40 rounded-2xl p-6 shadow-xl space-y-4 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 text-xs font-mono font-bold bg-[#FFC107]/15 text-[#FFC107] border border-[#FFC107]/30 rounded">
                      Fase 0{idx + 1}
                    </span>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                        ps.isCompleted
                          ? "bg-[#4CAF50]/15 text-[#4CAF50] border-[#4CAF50]/30"
                          : ps.percentage > 0
                          ? "bg-[#03A9F4]/15 text-[#03A9F4] border-[#03A9F4]/30"
                          : "bg-[#0b0f19] text-[#9FA7B8] border-[#2A2F3C]"
                      }`}
                    >
                      {ps.isCompleted ? "Completada" : ps.percentage > 0 ? "En Curso" : "Sin Empezar"}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#ECEFF4] mb-1">
                    {phase.title}
                  </h3>
                  {phase.summary && (
                    <p className="text-xs text-[#9FA7B8] line-clamp-2 leading-relaxed mb-4">
                      {phase.summary}
                    </p>
                  )}

                  {/* Progress Bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#9FA7B8]">Retos superados</span>
                      <span className="text-[#ECEFF4] font-bold">
                        {ps.completedChallenges} / {ps.totalChallenges} ({ps.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-[#0b0f19] rounded-full overflow-hidden border border-[#2A2F3C]">
                      <div
                        className={`h-full ${
                          ps.isCompleted ? "bg-[#4CAF50]" : "bg-[#FFC107]"
                        } rounded-full transition-all duration-500`}
                        style={{ width: `${ps.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Mini module badges inside phase */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-[#9FA7B8] uppercase font-semibold block">
                      Módulos de la fase ({ps.completedModules}/{ps.totalModules}):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ps.modules.map((ms) => (
                        <Link
                          key={ms.module.id}
                          to={`/module/${ms.module.slug || ms.module.id}`}
                          className={`p-2 rounded-lg border text-xs font-mono flex items-center justify-between transition-colors ${
                            ms.isCompleted
                              ? "bg-[#4CAF50]/10 border-[#4CAF50]/30 text-[#4CAF50] hover:bg-[#4CAF50]/20"
                              : ms.percentage > 0
                              ? "bg-[#03A9F4]/10 border-[#03A9F4]/30 text-[#ECEFF4] hover:bg-[#03A9F4]/20"
                              : "bg-[#0b0f19] border-[#2A2F3C] text-[#9FA7B8] hover:text-[#ECEFF4]"
                          }`}
                        >
                          <span className="truncate font-semibold">{ms.module.title}</span>
                          <span className="text-[10px] shrink-0 ml-1">
                            {ms.completedChallenges}/{ms.totalChallenges}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#2A2F3C] flex items-center justify-between">
                  <span className="text-xs font-mono text-[#9FA7B8]">
                    {ps.totalChallenges} retos en total
                  </span>
                  <Link
                    to={`/phase/${phase.slug || phase.id}`}
                    className="text-xs font-semibold text-[#03A9F4] hover:underline flex items-center gap-1"
                  >
                    <span>Ver temario de fase</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desglose de Módulos (Tabla / Cuadrícula Detallada) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#ECEFF4] flex items-center gap-2">
              <Terminal className="w-5 h-5 text-[#03A9F4]" />
              <span>Desglose por Módulos</span>
            </h2>
            <p className="text-xs text-[#9FA7B8]">Estado de los 9 módulos de C y Shell</p>
          </div>
        </div>

        <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl overflow-hidden shadow-xl">
          <div className="divide-y divide-[#2A2F3C]">
            {content.modules.map((mod) => {
              const ms = calculatePhaseProgress(
                content.phases[0],
                content,
                progress.completedChallenges || []
              ).modules.find((m) => m.module.id === mod.id) || {
                module: mod,
                totalChallenges: mod.challenges?.length || 0,
                completedChallenges: (mod.challenges || []).filter((id) =>
                  (progress.completedChallenges || []).includes(id)
                ).length,
                percentage:
                  mod.challenges?.length > 0
                    ? Math.round(
                        (((mod.challenges || []).filter((id) =>
                          (progress.completedChallenges || []).includes(id)
                        ).length) /
                          mod.challenges.length) *
                          100
                      )
                    : 0,
                isCompleted:
                  mod.challenges?.length > 0 &&
                  (mod.challenges || []).every((id) => (progress.completedChallenges || []).includes(id)),
                status: "not_started" as const,
              };

              return (
                <div
                  key={mod.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#182035]/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 font-mono text-xs font-bold ${
                        ms.isCompleted
                          ? "bg-[#4CAF50]/15 border-[#4CAF50]/30 text-[#4CAF50]"
                          : ms.percentage > 0
                          ? "bg-[#03A9F4]/15 border-[#03A9F4]/30 text-[#03A9F4]"
                          : "bg-[#0b0f19] border-[#2A2F3C] text-[#9FA7B8]"
                      }`}
                    >
                      {ms.isCompleted ? <Check className="w-4 h-4" /> : <Terminal className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/module/${mod.slug || mod.id}`}
                          className="text-sm font-bold text-[#ECEFF4] hover:text-[#03A9F4] transition-colors truncate"
                        >
                          {mod.title}
                        </Link>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0b0f19] border border-[#2A2F3C] text-[#9FA7B8] shrink-0">
                          {mod.level.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-[#9FA7B8] truncate mt-0.5">
                        {mod.concepts?.slice(0, 3).join(", ") || "Conceptos clave de C"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0">
                    {/* Module Progress Bar */}
                    <div className="w-32 sm:w-40 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-[#9FA7B8]">
                          {ms.completedChallenges}/{ms.totalChallenges}
                        </span>
                        <span className="text-[#ECEFF4] font-bold">{ms.percentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-[#0b0f19] rounded-full overflow-hidden border border-[#2A2F3C]">
                        <div
                          className={`h-full ${
                            ms.isCompleted ? "bg-[#4CAF50]" : "bg-[#03A9F4]"
                          } rounded-full transition-all duration-500`}
                          style={{ width: `${ms.percentage}%` }}
                        />
                      </div>
                    </div>

                    <Link
                      to={`/module/${mod.slug || mod.id}`}
                      className="px-3 py-1.5 text-xs font-mono text-[#03A9F4] bg-[#03A9F4]/10 hover:bg-[#03A9F4]/20 border border-[#03A9F4]/30 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>Retos</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Simulaciones de Examen Realizadas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#ECEFF4] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#E91E63]" />
              <span>Simulador de Exámenes Examshell</span>
            </h2>
            <p className="text-xs text-[#9FA7B8]">Resultados de tus simulaciones cronometradas</p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-[#9FA7B8]">
              Mejor nota:{" "}
              <span className="font-bold text-[#ECEFF4]">
                {examsSummary.bestScore > 0 ? `${examsSummary.bestScore}/100` : "Sin intentos"}
              </span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {examsSummary.exams.map((item) => {
            const { exam, isCompleted, score, completedAt, isPassed } = item;
            return (
              <div
                key={exam.id}
                className="bg-[#141927] border border-[#2A2F3C] rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#E91E63]/15 text-[#E91E63] border border-[#E91E63]/30 rounded">
                      {exam.duration_minutes} min
                    </span>
                    {isCompleted ? (
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          isPassed
                            ? "bg-[#4CAF50]/15 text-[#4CAF50] border-[#4CAF50]/30"
                            : "bg-[#FF5722]/15 text-[#FF5722] border-[#FF5722]/30"
                        }`}
                      >
                        {isPassed ? "Aprobado (>=75)" : "No superado"}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-[#9FA7B8] px-2 py-0.5 rounded bg-[#0b0f19] border border-[#2A2F3C]">
                        Pendiente
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-[#ECEFF4]">{exam.title}</h3>
                  <p className="text-xs text-[#9FA7B8] mt-1 line-clamp-2">
                    {exam.description || "Simulación oficial con temporizador e incremento de niveles."}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#2A2F3C] flex items-center justify-between">
                  <div>
                    {isCompleted && typeof score === "number" ? (
                      <div className="font-mono">
                        <span className="text-xs text-[#9FA7B8]">Nota: </span>
                        <span className={`text-sm font-bold ${isPassed ? "text-[#4CAF50]" : "text-[#FF5722]"}`}>
                          {score}/100
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-mono text-[#555E70]">Sin registro</span>
                    )}
                  </div>

                  <Link
                    to="/exams"
                    className="px-2.5 py-1 text-xs font-mono bg-[#141927] hover:bg-[#1f2840] border border-[#2A2F3C] hover:border-[#E91E63]/50 text-[#ECEFF4] rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span>Simular</span>
                    <ArrowRight className="w-3 h-3 text-[#E91E63]" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
