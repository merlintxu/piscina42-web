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

export function incrementHabitDay(progress: UserProgress, habitId: string): UserProgress {
  const currentCount = progress.completedHabitDays[habitId] || 0;
  const history = progress.habitHistory?.[habitId] || [];
  const today = new Date().toISOString().split("T")[0];

  const updatedHistory = history.includes(today) ? history : [...history, today];

  // Calculate streak based on dates
  // Sort dates descending
  const sortedDates = [...updatedHistory].sort().reverse();
  let currentStreak = 0;

  if (sortedDates.length > 0) {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    let checkDate = new Date(todayDate);
    const mostRecent = new Date(sortedDates[0]);
    mostRecent.setHours(0, 0, 0, 0);

    // If most recent is today or yesterday, start counting streak
    const diffDays = Math.round((todayDate.getTime() - mostRecent.getTime()) / (1000 * 3600 * 24));
    if (diffDays <= 1) {
      checkDate = mostRecent;
      currentStreak = 1;

      for (let i = 1; i < sortedDates.length; i++) {
        const prevTarget = new Date(checkDate);
        prevTarget.setDate(prevTarget.getDate() - 1);
        const prevTargetStr = prevTarget.toISOString().split("T")[0];

        if (sortedDates[i] === prevTargetStr) {
          currentStreak++;
          checkDate = prevTarget;
        } else {
          break;
        }
      }
    } else {
      currentStreak = 1;
    }
  } else {
    currentStreak = (progress.habitStreaks?.[habitId] || 0) + 1;
  }

  const updated = {
    ...progress,
    completedHabitDays: {
      ...progress.completedHabitDays,
      [habitId]: currentCount + 1
    },
    habitStreaks: {
      ...(progress.habitStreaks || {}),
      [habitId]: Math.max(currentStreak, (progress.habitStreaks?.[habitId] || 0) + 1)
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
