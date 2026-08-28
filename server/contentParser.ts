import * as fs from "fs";
import * as path from "path";
import { ContentJSON, GraphData, GraphNode, GraphEdge, Phase, Module, Challenge, Resource, Habit, ExamSimulation } from "../src/types";

const repoRoot = process.cwd();
const contentRoot = path.join(repoRoot, "content");
const FM_REGEX = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;

function parseFrontmatter(raw: string): { data: Record<string, any>; content: string } {
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  raw = raw.replace(/\r\n/g, "\n");
  const m = raw.match(FM_REGEX);
  if (!m) return { data: {}, content: raw };
  const fmText = m[1];
  const body = m[2] || "";
  const data: Record<string, any> = {};
  const lines = fmText.split("\n");
  let i = 0;
  while (i < lines.length) {
    const ln = lines[i];
    if (!ln.trim() || ln.trim().startsWith("#")) {
      i++;
      continue;
    }
    const kv = ln.match(/^([\w.-]+):\s?(.*)$/);
    if (!kv) {
      i++;
      continue;
    }
    const key = kv[1];
    const val = kv[2];
    if (val === "" || val === undefined) {
      const list: string[] = [];
      let j = i + 1;
      while (j < lines.length && /^\s*-\s+/.test(lines[j])) {
        list.push(lines[j].replace(/^\s*-\s+/, "").trim());
        j++;
      }
      if (list.length) {
        data[key] = list;
        i = j;
        continue;
      }
      data[key] = "";
      i++;
      continue;
    }
    data[key] = coerce(val.trim());
    i++;
  }
  return { data, content: body.trim() };
}

function coerce(v: string): any {
  if (v === "true") return true;
  if (v === "false") return false;
  if (v === '""' || v === "''" || v === "") return "";
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  if (/^-?\d+$/.test(v)) return parseInt(v, 10);
  if (/^-?\d*\.\d+$/.test(v)) return parseFloat(v);
  return v;
}

function parseNote(raw: string): { data: any; content: string }[] {
  const wrapped = parseFrontmatter(raw);
  const wrapData = wrapped.data || {};
  const body = wrapped.content || "";

  if (wrapData.type !== "challenge-collection" && wrapData.type !== "resource-collection") {
    if (wrapData.id) return [{ data: wrapData, content: body }];
    return [];
  }

  const lines = body.split("\n");
  const blocks: string[] = [];
  let cur: string[] = [];
  let inBlock = false;
  for (const ln of lines) {
    const mm = ln.match(/^##\s+([\w-]+)\s*$/);
    if (mm) {
      if (inBlock && cur.length) blocks.push(cur.join("\n"));
      cur = [ln];
      inBlock = true;
    } else if (inBlock) {
      cur.push(ln);
    }
  }
  if (inBlock && cur.length) blocks.push(cur.join("\n"));

  const docs: { data: any; content: string }[] = [];
  for (const blk of blocks) {
    const fmStart = blk.indexOf("---");
    const subRaw = fmStart >= 0 ? blk.slice(fmStart) : blk;
    const sub = parseFrontmatter(subRaw);
    if (sub.data && sub.data.id) {
      docs.push({ data: sub.data, content: sub.content });
    }
  }
  return docs;
}

function readDirDocs(subdir: string): { data: any; content: string }[] {
  const dir = path.join(contentRoot, subdir);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .flatMap((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      return parseNote(raw);
    });
}

const asArray = (v: any): string[] => (Array.isArray(v) ? v : v ? [v] : []);
const asStr = (v: any, fallback = ""): string => (v == null ? fallback : String(v));
const asNum = (v: any): number | undefined => {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};
const asBool = (v: any): boolean | undefined => {
  if (v === true || v === false) return v;
  if (v === "true") return true;
  if (v === "false") return false;
  return undefined;
};

/**
 * Strips citation tokens like [web:...], [file:...], [cite:...], [web:110], [file:34]
 */
export function removeCitations(text: string): string {
  if (!text) return "";
  return text
    .replace(/\[(?:web|file|cite):[^\]]+\]/gi, "")
    .replace(/[ \t]+$/gm, "")
    .replace(/[ \t]{2,}/g, " ");
}

/**
 * Cleans module body:
 * 1. Removes citation tokens ([web:...], [file:...], [cite:...]).
 * 2. Excludes sections: "## Conceptos clave" and "## Dificultades cognitivas".
 * 3. Treats body exclusively as the module's "Descripción" (extracting description text
 *    and omitting redundant metadata sections like ## Retos vinculados / ## Recursos recomendados).
 */
export function cleanModuleBody(rawBody: string): string {
  if (!rawBody) return "";

  const cleaned = removeCitations(rawBody);
  const lines = cleaned.split("\n");

  // If there is an explicit "## Descripción" section, extract its content up to the next "## "
  const descIdx = lines.findIndex((l) => /^##\s+Descripci[oó]n/i.test(l.trim()));
  if (descIdx !== -1) {
    const descLines: string[] = [];
    for (let i = descIdx + 1; i < lines.length; i++) {
      const line = lines[i];
      if (/^##\s+/i.test(line.trim())) {
        break;
      }
      descLines.push(line);
    }
    const result = descLines.join("\n").trim();
    if (result.length > 0) {
      return result;
    }
  }

  // Otherwise, filter out Conceptos clave, Dificultades cognitivas, Retos vinculados, Recursos recomendados and H1
  const outputLines: string[] = [];
  let skipping = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (i === 0 && /^#\s+/.test(trimmed)) {
      continue;
    }

    if (/^##\s+(?:Conceptos\s+clave|Dificultades\s+cognitivas|Retos\s+vinculados|Recursos\s+recomendados)/i.test(trimmed)) {
      skipping = true;
      continue;
    }

    if (skipping && /^##?\s+/.test(trimmed)) {
      skipping = false;
      if (/^##\s+Descripci[oó]n/i.test(trimmed)) {
        continue;
      }
    }

    if (!skipping) {
      if (/^##\s+Descripci[oó]n/i.test(trimmed)) {
        continue;
      }
      outputLines.push(line);
    }
  }

  return outputLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Cleans phase body:
 * 1. Strips all citation markers ([web:...], [file:...], [cite:...]).
 * 2. Excludes "## Conceptos clave" and "## Dificultades cognitivas" if present.
 */
export function cleanPhaseBody(rawBody: string): string {
  if (!rawBody) return "";

  const cleaned = removeCitations(rawBody);
  const lines = cleaned.split("\n");
  const outputLines: string[] = [];
  let skipping = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (/^##\s+(?:Conceptos\s+clave|Dificultades\s+cognitivas)/i.test(trimmed)) {
      skipping = true;
      continue;
    }

    if (skipping && /^##?\s+/.test(trimmed)) {
      skipping = false;
    }

    if (!skipping) {
      outputLines.push(line);
    }
  }

  return outputLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function loadContent(): ContentJSON {
  const phases: Phase[] = readDirDocs("phases")
    .filter((d) => d.data.type === "phase")
    .map((d) => ({
      id: asStr(d.data.id),
      slug: asStr(d.data.slug, d.data.id),
      title: asStr(d.data.title),
      summary: removeCitations(asStr(d.data.summary)) || undefined,
      order: asNum(d.data.order),
      modules: asArray(d.data.modules),
      challenges: asArray(d.data.challenges),
      resources: asArray(d.data.resources),
      habits: asArray(d.data.habits),
      body: cleanPhaseBody(d.content),
    }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const modules: Module[] = readDirDocs("modules")
    .filter((d) => d.data.type === "module")
    .map((d) => ({
      id: asStr(d.data.id),
      slug: asStr(d.data.slug, d.data.id),
      title: asStr(d.data.title),
      phase: asStr(d.data.phase),
      order: asNum(d.data.order),
      level: (asStr(d.data.level, "basic") as Module["level"]),
      concepts: asArray(d.data.concepts).map(removeCitations),
      cognitive_difficulties: asArray(d.data.cognitive_difficulties).map(removeCitations),
      challenges: asArray(d.data.challenges),
      resources: asArray(d.data.resources),
      body: cleanModuleBody(d.content),
    }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const challenges: Challenge[] = readDirDocs("retos")
    .filter((d) => d.data.type === "challenge")
    .map((d) => ({
      id: asStr(d.data.id),
      slug: asStr(d.data.slug, d.data.id),
      title: asStr(d.data.title),
      module: asStr(d.data.module),
      phase: asStr(d.data.phase) || undefined,
      difficulty: (asStr(d.data.difficulty, "easy") as Challenge["difficulty"]),
      estimated_time_minutes: asNum(d.data.estimated_time_minutes),
      tags: asArray(d.data.tags),
      norminette_focus: asBool(d.data.norminette_focus),
      body: removeCitations(d.content),
    }));

  const resources: Resource[] = readDirDocs("recursos")
    .filter((d) => d.data.type)
    .map((d) => ({
      id: asStr(d.data.id),
      title: asStr(d.data.title),
      type: (asStr(d.data.type, "course") as Resource["type"]),
      url: asStr(d.data.url),
      description: removeCitations(asStr(d.data.description)) || undefined,
      modules: asArray(d.data.modules),
      phases: asArray(d.data.phases),
      language: asStr(d.data.language) || undefined,
      cost: (asStr(d.data.cost) || undefined) as Resource["cost"],
    }));

  const habits: Habit[] = readDirDocs("habits")
    .filter((d) => d.data.type === "habit")
    .map((d) => ({
      id: asStr(d.data.id),
      slug: asStr(d.data.slug, d.data.id),
      title: asStr(d.data.title),
      description: removeCitations(asStr(d.data.description)) || undefined,
      phases: asArray(d.data.phases),
      frequency: asStr(d.data.frequency) || undefined,
      metrics: asArray(d.data.metrics),
    }));

  let exams: ExamSimulation[] = [];
  const examFile = path.join(contentRoot, "retos", "exam-simulations.md");
  if (fs.existsSync(examFile)) {
    const raw = fs.readFileSync(examFile, "utf8");
    const wrapped = parseFrontmatter(raw);
    const parts = (wrapped.content || "").split(/\n---\n/);
    const blocks: string[] = [];
    for (const part of parts) {
      if (part.trim()) blocks.push("---\n" + part + "\n---");
    }
    if (wrapped.data && (wrapped.data.type === "ExamSimulation" || wrapped.data.type === "exam")) {
      blocks.unshift("---\n" + raw.replace(FM_REGEX, "$1") + "\n---");
    }
    const parsed = blocks
      .map((blk) => parseFrontmatter(blk))
      .filter((p) => p.data && (p.data.type === "ExamSimulation" || p.data.type === "exam"));

    exams = parsed.map((d) => ({
      id: asStr(d.data.id),
      slug: asStr(d.data.slug, d.data.id),
      title: asStr(d.data.title),
      description: removeCitations(asStr(d.data.description)) || undefined,
      phase: asStr(d.data.phase) || undefined,
      duration_minutes: asNum(d.data.duration_minutes) ?? 0,
      levels: asArray(d.data.levels),
      rules: asArray(d.data.rules).map(removeCitations),
    }));
  }

  return { phases, modules, challenges, resources, habits, exams };
}

export function loadGraph(): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const seen = new Set<string>();

  function addNode(n: GraphNode) {
    if (seen.has(n.id)) return;
    seen.add(n.id);
    nodes.push(n);
  }

  for (const d of readDirDocs("phases")) {
    if (d.data.type !== "phase") continue;
    addNode({ id: d.data.id, type: "phase", label: d.data.title, slug: d.data.slug });
    for (const m of asArray(d.data.modules)) edges.push({ source: d.data.id, target: m, rel: "has-module" });
    for (const c of asArray(d.data.challenges)) edges.push({ source: d.data.id, target: c, rel: "has-challenge" });
    for (const r of asArray(d.data.resources)) edges.push({ source: d.data.id, target: r, rel: "has-resource" });
    for (const h of asArray(d.data.habits)) edges.push({ source: d.data.id, target: h, rel: "has-habit" });
  }

  for (const d of readDirDocs("modules")) {
    if (d.data.type !== "module") continue;
    addNode({ id: d.data.id, type: "module", label: d.data.title, slug: d.data.slug });
    if (d.data.phase) edges.push({ source: d.data.id, target: d.data.phase, rel: "in-phase" });
    for (const c of asArray(d.data.challenges)) edges.push({ source: d.data.id, target: c, rel: "has-challenge" });
    for (const r of asArray(d.data.resources)) edges.push({ source: d.data.id, target: r, rel: "has-resource" });
  }

  for (const d of readDirDocs("retos")) {
    if (d.data.type !== "challenge") continue;
    addNode({ id: d.data.id, type: "challenge", label: d.data.title, slug: d.data.slug });
    if (d.data.module) edges.push({ source: d.data.id, target: d.data.module, rel: "in-module" });
    if (d.data.phase) edges.push({ source: d.data.id, target: d.data.phase, rel: "in-phase" });
  }

  for (const d of readDirDocs("recursos")) {
    if (!d.data.type) continue;
    addNode({ id: d.data.id, type: "resource", label: d.data.title, slug: d.data.id });
    for (const m of asArray(d.data.modules)) edges.push({ source: d.data.id, target: m, rel: "for-module" });
    for (const p of asArray(d.data.phases)) edges.push({ source: d.data.id, target: p, rel: "for-phase" });
  }

  for (const d of readDirDocs("habits")) {
    if (d.data.type !== "habit") continue;
    addNode({ id: d.data.id, type: "habit", label: d.data.title, slug: d.data.slug });
    for (const p of asArray(d.data.phases)) edges.push({ source: d.data.id, target: p, rel: "for-phase" });
  }

  const examFile = path.join(contentRoot, "retos", "exam-simulations.md");
  if (fs.existsSync(examFile)) {
    const raw = fs.readFileSync(examFile, "utf8");
    const wrapped = parseFrontmatter(raw);
    const parts = (wrapped.content || "").split(/\n---\n/);
    const blocks: string[] = [];
    for (const part of parts) if (part.trim()) blocks.push("---\n" + part + "\n---");
    if (wrapped.data && (wrapped.data.type === "ExamSimulation" || wrapped.data.type === "exam")) {
      blocks.unshift("---\n" + raw.replace(FM_REGEX, "$1") + "\n---");
    }
    for (const blk of blocks) {
      const p = parseFrontmatter(blk);
      if (p.data && (p.data.type === "ExamSimulation" || p.data.type === "exam")) {
        addNode({ id: p.data.id, type: "exam", label: p.data.title, slug: p.data.slug });
        if (p.data.phase) edges.push({ source: p.data.id, target: p.data.phase, rel: "for-phase" });
        for (const l of asArray(p.data.levels)) edges.push({ source: p.data.id, target: l, rel: "uses-challenge" });
      }
    }
  }

  return { nodes, edges };
}
