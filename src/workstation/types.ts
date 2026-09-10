export type WorkstationToolCategory = "required" | "recommended" | "optional";

export type WorkstationToolState = "pass" | "warn" | "fail" | "unknown";

export interface WorkstationToolStatus {
  id: string;
  label: string;
  category: WorkstationToolCategory;
  installed: boolean;
  version?: string;
  path?: string;
  status: WorkstationToolState;
  message?: string;
}

export interface WorkstationSnapshot {
  generatedAt: string;
  platform: string;
  environment: string;
  tools: WorkstationToolStatus[];
  requiredPassed: number;
  requiredTotal: number;
  readinessPercent: number;
}

export interface WorkstationReadiness {
  requiredPassed: number;
  requiredTotal: number;
  readinessPercent: number;
}
