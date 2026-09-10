import React from "react";
import {
  AlertTriangle,
  Box,
  CheckCircle2,
  HelpCircle,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Terminal,
  Wifi,
  WifiOff,
  XCircle,
} from "lucide-react";
import {
  WorkstationToolCategory,
  WorkstationToolState,
  WorkstationToolStatus,
  WorkstationSnapshot,
} from "../workstation";
import {
  fetchWorkstationSnapshot,
  WorkstationClientError,
} from "../workstation/client";

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
  const [snapshot, setSnapshot] = React.useState<WorkstationSnapshot | null>(null);
  const [bridgeStatus, setBridgeStatus] = React.useState<"loading" | "online" | "degraded" | "offline">("loading");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const loadSnapshot = async () => {
    setIsRefreshing(true);
    try {
      const result = await fetchWorkstationSnapshot();
      setSnapshot(result.snapshot);
      setBridgeStatus(result.health.status === "ok" ? "online" : result.health.status);
      setErrorMessage(null);
    } catch (error) {
      setSnapshot(null);
      if (error instanceof WorkstationClientError && error.kind === "offline") {
        setBridgeStatus("offline");
        setErrorMessage("Local Training Bridge no disponible");
      } else {
        setBridgeStatus("degraded");
        setErrorMessage(
          error instanceof WorkstationClientError
            ? error.message
            : "No se pudo interpretar la respuesta del bridge.",
        );
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  React.useEffect(() => {
    void loadSnapshot();
  }, []);

  const statusLabel = {
    loading: "Bridge Loading",
    online: "Bridge Online",
    degraded: "Bridge Degraded",
    offline: "Bridge Offline",
  }[bridgeStatus];
  const StatusIcon = bridgeStatus === "offline" ? WifiOff : bridgeStatus === "loading" ? Loader2 : Wifi;
  const statusClassName = bridgeStatus === "online"
    ? "border-[#4CAF50]/30 bg-[#4CAF50]/10 text-[#71d174]"
    : bridgeStatus === "loading"
      ? "border-[#03A9F4]/30 bg-[#03A9F4]/10 text-[#7dd3fc]"
      : "border-amber-400/30 bg-amber-400/10 text-amber-300";

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

          <div className="flex flex-col items-stretch gap-3 sm:items-end">
            <span className={`inline-flex items-center gap-2 self-end rounded-full border px-3 py-1.5 text-xs font-bold ${statusClassName}`}>
              <StatusIcon className={`h-3.5 w-3.5 ${bridgeStatus === "loading" ? "animate-spin" : ""}`} aria-hidden="true" />
              {statusLabel}
            </span>
            <div className="flex items-center gap-4 rounded-xl border border-[#4CAF50]/30 bg-[#4CAF50]/10 px-5 py-4">
              {snapshot ? (
                <>
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
                </>
              ) : (
                <p className="max-w-xs text-sm text-[#C6CDDA]">Esperando datos de la workstation.</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-[#2A2F3C] pt-4 text-xs text-[#9FA7B8] sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          {snapshot ? (
            <>
              <span>
                Environment: <span className="text-[#C6CDDA]">{snapshot.environment}</span>
              </span>
              <span>
                Generated: <time dateTime={snapshot.generatedAt}>{snapshot.generatedAt}</time>
              </span>
            </>
          ) : (
            <span>{errorMessage ?? "Conectando con el bridge local..."}</span>
          )}
          <button
            type="button"
            onClick={() => void loadSnapshot()}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-[#3A4252] bg-[#1B2230] px-3 py-2 font-semibold text-[#ECEFF4] transition-colors hover:border-[#03A9F4]/60 hover:bg-[#202b3d] disabled:cursor-wait disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} aria-hidden="true" />
            Actualizar
          </button>
        </div>
      </section>

      {snapshot ? (
        <>
          {(() => {
            const dockerTool = snapshot.tools.find((tool) => tool.id === "docker");
            const dockerStatus = dockerTool?.status === "pass"
              ? "available"
              : dockerTool?.status === "warn"
                ? "degraded"
                : "unavailable";
            const sandboxStatus = dockerStatus === "available" ? "available" : "unavailable";
            const dockerReason = dockerTool?.message ?? "Docker runtime not available";

            return (
              <section className="grid gap-3 rounded-2xl border border-[#2A2F3C] bg-[#101622] p-5 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Box className="mt-0.5 h-5 w-5 shrink-0 text-[#03A9F4]" aria-hidden="true" />
                  <div>
                    <p className="font-mono text-[11px] font-bold tracking-[0.16em] text-[#9FA7B8]">WORKSTATION</p>
                    <div className="mt-1 flex items-center gap-2">
                      <h2 className="font-semibold text-[#ECEFF4]">Docker</h2>
                      <span className="text-xs uppercase text-[#9FA7B8]">Optional / {dockerStatus}</span>
                    </div>
                    {dockerTool?.version && <p className="mt-1 font-mono text-xs text-[#9FA7B8]">{dockerTool.version}</p>}
                  </div>
                </div>
                <div className="flex items-start gap-3 border-t border-[#2A2F3C] pt-3 md:border-l md:border-t-0 md:pl-5 md:pt-0">
                  <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
                  <div>
                    <p className="font-mono text-[11px] font-bold tracking-[0.16em] text-[#9FA7B8]">LOCAL MOULINETTE</p>
                    <div className="mt-1 flex items-center gap-2">
                      <h2 className="font-semibold text-[#ECEFF4]">Sandbox</h2>
                      <span className="text-xs uppercase text-[#9FA7B8]">{sandboxStatus}</span>
                    </div>
                    {sandboxStatus !== "available" && (
                      <p className="mt-1 text-xs text-[#9FA7B8]">Reason: {dockerReason}</p>
                    )}
                  </div>
                </div>
              </section>
            );
          })()}

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
        </>
      ) : (
        <section className="rounded-2xl border border-amber-400/30 bg-amber-400/[0.07] p-6 text-[#C6CDDA]">
          <div className="flex items-start gap-3">
            {bridgeStatus === "offline" ? (
              <WifiOff className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
            ) : (
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
            )}
            <div>
              <h2 className="font-semibold text-[#ECEFF4]">
                {bridgeStatus === "offline" ? "Local Training Bridge no disponible" : "Respuesta del bridge no válida"}
              </h2>
              <p className="mt-1 text-sm">
                {bridgeStatus === "offline"
                  ? "Arranca el proceso local para consultar el estado real de tu workstation."
                  : errorMessage}
              </p>
              {bridgeStatus === "offline" && (
                <code className="mt-3 inline-block rounded bg-[#111722] px-2 py-1 font-mono text-xs text-[#7dd3fc]">
                  npm run bridge:start
                </code>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
