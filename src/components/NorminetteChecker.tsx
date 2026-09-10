import React, { useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Code2,
  Copy,
  Check,
  Terminal,
  FileCode,
  Layers,
  HelpCircle,
  AlertCircle,
  Hash
} from "lucide-react";
import { analyzeNorminette, NorminetteReport } from "../lib/norminette";

export const NorminetteChecker: React.FC = () => {
  const [codeSnippet, setCodeSnippet] = useState(`/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ft_putchar.c                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: alumno <alumno@student.42madrid.com>       +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/08/27 10:00:00 by alumno            #+#    #+#             */
/*   Updated: 2026/08/27 10:00:00 by alumno           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include <unistd.h>

void\tft_putchar(char c)
{
\tint\tunused_counter;

\twrite(1, &c, 1);
}
`);

  const [report, setReport] = useState<NorminetteReport | null>(null);

  const analyzeCode = () => {
    const res = analyzeNorminette(codeSnippet);
    setReport(res);
  };

  const rulesList = [
    { title: "Encabezado Oficial", desc: "Todo archivo `.c` y `.h` debe incluir el header de 42 al inicio." },
    { title: "Límite 25 Líneas", desc: "Ninguna función puede superar las 25 líneas entre llaves `{}`." },
    { title: "Máximo 5 Funciones", desc: "Máximo 5 funciones por archivo de código fuente C." },
    { title: "Límite 4 Parámetros", desc: "Máximo 4 parámetros por prototipo/firma de función." },
    { title: "Variables no usadas", desc: "Toda variable local declarada debe utilizarse en el cuerpo." },
    { title: "Bucles Prohibidos", desc: "Prohibido `for`, `do-while`, `switch`, `case`, `goto`. Solo `while` e `if`." },
    { title: "Tabulaciones", desc: "Indentación obligatoria con tabulaciones (no espacios) entre tipos y nombres." },
    { title: "Límite 80 Columnas", desc: "Ninguna línea puede tener más de 80 caracteres de ancho." },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#4CAF50]/15 border border-[#4CAF50]/30 flex items-center justify-center text-[#4CAF50]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#ECEFF4]">Validador & Reglas de Norminette v3</h2>
            <p className="text-xs text-[#9FA7B8]">El estándar de estilo, límites de funciones y formato de código C de la Escuela 42.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Analyzer */}
        <div className="lg:col-span-2 bg-[#141927] border border-[#2A2F3C] rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#4CAF50] font-bold flex items-center gap-1.5">
              <Terminal className="w-4 h-4" />
              Simulador `norminette -R CheckForbiddenSourceHeader`
            </span>
            <button
              onClick={analyzeCode}
              className="px-4 py-2 bg-[#4CAF50] hover:bg-[#43a047] text-[#0b0f19] font-bold text-xs rounded-xl transition-all shadow-md shadow-[#4CAF50]/20 cursor-pointer"
            >
              Comprobar Norminette
            </button>
          </div>

          <textarea
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            rows={14}
            placeholder="Pega aquí tu código C con encabezado..."
            className="w-full bg-[#0b0f19] border border-[#2A2F3C] rounded-xl p-4 text-xs font-mono text-[#ECEFF4] focus:outline-none focus:border-[#4CAF50] resize-y leading-relaxed"
          />

          {/* Function Counter & Detected Function Summary */}
          {report && (
            <div className="space-y-4 pt-1">
              {/* Function count badge and listing */}
              <div className="bg-[#0b0f19] border border-[#2A2F3C] rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2A2F3C] pb-2.5">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#03A9F4]" />
                    <span className="text-xs font-mono font-bold text-[#ECEFF4]">
                      Funciones detectadas en el archivo:
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold border ${
                      report.functionCount <= 5
                        ? "bg-[#4CAF50]/15 text-[#4CAF50] border-[#4CAF50]/30"
                        : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                    }`}
                  >
                    {report.functionCount} / 5 máx. {report.functionCount > 5 ? "(¡Excedido!)" : "(Correcto)"}
                  </span>
                </div>

                {report.functions.length === 0 ? (
                  <div className="text-xs font-mono text-[#9FA7B8] italic">
                    No se detectaron definiciones de funciones con llaves de cuerpo.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {report.functions.map((fn, idx) => (
                      <div
                        key={idx}
                        className="bg-[#141927] border border-[#2A2F3C] rounded-lg p-3 text-xs font-mono space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#4CAF50] flex items-center gap-1.5">
                            <span className="text-[#9FA7B8]">#{idx + 1}</span> {fn.name}()
                          </span>
                          <span className="text-[11px] text-[#9FA7B8]">Línea {fn.line}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#9FA7B8]">
                          <span>
                            Parámetros:{" "}
                            <strong className={fn.paramCount > 4 ? "text-rose-400" : "text-[#ECEFF4]"}>
                              {fn.paramCount} {fn.paramCount > 4 ? "(> 4)" : ""}
                            </strong>
                          </span>
                          <span>•</span>
                          <span>
                            Líneas:{" "}
                            <strong className={fn.lineCount > 25 ? "text-rose-400" : "text-[#ECEFF4]"}>
                              {fn.lineCount} {fn.lineCount > 25 ? "(> 25)" : ""}
                            </strong>
                          </span>
                        </div>

                        {/* Unused variables summary */}
                        {fn.unusedVars.length > 0 ? (
                          <div className="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded">
                            ⚠️ Var no usada: {fn.unusedVars.join(", ")}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Detailed Norminette Issues List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#9FA7B8]">
                  Veredicto del Analizador:
                </h4>
                <div className="space-y-1.5">
                  {report.issues.map((res, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border text-xs font-mono flex items-start gap-2.5 ${
                        res.type === "error"
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                          : res.type === "warning"
                          ? "bg-[#FFC107]/10 border-[#FFC107]/30 text-[#FFC107]"
                          : "bg-[#4CAF50]/10 border-[#4CAF50]/30 text-[#4CAF50]"
                      }`}
                    >
                      {res.type === "error" && <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />}
                      {res.type === "warning" && <AlertCircle className="w-4 h-4 shrink-0 text-[#FFC107] mt-0.5" />}
                      {res.type === "ok" && <CheckCircle2 className="w-4 h-4 shrink-0 text-[#4CAF50] mt-0.5" />}
                      <span className="leading-relaxed">{res.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cheat-Sheet Rules list */}
        <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-[#ECEFF4] flex items-center gap-2">
            <FileCode className="w-4 h-4 text-[#03A9F4]" />
            Cheat-Sheet de Norminette
          </h3>

          <div className="space-y-3 overflow-y-auto max-h-[550px] pr-1">
            {rulesList.map((rule, idx) => (
              <div key={idx} className="p-3 bg-[#0b0f19] border border-[#2A2F3C] rounded-xl space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#03A9F4]/15 text-[#03A9F4] text-[11px] font-mono font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <h4 className="text-xs font-bold text-[#ECEFF4]">{rule.title}</h4>
                </div>
                <p className="text-xs text-[#9FA7B8] pl-7 leading-relaxed">{rule.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
