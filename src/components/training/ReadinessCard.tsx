import React from "react";
import { Award } from "lucide-react";
import { ReadinessBreakdown } from "../../training/types";
import { TrainingConsistencyCard } from "./TrainingConsistencyCard";

interface ReadinessCardProps {
  readiness: ReadinessBreakdown;
  streakDays?: number;
  totalMissionsCompleted?: number;
}

export const ReadinessCard: React.FC<ReadinessCardProps> = ({
  readiness,
  streakDays,
  totalMissionsCompleted
}) => {
  return (
    <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between border-b border-[#2A2F3C] pb-3">
        <h2 className="text-sm font-bold text-[#ECEFF4] flex items-center gap-2">
          <Award className="w-4 h-4 text-[#4CAF50]" />
          <span>Readiness Score (Estimación de entrenamiento)</span>
        </h2>
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
          readiness.paceStatus === "ahead"
            ? "bg-[#4CAF50]/15 text-[#4CAF50] border-[#4CAF50]/30"
            : readiness.paceStatus === "on_track"
            ? "bg-[#03A9F4]/15 text-[#03A9F4] border-[#03A9F4]/30"
            : "bg-[#FF5722]/15 text-[#FF5722] border-[#FF5722]/30"
        }`}>
          {readiness.paceStatus === "ahead" ? "Avanzado" : readiness.paceStatus === "on_track" ? "En Ruta" : "Atención"}
        </span>
      </div>

      {/* Big Circular Metric */}
      <div className="flex items-center justify-center py-2">
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-[#0b0f19]"
              strokeWidth="3"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-[#4CAF50] transition-all duration-1000 ease-out"
              strokeDasharray={`${readiness.overallScore}, 100`}
              strokeWidth="3"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-extrabold font-mono text-[#ECEFF4]">
              {readiness.overallScore}%
            </span>
            <span className="text-[9px] font-mono text-[#9FA7B8] uppercase tracking-wider">
              Técnico
            </span>
          </div>
        </div>
      </div>

      {/* Sub-metrics bars */}
      <div className="space-y-3 pt-2 text-xs font-mono">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[#9FA7B8]">C Core & Punteros (35%)</span>
            <span className="text-[#ECEFF4] font-bold">{readiness.cMastery}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#0b0f19] rounded-full overflow-hidden border border-[#2A2F3C]">
            <div className="h-full bg-[#4CAF50] rounded-full" style={{ width: `${readiness.cMastery}%` }} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[#9FA7B8]">Terminal & Git (20%)</span>
            <span className="text-[#ECEFF4] font-bold">{readiness.unixAndGit}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#0b0f19] rounded-full overflow-hidden border border-[#2A2F3C]">
            <div className="h-full bg-[#03A9F4] rounded-full" style={{ width: `${readiness.unixAndGit}%` }} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[#9FA7B8]">Rigor & Norminette (25%)</span>
            <span className="text-[#ECEFF4] font-bold">{readiness.rigorAndNorminette}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#0b0f19] rounded-full overflow-hidden border border-[#2A2F3C]">
            <div className="h-full bg-[#E91E63] rounded-full" style={{ width: `${readiness.rigorAndNorminette}%` }} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[#9FA7B8]">Examshell Simulator (20%)</span>
            <span className="text-[#ECEFF4] font-bold">{readiness.examshellReadiness}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#0b0f19] rounded-full overflow-hidden border border-[#2A2F3C]">
            <div className="h-full bg-[#FFC107] rounded-full" style={{ width: `${readiness.examshellReadiness}%` }} />
          </div>
        </div>

        <TrainingConsistencyCard
          consistencyScore={readiness.trainingConsistency}
          streakDays={streakDays}
          totalMissionsCompleted={totalMissionsCompleted}
        />
      </div>
    </div>
  );
};
