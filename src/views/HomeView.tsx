import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ContentJSON, UserProgress, Challenge } from "../types";
import { TrainingState } from "../training/types";
import { calculateReadiness } from "../training/skillEngine";
import { PhaseTimeline } from "../components/PhaseTimeline";
import { PhaseCard } from "../components/PhaseCard";
import { HabitCard } from "../components/HabitCard";
import { 
  Code2, 
  Flame, 
  Clock, 
  ArrowRight,
  Target,
  Sparkles,
  Award,
  Calendar
} from "lucide-react";

interface HomeViewProps {
  content: ContentJSON;
  progress: UserProgress;
  trainingState?: TrainingState;
  onToggleHabitActive: (habitId: string) => void;
  onIncrementHabitDay: (habitId: string) => void;
  onSaveHabitNote?: (habitId: string, note: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  content,
  progress,
  trainingState,
  onToggleHabitActive,
  onIncrementHabitDay,
  onSaveHabitNote,
}) => {
  const navigate = useNavigate();
  const totalChallenges = content.challenges.length;
  const completedChallenges = progress.completedChallenges.length;
  const progressPct = totalChallenges > 0 ? Math.round((completedChallenges / totalChallenges) * 100) : 0;

  const readiness = trainingState ? calculateReadiness(trainingState, content, progress) : null;

  // Active habits list
  const activeHabitObjects = content.habits.filter(h => progress.activeHabits.includes(h.id));

  return (
    <div className="space-y-10 pb-16">
      {/* Training OS Hero Banner */}
      {readiness && (
        <div className="bg-gradient-to-r from-[#141927] via-[#1b253b] to-[#141927] border border-[#4CAF50]/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#4CAF50]/15 text-[#4CAF50] border border-[#4CAF50]/30 rounded-md flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" />
                  Piscina42 Training OS
                </span>
                <span className="text-xs font-mono text-[#9FA7B8] flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#03A9F4]" />
                  {readiness.daysRemaining} días para la Piscina ({trainingState?.profile.targetDate})
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-[#ECEFF4]">
                Entrenamiento Adaptativo Diario
              </h2>

              <p className="text-xs sm:text-sm text-[#CAD2E2] leading-relaxed">
                Tu Readiness actual estimado es de <strong className="text-[#4CAF50]">{readiness.overallScore}%</strong>. Entrena tus puntos débiles con la misión diaria y calibra tus competencias técnicas.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                to="/training"
                className="px-5 py-2.5 bg-[#4CAF50] hover:bg-[#43a047] text-[#0b0f19] font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-[#4CAF50]/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Target className="w-4 h-4" />
                <span>Abrir Training OS</span>
              </Link>

              <Link
                to="/diagnostic"
                className="px-4 py-2.5 bg-[#0b0f19] hover:bg-[#141927] border border-[#2A2F3C] text-[#ECEFF4] font-medium text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#03A9F4]" />
                <span>{trainingState?.diagnostic ? "Ver Diagnóstico" : "Hacer Diagnóstico"}</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#141927] via-[#111624] to-[#0b0f19] border border-[#2A2F3C] rounded-3xl p-6 sm:p-10 shadow-2xl">
        {/* Background glow circle */}
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-[#4CAF50]/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-[#03A9F4]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 text-xs font-mono font-bold bg-[#4CAF50]/15 text-[#4CAF50] border border-[#4CAF50]/30 rounded-lg flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4CAF50] animate-ping" />
              Piscina 42 Madrid
            </span>
            <span className="text-xs font-mono text-[#9FA7B8]">
              Plataforma de Autonomía & Peer-Learning
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#ECEFF4] tracking-tight leading-tight">
            Domina C, Shell y la metodología de la <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4CAF50] via-[#03A9F4] to-[#FFC107]">Piscina 42</span>.
          </h1>

          <p className="text-sm sm:text-base text-[#9FA7B8] leading-relaxed max-w-2xl">
            Prepárate con el temario completo: 4 fases progresivas, 9 módulos prácticos, 55 retos de código evaluables, simulaciones de examen reales, hábitos de alto rendimiento y el grafo de conocimiento Obsidian.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/challenges"
              className="px-5 py-2.5 bg-[#4CAF50] hover:bg-[#43a047] text-[#0b0f19] font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-[#4CAF50]/20 flex items-center gap-2 transition-all"
            >
              <Code2 className="w-4 h-4" />
              <span>Ver Retos de Código ({completedChallenges}/{totalChallenges})</span>
            </Link>

            <Link
              to="/exams"
              className="px-5 py-2.5 bg-[#141927] hover:bg-[#1a2236] border border-[#2A2F3C] hover:border-[#03A9F4]/50 text-[#ECEFF4] font-medium text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2"
            >
              <Clock className="w-4 h-4 text-[#03A9F4]" />
              <span>Simulador de Exámenes</span>
            </Link>

            <Link
              to="/graph"
              className="px-4 py-2.5 bg-[#141927] hover:bg-[#1a2236] border border-[#2A2F3C] text-[#9FA7B8] hover:text-[#ECEFF4] font-mono text-xs rounded-xl transition-all"
            >
              Grafo Obsidian
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-8 pt-8 border-t border-[#2A2F3C] grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-[#0b0f19]/60 border border-[#2A2F3C] rounded-xl">
            <div className="text-[11px] font-mono text-[#9FA7B8]">Retos Superados</div>
            <div className="text-xl font-bold font-mono text-[#4CAF50] mt-1">
              {completedChallenges} <span className="text-xs font-normal text-[#9FA7B8]">/ {totalChallenges} ({progressPct}%)</span>
            </div>
          </div>

          <div className="p-3 bg-[#0b0f19]/60 border border-[#2A2F3C] rounded-xl">
            <div className="text-[11px] font-mono text-[#9FA7B8]">Módulos C & Shell</div>
            <div className="text-xl font-bold font-mono text-[#03A9F4] mt-1">
              {content.modules.length} <span className="text-xs font-normal text-[#9FA7B8]">módulos</span>
            </div>
          </div>

          <div className="p-3 bg-[#0b0f19]/60 border border-[#2A2F3C] rounded-xl">
            <div className="text-[11px] font-mono text-[#9FA7B8]">Simulaciones Examen</div>
            <div className="text-xl font-bold font-mono text-[#FFC107] mt-1">
              {content.exams.length} <span className="text-xs font-normal text-[#9FA7B8]">simuladores</span>
            </div>
          </div>

          <div className="p-3 bg-[#0b0f19]/60 border border-[#2A2F3C] rounded-xl">
            <div className="text-[11px] font-mono text-[#9FA7B8]">Hábitos Activos</div>
            <div className="text-xl font-bold font-mono text-[#ECEFF4] mt-1">
              {progress.activeHabits.length} <span className="text-xs font-normal text-[#9FA7B8]">hábitos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Phase Roadmap Timeline */}
      <PhaseTimeline
        phases={content.phases}
        onSelectPhase={(phaseId) => {
          const p = content.phases.find(phase => phase.id === phaseId);
          navigate(`/phase/${p?.slug || phaseId}`);
        }}
        progress={progress}
      />

      {/* Phase Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-[#ECEFF4]">Fases Formativas Detalladas</h3>
            <p className="text-xs text-[#9FA7B8]">Haz clic en cualquiera de las fases para explorar sus módulos, retos y recursos.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {content.phases.map((phase) => (
            <PhaseCard
              key={phase.id}
              phase={phase}
              modules={content.modules}
              onOpenPhase={(phaseId) => {
                const p = content.phases.find(ph => ph.id === phaseId);
                navigate(`/phase/${p?.slug || phaseId}`);
              }}
              progress={progress}
            />
          ))}
        </div>
      </div>

      {/* Habits & Daily Routines Preview */}
      <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#FFC107]" />
              <h3 className="text-xl font-bold text-[#ECEFF4]">Hábitos Piscineros de Alto Rendimiento</h3>
            </div>
            <p className="text-xs text-[#9FA7B8] mt-0.5">
              La Piscina no solo evalúa código: evalúa resistencia, descanso, peer-evaluations y disciplina de commits.
            </p>
          </div>

          <Link
            to="/habits"
            className="text-xs font-mono font-semibold text-[#03A9F4] hover:text-[#38bdf8] flex items-center gap-1 self-start sm:self-auto"
          >
            Ver los 13 hábitos <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeHabitObjects.slice(0, 3).map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              progress={progress}
              onToggleActive={onToggleHabitActive}
              onIncrementDay={onIncrementHabitDay}
              onSaveNote={onSaveHabitNote}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
