import { calculateWorkstationReadiness } from "./readiness";
import { WorkstationSnapshot, WorkstationToolStatus } from "./types";

export const mockWorkstationTools: WorkstationToolStatus[] = [
  { id: "wsl", label: "WSL", category: "required", installed: true, version: "2.4.13", status: "pass" },
  { id: "ubuntu", label: "Ubuntu", category: "required", installed: true, version: "24.04", status: "pass" },
  { id: "git", label: "Git", category: "required", installed: true, version: "2.43.0", status: "pass" },
  { id: "gcc", label: "GCC", category: "required", installed: true, version: "13.2.0", status: "pass" },
  { id: "clang", label: "Clang", category: "required", installed: true, version: "18.1.3", status: "warn", message: "Version review recommended." },
  { id: "make", label: "Make", category: "required", installed: true, version: "4.3", status: "pass" },
  { id: "norminette", label: "Norminette", category: "required", installed: false, status: "unknown", message: "Not checked yet." },
  { id: "gdb", label: "GDB", category: "required", installed: true, version: "14.2", status: "pass" },
  { id: "valgrind", label: "Valgrind", category: "required", installed: false, status: "fail", message: "Not installed." },
  { id: "node", label: "Node.js", category: "required", installed: true, version: "22.14.0", status: "pass" },
  { id: "npm", label: "npm", category: "required", installed: true, version: "10.9.2", status: "pass" },
  { id: "vim", label: "Vim", category: "recommended", installed: true, status: "pass" },
  { id: "tmux", label: "tmux", category: "recommended", installed: false, status: "unknown", message: "Not checked yet." },
  { id: "python3", label: "Python 3", category: "recommended", installed: true, version: "3.12.3", status: "pass" },
  { id: "pipx", label: "pipx", category: "recommended", installed: false, status: "unknown", message: "Not checked yet." },
  { id: "gh", label: "GitHub CLI", category: "recommended", installed: true, status: "warn", message: "Authentication not configured." },
  { id: "jq", label: "jq", category: "recommended", installed: false, status: "unknown", message: "Not checked yet." },
  { id: "ripgrep", label: "ripgrep", category: "recommended", installed: true, version: "14.1.0", status: "pass" },
  { id: "docker", label: "Docker", category: "optional", installed: false, status: "unknown", message: "Not checked yet." },
  { id: "ollama", label: "Ollama", category: "optional", installed: false, status: "unknown", message: "Not checked yet." },
];

const mockSnapshotBase = {
  generatedAt: "2026-09-08T00:00:00.000Z",
  platform: "Windows",
  environment: "WSL 2 / Ubuntu",
  tools: mockWorkstationTools,
};

export const mockWorkstationSnapshot: WorkstationSnapshot = {
  ...mockSnapshotBase,
  ...calculateWorkstationReadiness(mockSnapshotBase),
};
