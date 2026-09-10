import React from "react";
import { Flame } from "lucide-react";

interface TrainingConsistencyCardProps {
  consistencyScore: number;
  streakDays?: number;
  totalMissionsCompleted?: number;
}

export const TrainingConsistencyCard: React.FC<TrainingConsistencyCardProps> = ({
  consistencyScore,
  streakDays,
  totalMissionsCompleted
}) => {
  return (
    <div className="pt-2 border-t border-[#2A2F3C]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[#CAD2E2] flex items-center gap-1">
          <Flame className="w-3 h-3 text-[#FF9800]" />
          Consistencia de Entrenamiento
        </span>
        <span className="text-[#FF9800] font-bold">{consistencyScore}%</span>
      </div>
      <div className="w-full h-1.5 bg-[#0b0f19] rounded-full overflow-hidden border border-[#2A2F3C]">
        <div className="h-full bg-[#FF9800] rounded-full" style={{ width: `${consistencyScore}%` }} />
      </div>
      <span className="text-[10px] text-[#9FA7B8] block mt-1">
        Rachas ({streakDays !== undefined ? `${streakDays}d` : "activas"}), misiones ({totalMissionsCompleted !== undefined ? totalMissionsCompleted : "registradas"}) y hábitos completados.
      </span>
    </div>
  );
};
