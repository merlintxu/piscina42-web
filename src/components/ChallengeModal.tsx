import React, { useState } from "react";
import { Challenge, UserProgress } from "../types";
import { X, CheckCircle2, Circle, Clock, ShieldCheck, Terminal, Sparkles, Copy, Check, Bookmark, BookOpen } from "lucide-react";
import Markdown from "react-markdown";
import confetti from "canvas-confetti";

interface ChallengeModalProps {
  challenge: Challenge | null;
  onClose: () => void;
  progress: UserProgress;
  onToggleComplete: (challengeId: string) => void;
  onToggleBookmark: (challengeId: string) => void;
  onAskAi: (prompt: string, context: string) => void;
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  challenge,
  onClose,
  progress,
  onToggleComplete,
  onToggleBookmark,
  onAskAi
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"statement" | "norminette" | "peer_checklist">("statement");

  if (!challenge) return null;

  const isDone = progress.completedChallenges.includes(challenge.id);
  const isBookmarked = progress.bookmarkedItems.includes(challenge.id);

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

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        id="challenge-modal"
        className="bg-[#141927] border border-[#2A2F3C] w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#2A2F3C] flex items-center justify-between bg-[#0b0f19]/60">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggle}
              className="p-1.5 rounded-lg hover:bg-[#2A2F3C] transition-colors"
              title={isDone ? "Completado" : "Pendiente"}
            >
              {isDone ? (
                <CheckCircle2 className="w-6 h-6 text-[#4CAF50]" />
              ) : (
                <Circle className="w-6 h-6 text-[#9FA7B8] hover:text-[#ECEFF4]" />
              )}
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-mono bg-[#03A9F4]/10 text-[#03A9F4] border border-[#03A9F4]/30 rounded">
                  {challenge.module}
                </span>
                <span className="text-xs font-mono text-[#9FA7B8]">
                  ID: {challenge.id}
                </span>
                {challenge.norminette_focus && (
                  <span className="px-2 py-0.5 text-xs font-mono bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/30 rounded flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Norminette
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-[#ECEFF4] mt-1">
                {challenge.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleBookmark(challenge.id)}
              className={`p-2 rounded-lg border transition-colors ${
                isBookmarked 
                  ? "bg-[#FFC107]/15 border-[#FFC107]/40 text-[#FFC107]" 
                  : "bg-[#141927] border-[#2A2F3C] text-[#9FA7B8] hover:text-[#ECEFF4]"
              }`}
              title="Guardar marcador"
            >
              <Bookmark className="w-4 h-4" />
            </button>

            <button
              onClick={() => onAskAi(`¿Puedes darme una pista conceptual o casos límite para resolver el reto ${challenge.title} (${challenge.id}) sin darme el código completo?`, `Reto: ${challenge.title}, Módulo: ${challenge.module}`)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#4CAF50]/15 hover:bg-[#4CAF50]/25 border border-[#4CAF50]/40 text-[#4CAF50] text-xs font-semibold transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Pedir pista al Tutor</span>
            </button>

            <button
              id="close-challenge-modal-btn"
              onClick={onClose}
              className="p-2 rounded-lg bg-[#141927] hover:bg-[#2A2F3C] border border-[#2A2F3C] text-[#9FA7B8] hover:text-[#ECEFF4]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="px-6 border-b border-[#2A2F3C] flex gap-4 bg-[#0b0f19]/30 text-xs font-medium">
          <button
            onClick={() => setActiveTab("statement")}
            className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "statement"
                ? "border-[#4CAF50] text-[#4CAF50]"
                : "border-transparent text-[#9FA7B8] hover:text-[#ECEFF4]"
            }`}
          >
            <Terminal className="w-4 h-4" />
            Enunciado & Restricciones
          </button>
          <button
            onClick={() => setActiveTab("norminette")}
            className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "norminette"
                ? "border-[#4CAF50] text-[#4CAF50]"
                : "border-transparent text-[#9FA7B8] hover:text-[#ECEFF4]"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Pautas Norminette
          </button>
          <button
            onClick={() => setActiveTab("peer_checklist")}
            className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "peer_checklist"
                ? "border-[#4CAF50] text-[#4CAF50]"
                : "border-transparent text-[#9FA7B8] hover:text-[#ECEFF4]"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Checklist Peer-Evaluation
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-[#ECEFF4]">
          {activeTab === "statement" && (
            <div>
              {/* Meta details bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-[#0b0f19] border border-[#2A2F3C] rounded-xl font-mono text-xs mb-6">
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
                <div className="mt-6 pt-4 border-t border-[#2A2F3C] flex items-center gap-2">
                  <span className="text-xs text-[#9FA7B8]">Tags:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {challenge.tags.map((t, i) => (
                      <span key={i} className="px-2 py-0.5 text-xs font-mono bg-[#0b0f19] border border-[#2A2F3C] rounded text-[#9FA7B8]">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-[#0b0f19] border border-[#2A2F3C] rounded-xl space-y-1.5">
                  <div className="font-bold text-[#4CAF50]">1. Longitud y funciones</div>
                  <p className="text-[#9FA7B8]">Máximo 25 líneas por función. Máximo 5 funciones por archivo <code>.c</code>.</p>
                </div>
                <div className="p-3.5 bg-[#0b0f19] border border-[#2A2F3C] rounded-xl space-y-1.5">
                  <div className="font-bold text-[#4CAF50]">2. Variables & Parámetros</div>
                  <p className="text-[#9FA7B8]">Máximo 4 parámetros por función. Variables declaradas al inicio del bloque.</p>
                </div>
                <div className="p-3.5 bg-[#0b0f19] border border-[#2A2F3C] rounded-xl space-y-1.5">
                  <div className="font-bold text-[#4CAF50]">3. Estructuras de control</div>
                  <p className="text-[#9FA7B8]">Prohibido: <code>for</code>, <code>do...while</code>, <code>switch</code>, <code>goto</code>, operadores ternarios complejos.</p>
                </div>
                <div className="p-3.5 bg-[#0b0f19] border border-[#2A2F3C] rounded-xl space-y-1.5">
                  <div className="font-bold text-[#4CAF50]">4. Indentación y espacios</div>
                  <p className="text-[#9FA7B8]">Indentación exclusivamente con 1 tabulación (no 4 espacios). Espacio antes de llaves.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "peer_checklist" && (
            <div className="space-y-4">
              <div className="p-4 bg-[#03A9F4]/10 border border-[#03A9F4]/30 rounded-xl text-xs space-y-1">
                <h4 className="font-bold text-[#03A9F4] text-sm">Guía de corrección entre iguales (Peer-Evaluation)</h4>
                <p className="text-[#ECEFF4]">
                  Preguntas que debes hacerle al compañero durante la evaluación:
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-[#ECEFF4]">
                <li className="p-3 bg-[#0b0f19] border border-[#2A2F3C] rounded-lg flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#4CAF50]/20 text-[#4CAF50] font-mono flex items-center justify-center shrink-0">1</span>
                  <div>
                    <strong className="text-[#ECEFF4]">Explicación de memoria:</strong>
                    <p className="text-[#9FA7B8] mt-0.5">Pídele que dibuje o explique cómo se mueven los punteros y qué ocurre en la memoria RAM.</p>
                  </div>
                </li>
                <li className="p-3 bg-[#0b0f19] border border-[#2A2F3C] rounded-lg flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#4CAF50]/20 text-[#4CAF50] font-mono flex items-center justify-center shrink-0">2</span>
                  <div>
                    <strong className="text-[#ECEFF4]">Casos extremos (Edge cases):</strong>
                    <p className="text-[#9FA7B8] mt-0.5">¿Qué ocurre si se pasa un puntero <code>NULL</code>, una cadena vacía <code>""</code>, o números negativos?</p>
                  </div>
                </li>
                <li className="p-3 bg-[#0b0f19] border border-[#2A2F3C] rounded-lg flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#4CAF50]/20 text-[#4CAF50] font-mono flex items-center justify-center shrink-0">3</span>
                  <div>
                    <strong className="text-[#ECEFF4]">Memory Leaks & Valgrind:</strong>
                    <p className="text-[#9FA7B8] mt-0.5">Si usa asignación dinámica (C07+), ejecutar con <code>valgrind --leak-check=full</code>. Cualquier leak es 0.</p>
                  </div>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2A2F3C] bg-[#0b0f19]/80 flex items-center justify-between">
          <div className="text-xs text-[#9FA7B8] font-mono">
            Estado: <span className={isDone ? "text-[#4CAF50] font-bold" : "text-[#FFC107]"}>{isDone ? "Completado ✓" : "Pendiente"}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggle}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
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
      </div>
    </div>
  );
};
