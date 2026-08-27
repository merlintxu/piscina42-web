import React, { useState } from "react";
import { X, Sparkles, Send, Bot, User, Terminal, ShieldCheck, Flame, Loader2 } from "lucide-react";
import Markdown from "react-markdown";

interface AiMentorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  initialContext?: string;
}

export const AiMentorModal: React.FC<AiMentorModalProps> = ({
  isOpen,
  onClose,
  initialPrompt = "",
  initialContext = ""
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    {
      role: "assistant",
      text: "¡Hola, futuro piscínero! 🏊‍♂️ Soy tu **Tutor y Mentor de la Piscina de 42 Madrid**.\n\nPuedes preguntarme sobre punteros en C, aritmética de memoria, normas de la Norminette, consejos para los exámenes de los viernes, o pedirme pistas conceptuales para desbloquearte en cualquier reto sin hacer trampas."
    }
  ]);

  if (!isOpen) return null;

  const handleSend = async (customText?: string) => {
    const textToSend = customText || prompt;
    if (!textToSend.trim() || loading) return;

    const userMsg = { role: "user" as const, text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setPrompt("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToSend,
          context: initialContext || "Preparación general Piscina 42"
        })
      });

      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", text: data.reply || "No se ha recibido respuesta del tutor." }]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          text: "💡 [Consejo Piscina]: Recuerda que en 42 la primera fuente de conocimiento son tus compañeros (Peer-learning). Para avanzar con punteros: recuerda que `&` obtiene la dirección física en memoria y `*` accede al valor contenido."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "¿Cómo visualizo la memoria de un puntero a puntero (char **)?",
    "¿Cuáles son los 3 errores más típicos que hacen suspender la Norminette?",
    "¿Cómo prepararme mentalmente para el primer examen de 4h?",
    "Explícame ft_swap y paso por referencia con una analogía.",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#141927] border border-[#2A2F3C] w-full max-w-2xl h-[620px] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#2A2F3C] flex items-center justify-between bg-[#0b0f19]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#4CAF50]/15 border border-[#4CAF50]/30 flex items-center justify-center text-[#4CAF50]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#ECEFF4] flex items-center gap-2">
                Tutor Socrático · Piscina 42
                <span className="px-1.5 py-0.5 text-[9px] font-mono bg-[#4CAF50]/20 text-[#4CAF50] rounded">
                  GEMINI 2.5
                </span>
              </h3>
              <p className="text-[11px] text-[#9FA7B8]">Metodología 42: Pistas, memoria y peer-learning</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#141927] hover:bg-[#2A2F3C] text-[#9FA7B8] hover:text-[#ECEFF4]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat message list */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                msg.role === "user"
                  ? "bg-[#03A9F4]/20 text-[#03A9F4] border border-[#03A9F4]/30"
                  : "bg-[#4CAF50]/20 text-[#4CAF50] border border-[#4CAF50]/30"
              }`}>
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[82%] p-3.5 rounded-xl text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#03A9F4]/10 border border-[#03A9F4]/30 text-[#ECEFF4]"
                  : "bg-[#0b0f19] border border-[#2A2F3C] text-[#ECEFF4]"
              }`}>
                <div className="prose prose-invert prose-xs max-w-none prose-p:leading-relaxed prose-code:text-[#4CAF50] prose-pre:bg-[#141927]">
                  <Markdown>{msg.text}</Markdown>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#4CAF50]/20 text-[#4CAF50] flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-[#0b0f19] border border-[#2A2F3C] p-3 rounded-xl text-xs text-[#9FA7B8] flex items-center gap-2">
                <span>El mentor está formulando una pista socrática...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-2 border-t border-[#2A2F3C] bg-[#0b0f19]/40 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(qp)}
              className="px-2.5 py-1 bg-[#141927] hover:bg-[#1f283d] border border-[#2A2F3C] hover:border-[#4CAF50]/40 rounded-lg text-[#9FA7B8] hover:text-[#ECEFF4] whitespace-nowrap transition-all"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="p-3 border-t border-[#2A2F3C] bg-[#0b0f19] flex items-center gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Pregunta sobre C, punteros, Norminette o exámenes..."
            className="flex-1 bg-[#141927] border border-[#2A2F3C] rounded-xl px-3.5 py-2 text-xs text-[#ECEFF4] focus:outline-none focus:border-[#4CAF50]"
          />
          <button
            onClick={() => handleSend()}
            disabled={!prompt.trim() || loading}
            className="p-2 bg-[#4CAF50] hover:bg-[#43a047] disabled:opacity-40 text-[#0b0f19] rounded-xl font-bold transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
