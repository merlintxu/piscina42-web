import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ContentJSON, Challenge, UserProgress } from "../types";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Circle, 
  Clock, 
  ShieldCheck, 
  Terminal, 
  Sparkles, 
  Bookmark, 
  BookOpen, 
  Layers,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import Markdown from "react-markdown";
import confetti from "canvas-confetti";

interface ChallengePageProps {
  content: ContentJSON;
  progress: UserProgress;
  onToggleComplete: (challengeId: string) => void;
  onToggleBookmark: (challengeId: string) => void;
  onAskAi: (prompt: string, context: string) => void;
}

export const ChallengePage: React.FC<ChallengePageProps> = ({
  content,
  progress,
  onToggleComplete,
  onToggleBookmark,
  onAskAi,
}) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"statement" | "norminette" | "peer_checklist">("statement");

  const challenge = content.challenges.find(
    (c) => c.slug === slug || c.id === slug
  );

  if (!challenge) {
    return (
      <div className="space-y-6 py-12 text-center pb-20">
        <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl p-8 max-w-lg mx-auto space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-[#ECEFF4]">Reto no encontrado</h2>
          <p className="text-xs text-[#9FA7B8]">
            No existe ningún reto con el slug o identificador <code className="text-[#4CAF50]">{slug}</code>.
          </p>
          <button
            onClick={() => navigate("/challenges")}
            className="px-4 py-2 bg-[#4CAF50] text-[#0b0f19] font-bold text-xs rounded-xl"
          >
            Volver al catálogo de retos
          </button>
        </div>
      </div>
    );
  }

  const isDone = progress.completedChallenges.includes(challenge.id);
  const isBookmarked = progress.bookmarkedItems.includes(challenge.id);

  const parentModule = content.modules.find(
    (m) => m.id === challenge.module || m.slug === challenge.module
  );

  const parentPhase = content.phases.find(
    (p) => p.id === challenge.phase || (parentModule && p.modules.includes(parentModule.id))
  );

  const handleToggle = () => {
    if (!isDone) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#4CAF50", "#03A9F4", "#FFC107"],
      });
    }
    onToggleComplete(challenge.id);
  };

  const diffBadge = {
    easy: { label: "Fácil", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
    medium: { label: "Media", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
    hard: { label: "Difícil", color: "text-rose-400 border-rose-500/30 bg-rose-500/10" },
  }[challenge.difficulty || "easy"] || { label: "Fácil", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" };

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* Navigation Breadcrumb & Back button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-mono text-[#9FA7B8]">
          <Link to="/challenges" className="hover:text-[#ECEFF4] flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retos</span>
          </Link>
          {parentPhase && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-[#2A2F3C]" />
              <Link to={`/phase/${parentPhase.slug || parentPhase.id}`} className="hover:text-[#4CAF50] truncate max-w-[150px]">
                {parentPhase.title.split(":")[0]}
              </Link>
            </>
          )}
          {parentModule && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-[#2A2F3C]" />
              <Link to={`/module/${parentModule.slug || parentModule.id}`} className="hover:text-[#03A9F4] truncate max-w-[150px]">
                {parentModule.title.split(":")[0]}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-[#2A2F3C]" />
          <span className="text-[#ECEFF4] font-bold">{challenge.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleBookmark(challenge.id)}
            className={`p-2 rounded-xl border transition-colors ${
              isBookmarked
                ? "bg-[#FFC107]/15 border-[#FFC107]/40 text-[#FFC107]"
                : "bg-[#141927] border-[#2A2F3C] text-[#9FA7B8] hover:text-[#ECEFF4]"
            }`}
            title="Guardar en marcadores"
          >
            <Bookmark className="w-4 h-4" />
          </button>

          <button
            onClick={() =>
              onAskAi(
                `¿Puedes darme una pista conceptual o casos límite para resolver el reto ${challenge.title} (${challenge.id}) sin darme el código completo?`,
                `Reto: ${challenge.title}, Módulo: ${challenge.module}`
              )
            }
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#4CAF50]/15 hover:bg-[#4CAF50]/25 border border-[#4CAF50]/40 text-[#4CAF50] text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Consultar Tutor IA</span>
          </button>
        </div>
      </div>

      {/* Main Challenge Card Container */}
      <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-[#2A2F3C] bg-[#0b0f19]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <button
              onClick={handleToggle}
              className="p-1.5 rounded-xl hover:bg-[#2A2F3C] transition-colors mt-0.5 sm:mt-0"
              title={isDone ? "Completado" : "Pendiente"}
            >
              {isDone ? (
                <CheckCircle2 className="w-8 h-8 text-[#4CAF50]" />
              ) : (
                <Circle className="w-8 h-8 text-[#9FA7B8] hover:text-[#ECEFF4]" />
              )}
            </button>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                {parentModule ? (
                  <Link
                    to={`/module/${parentModule.slug || parentModule.id}`}
                    className="px-2.5 py-0.5 text-xs font-mono bg-[#03A9F4]/10 text-[#03A9F4] border border-[#03A9F4]/30 rounded hover:bg-[#03A9F4]/20 transition-colors"
                  >
                    {challenge.module}
                  </Link>
                ) : (
                  <span className="px-2.5 py-0.5 text-xs font-mono bg-[#03A9F4]/10 text-[#03A9F4] border border-[#03A9F4]/30 rounded">
                    {challenge.module}
                  </span>
                )}

                <span className="text-xs font-mono text-[#9FA7B8]">ID: {challenge.id}</span>

                <span className={`px-2 py-0.5 text-[10px] font-mono font-medium rounded border ${diffBadge.color}`}>
                  {diffBadge.label}
                </span>

                {challenge.norminette_focus && (
                  <span className="px-2 py-0.5 text-xs font-mono bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/30 rounded flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Norminette Focus
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#ECEFF4] mt-2">
                {challenge.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              onClick={handleToggle}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                isDone
                  ? "bg-[#2A2F3C] text-[#ECEFF4] hover:bg-[#3e4659]"
                  : "bg-[#4CAF50] text-[#0b0f19] hover:bg-[#43a047] shadow-lg shadow-[#4CAF50]/20"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isDone ? "Marcar como pendiente" : "Marcar como Superado"}
            </button>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="px-6 sm:px-8 border-b border-[#2A2F3C] flex gap-6 bg-[#0b0f19]/30 text-xs font-medium">
          <button
            onClick={() => setActiveTab("statement")}
            className={`py-3.5 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "statement"
                ? "border-[#4CAF50] text-[#4CAF50] font-bold"
                : "border-transparent text-[#9FA7B8] hover:text-[#ECEFF4]"
            }`}
          >
            <Terminal className="w-4 h-4" />
            Enunciado & Restricciones
          </button>
          <button
            onClick={() => setActiveTab("norminette")}
            className={`py-3.5 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "norminette"
                ? "border-[#4CAF50] text-[#4CAF50] font-bold"
                : "border-transparent text-[#9FA7B8] hover:text-[#ECEFF4]"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Pautas Norminette
          </button>
          <button
            onClick={() => setActiveTab("peer_checklist")}
            className={`py-3.5 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "peer_checklist"
                ? "border-[#4CAF50] text-[#4CAF50] font-bold"
                : "border-transparent text-[#9FA7B8] hover:text-[#ECEFF4]"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Checklist Peer-Evaluation
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 sm:p-8 space-y-6 text-sm text-[#ECEFF4]">
          {activeTab === "statement" && (
            <div>
              {/* Meta details bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#0b0f19] border border-[#2A2F3C] rounded-xl font-mono text-xs mb-6">
                <div>
                  <span className="text-[#9FA7B8] block text-[11px]">Dificultad</span>
                  <span className="font-semibold text-[#4CAF50] capitalize">{challenge.difficulty}</span>
                </div>
                <div>
                  <span className="text-[#9FA7B8] block text-[11px]">Tiempo Estimado</span>
                  <span className="font-semibold text-[#ECEFF4]">{challenge.estimated_time_minutes || 45} min</span>
                </div>
                <div>
                  <span className="text-[#9FA7B8] block text-[11px]">Módulo Padre</span>
                  <span className="font-semibold text-[#03A9F4]">{challenge.module}</span>
                </div>
                <div>
                  <span className="text-[#9FA7B8] block text-[11px]">Funciones Permitidas</span>
                  <span className="font-semibold text-[#FFC107]">write (unistd.h)</span>
                </div>
              </div>

              {/* Markdown Content */}
              <div className="prose prose-invert max-w-none prose-headings:text-[#ECEFF4] prose-headings:font-bold prose-p:text-[#ECEFF4] prose-code:text-[#4CAF50] prose-pre:bg-[#0b0f19] prose-pre:border prose-pre:border-[#2A2F3C]">
                {challenge.body ? (
                  <div className="space-y-4 leading-relaxed">
                    <Markdown>{challenge.body}</Markdown>
                  </div>
                ) : (
                  <div className="p-6 text-center text-[#9FA7B8] bg-[#0b0f19] border border-[#2A2F3C] rounded-xl">
                    <Terminal className="w-8 h-8 mx-auto mb-2 text-[#03A9F4]" />
                    <p className="font-semibold text-[#ECEFF4]">Ejercicio práctico de {challenge.title}</p>
                    <p className="text-xs mt-1">
                      Implementa la solución en C respetando la Norminette y compila con:
                      <br />
                      <code className="text-[#4CAF50] bg-[#141927] px-2 py-1 rounded mt-2 inline-block">
                        gcc -Wall -Wextra -Werror main.c {challenge.id}.c
                      </code>
                    </p>
                  </div>
                )}
              </div>

              {/* Tags */}
              {challenge.tags && challenge.tags.length > 0 && (
                <div className="mt-8 pt-4 border-t border-[#2A2F3C] flex items-center gap-2">
                  <span className="text-xs text-[#9FA7B8]">Tags:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {challenge.tags.map((t, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 text-xs font-mono bg-[#0b0f19] border border-[#2A2F3C] rounded text-[#9FA7B8]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "norminette" && (
            <div className="space-y-4">
              <div className="p-4 bg-[#FFC107]/5 border border-[#FFC107]/20 rounded-xl text-xs space-y-2">
                <h4 className="font-bold text-[#FFC107] text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Reglas de Norminette obligatorias para {challenge.id}
                </h4>
                <p className="text-[#ECEFF4]">
                  En 42 cualquier error de Norminette (Norme) anula automáticamente la nota (0/100).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-[#0b0f19] border border-[#2A2F3C] rounded-xl space-y-1.5">
                  <div className="font-bold text-[#4CAF50]">1. Longitud y funciones</div>
                  <p className="text-[#9FA7B8]">
                    Máximo 25 líneas por función. Máximo 5 funciones por archivo <code>.c</code>.
                  </p>
                </div>
                <div className="p-4 bg-[#0b0f19] border border-[#2A2F3C] rounded-xl space-y-1.5">
                  <div className="font-bold text-[#4CAF50]">2. Variables & Parámetros</div>
                  <p className="text-[#9FA7B8]">
                    Máximo 4 parámetros por función. Variables declaradas al inicio del bloque.
                  </p>
                </div>
                <div className="p-4 bg-[#0b0f19] border border-[#2A2F3C] rounded-xl space-y-1.5">
                  <div className="font-bold text-[#4CAF50]">3. Estructuras de control</div>
                  <p className="text-[#9FA7B8]">
                    Prohibido: <code>for</code>, <code>do...while</code>, <code>switch</code>, <code>goto</code>, operadores ternarios complejos.
                  </p>
                </div>
                <div className="p-4 bg-[#0b0f19] border border-[#2A2F3C] rounded-xl space-y-1.5">
                  <div className="font-bold text-[#4CAF50]">4. Indentación y espacios</div>
                  <p className="text-[#9FA7B8]">
                    Indentación exclusivamente con 1 tabulación (no 4 espacios). Espacio antes de llaves.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "peer_checklist" && (
            <div className="space-y-4">
              <div className="p-4 bg-[#03A9F4]/10 border border-[#03A9F4]/30 rounded-xl text-xs space-y-1">
                <h4 className="font-bold text-[#03A9F4] text-sm">Guía de corrección entre iguales (Peer-Evaluation)</h4>
                <p className="text-[#ECEFF4]">
                  Preguntas clave para realizar durante la corrección:
                </p>
              </div>

              <ul className="space-y-3 text-xs text-[#ECEFF4]">
                <li className="p-4 bg-[#0b0f19] border border-[#2A2F3C] rounded-xl flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#4CAF50]/20 text-[#4CAF50] font-mono flex items-center justify-center shrink-0">1</span>
                  <div>
                    <strong className="text-[#ECEFF4] text-sm">Explicación de memoria:</strong>
                    <p className="text-[#9FA7B8] mt-1 leading-relaxed">
                      Pídele que dibuje o explique cómo se mueven los punteros y qué ocurre en el stack o heap de la memoria RAM.
                    </p>
                  </div>
                </li>
                <li className="p-4 bg-[#0b0f19] border border-[#2A2F3C] rounded-xl flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#4CAF50]/20 text-[#4CAF50] font-mono flex items-center justify-center shrink-0">2</span>
                  <div>
                    <strong className="text-[#ECEFF4] text-sm">Casos extremos (Edge cases):</strong>
                    <p className="text-[#9FA7B8] mt-1 leading-relaxed">
                      ¿Qué ocurre si se pasa un puntero <code>NULL</code>, una cadena vacía <code>""</code>, o números enteros extremos como <code>INT_MIN</code> / <code>INT_MAX</code>?
                    </p>
                  </div>
                </li>
                <li className="p-4 bg-[#0b0f19] border border-[#2A2F3C] rounded-xl flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#4CAF50]/20 text-[#4CAF50] font-mono flex items-center justify-center shrink-0">3</span>
                  <div>
                    <strong className="text-[#ECEFF4] text-sm">Memory Leaks & Valgrind:</strong>
                    <p className="text-[#9FA7B8] mt-1 leading-relaxed">
                      Si usa asignación dinámica (C07+), ejecutar con <code>valgrind --leak-check=full</code>. Cualquier leak invalida la nota a 0.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
