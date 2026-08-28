import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { loadContent, loadGraph } from "./server/contentParser";

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/content", (_req, res) => {
    try {
      const data = loadContent();
      res.json(data);
    } catch (err: any) {
      console.error("Error loading content:", err);
      res.status(500).json({ error: "Failed to load content", message: err.message });
    }
  });

  app.get("/api/graph", (_req, res) => {
    try {
      const graph = loadGraph();
      res.json(graph);
    } catch (err: any) {
      console.error("Error loading graph:", err);
      res.status(500).json({ error: "Failed to load graph", message: err.message });
    }
  });

  // AI Mentor endpoint for 42 Piscine questions (C logic, Norminette, peer-eval advice)
  app.post("/api/ai/ask", async (req, res) => {
    try {
      const { prompt, context } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const ai = getAI();
      if (!ai) {
        // Fallback local mock response if no API key is set
        return res.json({
          reply: `### 💡 Mentor Socrático · Piscina 42

**Analogía conceptual:**
Imagina la memoria RAM como una fila infinita de casilleros de correos numerados (*direcciones de memoria*). 
- El operador \`&\` es como leer el número grabado en la puerta del casillero.
- El operador \`*\` (*desreferenciación*) es como abrir la puerta para mirar o cambiar lo que hay dentro.

---

### 📚 Módulo y Conceptos Clave
- **Módulo relevante:** **C01 (Punteros Básicos)** y **C07 (Memoria Dinámica)**.
- **Conceptos:** *Punteros simples y dobles (\`**\`), paso por referencia, aritmética de punteros, y memoria dinámica en Heap vs Stack.*

---

### 🧩 Pistas & Fragmento Parcial (¡Sin soluciones completas!)
Recuerda que en la Piscina la autonomía es vital. Para modificar una variable desde otra función necesitas recibir su dirección:

\`\`\`c
void  ft_ejemplo_puntero(int *ptr)
{
    if (!ptr)
        return ;
    /* Modificamos el contenido de la dirección recibida */
    *ptr = 42; 
}
\`\`\`

---

### 🎯 Mini-Reto & Conexión con el Catálogo
**Tags:** \`#punteros\` \`#memoria\` \`#examshell\`

> **Desafío:** ¿Qué ocurre si desreferencias un puntero que apunta a \`NULL\` (\`*ptr\`)? ¿Por qué la terminal responde con *Segmentation fault (core dumped)*?
>
> 🔗 **Reto vinculado en el catálogo:** Ponlo a prueba en el reto **\`reto-c01-swap-int\` (ft_swap)** y **\`reto-c01-ft-ultimate-div-mod\`** para dominar el paso por referencia antes de saltar a los retos de **Examshell**.`
        });
      }

      // Load available catalog context to ground recommendations
      let catalogSummary = "";
      try {
        const content = loadContent();
        const modulesList = content.modules.map(m => `- ${m.id} (${m.title}): conceptos [${m.concepts.join(", ")}]`).join("\n");
        const challengesList = content.challenges.slice(0, 25).map(c => `- ${c.id} (${c.title}): tags [${c.tags.join(", ")}] en módulo ${c.module}`).join("\n");
        catalogSummary = `\n\nCATÁLOGO DISPONIBLE EN LA PLATAFORMA:\n- MÓDULOS:\n${modulesList}\n\n- RETOS DESTACADOS:\n${challengesList}\n- EXAMSHELL SIMULATOR: exámenes semanales de 4 horas con retos progresivos.\n`;
      } catch (e) {
        // Safe fallback if parser fails
      }

      const systemInstruction = `Eres el Mentor Socrático y Tutor de la Piscina de 42 Madrid / 42 School.
Tu misión es guiar al estudiante siguiendo con estricto rigor la pedagogía 42.

REGLAS PEDAGÓGICAS INQUEBRANTABLES:
1. 🚫 PROHIBIDO DAR CÓDIGO COMPLETO:
   - NUNCA proporciones una función completa terminada o la solución de código de un reto/ejercicio.
   - Ofrece ÚNICAMENTE fragmentos parciales mínimos (1 a 4 líneas), firmas conceptuales o esqueletos con \`/* tu lógica aquí */\`.
   - Explica siempre usando ANALOGÍAS VISUALES e intuitivas del mundo real (ej: casilleros numerados para memoria, punteros como direcciones postales, la torre de platos para el call stack, tickets de guardarropa para malloc/free).

2. 📌 REFERENCIA SIEMPRE MÓDULOS CONCRETOS Y CONCEPTOS TÉCNICOS:
   - En tu respuesta cita explícitamente el módulo o módulos de 42 correspondientes (ej: **Módulo C00 (Intro & write)**, **Módulo C01 (Punteros Básicos)**, **Módulo C02/C03 (Cadenas & Buffers)**, **Módulo C04/C05 (Conversión numérica & Recursión)**, **Módulo C06 (Argumentos CLI argv/argc)**, **Módulo C07 (Memoria Dinámica con malloc/free)**, **Módulo C08/C09 (Estructuras typedef struct & Librerías)**, **Módulo C10-C13 (File Descriptors, Listas Enlazadas & Árboles)** o **Examshell**).
   - Nombra explícitamente los conceptos técnicos involucrados: *punteros, memoria dinámica, aritmética de punteros, recursión, terminador nulo '\\0', stack vs heap, fugas de memoria (Valgrind), Norminette v3*.

3. 🎯 SECCIÓN FINAL DE MINI-RETO VINCULADO AL CATÁLOGO:
   - Toda respuesta debe concluir obligatoriamente con una sección:
     ### 🎯 Mini-Reto & Conexión con el Catálogo
   - Incluye los tags temáticos relevantes como hashtags (ej: \`#punteros\`, \`#memoria\`, \`#examshell\`, \`#recursion\`, \`#cadenas\`).
   - Plantea un mini-reto socrático para que el alumno reflexione o experimente en su terminal.
   - Vincula este desafío directamente a un ID y título de reto o examen real del catálogo (por ejemplo: \`reto-c01-swap-int\` (ft_swap), \`reto-c01-ft-ultimate-div-mod\`, \`reto-c02-ft-strcpy\`, \`reto-c04-ft-atoi\`, \`reto-c05-ft-recursive-factorial\`, \`reto-c07-ft-strdup\`, \`reto-c07-ft-split\`, o retos de \`examshell-retos\`).

4. 🛡️ ESTILO Y TONO:
   - Español claro, técnico, riguroso, motivador y directo.
   - Formato Markdown pulcro con títulos, negritas y bloques de código delimitados.${catalogSummary}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${systemInstruction}\n\nContexto actual del estudiante: ${context || "Preparación general Piscina 42"}\n\nPregunta o duda del alumno: ${prompt}`
              }
            ]
          }
        ]
      });

      res.json({ reply: response.text });
    } catch (err: any) {
      console.error("AI Ask error:", err);
      res.status(500).json({ error: "Error en el tutor IA", message: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🏊 Piscina42-web running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
