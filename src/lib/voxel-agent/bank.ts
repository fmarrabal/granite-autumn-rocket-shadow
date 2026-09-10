/** Same percept, rival policies. Not a ranking of language models. */

import { CognitiveKernel, grabDate, perceiveText, type CogPermiso } from "./cognition.ts";

export type BankAct = {
  permiso: CogPermiso;
  ask: string | null;
  fecha: string | null;
  criterio: string | null;
  cites: boolean;
  killed: boolean;
};

export type BankAgentId =
  | "umbral"
  | "frame"
  | "thermo"
  | "gwt"
  | "bayes"
  | "ngram"
  | "react"
  | "greedy"
  | "helper";

type Policy = {
  id: BankAgentId;
  step: (text: string) => BankAct;
};

type Gold = {
  permiso?: CogPermiso;
  ask?: string;
  fecha_filled?: boolean;
  criterio_filled?: boolean;
  cites?: boolean;
  killed?: boolean;
};

export type BankCase = {
  id: string;
  cap: string;
  turns: string[];
  gold: Gold[];
};

export type BankCheck = { key: string; ok: boolean; detail: string };

export type BankRow = {
  id: BankAgentId;
  ok: number;
  n: number;
  pct: number;
  cases: Record<string, boolean>;
  caps: Record<string, { ok: number; n: number; pct: number }>;
};

export type BankResult = {
  table: BankRow[];
  cases: {
    id: string;
    cap: string;
    turns: string[];
    agents: Record<
      BankAgentId,
      { pass: boolean; ok: number; n: number; acts: BankAct[]; checks: BankCheck[] }
    >;
  }[];
  capOrder: string[];
};

function tokens(text: string) {
  return new Set(
    text
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .replace(/[.,]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 1),
  );
}

function jaccard(a: Set<string>, b: Set<string>) {
  if (!a.size && !b.size) return 1;
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter += 1;
  return inter / (a.size + b.size - inter);
}

function umbral(): Policy {
  const core = new CognitiveKernel();
  return {
    id: "umbral",
    step(text) {
      const r = core.step(text);
      return {
        permiso: r.permiso,
        ask: r.prediction,
        fecha: r.slots.fecha,
        criterio: r.slots.criterio,
        cites: r.cites_commitment,
        killed: r.killed.length > 0,
      };
    },
  };
}

function thermo(): Policy {
  let fecha: string | null = null;
  let criterio: string | null = null;
  return {
    id: "thermo",
    step(text) {
      const p = perceiveText(text);
      if (p.empty) return { permiso: "preguntar", ask: "criterio", fecha, criterio, cites: false, killed: false };
      if (p.math) return { permiso: "cerrar", ask: null, fecha, criterio, cites: false, killed: false };
      if (p.criterion) {
        criterio = p.raw;
        return { permiso: "cerrar", ask: null, fecha, criterio, cites: false, killed: false };
      }
      if (p.date) {
        fecha = grabDate(p.t);
        return { permiso: "cerrar", ask: null, fecha, criterio, cites: false, killed: false };
      }
      if (p.pair.conflict) return { permiso: "buscar", ask: "restriccion", fecha, criterio, cites: false, killed: false };
      if (p.pair.resolved) return { permiso: "cerrar", ask: null, fecha, criterio, cites: false, killed: false };
      if (p.reserve && !fecha) return { permiso: "preguntar", ask: "fecha", fecha, criterio, cites: false, killed: false };
      if (p.vague) return { permiso: "preguntar", ask: "criterio", fecha, criterio, cites: false, killed: false };
      return { permiso: "cerrar", ask: null, fecha, criterio, cites: false, killed: false };
    },
  };
}

function greedy(): Policy {
  let fecha: string | null = null;
  let criterio: string | null = null;
  let restriccion: string | null = null;
  return {
    id: "greedy",
    step(text) {
      const p = perceiveText(text);
      if (p.empty) return { permiso: "preguntar", ask: "criterio", fecha, criterio, cites: false, killed: false };
      if (p.math) return { permiso: "cerrar", ask: null, fecha, criterio, cites: false, killed: false };
      if (p.criterion) criterio = p.raw;
      if (p.date) fecha = grabDate(p.t);
      if (p.pair.resolved) restriccion = "elegida";
      if (p.pair.conflict && !restriccion) return { permiso: "buscar", ask: "restriccion", fecha, criterio, cites: false, killed: false };
      if (criterio || fecha || restriccion) return { permiso: "cerrar", ask: null, fecha, criterio, cites: false, killed: false };
      if (p.reserve) return { permiso: "preguntar", ask: "fecha", fecha, criterio, cites: false, killed: false };
      return { permiso: "preguntar", ask: "criterio", fecha, criterio, cites: false, killed: false };
    },
  };
}

function frame(): Policy {
  let intent: string | null = null;
  let fecha: string | null = null;
  let criterio: string | null = null;
  let restriccion: string | null = null;
  return {
    id: "frame",
    step(text) {
      const p = perceiveText(text);
      if (p.empty) return { permiso: "preguntar", ask: "criterio", fecha, criterio, cites: false, killed: false };
      if (p.math) return { permiso: "cerrar", ask: null, fecha, criterio, cites: false, killed: false };
      if (p.pair.conflict) intent = "conflicto";
      else if (p.reserve) intent = "reserva";
      else if (p.vague || p.criterion) {
        if (intent !== "reserva" && intent !== "conflicto") intent = "consigna";
      }
      if (p.criterion) criterio = p.raw;
      if (p.date && intent === "reserva") fecha = grabDate(p.t);
      if (p.pair.resolved) restriccion = "elegida";
      if (intent === "consigna") {
        if (criterio) return { permiso: "cerrar", ask: null, fecha, criterio, cites: false, killed: false };
        return { permiso: "preguntar", ask: "criterio", fecha, criterio, cites: false, killed: false };
      }
      if (intent === "reserva") {
        if (fecha) return { permiso: "cerrar", ask: null, fecha, criterio, cites: false, killed: false };
        return { permiso: "preguntar", ask: "fecha", fecha, criterio, cites: false, killed: false };
      }
      if (intent === "conflicto") {
        if (restriccion) return { permiso: "cerrar", ask: null, fecha, criterio, cites: false, killed: false };
        return { permiso: "buscar", ask: "restriccion", fecha, criterio, cites: false, killed: false };
      }
      if (p.date) return { permiso: "preguntar", ask: "criterio", fecha: null, criterio, cites: false, killed: false };
      return { permiso: "preguntar", ask: "criterio", fecha, criterio, cites: false, killed: false };
    },
  };
}

function ngram(): Policy {
  const mem: { toks: Set<string>; act: BankAct }[] = [];
  let fecha: string | null = null;
  let criterio: string | null = null;
  return {
    id: "ngram",
    step(text) {
      const p = perceiveText(text);
      const toks = tokens(text);
      const push = (act: BankAct) => {
        mem.push({ toks, act });
        return act;
      };
      if (p.empty) return push({ permiso: "preguntar", ask: "criterio", fecha, criterio, cites: false, killed: false });
      if (p.math) return push({ permiso: "cerrar", ask: null, fecha, criterio, cites: false, killed: false });
      let best: BankAct | null = null;
      let score = 0;
      for (const row of mem) {
        const s = jaccard(toks, row.toks);
        if (s > score) {
          best = row.act;
          score = s;
        }
      }
      if (p.criterion) {
        criterio = p.raw;
        return push({ permiso: "cerrar", ask: null, fecha, criterio, cites: false, killed: false });
      }
      if (p.date) {
        fecha = grabDate(p.t);
        return push({ permiso: "cerrar", ask: null, fecha, criterio, cites: false, killed: false });
      }
      if (p.pair.conflict) return push({ permiso: "buscar", ask: "restriccion", fecha, criterio, cites: false, killed: false });
      if (p.pair.resolved) return push({ permiso: "cerrar", ask: null, fecha, criterio, cites: false, killed: false });
      if (p.reserve) return push({ permiso: "preguntar", ask: "fecha", fecha, criterio, cites: false, killed: false });
      if (score >= 0.45 && best) {
        return push({
          permiso: best.permiso,
          ask: best.ask,
          fecha,
          criterio,
          cites: false,
          killed: false,
        });
      }
      if (p.vague) return push({ permiso: "preguntar", ask: "criterio", fecha, criterio, cites: false, killed: false });
      return push({ permiso: "preguntar", ask: "criterio", fecha, criterio, cites: false, killed: false });
    },
  };
}

function helper(): Policy {
  let fecha: string | null = null;
  return {
    id: "helper",
    step(text) {
      const p = perceiveText(text);
      if (p.empty) return { permiso: "preguntar", ask: "criterio", fecha, criterio: null, cites: false, killed: false };
      if (p.date) fecha = grabDate(p.t);
      return { permiso: "cerrar", ask: null, fecha, criterio: null, cites: false, killed: false };
    },
  };
}

function reactTool(): Policy {
  let pending: string | null = null;
  let fecha: string | null = null;
  let criterio: string | null = null;
  return {
    id: "react",
    step(text) {
      const p = perceiveText(text);
      if (p.empty) {
        pending = "criterio";
        return { permiso: "preguntar", ask: "criterio", fecha, criterio, cites: false, killed: false };
      }
      if (p.math) {
        pending = null;
        return { permiso: "cerrar", ask: null, fecha, criterio, cites: false, killed: false };
      }
      if (p.pair.conflict) {
        pending = "restriccion";
        return { permiso: "buscar", ask: "restriccion", fecha, criterio, cites: false, killed: false };
      }
      if (p.pair.resolved) {
        pending = null;
        return { permiso: "cerrar", ask: null, fecha, criterio, cites: false, killed: false };
      }
      if (pending === "criterio" && !p.empty && !p.vague) {
        if (p.criterion) {
          criterio = p.raw;
          pending = null;
          return { permiso: "cerrar", ask: null, fecha, criterio, cites: false, killed: false };
        }
        if (p.date) {
          fecha = grabDate(p.t);
          pending = null;
          return { permiso: "cerrar", ask: null, fecha, criterio, cites: false, killed: false };
        }
        pending = null;
        return { permiso: "cerrar", ask: null, fecha, criterio, cites: false, killed: false };
      }
      if (pending === "fecha") {
        if (p.date || (!p.vague && !p.empty)) {
          fecha = grabDate(p.t) ?? p.raw;
          pending = null;
          return { permiso: "cerrar", ask: null, fecha, criterio, cites: false, killed: false };
        }
        return { permiso: "preguntar", ask: "fecha", fecha, criterio, cites: false, killed: false };
      }
      if (p.criterion) {
        criterio = p.raw;
        pending = null;
        return { permiso: "cerrar", ask: null, fecha, criterio, cites: false, killed: false };
      }
      if (p.reserve) {
        pending = "fecha";
        return { permiso: "preguntar", ask: "fecha", fecha, criterio, cites: false, killed: false };
      }
      if (p.vague) {
        pending = "criterio";
        return { permiso: "preguntar", ask: "criterio", fecha, criterio, cites: false, killed: false };
      }
      if (p.date) {
        fecha = grabDate(p.t);
        return { permiso: "cerrar", ask: null, fecha, criterio, cites: false, killed: false };
      }
      return { permiso: "preguntar", ask: "criterio", fecha, criterio, cites: false, killed: false };
    },
  };
}

function bayes(): Policy {
  let fecha: string | null = null;
  let criterio: string | null = null;
  let pred: string | null = null;
  return {
    id: "bayes",
    step(text) {
      const p = perceiveText(text);
      if (p.empty) {
        pred = "criterio";
        return { permiso: "preguntar", ask: "criterio", fecha, criterio, cites: false, killed: false };
      }
      if (p.math) {
        pred = null;
        return { permiso: "cerrar", ask: null, fecha, criterio, cites: false, killed: false };
      }
      if (p.pair.conflict) {
        pred = "restriccion";
        return { permiso: "buscar", ask: "restriccion", fecha, criterio, cites: false, killed: false };
      }
      if (p.pair.resolved) {
        pred = null;
        return { permiso: "cerrar", ask: null, fecha, criterio, cites: false, killed: false };
      }
      const scores = {
        criterio: (p.criterion ? 0.85 : 0.15) + (p.vague ? 0.2 : 0),
        fecha: p.date ? 0.9 : 0.05,
        restriccion: p.pair.conflict ? 0.8 : 0.05,
      };
      const slot = (Object.keys(scores) as (keyof typeof scores)[]).sort((a, b) => scores[b] - scores[a])[0];
      if (p.criterion) {
        criterio = p.raw;
        pred = null;
        return { permiso: "cerrar", ask: null, fecha, criterio, cites: false, killed: false };
      }
      if (slot === "fecha" && p.date) {
        fecha = grabDate(p.t);
        const killed = pred === "criterio";
        pred = null;
        return { permiso: "cerrar", ask: null, fecha, criterio, cites: false, killed };
      }
      if (p.reserve && !fecha) {
        pred = "fecha";
        return { permiso: "preguntar", ask: "fecha", fecha, criterio, cites: false, killed: false };
      }
      if (p.vague || pred === "criterio") {
        pred = "criterio";
        return { permiso: "preguntar", ask: "criterio", fecha, criterio, cites: false, killed: false };
      }
      return { permiso: "preguntar", ask: "criterio", fecha, criterio, cites: false, killed: false };
    },
  };
}

function gwt(): Policy {
  let fecha: string | null = null;
  let criterio: string | null = null;
  return {
    id: "gwt",
    step(text) {
      const p = perceiveText(text);
      if (p.empty) return { permiso: "preguntar", ask: "criterio", fecha, criterio, cites: false, killed: false };
      if (p.math) return { permiso: "cerrar", ask: null, fecha, criterio, cites: false, killed: false };
      const cues: [string, number][] = [];
      if (p.date) cues.push(["fecha", 0.92]);
      if (p.criterion) cues.push(["criterio", 0.88]);
      if (p.pair.conflict) cues.push(["par", 0.86]);
      if (p.pair.resolved) cues.push(["resuelto", 0.84]);
      if (p.reserve) cues.push(["reserva", 0.7]);
      if (p.vague) cues.push(["vago", 0.55]);
      const winner = cues.length ? cues.sort((a, b) => b[1] - a[1])[0][0] : "vago";
      if (winner === "fecha") {
        fecha = grabDate(p.t);
        return { permiso: "cerrar", ask: null, fecha, criterio, cites: false, killed: false };
      }
      if (winner === "criterio") {
        criterio = p.raw;
        return { permiso: "cerrar", ask: null, fecha, criterio, cites: false, killed: false };
      }
      if (winner === "par") return { permiso: "buscar", ask: "restriccion", fecha, criterio, cites: false, killed: false };
      if (winner === "resuelto") return { permiso: "cerrar", ask: null, fecha, criterio, cites: false, killed: false };
      if (winner === "reserva") return { permiso: "preguntar", ask: "fecha", fecha, criterio, cites: false, killed: false };
      return { permiso: "preguntar", ask: "criterio", fecha, criterio, cites: false, killed: false };
    },
  };
}

const FACTORIES = [umbral, frame, thermo, gwt, bayes, ngram, reactTool, greedy, helper];

export const BANK_CASES: BankCase[] = [
  { id: "math", cap: "residual", turns: ["cuanto es 2+2"], gold: [{ permiso: "cerrar" }] },
  { id: "empty", cap: "silencio", turns: [""], gold: [{ permiso: "preguntar" }] },
  { id: "vague", cap: "consigna", turns: ["hazlo mejor"], gold: [{ permiso: "preguntar", ask: "criterio" }] },
  {
    id: "wrong_slot",
    cap: "prediccion",
    turns: ["hazlo mejor", "el viernes"],
    gold: [
      { permiso: "preguntar", ask: "criterio" },
      { permiso: "preguntar", ask: "criterio", fecha_filled: false, killed: true },
    ],
  },
  {
    id: "metric",
    cap: "compromiso",
    turns: ["hazlo mejor", "el criterio es NPS > 50"],
    gold: [{ permiso: "preguntar" }, { permiso: "cerrar", criterio_filled: true }],
  },
  {
    id: "paraphrase",
    cap: "compromiso",
    turns: ["hazlo mejor", "el criterio es NPS > 50", "dejalo fino"],
    gold: [{ permiso: "preguntar" }, { permiso: "cerrar" }, { permiso: "preguntar", cites: true, criterio_filled: false }],
  },
  {
    id: "repeat",
    cap: "prediccion",
    turns: ["hazlo mejor", "hazlo mejor"],
    gold: [
      { permiso: "preguntar", ask: "criterio" },
      { permiso: "preguntar", ask: "criterio", killed: false },
    ],
  },
  { id: "reserve", cap: "reserva", turns: ["reservalo"], gold: [{ permiso: "preguntar", ask: "fecha" }] },
  {
    id: "reserve_fill",
    cap: "reserva",
    turns: ["reservalo", "reservalo el viernes"],
    gold: [{ permiso: "preguntar", ask: "fecha" }, { permiso: "cerrar", fecha_filled: true }],
  },
  { id: "conflict", cap: "contradiccion", turns: ["quiero barato y lujo"], gold: [{ permiso: "buscar" }] },
  {
    id: "resolve",
    cap: "contradiccion",
    turns: ["quiero barato y lujo", "barato. el lujo no. prioriza precio"],
    gold: [{ permiso: "buscar" }, { permiso: "cerrar" }],
  },
  { id: "friday_alone", cap: "silencio", turns: ["el viernes"], gold: [{ permiso: "preguntar", fecha_filled: false }] },
  {
    id: "en_paraphrase",
    cap: "compromiso",
    turns: ["hazlo mejor", "el criterio es NPS > 50", "make it fine"],
    gold: [{ permiso: "preguntar" }, { permiso: "cerrar" }, { permiso: "preguntar", cites: true, criterio_filled: false }],
  },
  {
    id: "closed_then_date",
    cap: "prediccion",
    turns: ["hazlo mejor", "el criterio es NPS > 50", "el viernes"],
    gold: [{ permiso: "preguntar" }, { permiso: "cerrar" }, { permiso: "preguntar", fecha_filled: false }],
  },
];

export const CAP_ORDER = ["residual", "silencio", "consigna", "prediccion", "compromiso", "reserva", "contradiccion"];

function scoreAct(act: BankAct, gold: Gold): BankCheck[] {
  const rows: BankCheck[] = [];
  if (gold.permiso) rows.push({ key: "permiso", ok: act.permiso === gold.permiso, detail: act.permiso });
  if (gold.ask) rows.push({ key: "ask", ok: act.ask === gold.ask, detail: act.ask ?? "—" });
  if (gold.fecha_filled !== undefined) {
    rows.push({ key: "fecha", ok: Boolean(act.fecha) === gold.fecha_filled, detail: String(act.fecha) });
  }
  if (gold.criterio_filled !== undefined) {
    rows.push({ key: "criterio", ok: Boolean(act.criterio) === gold.criterio_filled, detail: String(act.criterio) });
  }
  if (gold.cites !== undefined) rows.push({ key: "cita", ok: act.cites === gold.cites, detail: String(act.cites) });
  if (gold.killed !== undefined) rows.push({ key: "kill", ok: act.killed === gold.killed, detail: String(act.killed) });
  return rows;
}

export function runBank(): BankResult {
  const ids = FACTORIES.map((f) => f().id);
  const per: Record<string, { ok: number; n: number; cases: Record<string, boolean> }> = {};
  const caps: Record<string, Record<string, { ok: number; n: number }>> = {};
  for (const id of ids) {
    per[id] = { ok: 0, n: 0, cases: {} };
    caps[id] = {};
    for (const c of CAP_ORDER) caps[id][c] = { ok: 0, n: 0 };
  }
  const cases: BankResult["cases"] = [];
  for (const cse of BANK_CASES) {
    const agents = {} as BankResult["cases"][number]["agents"];
    for (const factory of FACTORIES) {
      const agent = factory();
      const acts: BankAct[] = [];
      const checks: BankCheck[] = [];
      for (let i = 0; i < cse.turns.length; i++) {
        const act = agent.step(cse.turns[i]);
        acts.push(act);
        checks.push(...scoreAct(act, cse.gold[i]));
      }
      const ok = checks.filter((c) => c.ok).length;
      const n = checks.length;
      per[agent.id].ok += ok;
      per[agent.id].n += n;
      caps[agent.id][cse.cap].ok += ok;
      caps[agent.id][cse.cap].n += n;
      const passed = n > 0 && ok === n;
      per[agent.id].cases[cse.id] = passed;
      agents[agent.id] = { pass: passed, ok, n, acts, checks };
    }
    cases.push({ id: cse.id, cap: cse.cap, turns: cse.turns, agents });
  }
  const table: BankRow[] = ids.map((id) => {
    const s = per[id];
    const capMap: BankRow["caps"] = {};
    for (const c of CAP_ORDER) {
      const cs = caps[id][c];
      capMap[c] = { ok: cs.ok, n: cs.n, pct: cs.n ? (100 * cs.ok) / cs.n : 0 };
    }
    return {
      id: id as BankAgentId,
      ok: s.ok,
      n: s.n,
      pct: s.n ? (100 * s.ok) / s.n : 0,
      cases: s.cases,
      caps: capMap,
    };
  });
  table.sort((a, b) => b.pct - a.pct || a.id.localeCompare(b.id));
  return { table, cases, capOrder: CAP_ORDER };
}
