import { UserProgress } from "../types";

const STORAGE_KEY = "piscina42_progress_v1";

const DEFAULT_PROGRESS: UserProgress = {
  completedChallenges: [],
  activeHabits: [
    "habit-norminette-daily",
    "habit-peer-daily",
    "habit-terminal-daily",
    "habit-sleep-7h"
  ],
  completedHabitDays: {},
  habitStreaks: {},
  habitHistory: {},
  habitNotes: {},
  bookmarkedItems: [],
  completedExams: {},
  notes: {}
};

export function loadUserProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    return {
      completedChallenges: parsed.completedChallenges || [],
      activeHabits: parsed.activeHabits || DEFAULT_PROGRESS.activeHabits,
      completedHabitDays: parsed.completedHabitDays || {},
      habitStreaks: parsed.habitStreaks || {},
      habitHistory: parsed.habitHistory || {},
      habitNotes: parsed.habitNotes || {},
      bookmarkedItems: parsed.bookmarkedItems || [],
      completedExams: parsed.completedExams || {},
      notes: parsed.notes || {}
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveUserProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.error("Failed to save progress to localStorage", err);
  }
}

export function toggleChallengeCompletion(progress: UserProgress, challengeId: string): UserProgress {
  const isCompleted = progress.completedChallenges.includes(challengeId);
  const updated = {
    ...progress,
    completedChallenges: isCompleted
      ? progress.completedChallenges.filter(id => id !== challengeId)
      : [...progress.completedChallenges, challengeId]
  };
  saveUserProgress(updated);
  return updated;
}

export function toggleBookmark(progress: UserProgress, itemId: string): UserProgress {
  const isBookmarked = progress.bookmarkedItems.includes(itemId);
  const updated = {
    ...progress,
    bookmarkedItems: isBookmarked
      ? progress.bookmarkedItems.filter(id => id !== itemId)
      : [...progress.bookmarkedItems, itemId]
  };
  saveUserProgress(updated);
  return updated;
}

export function toggleHabitActive(progress: UserProgress, habitId: string): UserProgress {
  const isActive = progress.activeHabits.includes(habitId);
  const updated = {
    ...progress,
    activeHabits: isActive
      ? progress.activeHabits.filter(id => id !== habitId)
      : [...progress.activeHabits, habitId]
  };
  saveUserProgress(updated);
  return updated;
}

export function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isHabitCheckedToday(progress: UserProgress, habitId: string): boolean {
  const today = getTodayDateStr();
  const history = progress.habitHistory?.[habitId] || [];
  return history.includes(today);
}

export function calculateHabitStreak(dates: string[]): number {
  if (!dates || dates.length === 0) return 0;
  
  const uniqueDates = Array.from(new Set(dates)).sort().reverse();
  if (uniqueDates.length === 0) return 0;

  const todayStr = getTodayDateStr();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

  const mostRecent = uniqueDates[0];
  // Streak is only ongoing if the most recent check-in is today or yesterday
  if (mostRecent !== todayStr && mostRecent !== yesterdayStr) {
    return 0;
  }

  let streak = 1;
  let currentDate = new Date(mostRecent + "T00:00:00");

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    const expectedStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}-${String(prevDate.getDate()).padStart(2, "0")}`;

    if (uniqueDates[i] === expectedStr) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  return streak;
}

export function incrementHabitDay(progress: UserProgress, habitId: string): UserProgress {
  const today = getTodayDateStr();
  const history = progress.habitHistory?.[habitId] || [];
  
  // If already checked in today, do not increment or add duplicate date
  if (history.includes(today)) {
    return progress;
  }

  const updatedHistory = [...history, today];
  const uniqueDates = Array.from(new Set(updatedHistory));
  const newStreak = calculateHabitStreak(uniqueDates);
  const currentCount = progress.completedHabitDays[habitId] || 0;
  const newCount = Math.max(currentCount + 1, uniqueDates.length);

  const updated = {
    ...progress,
    completedHabitDays: {
      ...progress.completedHabitDays,
      [habitId]: newCount
    },
    habitStreaks: {
      ...(progress.habitStreaks || {}),
      [habitId]: newStreak
    },
    habitHistory: {
      ...(progress.habitHistory || {}),
      [habitId]: updatedHistory
    }
  };
  saveUserProgress(updated);
  return updated;
}

export function saveHabitNote(progress: UserProgress, habitId: string, note: string): UserProgress {
  const updated = {
    ...progress,
    habitNotes: {
      ...(progress.habitNotes || {}),
      [habitId]: note
    }
  };
  saveUserProgress(updated);
  return updated;
}

export function saveExamResult(progress: UserProgress, examId: string, score: number): UserProgress {
  const updated = {
    ...progress,
    completedExams: {
      ...progress.completedExams,
      [examId]: {
        score,
        completedAt: new Date().toISOString()
      }
    }
  };
  saveUserProgress(updated);
  return updated;
}
