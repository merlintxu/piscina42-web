import React, { useState } from "react";
import { Module, Challenge, UserProgress } from "../types";
import { ModuleCard } from "../components/ModuleCard";
import { useNavigate } from "react-router-dom";
import { Terminal, Search, Layers, CheckCircle2 } from "lucide-react";

interface ModulesListViewProps {
  modules: Module[];
  challenges: Challenge[];
  progress: UserProgress;
}

export const ModulesListView: React.FC<ModulesListViewProps> = ({
  modules,
  challenges,
  progress,
}) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");

  const filteredModules = modules.filter(m => {
    if (search) {
      const q = search.toLowerCase();
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchId = m.id.toLowerCase().includes(q);
      const matchConcepts = m.concepts && m.concepts.some(c => c.toLowerCase().includes(q));
      if (!matchTitle && !matchId && !matchConcepts) return false;
    }
    if (filterLevel !== "all" && m.level !== filterLevel) return false;
    return true;
  });

  const totalChallenges = challenges.length;
  const completedChallenges = progress.completedChallenges.length;

  return (
    <div className="space-y-6 pb-16">
      {/* Banner */}
      <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#03A9F4]" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#ECEFF4]">
              Módulos de C y Shell
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#9FA7B8] mt-1 max-w-2xl">
            9 módulos oficiales de aprendizaje progresivo, desde los fundamentos de la terminal Unix y Git (Shell00–01) hasta punteros, estructuras dinámicas y algoritmos avanzados (C00–C08).
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#0b0f19] border border-[#2A2F3C] px-4 py-2.5 rounded-xl shrink-0">
          <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />
          <div>
            <div className="text-[10px] font-mono text-[#9FA7B8]">Progreso General</div>
            <div className="text-sm font-bold font-mono text-[#ECEFF4]">
              {completedChallenges} / {totalChallenges} retos ({Math.round((completedChallenges / Math.max(1, totalChallenges)) * 100)}%)
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-[#9FA7B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar módulo por nombre, concepto (punteros, malloc, argc) o ID..."
            className="w-full bg-[#0b0f19] border border-[#2A2F3C] rounded-xl pl-9 pr-3 py-2 text-xs text-[#ECEFF4] focus:outline-none focus:border-[#03A9F4]"
          />
        </div>

        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="w-full sm:w-48 bg-[#0b0f19] border border-[#2A2F3C] rounded-xl px-3 py-2 text-xs text-[#ECEFF4] focus:outline-none focus:border-[#03A9F4] font-mono"
        >
          <option value="all">Todos los niveles</option>
          <option value="basic">Nivel Básico</option>
          <option value="intermediate">Nivel Intermedio</option>
          <option value="advanced">Nivel Avanzado</option>
        </select>
      </div>

      {/* Modules Grid */}
      {filteredModules.length === 0 ? (
        <div className="p-12 text-center bg-[#141927] border border-[#2A2F3C] rounded-2xl text-[#9FA7B8]">
          <Layers className="w-8 h-8 mx-auto text-[#03A9F4] mb-2" />
          <p className="font-bold text-sm text-[#ECEFF4]">No se encontraron módulos con el criterio de búsqueda.</p>
          <p className="text-xs mt-1">Prueba a buscar por conceptos generales como "punteros" o "cadenas".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredModules.map((mod) => (
            <ModuleCard
              key={mod.id}
              module={mod}
              challenges={challenges}
              onOpenModule={(modId) => {
                const targetMod = modules.find(m => m.id === modId);
                const slug = targetMod?.slug || modId;
                navigate(`/module/${slug}`);
              }}
              progress={progress}
            />
          ))}
        </div>
      )}
    </div>
  );
};
