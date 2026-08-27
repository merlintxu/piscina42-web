import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Terminal, 
  BookOpen, 
  Code2, 
  Clock, 
  Share2, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  ShieldCheck,
  Flame,
  Users
} from "lucide-react";
import { UserProgress } from "../types";

interface NavbarProps {
  progress: UserProgress;
  totalChallengesCount: number;
  onOpenSearch: () => void;
  onOpenAiMentor: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  progress,
  totalChallengesCount,
  onOpenSearch,
  onOpenAiMentor
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const completedCount = progress.completedChallenges.length;
  const pct = totalChallengesCount > 0 ? Math.round((completedCount / totalChallengesCount) * 100) : 0;

  const navItems = [
    { path: "/", label: "Fases & Ruta", icon: BookOpen, match: (p: string) => p === "/" || p.startsWith("/phase") },
    { path: "/modules", label: "Módulos (C & Shell)", icon: Terminal, match: (p: string) => p.startsWith("/modules") || p.startsWith("/module") },
    { path: "/challenges", label: "Retos de Código", icon: Code2, match: (p: string) => p.startsWith("/challenges") || p.startsWith("/challenge") },
    { path: "/exams", label: "Simulador Exámenes", icon: Clock, match: (p: string) => p.startsWith("/exams") },
    { path: "/habits", label: "Hábitos Piscineros", icon: Flame, match: (p: string) => p.startsWith("/habits") },
    { path: "/graph", label: "Grafo Obsidian", icon: Share2, match: (p: string) => p.startsWith("/graph") },
    { path: "/norminette", label: "Norminette", icon: ShieldCheck, match: (p: string) => p.startsWith("/norminette") },
    { path: "/peer-eval", label: "Peer-Eval", icon: Users, match: (p: string) => p.startsWith("/peer-eval") || p.startsWith("/peereval") },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0b0f19]/90 backdrop-blur-md border-b border-[#2A2F3C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link 
            to="/" 
            id="brand-logo-btn"
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4CAF50] to-[#03A9F4] p-0.5 flex items-center justify-center shadow-lg shadow-[#4CAF50]/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
                <span className="text-xl font-extrabold text-[#4CAF50] font-mono">42</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-[#ECEFF4] group-hover:text-[#4CAF50] transition-colors">
                  Piscina42
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-[#4CAF50]/15 text-[#4CAF50] border border-[#4CAF50]/30 rounded">
                  MADRID
                </span>
              </div>
              <p className="text-[11px] text-[#9FA7B8] font-mono leading-none">
                Preparación & Conocimiento
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.match(location.pathname);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  id={`nav-link-${item.path.replace(/\//g, '') || 'home'}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[#141927] text-[#4CAF50] border border-[#4CAF50]/30 shadow-sm"
                      : "text-[#9FA7B8] hover:text-[#ECEFF4] hover:bg-[#141927]/60"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#4CAF50]" : "text-[#9FA7B8]"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions & Stats */}
          <div className="flex items-center gap-2.5">
            {/* Search Trigger */}
            <button
              id="global-search-btn"
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141927] hover:bg-[#1a2236] border border-[#2A2F3C] text-[#9FA7B8] hover:text-[#ECEFF4] text-xs transition-colors"
              title="Buscar en todo el temario (Cmd/Ctrl + K)"
            >
              <Search className="w-3.5 h-3.5 text-[#03A9F4]" />
              <span className="hidden sm:inline">Buscar...</span>
              <kbd className="hidden sm:inline px-1.5 py-0.5 text-[9px] bg-[#0b0f19] border border-[#2A2F3C] rounded font-mono text-[#9FA7B8]">
                ⌘K
              </kbd>
            </button>

            {/* AI Tutor Button */}
            <button
              id="ai-mentor-btn"
              onClick={onOpenAiMentor}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#4CAF50]/15 to-[#03A9F4]/15 hover:from-[#4CAF50]/25 hover:to-[#03A9F4]/25 border border-[#4CAF50]/40 text-[#ECEFF4] text-xs font-medium transition-all shadow-sm group"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#4CAF50] group-hover:rotate-12 transition-transform" />
              <span className="hidden md:inline">Tutor IA</span>
            </button>

            {/* Progress Badge */}
            <div 
              id="progress-badge"
              onClick={() => navigate("/challenges")}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#141927] border border-[#2A2F3C] rounded-lg cursor-pointer hover:border-[#4CAF50]/50 transition-colors"
              title={`${completedCount} de ${totalChallengesCount} retos completados`}
            >
              <div className="relative w-4 h-4 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-[10px] text-[#9FA7B8] leading-none font-mono">Progreso</span>
                <span className="text-xs font-bold text-[#ECEFF4] font-mono leading-none mt-0.5">
                  {pct}% <span className="text-[10px] font-normal text-[#9FA7B8]">({completedCount}/{totalChallengesCount})</span>
                </span>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg bg-[#141927] border border-[#2A2F3C] text-[#9FA7B8] hover:text-[#ECEFF4]"
            >
              <Terminal className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden py-3 border-t border-[#2A2F3C] grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.match(location.pathname);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[#141927] text-[#4CAF50] border border-[#4CAF50]/30"
                      : "text-[#9FA7B8] hover:text-[#ECEFF4] hover:bg-[#141927]/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </header>
  );
};
