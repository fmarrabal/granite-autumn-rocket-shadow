"use client";

import { useEffect, useRef } from "react";
import {
  CLOSE_BLOCK,
  FEAR_BLOCK,
  FRUST_BLOCK,
  IRA_BLOCK,
  RISK_BLOCK,
  type TurnResult,
  type VoxelAgent,
} from "@/lib/voxel-agent/engine";
import type { Copy } from "@/lib/i18n";

const GATES = [
  { id: "d", block: CLOSE_BLOCK },
  { id: "r", block: RISK_BLOCK },
  { id: "f", block: FEAR_BLOCK },
  { id: "fr", block: FRUST_BLOCK },
  { id: "ira", block: IRA_BLOCK },
] as const;

type Labels = Pick<
  Copy,
  | "couplingTitle"
  | "couplingHint"
  | "couplingVoxels"
  | "couplingReadout"
  | "couplingGates"
  | "couplingStageField"
  | "couplingStageRead"
  | "couplingStageGate"
  | "couplingDrag"
  | "couplingBus"
  | "couplingManda"
>;

function gateValue(turn: TurnResult | null, id: string) {
  if (!turn) return 0;
  if (id === "d") return turn.d;
  if (id === "r") return turn.r;
  if (id === "f") return turn.f;
  if (id === "fr") return turn.fr;
  return turn.ira;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function draw(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cells: { amp: number; energy: number }[],
  turn: TurnResult | null,
  pulses: number[],
  copy: Labels,
) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#0c100e";
  ctx.fillRect(0, 0, w, h);

  const pad = Math.max(14, Math.min(w, h) * 0.045);
  const grid = Math.min(h - pad * 2.6, w * 0.4);
  const gx0 = pad;
  const gy0 = (h - grid) / 2 + 4;
  const cell = grid / 3;

  let absMax = 1e-6;
  for (const c of cells) absMax = Math.max(absMax, Math.abs(c.amp), Math.sqrt(Math.max(0, c.energy)));
  const scale = Math.max(absMax, 0.08);

  const somas: { x: number; y: number }[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const c = cells[row * 3 + col] ?? { amp: 0, energy: 0 };
      const x = gx0 + col * cell;
      const y = gy0 + row * cell;
      const t = Math.sqrt(Math.min(1, Math.abs(c.amp) / scale));
      ctx.fillStyle = c.amp >= 0 ? `rgba(201,212,206,${0.2 + t * 0.8})` : `rgba(130,168,210,${0.2 + t * 0.8})`;
      roundRect(ctx, x + 4, y + 4, cell - 8, cell - 8, 10);
      ctx.fill();
      const cx = x + cell / 2;
      const cy = y + cell * 0.42;
      somas.push({ x: cx, y: cy });
      ctx.beginPath();
      ctx.fillStyle = "#e6eee8";
      ctx.arc(cx, cy, Math.max(7, cell * 0.16), 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = "#0c100e";
      ctx.arc(cx, cy, Math.max(3, cell * 0.06), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#e6eee8";
      ctx.font = `600 ${Math.max(10, Math.min(13, cell * 0.2))}px ui-monospace, Menlo, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(c.amp.toFixed(2), cx, cy + Math.max(9, cell * 0.2));
      ctx.textAlign = "left";
    }
  }
  ctx.strokeStyle = "#e6eee8";
  ctx.lineWidth = 2;
  roundRect(ctx, gx0, gy0, grid, grid, 12);
  ctx.stroke();

  const busX = gx0 + grid + pad * 1.15;
  const busY0 = gy0 + grid * 0.08;
  const busY1 = gy0 + grid * 0.92;
  const barX = busX + pad * 1.15;
  const barW = Math.max(72, w - barX - pad);
  const midY = (busY0 + busY1) / 2;
  const blocked = turn?.blockedBy?.id ?? null;
  const barH = Math.min(26, (busY1 - busY0) / GATES.length - 8);

  ctx.strokeStyle = "#8b9890";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(busX, busY0);
  ctx.lineTo(busX, busY1);
  ctx.stroke();

  ctx.lineCap = "butt";
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = "rgba(157,184,166,0.55)";
  for (const s of somas) {
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(busX, midY);
    ctx.stroke();
  }

  GATES.forEach((g, i) => {
    const gy = busY0 + ((i + 0.5) * (busY1 - busY0)) / GATES.length;
    const v = gateValue(turn, g.id);
    const excess = v - g.block;
    const hot = v >= g.block;
    const winner = blocked === g.id;
    ctx.strokeStyle = winner ? "#e6eee8" : "rgba(196,184,160,0.55)";
    ctx.lineWidth = winner ? 2.4 : 1.2;
    ctx.beginPath();
    ctx.moveTo(busX, gy);
    ctx.lineTo(barX, gy);
    ctx.stroke();

    roundRect(ctx, barX, gy - barH / 2, barW, barH, 6);
    ctx.fillStyle = "#1c2420";
    ctx.fill();
    ctx.strokeStyle = winner ? "#e6eee8" : hot ? "#c4b8a0" : "#2a3530";
    ctx.lineWidth = winner ? 2 : 1;
    ctx.stroke();

    const fillW = Math.max(0, Math.min(1, v)) * barW;
    if (fillW > 2) {
      ctx.fillStyle = winner ? "#c4b8a0" : hot ? "#9db8a6" : "#3a4840";
      roundRect(ctx, barX, gy - barH / 2, fillW, barH, 6);
      ctx.fill();
    }

    const tickX = barX + g.block * barW;
    ctx.strokeStyle = "#e6eee8";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(tickX, gy - barH / 2 - 2);
    ctx.lineTo(tickX, gy + barH / 2 + 2);
    ctx.stroke();

    ctx.fillStyle = "#e6eee8";
    ctx.font = `${winner ? "700" : "600"} ${Math.max(11, Math.min(13, barH * 0.55))}px ui-monospace, Menlo, monospace`;
    ctx.textBaseline = "middle";
    const mark = winner
      ? `  ${copy.couplingManda} Δ${excess >= 0 ? "+" : ""}${excess.toFixed(2)}`
      : hot
        ? `  Δ${excess >= 0 ? "+" : ""}${excess.toFixed(2)}`
        : "";
    ctx.fillText(`${g.id}  ${v.toFixed(2)}${mark}`, barX + 10, gy);
  });

  ctx.fillStyle = "#e6eee8";
  for (let i = 0; i < pulses.length; i++) {
    const t = pulses[i];
    const s = somas[i % somas.length];
    const gi = i % GATES.length;
    const gy = busY0 + ((gi + 0.5) * (busY1 - busY0)) / GATES.length;
    const u1 = Math.min(1, t / 0.55);
    const x = t < 0.55 ? s.x + (busX - s.x) * u1 : busX + (barX - busX) * ((t - 0.55) / 0.45);
    const y = t < 0.55 ? s.y + (midY - s.y) * u1 : midY + (gy - midY) * ((t - 0.55) / 0.45);
    ctx.beginPath();
    ctx.arc(x, y, winnerPulse(turn, gi) ? 4.4 : 3.1, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#8b9890";
  ctx.font = "11px ui-monospace, Menlo, monospace";
  ctx.textBaseline = "top";
  ctx.fillText(copy.couplingReadout, gx0, Math.max(6, gy0 - 18));
  ctx.fillText(copy.couplingBus, busX - 22, Math.max(6, busY0 - 18));
  ctx.fillText(copy.couplingGates, barX, Math.max(6, gy0 - 18));
}

function winnerPulse(turn: TurnResult | null, gi: number) {
  return turn?.blockedBy?.id === GATES[gi]?.id;
}

export function CouplingView({
  agent,
  turn,
  copy,
}: {
  agent: VoxelAgent;
  turn: TurnResult | null;
  live: boolean;
  copy: Labels;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const pulses = useRef(Float32Array.from({ length: 12 }, (_, i) => i / 12));

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const cssW = canvas.clientWidth || 640;
      const cssH = canvas.clientHeight || 360;
      if (canvas.width !== Math.floor(cssW * dpr) || canvas.height !== Math.floor(cssH * dpr)) {
        canvas.width = Math.floor(cssW * dpr);
        canvas.height = Math.floor(cssH * dpr);
      }
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const p = pulses.current;
        for (let i = 0; i < p.length; i++) {
          p[i] += dt * (0.22 + (i % 5) * 0.04);
          if (p[i] > 1) p[i] -= 1;
        }
        draw(ctx, cssW, cssH, agent.windowCells(), turn, Array.from(p), copy);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [agent, turn, copy]);

  return (
    <div>
      <h3 className="font-display text-lg">{copy.couplingTitle}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{copy.couplingHint}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <article className="rounded-[var(--radius-md)] border border-border bg-background p-3">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{copy.couplingReadout}</p>
          <p className="mt-2 text-sm leading-relaxed">{copy.couplingStageRead}</p>
        </article>
        <article className="rounded-[var(--radius-md)] border border-border bg-background p-3">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{copy.couplingBus}</p>
          <p className="mt-2 text-sm leading-relaxed">{copy.couplingStageField}</p>
        </article>
        <article className="rounded-[var(--radius-md)] border border-border bg-background p-3">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{copy.couplingGates}</p>
          <p className="mt-2 text-sm leading-relaxed">{copy.couplingStageGate}</p>
        </article>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{copy.couplingDrag}</p>
      <canvas
        ref={ref}
        className="mt-3 h-[22rem] w-full rounded-[var(--radius-md)] border border-border bg-muted sm:h-[28rem]"
        aria-label={copy.couplingTitle}
      />
    </div>
  );
}
