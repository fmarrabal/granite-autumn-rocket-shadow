"use client";

import { useEffect, useRef, useState } from "react";
import {
  CHLADNI_IDS,
  N,
  PULSE_X,
  PULSE_Y,
  READ_CELLS,
  READ_Z,
  type ChladniId,
  type TurnResult,
  type VoxelAgent,
} from "@/lib/voxel-agent/engine";
import { CouplingView } from "@/components/lab/coupling-view";
import type { Copy } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const VOL = N * N * N;
const ZNEAR = [6, 7, 8, 9, 10];
const HIST = 48;

type Star = { c: number; xp: number; xm: number; yp: number; ym: number; zp: number; zm: number };

function sample(buf: Float64Array, z: number, y: number, x: number) {
  return buf[z * N * N + y * N + x];
}

function blit(canvas: HTMLCanvasElement | null, buf: Float64Array, z: number, max: number, frameWin = false) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = N;
  canvas.height = N;
  const img = ctx.createImageData(N, N);
  const denom = Math.max(max, 1e-6);
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const e = sample(buf, z, y, x);
      const t = Math.sqrt(Math.max(0, e) / denom);
      const o = (y * N + x) * 4;
      const inWin = z === READ_Z && (READ_CELLS as readonly number[]).includes(y) && (READ_CELLS as readonly number[]).includes(x);
      const onCol = y === PULSE_Y && x === PULSE_X;
      img.data[o] = onCol ? 230 : inWin ? 230 : 201;
      img.data[o + 1] = onCol ? 232 : inWin ? 232 : 212;
      img.data[o + 2] = onCol ? 214 : inWin ? 214 : 206;
      img.data[o + 3] = Math.round(((onCol ? 0.45 : inWin ? 0.28 : 0.08) + t * 0.55) * 255);
    }
  ctx.putImageData(img, 0, 0);
  if (frameWin) {
    ctx.strokeStyle = "#e6eee8";
    ctx.lineWidth = 1;
    ctx.strokeRect(READ_CELLS[0], READ_CELLS[0], READ_CELLS.length, READ_CELLS.length);
  }
  ctx.fillStyle = "#c4b8a0";
  ctx.fillRect(PULSE_X, PULSE_Y, 1, 1);
}

function wrapN(v: number) {
  return ((v % N) + N) % N;
}

function lerp2(get: (c: number, r: number) => number, col: number, row: number) {
  const c0 = Math.floor(col);
  const r0 = Math.floor(row);
  const fu = col - c0;
  const fv = row - r0;
  const a = get(c0, r0);
  const b = get(c0 + 1, r0);
  const c = get(c0, r0 + 1);
  const d = get(c0 + 1, r0 + 1);
  return a * (1 - fu) * (1 - fv) + b * fu * (1 - fv) + c * (1 - fu) * fv + d * fu * fv;
}

function grain(x: number, y: number) {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return 0.62 + 0.38 * (s - Math.floor(s));
}

function planeGet(buf: Float64Array, mode: "xy" | "xz" | "yz", c: number, r: number) {
  const cc = wrapN(c);
  const rr = wrapN(r);
  if (mode === "xy") return sample(buf, READ_Z, rr, cc);
  if (mode === "xz") return sample(buf, wrapN(N - 1 - rr), PULSE_Y, cc);
  return sample(buf, wrapN(N - 1 - rr), cc, PULSE_X);
}

function blitCut(
  canvas: HTMLCanvasElement | null,
  buf: Float64Array,
  max: number,
  mode: "xy" | "xz" | "yz",
  pulseAge: number,
  labels: { inject: string; read: string },
  sandMode: boolean,
) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = canvas.clientWidth || 280;
  const h = canvas.clientHeight || 280;
  if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#0c100e";
  ctx.fillRect(0, 0, w, h);

  const pad = 18;
  const cell = Math.min((w - pad * 2) / N, (h - pad * 2) / N);
  const ox = (w - cell * N) / 2;
  const oy = (h - cell * N) / 2;
  const denom = Math.max(max, 1e-6);
  const inner = Math.max(1, Math.floor(cell * N * dpr));
  const img = ctx.createImageData(inner, inner);
  const scale = cell * dpr;

  for (let py = 0; py < inner; py++)
    for (let px = 0; px < inner; px++) {
      const col = px / scale;
      const row = py / scale;
      const raw = lerp2((c, r) => planeGet(buf, mode, c, r), col, row);
      const o = (py * inner + px) * 4;
      if (sandMode) {
        const g = grain(px, py);
        const a = Math.max(0, Math.min(1, Math.pow(Math.max(0, raw), 0.5) * g * 1.35));
        img.data[o] = 232;
        img.data[o + 1] = 228;
        img.data[o + 2] = 206;
        img.data[o + 3] = Math.round(a * 255);
      } else {
        const t = Math.sqrt(Math.max(0, raw) / denom);
        img.data[o] = 201;
        img.data[o + 1] = 212;
        img.data[o + 2] = 206;
        img.data[o + 3] = Math.round((0.06 + t * 0.72) * 255);
      }
    }
  ctx.putImageData(img, Math.round(ox * dpr), Math.round(oy * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.strokeStyle = "#e6eee8";
  ctx.lineWidth = 1.2;
  if (mode === "xy") {
    ctx.strokeRect(ox + READ_CELLS[0] * cell, oy + READ_CELLS[0] * cell, READ_CELLS.length * cell, READ_CELLS.length * cell);
  } else {
    const zr = N - 1 - READ_Z;
    ctx.strokeRect(ox, oy + zr * cell, N * cell, cell);
  }

  if (!sandMode && mode === "xy" && pulseAge >= 0 && pulseAge < 18) {
    const r = Math.min(7.5, 0.35 + pulseAge * 0.42);
    ctx.beginPath();
    ctx.arc(ox + (PULSE_X + 0.5) * cell, oy + (PULSE_Y + 0.5) * cell, r * cell, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(196,184,160,${Math.max(0, 0.85 - pulseAge / 18)})`;
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }

  ctx.fillStyle = "#8b9890";
  ctx.font = "10px ui-monospace, Menlo, monospace";
  ctx.textBaseline = "bottom";
  ctx.textAlign = "left";
  const tag = mode === "xy" ? `${labels.inject} · ${labels.read}` : labels.inject;
  ctx.fillText(tag, ox, oy - 3);
}

function blitStar(canvas: HTMLCanvasElement | null, star: Star, labels: { inject: string }) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = canvas.clientWidth || 320;
  const h = canvas.clientHeight || 320;
  if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#0c100e";
  ctx.fillRect(0, 0, w, h);

  const cx = w * 0.5;
  const cy = h * 0.46;
  const gap = Math.min(w, h) * 0.22;
  const size = Math.min(w, h) * 0.13;
  const peak = Math.max(star.c, star.xp, star.xm, star.yp, star.ym, star.zp, star.zm, 1e-6);

  const nodes: { k: keyof Star; x: number; y: number; tag: string; hue: string }[] = [
    { k: "zp", x: cx, y: cy - gap, tag: "+z", hue: "#9db8a6" },
    { k: "zm", x: cx, y: cy + gap, tag: "−z", hue: "#9db8a6" },
    { k: "xm", x: cx - gap, y: cy, tag: "−x", hue: "#c9d4ce" },
    { k: "xp", x: cx + gap, y: cy, tag: "+x", hue: "#c9d4ce" },
    { k: "ym", x: cx - gap * 0.72, y: cy + gap * 0.72, tag: "−y", hue: "#c9d4ce" },
    { k: "yp", x: cx + gap * 0.72, y: cy + gap * 0.72, tag: "+y", hue: "#c9d4ce" },
    { k: "c", x: cx, y: cy, tag: labels.inject, hue: "#c4b8a0" },
  ];

  ctx.strokeStyle = "#2a3530";
  ctx.lineWidth = 1.4;
  for (const n of nodes) {
    if (n.k === "c") continue;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(n.x, n.y);
    ctx.stroke();
  }

  for (const n of nodes) {
    const t = Math.sqrt(star[n.k] / peak);
    const s = n.k === "c" ? size * 1.15 : size;
    ctx.fillStyle = `rgba(12,16,14,1)`;
    ctx.fillRect(n.x - s / 2, n.y - s / 2, s, s);
    ctx.fillStyle = n.hue.replace(")", "").startsWith("#")
      ? hexAlpha(n.hue, 0.18 + t * 0.82)
      : n.hue;
    ctx.fillRect(n.x - s / 2, n.y - s / 2, s, s);
    ctx.strokeStyle = n.k === "c" ? "#c4b8a0" : n.hue;
    ctx.lineWidth = n.k === "c" ? 2 : 1;
    ctx.strokeRect(n.x - s / 2 + 0.5, n.y - s / 2 + 0.5, s - 1, s - 1);
    ctx.fillStyle = "#e6eee8";
    ctx.font = `${n.k === "c" ? "700 " : ""}11px ui-monospace, Menlo, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(n.tag, n.x, n.y - 6);
    ctx.fillStyle = "#8b9890";
    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.fillText(star[n.k].toFixed(3), n.x, n.y + 8);
  }
  ctx.textAlign = "start";
}

function hexAlpha(hex: string, a: number) {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function blitZ(
  canvas: HTMLCanvasElement | null,
  buf: Float64Array,
  labels: { zUp: string; zDown: string; zRead: string },
) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = canvas.clientWidth || 320;
  const h = canvas.clientHeight || 320;
  if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#0c100e";
  ctx.fillRect(0, 0, w, h);

  const pad = 10;
  const head = 16;
  const foot = 16;
  const colW = Math.min(52, w * 0.2);
  const rowH = (h - pad * 2 - head - foot) / N;
  const barX = pad + colW + 10;
  const barW = w - barX - pad - 36;

  const col = new Float64Array(N);
  const plane = new Float64Array(N);
  let cmax = 1e-6;
  let pmax = 1e-6;
  for (let z = 0; z < N; z++) {
    col[z] = sample(buf, z, PULSE_Y, PULSE_X);
    let s = 0;
    const base = z * N * N;
    for (let i = 0; i < N * N; i++) s += buf[base + i];
    plane[z] = s / (N * N);
    if (col[z] > cmax) cmax = col[z];
    if (plane[z] > pmax) pmax = plane[z];
  }

  ctx.fillStyle = "#8b9890";
  ctx.font = "11px ui-monospace, Menlo, monospace";
  ctx.textBaseline = "top";
  ctx.fillText(labels.zUp, pad, 4);

  for (let z = N - 1; z >= 0; z--) {
    const row = N - 1 - z;
    const y = pad + head + row * rowH;
    const t = Math.sqrt(col[z] / cmax);
    const near = z === READ_Z - 1 || z === READ_Z + 1;
    ctx.fillStyle = `rgba(201,212,206,${0.1 + t * 0.9})`;
    ctx.fillRect(pad, y + 1, colW, rowH - 2);
    if (z === READ_Z) {
      ctx.strokeStyle = "#c4b8a0";
      ctx.lineWidth = 1.6;
      ctx.strokeRect(pad + 0.5, y + 1, colW - 1, rowH - 2);
    } else if (near) {
      ctx.strokeStyle = "#9db8a6";
      ctx.lineWidth = 1;
      ctx.strokeRect(pad + 0.5, y + 1, colW - 1, rowH - 2);
    }
    const pt = Math.sqrt(plane[z] / pmax);
    ctx.fillStyle = z === READ_Z ? "#c4b8a0" : near ? "#9db8a6" : "#3a4840";
    ctx.fillRect(barX, y + 3, Math.max(2, pt * barW), rowH - 6);
    ctx.fillStyle = z === READ_Z ? "#e6eee8" : "#8b9890";
    ctx.font = `${z === READ_Z ? "700" : "500"} 11px ui-monospace, Menlo, monospace`;
    ctx.textBaseline = "middle";
    const tag = z === READ_Z ? ` ${labels.zRead}` : near ? " ±1" : "";
    ctx.fillText(`${z}${tag}`, barX + Math.max(2, pt * barW) + 6, y + rowH / 2);
  }

  ctx.fillStyle = "#8b9890";
  ctx.font = "11px ui-monospace, Menlo, monospace";
  ctx.textBaseline = "bottom";
  ctx.fillText(labels.zDown, pad, h - 4);
}

export function LiveSlice({
  agent,
  live,
  epoch,
  onToggle,
  copy,
  turn,
  onPulse,
  highlightPulse,
}: {
  agent: VoxelAgent;
  live: boolean;
  epoch: number;
  onToggle: () => void;
  turn: TurnResult | null;
  copy: Copy;
  onPulse?: () => void;
  highlightPulse?: boolean;
}) {
  const [mode, setMode] = useState<ChladniId>("rings");
  const xyRef = useRef<HTMLCanvasElement | null>(null);
  const xzRef = useRef<HTMLCanvasElement | null>(null);
  const yzRef = useRef<HTMLCanvasElement | null>(null);
  const starRef = useRef<HTMLCanvasElement | null>(null);
  const volRef = useRef<Array<HTMLCanvasElement | null>>(Array(ZNEAR.length).fill(null));
  const zRef = useRef<HTMLCanvasElement | null>(null);
  const clockRef = useRef<HTMLParagraphElement>(null);
  const lineRef = useRef<SVGPolylineElement>(null);
  const histRef = useRef<number[]>([]);
  const bufRef = useRef(new Float64Array(VOL));
  const sandRef = useRef(new Float64Array(VOL));
  const agentRef = useRef(agent);
  agentRef.current = agent;
  const modeRef = useRef(mode);
  modeRef.current = mode;

  useEffect(() => {
    agentRef.current.injectChladni(modeRef.current);
  }, [epoch]);

  useEffect(() => {
    const id = turn?.cog.workspace_mode;
    if (!id) return;
    setMode(id);
  }, [turn]);

  useEffect(() => {
    let id = 0;
    const tick = () => {
      const a = agentRef.current;
      if (live) a.stepField();
      const { max, mean } = a.fillEnergy(bufRef.current);
      const sand = a.fillSand(sandRef.current);
      const age = a.pulseAge();
      const labs = { inject: copy.injectLabel, read: copy.readLabel };
      const chladni = a.chladniId != null;
      const vis = chladni ? sandRef.current : bufRef.current;
      const visMax = chladni ? sand.max : max;
      blitCut(xyRef.current, vis, visMax, "xy", age, labs, chladni);
      blitCut(xzRef.current, vis, visMax, "xz", age, labs, chladni);
      blitCut(yzRef.current, vis, visMax, "yz", age, labs, chladni);
      blitStar(starRef.current, a.neighborStar(), { inject: copy.injectLabel });
      for (let zi = 0; zi < ZNEAR.length; zi++) {
        blit(volRef.current[zi], vis, ZNEAR[zi], visMax, ZNEAR[zi] === READ_Z);
      }
      blitZ(zRef.current, vis, { zUp: copy.zUp, zDown: copy.zDown, zRead: copy.zRead });
      histRef.current.push(mean);
      if (histRef.current.length > HIST) histRef.current.shift();
      if (lineRef.current && histRef.current.length > 1) {
        const hmax = Math.max(...histRef.current, 1e-6);
        lineRef.current.setAttribute(
          "points",
          histRef.current
            .map((v, i) => `${((i / (HIST - 1)) * 96).toFixed(2)},${(28 - (v / hmax) * 24).toFixed(2)}`)
            .join(" "),
        );
      }
      if (clockRef.current) {
        const s = a.neighborStar();
        const tag = a.chladniId ? ` · ${a.chladniId}` : "";
        clockRef.current.textContent = `t=${a.clock}${tag} · c ${s.c.toFixed(3)} · ±x ${s.xp.toFixed(3)}/${s.xm.toFixed(3)} · ±y ${s.yp.toFixed(3)}/${s.ym.toFixed(3)} · ±z ${s.zp.toFixed(3)}/${s.zm.toFixed(3)}`;
      }
    };
    tick();
    id = window.setInterval(tick, 120);
    return () => window.clearInterval(id);
  }, [live, epoch, copy.zUp, copy.zDown, copy.zRead, copy.injectLabel, copy.readLabel]);

  const fireMode = (id: ChladniId) => {
    setMode(id);
    agent.injectChladni(id);
    onPulse?.();
  };

  const firePulse = () => {
    agent.injectChladni(mode);
    onPulse?.();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-display text-lg">{copy.fieldTitle}</h2>
          <p className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {copy.workspaceOf(copy.modeWord[turn?.cog.workspace_mode ?? mode])}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
            {CHLADNI_IDS.map((id) => (
              <button
                key={id}
                type="button"
                className={cn(
                  "h-11 rounded-full border px-3 font-mono text-xs uppercase tracking-wider",
                  mode === id
                    ? "border-primary bg-muted text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                  highlightPulse && id === "rings" && "ring-2 ring-ring",
                )}
                onClick={() => fireMode(id)}
              >
                {copy.modeWord[id]}
              </button>
            ))}
            <button
              type="button"
              className={cn(
                "h-11 rounded-full border px-3 font-mono text-xs uppercase tracking-wider",
                highlightPulse ? "border-primary bg-muted text-foreground ring-2 ring-ring" : "border-border text-muted-foreground hover:text-foreground",
              )}
              onClick={firePulse}
            >
              {copy.pulse}
            </button>
            <button
              type="button"
              className="h-11 rounded-full border border-border px-3 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
              onClick={onToggle}
            >
              {live ? copy.live : copy.paused}
            </button>
          </div>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{copy.fieldHint}</p>
      <p className="mt-1 text-xs text-muted-foreground">{copy.chladniHint}</p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {(
          [
            [xyRef, copy.cutXY],
            [xzRef, copy.cutXZ],
            [yzRef, copy.cutYZ],
          ] as const
        ).map(([ref, label]) => (
          <div key={label} className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
            <canvas
              ref={ref}
              className="mt-1 aspect-square w-full rounded-[var(--radius-sm)] border border-border bg-muted"
              aria-label={label}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)]">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{copy.crystalTitle}</p>
          <p className="mt-1 text-xs text-muted-foreground">{copy.crystalHint}</p>
          <canvas
            ref={starRef}
            className="mt-2 aspect-square w-full rounded-[var(--radius-sm)] border border-border bg-muted"
            aria-label={copy.crystalTitle}
          />
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{copy.zAxis}</p>
          <p className="mt-1 text-xs text-muted-foreground">{copy.zHint}</p>
          <canvas
            ref={zRef}
            className="mt-2 h-80 w-full rounded-[var(--radius-sm)] border border-border bg-muted sm:h-96"
            aria-label={copy.zAxis}
          />
        </div>
      </div>

      <p className="mt-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">{copy.volume}</p>
      <div className="mt-2 grid grid-cols-5 gap-2">
        {ZNEAR.map((z, i) => (
          <div key={z} className="min-w-0">
            <p className="font-mono text-xs text-muted-foreground">
              z={z}
              {z === READ_Z ? ` ${copy.zRead}` : z === READ_Z - 1 || z === READ_Z + 1 ? " ±1" : ""}
            </p>
            <canvas
              ref={(el) => {
                volRef.current[i] = el;
              }}
              className={cn(
                "pixel-grid mt-1 aspect-square w-full rounded-sm border bg-muted",
                z === READ_Z ? "border-ask" : z === READ_Z - 1 || z === READ_Z + 1 ? "border-ok" : "border-border",
              )}
              aria-label={`z=${z}`}
            />
          </div>
        ))}
      </div>
      <p className="mt-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">{copy.energyMean}</p>
      <svg viewBox="0 0 96 32" className="mt-2 h-12 w-full text-primary" aria-hidden="true">
        <polyline ref={lineRef} fill="none" stroke="currentColor" strokeWidth="1.2" points="0,28 96,28" />
      </svg>
      <p ref={clockRef} className="mt-2 font-mono text-xs tabular-nums text-muted-foreground">
        t=0
      </p>
      <div className="mt-8">
        <CouplingView agent={agent} turn={turn} live={live} copy={copy} />
      </div>
    </div>
  );
}
