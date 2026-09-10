import React, { useState } from "react";
import { Users, CheckCircle2, AlertCircle, MessageSquare, Award, Shield, FileCheck, ThumbsUp } from "lucide-react";

export const PeerEvalGuide: React.FC = () => {
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    cloning: false,
    norminette: false,
    compilation: false,
    explanation: false,
    edge_cases: false,
    valgrind: false,
  });

  const toggleItem = (key: string) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const steps = [
    {
      id: "cloning",
      title: "1. Clonado Limpio del Repositorio Vogsphere",
      desc: "El evaluador debe clonar el repo en un directorio temporal nuevo. Nunca evalúes sobre la sesión o archivos locales del evaluado.",
    },
    {
      id: "norminette",
      title: "2. Verificación de Norminette",
      desc: "Ejecutar `norminette -R CheckForbiddenSourceHeader`. Si hay cualquier fallo de Norme, la corrección termina aquí con nota 0.",
    },
    {
      id: "compilation",
      title: "3. Compilación con Flags Estrictos",
      desc: "Compilar usando siempre: `gcc -Wall -Wextra -Werror *.c`. No debe haber ningún warning.",
    },
    {
      id: "explanation",
      title: "4. Explicación de Código y Memoria",
      desc: "El compañero evaluado debe ser capaz de explicar cada línea de código, puntero y lógica que ha escrito. Si no sabe explicarlo, no ha hecho el trabajo.",
    },
    {
      id: "edge_cases",
      title: "5. Casos Límite y Robustez (Edge Cases)",
      desc: "Probar con: INT_MAX, INT_MIN, 0, cadenas vacías `\"\"`, punteros `NULL`, strings con caracteres no imprimibles o saltos de línea.",
    },
    {
      id: "valgrind",
      title: "6. Comprobación de Memory Leaks",
      desc: "Para asignación dinámica (C07+), ejecutar `valgrind --leak-check=full ./a.out`. Ni un solo byte debe quedar sin liberar (`free`).",
    },
  ];

  const allPassed = Object.values(checklist).every(Boolean);

  return (
    <div className="space-y-8">
      <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#03A9F4]/15 border border-[#03A9F4]/30 flex items-center justify-center text-[#03A9F4]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#ECEFF4]">Guía de Peer-Evaluation (Correcciones 42)</h2>
            <p className="text-xs text-[#9FA7B8]">El pilar del aprendizaje entre pares: cómo evaluar y ser evaluado justamente.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Evaluation Checklist */}
        <div className="lg:col-span-2 bg-[#141927] border border-[#2A2F3C] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#ECEFF4] flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#4CAF50]" />
              Ficha de Evaluación en Vivo (Checklist)
            </h3>
            <span className="text-xs font-mono text-[#9FA7B8]">
              {Object.values(checklist).filter(Boolean).length} / {steps.length} Verificados
            </span>
          </div>

          <div className="space-y-3">
            {steps.map(step => {
              const isChecked = checklist[step.id];
              return (
                <div
                  key={step.id}
                  onClick={() => toggleItem(step.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                    isChecked
                      ? "bg-[#4CAF50]/10 border-[#4CAF50]/40 shadow-sm"
                      : "bg-[#0b0f19] border-[#2A2F3C] hover:border-[#9FA7B8]/40"
                  }`}
                >
                  <div className="mt-0.5">
                    {isChecked ? (
                      <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-[#2A2F3C]" />
                    )}
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${isChecked ? "text-[#4CAF50]" : "text-[#ECEFF4]"}`}>
                      {step.title}
                    </h4>
                    <p className="text-xs text-[#9FA7B8] mt-1 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {allPassed && (
            <div className="p-4 bg-[#4CAF50]/15 border border-[#4CAF50]/40 rounded-xl flex items-center gap-3 text-xs text-[#4CAF50] font-mono animate-fadeIn">
              <Award className="w-5 h-5 shrink-0" />
              <span>¡Evaluación completada con éxito! El alumno ha superado todos los controles de calidad y robustez.</span>
            </div>
          )}
        </div>

        {/* Culture & Peer Points */}
        <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl p-6 shadow-xl space-y-5">
          <h3 className="text-base font-bold text-[#ECEFF4] flex items-center gap-2">
            <ThumbsUp className="w-4 h-4 text-[#FFC107]" />
            Cultura & Puntos de Corrección
          </h3>

          <div className="space-y-4 text-xs text-[#ECEFF4]">
            <div className="p-3.5 bg-[#0b0f19] border border-[#2A2F3C] rounded-xl space-y-1">
              <strong className="text-[#FFC107] block font-mono">Puntos de Corrección (Eval Points)</strong>
              <p className="text-[#9FA7B8] leading-relaxed">
                Necesitas puntos de corrección para abrir slots de evaluación de tus proyectos. Ganarás 1 punto por cada compañero que evalúes.
              </p>
            </div>

            <div className="p-3.5 bg-[#0b0f19] border border-[#2A2F3C] rounded-xl space-y-1">
              <strong className="text-[#03A9F4] block font-mono">Feedback Constructivo</strong>
              <p className="text-[#9FA7B8] leading-relaxed">
                El objetivo nunca es pillar al compañero, sino aprender juntos. Si algo falla, explica el motivo y debate alternativas de diseño.
              </p>
            </div>

            <div className="p-3.5 bg-[#0b0f19] border border-[#2A2F3C] rounded-xl space-y-1">
              <strong className="text-[#4CAF50] block font-mono">Puntualidad</strong>
              <p className="text-[#9FA7B8] leading-relaxed">
                Llegar 15 minutos tarde a una evaluación penaliza en el campus. Acude siempre con antelación a los puestos asignados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
