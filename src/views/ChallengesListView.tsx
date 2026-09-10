import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Challenge, Module, Phase, UserProgress } from "../types";
import { ChallengeCard } from "../components/ChallengeCard";
import { Search, Code2, CheckCircle2, ShieldCheck } from "lucide-react";

interface ChallengesListViewProps {
  challenges: Challenge[];
  modules: Module[];
  phases: Phase[];
  progress: UserProgress;
  onOpenChallenge?: (challenge: Challenge) => void;
  onToggleComplete: (challengeId: string) => void;
}

export const ChallengesListView: React.FC<ChallengesListViewProps> = ({
  challenges,
  modules,
  phases,
  progress,
  onOpenChallenge,
  onToggleComplete,
}) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [filterModule, setFilterModule] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "pending">("all");
  const [norminetteOnly, setNorminetteOnly] = useState<boolean>(false);

  const completedCount = progress.completedChallenges.length;
  const totalCount = challenges.length;

  const filtered = challenges.filter(c => {
    // Search query
    if (search) {
      const q = search.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchId = c.id.toLowerCase().includes(q);
      const matchTags = c.tags && c.tags.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchId && !matchTags) return false;
    }

    // Difficulty
    if (filterDifficulty !== "all" && c.difficulty !== filterDifficulty) return false;

    // Module
    if (filterModule !== "all" && c.module !== filterModule) return false;

    // Norminette focus
    if (norminetteOnly && !c.norminette_focus) return false;

    // Completion Status
    const isCompleted = progress.completedChallenges.includes(c.id);
    if (filterStatus === "completed" && !isCompleted) return false;
    if (filterStatus === "pending" && isCompleted) return false;

    return true;
  });

  const handleChallengeClick = (challenge: Challenge) => {
    if (onOpenChallenge) {
      onOpenChallenge(challenge);
    } else {
      navigate(`/challenge/${challenge.slug || challenge.id}`);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-[#4CAF50]" />
            <h1 className="text-2xl font-bold text-[#ECEFF4]">Catálogo de Retos de Código</h1>
          </div>
          <p className="text-xs text-[#9FA7B8] mt-1">
            55 retos de código en C y scripts de Shell diseñados bajo los estándares de evaluación de 42 Madrid.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#0b0f19] border border-[#2A2F3C] px-4 py-2 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />
          <div>
            <div className="text-[10px] font-mono text-[#9FA7B8]">Retos Completados</div>
            <div className="text-sm font-bold font-mono text-[#ECEFF4]">
              {completedCount} / {totalCount} ({Math.round((completedCount / Math.max(1, totalCount)) * 100)}%)
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search input */}
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 text-[#9FA7B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar reto por nombre, id (ft_swap, argv), o tag..."
              className="w-full bg-[#0b0f19] border border-[#2A2F3C] rounded-xl pl-9 pr-3 py-2 text-xs text-[#ECEFF4] focus:outline-none focus:border-[#4CAF50]"
            />
          </div>

          {/* Module Selector */}
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="w-full md:w-48 bg-[#0b0f19] border border-[#2A2F3C] rounded-xl px-3 py-2 text-xs text-[#ECEFF4] focus:outline-none focus:border-[#4CAF50] font-mono"
          >
            <option value="all">Todos los Módulos</option>
            {modules.map(m => (
              <option key={m.id} value={m.id}>{m.title.split(":")[0] || m.id}</option>
            ))}
          </select>

          {/* Difficulty Selector */}
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="w-full md:w-36 bg-[#0b0f19] border border-[#2A2F3C] rounded-xl px-3 py-2 text-xs text-[#ECEFF4] focus:outline-none focus:border-[#4CAF50] font-mono"
          >
            <option value="all">Dificultad (Todas)</option>
            <option value="easy">Fácil</option>
            <option value="medium">Media</option>
            <option value="hard">Difícil</option>
          </select>
        </div>

        {/* Status Pill Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#2A2F3C] text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[#9FA7B8] text-[11px] mr-1">Estado:</span>
            {[
              { id: "all", label: "Todos" },
              { id: "pending", label: "Pendientes" },
              { id: "completed", label: "Completados" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                  filterStatus === tab.id
                    ? "bg-[#4CAF50] text-[#0b0f19] font-bold"
                    : "bg-[#0b0f19] border border-[#2A2F3C] text-[#9FA7B8] hover:text-[#ECEFF4]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setNorminetteOnly(!norminetteOnly)}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 border ${
              norminetteOnly
                ? "bg-[#FFC107]/15 border-[#FFC107]/40 text-[#FFC107]"
                : "bg-[#0b0f19] border-[#2A2F3C] text-[#9FA7B8] hover:text-[#ECEFF4]"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Solo Norminette Focus</span>
          </button>
        </div>
      </div>

      {/* Challenge Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-[#141927] border border-[#2A2F3C] rounded-2xl text-[#9FA7B8]">
          <Code2 className="w-8 h-8 mx-auto text-[#03A9F4] mb-2" />
          <p className="font-bold text-sm text-[#ECEFF4]">No se encontraron retos con los filtros seleccionados.</p>
          <p className="text-xs mt-1">Prueba a resetear los filtros o buscar otra palabra clave.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(challenge => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onOpenChallenge={handleChallengeClick}
              progress={progress}
              onToggleComplete={onToggleComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
