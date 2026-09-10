/** Control bus. Authorization, not a persona. 3×3 window is the actual readout. */

import { CognitiveKernel, type CognitiveSnap } from "./cognition.ts";
import { runBank } from "./bank.ts";

export const TYPES = [
  "consigna_vaga",
  "dato_faltante",
  "contradiccion",
  "sorpresa",
  "eco_costoso",
  "residual",
] as const;
export type SituationType = (typeof TYPES)[number];
export type Permiso = "cerrar" | "preguntar" | "buscar";
export const INPUTS = ["ambiguedad", "hueco", "sorpresa", "incoherencia", "eco_mnesico"] as const;
export type InputName = (typeof INPUTS)[number];

export const N = 16;
export const READ_Z = 8;
export const READ_CELLS = [6, 7, 8] as const;
export const PULSE_Y = 7;
export const PULSE_X = 7;

export const CHLADNI_IDS = ["grid", "rings", "cross", "weave"] as const;
export type ChladniId = (typeof CHLADNI_IDS)[number];

/** 3D standing-wave modes. 2D Chladni plates are slices of these. */
export function chladniAt(id: ChladniId, x: number, y: number, z: number) {
  const X = (2 * Math.PI * x) / N;
  const Y = (2 * Math.PI * y) / N;
  const Z = (2 * Math.PI * z) / N;
  if (id === "rings") {
    return Math.cos(3 * X) * Math.cos(3 * Y) + Math.cos(3 * Y) * Math.cos(3 * Z) + Math.cos(3 * Z) * Math.cos(3 * X);
  }
  if (id === "cross") return Math.cos(2 * X) + Math.cos(2 * Y) + Math.cos(2 * Z);
  if (id === "grid") return Math.cos(4 * X) * Math.cos(4 * Y) * Math.cos(4 * Z);
  return (Math.cos(5 * X) * Math.cos(3 * Y) + Math.cos(3 * X) * Math.cos(5 * Y)) * Math.cos(2 * Z);
}

export function buildChladni(id: ChladniId) {
  const out = new Float64Array(N * N * N);
  let peak = 1e-9;
  for (let z = 0; z < N; z++)
    for (let y = 0; y < N; y++)
      for (let x = 0; x < N; x++) {
        const v = chladniAt(id, x, y, z);
        out[z * N * N + y * N + x] = v;
        const a = Math.abs(v);
        if (a > peak) peak = a;
      }
  for (let i = 0; i < out.length; i++) out[i] /= peak;
  return out;
}

const CH = 4;
const CH_AMP = 0,
  CH_POT = 1,
  CH_ENG = 2,
  CH_TRC = 3;

export const DEFAULT_B: Record<InputName, number> = {
  ambiguedad: 0.55,
  hueco: 0.5,
  sorpresa: 0.55,
  incoherencia: 0.55,
  eco_mnesico: 0.5,
};

const B_MIN = 0.28,
  B_MAX = 0.84,
  DELTA_CAP = 0.08,
  ETA = 0.22,
  WARP_CAP = 0.1,
  CLOSE_BLOCK = 0.42,
  ASK_FLOOR = 0.28,
  SEARCH_MASS = 0.55,
  SEARCH_D = 0.4,
  RETRIEVE_SCORE = 0.12,
  RETRIEVE_SIM = 0.28,
  ACTIVE_PI = 0.12,
  PRIOR_MASS = 0.22,
  PRIOR_D = 0.32,
  WARP_SHIFT = 0.12,
  UPDATE_PI = 0.05,
  RISK_BLOCK = 0.54,
  FEAR_BLOCK = 0.45,
  FEAR_W_RISK = 0.5,
  FEAR_W_HARM = 0.3,
  FEAR_W_URG = 0.1,
  HARM_STAR = 0.75,
  FRUST_BLOCK = 0.58,
  IRA_BLOCK = 0.5,
  IRA_W_STAKES = 0.45,
  IRA_W_REJ = 0.35,
  IRA_W_FRUST = 0.2,
  TAG_FLOOR = 0.35,
  CARE_STAKES = 0.72,
  CONTRA_STAKES = 0.96,
  C_SCALE = 0.6,
  ETA_C = 0.18,
  RISK_BIAS_CAP = 0.25;

export { CLOSE_BLOCK, RISK_BLOCK, FEAR_BLOCK, FRUST_BLOCK, IRA_BLOCK };

const TARGET: Record<SituationType, InputName> = {
  consigna_vaga: "ambiguedad",
  dato_faltante: "hueco",
  contradiccion: "incoherencia",
  sorpresa: "sorpresa",
  eco_costoso: "eco_mnesico",
  residual: "ambiguedad",
};

const MATH_RE = /\d+\s*[+\-*/x×]\s*\d+/;
const DATE_RE = /(lunes|martes|miercoles|jueves|viernes|sabado|domingo|hoy|manana|\d{1,2}[/-]\d{1,2})/;
const CARE_RE = /(medico|salud|dolor|grave)/;
const VAGUE = ["mejor", "better", "hazlo", "improve", "optimo", "genial", "fino", "fine", "pulido", "pulir", "color", "dejalo", "deja", "refina", "refinar"];
const RESERVE = ["reserv", "book", "vuelo", "hotel", "cita", "agenda", "mesa"];
const SEND = ["envia", "manda", "send"];
const PAIRS: [string, string][] = [
  ["barato", "lujo"],
  ["cheap", "luxury"],
  ["rapido", "lento"],
];
const SOFT_CONTRA = ["a la vez", "pero tambien", "and luxury"];

export function clip(x: number, lo = 0, hi = 1) {
  return Math.max(lo, Math.min(hi, x));
}

export function riskValue(stakes: number, hueco: number, harm: number, bias = 0) {
  return clip(0.15 + 0.55 * stakes * hueco + 0.3 * harm + bias);
}
export function urgencyValue(stakes: number, hueco: number) {
  return clip(stakes * hueco);
}
export function fearValue(r: number, harm: number, stakes: number, hueco: number) {
  const u = urgencyValue(stakes, hueco);
  return clip(FEAR_W_RISK * r + FEAR_W_HARM * harm + FEAR_W_URG * u);
}
export function frustrationValue(stakes: number, incoherencia: number, hueco: number) {
  return clip(stakes * incoherencia * (1 - hueco));
}
export function iraValue(stakes: number, incoherencia: number, nRej: number, fr: number) {
  return clip(IRA_W_STAKES * stakes * incoherencia + IRA_W_REJ * nRej + IRA_W_FRUST * fr);
}
export function reliefValue(d: number, r: number, harm: number) {
  return clip((1 - d) * (1 - r) * (1 - harm));
}
export function curiosityValue(sorpresa: number, stakes: number) {
  return clip(sorpresa * (1 - stakes));
}
export function disgustValue(incoherencia: number, pi: Record<SituationType, number>) {
  if ((pi.contradiccion ?? 0) < 0.12) return 0;
  return clip(incoherencia);
}

export function controlTag(d: number, r: number, f: number, fr: number, ira: number, pn: number) {
  const scores: Record<string, number> = { duda: d, riesgo: r, alarma: f, frustracion: fr, ira, pena: pn };
  let key = "duda";
  let best = -1;
  for (const k of Object.keys(scores)) {
    if (scores[k] > best) {
      best = scores[k];
      key = k;
    }
  }
  return best >= TAG_FLOOR ? key : "neutro";
}

export type GateHit = { id: "d" | "r" | "f" | "fr" | "ira"; value: number; block: number };

export function pickBlockedBy(hits: GateHit[]): { blockedBy: GateHit; also: GateHit[] } {
  const ranked = [...hits].sort((a, b) => b.value - b.block - (a.value - a.block));
  return { blockedBy: ranked[0], also: ranked.slice(1) };
}

function fold(text: string) {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}
function hasAny(t: string, words: string[]) {
  return words.some((w) => t.includes(w));
}
function tokens(text: string) {
  return [...new Set(fold(text).split(/\s+/).filter((x) => x.length > 1))];
}

const CRIT_RE =
  /(\bnps\b|\bcriterio\b|\blatencia\b|\bmetric).*\d|\d+\s*(ms|s|%|puntos)\b|(menos de|mas de|mayor que|menor que|menos que|[<>]=?)\s*\d/;
const NEG_RE = /\b(no|sin|not|ni|nunca|without)\b/;

export function hasMeasurableCriterion(t: string) {
  if (MATH_RE.test(t)) return false;
  return CRIT_RE.test(t);
}

function negatedNear(t: string, word: string) {
  const parts = t.split(/\s+/);
  const i = parts.findIndex((p) => p.replace(/[^a-z0-9]/g, "") === word || p.includes(word));
  if (i < 0) return false;
  const win = [parts[i - 2], parts[i - 1], parts[i], parts[i + 1]].filter(Boolean).join(" ");
  return NEG_RE.test(win);
}

export function pairState(t: string) {
  let conflict = false;
  let resolved = false;
  for (const [a, b] of PAIRS) {
    if (!t.includes(a) || !t.includes(b)) continue;
    const negA = negatedNear(t, a);
    const negB = negatedNear(t, b);
    if (negA !== negB) resolved = true;
    else if (!negA && !negB) conflict = true;
  }
  if (!resolved && SOFT_CONTRA.some((s) => t.includes(s))) conflict = true;
  return { conflict, resolved };
}

const SKETCH_DIM = 128;
function fnv1a(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}
function sketch(text: string) {
  const folded = fold(text);
  const t = ` ${folded} `;
  const v = new Float64Array(SKETCH_DIM);
  for (const n of [3, 4]) {
    for (let i = 0; i + n <= t.length; i++) {
      const h = fnv1a(t.slice(i, i + n));
      v[h % SKETCH_DIM] += h & 1 ? 1 : -1;
    }
  }
  let nrm = 0;
  for (let i = 0; i < SKETCH_DIM; i++) nrm += v[i] * v[i];
  nrm = Math.sqrt(nrm) || 1;
  for (let i = 0; i < SKETCH_DIM; i++) v[i] /= nrm;
  return v;
}
function cosine(a: Float64Array, b: Float64Array) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function idx(z: number, y: number, x: number, c: number) {
  return ((z * N + y) * N + x) * CH + c;
}

class Rng {
  s: number;
  constructor(seed: number) {
    this.s = seed >>> 0 || 1;
  }
  next() {
    this.s = (1664525 * this.s + 1013904223) >>> 0;
    return this.s / 0x100000000;
  }
  gaussian() {
    const u = Math.max(1e-9, this.next());
    const v = this.next();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
}

function missingSlots(text: string) {
  const t = fold(text);
  const out: string[] = [];
  if (VAGUE.some((w) => t.includes(w)) && !hasMeasurableCriterion(t)) out.push("criterio");
  if (hasAny(t, RESERVE) && !DATE_RE.test(t)) out.push("fecha");
  if (hasAny(t, SEND)) out.push("destinatario");
  return out;
}

function questionFor(text: string, missing: string[], permiso: Permiso, eco = 0, attr = 0) {
  const delta = `${attr >= 0 ? "+" : ""}${attr.toFixed(3)}`;
  const echoBit = `eco ${eco.toFixed(2)}, Δ ${delta}`;
  if (missing.includes("criterio")) {
    if (eco >= 0.2) {
      return `La vez anterior pedí un criterio medible y no llegó (${echoBit}). ¿Qué cuenta como éxito esta vez, en una métrica?`;
    }
    return "¿Cuál es el criterio de éxito medible para 'mejor'?";
  }
  if (missing.includes("fecha")) {
    if (eco >= 0.2) return `Sigue faltando la fecha (${echoBit}). ¿Qué fecha uso para la reserva?`;
    return "¿Qué fecha uso para la reserva?";
  }
  if (missing.includes("destinatario")) {
    if (eco >= 0.2) return `Sigue faltando el destinatario (${echoBit}). ¿A quién se lo envío?`;
    return "¿A quién se lo envío?";
  }
  if (permiso === "buscar") {
    if (eco >= 0.2) return `Las dos lecturas siguen chocando (${echoBit}). ¿Cuál restricción manda?`;
    return "Hay dos lecturas incompatibles. ¿Cuál restricción manda?";
  }
  if (eco >= 0.2) {
    return `Sigue sin resolverse (${echoBit}). Falta un dato crítico. ¿Puedes ser concreto?`;
  }
  return "Falta un dato crítico. ¿Puedes ser concreto?";
}

function closeReply(text: string) {
  const t = fold(text);
  const m = t.match(/(\d+)\s*[+\-x×]\s*(\d+)/);
  if (m && t.includes("+")) return String(Number(m[1]) + Number(m[2]));
  if (hasMeasurableCriterion(t)) return "Listo. El criterio cierra el hueco.";
  if (pairState(t).resolved) return "Listo. Una restricción manda.";
  return "Listo.";
}

export type Episode = {
  text: string;
  tokens: string[];
  features: Record<InputName, number>;
  pi: Record<SituationType, number>;
  b_used: Record<InputName, number>;
  d: number;
  d_base?: number;
  permiso: Permiso;
  d_star: number | null;
  outcome: string;
  timestamp: number;
  r_base?: number;
};

export type TurnResult = {
  text: string;
  d: number;
  dBase: number;
  dMem: number;
  attr: number;
  permiso: Permiso;
  dudaLabel: string;
  pi: Record<SituationType, number>;
  bNow: Record<InputName, number>;
  features: Record<InputName, number>;
  fieldFeatures: Record<string, number>;
  question: string;
  response: string;
  missing: string[];
  activeTypes: string[];
  energyMean: number;
  windowEnergy: number;
  epistemic: number;
  cost: number;
  climate: number;
  r: number;
  rBase: number;
  f: number;
  u: number;
  h: number;
  c: number;
  stakes: number;
  fr: number;
  ds: number;
  al: number;
  cu: number;
  ira: number;
  pn: number;
  nRej: number;
  tag: string;
  blockedBy: GateHit | null;
  also: string[];
  cog: CognitiveSnap;
};

export function turnTape(r: TurnResult) {
  return {
    text: r.text,
    permiso: r.permiso,
    blocked_by: r.blockedBy
      ? { id: r.blockedBy.id, value: +r.blockedBy.value.toFixed(3), block: r.blockedBy.block }
      : null,
    also: r.also,
    d: +r.d.toFixed(3),
    r: +r.r.toFixed(3),
    f: +r.f.toFixed(3),
    fr: +r.fr.toFixed(3),
    ira: +r.ira.toFixed(3),
    d_mem: +r.dMem.toFixed(3),
    d_base: +r.dBase.toFixed(3),
    attr: +r.attr.toFixed(3),
    eco: +r.cost.toFixed(3),
    window_e: +r.windowEnergy.toFixed(4),
    tipo: r.cog.tipo,
    prediction: r.cog.prediction,
    prediction_ok: r.cog.prediction_ok,
    error: r.cog.error,
    workspace: r.cog.workspace_mode,
    hypotheses: r.cog.alive,
    killed: r.cog.killed,
    cites: r.cog.cites_commitment,
  };
}

type AgentOpts = {
  seed?: number;
  freezeB?: boolean;
  forceD?: number | null;
  forceR?: number | null;
  forceF?: number | null;
  forceFr?: number | null;
  forceIra?: number | null;
  useWarp?: boolean;
  liveBody?: boolean;
};

export class VoxelAgent {
  clock = 0;
  liveBody: boolean;
  freezeB: boolean;
  useWarp: boolean;
  forceD: number | null;
  forceR: number | null;
  forceF: number | null;
  forceFr: number | null;
  forceIra: number | null;
  fearAuthorizes = true;
  frAuthorizes = true;
  iraAuthorizes = true;
  V: Float64Array;
  Vprev: Float64Array;
  z: Float64Array;
  slowZ = 0;
  lastMismatch = 0;
  lastSrc = 0;
  lastPulseClock = -1000;
  chladniTicks = 0;
  chladniId: ChladniId | null = null;
  chladniMode: Float64Array | null = null;
  sand: Float64Array;
  env: Float64Array;
  envPeak = 1e-6;
  lastBands = { p0: 0, p1OverP0: 1, specErr: 0, quad: 0 };
  lastHarm = 0;
  lastPena = 0;
  lastUnexpected = false;
  prototypes: Record<SituationType, Record<InputName, number>>;
  confErr: Record<SituationType, number>;
  riskBias: Record<SituationType, number>;
  rejN: Record<SituationType, number>;
  episodes: Episode[] = [];
  pending: Episode | null = null;
  mind = new CognitiveKernel();
  rng: Rng;
  gamma = 0.18;
  alpha = 0.22;
  lam = 0.08;
  lamS = 0.04;
  sigmaS = 0.04;
  noise = 0.018;
  beta = 0.08;

  constructor(opts: AgentOpts = {}) {
    this.rng = new Rng(opts.seed ?? 7);
    this.liveBody = opts.liveBody !== false;
    this.freezeB = !!opts.freezeB;
    this.useWarp = opts.useWarp !== false;
    this.forceD = opts.forceD ?? null;
    this.forceR = opts.forceR ?? null;
    this.forceF = opts.forceF ?? null;
    this.forceFr = opts.forceFr ?? null;
    this.forceIra = opts.forceIra ?? null;
    this.V = new Float64Array(N * N * N * CH);
    this.Vprev = new Float64Array(N * N * N * CH);
    this.z = new Float64Array(N * N * N);
    this.sand = new Float64Array(N * N * N);
    this.env = new Float64Array(N * N * N);
    this.prototypes = Object.fromEntries(
      TYPES.map((t) => [t, { ...DEFAULT_B }]),
    ) as Record<SituationType, Record<InputName, number>>;
    this.confErr = Object.fromEntries(TYPES.map((t) => [t, 0.2])) as Record<SituationType, number>;
    this.riskBias = Object.fromEntries(TYPES.map((t) => [t, 0])) as Record<SituationType, number>;
    this.rejN = Object.fromEntries(TYPES.map((t) => [t, 0])) as Record<SituationType, number>;
  }

  private wrap(v: number) {
    return ((v % N) + N) % N;
  }

  private neighbor6(c: number, z: number, y: number, x: number) {
    return (
      this.V[idx(this.wrap(z + 1), y, x, c)] +
      this.V[idx(this.wrap(z - 1), y, x, c)] +
      this.V[idx(z, this.wrap(y + 1), x, c)] +
      this.V[idx(z, this.wrap(y - 1), x, c)] +
      this.V[idx(z, y, this.wrap(x + 1), c)] +
      this.V[idx(z, y, this.wrap(x - 1), c)]
    ) / 6;
  }

  private drawXi() {
    return this.rng.gaussian();
  }

  private refreshEnergy() {
    for (let i = 0; i < N * N * N; i++) {
      const a = this.V[i * CH + CH_AMP];
      const p = this.V[i * CH + CH_POT];
      this.V[i * CH + CH_ENG] = 0.5 * (a * a + p * p);
    }
  }

  stepField(source?: Float64Array | null) {
    this.clock += 1;
    const next = new Float64Array(this.V);
    const nextZ = new Float64Array(this.z);
    const xi0 = this.drawXi();
    if (this.liveBody) {
      this.slowZ = Math.max(-2, Math.min(2, (1 - this.lamS) * this.slowZ + this.sigmaS * xi0));
    }
    const global = this.liveBody ? this.beta * this.slowZ : 0;
    let misSum = 0;
    let srcSum = 0;
    const hold = this.chladniTicks > 0;
    if (this.chladniTicks > 0) this.chladniTicks -= 1;
    const noiseAmt = (this.liveBody ? this.noise : 0) * (hold ? 0.1 : 1);
    for (let z = 0; z < N; z++)
      for (let y = 0; y < N; y++)
        for (let x = 0; x < N; x++) {
          const i = idx(z, y, x, 0);
          const vi = (z * N + y) * N + x;
          const u = this.V[i + CH_AMP];
          const uPrev = this.Vprev[i + CH_AMP];
          const src = source ? source[vi] : 0;
          const lap = this.neighbor6(CH_AMP, z, y, x) - u;
          const zi = Math.max(-2, Math.min(2, (1 - this.lam) * this.z[vi] + noiseAmt * this.drawXi()));
          nextZ[vi] = zi;
          const hat = (2 - this.gamma) * u - (1 - this.gamma) * uPrev + this.alpha * lap;
          let na = hat + zi + global + src;
          na = Math.max(-4, Math.min(4, na));
          misSum += Math.abs(na - hat);
          srcSum += Math.abs(src);
          next[i + CH_AMP] = na;
          next[i + CH_POT] = Math.max(-4, Math.min(4, na - u));
          next[i + CH_TRC] = Math.max(0, Math.min(8, 0.8 * this.V[i + CH_TRC] + Math.abs(src)));
          this.env[vi] = Math.max(Math.abs(na), this.env[vi] * 0.92);
          if (this.env[vi] > this.envPeak) this.envPeak = this.env[vi];
          this.sand[vi] = Math.exp((-(this.env[vi] * this.env[vi])) / Math.max(1e-6, 0.18 * this.envPeak * this.envPeak));
        }
    this.lastMismatch = misSum / (N * N * N);
    this.lastSrc = srcSum / (N * N * N);
    this.envPeak *= 0.995;
    this.envPeak = Math.max(this.envPeak, 1e-6);
    this.Vprev.set(this.V);
    this.V = next;
    this.z = nextZ;
    this.refreshEnergy();
  }

  private blob(center: [number, number, number], radius: number, strength: number) {
    const src = new Float64Array(N * N * N);
    const [cz, cy, cx] = center;
    for (let z = 0; z < N; z++)
      for (let y = 0; y < N; y++)
        for (let x = 0; x < N; x++) {
          const d = Math.hypot(z - cz, y - cy, x - cx);
          if (d <= radius) src[z * N * N + y * N + x] = strength * (1 - d / Math.max(radius, 1));
        }
    return src;
  }

  injectAt(center: [number, number, number], radius = 2, strength = 1.6) {
    this.stepField(this.blob(center, radius, strength));
  }

  injectPulse() {
    this.chladniId = null;
    this.chladniMode = null;
    this.injectAt([READ_Z, PULSE_Y, PULSE_X], 0.51, 2.6);
    this.lastPulseClock = this.clock;
  }

  injectChladni(id: ChladniId) {
    const mode = buildChladni(id);
    this.chladniId = id;
    this.chladniMode = mode;
    this.chladniTicks = 80;
    this.lastPulseClock = this.clock;
    const A = 1.85;
    let peak = 1e-6;
    for (let i = 0; i < N * N * N; i++) {
      const a = A * mode[i];
      this.V[i * CH + CH_AMP] = a;
      this.Vprev[i * CH + CH_AMP] = a;
      this.V[i * CH + CH_POT] = 0;
      this.env[i] = Math.abs(a);
      if (this.env[i] > peak) peak = this.env[i];
    }
    this.envPeak = peak;
    for (let i = 0; i < N * N * N; i++) {
      this.sand[i] = Math.exp((-(this.env[i] * this.env[i])) / Math.max(1e-6, 0.18 * peak * peak));
    }
    this.refreshEnergy();
  }

  sandAt(z: number, y: number, x: number) {
    return this.sand[this.wrap(z) * N * N + this.wrap(y) * N + this.wrap(x)];
  }

  fillSand(out: Float64Array) {
    let max = 1e-6,
      sum = 0;
    const n = N * N * N;
    const peak = Math.max(this.envPeak, 1e-6);
    for (let i = 0; i < n; i++) {
      const s = Math.exp((-(this.env[i] * this.env[i])) / (0.18 * peak * peak));
      out[i] = s;
      this.sand[i] = s;
      sum += s;
      if (s > max) max = s;
    }
    return { max, mean: sum / n };
  }

  pulseAge() {
    return this.clock - this.lastPulseClock;
  }

  energyAt(z: number, y: number, x: number) {
    return this.V[idx(this.wrap(z), this.wrap(y), this.wrap(x), CH_ENG)];
  }

  neighborStar(z = READ_Z, y = PULSE_Y, x = PULSE_X) {
    return {
      c: this.energyAt(z, y, x),
      xp: this.energyAt(z, y, x + 1),
      xm: this.energyAt(z, y, x - 1),
      yp: this.energyAt(z, y + 1, x),
      ym: this.energyAt(z, y - 1, x),
      zp: this.energyAt(z + 1, y, x),
      zm: this.energyAt(z - 1, y, x),
    };
  }

  fieldFeatures() {
    let energy = 0,
      inst = 0,
      incoh = 0,
      trc = 0,
      n = 0;
    for (const y of READ_CELLS)
      for (const x of READ_CELLS) {
        n += 1;
        const i = idx(READ_Z, y, x, 0);
        const da = Math.abs(this.V[i + CH_AMP] - this.Vprev[i + CH_AMP]);
        const dp = Math.abs(this.V[i + CH_POT] - this.Vprev[i + CH_POT]);
        inst += da + dp;
        energy += this.V[i + CH_ENG];
        trc += this.V[i + CH_TRC];
        const local = this.neighbor6(CH_AMP, READ_Z, y, x);
        incoh += Math.abs(this.V[i + CH_AMP] - local);
      }
    const gate = Math.tanh((3 * trc) / Math.max(n, 1));
    return {
      surprise: Math.tanh((8 * inst) / Math.max(n, 1)) * gate * 0.85,
      incoherence: Math.tanh((6 * incoh) / Math.max(n, 1)),
      energy: Math.tanh((4 * energy) / Math.max(n, 1)),
      instability: Math.tanh((8 * inst) / Math.max(n, 1)),
      climate: Math.tanh(4 * Math.abs(this.slowZ)),
      mismatch: Math.tanh(8 * this.lastMismatch),
      p0: this.lastBands.p0,
      p1_over_p0: this.lastBands.p1OverP0,
      spec_err: this.lastBands.specErr,
      window_n: n,
    };
  }

  windowEnergy() {
    let s = 0;
    for (const y of READ_CELLS)
      for (const x of READ_CELLS) s += this.V[idx(READ_Z, y, x, CH_ENG)];
    return s / (READ_CELLS.length * READ_CELLS.length);
  }

  windowCells() {
    const out: { y: number; x: number; amp: number; energy: number }[] = [];
    for (const y of READ_CELLS)
      for (const x of READ_CELLS) {
        const i = idx(READ_Z, y, x, 0);
        out.push({ y, x, amp: this.V[i + CH_AMP], energy: this.V[i + CH_ENG] });
      }
    return out;
  }

  energyMean() {
    let s = 0;
    for (let i = 0; i < N * N * N; i++) s += this.V[i * CH + CH_ENG];
    return s / (N * N * N);
  }

  fillEnergy(out: Float64Array) {
    let max = 1e-6,
      sum = 0;
    const n = N * N * N;
    for (let i = 0; i < n; i++) {
      const e = this.V[i * CH + CH_ENG];
      out[i] = e;
      sum += e;
      if (e > max) max = e;
    }
    return { max, mean: sum / n };
  }

  fillAmp(out: Float64Array) {
    let max = 1e-6,
      sum = 0;
    const n = N * N * N;
    for (let i = 0; i < n; i++) {
      const a = this.V[i * CH + CH_AMP];
      out[i] = a;
      const abs = Math.abs(a);
      sum += abs;
      if (abs > max) max = abs;
    }
    return { max, mean: sum / n };
  }

  extractExterior(text: string, eco: number, ff: Record<string, number>): Record<InputName, number> {
    const t = fold(text);
    if (t.length < 2) {
      return {
        ambiguedad: 0.72,
        hueco: 0.7,
        sorpresa: 0.08,
        incoherencia: 0.08,
        eco_mnesico: clip(eco),
      };
    }
    const isMath = MATH_RE.test(t);
    const filledCrit = hasMeasurableCriterion(t);
    const pair = pairState(t);
    const vagueHits = VAGUE.reduce((n, v) => n + (t.includes(v) ? 1 : 0), 0);
    const needsDate = hasAny(t, RESERVE);
    const needsRecipient = hasAny(t, SEND);
    const hasDate = DATE_RE.test(t);
    const stillOpen = (needsDate && !hasDate) || needsRecipient || (vagueHits > 0 && !filledCrit);
    let hueco = 0.04;
    if (needsDate && !hasDate) hueco = 0.9;
    else if (needsRecipient) hueco = 0.86;
    let amb = 0.06;
    if (isMath) {
      amb = 0.04;
      hueco = 0.03;
    } else if (filledCrit && !stillOpen) {
      amb = 0.04;
      hueco = 0.03;
    } else if (vagueHits && !filledCrit) {
      amb = Math.min(0.92, 0.62 + 0.12 * vagueHits);
      if (t.split(/\s+/).length <= 4) amb = Math.min(0.95, amb + 0.08);
      hueco = Math.min(hueco, 0.12);
    }
    let contra = pair.conflict ? 0.94 : 0.05;
    if (SOFT_CONTRA.some((s) => t.includes(s)) && !pair.resolved) contra = Math.max(contra, 0.82);
    let surpr = this.lastUnexpected ? 0.78 : ff.surprise ?? 0.08;
    const fieldIncoh = Math.min(0.38, ff.incoherence ?? 0.08);
    let incoh = Math.max(fieldIncoh, contra);
    const settled = isMath || (!stillOpen && !pair.conflict);
    if (settled) {
      amb = 0.04;
      hueco = 0.03;
      surpr = Math.min(surpr, 0.12);
      incoh = Math.min(incoh, 0.1);
    }
    return {
      ambiguedad: clip(0.78 * amb + 0.22 * (settled ? 0 : ff.incoherence ?? 0)),
      hueco: clip(0.88 * hueco + 0.12 * (settled ? 0 : ff.energy ?? 0)),
      sorpresa: clip(surpr),
      incoherencia: clip(incoh),
      eco_mnesico: clip(eco),
    };
  }

  membership(text: string, features: Record<InputName, number>, eco: number): Record<SituationType, number> {
    const t = fold(text);
    const raw: Record<SituationType, number> = {
      consigna_vaga: 0.02,
      dato_faltante: 0.02,
      contradiccion: 0.02,
      sorpresa: 0.02,
      eco_costoso: 0.02,
      residual: 0.02,
    };
    if (MATH_RE.test(t) && features.ambiguedad < 0.25 && features.hueco < 0.25) raw.residual = 1;
    else {
      if (features.ambiguedad > 0.45) raw.consigna_vaga = features.ambiguedad;
      if (features.hueco > 0.45) raw.dato_faltante = features.hueco;
      if (features.incoherencia > 0.5) raw.contradiccion = features.incoherencia;
      if (this.lastUnexpected || features.sorpresa > 0.55) raw.sorpresa = Math.max(features.sorpresa, 0.55);
      if (eco > 0.2) raw.eco_costoso = Math.min(0.55, eco);
      if (Math.max(...Object.values(raw)) <= 0.05) raw.residual = 1;
    }
    const s = Object.values(raw).reduce((a, b) => a + b, 0);
    return Object.fromEntries(TYPES.map((k) => [k, raw[k] / s])) as Record<SituationType, number>;
  }

  retrieve(text: string, pi: Record<SituationType, number>) {
    const q = sketch(text);
    const active = new Set(TYPES.filter((t) => pi[t] >= ACTIVE_PI));
    const scored = this.episodes
      .map((ep) => {
        const sim = cosine(q, sketch(ep.text));
        if (sim < RETRIEVE_SIM) return null;
        const epTypes = new Set(TYPES.filter((t) => ep.pi[t] >= 0.12));
        let inter = 0;
        active.forEach((t) => {
          if (epTypes.has(t)) inter += 1;
        });
        const union = new Set([...active, ...epTypes]).size || 1;
        return { score: 0.7 * sim + 0.3 * (inter / union), sim, ep };
      })
      .filter((s): s is { score: number; sim: number; ep: Episode } => !!s && s.score > RETRIEVE_SCORE)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    if (!scored.length) {
      this.lastHarm = 0;
      this.lastPena = 0;
      return { eco: 0, harm: 0, pena: 0, delta: Object.fromEntries(INPUTS.map((n) => [n, 0])) as Record<InputName, number> };
    }
    let eco = 0,
      harm = 0,
      pena = 0;
    const delta = Object.fromEntries(INPUTS.map((n) => [n, 0])) as Record<InputName, number>;
    for (const s of scored) {
      let cost = s.ep.d_star ?? 0;
      if (s.ep.outcome === "corrected") cost = Math.max(cost, 0.85);
      eco += s.sim * cost;
      const costly = s.ep.outcome === "corrected" || cost >= HARM_STAR;
      if (costly) {
        harm += s.sim * cost;
        if (s.ep.pi.dato_faltante >= ACTIVE_PI) pena += s.sim * cost;
      }
      const shift = -WARP_SHIFT * s.sim * cost;
      for (const t of TYPES) if (active.has(t) && s.ep.pi[t] >= ACTIVE_PI) delta[TARGET[t]] += shift;
    }
    eco = Math.min(1, eco);
    this.lastHarm = Math.min(1, harm);
    this.lastPena = Math.min(1, pena);
    for (const n of INPUTS) delta[n] = Math.max(-WARP_CAP, Math.min(WARP_CAP, delta[n]));
    return { eco, harm: this.lastHarm, pena: this.lastPena, delta };
  }

  mix(pi: Record<SituationType, number>) {
    const out = Object.fromEntries(INPUTS.map((n) => [n, 0])) as Record<InputName, number>;
    for (const t of TYPES) for (const n of INPUTS) out[n] += pi[t] * this.prototypes[t][n];
    return out;
  }

  muBaja(x: number) {
    return clip(1 - x / 0.4);
  }
  muMedia(x: number) {
    return clip(1 - Math.abs(x - 0.5) / 0.3);
  }
  muAlta(x: number, b: number) {
    return clip((x - b) / Math.max(1e-6, 1 - b));
  }

  infer(feats: Record<InputName, number>, bAlta: Record<InputName, number>) {
    const mu = Object.fromEntries(
      INPUTS.map((n) => [
        n,
        { baja: this.muBaja(feats[n]), media: this.muMedia(feats[n]), alta: this.muAlta(feats[n], bAlta[n]) },
      ]),
    ) as Record<InputName, { baja: number; media: number; alta: number }>;
    const rules: [number, number, "ask" | "search" | "close"][] = [
      [mu.hueco.alta, 0.48, "ask"],
      [Math.min(mu.ambiguedad.alta, mu.hueco.baja), 0.58, "ask"],
      [mu.incoherencia.alta, 0.52, "search"],
      [mu.eco_mnesico.alta, 0.74, "ask"],
      [Math.min(mu.sorpresa.alta, mu.eco_mnesico.alta), 0.82, "ask"],
      [Math.min(...INPUTS.map((n) => mu[n].baja)), 0.13, "close"],
      [mu.ambiguedad.media, 0.46, "ask"],
      [mu.sorpresa.alta, 0.52, "ask"],
    ];
    let num = PRIOR_MASS * PRIOR_D,
      den = PRIOR_MASS,
      ask = 0,
      search = 0,
      close = 0;
    for (const [w, c, act] of rules) {
      num += w * c;
      den += w;
      if (act === "ask") ask += w;
      else if (act === "search") search += w;
      else close += w;
    }
    const d = clip(num / Math.max(den, 1e-9));
    const label = d >= 0.62 ? "alta" : d >= 0.38 ? "media" : "baja";
    let permiso: Permiso = "cerrar";
    if (search > SEARCH_MASS && d >= SEARCH_D) permiso = "buscar";
    else if (d >= CLOSE_BLOCK) permiso = "preguntar";
    else if (ask > close && d >= ASK_FLOOR) permiso = "preguntar";
    if (d >= CLOSE_BLOCK && permiso === "cerrar") permiso = "preguntar";
    return { d, label, permiso };
  }

  mixConfidence(pi: Record<SituationType, number>) {
    let acc = 0;
    for (const t of TYPES) acc += pi[t] * clip(1 - this.confErr[t] / C_SCALE);
    return clip(acc);
  }
  mixRiskBias(pi: Record<SituationType, number>) {
    let acc = 0;
    for (const t of TYPES) acc += pi[t] * this.riskBias[t];
    return acc;
  }

  stakesOf(text: string) {
    const t = fold(text);
    if (MATH_RE.test(t) || hasMeasurableCriterion(t)) return 0.05;
    if (hasAny(t, RESERVE) || hasAny(t, SEND)) return 0.92;
    const pair = pairState(t);
    if (pair.conflict) return CONTRA_STAKES;
    if (CARE_RE.test(t)) return CARE_STAKES;
    return 0.08;
  }

  authorize(d: number, permiso: Permiso, r = 0, f = 0, fr = 0, ira = 0) {
    if (this.forceD !== null) {
      d = this.forceD;
      if (d < CLOSE_BLOCK) permiso = "cerrar";
      else if (permiso === "cerrar") permiso = "preguntar";
    } else if (d >= CLOSE_BLOCK && permiso === "cerrar") permiso = "preguntar";
    const rv = this.forceR !== null ? this.forceR : r;
    const fv = this.forceF !== null ? this.forceF : f;
    const frv = this.forceFr !== null ? this.forceFr : fr;
    const irav = this.forceIra !== null ? this.forceIra : ira;
    if (rv >= RISK_BLOCK && permiso === "cerrar") permiso = "preguntar";
    if (this.fearAuthorizes && fv >= FEAR_BLOCK && permiso === "cerrar") permiso = "preguntar";
    if (this.frAuthorizes && frv >= FRUST_BLOCK && permiso === "cerrar") permiso = "preguntar";
    if (this.iraAuthorizes && irav >= IRA_BLOCK && permiso === "cerrar") permiso = "preguntar";
    const hits: GateHit[] = [];
    if (d >= CLOSE_BLOCK) hits.push({ id: "d", value: d, block: CLOSE_BLOCK });
    if (rv >= RISK_BLOCK) hits.push({ id: "r", value: rv, block: RISK_BLOCK });
    if (this.fearAuthorizes && fv >= FEAR_BLOCK) hits.push({ id: "f", value: fv, block: FEAR_BLOCK });
    if (this.frAuthorizes && frv >= FRUST_BLOCK) hits.push({ id: "fr", value: frv, block: FRUST_BLOCK });
    if (this.iraAuthorizes && irav >= IRA_BLOCK) hits.push({ id: "ira", value: irav, block: IRA_BLOCK });
    if (permiso === "cerrar") return { d, permiso, blockedBy: null as GateHit | null, also: [] as GateHit[] };
    if (!hits.length) return { d, permiso, blockedBy: { id: "d" as const, value: d, block: CLOSE_BLOCK }, also: [] as GateHit[] };
    const picked = pickBlockedBy(hits);
    return { d, permiso, blockedBy: picked.blockedBy, also: picked.also };
  }

  step(text: string): TurnResult {
    if (text.length > 4000) text = text.slice(0, 4000);
    const cog = this.mind.step(text);
    this.injectChladni(cog.workspace_mode);
    let src: Float64Array;
    if (this.chladniMode) {
      src = new Float64Array(this.chladniMode.length);
      for (let i = 0; i < src.length; i++) src[i] = this.chladniMode[i] * 0.55;
    } else {
      src = this.blob([READ_Z, 7, 7], 2, 1.15);
    }
    for (let i = 0; i < 4; i++) {
      this.stepField(src);
      const faded = new Float64Array(src.length);
      for (let j = 0; j < src.length; j++) faded[j] = src[j] * 0.5;
      src = faded;
    }
    const ff = this.fieldFeatures();
    const featsBase = this.extractExterior(text, 0, ff);
    featsBase.eco_mnesico = 0;
    const piBase = this.membership(text, featsBase, 0);
    const fuzzyBase = this.infer(featsBase, this.mix(piBase));
    const dBase = fuzzyBase.d;
    const { eco, harm, pena, delta } = this.retrieve(text, piBase);
    let missing = missingSlots(text);
    const gapOpen = missing.length > 0 || pairState(fold(text)).conflict || cog.override;
    const ecoUsed = gapOpen ? eco : Math.min(eco, 0.12);
    const feats = this.extractExterior(text, ecoUsed, ff);
    feats.eco_mnesico = ecoUsed;
    const pi = this.membership(text, feats, ecoUsed);
    const mixed = this.mix(pi);
    const bNow = { ...mixed };
    if (!this.freezeB && this.useWarp) {
      for (const n of INPUTS) bNow[n] = clip(mixed[n] + Math.max(-WARP_CAP, Math.min(WARP_CAP, delta[n])), B_MIN, B_MAX);
    }
    const fuzzy = this.infer(feats, bNow);
    const stakes = this.stakesOf(text);
    const rBase = riskValue(stakes, feats.hueco, 0, this.mixRiskBias(pi));
    const rMem = riskValue(stakes, feats.hueco, harm, this.mixRiskBias(pi));
    const u = urgencyValue(stakes, feats.hueco);
    const f = fearValue(rMem, harm, stakes, feats.hueco);
    const fr = frustrationValue(stakes, feats.incoherencia, feats.hueco);
    let nRej = 0;
    for (const t of TYPES) nRej += pi[t] * this.rejN[t];
    const ira = iraValue(stakes, feats.incoherencia, nRej, fr);
    const auth = this.authorize(fuzzy.d, fuzzy.permiso, rMem, f, fr, ira);
    let dMem = auth.d;
    let permiso = auth.permiso;
    let blockedBy = auth.blockedBy;
    let also = auth.also.map((g) => g.id);
    if (cog.override) {
      const forced = this.authorize(dMem, cog.permiso, rMem, f, fr, ira);
      dMem = forced.d;
      permiso = forced.permiso;
      blockedBy = forced.blockedBy;
      also = forced.also.map((g) => g.id);
      if (cog.open_slots.length) missing = cog.open_slots;
    } else if (cog.permiso === "cerrar" && fuzzy.permiso === "cerrar") {
      permiso = "cerrar";
      blockedBy = null;
      also = [];
    }
    const attr = dMem - dBase;
    let question = questionFor(text, missing, permiso, eco, attr);
    if (cog.override && cog.question) {
      question = cog.question;
      if (eco >= 0.2 && cog.cites_commitment) {
        question = question.replace("Compromiso activo", `Compromiso activo (eco ${eco.toFixed(2)})`);
      }
    }
    const response = permiso === "cerrar" ? closeReply(text) : question;
    this.pending = {
      text,
      tokens: tokens(text),
      features: feats,
      pi,
      b_used: bNow,
      d: dMem,
      d_base: dBase,
      permiso,
      d_star: null,
      outcome: "pending",
      timestamp: Date.now(),
      r_base: rBase,
    };
    return {
      text,
      d: dMem,
      dBase,
      dMem,
      attr,
      permiso,
      dudaLabel: fuzzy.label,
      pi,
      bNow,
      features: feats,
      fieldFeatures: ff,
      question,
      response,
      missing,
      activeTypes: TYPES.filter((t) => pi[t] >= ACTIVE_PI).sort((a, b) => pi[b] - pi[a]),
      energyMean: this.energyMean(),
      windowEnergy: this.windowEnergy(),
      epistemic: Math.max(feats.ambiguedad, feats.hueco),
      cost: feats.eco_mnesico,
      climate: ff.climate ?? 0,
      r: rMem,
      rBase,
      f,
      u,
      h: harm,
      c: this.mixConfidence(pi),
      stakes,
      fr,
      ds: disgustValue(feats.incoherencia, pi),
      al: reliefValue(dMem, rMem, harm),
      cu: curiosityValue(feats.sorpresa, stakes),
      ira,
      pn: pena,
      nRej,
      tag: controlTag(dMem, rMem, f, fr, ira, pena),
      blockedBy,
      also,
      cog,
    };
  }

  recordOutcome(dStar: number, outcome: string, regime: "censored" | "complete" = "censored") {
    if (!this.pending) return;
    const ep = { ...this.pending, d_star: dStar, outcome };
    this.episodes = [...this.episodes, ep].slice(-200);
    this.pending = null;
    this.lastUnexpected = outcome === "corrected" && ep.permiso === "cerrar";
    const observedClose = regime === "complete" || ep.permiso === "cerrar";
    const dLearn = ep.d_base ?? ep.d;
    if (!this.freezeB && (observedClose || outcome !== "ok")) {
      let err = dLearn - dStar;
      if (outcome === "corrected" && ep.permiso === "cerrar") err = Math.min(err, -0.4);
      for (const t of TYPES) {
        if (ep.pi[t] < UPDATE_PI) continue;
        const step = Math.max(-DELTA_CAP, Math.min(DELTA_CAP, ep.pi[t] * ETA * err));
        const name = TARGET[t];
        this.prototypes[t][name] = clip(this.prototypes[t][name] + step, B_MIN, B_MAX);
      }
    }
    if (observedClose) {
      const e = Math.abs(dLearn - dStar);
      for (const t of TYPES) {
        if (ep.pi[t] < UPDATE_PI) continue;
        this.confErr[t] = (1 - ETA_C) * this.confErr[t] + ETA_C * e;
      }
    }
  }
}

export type EvalCheck = { name: string; ok: boolean; detail: string };

export function runEval(): EvalCheck[] {
  const checks: EvalCheck[] = [];
  let a = new VoxelAgent({ liveBody: false, seed: 1 });
  let r = a.step("cuanto es 2+2");
  checks.push({
    name: "Clear math closes",
    ok: r.permiso === "cerrar" && r.d < 0.42 && r.blockedBy === null,
    detail: `permiso=${r.permiso} d=${r.d.toFixed(3)} gate=${r.blockedBy?.id ?? "none"}`,
  });
  a = new VoxelAgent({ liveBody: false, seed: 1 });
  r = a.step("hazlo mejor");
  checks.push({
    name: "Vague request asks",
    ok: r.permiso === "preguntar" && r.blockedBy?.id === "d" && /criterio/i.test(r.question),
    detail: `permiso=${r.permiso} d=${r.d.toFixed(3)} gate=${r.blockedBy?.id}`,
  });
  a = new VoxelAgent({ liveBody: false, seed: 2 });
  const first = a.step("hazlo mejor");
  a.recordOutcome(0.9, "corrected");
  const second = a.step("hazlo mejor");
  checks.push({
    name: "Memory raises d and names echo",
    ok: second.d > first.d + 0.02 && second.cost >= 0.5 && /eco/i.test(second.question),
    detail: `d ${first.d.toFixed(3)}→${second.d.toFixed(3)} eco=${second.cost.toFixed(2)}`,
  });
  a = new VoxelAgent({ liveBody: false, seed: 3 });
  const miss = a.step("reservalo");
  const filled = a.step("reservalo el viernes");
  checks.push({
    name: "Date fills the gap",
    ok: miss.permiso !== "cerrar" && (filled.permiso === "cerrar" || filled.d < miss.d - 0.08),
    detail: `miss ${miss.permiso} gate=${miss.blockedBy?.id ?? "none"} d=${miss.d.toFixed(3)} filled ${filled.permiso} d=${filled.d.toFixed(3)}`,
  });
  checks.push({
    name: "r wins by excess on missing date",
    ok: miss.blockedBy?.id === "r" && miss.r - RISK_BLOCK > miss.d - CLOSE_BLOCK,
    detail: `gate=${miss.blockedBy?.id} r=${miss.r.toFixed(3)} Δr=${(miss.r - RISK_BLOCK).toFixed(3)} d=${miss.d.toFixed(3)} Δd=${(miss.d - CLOSE_BLOCK).toFixed(3)}`,
  });
  a = new VoxelAgent({ liveBody: false, seed: 2 });
  a.step("hazlo mejor");
  a.recordOutcome(0.9, "corrected");
  a.step("hazlo mejor");
  const crit = a.step("hazlo mejor, el criterio es NPS > 50");
  checks.push({
    name: "Criterion fills the vague slot",
    ok: crit.permiso === "cerrar" && crit.blockedBy === null && /cierra el hueco/i.test(crit.response),
    detail: `permiso=${crit.permiso} d=${crit.d.toFixed(3)} gate=${crit.blockedBy?.id ?? "none"}`,
  });
  a = new VoxelAgent({ liveBody: false, seed: 4 });
  a.step("quiero barato y lujo");
  const picked = a.step("barato. el lujo no. prioriza precio");
  checks.push({
    name: "Choosing one constraint resolves the pair",
    ok: picked.permiso === "cerrar" && picked.blockedBy === null && picked.fr < FRUST_BLOCK && /restricci[oó]n manda/i.test(picked.response),
    detail: `permiso=${picked.permiso} fr=${picked.fr.toFixed(3)} gate=${picked.blockedBy?.id ?? "none"}`,
  });
  a = new VoxelAgent({ liveBody: false, seed: 4, forceD: 0, forceR: 0, forceF: 0 });
  const frOn = a.step("quiero barato y lujo");
  checks.push({
    name: "Excess pick: fr commands when d/r/f forced 0",
    ok: frOn.fr >= FRUST_BLOCK && frOn.blockedBy?.id === "fr",
    detail: `fr=${frOn.fr.toFixed(3)} gate=${frOn.blockedBy?.id} d=${frOn.d.toFixed(3)}`,
  });
  a = new VoxelAgent({ liveBody: false, seed: 4 });
  const cheap = a.step("quiero barato y lujo");
  const cheapFrEx = cheap.fr - FRUST_BLOCK;
  const cheapDEx = cheap.d - CLOSE_BLOCK;
  checks.push({
    name: "fr wins by excess without force",
    ok: cheap.blockedBy?.id === "fr" && cheap.also.includes("d") && cheapFrEx > cheapDEx,
    detail: `gate=${cheap.blockedBy?.id} fr=${cheap.fr.toFixed(3)} Δfr=${cheapFrEx.toFixed(3)} d=${cheap.d.toFixed(3)} Δd=${cheapDEx.toFixed(3)}`,
  });
  const excess = pickBlockedBy([
    { id: "d", value: 0.43, block: 0.42 },
    { id: "r", value: 0.7, block: 0.54 },
  ]);
  checks.push({
    name: "blocked_by is max excess not list order",
    ok: excess.blockedBy.id === "r" && excess.also[0].id === "d",
    detail: `winner=${excess.blockedBy.id} also=${excess.also.map((g) => g.id).join(",")}`,
  });
  a = new VoxelAgent({ liveBody: false, seed: 5 });
  a.injectAt([READ_Z, 7, 7], 2, 1.8);
  const eWin = a.windowEnergy();
  const a2 = new VoxelAgent({ liveBody: false, seed: 5 });
  a2.injectAt([0, 0, 0], 2, 1.8);
  const eFar = a2.windowEnergy();
  checks.push({
    name: "Readout is the 3×3 window",
    ok: eWin > eFar * 2 && a.fieldFeatures().window_n === 9,
    detail: `win=${eWin.toFixed(4)} far=${eFar.toFixed(4)} n=${a.fieldFeatures().window_n}`,
  });
  const zBuf = new Float64Array(N * N * N);
  a.fillEnergy(zBuf);
  const at = (z: number) => zBuf[z * N * N + 7 * N + 7];
  checks.push({
    name: "Pulse couples through ±z not only the plane",
    ok: at(READ_Z) > at(READ_Z - 1) && at(READ_Z - 1) > at(0) * 2 && at(READ_Z + 1) > at(0) * 2,
    detail: `z7=${at(7).toFixed(4)} z8=${at(8).toFixed(4)} z9=${at(9).toFixed(4)} z0=${at(0).toFixed(4)}`,
  });
  a = new VoxelAgent({ liveBody: false, seed: 9 });
  a.injectPulse();
  const star0 = a.neighborStar();
  for (let i = 0; i < 5; i++) a.stepField();
  const star1 = a.neighborStar();
  const far = a.energyAt(0, 0, 0);
  checks.push({
    name: "Point pulse then idle ticks light all six neighbors",
    ok:
      star0.c > star0.zp * 4 &&
      star1.zp > star0.zp &&
      star1.zm > star0.zm &&
      star1.xp > star0.xp &&
      star1.yp > star0.yp &&
      star1.zp > far * 3 &&
      star1.xp > far * 3,
    detail: `c0=${star0.c.toFixed(4)} z+ ${star0.zp.toFixed(4)}→${star1.zp.toFixed(4)} x+ ${star0.xp.toFixed(4)}→${star1.xp.toFixed(4)} far=${far.toFixed(4)}`,
  });
  a = new VoxelAgent({ liveBody: false, seed: 3 });
  a.injectChladni("grid");
  const gridNode = a.sandAt(READ_Z, 1, 1);
  const gridAnti = a.sandAt(0, 0, 0);
  checks.push({
    name: "Chladni grid sand sits on nodes not antinodes",
    ok: gridNode > gridAnti * 4 && gridAnti < 0.2,
    detail: `node=${gridNode.toFixed(3)} anti=${gridAnti.toFixed(3)}`,
  });
  a = new VoxelAgent({ liveBody: false, seed: 3 });
  a.injectChladni("rings");
  const sXY = a.sandAt(8, 8, 12);
  const sZ = a.sandAt(12, 8, 8);
  checks.push({
    name: "Chladni rings are 3D shells not a plate",
    ok: Math.abs(sXY - sZ) < 0.08 && sXY > 0.05 && sZ > 0.05,
    detail: `sand x-axis ${sXY.toFixed(3)} vs z-axis ${sZ.toFixed(3)}`,
  });
  a = new VoxelAgent({ liveBody: false, seed: 3 });
  a.injectChladni("grid");
  let nodeE = 0,
    antiE = 0;
  for (let i = 0; i < 24; i++) {
    a.stepField();
    nodeE += a.energyAt(READ_Z, 1, 1);
    antiE += a.energyAt(0, 0, 0);
  }
  checks.push({
    name: "Grid standing wave keeps nodes dark after idle ticks",
    ok: antiE > nodeE * 2,
    detail: `anti=${antiE.toFixed(3)} node=${nodeE.toFixed(3)}`,
  });
  a = new VoxelAgent({ liveBody: false, seed: 8 });
  const empty = a.step("");
  const tiny = a.step(" ");
  checks.push({
    name: "Empty prompt does not silent-close",
    ok: empty.permiso !== "cerrar" && tiny.permiso !== "cerrar",
    detail: `empty=${empty.permiso} tiny=${tiny.permiso}`,
  });
  a = new VoxelAgent({ liveBody: false, seed: 8 });
  const uni = a.step("resérvalo el viernes");
  checks.push({
    name: "Unicode reserva still fills the date",
    ok: uni.permiso === "cerrar" && uni.blockedBy === null,
    detail: `permiso=${uni.permiso} d=${uni.d.toFixed(3)}`,
  });
  a = new VoxelAgent({ liveBody: false, seed: 2 });
  a.injectChladni("rings");
  const afterMode = a.step("cuanto es 2+2");
  checks.push({
    name: "Chladni activation still lets math close",
    ok: afterMode.permiso === "cerrar" && afterMode.blockedBy === null && Number.isFinite(afterMode.windowEnergy),
    detail: `permiso=${afterMode.permiso} winE=${afterMode.windowEnergy.toFixed(4)}`,
  });
  a = new VoxelAgent({ liveBody: false, seed: 1 });
  const wrapHit = a.step("cuanto es 2+2");
  a.injectAt([0, 0, 0], 1, 2);
  checks.push({
    name: "Wrap neighbors at the cube edge",
    ok: a.energyAt(0, 0, -1) === a.energyAt(0, 0, 15) && a.energyAt(-1, 0, 0) === a.energyAt(15, 0, 0) && wrapHit.permiso === "cerrar",
    detail: `x-1=${a.energyAt(0, 0, -1).toFixed(4)} x15=${a.energyAt(0, 0, 15).toFixed(4)}`,
  });
  a = new VoxelAgent({ liveBody: false, seed: 1 });
  const vagueH = a.step("hazlo mejor");
  checks.push({
    name: "Vague opens criterion hypothesis in Capas workspace",
    ok:
      vagueH.permiso === "preguntar" &&
      vagueH.cog.alive.includes("falta_criterio") &&
      vagueH.cog.prediction === "criterio" &&
      vagueH.cog.workspace_mode === "rings",
    detail: `perm=${vagueH.permiso} alive=${vagueH.cog.alive.join(",")} pred=${vagueH.cog.prediction} mode=${vagueH.cog.workspace_mode}`,
  });
  const wrongSlot = a.step("el viernes");
  checks.push({
    name: "Wrong slot kills hypothesis and still asks criterion",
    ok:
      wrongSlot.cog.prediction_ok === false &&
      wrongSlot.cog.killed.includes("falta_criterio") &&
      wrongSlot.permiso === "preguntar" &&
      wrongSlot.cog.prediction === "criterio" &&
      !a.mind.slots.fecha,
    detail: `ok=${wrongSlot.cog.prediction_ok} killed=${wrongSlot.cog.killed.join(",")} pred=${wrongSlot.cog.prediction} fecha=${a.mind.slots.fecha}`,
  });
  const metric = a.step("el criterio es NPS > 50");
  checks.push({
    name: "Metric confirms and writes a commitment",
    ok: metric.permiso === "cerrar" && a.mind.commitments.some((c) => /50/.test(c.last_value)),
    detail: `perm=${metric.permiso} commits=${a.mind.commitments.map((c) => c.last_value).join("|")}`,
  });
  const fine = a.step("dejalo fino");
  checks.push({
    name: "New wording reuses commitment without 'mejor'",
    ok: fine.permiso === "preguntar" && fine.cog.cites_commitment && /nps/i.test(fine.question),
    detail: `perm=${fine.permiso} cites=${fine.cog.cites_commitment} q=${fine.question.slice(0, 80)}`,
  });
  a = new VoxelAgent({ liveBody: false, seed: 4 });
  const clash = a.step("quiero barato y lujo");
  checks.push({
    name: "Conflict occupies Cruz workspace",
    ok: clash.cog.workspace_mode === "cross" && clash.cog.alive.includes("par_abierto"),
    detail: `mode=${clash.cog.workspace_mode} alive=${clash.cog.alive.join(",")}`,
  });
  const bank = runBank();
  const umbral = bank.table.find((r) => r.id === "umbral");
  checks.push({
    name: "Control bank: Umbral-C full score against rival policies",
    ok: !!umbral && umbral.ok === umbral.n && umbral.n >= 40,
    detail: `umbral=${umbral?.ok}/${umbral?.n} first=${bank.table[0]?.id}`,
  });
  const friday = bank.cases.find((c) => c.id === "wrong_slot");
  checks.push({
    name: "Control bank: only Umbral-C survives Friday after better",
    ok: !!friday && friday.agents.umbral.pass && !friday.agents.thermo.pass && !friday.agents.helper.pass,
    detail: `umbral=${friday?.agents.umbral.pass} thermo=${friday?.agents.thermo.pass}`,
  });
  return checks;
}
