import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { ContentJSON, GraphData, UserProgress, Challenge, GraphNode } from "./types";
import { 
  loadUserProgress, 
  toggleChallengeCompletion, 
  toggleBookmark, 
  toggleHabitActive, 
  incrementHabitDay, 
  saveHabitNote,
  saveExamResult 
} from "./lib/storage";
import { TrainingState } from "./training/types";
import { 
  loadTrainingState, 
  syncSkillsWithUserProgress 
} from "./training/trainingStorage";
import { calculateReadiness } from "./training/skillEngine";
import { Navbar } from "./components/Navbar";
import { HomeView } from "./views/HomeView";
import { PhaseView } from "./views/PhaseView";
import { ModuleView } from "./views/ModuleView";
import { ModulesListView } from "./views/ModulesListView";
import { ChallengesListView } from "./views/ChallengesListView";
import { ChallengePage } from "./views/ChallengePage";
import { HabitsView } from "./views/HabitsView";
import { ExamsView } from "./views/ExamsView";
import { GraphView } from "./views/GraphView";
import { ProgressView } from "./views/ProgressView";
import { TrainingDashboardView } from "./views/TrainingDashboardView";
import { DiagnosticView } from "./views/DiagnosticView";
import { NorminetteChecker } from "./components/NorminetteChecker";
import { PeerEvalGuide } from "./components/PeerEvalGuide";
import { AiMentorModal } from "./components/AiMentorModal";
import { GlobalSearchModal } from "./components/GlobalSearchModal";
import { Loader2, Terminal, AlertCircle } from "lucide-react";

export function App() {
  const navigate = useNavigate();
  const [content, setContent] = useState<ContentJSON | null>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isAiMentorOpen, setIsAiMentorOpen] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [aiContext, setAiContext] = useState<string>("");

  // User persistent progress
  const [progress, setProgress] = useState<UserProgress>(loadUserProgress());

  // Training OS persistent state
  const [trainingState, setTrainingState] = useState<TrainingState>(loadTrainingState());

  // Sync Training OS skills whenever content or progress updates
  useEffect(() => {
    if (content && progress) {
      setTrainingState((prev) => syncSkillsWithUserProgress(prev, progress, content));
    }
  }, [content, progress]);

  // Global keyboard shortcuts for Command Palette (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isSearchOpen]);

  // Load content and graph on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Try fetching from API endpoint first
        let contentData: ContentJSON | null = null;
        let graph: GraphData | null = null;

        try {
          const res = await fetch("/api/content");
          if (res.ok) {
            contentData = await res.json();
          }
        } catch {
          // Fallback to static json file
        }

        if (!contentData) {
          const res = await fetch("/content.json");
          if (res.ok) {
            contentData = await res.json();
          }
        }

        try {
          const resG = await fetch("/api/graph");
          if (resG.ok) {
            graph = await resG.json();
          }
        } catch {
          // Fallback
        }

        if (!graph) {
          const resG = await fetch("/graph.json");
          if (resG.ok) {
            graph = await resG.json();
          }
        }

        if (!contentData) {
          throw new Error("No se pudo cargar el contenido de content.json");
        }

        setContent(contentData);
        if (graph) setGraphData(graph);
      } catch (err: any) {
        console.error("Error loading application content:", err);
        setError(err.message || "Error al cargar los contenidos");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleToggleChallengeComplete = (challengeId: string) => {
    const updated = toggleChallengeCompletion(progress, challengeId);
    setProgress(updated);
  };

  const handleToggleBookmark = (itemId: string) => {
    const updated = toggleBookmark(progress, itemId);
    setProgress(updated);
  };

  const handleToggleHabitActive = (habitId: string) => {
    const updated = toggleHabitActive(progress, habitId);
    setProgress(updated);
  };

  const handleIncrementHabitDay = (habitId: string) => {
    const updated = incrementHabitDay(progress, habitId);
    setProgress(updated);
  };

  const handleSaveHabitNote = (habitId: string, note: string) => {
    const updated = saveHabitNote(progress, habitId, note);
    setProgress(updated);
  };

  const handleSaveExamScore = (examId: string, score: number) => {
    const updated = saveExamResult(progress, examId, score);
    setProgress(updated);
  };

  const handleAskAi = (prompt: string, context: string) => {
    setAiPrompt(prompt);
    setAiContext(context);
    setIsAiMentorOpen(true);
  };

  const handleNavigateGraphNode = (node: GraphNode) => {
    if (node.type === "phase") {
      const p = content?.phases.find(phase => phase.id === node.id);
      navigate(`/phase/${p?.slug || node.id}`);
    } else if (node.type === "module") {
      const m = content?.modules.find(mod => mod.id === node.id);
      navigate(`/module/${m?.slug || node.id}`);
    } else if (node.type === "challenge") {
      const ch = content?.challenges.find(c => c.id === node.id);
      navigate(`/challenge/${ch?.slug || node.id}`);
    } else if (node.type === "resource") {
      const r = content?.resources.find(res => res.id === node.id);
      if (r?.url) {
        window.open(r.url, "_blank", "noopener,noreferrer");
      }
    } else if (node.type === "exam") {
      navigate("/exams");
    } else if (node.type === "habit") {
      navigate("/habits");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center text-[#ECEFF4] p-4 font-mono">
        <div className="w-12 h-12 rounded-2xl bg-[#4CAF50]/15 border border-[#4CAF50]/30 flex items-center justify-center text-[#4CAF50] mb-4 animate-bounce">
          <Terminal className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2 text-sm font-bold">
          <Loader2 className="w-4 h-4 animate-spin text-[#4CAF50]" />
          <span>Cargando contenidos de Piscina 42...</span>
        </div>
        <p className="text-xs text-[#9FA7B8] mt-2">Parseando Markdown, Grafo Obsidian y retos de C</p>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center text-[#ECEFF4] p-4 font-mono">
        <AlertCircle className="w-10 h-10 text-rose-500 mb-3" />
        <h2 className="text-lg font-bold text-rose-400">Error al iniciar Piscina42-web</h2>
        <p className="text-xs text-[#9FA7B8] mt-1 max-w-md text-center">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-[#4CAF50] text-[#0b0f19] font-bold text-xs rounded-xl"
        >
          Reintentar
        </button>
      </div>
    );
  }

    const readiness = calculateReadiness(trainingState, content, progress);

    return (
      <div className="min-h-screen bg-[#0b0f19] text-[#ECEFF4] flex flex-col">
        {/* Top Navigation */}
        <Navbar
          progress={progress}
          totalChallengesCount={content.challenges.length}
          readinessScore={readiness.overallScore}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAiMentor={() => setIsAiMentorOpen(true)}
        />

        {/* Main Container View Area using React Router */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Routes>
            {/* /training → TrainingDashboardView (Training OS Phase 2.1) */}
            <Route
              path="/training"
              element={
                <TrainingDashboardView
                  content={content}
                  progress={progress}
                  trainingState={trainingState}
                  onUpdateTrainingState={setTrainingState}
                />
              }
            />

            {/* /diagnostic → DiagnosticView */}
            <Route
              path="/diagnostic"
              element={
                <DiagnosticView
                  trainingState={trainingState}
                  onUpdateTrainingState={setTrainingState}
                />
              }
            />

            {/* / → HomeView */}
            <Route
              path="/"
              element={
                <HomeView
                  content={content}
                  progress={progress}
                  trainingState={trainingState}
                  onToggleHabitActive={handleToggleHabitActive}
                  onIncrementHabitDay={handleIncrementHabitDay}
                  onSaveHabitNote={handleSaveHabitNote}
                />
              }
            />

          {/* /phase/:slug → PhaseView */}
          <Route
            path="/phase/:slug"
            element={
              <PhaseView
                allPhases={content.phases}
                allModules={content.modules}
                allChallenges={content.challenges}
                allResources={content.resources}
                allHabits={content.habits}
                progress={progress}
                onToggleChallengeComplete={handleToggleChallengeComplete}
                onToggleHabitActive={handleToggleHabitActive}
                onIncrementHabitDay={handleIncrementHabitDay}
                onSaveHabitNote={handleSaveHabitNote}
              />
            }
          />

          {/* /modules → ModulesListView */}
          <Route
            path="/modules"
            element={
              <ModulesListView
                modules={content.modules}
                challenges={content.challenges}
                progress={progress}
              />
            }
          />

          {/* /module/:slug → ModuleView */}
          <Route
            path="/module/:slug"
            element={
              <ModuleView
                allModules={content.modules}
                allChallenges={content.challenges}
                allResources={content.resources}
                progress={progress}
                onToggleChallengeComplete={handleToggleChallengeComplete}
                onAskAi={handleAskAi}
              />
            }
          />

          {/* /challenges → ChallengesListView */}
          <Route
            path="/challenges"
            element={
              <ChallengesListView
                challenges={content.challenges}
                modules={content.modules}
                phases={content.phases}
                progress={progress}
                onToggleComplete={handleToggleChallengeComplete}
              />
            }
          />

          {/* /challenge/:slug → ChallengePage */}
          <Route
            path="/challenge/:slug"
            element={
              <ChallengePage
                content={content}
                progress={progress}
                onToggleComplete={handleToggleChallengeComplete}
                onToggleBookmark={handleToggleBookmark}
                onAskAi={handleAskAi}
              />
            }
          />

          {/* /exams → ExamsView */}
          <Route
            path="/exams"
            element={
              <ExamsView
                exams={content.exams}
                allChallenges={content.challenges}
                progress={progress}
                onSaveExamScore={handleSaveExamScore}
              />
            }
          />

          {/* /graph → GraphView */}
          <Route
            path="/graph"
            element={
              <GraphView
                graphData={graphData}
                resources={content?.resources || []}
                onNavigateNode={handleNavigateGraphNode}
              />
            }
          />

          {/* /habits → HabitsView */}
          <Route
            path="/habits"
            element={
              <HabitsView
                habits={content.habits}
                progress={progress}
                onToggleActive={handleToggleHabitActive}
                onIncrementDay={handleIncrementHabitDay}
                onSaveNote={handleSaveHabitNote}
              />
            }
          />

          {/* /progress → ProgressView */}
          <Route
            path="/progress"
            element={
              <ProgressView
                content={content}
                progress={progress}
                onToggleChallengeComplete={handleToggleChallengeComplete}
              />
            }
          />

          {/* /norminette → NorminetteChecker */}
          <Route
            path="/norminette"
            element={
              <div className="pb-16">
                <NorminetteChecker />
              </div>
            }
          />

          {/* /peer-eval → PeerEvalGuide */}
          <Route
            path="/peer-eval"
            element={
              <div className="pb-16">
                <PeerEvalGuide />
              </div>
            }
          />
          <Route path="/peereval" element={<Navigate to="/peer-eval" replace />} />

          {/* Fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* AI Socratic Tutor Modal */}
      <AiMentorModal
        isOpen={isAiMentorOpen}
        onClose={() => setIsAiMentorOpen(false)}
        initialPrompt={aiPrompt}
        initialContext={aiContext}
      />

      {/* Cmd+K Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        content={content}
        onNavigateItem={(type, id, extra) => {
          if (type === "phase") {
            const p = content.phases.find(phase => phase.id === id);
            navigate(`/phase/${p?.slug || id}`);
          }
          if (type === "module") {
            const m = content.modules.find(mod => mod.id === id);
            navigate(`/module/${m?.slug || id}`);
          }
          if (type === "challenge") {
            const ch = extra || content.challenges.find(c => c.id === id);
            navigate(`/challenge/${ch?.slug || id}`);
          }
          if (type === "exam") navigate("/exams");
          if (type === "habit") navigate("/habits");
        }}
      />

      {/* Minimal Footer */}
      <footer className="mt-auto border-t border-[#2A2F3C] bg-[#0b0f19] py-6 text-center text-xs text-[#9FA7B8] font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Piscina 42 Madrid · Materiales y Modelo de Contenido</span>
          <span className="text-[11px] text-[#4CAF50]">Autonomía · Peer-Learning · Norminette</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
