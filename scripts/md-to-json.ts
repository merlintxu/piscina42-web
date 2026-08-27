// scripts/md-to-json.ts
import * as fs from "fs";
import * as path from "path";
import matter from "gray-matter";

type Phase = {
  id: string;
  type: "phase";
  title: string;
  modules?: string[];
  challenges?: string[];
  resources?: string[];
  habits?: string[];
  body: string;
};

type Module = {
  id: string;
  type: "module";
  title: string;
  phase: string;
  level: string;
  challenges?: string[];
  resources?: string[];
  body: string;
};

type Challenge = {
  id: string;
  type: "challenge";
  title: string;
  module: string;
  phase?: string;
  difficulty: string;
  estimated_time_minutes?: number;
  body: string;
};

type Resource = {
  id: string;
  type: "resource";
  title: string;
  url: string;
  modules?: string[];
  phases?: string[];
  language?: string;
  cost?: string;
  body: string;
};

type Habit = {
  id: string;
  type: "habit";
  title: string;
  phases?: string[];
  frequency?: string;
  metrics?: string[];
  body: string;
};

type ContentJSON = {
  phases: Phase[];
  modules: Module[];
  challenges: Challenge[];
  resources: Resource[];
  habits: Habit[];
};

const contentRoot = path.join(__dirname, "..", "content");

function readMarkdownDir(subdir: string) {
  const dirPath = path.join(contentRoot, subdir);
  if (!fs.existsSync(dirPath)) return [];
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith(".md"));
  return files.map(file => {
    const fullPath = path.join(dirPath, file);
    const raw = fs.readFileSync(fullPath, "utf8");
    const parsed = matter(raw);
    return { frontmatter: parsed.data as any, body: parsed.content.trim(), file };
  });
}

function buildJSON(): ContentJSON {
  const phases: Phase[] = readMarkdownDir("phases")
    .filter(f => f.frontmatter.type === "phase")
    .map(f => ({
      id: f.frontmatter.id,
      type: "phase",
      title: f.frontmatter.title,
      modules: f.frontmatter.modules || [],
      challenges: f.frontmatter.challenges || [],
      resources: f.frontmatter.resources || [],
      habits: f.frontmatter.habits || [],
      body: f.body,
    }));

  const modules: Module[] = readMarkdownDir("modules")
    .filter(f => f.frontmatter.type === "module")
    .map(f => ({
      id: f.frontmatter.id,
      type: "module",
      title: f.frontmatter.title,
      phase: f.frontmatter.phase,
      level: f.frontmatter.level,
      challenges: f.frontmatter.challenges || [],
      resources: f.frontmatter.resources || [],
      body: f.body,
    }));

  const challenges: Challenge[] = readMarkdownDir("retos")
    .filter(f => f.frontmatter.type === "challenge")
    .map(f => ({
      id: f.frontmatter.id,
      type: "challenge",
      title: f.frontmatter.title,
      module: f.frontmatter.module,
      phase: f.frontmatter.phase,
      difficulty: f.frontmatter.difficulty,
      estimated_time_minutes: f.frontmatter.estimated_time_minutes,
      body: f.body,
    }));

  const resources: Resource[] = readMarkdownDir("recursos")
    .filter(f => f.frontmatter.type === "resource")
    .map(f => ({
      id: f.frontmatter.id,
      type: "resource",
      title: f.frontmatter.title,
      url: f.frontmatter.url,
      modules: f.frontmatter.modules || [],
      phases: f.frontmatter.phases || [],
      language: f.frontmatter.language,
      cost: f.frontmatter.cost,
      body: f.body,
    }));

  const habits: Habit[] = readMarkdownDir("habits")
    .filter(f => f.frontmatter.type === "habit")
    .map(f => ({
      id: f.frontmatter.id,
      type: "habit",
      title: f.frontmatter.title,
      phases: f.frontmatter.phases || [],
      frequency: f.frontmatter.frequency,
      metrics: f.frontmatter.metrics || [],
      body: f.body,
    }));

  return { phases, modules, challenges, resources, habits };
}

function main() {
  const data = buildJSON();
  const outputDir = path.join(__dirname, "..", "app", "public");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const outPath = path.join(outputDir, "content.json");
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), "utf8");
  console.log("content.json generado en", outPath);
}

main();