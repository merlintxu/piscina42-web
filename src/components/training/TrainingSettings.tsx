import React, { useState, useEffect } from "react";
import { Settings, X } from "lucide-react";
import { TrainingProfile } from "../../training/types";
import { DEFAULT_TARGET_DATE } from "../../training/config";

interface TrainingSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  profile: TrainingProfile;
  onSave: (updatedProfile: {
    targetDate: string;
    availableHoursPerWeek: number;
    pace: "relaxed" | "standard" | "intensive";
    dailyCommitmentMinutes: number;
  }) => void;
}

export const TrainingSettings: React.FC<TrainingSettingsProps> = ({
  isOpen,
  onClose,
  profile,
  onSave
}) => {
  const [targetDateInput, setTargetDateInput] = useState<string>(profile.targetDate || DEFAULT_TARGET_DATE);
  const [hoursPerWeekInput, setHoursPerWeekInput] = useState<number>(profile.availableHoursPerWeek || 15);
  const [paceInput, setPaceInput] = useState<"relaxed" | "standard" | "intensive">(profile.pace || "standard");
  const [dailyCommitmentInput, setDailyCommitmentInput] = useState<number>(profile.dailyCommitmentMinutes || 90);

  useEffect(() => {
    if (isOpen) {
      setTargetDateInput(profile.targetDate || DEFAULT_TARGET_DATE);
      setHoursPerWeekInput(profile.availableHoursPerWeek || 15);
      setPaceInput(profile.pace || "standard");
      setDailyCommitmentInput(profile.dailyCommitmentMinutes || 90);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validMinutes = Math.min(360, Math.max(30, Number(dailyCommitmentInput) || 90));
    onSave({
      targetDate: targetDateInput,
      availableHoursPerWeek: Number(hoursPerWeekInput),
      pace: paceInput,
      dailyCommitmentMinutes: validMinutes
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-[#2A2F3C] pb-3">
          <h2 className="text-base font-bold text-[#ECEFF4] flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#4CAF50]" />
            <span>Configurar Perfil de Entrenamiento</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#9FA7B8] hover:text-[#ECEFF4] hover:bg-[#1a2236]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#9FA7B8] block">
              Fecha Objetivo de la Piscina
            </label>
            <input
              type="date"
              value={targetDateInput}
              onChange={(e) => setTargetDateInput(e.target.value)}
              className="w-full bg-[#0b0f19] border border-[#2A2F3C] rounded-xl px-3 py-2 text-xs font-mono text-[#ECEFF4] focus:outline-none focus:border-[#4CAF50]"
              required
            />
            <span className="text-[10px] text-[#9FA7B8]">Por defecto: 2026-10-26</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#9FA7B8] block">
              Horas disponibles a la semana
            </label>
            <select
              value={hoursPerWeekInput}
              onChange={(e) => setHoursPerWeekInput(Number(e.target.value))}
              className="w-full bg-[#0b0f19] border border-[#2A2F3C] rounded-xl px-3 py-2 text-xs font-mono text-[#ECEFF4] focus:outline-none focus:border-[#4CAF50]"
            >
              <option value={10}>10 horas / semana (Ritmo relajado)</option>
              <option value={15}>15 horas / semana (Estándar recomendado)</option>
              <option value={25}>25 horas / semana (Intensivo)</option>
              <option value={40}>40 horas / semana (Full-time / Inmersivo)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#9FA7B8] block">
              Compromiso diario (minutos de misión)
            </label>
            <select
              value={dailyCommitmentInput}
              onChange={(e) => setDailyCommitmentInput(Number(e.target.value))}
              className="w-full bg-[#0b0f19] border border-[#2A2F3C] rounded-xl px-3 py-2 text-xs font-mono text-[#ECEFF4] focus:outline-none focus:border-[#4CAF50]"
            >
              <option value={45}>45 min / día (Mantenimiento rápido)</option>
              <option value={60}>60 min / día (1 hora base)</option>
              <option value={90}>90 min / día (1.5 horas - Recomendado 42)</option>
              <option value={120}>120 min / día (2 horas - Intensivo)</option>
              <option value={180}>180 min / día (3 horas - Inmersión total)</option>
              <option value={240}>240 min / día (4 horas - Modo Maratón)</option>
            </select>
            <span className="text-[10px] text-[#9FA7B8]">Calibra el volumen de la misión diaria sin cortar retos.</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#9FA7B8] block">
              Ritmo de progreso
            </label>
            <select
              value={paceInput}
              onChange={(e) => setPaceInput(e.target.value as any)}
              className="w-full bg-[#0b0f19] border border-[#2A2F3C] rounded-xl px-3 py-2 text-xs font-mono text-[#ECEFF4] focus:outline-none focus:border-[#4CAF50]"
            >
              <option value="relaxed">Relajado (priorizar afianzamiento)</option>
              <option value="standard">Estándar (equilibrio velocidad y profundidad)</option>
              <option value="intensive">Intensivo (alta exigencia diaria)</option>
            </select>
          </div>

          <div className="pt-3 border-t border-[#2A2F3C] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#0b0f19] hover:bg-[#1a2236] border border-[#2A2F3C] text-[#ECEFF4] text-xs font-mono rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#4CAF50] hover:bg-[#43a047] text-[#0b0f19] font-bold text-xs font-mono rounded-xl shadow-md cursor-pointer"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
