import { ContentJSON, Phase, Module, Challenge, Resource, Habit, ExamSimulation } from "../types";

export type SearchResultType = "phase" | "module" | "challenge" | "resource" | "habit" | "exam";

export interface SearchResultItem {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  slug?: string;
  url?: string;
  badge: string;
  score: number;
  data: Phase | Module | Challenge | Resource | Habit | ExamSimulation;
}

/**
 * Normalizes text removing diacritics/accents and converting to lowercase
 */
export function normalizeSearchText(text: string | undefined | null): string {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Calculates a match score for a given item against the search query
 */
function scoreItem(
  q: string,
  id: string,
  title: string,
  slug?: string,
  tagsOrConcepts: string[] = [],
  secondaryTexts: (string | undefined | null)[] = []
): number {
  const normId = normalizeSearchText(id);
  const normTitle = normalizeSearchText(title);
  const normSlug = normalizeSearchText(slug);

  // 1. Exact match on ID or Title (Highest priority)
  if (normId === q || normTitle === q) {
    return 1000;
  }

  // 2. Exact match on Slug
  if (normSlug && normSlug === q) {
    return 950;
  }

  // 3. ID or Title starts with query
  if (normId.startsWith(q) || normTitle.startsWith(q)) {
    return 800 + Math.max(0, 50 - normTitle.length);
  }

  // 4. Slug starts with query
  if (normSlug && normSlug.startsWith(q)) {
    return 750;
  }

  // 5. Title or ID contains query as substring / word
  if (normTitle.includes(q) || normId.includes(q)) {
    const isWordStart = normTitle.includes(` ${q}`) || normTitle.includes(`_${q}`) || normTitle.includes(`-${q}`);
    return 500 + (isWordStart ? 50 : 0) + Math.max(0, 30 - normTitle.length);
  }

  // 6. Tags or Concepts match
  for (const tc of tagsOrConcepts) {
    const normTc = normalizeSearchText(tc);
    if (normTc === q) return 400;
    if (normTc.startsWith(q)) return 350;
    if (normTc.includes(q)) return 300;
  }

  // 7. Secondary fields (summary, description, rules, metrics, frequency)
  for (const sec of secondaryTexts) {
    if (!sec) continue;
    const normSec = normalizeSearchText(sec);
    if (normSec.includes(q)) {
      return 150;
    }
  }

  return 0;
}

/**
 * Searches across all 6 content types in ContentJSON
 */
export function searchContent(content: ContentJSON, rawQuery: string, limit = 20): SearchResultItem[] {
  const q = normalizeSearchText(rawQuery);
  if (!q) return [];

  const results: SearchResultItem[] = [];

  // 1. Challenges
  content.challenges.forEach((ch) => {
    const score = scoreItem(
      q,
      ch.id,
      ch.title,
      ch.slug,
      ch.tags || [],
      [ch.module, ch.difficulty, ch.body]
    );
    if (score > 0) {
      results.push({
        id: ch.id,
        type: "challenge",
        title: ch.title,
        subtitle: `Módulo: ${ch.module} · ${ch.difficulty || "básico"}`,
        slug: ch.slug,
        badge: "Reto",
        score,
        data: ch,
      });
    }
  });

  // 2. Modules
  content.modules.forEach((mod) => {
    const score = scoreItem(
      q,
      mod.id,
      mod.title,
      mod.slug,
      mod.concepts || [],
      [mod.phase, mod.level, mod.body, ...(mod.cognitive_difficulties || [])]
    );
    if (score > 0) {
      results.push({
        id: mod.id,
        type: "module",
        title: mod.title,
        subtitle: `Nivel: ${mod.level} · ${mod.challenges?.length || 0} retos`,
        slug: mod.slug,
        badge: "Módulo",
        score,
        data: mod,
      });
    }
  });

  // 3. Phases
  content.phases.forEach((phase) => {
    const score = scoreItem(
      q,
      phase.id,
      phase.title,
      phase.slug,
      [],
      [phase.summary, phase.body]
    );
    if (score > 0) {
      results.push({
        id: phase.id,
        type: "phase",
        title: phase.title,
        subtitle: phase.summary || "Fase de la ruta de preparación",
        slug: phase.slug,
        badge: "Fase",
        score,
        data: phase,
      });
    }
  });

  // 4. Resources
  content.resources.forEach((res) => {
    const score = scoreItem(
      q,
      res.id,
      res.title,
      undefined,
      [res.type, res.language || "", res.cost || ""],
      [res.description, res.url, ...(res.modules || []), ...(res.phases || [])]
    );
    if (score > 0) {
      results.push({
        id: res.id,
        type: "resource",
        title: res.title,
        subtitle: `${res.type.toUpperCase()} · ${res.description || res.url}`,
        url: res.url,
        badge: "Recurso",
        score,
        data: res,
      });
    }
  });

  // 5. Habits
  content.habits.forEach((habit) => {
    const score = scoreItem(
      q,
      habit.id,
      habit.title,
      habit.slug,
      habit.metrics || [],
      [habit.description, habit.frequency, ...(habit.phases || [])]
    );
    if (score > 0) {
      results.push({
        id: habit.id,
        type: "habit",
        title: habit.title,
        subtitle: habit.frequency ? `Frecuencia: ${habit.frequency}` : habit.description,
        slug: habit.slug,
        badge: "Hábito",
        score,
        data: habit,
      });
    }
  });

  // 6. Exams
  content.exams.forEach((exam) => {
    const score = scoreItem(
      q,
      exam.id,
      exam.title,
      exam.slug,
      [],
      [exam.description, ...(exam.rules || []), `${exam.duration_minutes} min`]
    );
    if (score > 0) {
      results.push({
        id: exam.id,
        type: "exam",
        title: exam.title,
        subtitle: `${exam.duration_minutes} minutos · ${exam.levels?.length || 0} niveles`,
        slug: exam.slug,
        badge: "Examen",
        score,
        data: exam,
      });
    }
  });

  // Sort descending by score, tiebreak alphabetically
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.title.localeCompare(b.title);
  });

  return results.slice(0, limit);
}
