import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Module, Challenge, Resource, UserProgress } from "../types";
import { ChallengeCard } from "../components/ChallengeCard";
import { ResourceCard } from "../components/ResourceCard";
import { ArrowLeft, AlertTriangle, Lightbulb, Code2, BookOpen, Sparkles, AlertCircle } from "lucide-react";
import Markdown from "react-markdown";

interface ModuleViewProps {
  allModules: Module[];
  allChallenges: Challenge[];
  allResources: Resource[];
  progress: UserProgress;
  onToggleChallengeComplete: (challengeId: string) => void;
  onAskAi: (prompt: string, context: string) => void;
}

export const ModuleView: React.FC<ModuleViewProps> = ({
  allModules,
  allChallenges,
  allResources,
  progress,
  onToggleChallengeComplete,
  onAskAi,
}) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const module = allModules.find(m => m.slug === slug || m.id === slug) || allModules[0];

  if (!module) {
    return (
      <div className="space-y-6 py-12 text-center pb-20">
        <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl p-8 max-w-lg mx-auto space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-[#ECEFF4]">Módulo no encontrado</h2>
          <p className="text-xs text-[#9FA7B8]">
            No existe ningún módulo con el identificador o slug <code className="text-[#03A9F4]">{slug}</code>.
          </p>
          <button
            onClick={() => navigate("/modules")}
            className="px-4 py-2 bg-[#03A9F4] text-[#0b0f19] font-bold text-xs rounded-xl"
          >
            Ver todos los módulos
          </button>
        </div>
      </div>
    );
  }

  const moduleChallenges = allChallenges.filter(c => c.module === module.id || module.challenges?.includes(c.id));
  const moduleResources = allResources.filter(r => module.resources?.includes(r.id) || r.modules?.includes(module.id));

  const completedCount = moduleChallenges.filter(c => progress.completedChallenges.includes(c.id)).length;
  const pct = moduleChallenges.length > 0 ? Math.round((completedCount / moduleChallenges.length) * 100) : 0;

  const levelBadge = {
    basic: { label: "Nivel Básico", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
    intermediate: { label: "Nivel Intermedio", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
    advanced: { label: "Nivel Avanzado", color: "text-rose-400 border-rose-500/30 bg-rose-500/10" },
  }[module.level || "basic"] || { label: "Básico", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" };

  return (
    <div className="space-y-8 pb-16">
      {/* Back button */}
      <button
        onClick={() => navigate("/modules")}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#141927] hover:bg-[#1a2236] border border-[#2A2F3C] text-xs font-medium text-[#9FA7B8] hover:text-[#ECEFF4] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a Módulos</span>
      </button>

      {/* Module Header */}
      <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-1 text-xs font-mono font-medium rounded-lg border ${levelBadge.color}`}>
                {levelBadge.label}
              </span>
              <span className="px-2.5 py-1 text-xs font-mono bg-[#03A9F4]/10 text-[#03A9F4] border border-[#03A9F4]/30 rounded-lg">
                Fase: {module.phase}
              </span>
              <span className="text-xs font-mono text-[#9FA7B8]">ID: {module.id}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#ECEFF4]">
              {module.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onAskAi(`¿Cuáles son los conceptos fundamentales y los errores más comunes al enfrentarse al módulo ${module.title}?`, `Módulo: ${module.title}, Nivel: ${module.level}`)}
              className="px-4 py-2.5 bg-[#4CAF50]/15 hover:bg-[#4CAF50]/25 border border-[#4CAF50]/40 text-[#4CAF50] rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Consultar Tutor IA sobre {module.title.split(":")[0]}</span>
            </button>
          </div>
        </div>

        {/* Concepts & Cognitive difficulties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-[#2A2F3C]">
          {/* Concepts */}
          <div className="p-4 bg-[#0b0f19] border border-[#2A2F3C] rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#03A9F4]">
              <Lightbulb className="w-4 h-4" />
              <span>Conceptos Clave</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {module.concepts && module.concepts.map((concept, i) => (
                <span key={i} className="px-2.5 py-1 text-xs font-mono bg-[#141927] border border-[#2A2F3C] text-[#ECEFF4] rounded-lg">
                  {concept}
                </span>
              ))}
            </div>
          </div>

          {/* Cognitive difficulties */}
          <div className="p-4 bg-[#0b0f19] border border-[#2A2F3C] rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FFC107]">
              <AlertTriangle className="w-4 h-4" />
              <span>Dificultades Cognitivas</span>
            </div>
            <ul className="space-y-1 text-xs text-[#9FA7B8]">
              {module.cognitive_difficulties && module.cognitive_difficulties.map((diff, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFC107] mt-1.5 shrink-0" />
                  <span>{diff}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Module Description (Clean Body) */}
        {module.body && (
          <div className="mt-6 pt-6 border-t border-[#2A2F3C] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#03A9F4]">
              <BookOpen className="w-4 h-4" />
              <span>Descripción del Módulo</span>
            </div>
            <div className="prose prose-invert max-w-none text-xs sm:text-sm text-[#CAD2E2] leading-relaxed">
              <Markdown>{module.body}</Markdown>
            </div>
          </div>
        )}
      </div>

      {/* Associated Challenges Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-[#4CAF50]" />
            <h2 className="text-xl font-bold text-[#ECEFF4]">
              Retos de Código del Módulo ({moduleChallenges.length})
            </h2>
          </div>
          <span className="text-xs font-mono text-[#9FA7B8]">
            {completedCount}/{moduleChallenges.length} completados ({pct}%)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {moduleChallenges.map(challenge => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onOpenChallenge={(ch) => {
                navigate(`/challenge/${ch.slug || ch.id}`);
              }}
              progress={progress}
              onToggleComplete={onToggleChallengeComplete}
            />
          ))}
        </div>
      </div>

      {/* Resources for this module */}
      {moduleResources.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#03A9F4]" />
            <h2 className="text-xl font-bold text-[#ECEFF4]">
              Recursos de Estudio Recomendados ({moduleResources.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {moduleResources.map(res => (
              <ResourceCard
                key={res.id}
                resource={res}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
