import React from "react";
import { useNavigate } from "react-router-dom";
import { Challenge, UserProgress } from "../types";
import { CheckCircle2, Circle, Clock, ShieldCheck, ArrowRight, Tag } from "lucide-react";
import confetti from "canvas-confetti";

interface ChallengeCardProps {
  challenge: Challenge;
  onOpenChallenge?: (challenge: Challenge) => void;
  progress: UserProgress;
  onToggleComplete: (challengeId: string) => void;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onOpenChallenge,
  progress,
  onToggleComplete,
}) => {
  const navigate = useNavigate();
  const isDone = progress.completedChallenges.includes(challenge.id);

  const diffBadge = {
    easy: {
      label: "Fácil",
      color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    },
    medium: {
      label: "Media",
      color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    },
    hard: {
      label: "Difícil",
      color: "text-rose-400 border-rose-500/30 bg-rose-500/10",
    },
  }[challenge.difficulty || "easy"] || {
    label: "Fácil",
    color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  };

  const handleCheckbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDone) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#4CAF50", "#03A9F4", "#FFC107"],
      });
    }
    onToggleComplete(challenge.id);
  };

  const handleClick = () => {
    if (onOpenChallenge) {
      onOpenChallenge(challenge);
    } else {
      navigate(`/challenge/${challenge.slug || challenge.id}`);
    }
  };

  return (
    <div
      id={`challenge-card-${challenge.id}`}
      onClick={handleClick}
      className={`group border rounded-2xl p-5 sm:p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
        isDone
          ? "bg-[#141927]/60 border-[#4CAF50]/40 hover:border-[#4CAF50]"
          : "bg-[#141927] border-[#2A2F3C] hover:border-[#03A9F4]/60 hover:bg-[#181f30] shadow-md"
      }`}
    >
      {/* Top subtle accent bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 transition-all duration-300 ${
          isDone
            ? "bg-[#4CAF50]/60"
            : "bg-gradient-to-r from-transparent via-[#03A9F4]/30 to-transparent group-hover:via-[#03A9F4]"
        }`}
      />

      <div>
        {/* Top status bar: Checkbox & Difficulty & Time chips */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCheckbox}
              title={isDone ? "Marcar como pendiente" : "Marcar como completado"}
              className="p-1 rounded-lg hover:bg-[#2A2F3C] transition-colors"
            >
              {isDone ? (
                <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />
              ) : (
                <Circle className="w-5 h-5 text-[#9FA7B8] hover:text-[#ECEFF4]" />
              )}
            </button>
            <span
              className={`px-2.5 py-0.5 text-xs font-mono font-bold rounded-lg border ${diffBadge.color}`}
            >
              {diffBadge.label}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#9FA7B8]">
            {challenge.estimated_time_minutes && (
              <span className="flex items-center gap-1 bg-[#0b0f19] px-2 py-0.5 rounded-lg border border-[#2A2F3C]">
                <Clock className="w-3 h-3 text-[#03A9F4]" />
                {challenge.estimated_time_minutes}m
              </span>
            )}
            {challenge.norminette_focus && (
              <span
                className="flex items-center gap-1 text-[#FFC107] bg-[#FFC107]/10 px-2 py-0.5 rounded-lg border border-[#FFC107]/20 text-[11px] font-bold"
                title="Norminette Focus"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Norm
              </span>
            )}
          </div>
        </div>

        {/* Título */}
        <h4
          className={`text-lg font-bold transition-colors mb-1 ${
            isDone
              ? "text-[#9FA7B8] line-through decoration-[#4CAF50]/60"
              : "text-[#ECEFF4] group-hover:text-[#4CAF50]"
          }`}
        >
          {challenge.title}
        </h4>

        {/* Subtítulo: Fase, Módulo, Dificultad */}
        <div className="text-xs font-mono text-[#9FA7B8] mb-3 flex flex-wrap items-center gap-2">
          <span>Módulo: <span className="text-[#03A9F4]">{challenge.module}</span></span>
          <span>•</span>
          <span>Dificultad: <span className="text-[#ECEFF4]">{diffBadge.label}</span></span>
          <span>•</span>
          <span>ID: {challenge.id}</span>
        </div>

        {/* Chips de tags */}
        {challenge.tags && challenge.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {challenge.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-[11px] font-mono bg-[#0b0f19] border border-[#2A2F3C] text-[#ECEFF4] rounded-md truncate max-w-[140px]"
              >
                #{tag}
              </span>
            ))}
            {challenge.tags.length > 3 && (
              <span className="px-1.5 py-0.5 text-[10px] font-mono bg-[#0b0f19] text-[#9FA7B8] rounded border border-[#2A2F3C]">
                +{challenge.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer con identificador y botón 'Ver detalle' */}
      <div className="pt-3.5 border-t border-[#2A2F3C] flex items-center justify-between text-xs text-[#9FA7B8] gap-2">
        <span className="font-mono text-[11px] bg-[#0b0f19] px-2 py-0.5 rounded border border-[#2A2F3C]">
          {challenge.id}
        </span>

        {/* Botón o link 'Ver detalle' */}
        <span className="text-[#03A9F4] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-semibold">
          <span>Ver detalle</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};

