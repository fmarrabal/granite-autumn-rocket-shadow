"use client";

import type { CognitiveSnap } from "@/lib/voxel-agent/cognition";
import type { Copy } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Beat = "percepto" | "prediccion" | "discrepancia" | "acto";

export function beatOf(cog: CognitiveSnap, hasTurn: boolean): Beat | null {
  if (!hasTurn) return null;
  if (cog.error || cog.prediction_ok === false) return "discrepancia";
  if (cog.permiso === "cerrar") return "acto";
  if (cog.prediction) return "prediccion";
  return "percepto";
}

export function CycleStrip({ copy, cog, hasTurn }: { copy: Copy; cog: CognitiveSnap; hasTurn: boolean }) {
  const beat = beatOf(cog, hasTurn);
  const items: { id: Beat; label: string }[] = [
    { id: "percepto", label: copy.beatPercept },
    { id: "prediccion", label: copy.beatPredict },
    { id: "discrepancia", label: copy.beatMismatch },
    { id: "acto", label: copy.beatAct },
  ];
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{copy.cycleTitle}</p>
      <ol className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {items.map((item, i) => {
          const on = beat === item.id;
          return (
            <li
              key={item.id}
              aria-current={on ? "step" : undefined}
              className={cn(
                "rounded-[var(--radius-md)] border px-3 py-2",
                on ? "border-primary bg-muted text-foreground" : "border-border text-muted-foreground",
                on && item.id === "discrepancia" && "text-ask",
                on && item.id === "acto" && "text-ok",
              )}
            >
              <span className="font-mono text-xs tracking-wider uppercase opacity-70">{String(i + 1).padStart(2, "0")}</span>
              <p className="font-mono text-xs uppercase tracking-wider">{item.label}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Slot({ label, value, empty }: { label: string; value: string | null; empty: string }) {
  const filled = Boolean(value);
  return (
    <div className={cn("rounded-[var(--radius-md)] border px-3 py-2", filled ? "border-ok/40" : "border-border")}>
      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("mt-1 truncate font-mono text-sm", filled ? "text-foreground" : "text-muted-foreground")}>
        {value ?? empty}
      </p>
    </div>
  );
}

export function SituationPanel({ copy, cog, hasTurn }: { copy: Copy; cog: CognitiveSnap; hasTurn: boolean }) {
  const alive = cog.hypotheses.filter((h) => h.alive);
  const dead = cog.hypotheses.filter((h) => !h.alive);
  const lastCommit = cog.commitments[cog.commitments.length - 1];
  return (
    <section id="modelo" className="rounded-[var(--radius-xl)] border border-border bg-card p-4 sm:p-5">
      <CycleStrip copy={copy} cog={cog} hasTurn={hasTurn} />
      <h2 className="mt-5 font-display text-lg">{copy.modelTitle}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{copy.modelHint}</p>
      <p className="mt-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {copy.tipoLab} · <span className="text-foreground">{hasTurn ? cog.tipo : "—"}</span>
        <span className="mt-1 block normal-case tracking-normal">
          {copy.workspaceOf(copy.modeWord[cog.workspace_mode])}
        </span>
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Slot label={copy.slotCriterio} value={cog.slots.criterio} empty={copy.slotEmpty} />
        <Slot label={copy.slotFecha} value={cog.slots.fecha} empty={copy.slotEmpty} />
        <Slot label={copy.slotRest} value={cog.slots.restriccion} empty={copy.slotEmpty} />
      </div>
      <div
        className={cn(
          "mt-3 rounded-[var(--radius-md)] border px-3 py-2",
          cog.error ? "border-ask/40" : "border-border",
        )}
      >
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{copy.predictionLab}</p>
        {cog.error ? (
          <p className="mt-1 font-mono text-xs leading-relaxed text-ask">{cog.error}</p>
        ) : (
          <p className="mt-1 font-mono text-sm">{cog.prediction ?? copy.noPrediction}</p>
        )}
      </div>
      <p className="mt-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">{copy.hypotheses}</p>
      {cog.hypotheses.length === 0 ? (
        <p className="mt-1 text-sm text-muted-foreground">—</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {[...alive, ...dead].map((h, i) => (
            <li
              key={`${h.id}-${h.alive ? "a" : "d"}-${i}`}
              className={cn("rounded-[var(--radius-md)] border px-3 py-2", h.alive ? "border-ok/40" : "border-border")}
            >
              <div className="flex items-baseline justify-between gap-2 font-mono text-xs uppercase tracking-wider">
                <span className={h.alive ? "text-ok" : "text-muted-foreground"}>{h.alive ? copy.hypAlive : copy.hypDead}</span>
                <span className="text-muted-foreground">
                  {copy.modeWord[h.mode]} · {h.posterior.toFixed(2)}
                </span>
              </div>
              <p className="mt-1 text-sm">{copy.hypClaim[h.id] ?? h.claim}</p>
              {h.killed_by && <p className="mt-1 font-mono text-xs text-ask">{h.killed_by}</p>}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">{copy.commitment}</p>
      {lastCommit ? (
        <p className="mt-1 rounded-[var(--radius-md)] border border-ok/40 px-3 py-2 text-sm leading-relaxed">
          {lastCommit.when} → {lastCommit.require}
          <span className="mt-1 block font-mono text-xs text-muted-foreground">{lastCommit.last_value}</span>
        </p>
      ) : (
        <p className="mt-1 text-sm text-muted-foreground">{copy.commitEmpty}</p>
      )}
    </section>
  );
}
