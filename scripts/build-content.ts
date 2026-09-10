import * as fs from "fs";
import * as path from "path";
import { loadContent, loadGraph } from "../server/contentParser";

const content = loadContent();
const graph = loadGraph();

// Output to public/ directory for Vite
const publicDir = path.join(process.cwd(), "public");
fs.mkdirSync(publicDir, { recursive: true });

fs.writeFileSync(path.join(publicDir, "content.json"), JSON.stringify(content, null, 2), "utf8");
fs.writeFileSync(path.join(publicDir, "graph.json"), JSON.stringify(graph, null, 2), "utf8");

// Also output to app/public if requested
const appPublicDir = path.join(process.cwd(), "app", "public");
fs.mkdirSync(appPublicDir, { recursive: true });
fs.writeFileSync(path.join(appPublicDir, "content.json"), JSON.stringify(content, null, 2), "utf8");
fs.writeFileSync(path.join(appPublicDir, "graph.json"), JSON.stringify(graph, null, 2), "utf8");

console.log("✅ Generated content.json and graph.json successfully!");
console.log(`  Phases: ${content.phases.length}`);
console.log(`  Modules: ${content.modules.length}`);
console.log(`  Challenges: ${content.challenges.length}`);
console.log(`  Resources: ${content.resources.length}`);
console.log(`  Habits: ${content.habits.length}`);
console.log(`  Exams: ${content.exams.length}`);
console.log(`  Graph Nodes: ${graph.nodes.length}, Edges: ${graph.edges.length}`);
