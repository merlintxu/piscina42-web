import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Play, 
  Flame, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink, 
  ChevronUp, 
  ChevronDown, 
  Users, 
  ClipboardCheck,
  RotateCcw,
  AlertTriangle,
  X
} from "lucide-react";
import { DailyMission, DailyMissionDebrief } from "../../training/types";

interface DailyMissionCardProps {
  dailyMission: DailyMission;
  streakDays: number;
  existingDebrief?: DailyMissionDebrief;
  expandedPeerItemId: string | null;
  onTogglePeerAccordion: (itemId: string) => void;
  onToggleMissionItem: (itemId: string) => void;
  onOpenDebrief: () => void;
  onRegenerateMission?: () => void;
}

export const DailyMissionCard: React.FC<DailyMissionCardProps> = ({
  dailyMission,
  streakDays,
  existingDebrief,
  expandedPeerItemId,
  onTogglePeerAccordion,
  onToggleMissionItem,
  onOpenDebrief,
  onRegenerateMission
}) => {
  const [isConfirmRegenerateOpen, setIsConfirmRegenerateOpen] = useState(false);

  const completedCount = useMemo(() => {
    if (!dailyMission.items) return 0;
    return dailyMission.items.filter(i => i.completed).length;
  }, [dailyMission.items]);

  const hasCompletedItems = completedCount > 0;

  const missionProgressPct = useMemo(() => {
    if (!dailyMission.items || dailyMission.items.length === 0) return 0;
    return Math.round((completedCount / dailyMission.items.length) * 100);
  }, [dailyMission.items, completedCount]);

  const handleConfirmRegenerate = () => {
    if (onRegenerateMission) {
      onRegenerateMission();
    }
    setIsConfirmRegenerateOpen(false);
  };

  return (
    <div className="bg-[#141927] border border-[#4CAF50]/40 rounded-2xl p-6 shadow-xl space-y-5 lg:col-span-2 flex flex-col justify-between relative">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2A2F3C] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#4CAF50] text-[#0b0f19] rounded-md flex items-center gap-1">
                <Play className="w-3 h-3 fill-current" />
                Misión del Día
              </span>
              <span className="text-xs font-mono text-[#9FA7B8]">{dailyMission.date}</span>
            </div>
            <h2 className="text-lg font-bold text-[#ECEFF4] mt-1">
              Plan de Entrenamiento Diario
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0b0f19] border border-[#2A2F3C] rounded-lg">
              <Flame className="w-3.5 h-3.5 text-[#FFC107]" />
              <span className="text-[#ECEFF4] font-bold">Racha: {streakDays} d</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0b0f19] border border-[#2A2F3C] rounded-lg">
              <Clock className="w-3.5 h-3.5 text-[#03A9F4]" />
              <span className="text-[#ECEFF4] font-bold">~{dailyMission.estimatedMinutes} min</span>
            </div>
            {onRegenerateMission && (
              <button
                id="btn-regenerate-mission-trigger"
                onClick={() => setIsConfirmRegenerateOpen(true)}
                title="Regenerar la misión de hoy"
                className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0b0f19] hover:bg-[#1f2638] border border-[#2A2F3C] hover:border-[#4CAF50]/50 text-[#CAD2E2] hover:text-[#ECEFF4] rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#4CAF50]" />
                <span className="hidden sm:inline">Regenerar</span>
              </button>
            )}
          </div>
        </div>

        {/* Rationale Quote */}
        <div className="p-3 bg-[#0b0f19]/70 border border-[#2A2F3C] rounded-xl text-xs text-[#CAD2E2] leading-relaxed">
          <span className="text-[#4CAF50] font-bold font-mono">Enfoque pedagógico: </span>
          {dailyMission.rationale}
        </div>

        {/* Mission Items Checklist */}
        <div className="space-y-3">
          {dailyMission.items.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border transition-all ${
                item.completed
                  ? "bg-[#4CAF50]/10 border-[#4CAF50]/40 text-[#4CAF50]"
                  : "bg-[#0b0f19] border-[#2A2F3C] text-[#ECEFF4]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  onClick={() => onToggleMissionItem(item.id)}
                  className="flex items-start gap-3 flex-1 text-left cursor-pointer pt-0.5"
                >
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors mt-0.5 ${
                    item.completed ? "bg-[#4CAF50] border-[#4CAF50] text-[#0b0f19]" : "border-[#2A2F3C] bg-[#141927]"
                  }`}>
                    {item.completed && <CheckCircle2 className="w-4 h-4 fill-current" />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xs sm:text-sm font-medium ${item.completed ? "line-through opacity-80" : ""}`}>
                        {item.title}
                      </span>
                      
                      {/* Mode Badge (learn vs prove) */}
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase ${
                        item.mode === "prove" 
                          ? "bg-[#00BCD4]/15 text-[#00BCD4] border border-[#00BCD4]/30" 
                          : "bg-[#9C27B0]/15 text-[#BA68C8] border border-[#9C27B0]/30"
                      }`}>
                        {item.mode === "prove" ? "Demostrar" : "Aprender"}
                      </span>

                      {/* Item Type Badge */}
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#141927] border border-[#2A2F3C] text-[#9FA7B8] rounded uppercase">
                        {item.type}
                      </span>
                    </div>

                    {item.description && (
                      <p className="text-[11px] text-[#9FA7B8] leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </button>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono text-[#9FA7B8] hidden sm:inline">
                    {item.estimatedMinutes} min
                  </span>

                  {(item.type === "challenge" || item.type === "recall" || item.type === "practice") && (
                    <Link
                      to={item.referenceId.startsWith("shell") || item.referenceId.startsWith("c0") ? `/module/${item.referenceId}` : `/challenge/${item.referenceId}`}
                      className="px-2.5 py-1 text-xs font-mono bg-[#141927] hover:bg-[#1f2840] border border-[#2A2F3C] text-[#03A9F4] rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>Abrir</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}

                  {item.type === "concept" && (
                    item.externalUrl ? (
                      <a
                        href={item.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 text-xs font-mono bg-[#141927] hover:bg-[#1f2840] border border-[#2A2F3C] text-[#9C27B0] rounded-lg transition-colors flex items-center gap-1"
                      >
                        <span>Recurso</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <Link
                        to={`/module/${item.referenceId}`}
                        className="px-2.5 py-1 text-xs font-mono bg-[#141927] hover:bg-[#1f2840] border border-[#2A2F3C] text-[#9C27B0] rounded-lg transition-colors flex items-center gap-1"
                      >
                        <span>Módulo</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )
                  )}

                  {item.type === "peer" && (
                    <button
                      type="button"
                      onClick={() => onTogglePeerAccordion(item.id)}
                      className="px-2.5 py-1 text-xs font-mono bg-[#141927] hover:bg-[#1f2840] border border-[#2A2F3C] text-[#00BCD4] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Edge Cases</span>
                      {expandedPeerItemId === item.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}

                  {item.type === "review" && (
                    <Link
                      to="/norminette"
                      className="px-2.5 py-1 text-xs font-mono bg-[#141927] hover:bg-[#1f2840] border border-[#2A2F3C] text-[#E91E63] rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>Norminette</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}

                  {item.type === "habit" && (
                    <Link
                      to="/habits"
                      className="px-2.5 py-1 text-xs font-mono bg-[#141927] hover:bg-[#1f2840] border border-[#2A2F3C] text-[#FFC107] rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>Hábitos</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}

                  {item.type === "debrief" && (
                    <button
                      type="button"
                      onClick={onOpenDebrief}
                      className="px-2.5 py-1 text-xs font-mono bg-[#141927] hover:bg-[#1f2840] border border-[#2A2F3C] text-[#8BC34A] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>{item.completed ? "Editar Debrief" : "Rellenar"}</span>
                      <ClipboardCheck className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Peer Evaluation Edge Cases Accordion */}
              {item.type === "peer" && expandedPeerItemId === item.id && (
                <div className="mt-3 pt-3 border-t border-[#2A2F3C] space-y-2 bg-[#141927]/60 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#00BCD4] font-mono">
                    <Users className="w-3.5 h-3.5" />
                    <span>Checklist de defensa en voz alta y decisiones de diseño:</span>
                  </div>
                  <p className="text-[11px] text-[#CAD2E2]">
                    Explica ante tu peer por qué elegiste cada tipo de datos, cómo gestionas la memoria y valida estos casos límite:
                  </p>
                  {item.edgeCases && item.edgeCases.length > 0 ? (
                    <ul className="space-y-1 pl-2">
                      {item.edgeCases.map((ec, idx) => (
                        <li key={idx} className="text-[11px] text-[#ECEFF4] flex items-start gap-1.5 font-mono">
                          <span className="text-[#00BCD4] font-bold">›</span>
                          <span>{ec}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[11px] text-[#9FA7B8] font-mono">
                      › Punteros NULL, buffers vacíos, límites de tipos enteros y Norminette v3.
                    </p>
                  )}
                </div>
              )}

              {/* Debrief Saved Summary preview */}
              {item.type === "debrief" && (item.debriefData || existingDebrief) && (
                <div className="mt-2.5 pt-2.5 border-t border-[#2A2F3C] flex flex-wrap items-center gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.5 bg-[#141927] border border-[#2A2F3C] rounded text-[#8BC34A]">
                    Dificultad: {(item.debriefData || existingDebrief)?.difficultyRating}/5
                  </span>
                  <span className="px-2 py-0.5 bg-[#141927] border border-[#2A2F3C] rounded text-[#03A9F4]">
                    Confianza: {(item.debriefData || existingDebrief)?.confidenceRating}/5
                  </span>
                  {(item.debriefData || existingDebrief)?.hardestThing && (
                    <span className="text-[#9FA7B8] italic truncate max-w-xs sm:max-w-md">
                      "{(item.debriefData || existingDebrief)?.hardestThing}"
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mission Progress Bar & Status */}
      <div className="pt-4 border-t border-[#2A2F3C] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#9FA7B8]">Completitud de la misión:</span>
            <span className="text-[#ECEFF4] font-bold">{missionProgressPct}%</span>
          </div>
          <div className="w-full h-2 bg-[#0b0f19] rounded-full overflow-hidden border border-[#2A2F3C]">
            <div
              className="h-full bg-[#4CAF50] transition-all duration-500"
              style={{ width: `${missionProgressPct}%` }}
            />
          </div>
        </div>

        {dailyMission.completed && (
          <span className="px-3 py-1 bg-[#4CAF50]/15 border border-[#4CAF50]/30 text-[#4CAF50] text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 self-start sm:self-auto">
            <CheckCircle2 className="w-3.5 h-3.5" />
            ¡Misión Diaria Superada!
          </span>
        )}
      </div>

      {/* Confirmation Modal for Mission Regeneration */}
      {isConfirmRegenerateOpen && (
        <div 
          id="modal-confirm-regenerate-mission"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setIsConfirmRegenerateOpen(false)}
              className="absolute top-4 right-4 text-[#9FA7B8] hover:text-[#ECEFF4] p-1 rounded-lg hover:bg-[#1f2638] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFC107]/10 border border-[#FFC107]/30 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5 text-[#FFC107]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#ECEFF4]">
                  ¿Regenerar la misión de hoy?
                </h3>
                <span className="text-xs font-mono text-[#9FA7B8]">
                  Fecha: {dailyMission.date}
                </span>
              </div>
            </div>

            {hasCompletedItems ? (
              <div className="p-3.5 bg-[#FFC107]/10 border border-[#FFC107]/30 rounded-xl text-xs text-[#FFD54F] space-y-2">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-[#FFC107] shrink-0" />
                  Progreso en curso detectado
                </p>
                <p className="leading-relaxed">
                  Ya has completado <span className="font-bold underline">{completedCount} de {dailyMission.items.length}</span> tareas en la misión actual. Al regenerar se descartará el progreso de esta misión diaria y se generará una nueva combinación de ejercicios.
                </p>
              </div>
            ) : (
              <div className="p-3.5 bg-[#0b0f19] border border-[#2A2F3C] rounded-xl text-xs text-[#CAD2E2] leading-relaxed">
                Se recalculará la misión del día de acuerdo con tu tiempo diario disponible y tus debilidades pedagógicas prioritarias.
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                id="btn-cancel-regenerate"
                onClick={() => setIsConfirmRegenerateOpen(false)}
                className="px-4 py-2 text-xs font-medium text-[#9FA7B8] hover:text-[#ECEFF4] hover:bg-[#1f2638] rounded-xl border border-[#2A2F3C] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="btn-confirm-regenerate"
                onClick={handleConfirmRegenerate}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                  hasCompletedItems
                    ? "bg-[#E91E63] hover:bg-[#D81B60] text-white"
                    : "bg-[#4CAF50] hover:bg-[#43A047] text-[#0b0f19]"
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Confirmar y Regenerar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
