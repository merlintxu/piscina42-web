import React, { useState, useEffect } from "react";
import { ContentJSON, Challenge, Module, Phase, Resource } from "../types";
import { Search, X, Terminal, BookOpen, Code2, Video, Flame, Clock, ArrowRight } from "lucide-react";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: ContentJSON;
  onNavigateItem: (type: "phase" | "module" | "challenge" | "exam" | "habit", id: string, extra?: any) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  content,
  onNavigateItem
}) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchingChallenges = q
    ? content.challenges.filter(c => 
        c.title.toLowerCase().includes(q) || 
        c.id.toLowerCase().includes(q) || 
        c.module.toLowerCase().includes(q) ||
        (c.tags && c.tags.some(t => t.toLowerCase().includes(q)))
      ).slice(0, 6)
    : [];

  const matchingModules = q
    ? content.modules.filter(m => 
        m.title.toLowerCase().includes(q) || 
        m.id.toLowerCase().includes(q) ||
        (m.concepts && m.concepts.some(c => c.toLowerCase().includes(q)))
      ).slice(0, 4)
    : [];

  const matchingPhases = q
    ? content.phases.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.id.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const matchingResources = q
    ? content.resources.filter(r => 
        r.title.toLowerCase().includes(q) || 
        r.id.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const totalResults = matchingChallenges.length + matchingModules.length + matchingPhases.length + matchingResources.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#141927] border border-[#2A2F3C] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search input header */}
        <div className="p-4 border-b border-[#2A2F3C] flex items-center gap-3 bg-[#0b0f19]">
          <Search className="w-5 h-5 text-[#4CAF50]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por reto (ft_swap, argv), módulo (C01, Shell), conceptos o recursos..."
            className="flex-1 bg-transparent text-sm text-[#ECEFF4] placeholder-[#9FA7B8] focus:outline-none font-mono"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-xs font-mono text-[#9FA7B8] hover:text-[#ECEFF4]"
            >
              Borrar
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#2A2F3C] text-[#9FA7B8]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {q === "" ? (
            <div className="py-8 text-center text-[#9FA7B8] space-y-2">
              <Terminal className="w-8 h-8 mx-auto text-[#03A9F4]" />
              <p className="text-xs font-mono">Escribe para buscar entre los 55 retos, 9 módulos y 4 fases...</p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {["punteros", "ft_split", "norminette", "shell01", "malloc", "examen"].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-2.5 py-1 rounded bg-[#0b0f19] border border-[#2A2F3C] text-[11px] text-[#ECEFF4] hover:border-[#4CAF50]"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center text-[#9FA7B8]">
              <p className="text-sm font-semibold text-[#ECEFF4]">Sin resultados para "{query}"</p>
              <p className="text-xs mt-1">Prueba buscando por palabras clave como "punteros", "malloc", "argv" o "shell".</p>
            </div>
          ) : (
            <>
              {/* Challenges */}
              {matchingChallenges.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-[#4CAF50] block mb-2">
                    Retos de Código ({matchingChallenges.length})
                  </span>
                  <div className="space-y-1.5">
                    {matchingChallenges.map(c => (
                      <div
                        key={c.id}
                        onClick={() => {
                          onNavigateItem("challenge", c.id, c);
                          onClose();
                        }}
                        className="p-3 bg-[#0b0f19] hover:bg-[#181f30] border border-[#2A2F3C] hover:border-[#4CAF50]/60 rounded-xl cursor-pointer flex items-center justify-between transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <Code2 className="w-4 h-4 text-[#4CAF50]" />
                          <div>
                            <div className="text-xs font-bold text-[#ECEFF4]">{c.title}</div>
                            <div className="text-[10px] font-mono text-[#9FA7B8]">
                              Módulo: {c.module} · {c.difficulty}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#9FA7B8]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modules */}
              {matchingModules.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-[#03A9F4] block mb-2">
                    Módulos ({matchingModules.length})
                  </span>
                  <div className="space-y-1.5">
                    {matchingModules.map(m => (
                      <div
                        key={m.id}
                        onClick={() => {
                          onNavigateItem("module", m.id);
                          onClose();
                        }}
                        className="p-3 bg-[#0b0f19] hover:bg-[#181f30] border border-[#2A2F3C] hover:border-[#03A9F4]/60 rounded-xl cursor-pointer flex items-center justify-between transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <Terminal className="w-4 h-4 text-[#03A9F4]" />
                          <div>
                            <div className="text-xs font-bold text-[#ECEFF4]">{m.title}</div>
                            <div className="text-[10px] font-mono text-[#9FA7B8]">
                              Nivel: {m.level} · {m.challenges?.length || 0} retos
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#9FA7B8]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Phases */}
              {matchingPhases.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-[#FFC107] block mb-2">
                    Fases de la Ruta ({matchingPhases.length})
                  </span>
                  <div className="space-y-1.5">
                    {matchingPhases.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onNavigateItem("phase", p.id);
                          onClose();
                        }}
                        className="p-3 bg-[#0b0f19] hover:bg-[#181f30] border border-[#2A2F3C] hover:border-[#FFC107]/60 rounded-xl cursor-pointer flex items-center justify-between transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <BookOpen className="w-4 h-4 text-[#FFC107]" />
                          <div>
                            <div className="text-xs font-bold text-[#ECEFF4]">{p.title}</div>
                            <div className="text-[10px] font-mono text-[#9FA7B8] line-clamp-1">{p.summary}</div>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#9FA7B8]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
