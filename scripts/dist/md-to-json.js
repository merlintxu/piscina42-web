"use strict";
// scripts/md-to-json.ts
//
// Pipeline Markdown -> JSON para Piscina42-web.
// Recorre content/ y construye un ContentJSON con el schema refinado:
//   { phases, modules, challenges, resources, habits, exams }
//
// Decisiones de parseo (ver meta/CONTENT-PLAN.md - ANEXO):
//  - La entidad se infiere por carpeta + `type` de frontmatter.
//  - Las colecciones (challenge-collection / resource-collection) contienen
//    varios bloques `## <id>` con su propio frontmatter; se expanden.
//  - exam-simulations.md es una colección de 6 ExamSimulation sin envoltura.
//  - Parser de frontmatter propio (no js-yaml) para tolerar `:` en valores
//    sin comillas y mezcla CRLF/LF del repo.
//
// Ejecución:
//   node dist/md-to-json.js   (tras: cd scripts && ./node_modules/.bin/tsc -p tsconfig.json)
//   Dependencias en scripts/ (typescript, solo build-time).
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const repoRoot = path.resolve(__dirname, "..", ".."); // scripts/dist -> repo
const contentRoot = path.join(repoRoot, "content");
// ---------------------------------------------------------------------------
// Parser de frontmatter propio
// ---------------------------------------------------------------------------
// Normalizamos BOM y CRLF antes de aplicar un regex LF-puro.
const FM_REGEX = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;
function parseFrontmatter(raw) {
    if (raw.charCodeAt(0) === 0xfeff)
        raw = raw.slice(1);
    raw = raw.replace(/\r\n/g, "\n");
    const m = raw.match(FM_REGEX);
    if (!m)
        return { data: {}, content: raw };
    const fmText = m[1];
    const body = m[2] || "";
    const data = {};
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
            const list = [];
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
function coerce(v) {
    if (v === "true")
        return true;
    if (v === "false")
        return false;
    if (v === '""' || v === "''" || v === "")
        return "";
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        return v.slice(1, -1);
    }
    if (/^-?\d+$/.test(v))
        return parseInt(v, 10);
    if (/^-?\d*\.\d+$/.test(v))
        return parseFloat(v);
    return v;
}
/**
 * Parsea un documento de nota de content/.
 * 1) Nota individual: `---` fm `---` body.
 * 2) Colección: fm de envoltura (type: *-collection) + en el body bloques
 *    `## <id>` cada uno con su propio frontmatter.
 */
function parseNote(raw) {
    const wrapped = parseFrontmatter(raw);
    const wrapData = wrapped.data || {};
    const body = wrapped.content || "";
    if (wrapData.type !== "challenge-collection" && wrapData.type !== "resource-collection") {
        if (wrapData.id)
            return [{ data: wrapData, content: body }];
        return [];
    }
    const lines = body.split("\n");
    const blocks = [];
    let cur = [];
    let inBlock = false;
    for (const ln of lines) {
        const mm = ln.match(/^##\s+([\w-]+)\s*$/);
        if (mm) {
            if (inBlock && cur.length)
                blocks.push(cur.join("\n"));
            cur = [ln];
            inBlock = true;
        }
        else if (inBlock) {
            cur.push(ln);
        }
    }
    if (inBlock && cur.length)
        blocks.push(cur.join("\n"));
    const docs = [];
    for (const blk of blocks) {
        // El bloque es `## <id>\n\n---\nfm\n---\nbody`; el fm arranca en el primer `---`.
        const fmStart = blk.indexOf("---");
        const subRaw = fmStart >= 0 ? blk.slice(fmStart) : blk;
        const sub = parseFrontmatter(subRaw);
        if (sub.data && sub.data.id) {
            docs.push({ data: sub.data, content: sub.content });
        }
    }
    return docs;
}
function readDirDocs(subdir) {
    const dir = path.join(contentRoot, subdir);
    if (!fs.existsSync(dir))
        return [];
    return fs
        .readdirSync(dir)
        .filter((f) => f.endsWith(".md"))
        .flatMap((file) => {
        const raw = fs.readFileSync(path.join(dir, file), "utf8");
        return parseNote(raw);
    });
}
// Helpers de normalización
const asArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const asStr = (v, fallback = "") => (v == null ? fallback : String(v));
const asNum = (v) => {
    if (v == null || v === "")
        return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
};
const asBool = (v) => {
    if (v === true || v === false)
        return v;
    if (v === "true")
        return true;
    if (v === "false")
        return false;
    return undefined;
};
// ---------------------------------------------------------------------------
// Build por tipo
// ---------------------------------------------------------------------------
function buildPhases() {
    return readDirDocs("phases")
        .filter((d) => d.data.type === "phase")
        .map((d) => ({
        id: asStr(d.data.id),
        slug: asStr(d.data.slug, d.data.id),
        title: asStr(d.data.title),
        summary: asStr(d.data.summary) || undefined,
        order: asNum(d.data.order),
        modules: asArray(d.data.modules),
        challenges: asArray(d.data.challenges),
        resources: asArray(d.data.resources),
        habits: asArray(d.data.habits),
        body: d.content,
    }));
}
function buildModules() {
    return readDirDocs("modules")
        .filter((d) => d.data.type === "module")
        .map((d) => ({
        id: asStr(d.data.id),
        slug: asStr(d.data.slug, d.data.id),
        title: asStr(d.data.title),
        phase: asStr(d.data.phase),
        order: asNum(d.data.order),
        level: asStr(d.data.level, "basic"),
        concepts: asArray(d.data.concepts),
        cognitive_difficulties: asArray(d.data.cognitive_difficulties),
        challenges: asArray(d.data.challenges),
        resources: asArray(d.data.resources),
        body: d.content,
    }));
}
function buildChallenges() {
    return readDirDocs("retos")
        .filter((d) => d.data.type === "challenge")
        .map((d) => ({
        id: asStr(d.data.id),
        slug: asStr(d.data.slug, d.data.id),
        title: asStr(d.data.title),
        module: asStr(d.data.module),
        phase: asStr(d.data.phase) || undefined,
        difficulty: asStr(d.data.difficulty, "easy"),
        estimated_time_minutes: asNum(d.data.estimated_time_minutes),
        tags: asArray(d.data.tags),
        norminette_focus: asBool(d.data.norminette_focus),
        body: d.content,
    }));
}
function buildResources() {
    return readDirDocs("recursos")
        .filter((d) => d.data.type)
        .map((d) => ({
        id: asStr(d.data.id),
        title: asStr(d.data.title),
        type: asStr(d.data.type, "course"),
        url: asStr(d.data.url),
        description: asStr(d.data.description) || undefined,
        modules: asArray(d.data.modules),
        phases: asArray(d.data.phases),
        language: asStr(d.data.language) || undefined,
        cost: (asStr(d.data.cost) || undefined),
    }));
}
function buildHabits() {
    return readDirDocs("habits")
        .filter((d) => d.data.type === "habit")
        .map((d) => ({
        id: asStr(d.data.id),
        slug: asStr(d.data.slug, d.data.id),
        title: asStr(d.data.title),
        description: asStr(d.data.description) || undefined,
        phases: asArray(d.data.phases),
        frequency: asStr(d.data.frequency) || undefined,
        metrics: asArray(d.data.metrics),
    }));
}
function buildExams() {
    const raw = fs.readFileSync(path.join(contentRoot, "retos", "exam-simulations.md"), "utf8");
    // El archivo es una colección de ExamSimulation donde cada entidad tiene su
    // propio bloque `---` fm `---`. Tomamos el fm de envoltura (exam-sim-1) y
    // luego dividimos el resto por delimitadores `---` para extraer los demás.
    const wrapped = parseFrontmatter(raw);
    const blocks = [];
    // El cuerpo tras el primer fm puede contener más bloques `--- fm ---`.
    const rest = wrapped.content || "";
    const parts = rest.split(/\n---\n/);
    for (const part of parts) {
        if (part.trim())
            blocks.push("---\n" + part + "\n---");
    }
    // También incluimos el fm de envoltura como bloque propio.
    if (wrapped.data && wrapped.data.type === "ExamSimulation") {
        blocks.unshift("---\n" + raw.replace(FM_REGEX, "$1") + "\n---");
    }
    const parsed = blocks
        .map((blk) => parseFrontmatter(blk))
        .filter((p) => p.data && p.data.type === "ExamSimulation");
    return parsed.map((d) => ({
        id: asStr(d.data.id),
        slug: asStr(d.data.slug, d.data.id),
        title: asStr(d.data.title),
        description: asStr(d.data.description) || undefined,
        phase: asStr(d.data.phase) || undefined,
        duration_minutes: asNum(d.data.duration_minutes) ?? 0,
        levels: asArray(d.data.levels),
        rules: asArray(d.data.rules),
    }));
}
// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
    const data = {
        phases: buildPhases().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        modules: buildModules().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        challenges: buildChallenges(),
        resources: buildResources(),
        habits: buildHabits(),
        exams: buildExams(),
    };
    const outDir = path.join(repoRoot, "app", "public");
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, "content.json");
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2), "utf8");
    console.log(`content.json generado en ${outPath}\n` +
        `  phases:    ${data.phases.length}\n` +
        `  modules:   ${data.modules.length}\n` +
        `  challenges:${data.challenges.length}\n` +
        `  resources: ${data.resources.length}\n` +
        `  habits:    ${data.habits.length}\n` +
        `  exams:     ${data.exams.length}`);
    return data;
}
if (require.main === module) {
    main();
}
