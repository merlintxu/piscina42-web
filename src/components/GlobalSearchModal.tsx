import React, { useState, useEffect, useRef } from "react";
import { ContentJSON } from "../types";
import { 
  Search, 
  X, 
  Terminal, 
  BookOpen, 
  Code2, 
  ExternalLink, 
  Flame, 
  Clock, 
  ArrowRight,
  Sparkles,
  Command,
  CornerDownLeft
} from "lucide-react";
import { searchContent, SearchResultItem, SearchResultType } from "../lib/search";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: ContentJSON;
  onNavigateItem: (type: SearchResultType, id: string, extra?: any) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  content,
  onNavigateItem,
}) => {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  const results = searchContent(content, query, 20);

  // Focus input automatically whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setActiveIndex(0);
    } else {
      setQuery("");
      setActiveIndex(0);
    }
  }, [isOpen]);

  // Reset active index when query changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Keep active item in view during keyboard navigation
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeIndex]);

  if (!isOpen) return null;

  const handleSelectItem = (item: SearchResultItem) => {
    if (item.type === "resource" && item.url) {
      window.open(item.url, "_blank", "noopener,noreferrer");
      onClose();
      return;
    }

    onNavigateItem(item.type, item.id, item.data);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }

    if (results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[activeIndex]) {
        handleSelectItem(results[activeIndex]);
      }
    }
  };

  const getTypeIcon = (type: SearchResultType) => {
    switch (type) {
      case "phase":
        return <BookOpen className="w-4 h-4 text-[#FFC107]" />;
      case "module":
        return <Terminal className="w-4 h-4 text-[#03A9F4]" />;
      case "challenge":
        return <Code2 className="w-4 h-4 text-[#4CAF50]" />;
      case "resource":
        return <ExternalLink className="w-4 h-4 text-[#AB47BC]" />;
      case "habit":
        return <Flame className="w-4 h-4 text-[#FF7043]" />;
      case "exam":
        return <Clock className="w-4 h-4 text-[#E91E63]" />;
    }
  };

  const getTypeBadgeClass = (type: SearchResultType) => {
    switch (type) {
      case "phase":
        return "bg-[#FFC107]/15 text-[#FFC107] border-[#FFC107]/30";
      case "module":
        return "bg-[#03A9F4]/15 text-[#03A9F4] border-[#03A9F4]/30";
      case "challenge":
        return "bg-[#4CAF50]/15 text-[#4CAF50] border-[#4CAF50]/30";
      case "resource":
        return "bg-[#AB47BC]/15 text-[#AB47BC] border-[#AB47BC]/30";
      case "habit":
        return "bg-[#FF7043]/15 text-[#FF7043] border-[#FF7043]/30";
      case "exam":
        return "bg-[#E91E63]/15 text-[#E91E63] border-[#E91E63]/30";
    }
  };

  // Dynamic counts derived from actual content
  const totalChallenges = content.challenges.length;
  const totalModules = content.modules.length;
  const totalPhases = content.phases.length;
  const totalResources = content.resources.length;
  const totalHabits = content.habits.length;
  const totalExams = content.exams.length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette / Búsqueda global de Piscina 42"
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 md:pt-20 p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#141927] border border-[#2A2F3C] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh]">
        {/* Search input header */}
        <div className="p-4 border-b border-[#2A2F3C] flex items-center gap-3 bg-[#0b0f19]">
          <Search className="w-5 h-5 text-[#4CAF50] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="search-results-list"
            aria-autocomplete="list"
            aria-activedescendant={results.length > 0 ? `result-option-${activeIndex}` : undefined}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar retos, módulos, fases, exámenes, hábitos o recursos..."
            className="flex-1 bg-transparent text-sm text-[#ECEFF4] placeholder-[#9FA7B8] focus:outline-none font-mono"
          />

          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-xs font-mono text-[#9FA7B8] hover:text-[#ECEFF4] px-1.5 py-0.5 rounded cursor-pointer"
            >
              Borrar
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-[#9FA7B8] bg-[#141927] border border-[#2A2F3C] px-2 py-1 rounded">
            <span>ESC para cerrar</span>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar búsqueda"
            className="p-1 rounded-lg hover:bg-[#2A2F3C] text-[#9FA7B8] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div
          ref={resultsContainerRef}
          id="search-results-list"
          role="listbox"
          className="p-3 overflow-y-auto space-y-1.5 flex-1 max-h-[58vh]"
        >
          {query.trim() === "" ? (
            <div className="py-8 px-4 text-center text-[#9FA7B8] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#03A9F4]/10 border border-[#03A9F4]/20 mx-auto flex items-center justify-center text-[#03A9F4]">
                <Command className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-mono font-medium text-[#ECEFF4]">
                  Explora todo el ecosistema de Piscina 42
                </p>
                <p className="text-[11px] font-mono text-[#9FA7B8]">
                  {totalChallenges} retos · {totalModules} módulos · {totalPhases} fases · {totalExams} exámenes · {totalHabits} hábitos · {totalResources} recursos
                </p>
              </div>

              <div className="pt-2">
                <span className="text-[10px] font-mono uppercase text-[#9FA7B8] block mb-2 font-semibold">
                  Búsquedas rápidas:
                </span>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {["punteros", "ft_split", "norminette", "shell01", "malloc", "examen", "sueño", "cs50"].map(
                    (tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setQuery(tag);
                          inputRef.current?.focus();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#0b0f19] border border-[#2A2F3C] text-[11px] font-mono text-[#CAD2E2] hover:border-[#4CAF50] hover:text-[#4CAF50] transition-colors cursor-pointer"
                      >
                        #{tag}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-[#9FA7B8] space-y-2">
              <p className="text-sm font-semibold text-[#ECEFF4]">Sin resultados para "{query}"</p>
              <p className="text-xs max-w-sm mx-auto">
                Prueba buscando por palabras clave como "punteros", "malloc", "argv", "shell", "examen" o "hábitos".
              </p>
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <div
                  key={`${item.type}-${item.id}-${idx}`}
                  id={`result-option-${idx}`}
                  ref={isSelected ? activeItemRef : null}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => handleSelectItem(item)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-[#182035] border-[#4CAF50]/60 ring-1 ring-[#4CAF50]/30 shadow-md"
                      : "bg-[#0b0f19] hover:bg-[#181f30] border-[#2A2F3C]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-[#141927] border border-[#2A2F3C] shrink-0">
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold truncate ${
                            isSelected ? "text-[#4CAF50]" : "text-[#ECEFF4]"
                          }`}
                        >
                          {item.title}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded border shrink-0 ${getTypeBadgeClass(
                            item.type
                          )}`}
                        >
                          {item.badge}
                        </span>
                      </div>
                      {item.subtitle && (
                        <div className="text-[11px] font-mono text-[#9FA7B8] truncate mt-0.5">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected && (
                      <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-[#4CAF50] bg-[#4CAF50]/10 border border-[#4CAF50]/20 px-1.5 py-0.5 rounded">
                        <CornerDownLeft className="w-3 h-3" />
                        <span>Abrir</span>
                      </span>
                    )}
                    <ArrowRight
                      className={`w-4 h-4 transition-transform ${
                        isSelected ? "text-[#4CAF50] translate-x-0.5" : "text-[#9FA7B8]"
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Command Palette Footer */}
        <div className="p-3 bg-[#0b0f19] border-t border-[#2A2F3C] flex flex-wrap items-center justify-between text-[11px] font-mono text-[#9FA7B8] gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-[#141927] border border-[#2A2F3C] rounded text-[#ECEFF4]">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-[#141927] border border-[#2A2F3C] rounded text-[#ECEFF4]">↓</kbd>
              <span>Navegar</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-[#141927] border border-[#2A2F3C] rounded text-[#ECEFF4]">↵</kbd>
              <span>Seleccionar</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-[#CAD2E2]">
            <span>Command Palette</span>
            <span className="text-[#4CAF50]">●</span>
          </div>
        </div>
      </div>
    </div>
  );
};
