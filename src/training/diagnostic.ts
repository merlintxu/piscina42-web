import { DiagnosticResult, DiagnosticSkillScore, SkillCategory, SkillLevel } from "./types";
import { DIAGNOSTIC_QUESTIONS } from "./diagnosticQuestions";
import { SKILL_DEFINITIONS } from "./config";

export function evaluateDiagnostic(answers: Record<string, string>): DiagnosticResult {
  const now = new Date().toISOString();
  let correctCount = 0;
  const totalQuestions = DIAGNOSTIC_QUESTIONS.length;

  const skillAccumulator: Record<string, { correct: number; total: number; category: SkillCategory; title: string }> = {};

  // Initialize accumulator for all skills present in questions
  for (const q of DIAGNOSTIC_QUESTIONS) {
    if (!skillAccumulator[q.skillId]) {
      const def = SKILL_DEFINITIONS.find(s => s.id === q.skillId);
      skillAccumulator[q.skillId] = {
        correct: 0,
        total: 0,
        category: q.category,
        title: def?.title || q.skillId
      };
    }
  }

  // Grade each question
  for (const q of DIAGNOSTIC_QUESTIONS) {
    const selectedOptionId = answers[q.id];
    const correctOption = q.options.find(o => o.isCorrect);
    const isCorrect = selectedOptionId === correctOption?.id;

    skillAccumulator[q.skillId].total += 1;
    if (isCorrect) {
      correctCount += 1;
      skillAccumulator[q.skillId].correct += 1;
    }
  }

  // Calculate per-skill scores & level assignment
  const skillScores: Record<string, DiagnosticSkillScore> = {};
  const categoryTotals: Record<SkillCategory, { correct: number; total: number }> = {
    terminal: { correct: 0, total: 0 },
    git: { correct: 0, total: 0 },
    c_prog: { correct: 0, total: 0 },
    engineering: { correct: 0, total: 0 },
    meta: { correct: 0, total: 0 }
  };

  for (const [skillId, stats] of Object.entries(skillAccumulator)) {
    const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    
    // Assign calculated base level from diagnostic:
    // 100% -> Level 3
    // 60-99% -> Level 2
    // 30-59% -> Level 1
    // 0-29% -> Level 0
    let calculatedLevel: SkillLevel = 0;
    if (pct === 100) calculatedLevel = 3;
    else if (pct >= 60) calculatedLevel = 2;
    else if (pct >= 30) calculatedLevel = 1;
    else calculatedLevel = 0;

    skillScores[skillId] = {
      skillId,
      skillTitle: stats.title,
      category: stats.category,
      correct: stats.correct,
      total: stats.total,
      percentage: pct,
      calculatedLevel
    };

    categoryTotals[stats.category].correct += stats.correct;
    categoryTotals[stats.category].total += stats.total;
  }

  const categoryScores: Record<SkillCategory, number> = {
    terminal: categoryTotals.terminal.total > 0 ? Math.round((categoryTotals.terminal.correct / categoryTotals.terminal.total) * 100) : 0,
    git: categoryTotals.git.total > 0 ? Math.round((categoryTotals.git.correct / categoryTotals.git.total) * 100) : 0,
    c_prog: categoryTotals.c_prog.total > 0 ? Math.round((categoryTotals.c_prog.correct / categoryTotals.c_prog.total) * 100) : 0,
    engineering: categoryTotals.engineering.total > 0 ? Math.round((categoryTotals.engineering.correct / categoryTotals.engineering.total) * 100) : 0,
    meta: categoryTotals.meta.total > 0 ? Math.round((categoryTotals.meta.correct / categoryTotals.meta.total) * 100) : 0
  };

  const overallPercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // Identify strengths & weaknesses
  const sortedSkills = Object.values(skillScores).sort((a, b) => b.percentage - a.percentage);
  const strongestSkills = sortedSkills.filter(s => s.percentage >= 60).map(s => s.skillId);
  const weakestSkills = sortedSkills.filter(s => s.percentage < 60).map(s => s.skillId);

  // Generate tailored pedagogical recommendations
  const recommendations: string[] = [];

  if (categoryScores.c_prog < 50) {
    recommendations.push("Prioriza el dominio de punteros básicos (Módulo C01) y manipulación de memoria con terminadores '\\0' (C02/C03).");
  }
  if (categoryScores.engineering < 60) {
    recommendations.push("Adopta la mentalidad de Norminette v3 de forma estricta en cada ejercicio: nada de bucles for y máximo 25 líneas.");
  }
  if (categoryScores.terminal < 60) {
    recommendations.push("Practica intensivamente permisos octales (chmod), pipes y redirecciones en la terminal sin tocar el ratón.");
  }
  if (categoryScores.git < 60) {
    recommendations.push("Entrena el flujo de commits atómicos y revisa siempre con git status y git diff antes de simular una entrega.");
  }
  if (categoryScores.meta < 60) {
    recommendations.push("Comienza a realizar simulacros cronometrados de 4 horas en el Simulador de Exámenes para dominar los nervios.");
  }
  if (recommendations.length === 0) {
    recommendations.push("¡Excelente base inicial! Tu objetivo ahora es ganar velocidad de escritura en C y resolver retos de memoria dinámica (C07).");
  }

  return {
    completedAt: now,
    score: correctCount,
    totalQuestions,
    percentage: overallPercentage,
    skillScores,
    categoryScores,
    answers,
    recommendations,
    weakestSkills,
    strongestSkills
  };
}
