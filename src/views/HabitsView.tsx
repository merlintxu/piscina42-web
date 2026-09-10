import React, { useMemo } from "react";
import { Habit, UserProgress } from "../types";
import { HabitCard } from "../components/HabitCard";
import {
  Flame,
  Calendar,
  CheckCircle2,
  Zap,
  TrendingUp,
  Award,
  Layers,
  Sparkles,
  BarChart3,
  Clock
} from "lucide-react";

interface HabitsViewProps {
  habits: Habit[];
  progress: UserProgress;
  onToggleActive: (habitId: string) => void;
  onIncrementDay: (habitId: string) => void;
  onSaveNote?: (habitId: string, note: string) => void;
}

export const HabitsView: React.FC<HabitsViewProps> = ({
  habits,
  progress,
  onToggleActive,
  onIncrementDay,
  onSaveNote,
}) => {
  const activeCount = progress.activeHabits.length;
  const totalDaysAll = Object.values(progress.completedHabitDays).reduce((a, b) => a + b, 0);

  // Compute Weekly Summary Stats
  const weeklyStats = useMemo(() => {
    const today = new Date();
    const days: { dateStr: string; dayName: string; count: number; isToday: boolean }[] = [];

    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    let weeklyCheckins = 0;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = dayNames[d.getDay()];

      // Count check-ins across all habits for this date
      let count = 0;
      if (progress.habitHistory) {
        Object.values(progress.habitHistory).forEach(historyList => {
          if (historyList.includes(dateStr)) {
            count++;
          }
        });
      }

      weeklyCheckins += count;
      days.push({
        dateStr,
        dayName,
        count,
        isToday: i === 0,
      });
    }

    // Best overall streak
    let maxStreak = 0;
    if (progress.habitStreaks) {
      Object.values(progress.habitStreaks).forEach(s => {
        if (s > maxStreak) maxStreak = s;
      });
    }
    if (maxStreak === 0 && totalDaysAll > 0) {
      maxStreak = Math.max(...Object.values(progress.completedHabitDays), 0);
    }

    return {
      days,
      weeklyCheckins,
      maxStreak,
    };
  }, [progress, totalDaysAll]);

  return (
    <div className="space-y-8 pb-16">
      {/* Banner */}
      <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#FFC107]/15 text-[#FFC107] border border-[#FFC107]/30 rounded-lg flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                Disciplina Piscina 42
              </span>
              <span className="text-xs font-mono text-[#9FA7B8]">13 Hábitos de Alto Rendimiento</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#ECEFF4]">
              Hábitos Diarios para Sobrevivir y Triunfar en la Piscina
            </h1>

            <p className="text-sm text-[#9FA7B8] leading-relaxed">
              La Piscina es una maratón de 4 semanas. Mantener la constancia con rachas activas, registrar reflexiones diarias y evaluar a compañeros sistemáticamente marca la diferencia entre el éxito y el burnout.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="bg-[#0b0f19] border border-[#2A2F3C] p-3.5 rounded-xl flex flex-col justify-center">
              <div className="text-[11px] font-mono text-[#9FA7B8] flex items-center gap-1">
                <Layers className="w-3 h-3 text-[#03A9F4]" />
                Activos
              </div>
              <div className="text-xl font-bold font-mono text-[#ECEFF4] mt-0.5">
                {activeCount} <span className="text-xs text-[#9FA7B8]">/ {habits.length}</span>
              </div>
            </div>

            <div className="bg-[#0b0f19] border border-[#2A2F3C] p-3.5 rounded-xl flex flex-col justify-center">
              <div className="text-[11px] font-mono text-[#9FA7B8] flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#FF5722]" />
                Mejor Racha
              </div>
              <div className="text-xl font-bold font-mono text-[#FF5722] mt-0.5">
                {weeklyStats.maxStreak} <span className="text-xs text-[#9FA7B8]">días</span>
              </div>
            </div>

            <div className="bg-[#0b0f19] border border-[#2A2F3C] p-3.5 rounded-xl col-span-2 sm:col-span-1 flex flex-col justify-center">
              <div className="text-[11px] font-mono text-[#9FA7B8] flex items-center gap-1">
                <Flame className="w-3 h-3 text-[#FFC107]" />
                Total Check-ins
              </div>
              <div className="text-xl font-bold font-mono text-[#ECEFF4] mt-0.5">
                {totalDaysAll}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Summary Panel (Resumen Semanal) */}
      <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2A2F3C] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#03A9F4]/15 border border-[#03A9F4]/30 flex items-center justify-center text-[#03A9F4]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#ECEFF4]">Resumen Semanal de Actividad</h3>
              <p className="text-xs text-[#9FA7B8]">Rendimiento de los últimos 7 días y constancia de hábitos</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4CAF50]" />
              <span className="text-[#ECEFF4] font-bold">{weeklyStats.weeklyCheckins}</span>
              <span className="text-[#9FA7B8]">check-ins esta semana</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#03A9F4]" />
              <span className="text-[#ECEFF4] font-bold">{activeCount}</span>
              <span className="text-[#9FA7B8]">hábitos activos</span>
            </div>
          </div>
        </div>

        {/* 7-Day Visual Mini Bar / Activity Chart */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3 pt-2">
          {weeklyStats.days.map((d, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex flex-col items-center justify-between gap-2 transition-all ${
                d.isToday
                  ? "bg-[#03A9F4]/10 border-[#03A9F4]/40 shadow-sm shadow-[#03A9F4]/10"
                  : d.count > 0
                  ? "bg-[#0b0f19] border-[#4CAF50]/30"
                  : "bg-[#0b0f19] border-[#2A2F3C] opacity-70"
              }`}
            >
              <span className="text-[11px] font-mono text-[#9FA7B8] font-bold">
                {d.dayName}
              </span>

              {/* Progress Indicator pill / counter */}
              <div
                className={`w-full py-1.5 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                  d.count > 0
                    ? "bg-[#4CAF50]/20 text-[#4CAF50] border border-[#4CAF50]/30"
                    : "bg-[#141927] text-[#555E70] border border-[#2A2F3C]"
                }`}
              >
                {d.count > 0 ? `+${d.count}` : "0"}
              </div>

              <span className="text-[10px] font-mono text-[#9FA7B8]">
                {d.isToday ? "Hoy" : d.dateStr.slice(5)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {habits.map(habit => (
          <HabitCard
            key={habit.id}
            habit={habit}
            progress={progress}
            onToggleActive={onToggleActive}
            onIncrementDay={onIncrementDay}
            onSaveNote={onSaveNote}
          />
        ))}
      </div>
    </div>
  );
};
