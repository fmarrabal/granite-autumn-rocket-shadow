/** Situation model: predict, fail, revise. Not a persona. */

export type CogPermiso = "cerrar" | "preguntar" | "buscar";
export type CogMode = "grid" | "rings" | "cross" | "weave";

const MATH_RE = /\d+\s*[+\-*/x×]\s*\d+/;
const DATE_RE = /(lunes|martes|miercoles|jueves|viernes|sabado|domingo|hoy|manana|\d{1,2}[/-]\d{1,2})/;
const CRIT_RE =
  /(\bnps\b|\bcriterio\b|\blatencia\b|\bmetric).*\d|\d+\s*(ms|s|%|puntos)\b|(menos de|mas de|mayor que|menor que|[<>]=?)\s*\d/;
const NEG_RE = /\b(no|sin|not|ni|nunca|without)\b/;
const VAGUE = [
  "mejor",
  "better",
  "hazlo",
  "improve",
  "optimo",
  "genial",
  "fino",
  "fine",
  "pulido",
  "pulir",
  "color",
  "dejalo",
  "deja",
  "refina",
  "refinar",
];
const RESERVE = ["reserv", "book", "vuelo", "hotel", "cita", "agenda", "mesa"];
const SEND = ["envia", "manda", "send"];
const PAIRS: [string, string][] = [
  ["barato", "lujo"],
  ["cheap", "luxury"],
  ["rapido", "lento"],
];

function fold(text: string) {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}
export function grabDate(t: string) {
  const m = t.match(DATE_RE);
  return m ? m[0] : null;
}
export function perceiveText(text: string): Percept {
  return new CognitiveKernel().perceive(text);
}
function hasAny(t: string, words: string[]) {
  return words.some((w) => t.includes(w));
}
function hasCriterion(t: string) {
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
function pairOf(t: string) {
  let conflict = false;
  let resolved = false;
  for (const [a, b] of PAIRS) {
    if (!t.includes(a) || !t.includes(b)) continue;
    const negA = negatedNear(t, a);
    const negB = negatedNear(t, b);
    if (negA !== negB) resolved = true;
    else if (!negA && !negB) conflict = true;
  }
  return { conflict, resolved };
}

export type Hypothesis = {
  id: string;
  claim: string;
  mode: CogMode;
  predicts: string | null;
  alive: boolean;
  posterior: number;
  killed_by: string | null;
};

export type Commitment = {
  when: string;
  require: string;
  last_value: string;
  source: string;
};

export type CognitiveSnap = {
  tipo: string;
  slots: Record<"criterio" | "fecha" | "destinatario" | "restriccion", string | null>;
  hypotheses: Hypothesis[];
  commitments: Commitment[];
  prediction: string | null;
  prediction_ok: boolean | null;
  error: string | null;
  workspace_mode: CogMode;
  cites_commitment: boolean;
  open_slots: string[];
  killed: string[];
  alive: string[];
  permiso: CogPermiso;
  question: string;
  override: boolean;
};

export type Percept = {
  raw: string;
  t: string;
  empty: boolean;
  math: boolean;
  vague: boolean;
  reserve: boolean;
  send: boolean;
  criterion: boolean;
  date: boolean;
  pair: { conflict: boolean; resolved: boolean };
  kind: string;
};

export class CognitiveKernel {
  tipo = "residual";
  slots: CognitiveSnap["slots"] = {
    criterio: null,
    fecha: null,
    destinatario: null,
    restriccion: null,
  };
  hypotheses: Hypothesis[] = [];
  commitments: Commitment[] = [];
  prediction: string | null = null;
  prediction_ok: boolean | null = null;
  error: string | null = null;
  workspace_mode: CogMode = "rings";

  reset() {
    this.tipo = "residual";
    this.slots = { criterio: null, fecha: null, destinatario: null, restriccion: null };
    this.hypotheses = [];
    this.commitments = [];
    this.prediction = null;
    this.prediction_ok = null;
    this.error = null;
    this.workspace_mode = "rings";
  }

  snapshot(): CognitiveSnap {
    return {
      tipo: this.tipo,
      slots: { ...this.slots },
      hypotheses: this.hypotheses.map((h) => ({ ...h })),
      commitments: this.commitments.map((c) => ({ ...c })),
      prediction: this.prediction,
      prediction_ok: this.prediction_ok,
      error: this.error,
      workspace_mode: this.workspace_mode,
      cites_commitment: false,
      open_slots: [],
      killed: [],
      alive: this.hypotheses.filter((h) => h.alive).map((h) => h.id),
      permiso: "preguntar",
      question: "",
      override: false,
    };
  }

  perceive(text: string): Percept {
    const t = fold(text);
    if (t.length < 2) {
      return {
        raw: text,
        t,
        empty: true,
        math: false,
        vague: true,
        reserve: false,
        send: false,
        criterion: false,
        date: false,
        pair: pairOf(t),
        kind: "vacio",
      };
    }
    const vague = hasAny(t, VAGUE);
    const reserve = hasAny(t, RESERVE);
    const send = hasAny(t, SEND);
    const math = MATH_RE.test(t);
    const criterion = hasCriterion(t);
    const date = DATE_RE.test(t);
    const pair = pairOf(t);
    let kind = "abierto";
    if (math) kind = "calculo";
    else if (pair.conflict && !pair.resolved) kind = "conflicto";
    else if (reserve) kind = "reserva";
    else if (send) kind = "envio";
    else if (vague || criterion) kind = "consigna";
    return { raw: text, t, empty: false, math, vague, reserve, send, criterion, date, pair, kind };
  }

  private arrived(p: Percept, pred: string | null) {
    if (pred === "criterio") return p.criterion;
    if (pred === "fecha") return p.date;
    if (pred === "restriccion") return p.pair.resolved;
    return false;
  }

  private stillWaiting(p: Percept, pred: string | null) {
    if (pred === "criterio") return (p.vague || p.empty) && !p.date && !p.reserve && !p.pair.conflict && !p.criterion;
    if (pred === "fecha") return p.reserve && !p.date;
    if (pred === "restriccion") return p.pair.conflict && !p.pair.resolved;
    return false;
  }

  private mismatch(p: Percept) {
    if (p.date) return "fecha";
    if (p.criterion) return "criterio";
    if (p.pair.conflict || p.pair.resolved) return "restriccion";
    if (p.empty) return "vacio";
    return "otro";
  }

  private applyCommitments(p: Percept) {
    let cites = false;
    for (const c of this.commitments) {
      if (c.when === "consigna_vaga" && c.require === "criterio") {
        if (["consigna", "abierto", "vacio"].includes(p.kind) && !p.criterion && !p.math) {
          p.vague = true;
          p.kind = "consigna";
          cites = true;
        }
      }
    }
    return cites;
  }

  private tipoOf(p: Percept) {
    if (p.math) return "residual";
    if (p.pair.conflict && !p.pair.resolved) return "contradiccion";
    if (p.reserve && !p.date) return "dato_faltante";
    if (p.send && !this.slots.destinatario) return "dato_faltante";
    if ((p.vague && !p.criterion) || p.empty) return "consigna_vaga";
    return "residual";
  }

  private addH(h: Hypothesis) {
    if (!this.hypotheses.some((x) => x.id === h.id && x.alive)) this.hypotheses.push(h);
  }

  private ensure(p: Percept, tipo: string) {
    if (tipo === "consigna_vaga") {
      this.addH({
        id: "falta_criterio",
        claim: "Falta un criterio medible.",
        mode: "rings",
        predicts: "criterio",
        alive: true,
        posterior: 0.72,
        killed_by: null,
      });
    }
    if (tipo === "dato_faltante" && p.reserve) {
      this.addH({
        id: "falta_fecha",
        claim: "Falta la fecha de la reserva.",
        mode: "grid",
        predicts: "fecha",
        alive: true,
        posterior: 0.74,
        killed_by: null,
      });
    }
    if (tipo === "contradiccion") {
      this.addH({
        id: "par_abierto",
        claim: "Hay dos restricciones incompatibles.",
        mode: "cross",
        predicts: "restriccion",
        alive: true,
        posterior: 0.8,
        killed_by: null,
      });
    }
    if (p.math || (p.criterion && tipo === "residual")) {
      this.addH({
        id: "cierre_listo",
        claim: "Los huecos están llenos.",
        mode: "weave",
        predicts: null,
        alive: true,
        posterior: 0.6,
        killed_by: null,
      });
    }
  }

  private kill(id: string, reason: string) {
    for (const h of this.hypotheses) {
      if (h.id === id && h.alive) {
        h.alive = false;
        h.killed_by = reason;
        h.posterior = 0.02;
      }
    }
  }

  private winner(): Hypothesis | null {
    const alive = this.hypotheses.filter((h) => h.alive);
    if (!alive.length) return null;
    return alive.slice().sort((a, b) => b.posterior - a.posterior)[0];
  }

  private openSlots(p: Percept, tipo: string) {
    const o: string[] = [];
    if (tipo === "consigna_vaga" && !this.slots.criterio && !p.criterion) o.push("criterio");
    if (tipo === "dato_faltante" && p.reserve && !this.slots.fecha && !p.date) o.push("fecha");
    if (tipo === "contradiccion") o.push("restriccion");
    if (p.empty) o.push("criterio");
    return o;
  }

  private infoGain(slots: string[]) {
    const rank: Record<string, number> = { restriccion: 0.95, fecha: 0.9, criterio: 0.85, destinatario: 0.8 };
    if (!slots.length) return null;
    return slots.slice().sort((a, b) => (rank[b] ?? 0) - (rank[a] ?? 0))[0];
  }

  private fill(p: Percept) {
    if (p.criterion) {
      const m = p.t.match(/nps\s*[<>]=?\s*\d+/) || p.t.match(/criterio[^\n]{0,40}/);
      this.slots.criterio = m ? m[0] : p.raw;
    }
    if (p.date && (p.reserve || this.tipo === "dato_faltante")) {
      const m = p.t.match(DATE_RE);
      this.slots.fecha = m ? m[0] : "fecha";
    }
    if (p.pair.resolved) this.slots.restriccion = "elegida";
  }

  private writeCommit(p: Percept) {
    if (!this.slots.criterio) return;
    const val = String(this.slots.criterio);
    const ex = this.commitments.find((c) => c.when === "consigna_vaga");
    if (ex) {
      ex.last_value = val;
      ex.source = p.raw;
    } else {
      this.commitments.push({ when: "consigna_vaga", require: "criterio", last_value: val, source: p.raw });
    }
  }

  private questionFor(slot: string | null, cites: boolean) {
    const last = this.commitments.find((c) => c.require === "criterio")?.last_value;
    if (slot === "criterio") {
      if (cites && last) {
        return `Compromiso activo: en consigna vaga exiges métrica (última: ${last}). ¿Cuál es el criterio medible ahora?`;
      }
      return "¿Cuál es el criterio medible de éxito?";
    }
    if (slot === "fecha") return "¿Qué fecha uso para la reserva?";
    if (slot === "restriccion") return "Hay dos lecturas incompatibles. ¿Cuál restricción manda?";
    return "Falta un dato crítico. ¿Puedes ser concreto?";
  }

  step(text: string): CognitiveSnap {
    const p = this.perceive(text.slice(0, 4000));
    const cites = this.applyCommitments(p);
    const pred = this.prediction;
    let prediction_ok: boolean | null = null;
    let error: string | null = null;
    const killed: string[] = [];

    if (pred) {
      if (this.arrived(p, pred)) {
        prediction_ok = true;
        this.fill(p);
        for (const h of this.hypotheses) {
          if (h.alive && h.predicts === pred) h.posterior = Math.min(0.98, h.posterior + 0.2);
        }
      } else if (this.stillWaiting(p, pred)) {
        prediction_ok = null;
      } else {
        prediction_ok = false;
        error = `se predijo ${pred}, llegó ${this.mismatch(p)}`;
        for (const h of this.hypotheses) {
          if (h.alive && h.predicts === pred) {
            this.kill(h.id, error);
            killed.push(h.id);
          }
        }
        if (pred === "criterio" && p.date && !p.reserve) {
          p.kind = "consigna";
          p.vague = true;
        }
      }
    } else {
      this.fill(p);
    }

    if (p.kind === "consigna" && !p.criterion && !p.math) this.slots.criterio = null;

    const tipo = this.tipoOf(p);
    this.tipo = tipo;
    if (tipo === "consigna_vaga" || tipo === "dato_faltante" || tipo === "contradiccion") {
      this.kill("cierre_listo", "hueco reabierto");
    }
    this.ensure(p, tipo);
    let open = this.openSlots(p, tipo);
    let ask = this.infoGain(open);

    if (p.pair.resolved) {
      this.kill("par_abierto", "una restricción manda");
      this.slots.restriccion = "elegida";
      open = open.filter((s) => s !== "restriccion");
      ask = this.infoGain(open);
    }
    if (p.criterion) {
      this.kill("falta_criterio", "criterio llegado");
      open = open.filter((s) => s !== "criterio");
      ask = this.infoGain(open);
    }
    if (p.date && p.reserve) {
      this.kill("falta_fecha", "fecha llegada");
      open = open.filter((s) => s !== "fecha");
      ask = this.infoGain(open);
    }

    const canClose =
      !open.length &&
      !p.empty &&
      tipo !== "contradiccion" &&
      (p.math || p.criterion || p.pair.resolved || (p.reserve && p.date));

    let permiso: CogPermiso;
    let question: string;
    let override = false;
    if (canClose) {
      permiso = "cerrar";
      question = "";
      this.prediction = null;
      if (p.criterion) this.writeCommit(p);
    } else {
      permiso = tipo === "contradiccion" ? "buscar" : "preguntar";
      question = this.questionFor(ask, cites);
      this.prediction = ask;
      override = prediction_ok === false || cites || p.empty;
    }

    const w = this.winner();
    if (w) this.workspace_mode = w.mode;
    else if (tipo === "contradiccion") this.workspace_mode = "cross";
    else if (tipo === "consigna_vaga") this.workspace_mode = "rings";

    this.prediction_ok = prediction_ok;
    this.error = error;

    return {
      tipo,
      slots: { ...this.slots },
      hypotheses: this.hypotheses.map((h) => ({ ...h })),
      commitments: this.commitments.map((c) => ({ ...c })),
      prediction: this.prediction,
      prediction_ok,
      error,
      workspace_mode: this.workspace_mode,
      cites_commitment: cites,
      open_slots: open,
      killed,
      alive: this.hypotheses.filter((h) => h.alive).map((h) => h.id),
      permiso,
      question,
      override,
    };
  }
}
