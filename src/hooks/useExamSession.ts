import { useState, useEffect, useRef, useCallback } from "react";
import { ExamSimulation, Challenge } from "../types";
import { getExamLevelSpec, validateExamSubmission, ExamValidationResult } from "../lib/examValidator";
import confetti from "canvas-confetti";

export type ExamSessionStatus = "idle" | "preflight" | "running" | "finished";
export type ExamFinishReason = "completed" | "voluntary" | "abandoned" | "timeout";

export interface ExamSessionState {
  selectedExam: ExamSimulation | null;
  status: ExamSessionStatus;
  currentLevelIndex: number;
  unlockedLevelMaxIndex: number;
  completedLevels: number[];
  timeLeft: number;
  timeSpentSeconds: number;
  submittedCode: Record<number, string>;
  evalResults: Record<number, ExamValidationResult | null>;
  attemptsByLevel: Record<number, number>;
  failedAttemptsByLevel: Record<number, number>;
  finishReason: ExamFinishReason | null;
  finalScore: number;
}

export function useExamSession(
  allChallenges: Challenge[],
  onSaveExamScore: (examId: string, score: number) => void
) {
  const [selectedExam, setSelectedExam] = useState<ExamSimulation | null>(null);
  const [status, setStatus] = useState<ExamSessionStatus>("idle");
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [unlockedLevelMaxIndex, setUnlockedLevelMaxIndex] = useState<number>(0);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const [submittedCode, setSubmittedCode] = useState<Record<number, string>>({});
  const [evalResults, setEvalResults] = useState<Record<number, ExamValidationResult | null>>({});
  const [attemptsByLevel, setAttemptsByLevel] = useState<Record<number, number>>({});
  const [failedAttemptsByLevel, setFailedAttemptsByLevel] = useState<Record<number, number>>({});
  const [finishReason, setFinishReason] = useState<ExamFinishReason | null>(null);
  const [finalScore, setFinalScore] = useState<number>(0);

  // Keep a ref to avoid stale closures in timers and guards
  const statusRef = useRef<ExamSessionStatus>(status);
  statusRef.current = status;

  const timeLeftRef = useRef<number>(timeLeft);
  timeLeftRef.current = timeLeft;

  const selectedExamRef = useRef<ExamSimulation | null>(selectedExam);
  selectedExamRef.current = selectedExam;

  const completedLevelsRef = useRef<number[]>(completedLevels);
  completedLevelsRef.current = completedLevels;

  /**
   * Centralized exam termination function
   */
  const finishExam = useCallback(
    (reason: ExamFinishReason) => {
      // Guard against multiple calls or finishing when not running
      if (statusRef.current !== "running") return;

      const exam = selectedExamRef.current;
      if (!exam) {
        setStatus("idle");
        return;
      }

      const totalLevels = exam.levels ? exam.levels.length : 0;
      const currentCompleted = completedLevelsRef.current;
      const calculatedScore =
        totalLevels > 0 ? Math.round((currentCompleted.length / totalLevels) * 100) : 0;

      const totalDuration = exam.duration_minutes * 60;
      const elapsed = Math.max(0, totalDuration - timeLeftRef.current);

      setFinalScore(calculatedScore);
      setTimeSpentSeconds(elapsed);
      setFinishReason(reason);
      setStatus("finished");

      // Persist exam result for valid completion, voluntary finish or timeout
      if (reason !== "abandoned") {
        onSaveExamScore(exam.id, calculatedScore);
      }

      if (calculatedScore >= 75 && reason !== "abandoned") {
        try {
          confetti({
            particleCount: 100,
            spread: 90,
            origin: { y: 0.6 },
            colors: ["#4CAF50", "#03A9F4", "#FFC107"],
          });
        } catch {
          // ignore if canvas is not ready
        }
      }
    },
    [onSaveExamScore]
  );

  /**
   * Countdown timer effect - strictly runs only when status === 'running'
   */
  useEffect(() => {
    if (status !== "running") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Trigger timeout finalization
          finishExam("timeout");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, finishExam]);

  /**
   * Select an exam to view / enter preflight
   */
  const openPreflight = useCallback(
    (exam: ExamSimulation) => {
      setSelectedExam(exam);
      setStatus("preflight");
      setCurrentLevelIndex(0);
      setUnlockedLevelMaxIndex(0);
      setCompletedLevels([]);
      setTimeLeft(exam.duration_minutes * 60);
      setTimeSpentSeconds(0);
      setFinishReason(null);
      setFinalScore(0);
      setAttemptsByLevel({});
      setFailedAttemptsByLevel({});
      setEvalResults({});

      // Initialize initial template for Level 0 if available
      const initialCodes: Record<number, string> = {};
      if (exam.levels && exam.levels.length > 0) {
        const firstSpec = getExamLevelSpec(exam.levels[0], allChallenges);
        initialCodes[0] = firstSpec.starterTemplate;
      }
      setSubmittedCode(initialCodes);
    },
    [allChallenges]
  );

  /**
   * Start the exam from preflight
   */
  const startExam = useCallback(() => {
    if (!selectedExam) return;

    // Edge case: exam with no levels
    if (!selectedExam.levels || selectedExam.levels.length === 0) {
      setFinalScore(0);
      setTimeSpentSeconds(0);
      setFinishReason("completed");
      setStatus("finished");
      return;
    }

    // Ensure code for level 0 is prepared
    const firstLevelId = selectedExam.levels[0];
    const firstSpec = getExamLevelSpec(firstLevelId, allChallenges);
    setSubmittedCode((prev) => ({
      ...prev,
      [0]: prev[0] || firstSpec.starterTemplate,
    }));

    setStatus("running");
  }, [selectedExam, allChallenges]);

  /**
   * Cancel preflight and return to idle/overview
   */
  const cancelPreflight = useCallback(() => {
    setStatus("idle");
    setSelectedExam(null);
  }, []);

  /**
   * Switch level (only allowed if unlocked or already completed)
   */
  const selectLevel = useCallback(
    (idx: number) => {
      if (status !== "running" || !selectedExam) return;
      if (idx < 0 || idx >= selectedExam.levels.length) return;

      // Only allow navigating to levels up to the maximum unlocked level
      if (idx > unlockedLevelMaxIndex && !completedLevels.includes(idx)) {
        return;
      }

      const targetLevelId = selectedExam.levels[idx];
      if (!submittedCode[idx]) {
        const spec = getExamLevelSpec(targetLevelId, allChallenges);
        setSubmittedCode((prev) => ({ ...prev, [idx]: spec.starterTemplate }));
      }
      setCurrentLevelIndex(idx);
    },
    [status, selectedExam, unlockedLevelMaxIndex, completedLevels, submittedCode, allChallenges]
  );

  /**
   * Update student code for the current level (disabled if not running)
   */
  const updateCode = useCallback(
    (idx: number, code: string) => {
      if (status !== "running") return;
      setSubmittedCode((prev) => ({ ...prev, [idx]: code }));
    },
    [status]
  );

  /**
   * Reset template of a specific level
   */
  const resetLevelTemplate = useCallback(
    (idx: number) => {
      if (status !== "running" || !selectedExam) return;
      if (!selectedExam.levels[idx]) return;

      const spec = getExamLevelSpec(selectedExam.levels[idx], allChallenges);
      setSubmittedCode((prev) => ({ ...prev, [idx]: spec.starterTemplate }));
      setEvalResults((prev) => ({ ...prev, [idx]: null }));
    },
    [status, selectedExam, allChallenges]
  );

  /**
   * Grade the current level (Moulinette simulation)
   */
  const gradeCurrentLevel = useCallback(
    (lvlIdx: number) => {
      if (status !== "running" || !selectedExam) return;
      const currentLevelId = selectedExam.levels[lvlIdx];
      if (!currentLevelId) return;

      const spec = getExamLevelSpec(currentLevelId, allChallenges);
      const code = submittedCode[lvlIdx] || "";

      // Register attempt
      setAttemptsByLevel((prev) => ({
        ...prev,
        [lvlIdx]: (prev[lvlIdx] || 0) + 1,
      }));

      // Validate submission using existing validator
      const result = validateExamSubmission(code, spec);
      setEvalResults((prev) => ({ ...prev, [lvlIdx]: result }));

      if (result.passed) {
        const nextCompleted = Array.from(new Set([...completedLevels, lvlIdx]));
        setCompletedLevels(nextCompleted);

        const totalLevels = selectedExam.levels.length;
        const nextUnlockedIndex = Math.min(lvlIdx + 1, totalLevels - 1);
        setUnlockedLevelMaxIndex((prev) => Math.max(prev, nextUnlockedIndex));

        // If next level exists and is not initialized yet, prepare template
        if (nextUnlockedIndex < totalLevels && !submittedCode[nextUnlockedIndex]) {
          const nextSpec = getExamLevelSpec(selectedExam.levels[nextUnlockedIndex], allChallenges);
          setSubmittedCode((prev) => ({
            ...prev,
            [nextUnlockedIndex]: nextSpec.starterTemplate,
          }));
        }

        // Trigger confetti for level passed
        try {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.65 },
            colors: ["#4CAF50", "#03A9F4", "#FFC107"],
          });
        } catch {
          // ignore
        }

        // If this was the last level, auto complete or switch to next
        if (nextCompleted.length >= totalLevels) {
          // All levels completed!
          setTimeout(() => {
            finishExam("completed");
          }, 600);
        } else if (lvlIdx + 1 < totalLevels) {
          // Advance to next unlocked level
          setCurrentLevelIndex(lvlIdx + 1);
        }
      } else {
        // Increment failed attempts
        setFailedAttemptsByLevel((prev) => ({
          ...prev,
          [lvlIdx]: (prev[lvlIdx] || 0) + 1,
        }));
      }
    },
    [status, selectedExam, allChallenges, submittedCode, completedLevels, finishExam]
  );

  /**
   * Restart exam from summary
   */
  const restartExam = useCallback(() => {
    if (selectedExam) {
      openPreflight(selectedExam);
    } else {
      setStatus("idle");
    }
  }, [selectedExam, openPreflight]);

  return {
    selectedExam,
    status,
    currentLevelIndex,
    unlockedLevelMaxIndex,
    completedLevels,
    timeLeft,
    timeSpentSeconds,
    submittedCode,
    evalResults,
    attemptsByLevel,
    failedAttemptsByLevel,
    finishReason,
    finalScore,
    openPreflight,
    startExam,
    cancelPreflight,
    selectLevel,
    updateCode,
    resetLevelTemplate,
    gradeCurrentLevel,
    finishExam,
    restartExam,
  };
}
