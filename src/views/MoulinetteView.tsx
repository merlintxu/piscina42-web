import React, { useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CircleDashed,
  Code2,
  Loader2,
  Play,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import {
  MoulinetteClientError,
  submitMoulinetteSource,
  validateMoulinetteSource,
  type MoulinetteCheck,
  type MoulinetteProfile,
  type MoulinetteResponse,
} from "../moulinette/client";

const INITIAL_SOURCE = `int main(void)
{
    return (0);
}`;

const STATUS_META = {
  pass: { label: "PASS", icon: CheckCircle2, className: "text-[#71d174] border-[#4CAF50]/35 bg-[#4CAF50]/10" },
  fail: { label: "FAIL", icon: XCircle, className: "text-rose-300 border-rose-400/35 bg-rose-400/10" },
  skipped: { label: "SKIPPED", icon: CircleDashed, className: "text-[#C6CDDA] border-[#9FA7B8]/35 bg-[#9FA7B8]/10" },
  error: { label: "ERROR", icon: AlertCircle, className: "text-amber-300 border-amber-400/35 bg-amber-400/10" },
} as const;

function CheckRow({ check }: { check: MoulinetteCheck }) {
  const meta = STATUS_META[check.status];
  const Icon = meta.icon;
  return (
    <li className="border-b border-[#2A2F3C] py-3 last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-sm text-[#ECEFF4]">{check.type}</span>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide ${meta.className}`}>
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          {meta.label}
        </span>
      </div>
      <p className="mt-1 text-xs text-[#9FA7B8]">{check.message}</p>
    </li>
  );
}

export const MoulinetteView: React.FC = () => {
  const [challengeId, setChallengeId] = useState("reto-local");
  const [profile, setProfile] = useState<MoulinetteProfile>("compile-only");
  const [source, setSource] = useState(INITIAL_SOURCE);
  const [state, setState] = useState<"idle" | "running" | "pass" | "fail" | "error" | "bridge-offline" | "busy">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<MoulinetteResponse | null>(null);
  const submissionActive = useRef(false);

  const profileDescription = profile === "standard"
    ? "Runs compile, strict flags, Norminette, functional and memory checks."
    : "Runs compile, strict flags and functional checks.";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (state === "running" || submissionActive.current) return;
    const validationError = validateMoulinetteSource(challengeId, source);
    if (validationError) {
      setState("error");
      setMessage(validationError);
      setResult(null);
      return;
    }

    submissionActive.current = true;
    setState("running");
    setMessage(null);
    setResult(null);
    try {
      const response = await submitMoulinetteSource(challengeId, profile, source);
      setResult(response);
      setState(response.job.finalResult === "pass" ? "pass" : response.job.finalResult === "fail" ? "fail" : "error");
    } catch (error) {
      if (error instanceof MoulinetteClientError) {
        setState(error.kind === "offline" ? "bridge-offline" : error.kind === "busy" ? "busy" : "error");
        setMessage(error.message);
      } else {
        setState("error");
        setMessage("Moulinette execution failed.");
      }
    } finally {
      submissionActive.current = false;
    }
  };

  return (
    <section className="mx-auto max-w-6xl pb-12">
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#4CAF50]">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Local execution lane
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#ECEFF4] sm:text-4xl">LOCAL MOULINETTE</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#9FA7B8]">
            Send one controlled C source to the local training bridge and inspect every check.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-[#03A9F4]/25 bg-[#03A9F4]/10 px-3 py-2 text-xs text-[#B9E8FF]">
          <Code2 className="h-4 w-4" aria-hidden="true" />
          <span>Execution runs locally inside the isolated Moulinette sandbox.</span>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <form onSubmit={handleSubmit} className="rounded-xl border border-[#2A2F3C] bg-[#141927] p-5 shadow-2xl shadow-black/10">
          <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#9FA7B8]">Challenge ID</span>
              <input
                value={challengeId}
                onChange={(event) => setChallengeId(event.target.value)}
                className="w-full rounded-lg border border-[#2A2F3C] bg-[#0b0f19] px-3 py-2.5 font-mono text-sm text-[#ECEFF4] outline-none transition focus:border-[#4CAF50]"
                placeholder="reto-c01-swap-int"
                aria-label="Challenge ID"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#9FA7B8]">Profile</span>
              <select
                value={profile}
                onChange={(event) => setProfile(event.target.value as MoulinetteProfile)}
                className="w-full rounded-lg border border-[#2A2F3C] bg-[#0b0f19] px-3 py-2.5 font-mono text-sm text-[#ECEFF4] outline-none focus:border-[#4CAF50]"
                aria-label="Moulinette profile"
              >
                <option value="compile-only">compile-only</option>
                <option value="standard">standard</option>
              </select>
            </label>
          </div>

          <div className="mt-5 overflow-hidden rounded-lg border border-[#2A2F3C] bg-[#0b0f19]">
            <div className="flex items-center justify-between border-b border-[#2A2F3C] px-4 py-2.5">
              <span className="font-mono text-xs font-bold text-[#ECEFF4]">main.c</span>
              <span className="font-mono text-[10px] text-[#9FA7B8]">C SOURCE · 32 KB MAX</span>
            </div>
            <textarea
              value={source}
              onChange={(event) => setSource(event.target.value)}
              spellCheck={false}
              className="min-h-[340px] w-full resize-y bg-transparent p-4 font-mono text-sm leading-6 text-[#D8DEE9] outline-none"
              aria-label="C source code"
            />
          </div>

          <div className="mt-4 flex flex-col justify-between gap-4 border-t border-[#2A2F3C] pt-4 sm:flex-row sm:items-center">
            <p className="text-xs text-[#9FA7B8]">{profileDescription}</p>
            <button
              type="submit"
              disabled={state === "running"}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#4CAF50] px-4 py-2.5 text-sm font-bold text-[#0b0f19] transition hover:bg-[#71d174] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {state === "running" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
              {state === "running" ? "Running..." : "Run Moulinette"}
            </button>
          </div>
        </form>

        <aside className="rounded-xl border border-[#2A2F3C] bg-[#141927] p-5">
          <div className="flex items-start justify-between gap-4 border-b border-[#2A2F3C] pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#9FA7B8]">Run result</p>
              <h2 className="mt-1 font-mono text-xl font-bold text-[#ECEFF4]">{result?.job.finalResult ?? "idle"}</h2>
            </div>
            <span className="rounded-md border border-[#2A2F3C] px-2 py-1 font-mono text-[10px] uppercase text-[#9FA7B8]">{result?.job.status ?? state}</span>
          </div>

          {message && (
            <div className={`mt-4 rounded-lg border px-3 py-2.5 text-sm ${state === "bridge-offline" || state === "error" ? "border-rose-400/30 bg-rose-400/10 text-rose-200" : "border-amber-400/30 bg-amber-400/10 text-amber-200"}`} role="alert">
              {message}
            </div>
          )}

          {result ? (
            <ul className="mt-3">
              {result.job.checks.map((check) => <CheckRow key={check.type} check={check} />)}
            </ul>
          ) : (
            <div className="flex min-h-[260px] flex-col items-center justify-center text-center text-[#9FA7B8]">
              <CircleDashed className="mb-3 h-8 w-8 text-[#03A9F4]" aria-hidden="true" />
              <p className="text-sm">No run yet.</p>
              <p className="mt-1 text-xs">Submit the controlled source when you are ready.</p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
};
