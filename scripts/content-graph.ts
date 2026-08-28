// scripts/content-graph.ts
// Genera app/public/graph.json: grafo de contenido (nodos + edges) desde las
// relaciones por id del frontmatter de content/. Se usa en la web React para
// dibujar el grafo de conocimiento (alternativa al grafo de Obsidian, dentro
// del repo y versionable como dato).
//
// Ejecución (desde scripts/):
//   ./node_modules/.bin/tsc -p tsconfig.json && node dist/content-graph.js
//
// El parser de frontmatter es el mismo enfoque tolerante que md-to-json.ts.

import * as fs from "fs";
import * as path from "path";

const repoRoot = path.resolve(__dirname, "..", "..");
const contentRoot = path.join(repoRoot, "content");
const FM_REGEX = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;

type Node = { id: string; type: string; label: string; slug?: string };
type Edge = { source: string; target: string; rel: string };

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
    if (!ln.trim() || ln.trim().startsWith("#")) { i++; continue; }
    const kv = ln.match(/^([\w.-]+):\s?(.*)$/);
    if (!kv) { i++; continue; }
    const key = kv[1];
    const val = kv[2];
    if (val === "" || val === undefined) {
      const list: string[] = [];
      let j = i + 1;
      while (j < lines.length && /^\s*-\s+/.test(lines[j])) {
        list.push(lines[j].replace(/^\s*-\s+/, "").trim());
        j++;
      }
      data[key] = list.length ? list : "";
      i = j;
      continue;
    }
    data[key] = val.trim();
    i++;
  }
  return { data, content: body.trim() };
}

function readDirDocs(subdir: string): { data: any; content: string }[] {
  const dir = path.join(contentRoot, subdir);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .flatMap((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const wrapped = parseFrontmatter(raw);
      const wd = wrapped.data || {};
      if (wd.type === "challenge-collection" || wd.type === "resource-collection") {
        // expandir bloques hijo `## id` + fm
        const rawBlocks: string[] = [];
        const bl = wrapped.content.split("\n");
        let cur: string[] = [];
        let inB = false;
        for (const ln of bl) {
          if (/^##\s+[\w-]+\s*$/.test(ln)) {
            if (inB && cur.length) rawBlocks.push(cur.join("\n"));
            cur = [ln]; inB = true;
          } else if (inB) cur.push(ln);
        }
        if (inB && cur.length) rawBlocks.push(cur.join("\n"));
        const subs = rawBlocks.map((blk) => {
          const fs2 = blk.indexOf("---");
          return parseFrontmatter(fs2 >= 0 ? blk.slice(fs2) : blk);
        });
        return subs.filter((s) => s.data && s.data.id);
      }
      return wrapped.data.id ? [wrapped] : [];
    });
}

const asArray = (v: any): string[] => (Array.isArray(v) ? v : v ? [v] : []);

const nodes: Node[] = [];
const edges: Edge[] = [];
const seen = new Set<string>();

function addNode(n: Node) {
  if (seen.has(n.id)) return;
  seen.add(n.id);
  nodes.push(n);
}

// Phase
for (const d of readDirDocs("phases")) {
  if (d.data.type !== "phase") continue;
  addNode({ id: d.data.id, type: "phase", label: d.data.title, slug: d.data.slug });
  for (const m of asArray(d.data.modules)) edges.push({ source: d.data.id, target: m, rel: "has-module" });
  for (const c of asArray(d.data.challenges)) edges.push({ source: d.data.id, target: c, rel: "has-challenge" });
  for (const r of asArray(d.data.resources)) edges.push({ source: d.data.id, target: r, rel: "has-resource" });
  for (const h of asArray(d.data.habits)) edges.push({ source: d.data.id, target: h, rel: "has-habit" });
}
// Module
for (const d of readDirDocs("modules")) {
  if (d.data.type !== "module") continue;
  addNode({ id: d.data.id, type: "module", label: d.data.title, slug: d.data.slug });
  if (d.data.phase) edges.push({ source: d.data.id, target: d.data.phase, rel: "in-phase" });
  for (const c of asArray(d.data.challenges)) edges.push({ source: d.data.id, target: c, rel: "has-challenge" });
  for (const r of asArray(d.data.resources)) edges.push({ source: d.data.id, target: r, rel: "has-resource" });
}
// Challenge
for (const d of readDirDocs("retos")) {
  if (d.data.type !== "challenge") continue;
  addNode({ id: d.data.id, type: "challenge", label: d.data.title, slug: d.data.slug });
  if (d.data.module) edges.push({ source: d.data.id, target: d.data.module, rel: "in-module" });
  if (d.data.phase) edges.push({ source: d.data.id, target: d.data.phase, rel: "in-phase" });
}
// Resource
for (const d of readDirDocs("recursos")) {
  if (!d.data.type) continue;
  addNode({ id: d.data.id, type: "resource", label: d.data.title, slug: d.data.id });
  for (const m of asArray(d.data.modules)) edges.push({ source: d.data.id, target: m, rel: "for-module" });
  for (const p of asArray(d.data.phases)) edges.push({ source: d.data.id, target: p, rel: "for-phase" });
}
// Habit
for (const d of readDirDocs("habits")) {
  if (d.data.type !== "habit") continue;
  addNode({ id: d.data.id, type: "habit", label: d.data.title, slug: d.data.slug });
  for (const p of asArray(d.data.phases)) edges.push({ source: d.data.id, target: p, rel: "for-phase" });
}
// ExamSimulation (bloques --- fm --- en exam-simulations.md)
{
  const raw = fs.readFileSync(path.join(contentRoot, "retos", "exam-simulations.md"), "utf8");
  const wrapped = parseFrontmatter(raw);
  const parts = (wrapped.content || "").split(/\n---\n/);
  const blocks: string[] = [];
  for (const part of parts) if (part.trim()) blocks.push("---\n" + part + "\n---");
  if (wrapped.data && wrapped.data.type === "ExamSimulation") blocks.unshift("---\n" + raw.replace(FM_REGEX, "$1") + "\n---");
  for (const blk of blocks) {
    const p = parseFrontmatter(blk);
    if (p.data && p.data.type === "ExamSimulation") {
      addNode({ id: p.data.id, type: "exam", label: p.data.title, slug: p.data.slug });
      if (p.data.phase) edges.push({ source: p.data.id, target: p.data.phase, rel: "for-phase" });
      for (const l of asArray(p.data.levels)) edges.push({ source: p.data.id, target: l, rel: "uses-challenge" });
    }
  }
}

const graph = { nodes, edges };
const outDir = path.join(repoRoot, "app", "public");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "graph.json"), JSON.stringify(graph, null, 2), "utf8");
console.log(`graph.json generado: ${nodes.length} nodos, ${edges.length} edges`);
