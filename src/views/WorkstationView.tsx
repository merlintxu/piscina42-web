import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  Terminal,
  XCircle,
} from "lucide-react";
import {
  mockWorkstationSnapshot,
  WorkstationToolCategory,
  WorkstationToolState,
  WorkstationToolStatus,
} from "../workstation";

interface ToolGroup {
  category: WorkstationToolCategory;
  title: string;
  description: string;
}

const TOOL_GROUPS: ToolGroup[] = [
  {
    category: "required",
    title: "REQUIRED",
    description: "Estas herramientas determinan la readiness de la workstation.",
  },
  {
    category: "recommended",
    title: "RECOMMENDED",
    description: "Recomendadas para un flujo de trabajo más cómodo.",
  },
  {
    category: "optional",
    title: "OPTIONAL",
    description: "No afectan a la preparación base.",
  },
];

const STATUS_DETAILS: Record<
  WorkstationToolState,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  pass: {
    label: "Pass",
    icon: CheckCircle2,
    className: "border-[#4CAF50]/30 bg-[#4CAF50]/10 text-[#71d174]",
  },
  warn: {
    label: "Warning",
    icon: AlertTriangle,
    className: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  },
  fail: {
    label: "Fail",
    icon: XCircle,
    className: "border-rose-400/30 bg-rose-400/10 text-rose-300",
  },
  unknown: {
    label: "Unknown",
    icon: HelpCircle,
    className: "border-[#9FA7B8]/30 bg-[#9FA7B8]/10 text-[#C6CDDA]",
  },
};

function ToolStatusBadge({ status }: { status: WorkstationToolState }) {
  const { label, icon: Icon, className } = STATUS_DETAILS[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${className}`}
      aria-label={`Tool status: ${label}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}

function WorkstationToolCard({ tool }: { tool: WorkstationToolStatus }) {
  const isReadinessBlocker = tool.category === "required" && tool.status !== "pass";

  return (
    <li
      className={`rounded-xl border p-4 transition-colors ${
        isReadinessBlocker
          ? "border-rose-400/45 bg-rose-400/[0.07]"
          : "border-[#2A2F3C] bg-[#141927]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-[#ECEFF4]">{tool.label}</h3>
            {tool.version && (
              <span className="font-mono text-xs text-[#9FA7B8]">v{tool.version}</span>
            )}
          </div>
          {tool.message && <p className="mt-1 text-xs text-[#9FA7B8]">{tool.message}</p>}
        </div>
        <ToolStatusBadge status={tool.status} />
      </div>

      {isReadinessBlocker && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-rose-300">
          <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Blocks readiness</span>
        </div>
      )}
    </li>
  );
}

export const WorkstationView: React.FC = () => {
  const snapshot = mockWorkstationSnapshot;

  return (
    <div className="space-y-8 pb-16">
      <section className="overflow-hidden rounded-2xl border border-[#2A2F3C] bg-gradient-to-br from-[#141927] to-[#0f1523] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[#03A9F4]">
              <Terminal className="h-5 w-5" aria-hidden="true" />
              <span className="font-mono text-xs font-bold tracking-[0.2em]">LOCAL ENVIRONMENT</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#ECEFF4] sm:text-3xl">
              WORKSTATION READINESS
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[#9FA7B8]">
              Estado de preparación de la estación local para la Piscina 42.
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-[#4CAF50]/30 bg-[#4CAF50]/10 px-5 py-4">
            <div>
              <div className="font-mono text-3xl font-bold text-[#71d174]">
                {snapshot.readinessPercent}%
              </div>
              <p className="text-xs font-medium text-[#C6CDDA]">Required readiness</p>
            </div>
            <div className="border-l border-[#4CAF50]/30 pl-4 font-mono">
              <div className="text-lg font-bold text-[#ECEFF4]">
                {snapshot.requiredPassed} / {snapshot.requiredTotal}
              </div>
              <p className="text-[11px] text-[#9FA7B8]">required passed</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-1 border-t border-[#2A2F3C] pt-4 text-xs text-[#9FA7B8] sm:flex-row sm:items-center sm:gap-6">
          <span>
            Environment: <span className="text-[#C6CDDA]">{snapshot.environment}</span>
          </span>
          <span>
            Generated: <time dateTime={snapshot.generatedAt}>{snapshot.generatedAt}</time>
          </span>
        </div>
      </section>

      <div className="space-y-6">
        {TOOL_GROUPS.map((group) => {
          const tools = snapshot.tools.filter((tool) => tool.category === group.category);

          return (
            <section key={group.category} aria-labelledby={`${group.category}-tools-heading`}>
              <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <h2
                  id={`${group.category}-tools-heading`}
                  className="font-mono text-sm font-bold tracking-[0.16em] text-[#ECEFF4]"
                >
                  {group.title}
                </h2>
                <p className="text-xs text-[#9FA7B8]">{group.description}</p>
              </div>
              <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {tools.map((tool) => (
                  <WorkstationToolCard key={tool.id} tool={tool} />
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
};
