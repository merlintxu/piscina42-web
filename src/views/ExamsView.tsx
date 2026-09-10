import React from "react";
import { ExamSimulation, Challenge, UserProgress } from "../types";
import { ExamSimulator } from "../components/ExamSimulator";

interface ExamsViewProps {
  exams: ExamSimulation[];
  allChallenges: Challenge[];
  progress: UserProgress;
  onSaveExamScore: (examId: string, score: number) => void;
}

export const ExamsView: React.FC<ExamsViewProps> = ({
  exams,
  allChallenges,
  progress,
  onSaveExamScore,
}) => {
  return (
    <div className="space-y-8 pb-16">
      <ExamSimulator
        exams={exams}
        allChallenges={allChallenges}
        progress={progress}
        onSaveExamScore={onSaveExamScore}
      />
    </div>
  );
};
