"use client";

import { useEffect, useState } from "react";
import { Ban, Copy as CopyIcon, Play, RotateCcw } from "lucide-react";
import { LiveSlice } from "@/components/lab/slice-map";
import { SituationPanel } from "@/components/lab/situation-model";
import { BankPanel } from "@/components/lab/bank-panel";
import {
  CLOSE_BLOCK,
  FEAR_BLOCK,
  FRUST_BLOCK,
  IRA_BLOCK,
  RISK_BLOCK,
  VoxelAgent,
  runEval,
  turnTape,
  type EvalCheck,
  type Permiso,
  type TurnResult,
} from "@/lib/voxel-agent/engine";
import { COPY, displayReply, readLocale, writeLocale, type Copy, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const AGAIN = new Set(["Hazlo mejor otra vez", "Make it better again"]);

function meterColor(d: number) {
  if (d >= 0.42) return "bg-ask";
  if (d >= 0.28) return "bg-muted-foreground";
  return "bg-ok";
}
function permisoTone(p: Permiso) {
  if (p === "cerrar") return "text-ok";
  if (p === "buscar") return "text-ask";
  return "text-primary";
}

export function LabApp() {
  const [lang, setLang] = useState<Locale>("es");
  const copy = COPY[lang];
  const [seed, setSeed] = useState(7);
  const [freezeB, setFreezeB] = useState(false);
  const [forceD, setForceD] = useState(false);
  const [forceR, setForceR] = useState(false);
  const [forceF, setForceF] = useState(false);
  const [forceFr, setForceFr] = useState(false);
  const [forceIra, setForceIra] = useState(false);
  const [useWarp, setUseWarp] = useState(true);
  const [liveBody, setLiveBody] = useState(true);
  const [agent, setAgent] = useState(() => new VoxelAgent({ seed: 7, useWarp: true, liveBody: true }));
  const [text, setText] = useState("");
  const [turn, setTurn] = useState<TurnResult | null>(null);
  const [evalChecks, setEvalChecks] = useState<EvalCheck[] | null>(null);
  const [status, setStatus] = useState(COPY.es.idleNote);
  const [live, setLive] = useState(true);
  const [epoch, setEpoch] = useState(0);
  const [tour, setTour] = useState(0);
  const [copied, setCopied] = useState(false);
  const [log, setLog] = useState<{ text: string; label: string; permiso: Permiso; gate: string; reply: string }[]>([]);

  useEffect(() => {
    const next = readLocale();
    setLang(next);
    writeLocale(next);
    setStatus(COPY[next].idleNote);
  }, []);

  const chooseLang = (next: Locale) => {
    setLang(next);
    writeLocale(next);
    if (!turn) setStatus(COPY[next].idleNote);
  };

  const rebuild = (patch: Record<string, unknown> = {}) => {
    const nextFreeze = (patch.freezeB as boolean | undefined) ?? freezeB;
    const nextForce = (patch.forceD as boolean | undefined) ?? forceD;
    const nextSeed = (patch.seed as number | undefined) ?? seed;
    const nextWarp = (patch.useWarp as boolean | undefined) ?? useWarp;
    const nextLive = (patch.liveBody as boolean | undefined) ?? liveBody;
    const nextForceR = (patch.forceR as boolean | undefined) ?? forceR;
    const nextForceF = (patch.forceF as boolean | undefined) ?? forceF;
    const nextForceFr = (patch.forceFr as boolean | undefined) ?? forceFr;
    const nextForceIra = (patch.forceIra as boolean | undefined) ?? forceIra;
    const a = new VoxelAgent({
      seed: nextSeed,
      freezeB: nextFreeze,
      forceD: nextForce ? 0 : null,
      useWarp: nextWarp,
      liveBody: nextLive,
      forceR: nextForceR ? 0 : null,
      forceF: nextForceF ? 0 : null,
      forceFr: nextForceFr ? 0 : null,
      forceIra: nextForceIra ? 0 : null,
    });
    setAgent(a);
    setTurn(null);
    setEvalChecks(null);
    setStatus(copy.rebuilt);
    setLog([]);
    setEpoch((n) => n + 1);
    if (patch.resetTour) setTour(0);
  };

  const run = (value: string, label?: string) => {
    const prompt = resolvePrompt(value);
    if (!prompt) return;
    let nextTour = tour;
    if (label && AGAIN.has(label) && agent.pending) {
      agent.recordOutcome(0.9, "corrected");
      if (copy.tour[nextTour]?.record === "corrected") nextTour += 1;
    }
    const r = agent.step(prompt);
    setTurn({ ...r });
    const reply = displayReply(lang, r);
    if (r.cost >= 0.2 || r.attr > 0.01) setStatus(copy.memoryPushed(r.cost, r.attr));
    else setStatus("");
    setLog((rows) =>
      [{ text: prompt, label: label || copy.samples.find((s) => s.text === prompt)?.label || prompt, permiso: r.permiso, gate: r.blockedBy?.id ?? "—", reply }, ...rows].slice(0, 10),
    );
    const s = copy.tour[nextTour];
    if (s?.chip === prompt && (!s.chipLabel || s.chipLabel === label)) nextTour += 1;
    if (nextTour !== tour) setTour(nextTour);
    const el = document.getElementById("modelo");
    if (el && window.matchMedia("(max-width: 1023px)").matches) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const record = (kind: "ok" | "corrected") => {
    if (!turn) return;
    agent.recordOutcome(kind === "corrected" ? 0.9 : 0.15, kind);
    if (kind === "ok" && turn.permiso !== "cerrar") setStatus(copy.censored);
    else setStatus(kind === "corrected" ? copy.corrected : copy.observed);
    setAgent(agent);
    setTurn({ ...turn });
    if (copy.tour[tour]?.record === kind) setTour((n) => n + 1);
  };

  const copyTurn = async () => {
    if (!turn) return;
    const blob = JSON.stringify(turnTape(turn), null, 2);
    try {
      await navigator.clipboard.writeText(blob);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = blob;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
    if (copy.tour[tour]?.copy) setTour((n) => n + 1);
  };

  const tourStep = copy.tour[tour];
  const duda = turn ? copy.dudaWord[turn.dudaLabel] ?? turn.dudaLabel : "—";
  const tag = turn ? copy.tagWord[turn.tag] ?? turn.tag : "";
  const cog = turn?.cog ?? agent.mind.snapshot();

  return (
    <div className="min-h-dvh overflow-x-hidden bg-background text-foreground">
      <header className="border-b border-border px-4 py-5 sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">{copy.controlBus}</p>
            <h1 className="mt-2 font-display text-3xl font-medium tracking-tight sm:text-4xl">Umbral-C</h1>
          </div>
          <div role="radiogroup" aria-label={copy.langLabel} className="flex shrink-0 rounded-full border border-border p-1">
            {(["es", "en"] as const).map((code) => (
              <button
                key={code}
                type="button"
                role="radio"
                aria-checked={lang === code}
                className={cn("h-11 min-w-11 rounded-full px-3 font-mono text-xs tracking-wider", lang === code ? "bg-muted text-foreground" : "text-muted-foreground")}
                onClick={() => chooseLang(code)}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{copy.lede}</p>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="rounded-[var(--radius-xl)] border border-border bg-card p-4 sm:p-5">
          <label htmlFor="prompt" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {copy.consigna}
          </label>
          <textarea
            id="prompt"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={copy.placeholder}
            rows={3}
            className="mt-2 w-full resize-y rounded-[var(--radius-md)] border border-border bg-background px-3 py-3 text-base leading-relaxed outline-none placeholder:text-muted-foreground"
          />
          <div className="mt-3 rounded-[var(--radius-md)] border border-border bg-background px-3 py-3">
            {tourStep ? (
              <>
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{copy.stepOf(tour + 1, copy.tour.length)}</p>
                <p className="mt-1 text-sm font-medium">{tourStep.do}</p>
                <p className="mt-1 text-xs text-muted-foreground">{tourStep.see}</p>
              </>
            ) : (
              <>
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{copy.tourDone}</p>
                <p className="mt-1 text-sm">{copy.tourDoneBody}</p>
              </>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {copy.samples.map((s) => {
              const on = tourStep?.chipLabel ? tourStep.chipLabel === s.label : !!tourStep?.chip && tourStep.chip === s.text;
              return (
                <button
                  key={s.label}
                  type="button"
                  className={cn("h-11 rounded-full border px-3 text-sm", on ? "border-primary bg-muted text-foreground" : "border-border text-muted-foreground hover:bg-muted")}
                  onClick={() => {
                    setText(s.text);
                    run(s.text, s.label);
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm text-background"
              onClick={() => run(text.trim() || tourStep?.chip || "cuanto es 2+2", tourStep?.chipLabel)}
            >
              <Play className="size-4" />
              {copy.run}
            </button>
            <button type="button" className={cn("h-11 rounded-full border border-border px-3 text-sm", tourStep?.record === "corrected" && "ring-2 ring-ring")} onClick={() => record("corrected")} disabled={!turn}>
              {copy.recordCorrection}
            </button>
            <button type="button" className={cn("h-11 rounded-full border border-border px-3 text-sm", tourStep?.record === "ok" && "ring-2 ring-ring")} onClick={() => record("ok")} disabled={!turn}>
              {copy.recordObserved}
            </button>
            <button type="button" className="inline-flex h-11 items-center gap-2 rounded-full px-3 text-sm text-muted-foreground" onClick={() => rebuild({ resetTour: true })}>
              <RotateCcw className="size-4" />
              {copy.reset}
            </button>
            <button type="button" className={cn("inline-flex h-11 items-center gap-2 rounded-full px-3 text-sm text-muted-foreground", tourStep?.copy && "ring-2 ring-ring")} onClick={() => void copyTurn()} disabled={!turn}>
              <CopyIcon className="size-4" />
              {copied ? copy.copied : copy.copyTurn}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{copy.runHint}</p>
        </section>

        <aside className="flex flex-col gap-6 lg:col-start-2 lg:row-span-4 lg:self-start lg:sticky lg:top-4">
        <SituationPanel copy={copy} cog={cog} hasTurn={!!turn} />

        <section id="permiso" className="rounded-[var(--radius-xl)] border border-border bg-card p-4 sm:p-5">
          <h2 className="font-display text-lg">{copy.permiso}</h2>
          {turn && (
            <p className="mt-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {copy.thisPrompt}
              <span className="mt-1 block font-sans text-sm font-medium normal-case tracking-normal text-foreground">
                {copy.samples.find((s) => s.text === turn.text)?.label ?? turn.text}
              </span>
              <span className="mt-0.5 block normal-case tracking-normal text-muted-foreground">“{turn.text}”</span>
            </p>
          )}
          <p className={cn("mt-3 font-display text-4xl font-medium tracking-tight", turn ? permisoTone(turn.permiso) : "text-muted-foreground")}>
            {turn ? copy.permisoWord[turn.permiso] : copy.idle}
          </p>
          {turn && (
            <p className={cn("mt-3 rounded-[var(--radius-md)] border px-3 py-2 font-mono text-xs leading-relaxed", turn.blockedBy ? "border-ask/40 text-ask" : "border-border text-ok")}>
              {gateLine(copy, turn)}
            </p>
          )}
          {turn && <p className="mt-3 text-sm leading-relaxed">{displayReply(lang, turn)}</p>}
          <p className="mt-2 text-sm text-muted-foreground">{status}</p>
          {log.length > 0 && (
            <details className="mt-3 rounded-[var(--radius-md)] border border-border bg-background px-3 py-2">
              <summary className="min-h-11 cursor-pointer font-mono text-xs uppercase tracking-wider text-muted-foreground">
                {copy.sessionLog} · {log.length}
              </summary>
              <ul className="mt-2 space-y-2">
                {log.map((row, i) => (
                  <li key={`${row.text}-${i}`} className="border-t border-border pt-2 text-sm">
                    <p className="font-medium">{row.label}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      “{row.text}” · {copy.permisoWord[row.permiso]} · {row.gate}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{row.reply}</p>
                  </li>
                ))}
              </ul>
            </details>
          )}
          {turn && (
            <p className="mt-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {copy.controlTag} · <span className="text-foreground">{tag}</span>
            </p>
          )}
          <details className="mt-4 rounded-[var(--radius-md)] border border-border bg-background px-3 py-2" open={Boolean(turn?.blockedBy)}>
            <summary className="min-h-11 cursor-pointer font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {copy.gatesTitle}
            </summary>
            <div className="space-y-3 pb-2">
              <Meter label={copy.meterD} value={turn?.d ?? 0} extra={duda + (turn && Math.abs(turn.attr) > 0.004 ? ` · Δ ${turn.attr >= 0 ? "+" : ""}${turn.attr.toFixed(3)}` : "")} tone={meterColor(turn?.d ?? 0)} />
              <Meter label={copy.meterR} value={turn?.r ?? 0} extra={`${copy.blocks} ${RISK_BLOCK}`} tone={meterColor(turn?.r ?? 0)} />
              <Meter label={copy.meterF} value={turn?.f ?? 0} extra={`≥ ${FEAR_BLOCK}`} tone={meterColor(turn?.f ?? 0)} />
              <Meter label={copy.meterFr} value={turn?.fr ?? 0} extra={`≥ ${FRUST_BLOCK}`} tone={meterColor(turn?.fr ?? 0)} />
              <Meter label={copy.meterIra} value={turn?.ira ?? 0} extra={`≥ ${IRA_BLOCK}`} tone={meterColor(turn?.ira ?? 0)} />
              <div className="mt-3 flex justify-between font-mono text-xs text-muted-foreground">
                <span>d_base {turn ? turn.dBase.toFixed(3) : "—"}</span>
                <span>Δ {turn ? `${turn.attr >= 0 ? "+" : ""}${turn.attr.toFixed(3)}` : "—"}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 font-mono text-xs text-muted-foreground">
                <span>eco {turn ? turn.cost.toFixed(2) : "—"}</span>
                <span>win {turn ? turn.windowEnergy.toFixed(3) : "—"}</span>
                <span>
                  {copy.climate} {turn ? turn.climate.toFixed(2) : "—"}
                </span>
                <span>stakes {turn ? turn.stakes.toFixed(2) : "—"}</span>
                <span>h {turn ? turn.h.toFixed(2) : "—"}</span>
                <span>{copy.mute}</span>
              </div>
            </div>
          </details>
          {turn && turn.permiso !== "cerrar" && (turn.d >= CLOSE_BLOCK || turn.r >= RISK_BLOCK || turn.f >= FEAR_BLOCK || turn.fr >= FRUST_BLOCK || turn.ira >= IRA_BLOCK) && (
            <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
              <Ban className="mt-0.5 size-4 shrink-0" />
              {copy.blocked}
            </p>
          )}
          {turn && (
            <details className="mt-4">
              <summary className="cursor-pointer font-mono text-xs uppercase tracking-wider text-muted-foreground">{copy.tape}</summary>
              <p className="mt-1 text-xs text-muted-foreground">{copy.tapeHint}</p>
              <pre className="mt-2 max-h-48 overflow-auto rounded-[var(--radius-md)] border border-border bg-background p-3 font-mono text-xs">{JSON.stringify(turnTape(turn), null, 2)}</pre>
            </details>
          )}
        </section>
        </aside>

        <section className="rounded-[var(--radius-xl)] border border-border bg-card p-4 sm:p-5 lg:col-start-1">
          <details className="rounded-[var(--radius-md)] border border-border bg-background px-3 py-1">
            <summary className="flex h-11 cursor-pointer items-center font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {copy.advanced}
            </summary>
            <div className="flex flex-wrap gap-x-4 gap-y-2 pb-2 font-mono text-xs text-muted-foreground">
            <label className="flex h-11 items-center gap-2">
              <input type="checkbox" checked={freezeB} onChange={(e) => { setFreezeB(e.target.checked); rebuild({ freezeB: e.target.checked }); }} />
              {copy.freezeEdges}
            </label>
            {(
              [
                ["forceD", forceD, setForceD, copy.forceD],
                ["forceR", forceR, setForceR, copy.forceR],
                ["forceF", forceF, setForceF, copy.forceF],
                ["forceFr", forceFr, setForceFr, copy.forceFr],
                ["forceIra", forceIra, setForceIra, copy.forceIra],
              ] as const
            ).map(([k, v, set, lab]) => (
              <label key={k} className="flex h-11 items-center gap-2">
                <input
                  type="checkbox"
                  checked={v}
                  onChange={(e) => {
                    set(e.target.checked);
                    rebuild({ [k]: e.target.checked });
                  }}
                />
                {lab}
              </label>
            ))}
            <label className="flex h-11 items-center gap-2">
              <input type="checkbox" checked={useWarp} onChange={(e) => { setUseWarp(e.target.checked); rebuild({ useWarp: e.target.checked }); }} />
              {copy.warpOn}
            </label>
            <label className="flex h-11 items-center gap-2">
              <input type="checkbox" checked={liveBody} onChange={(e) => { setLiveBody(e.target.checked); rebuild({ liveBody: e.target.checked }); }} />
              {copy.aperiodic}
            </label>
            </div>
          </details>
          <div className="mt-4">
            <LiveSlice
              agent={agent}
              live={live}
              epoch={epoch}
              onToggle={() => setLive((v) => !v)}
              copy={copy}
              turn={turn}
              highlightPulse={!!tourStep?.pulse}
              onPulse={() => {
                if (copy.tour[tour]?.pulse) setTour((n) => n + 1);
              }}
            />
          </div>
        </section>

        <section className="rounded-[var(--radius-xl)] border border-border bg-card p-4 sm:p-5 lg:col-start-1">
          <h2 className="font-display text-lg">{copy.eval}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{copy.evalHint}</p>
          <button
            type="button"
            className="mt-3 h-11 rounded-full border border-border px-4 text-sm"
            onClick={() => setEvalChecks(runEval())}
          >
            {copy.runChecks}
          </button>
          {evalChecks && (
            <ul className="mt-3 space-y-1 font-mono text-xs">
              {evalChecks.map((c) => (
                <li key={c.name} className={c.ok ? "text-ok" : "text-ask"}>
                  {c.ok ? copy.pass : copy.fail} · {c.name} · {c.detail}
                </li>
              ))}
            </ul>
          )}
          <h2 className="mt-6 font-display text-lg">{copy.memory}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{copy.memoryHint(agent.episodes.length)}</p>
          {agent.episodes.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">{copy.memoryEmpty}</p>
          ) : (
            <ul className="mt-2 space-y-1 font-mono text-xs">
              {agent.episodes.slice(-6).map((ep, i) => (
                <li key={i}>
                  {ep.text} · {ep.outcome} · d*={ep.d_star}
                </li>
              ))}
            </ul>
          )}
          <label className="mt-4 block font-mono text-xs uppercase tracking-wider text-muted-foreground">{copy.seed}</label>
          <input
            type="number"
            value={seed}
            onChange={(e) => {
              const n = Number(e.target.value) || 7;
              setSeed(n);
              rebuild({ seed: n });
            }}
            className="mt-1 h-11 w-24 rounded-[var(--radius-md)] border border-border bg-background px-3"
          />
        </section>

        <BankPanel copy={copy} />
      </div>
    </div>
  );
}

function Meter({ label, value, extra, tone }: { label: string; value: number; extra: string; tone: string }) {
  return (
    <div>
      <div className="flex justify-between font-mono text-xs uppercase tracking-wider text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums">
          {value.toFixed(3)} · {extra}
        </span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full", tone)} style={{ width: `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%` }} />
      </div>
    </div>
  );
}

function gateLine(copy: Copy, turn: TurnResult) {
  const g = turn.blockedBy;
  if (!g) return copy.gateNone;
  const excess = g.value - g.block;
  const extra = turn.also.length ? ` · ${copy.gateAlso} ${turn.also.join(", ")}` : "";
  return `${copy.gateBlocked}: ${g.id} (${g.value.toFixed(2)} ≥ ${g.block} · Δ${excess >= 0 ? "+" : ""}${excess.toFixed(2)})${extra}`;
}

const PROMPT_ALIAS: Record<string, string> = {
  "2 + 2": "cuanto es 2+2",
  "2+2": "cuanto es 2+2",
  "what is 2+2": "cuanto es 2+2",
  "make it better": "hazlo mejor",
  "book it": "reservalo",
  friday: "reservalo el viernes",
  "nps > 50": "hazlo mejor, el criterio es NPS > 50",
  "choose cheap": "barato. el lujo no. prioriza precio",
  "elige barato": "barato. el lujo no. prioriza precio",
};

function resolvePrompt(raw: string) {
  const t = raw.trim();
  const k = t.toLowerCase().replace(/\s+/g, " ");
  return PROMPT_ALIAS[k] ?? t;
}
