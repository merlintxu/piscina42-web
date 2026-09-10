import React, { useState, useEffect } from "react";
import { ClipboardCheck, X, CheckCircle2 } from "lucide-react";
import { DailyMissionDebrief } from "../../training/types";

interface TrainingDebriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  existingDebrief?: DailyMissionDebrief;
  onSaveDebrief: (debrief: {
    difficultyRating: number;
    confidenceRating: number;
    hardestThing?: string;
  }) => void;
}

export const TrainingDebriefModal: React.FC<TrainingDebriefModalProps> = ({
  isOpen,
  onClose,
  date,
  existingDebrief,
  onSaveDebrief
}) => {
  const [debriefDifficulty, setDebriefDifficulty] = useState<number>(existingDebrief?.difficultyRating || 3);
  const [debriefConfidence, setDebriefConfidence] = useState<number>(existingDebrief?.confidenceRating || 3);
  const [debriefHardestThing, setDebriefHardestThing] = useState<string>(existingDebrief?.hardestThing || "");

  useEffect(() => {
    if (existingDebrief) {
      setDebriefDifficulty(existingDebrief.difficultyRating);
      setDebriefConfidence(existingDebrief.confidenceRating);
      setDebriefHardestThing(existingDebrief.hardestThing || "");
    }
  }, [existingDebrief, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveDebrief({
      difficultyRating: debriefDifficulty,
      confidenceRating: debriefConfidence,
      hardestThing: debriefHardestThing
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#2A2F3C] pb-3">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-[#8BC34A]" />
            <div>
              <h2 className="text-base font-bold text-[#ECEFF4]">
                Debrief Técnico de Sesión
              </h2>
              <p className="text-[10px] font-mono text-[#9FA7B8]">
                {date} · Calibración determinista (sin IA)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#9FA7B8] hover:text-[#ECEFF4] hover:bg-[#1a2236] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-[#0b0f19] border border-[#2A2F3C] rounded-xl text-xs text-[#CAD2E2] leading-relaxed">
          <p>
            <span className="text-[#8BC34A] font-bold font-mono">Pedagogía 42: </span>
            El debrief registra tu autoevaluación reflexiva y nivel de dificultad percibido. Permite calibrar futuras sesiones de entrenamiento adaptativo.
          </p>
          <p className="text-[10px] text-[#9FA7B8] mt-1 italic">
            * Nota: El debrief no aumenta directamente el mastery técnico.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Difficulty Rating 1-5 */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-[#ECEFF4] flex items-center justify-between">
              <span>Dificultad Percibida en la Sesión</span>
              <span className="text-[#8BC34A] font-bold">{debriefDifficulty} / 5</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { val: 1, label: "Muy fácil" },
                { val: 2, label: "Asequible" },
                { val: 3, label: "Adecuada" },
                { val: 4, label: "Exigente" },
                { val: 5, label: "Extrema" }
              ].map(({ val, label }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setDebriefDifficulty(val)}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    debriefDifficulty === val
                      ? "bg-[#8BC34A]/20 border-[#8BC34A] text-[#8BC34A] font-bold shadow-sm"
                      : "bg-[#0b0f19] border-[#2A2F3C] text-[#9FA7B8] hover:border-[#8BC34A]/40"
                  }`}
                >
                  <div className="text-sm font-mono font-bold">{val}</div>
                  <div className="text-[9px] truncate">{label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Confidence Rating 1-5 */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-[#ECEFF4] flex items-center justify-between">
              <span>Nivel de Confianza Técnico Alcanzado</span>
              <span className="text-[#03A9F4] font-bold">{debriefConfidence} / 5</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { val: 1, label: "Inseguro" },
                { val: 2, label: "Con dudas" },
                { val: 3, label: "Asimilado" },
                { val: 4, label: "Sólido" },
                { val: 5, label: "Dominio" }
              ].map(({ val, label }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setDebriefConfidence(val)}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    debriefConfidence === val
                      ? "bg-[#03A9F4]/20 border-[#03A9F4] text-[#03A9F4] font-bold shadow-sm"
                      : "bg-[#0b0f19] border-[#2A2F3C] text-[#9FA7B8] hover:border-[#03A9F4]/40"
                  }`}
                >
                  <div className="text-sm font-mono font-bold">{val}</div>
                  <div className="text-[9px] truncate">{label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Hardest Thing Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#ECEFF4] block">
              Obstáculo más complejo o lección aprendida (opcional)
            </label>
            <textarea
              rows={3}
              value={debriefHardestThing}
              onChange={(e) => setDebriefHardestThing(e.target.value)}
              placeholder="Ej: Gestionar el caso extremo de INT_MIN en ft_putnbr, o evitar fugas de memoria con free() en caso de fallo de malloc..."
              className="w-full bg-[#0b0f19] border border-[#2A2F3C] rounded-xl p-3 text-xs text-[#ECEFF4] placeholder-[#5A6275] focus:outline-none focus:border-[#8BC34A] resize-none"
            />
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
              className="px-4 py-2 bg-[#8BC34A] hover:bg-[#7cb342] text-[#0b0f19] font-bold text-xs font-mono rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Guardar Debrief</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
