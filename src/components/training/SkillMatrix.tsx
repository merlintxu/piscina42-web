import React from "react";
import { Layers, ChevronUp, ChevronDown } from "lucide-react";
import { SkillDefinition, SkillCategory, TrainingState } from "../../training/types";
import { SKILL_CATEGORIES, SKILL_DEFINITIONS } from "../../training/config";

interface SkillMatrixProps {
  skills: SkillDefinition[];
  trainingState: TrainingState;
  selectedCategory: SkillCategory | "all";
  onSelectCategory: (category: SkillCategory | "all") => void;
  expandedSkillId: string | null;
  onToggleExpandSkill: (skillId: string) => void;
}

export const SkillMatrix: React.FC<SkillMatrixProps> = ({
  skills,
  trainingState,
  selectedCategory,
  onSelectCategory,
  expandedSkillId,
  onToggleExpandSkill
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#ECEFF4] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#03A9F4]" />
            <span>Matriz de Competencias 42 (Skill Matrix)</span>
          </h2>
          <p className="text-xs text-[#9FA7B8] mt-0.5">
            Escala objetiva de 0 a 5 por habilidad técnica, con criterios pedagógicos y evidencias acumuladas.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-[#141927] p-1 rounded-xl border border-[#2A2F3C]">
          <button
            onClick={() => onSelectCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              selectedCategory === "all"
                ? "bg-[#0b0f19] text-[#4CAF50] font-bold shadow-sm"
                : "text-[#9FA7B8] hover:text-[#ECEFF4]"
            }`}
          >
            Todas ({SKILL_DEFINITIONS.length})
          </button>
          {(Object.keys(SKILL_CATEGORIES) as SkillCategory[]).map(catKey => {
            const cat = SKILL_CATEGORIES[catKey];
            const count = SKILL_DEFINITIONS.filter(s => s.category === catKey).length;
            return (
              <button
                key={catKey}
                onClick={() => onSelectCategory(catKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  selectedCategory === catKey
                    ? "bg-[#0b0f19] text-[#4CAF50] font-bold shadow-sm"
                    : "text-[#9FA7B8] hover:text-[#ECEFF4]"
                }`}
              >
                {cat.shortName} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Skill Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {skills.map(skill => {
          const mastery = trainingState.skills[skill.id] || { level: 0, confidence: 0, evidenceCount: 0 };
          const cat = SKILL_CATEGORIES[skill.category];
          const isExpanded = expandedSkillId === skill.id;
          const currentCriterion = skill.levels.find(l => l.level === mastery.level) || skill.levels[0];

          return (
            <div
              key={skill.id}
              className="bg-[#141927] border border-[#2A2F3C] hover:border-[#4CAF50]/40 rounded-2xl p-5 shadow-xl space-y-4 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${cat.color.badge}`}>
                    {cat.name}
                  </span>

                  {/* Level Badge */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0b0f19] border border-[#2A2F3C] rounded-lg">
                    <span className="text-[10px] font-mono text-[#9FA7B8]">Nivel</span>
                    <span className="text-xs font-bold font-mono text-[#4CAF50]">
                      {mastery.level}/5
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#ECEFF4]">{skill.title}</h3>
                  <p className="text-xs text-[#9FA7B8] mt-1 line-clamp-2 leading-relaxed">
                    {skill.description}
                  </p>
                </div>

                {/* Level progress dots */}
                <div className="flex items-center gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5].map(lvl => (
                    <div
                      key={lvl}
                      className={`h-2 flex-1 rounded-full border transition-all ${
                        lvl <= mastery.level
                          ? "bg-[#4CAF50] border-[#4CAF50]"
                          : "bg-[#0b0f19] border-[#2A2F3C]"
                      }`}
                      title={`Nivel ${lvl}`}
                    />
                  ))}
                </div>

                {/* Current Mastery Criteria */}
                <div className="p-2.5 bg-[#0b0f19] rounded-xl border border-[#2A2F3C] text-xs font-mono space-y-1">
                  <div className="text-[11px] text-[#4CAF50] font-bold">
                    {currentCriterion.label} (Nivel {mastery.level})
                  </div>
                  <p className="text-[11px] text-[#9FA7B8] leading-tight">
                    {currentCriterion.criteria}
                  </p>
                </div>

                {/* Expandable all levels criteria */}
                {isExpanded && (
                  <div className="pt-2 border-t border-[#2A2F3C] space-y-2 text-xs font-mono">
                    <span className="text-[10px] text-[#9FA7B8] uppercase font-bold block">
                      Criterios de progresión (0 a 5):
                    </span>
                    <div className="space-y-1.5">
                      {skill.levels.map(l => (
                        <div
                          key={l.level}
                          className={`p-2 rounded-lg border text-[11px] ${
                            l.level === mastery.level
                              ? "bg-[#4CAF50]/15 border-[#4CAF50]/30 text-[#ECEFF4]"
                              : "bg-[#0b0f19] border-[#2A2F3C] text-[#9FA7B8]"
                          }`}
                        >
                          <span className="font-bold text-[#ECEFF4]">Nv {l.level} · {l.label}:</span>{" "}
                          {l.criteria}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#2A2F3C] flex items-center justify-between text-xs font-mono">
                <button
                  onClick={() => onToggleExpandSkill(skill.id)}
                  className="text-[#03A9F4] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{isExpanded ? "Ocultar niveles" : "Ver 5 niveles"}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <span className="text-[#9FA7B8] text-[11px]">
                  {mastery.evidenceCount} evidencias
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
