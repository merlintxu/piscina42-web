export type Phase = {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  order?: number;
  modules: string[];
  challenges: string[];
  resources: string[];
  habits: string[];
  body: string;
};

export type Module = {
  id: string;
  slug: string;
  title: string;
  phase: string;
  order?: number;
  level: "basic" | "intermediate" | "advanced";
  concepts: string[];
  cognitive_difficulties: string[];
  challenges: string[];
  resources: string[];
  body: string;
};

export type Challenge = {
  id: string;
  slug: string;
  title: string;
  module: string;
  phase?: string;
  difficulty: "easy" | "medium" | "hard";
  estimated_time_minutes?: number;
  tags: string[];
  norminette_focus?: boolean;
  body: string;
};

export type Resource = {
  id: string;
  title: string;
  type: "course" | "article" | "repository" | "tool" | "book";
  url: string;
  description?: string;
  modules: string[];
  phases: string[];
  language?: string;
  cost?: "free" | "paid" | "mixed";
};

export type Habit = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  phases: string[];
  frequency?: string;
  metrics: string[];
};

export type ExamSimulation = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  phase?: string;
  duration_minutes: number;
  levels: string[];
  rules: string[];
};

export type ContentJSON = {
  phases: Phase[];
  modules: Module[];
  challenges: Challenge[];
  resources: Resource[];
  habits: Habit[];
  exams: ExamSimulation[];
};

export type GraphNode = {
  id: string;
  type: "phase" | "module" | "challenge" | "resource" | "habit" | "exam";
  label: string;
  slug?: string;
};

export type GraphEdge = {
  source: string;
  target: string;
  rel: string;
};

export type GraphData = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export type UserProgress = {
  completedChallenges: string[];
  activeHabits: string[];
  completedHabitDays: Record<string, number>; // habitId -> count of days
  habitStreaks?: Record<string, number>; // habitId -> current consecutive day streak
  habitHistory?: Record<string, string[]>; // habitId -> array of ISO date strings (YYYY-MM-DD)
  habitNotes?: Record<string, string>; // habitId -> user reflection note
  bookmarkedItems: string[];
  completedExams: Record<string, { score: number; completedAt: string }>;
  notes: Record<string, string>; // itemId -> user note
};
