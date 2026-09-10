import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Phase, Module, Challenge, Resource, Habit, UserProgress } from "../types";
import { ModuleCard } from "../components/ModuleCard";
import { ChallengeCard } from "../components/ChallengeCard";
import { ResourceCard } from "../components/ResourceCard";
import { HabitCard } from "../components/HabitCard";
import { ArrowLeft, Layers, Code2, Video, Flame, CheckCircle2, AlertCircle } from "lucide-react";
import Markdown from "react-markdown";

interface PhaseViewProps {
  allPhases: Phase[];
  allModules: Module[];
  allChallenges: Challenge[];
  allResources: Resource[];
  allHabits: Habit[];
  progress: UserProgress;
  onToggleChallengeComplete: (challengeId: string) => void;
  onToggleHabitActive: (habitId: string) => void;
  onIncrementHabitDay: (habitId: string) => void;
  onSaveHabitNote?: (habitId: string, note: string) => void;
}

export const PhaseView: React.FC<PhaseViewProps> = ({
  allPhases,
  allModules,
  allChallenges,
  allResources,
  allHabits,
  progress,
  onToggleChallengeComplete,
  onToggleHabitActive,
  onIncrementHabitDay,
  onSaveHabitNote,
}) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const phase = allPhases.find(p => p.slug === slug || p.id === slug) || allPhases[0];

  if (!phase) {
    return (
      <div className="space-y-6 py-12 text-center pb-20">
        <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl p-8 max-w-lg mx-auto space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-[#ECEFF4]">Fase no encontrada</h2>
          <p className="text-xs text-[#9FA7B8]">
            No existe ninguna fase con el identificador o slug <code className="text-[#4CAF50]">{slug}</code>.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-[#4CAF50] text-[#0b0f19] font-bold text-xs rounded-xl"
          >
            Volver a la ruta general
          </button>
        </div>
      </div>
    );
  }

  const phaseModules = allModules.filter(m => phase.modules?.includes(m.id) || m.phase === phase.id);
  const phaseChallenges = allChallenges.filter(c => phase.challenges?.includes(c.id) || phaseModules.some(m => m.id === c.module));
  const phaseResources = allResources.filter(r => phase.resources?.includes(r.id) || r.phases?.includes(phase.id));
  const phaseHabits = allHabits.filter(h => phase.habits?.includes(h.id) || h.phases?.includes(phase.id));

  const totalChallengesCount = phaseChallenges.length;
  const completedChallengesCount = phaseChallenges.filter(c => progress.completedChallenges.includes(c.id)).length;
  const pct = totalChallengesCount > 0 ? Math.round((completedChallengesCount / totalChallengesCount) * 100) : 0;

  return (
    <div className="space-y-8 pb-16">
      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#141927] hover:bg-[#1a2236] border border-[#2A2F3C] text-xs font-medium text-[#9FA7B8] hover:text-[#ECEFF4] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a la ruta general</span>
      </button>

      {/* Phase Header Banner */}
      <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#4CAF50]/15 text-[#4CAF50] border border-[#4CAF50]/30 rounded-lg">
                Fase {phase.order || "·"}
              </span>
              <span className="text-xs font-mono text-[#9FA7B8]">ID: {phase.id}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#ECEFF4]">
              {phase.title}
            </h1>

            <p className="text-sm text-[#9FA7B8] leading-relaxed">
              {phase.summary || "Fase de preparación estructurada con módulos técnicos, retos prácticos y recursos seleccionados."}
            </p>
          </div>

          <div className="bg-[#0b0f19] border border-[#2A2F3C] p-5 rounded-2xl flex items-center gap-4 shrink-0">
            <div className="w-14 h-14 rounded-xl bg-[#4CAF50]/15 border border-[#4CAF50]/30 flex items-center justify-center text-[#4CAF50]">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-mono text-[#9FA7B8]">Progreso de la Fase</div>
              <div className="text-2xl font-bold font-mono text-[#ECEFF4] mt-0.5">
                {pct}%
              </div>
              <div className="text-[11px] font-mono text-[#9FA7B8]">
                {completedChallengesCount} de {totalChallengesCount} retos hechos
              </div>
            </div>
          </div>
        </div>

        {/* Phase Markdown Notes if any */}
        {phase.body && (
          <div className="mt-6 pt-6 border-t border-[#2A2F3C] prose prose-invert prose-xs max-w-none text-xs text-[#ECEFF4] leading-relaxed">
            <Markdown>{phase.body}</Markdown>
          </div>
        )}
      </div>

      {/* Modules in this Phase */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#03A9F4]" />
          <h2 className="text-xl font-bold text-[#ECEFF4]">Módulos de la Fase ({phaseModules.length})</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {phaseModules.map(mod => (
            <ModuleCard
              key={mod.id}
              module={mod}
              challenges={allChallenges}
              onOpenModule={(modId) => {
                const targetMod = allModules.find(m => m.id === modId);
                const modSlug = targetMod?.slug || modId;
                navigate(`/module/${modSlug}`);
              }}
              progress={progress}
            />
          ))}
        </div>
      </div>

      {/* Highlights Challenges in this Phase */}
      {phaseChallenges.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-[#4CAF50]" />
              <h2 className="text-xl font-bold text-[#ECEFF4]">Retos Asignados ({phaseChallenges.length})</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {phaseChallenges.map(c => (
              <ChallengeCard
                key={c.id}
                challenge={c}
                onOpenChallenge={(ch) => {
                  navigate(`/challenge/${ch.slug || ch.id}`);
                }}
                progress={progress}
                onToggleComplete={onToggleChallengeComplete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Habits & Resources 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Habits */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#FFC107]" />
            <h3 className="text-lg font-bold text-[#ECEFF4]">Hábitos Recomendados ({phaseHabits.length})</h3>
          </div>

          <div className="space-y-4">
            {phaseHabits.map(habit => (
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

        {/* Resources */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-[#03A9F4]" />
            <h3 className="text-lg font-bold text-[#ECEFF4]">Recursos & Referencias ({phaseResources.length})</h3>
          </div>

          <div className="space-y-3">
            {phaseResources.map(res => (
              <ResourceCard
                key={res.id}
                resource={res}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
