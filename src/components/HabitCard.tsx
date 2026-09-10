import React, { useState } from "react";
import { Habit, UserProgress } from "../types";
import {
  Flame,
  Plus,
  Calendar,
  ArrowRight,
  FileEdit,
  Check,
  X,
  MessageSquare,
  Sparkles,
  Zap
} from "lucide-react";
import confetti from "canvas-confetti";
import { isHabitCheckedToday } from "../lib/storage";

interface HabitCardProps {
  habit: Habit;
  progress: UserProgress;
  onToggleActive: (habitId: string) => void;
  onIncrementDay: (habitId: string) => void;
  onSaveNote?: (habitId: string, note: string) => void;
  onOpenHabit?: (habitId: string) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  progress,
  onToggleActive,
  onIncrementDay,
  onSaveNote,
  onOpenHabit,
}) => {
  const isActive = progress.activeHabits.includes(habit.id);
  const completedDays = progress.completedHabitDays[habit.id] || 0;
  const streak = progress.habitStreaks?.[habit.id] ?? (completedDays > 0 ? completedDays : 0);
  const existingNote = progress.habitNotes?.[habit.id] || "";
  const isCheckedToday = isHabitCheckedToday(progress, habit.id);

  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState(existingNote);

  const handleCheckin = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCheckedToday) return;
    confetti({
      particleCount: 35,
      spread: 55,
      origin: { y: 0.8 },
      colors: ["#FFC107", "#4CAF50", "#03A9F4"],
    });
    onIncrementDay(habit.id);
  };

  const handleSaveNoteSubmit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSaveNote) {
      onSaveNote(habit.id, noteDraft.trim());
    }
    setIsEditingNote(false);
  };

  const handleCancelNote = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNoteDraft(existingNote);
    setIsEditingNote(false);
  };

  const handleCardClick = () => {
    if (onOpenHabit) {
      onOpenHabit(habit.id);
    }
  };

  return (
    <div
      id={`habit-card-${habit.id}`}
      onClick={handleCardClick}
      className={`group border rounded-2xl p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
        isActive
          ? "bg-[#141927] border-[#FFC107]/40 shadow-lg shadow-[#FFC107]/5 hover:border-[#FFC107]"
          : "bg-[#141927]/60 border-[#2A2F3C] opacity-80 hover:opacity-100 hover:border-[#2A2F3C]/80"
      }`}
    >
      {/* Top subtle accent bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 transition-all duration-300 ${
          isActive
            ? "bg-[#FFC107]/60"
            : "bg-gradient-to-r from-transparent via-[#2A2F3C] to-transparent"
        }`}
      />

      <div>
        {/* Top Header & Status Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleActive(habit.id);
            }}
            className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
              isActive
                ? "bg-[#FFC107]/15 border-[#FFC107]/30 text-[#FFC107]"
                : "bg-[#0b0f19] border-[#2A2F3C] text-[#9FA7B8] hover:text-[#ECEFF4]"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{isActive ? "Hábito Activo" : "Pausado"}</span>
          </button>

          {/* Streak indicator badge */}
          <div
            className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border flex items-center gap-1.5 ${
              streak > 0
                ? "bg-[#FF5722]/15 text-[#FF5722] border-[#FF5722]/30 shadow-sm"
                : "bg-[#0b0f19] text-[#9FA7B8] border-[#2A2F3C]"
            }`}
            title="Días consecutivos cumpliendo este hábito"
          >
            <Zap className={`w-3.5 h-3.5 ${streak > 0 ? "fill-[#FF5722]" : ""}`} />
            <span>Racha: {streak} {streak === 1 ? "día" : "días"}</span>
          </div>
        </div>

        {/* Título */}
        <h4 className="text-lg font-bold text-[#ECEFF4] group-hover:text-[#FFC107] transition-colors mb-1">
          {habit.title}
        </h4>

        {/* Subtítulo: Fase, Módulo/Categoría */}
        <div className="text-xs font-mono text-[#9FA7B8] mb-3 flex flex-wrap items-center gap-2">
          <span>Fases: <span className="text-[#03A9F4]">{habit.phases?.join(", ") || "Transversal"}</span></span>
          <span>•</span>
          <span>Frecuencia: <span className="text-[#FFC107]">{habit.frequency || "Diario"}</span></span>
        </div>

        {/* Descripción */}
        {habit.description && (
          <p className="text-xs text-[#9FA7B8] leading-relaxed mb-4 line-clamp-2">
            {habit.description}
          </p>
        )}

        {/* Chips de métricas */}
        {habit.metrics && habit.metrics.length > 0 && (
          <div className="space-y-1.5 mb-4">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#9FA7B8] block">
              Métricas objetivo:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {habit.metrics.map((metric, i) => (
                <span
                  key={i}
                  className="text-xs font-mono text-[#ECEFF4] bg-[#0b0f19] px-2.5 py-1 rounded-lg border border-[#2A2F3C] flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] shrink-0" />
                  <span className="truncate max-w-[220px]">{metric}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sección de Notas Cortas / Bitácora diaria */}
        <div className="mb-4 pt-2 border-t border-[#2A2F3C]/60" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-mono font-bold text-[#9FA7B8] flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-[#03A9F4]" />
              Nota personal de hoy:
            </span>
            {!isEditingNote && (
              <button
                onClick={() => {
                  setNoteDraft(existingNote);
                  setIsEditingNote(true);
                }}
                className="text-[11px] font-mono text-[#03A9F4] hover:text-[#38bdf8] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <FileEdit className="w-3 h-3" />
                <span>{existingNote ? "Editar" : "Añadir nota"}</span>
              </button>
            )}
          </div>

          {isEditingNote ? (
            <div className="space-y-2 bg-[#0b0f19] p-2.5 rounded-xl border border-[#2A2F3C]">
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                rows={2}
                placeholder="Ej. Hoy hice 3 evaluaciones y resolví las fugas con Valgrind sin problemas..."
                className="w-full bg-transparent text-xs text-[#ECEFF4] placeholder-[#555E70] focus:outline-none resize-none font-sans leading-relaxed"
                autoFocus
              />
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#2A2F3C]">
                <button
                  onClick={handleCancelNote}
                  className="px-2 py-1 text-[11px] font-mono text-[#9FA7B8] hover:text-[#ECEFF4] rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveNoteSubmit}
                  className="px-2.5 py-1 bg-[#4CAF50] hover:bg-[#43a047] text-[#0b0f19] text-[11px] font-bold font-mono rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                >
                  <Check className="w-3 h-3" />
                  <span>Guardar</span>
                </button>
              </div>
            </div>
          ) : existingNote ? (
            <div className="bg-[#0b0f19]/80 border border-[#2A2F3C] p-2.5 rounded-xl text-xs text-[#ECEFF4] italic font-sans relative group/note">
              "{existingNote}"
            </div>
          ) : (
            <div className="text-[11px] font-mono text-[#555E70] italic">
              Sin reflexiones guardadas todavía.
            </div>
          )}
        </div>
      </div>

      {/* Footer con Total Check-ins, botón check-in y link 'Ver detalle' */}
      <div className="pt-4 border-t border-[#2A2F3C] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-mono text-xs text-[#FFC107] bg-[#0b0f19] px-2.5 py-1 rounded-lg border border-[#2A2F3C]">
          <Flame className="w-3.5 h-3.5 fill-[#FFC107]" />
          <span>{completedDays} check-ins</span>
        </div>

        <div className="flex items-center gap-2">
          {isCheckedToday ? (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4CAF50]/15 border border-[#4CAF50]/40 text-[#4CAF50] text-xs font-bold font-mono rounded-xl shadow-sm select-none"
              title="Ya has registrado este hábito el día de hoy"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Hecho hoy</span>
            </div>
          ) : (
            <button
              onClick={handleCheckin}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#4CAF50]/15 hover:bg-[#4CAF50]/25 border border-[#4CAF50]/40 text-[#4CAF50] text-xs font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Check-in</span>
            </button>
          )}

          {/* Botón o link 'Ver detalle' */}
          <span className="text-xs font-semibold text-[#03A9F4] group-hover:translate-x-0.5 transition-all inline-flex items-center gap-1">
            <span>Ver detalle</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
