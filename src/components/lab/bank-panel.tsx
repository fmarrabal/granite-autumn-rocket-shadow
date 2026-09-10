"use client";

import { useMemo, useState } from "react";
import { runBank, type BankAgentId, type BankResult } from "@/lib/voxel-agent/bank";
import type { Copy } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function tone(pct: number) {
  if (pct >= 99) return "text-ok bg-ok/15";
  if (pct >= 70) return "text-ask bg-ask/15";
  return "text-ask bg-muted";
}

function actLine(a: { permiso: string; ask: string | null; killed: boolean; cites: boolean }) {
  return a.permiso + (a.ask ? `/${a.ask}` : "") + (a.killed ? " †" : "") + (a.cites ? " cite" : "");
}

export function BankPanel({ copy }: { copy: Copy }) {
  const [bank, setBank] = useState<BankResult | null>(() => runBank());
  const [openId, setOpenId] = useState("wrong_slot");
  const friday = useMemo(() => bank?.cases.find((c) => c.id === "wrong_slot") ?? null, [bank]);

  return (
    <section id="banco" className="rounded-[var(--radius-xl)] border border-border bg-card p-4 sm:p-5 lg:col-start-1">
      <h2 className="font-display text-lg">{copy.bankTitle}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{copy.bankHint}</p>
      <button
        type="button"
        className="mt-3 h-11 rounded-full border border-border px-4 text-sm"
        onClick={() => {
          setBank(runBank());
          setOpenId("wrong_slot");
        }}
      >
        {copy.bankRun}
      </button>
      {bank && (
        <>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-sm">
              <thead>
                <tr className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-2 pr-3 text-left font-medium">{copy.bankScore}</th>
                  <th className="pb-2 pr-3 text-left font-medium">{copy.bankPolicy}</th>
                  <th className="pb-2 text-right font-medium">{copy.bankHits}</th>
                </tr>
              </thead>
              <tbody>
                {bank.table.map((row) => {
                  const meta = copy.bankAgent[row.id];
                  return (
                    <tr key={row.id} className="border-t border-border">
                      <td className="py-2 pr-3 font-medium">{meta.name}</td>
                      <td className="py-2 pr-3 font-mono text-xs text-muted-foreground">{meta.family}</td>
                      <td className="py-2 text-right">
                        <span className={cn("font-mono text-xs", row.pct >= 99 ? "text-ok" : "text-ask")}>
                          {row.ok}/{row.n} · {row.pct.toFixed(0)}%
                        </span>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn("h-full", row.pct >= 99 ? "bg-ok" : row.pct >= 70 ? "bg-ask" : "bg-muted-foreground")}
                            style={{ width: `${Math.round(row.pct)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {friday && (
            <div className="mt-5 rounded-[var(--radius-md)] border border-border bg-background px-3 py-3">
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{copy.bankFriday}</p>
              <p className="mt-1 text-sm">{copy.bankCase.wrong_slot.why}</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">hazlo mejor → el viernes</p>
              <ul className="mt-3 space-y-2">
                {bank.table.map((row) => {
                  const payload = friday.agents[row.id as BankAgentId];
                  return (
                    <li key={row.id} className="flex flex-wrap items-baseline justify-between gap-2 border-t border-border pt-2 text-sm">
                      <span>
                        {copy.bankAgent[row.id].name}{" "}
                        <span className={cn("font-mono text-xs", payload.pass ? "text-ok" : "text-ask")}>
                          {payload.pass ? copy.pass : copy.fail}
                        </span>
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">{payload.acts.map(actLine).join(" → ")}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="mt-5 overflow-x-auto">
            <p className="mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">{copy.bankCaps}</p>
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: `8rem repeat(${bank.table.length}, minmax(3.5rem, 1fr))` }}
            >
              <div />
              {bank.table.map((row) => (
                <div key={row.id} className="px-1 text-center font-mono text-xs text-muted-foreground">
                  {copy.bankAgent[row.id].name.split(" ")[0]}
                </div>
              ))}
              {bank.capOrder.map((cap) => (
                <div key={cap} className="contents">
                  <div className="flex items-center font-mono text-xs text-muted-foreground">{copy.bankCap[cap]}</div>
                  {bank.table.map((row) => {
                    const cs = row.caps[cap];
                    return (
                      <div key={row.id + cap} className={cn("flex h-11 items-center justify-center rounded-[var(--radius-md)] font-mono text-xs", tone(cs.pct))}>
                        {cs.ok}/{cs.n}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{copy.bankCases}</p>
            {bank.cases.map((cse) => {
              const spec = copy.bankCase[cse.id];
              const open = openId === cse.id;
              return (
                <div key={cse.id} className="border-t border-border py-2">
                  <button
                    type="button"
                    className="flex min-h-11 w-full items-center justify-between gap-2 text-left text-sm"
                    onClick={() => setOpenId(open ? "" : cse.id)}
                    aria-expanded={open}
                  >
                    <span>{spec.title}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {copy.bankAgent.umbral.name.split("-")[0]} {cse.agents.umbral.pass ? copy.pass : copy.fail}
                    </span>
                  </button>
                  {open && (
                    <div className="pb-2">
                      <p className="text-sm text-muted-foreground">{spec.why}</p>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        {cse.turns.map((t) => (t ? `“${t}”` : "∅")).join(" → ")}
                      </p>
                      <ul className="mt-2 space-y-1">
                        {bank.table.map((row) => {
                          const payload = cse.agents[row.id as BankAgentId];
                          return (
                            <li key={row.id} className="font-mono text-xs">
                              <span className={payload.pass ? "text-ok" : "text-ask"}>{payload.pass ? copy.pass : copy.fail}</span>
                              {" · "}
                              {copy.bankAgent[row.id].name}
                              {" · "}
                              {payload.acts.map(actLine).join(" → ")}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{copy.bankNotThis}</p>
        </>
      )}
    </section>
  );
}
