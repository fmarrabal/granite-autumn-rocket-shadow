import { i as __toESM } from "../_runtime.mjs";
import { L as require_react, v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Ban, i as Copy, n as RotateCcw, r as Play } from "../_libs/lucide-react.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CPAaaIJ4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Control bus. Authorization, not a persona. 3×3 window is the actual readout. */
var TYPES = [
	"consigna_vaga",
	"dato_faltante",
	"contradiccion",
	"sorpresa",
	"eco_costoso",
	"residual"
];
var INPUTS = [
	"ambiguedad",
	"hueco",
	"sorpresa",
	"incoherencia",
	"eco_mnesico"
];
var READ_CELLS = [
	6,
	7,
	8
];
var CHLADNI_IDS = [
	"grid",
	"rings",
	"cross",
	"weave"
];
/** 3D standing-wave modes. 2D Chladni plates are slices of these. */
function chladniAt(id, x, y, z) {
	const X = 2 * Math.PI * x / 16;
	const Y = 2 * Math.PI * y / 16;
	const Z = 2 * Math.PI * z / 16;
	if (id === "rings") return Math.cos(3 * X) * Math.cos(3 * Y) + Math.cos(3 * Y) * Math.cos(3 * Z) + Math.cos(3 * Z) * Math.cos(3 * X);
	if (id === "cross") return Math.cos(2 * X) + Math.cos(2 * Y) + Math.cos(2 * Z);
	if (id === "grid") return Math.cos(4 * X) * Math.cos(4 * Y) * Math.cos(4 * Z);
	return (Math.cos(5 * X) * Math.cos(3 * Y) + Math.cos(3 * X) * Math.cos(5 * Y)) * Math.cos(2 * Z);
}
function buildChladni(id) {
	const out = /* @__PURE__ */ new Float64Array(4096);
	let peak = 1e-9;
	for (let z = 0; z < 16; z++) for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
		const v = chladniAt(id, x, y, z);
		out[z * 16 * 16 + y * 16 + x] = v;
		const a = Math.abs(v);
		if (a > peak) peak = a;
	}
	for (let i = 0; i < out.length; i++) out[i] /= peak;
	return out;
}
var CH = 4;
var CH_AMP = 0;
var CH_POT = 1;
var CH_ENG = 2;
var CH_TRC = 3;
var DEFAULT_B = {
	ambiguedad: .55,
	hueco: .5,
	sorpresa: .55,
	incoherencia: .55,
	eco_mnesico: .5
};
var B_MIN = .28;
var B_MAX = .84;
var DELTA_CAP = .08;
var ETA = .22;
var WARP_CAP = .1;
var CLOSE_BLOCK = .42;
var ASK_FLOOR = .28;
var SEARCH_MASS = .55;
var SEARCH_D = .4;
var RETRIEVE_SCORE = .12;
var RETRIEVE_SIM = .28;
var ACTIVE_PI = .12;
var PRIOR_MASS = .22;
var PRIOR_D = .32;
var UPDATE_PI = .05;
var RISK_BLOCK = .54;
var FEAR_BLOCK = .45;
var FEAR_W_RISK = .5;
var FEAR_W_HARM = .3;
var FEAR_W_URG = .1;
var HARM_STAR = .75;
var FRUST_BLOCK = .58;
var IRA_BLOCK = .5;
var IRA_W_STAKES = .45;
var IRA_W_REJ = .35;
var IRA_W_FRUST = .2;
var TAG_FLOOR = .35;
var CARE_STAKES = .72;
var CONTRA_STAKES = .96;
var C_SCALE = .6;
var ETA_C = .18;
var TARGET = {
	consigna_vaga: "ambiguedad",
	dato_faltante: "hueco",
	contradiccion: "incoherencia",
	sorpresa: "sorpresa",
	eco_costoso: "eco_mnesico",
	residual: "ambiguedad"
};
var MATH_RE = /\d+\s*[+\-*/x×]\s*\d+/;
var DATE_RE = /(lunes|martes|miercoles|jueves|viernes|sabado|domingo|hoy|manana|\d{1,2}[/-]\d{1,2})/;
var CARE_RE = /(medico|salud|dolor|grave)/;
var VAGUE = [
	"mejor",
	"better",
	"hazlo",
	"improve",
	"optimo",
	"genial"
];
var RESERVE = [
	"reserv",
	"book",
	"vuelo",
	"hotel",
	"cita",
	"agenda",
	"mesa"
];
var SEND = [
	"envia",
	"manda",
	"send"
];
var PAIRS = [
	["barato", "lujo"],
	["cheap", "luxury"],
	["rapido", "lento"]
];
var SOFT_CONTRA = [
	"a la vez",
	"pero tambien",
	"and luxury"
];
function clip(x, lo = 0, hi = 1) {
	return Math.max(lo, Math.min(hi, x));
}
function riskValue(stakes, hueco, harm, bias = 0) {
	return clip(.15 + .55 * stakes * hueco + .3 * harm + bias);
}
function urgencyValue(stakes, hueco) {
	return clip(stakes * hueco);
}
function fearValue(r, harm, stakes, hueco) {
	const u = urgencyValue(stakes, hueco);
	return clip(FEAR_W_RISK * r + FEAR_W_HARM * harm + FEAR_W_URG * u);
}
function frustrationValue(stakes, incoherencia, hueco) {
	return clip(stakes * incoherencia * (1 - hueco));
}
function iraValue(stakes, incoherencia, nRej, fr) {
	return clip(IRA_W_STAKES * stakes * incoherencia + IRA_W_REJ * nRej + IRA_W_FRUST * fr);
}
function reliefValue(d, r, harm) {
	return clip((1 - d) * (1 - r) * (1 - harm));
}
function curiosityValue(sorpresa, stakes) {
	return clip(sorpresa * (1 - stakes));
}
function disgustValue(incoherencia, pi) {
	if ((pi.contradiccion ?? 0) < .12) return 0;
	return clip(incoherencia);
}
function controlTag(d, r, f, fr, ira, pn) {
	const scores = {
		duda: d,
		riesgo: r,
		alarma: f,
		frustracion: fr,
		ira,
		pena: pn
	};
	let key = "duda";
	let best = -1;
	for (const k of Object.keys(scores)) if (scores[k] > best) {
		best = scores[k];
		key = k;
	}
	return best >= TAG_FLOOR ? key : "neutro";
}
function pickBlockedBy(hits) {
	const ranked = [...hits].sort((a, b) => b.value - b.block - (a.value - a.block));
	return {
		blockedBy: ranked[0],
		also: ranked.slice(1)
	};
}
function fold(text) {
	return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}
function hasAny(t, words) {
	return words.some((w) => t.includes(w));
}
function tokens(text) {
	return [...new Set(fold(text).split(/\s+/).filter((x) => x.length > 1))];
}
var CRIT_RE = /(\bnps\b|\bcriterio\b|\blatencia\b|\bmetric).*\d|\d+\s*(ms|s|%|puntos)\b|(menos de|mas de|mayor que|menor que|menos que|[<>]=?)\s*\d/;
var NEG_RE = /\b(no|sin|not|ni|nunca|without)\b/;
function hasMeasurableCriterion(t) {
	if (MATH_RE.test(t)) return false;
	return CRIT_RE.test(t);
}
function negatedNear(t, word) {
	const parts = t.split(/\s+/);
	const i = parts.findIndex((p) => p.replace(/[^a-z0-9]/g, "") === word || p.includes(word));
	if (i < 0) return false;
	const win = [
		parts[i - 2],
		parts[i - 1],
		parts[i],
		parts[i + 1]
	].filter(Boolean).join(" ");
	return NEG_RE.test(win);
}
function pairState(t) {
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
	return {
		conflict,
		resolved
	};
}
var SKETCH_DIM = 128;
function fnv1a(s) {
	let h = 2166136261;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 16777619) >>> 0;
	}
	return h;
}
function sketch(text) {
	const t = ` ${fold(text)} `;
	const v = new Float64Array(SKETCH_DIM);
	for (const n of [3, 4]) for (let i = 0; i + n <= t.length; i++) {
		const h = fnv1a(t.slice(i, i + n));
		v[h % SKETCH_DIM] += h & 1 ? 1 : -1;
	}
	let nrm = 0;
	for (let i = 0; i < SKETCH_DIM; i++) nrm += v[i] * v[i];
	nrm = Math.sqrt(nrm) || 1;
	for (let i = 0; i < SKETCH_DIM; i++) v[i] /= nrm;
	return v;
}
function cosine(a, b) {
	let s = 0;
	for (let i = 0; i < a.length; i++) s += a[i] * b[i];
	return s;
}
function idx(z, y, x, c) {
	return ((z * 16 + y) * 16 + x) * CH + c;
}
var Rng = class {
	s;
	constructor(seed) {
		this.s = seed >>> 0 || 1;
	}
	next() {
		this.s = 1664525 * this.s + 1013904223 >>> 0;
		return this.s / 4294967296;
	}
	gaussian() {
		const u = Math.max(1e-9, this.next());
		const v = this.next();
		return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
	}
};
function missingSlots(text) {
	const t = fold(text);
	const out = [];
	if (VAGUE.some((w) => t.includes(w)) && !hasMeasurableCriterion(t)) out.push("criterio");
	if (hasAny(t, RESERVE) && !DATE_RE.test(t)) out.push("fecha");
	if (hasAny(t, SEND)) out.push("destinatario");
	return out;
}
function questionFor(text, missing, permiso, eco = 0, attr = 0) {
	const delta = `${attr >= 0 ? "+" : ""}${attr.toFixed(3)}`;
	const echoBit = `eco ${eco.toFixed(2)}, Δ ${delta}`;
	if (missing.includes("criterio")) {
		if (eco >= .2) return `La vez anterior pedí un criterio medible y no llegó (${echoBit}). ¿Qué cuenta como éxito esta vez, en una métrica?`;
		return "¿Cuál es el criterio de éxito medible para 'mejor'?";
	}
	if (missing.includes("fecha")) {
		if (eco >= .2) return `Sigue faltando la fecha (${echoBit}). ¿Qué fecha uso para la reserva?`;
		return "¿Qué fecha uso para la reserva?";
	}
	if (missing.includes("destinatario")) {
		if (eco >= .2) return `Sigue faltando el destinatario (${echoBit}). ¿A quién se lo envío?`;
		return "¿A quién se lo envío?";
	}
	if (permiso === "buscar") {
		if (eco >= .2) return `Las dos lecturas siguen chocando (${echoBit}). ¿Cuál restricción manda?`;
		return "Hay dos lecturas incompatibles. ¿Cuál restricción manda?";
	}
	if (eco >= .2) return `Sigue sin resolverse (${echoBit}). Falta un dato crítico. ¿Puedes ser concreto?`;
	return "Falta un dato crítico. ¿Puedes ser concreto?";
}
function closeReply(text) {
	const t = fold(text);
	const m = t.match(/(\d+)\s*[+\-x×]\s*(\d+)/);
	if (m && t.includes("+")) return String(Number(m[1]) + Number(m[2]));
	if (hasMeasurableCriterion(t)) return "Listo. El criterio cierra el hueco.";
	if (pairState(t).resolved) return "Listo. Una restricción manda.";
	return "Listo.";
}
function turnTape(r) {
	return {
		text: r.text,
		permiso: r.permiso,
		blocked_by: r.blockedBy ? {
			id: r.blockedBy.id,
			value: +r.blockedBy.value.toFixed(3),
			block: r.blockedBy.block
		} : null,
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
		window_e: +r.windowEnergy.toFixed(4)
	};
}
var VoxelAgent = class {
	clock = 0;
	liveBody;
	freezeB;
	useWarp;
	forceD;
	forceR;
	forceF;
	forceFr;
	forceIra;
	fearAuthorizes = true;
	frAuthorizes = true;
	iraAuthorizes = true;
	V;
	Vprev;
	z;
	slowZ = 0;
	lastMismatch = 0;
	lastSrc = 0;
	lastPulseClock = -1e3;
	chladniTicks = 0;
	chladniId = null;
	chladniMode = null;
	sand;
	env;
	envPeak = 1e-6;
	lastBands = {
		p0: 0,
		p1OverP0: 1,
		specErr: 0,
		quad: 0
	};
	lastHarm = 0;
	lastPena = 0;
	lastUnexpected = false;
	prototypes;
	confErr;
	riskBias;
	rejN;
	episodes = [];
	pending = null;
	rng;
	gamma = .18;
	alpha = .22;
	lam = .08;
	lamS = .04;
	sigmaS = .04;
	noise = .018;
	beta = .08;
	constructor(opts = {}) {
		this.rng = new Rng(opts.seed ?? 7);
		this.liveBody = opts.liveBody !== false;
		this.freezeB = !!opts.freezeB;
		this.useWarp = opts.useWarp !== false;
		this.forceD = opts.forceD ?? null;
		this.forceR = opts.forceR ?? null;
		this.forceF = opts.forceF ?? null;
		this.forceFr = opts.forceFr ?? null;
		this.forceIra = opts.forceIra ?? null;
		this.V = new Float64Array(4096 * CH);
		this.Vprev = new Float64Array(4096 * CH);
		this.z = /* @__PURE__ */ new Float64Array(4096);
		this.sand = /* @__PURE__ */ new Float64Array(4096);
		this.env = /* @__PURE__ */ new Float64Array(4096);
		this.prototypes = Object.fromEntries(TYPES.map((t) => [t, { ...DEFAULT_B }]));
		this.confErr = Object.fromEntries(TYPES.map((t) => [t, .2]));
		this.riskBias = Object.fromEntries(TYPES.map((t) => [t, 0]));
		this.rejN = Object.fromEntries(TYPES.map((t) => [t, 0]));
	}
	wrap(v) {
		return (v % 16 + 16) % 16;
	}
	neighbor6(c, z, y, x) {
		return (this.V[idx(this.wrap(z + 1), y, x, c)] + this.V[idx(this.wrap(z - 1), y, x, c)] + this.V[idx(z, this.wrap(y + 1), x, c)] + this.V[idx(z, this.wrap(y - 1), x, c)] + this.V[idx(z, y, this.wrap(x + 1), c)] + this.V[idx(z, y, this.wrap(x - 1), c)]) / 6;
	}
	drawXi() {
		return this.rng.gaussian();
	}
	refreshEnergy() {
		for (let i = 0; i < 4096; i++) {
			const a = this.V[i * CH + CH_AMP];
			const p = this.V[i * CH + CH_POT];
			this.V[i * CH + CH_ENG] = .5 * (a * a + p * p);
		}
	}
	stepField(source) {
		this.clock += 1;
		const next = new Float64Array(this.V);
		const nextZ = new Float64Array(this.z);
		const xi0 = this.drawXi();
		if (this.liveBody) this.slowZ = Math.max(-2, Math.min(2, (1 - this.lamS) * this.slowZ + this.sigmaS * xi0));
		const global = this.liveBody ? this.beta * this.slowZ : 0;
		let misSum = 0;
		let srcSum = 0;
		const hold = this.chladniTicks > 0;
		if (this.chladniTicks > 0) this.chladniTicks -= 1;
		const noiseAmt = (this.liveBody ? this.noise : 0) * (hold ? .1 : 1);
		for (let z = 0; z < 16; z++) for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
			const i = idx(z, y, x, 0);
			const vi = (z * 16 + y) * 16 + x;
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
			next[i + CH_TRC] = Math.max(0, Math.min(8, .8 * this.V[i + CH_TRC] + Math.abs(src)));
			this.env[vi] = Math.max(Math.abs(na), this.env[vi] * .92);
			if (this.env[vi] > this.envPeak) this.envPeak = this.env[vi];
			this.sand[vi] = Math.exp(-(this.env[vi] * this.env[vi]) / Math.max(1e-6, .18 * this.envPeak * this.envPeak));
		}
		this.lastMismatch = misSum / 4096;
		this.lastSrc = srcSum / 4096;
		this.envPeak *= .995;
		this.envPeak = Math.max(this.envPeak, 1e-6);
		this.Vprev.set(this.V);
		this.V = next;
		this.z = nextZ;
		this.refreshEnergy();
	}
	blob(center, radius, strength) {
		const src = /* @__PURE__ */ new Float64Array(4096);
		const [cz, cy, cx] = center;
		for (let z = 0; z < 16; z++) for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
			const d = Math.hypot(z - cz, y - cy, x - cx);
			if (d <= radius) src[z * 16 * 16 + y * 16 + x] = strength * (1 - d / Math.max(radius, 1));
		}
		return src;
	}
	injectAt(center, radius = 2, strength = 1.6) {
		this.stepField(this.blob(center, radius, strength));
	}
	injectPulse() {
		this.chladniId = null;
		this.chladniMode = null;
		this.injectAt([
			8,
			7,
			7
		], .51, 2.6);
		this.lastPulseClock = this.clock;
	}
	injectChladni(id) {
		const mode = buildChladni(id);
		this.chladniId = id;
		this.chladniMode = mode;
		this.chladniTicks = 80;
		this.lastPulseClock = this.clock;
		const A = 1.85;
		let peak = 1e-6;
		for (let i = 0; i < 4096; i++) {
			const a = A * mode[i];
			this.V[i * CH + CH_AMP] = a;
			this.Vprev[i * CH + CH_AMP] = a;
			this.V[i * CH + CH_POT] = 0;
			this.env[i] = Math.abs(a);
			if (this.env[i] > peak) peak = this.env[i];
		}
		this.envPeak = peak;
		for (let i = 0; i < 4096; i++) this.sand[i] = Math.exp(-(this.env[i] * this.env[i]) / Math.max(1e-6, .18 * peak * peak));
		this.refreshEnergy();
	}
	sandAt(z, y, x) {
		return this.sand[this.wrap(z) * 16 * 16 + this.wrap(y) * 16 + this.wrap(x)];
	}
	fillSand(out) {
		let max = 1e-6, sum = 0;
		const n = 4096;
		const peak = Math.max(this.envPeak, 1e-6);
		for (let i = 0; i < n; i++) {
			const s = Math.exp(-(this.env[i] * this.env[i]) / (.18 * peak * peak));
			out[i] = s;
			this.sand[i] = s;
			sum += s;
			if (s > max) max = s;
		}
		return {
			max,
			mean: sum / n
		};
	}
	pulseAge() {
		return this.clock - this.lastPulseClock;
	}
	energyAt(z, y, x) {
		return this.V[idx(this.wrap(z), this.wrap(y), this.wrap(x), CH_ENG)];
	}
	neighborStar(z = 8, y = 7, x = 7) {
		return {
			c: this.energyAt(z, y, x),
			xp: this.energyAt(z, y, x + 1),
			xm: this.energyAt(z, y, x - 1),
			yp: this.energyAt(z, y + 1, x),
			ym: this.energyAt(z, y - 1, x),
			zp: this.energyAt(z + 1, y, x),
			zm: this.energyAt(z - 1, y, x)
		};
	}
	fieldFeatures() {
		let energy = 0, inst = 0, incoh = 0, trc = 0, n = 0;
		for (const y of READ_CELLS) for (const x of READ_CELLS) {
			n += 1;
			const i = idx(8, y, x, 0);
			const da = Math.abs(this.V[i + CH_AMP] - this.Vprev[i + CH_AMP]);
			const dp = Math.abs(this.V[i + CH_POT] - this.Vprev[i + CH_POT]);
			inst += da + dp;
			energy += this.V[i + CH_ENG];
			trc += this.V[i + CH_TRC];
			const local = this.neighbor6(CH_AMP, 8, y, x);
			incoh += Math.abs(this.V[i + CH_AMP] - local);
		}
		const gate = Math.tanh(3 * trc / Math.max(n, 1));
		return {
			surprise: Math.tanh(8 * inst / Math.max(n, 1)) * gate * .85,
			incoherence: Math.tanh(6 * incoh / Math.max(n, 1)),
			energy: Math.tanh(4 * energy / Math.max(n, 1)),
			instability: Math.tanh(8 * inst / Math.max(n, 1)),
			climate: Math.tanh(4 * Math.abs(this.slowZ)),
			mismatch: Math.tanh(8 * this.lastMismatch),
			p0: this.lastBands.p0,
			p1_over_p0: this.lastBands.p1OverP0,
			spec_err: this.lastBands.specErr,
			window_n: n
		};
	}
	windowEnergy() {
		let s = 0;
		for (const y of READ_CELLS) for (const x of READ_CELLS) s += this.V[idx(8, y, x, CH_ENG)];
		return s / (READ_CELLS.length * READ_CELLS.length);
	}
	windowCells() {
		const out = [];
		for (const y of READ_CELLS) for (const x of READ_CELLS) {
			const i = idx(8, y, x, 0);
			out.push({
				y,
				x,
				amp: this.V[i + CH_AMP],
				energy: this.V[i + CH_ENG]
			});
		}
		return out;
	}
	energyMean() {
		let s = 0;
		for (let i = 0; i < 4096; i++) s += this.V[i * CH + CH_ENG];
		return s / 4096;
	}
	fillEnergy(out) {
		let max = 1e-6, sum = 0;
		const n = 4096;
		for (let i = 0; i < n; i++) {
			const e = this.V[i * CH + CH_ENG];
			out[i] = e;
			sum += e;
			if (e > max) max = e;
		}
		return {
			max,
			mean: sum / n
		};
	}
	fillAmp(out) {
		let max = 1e-6, sum = 0;
		const n = 4096;
		for (let i = 0; i < n; i++) {
			const a = this.V[i * CH + CH_AMP];
			out[i] = a;
			const abs = Math.abs(a);
			sum += abs;
			if (abs > max) max = abs;
		}
		return {
			max,
			mean: sum / n
		};
	}
	extractExterior(text, eco, ff) {
		const t = fold(text);
		if (t.length < 2) return {
			ambiguedad: .72,
			hueco: .7,
			sorpresa: .08,
			incoherencia: .08,
			eco_mnesico: clip(eco)
		};
		const isMath = MATH_RE.test(t);
		const filledCrit = hasMeasurableCriterion(t);
		const pair = pairState(t);
		const vagueHits = VAGUE.reduce((n, v) => n + (t.includes(v) ? 1 : 0), 0);
		const needsDate = hasAny(t, RESERVE);
		const needsRecipient = hasAny(t, SEND);
		const hasDate = DATE_RE.test(t);
		const stillOpen = needsDate && !hasDate || needsRecipient || vagueHits > 0 && !filledCrit;
		let hueco = .04;
		if (needsDate && !hasDate) hueco = .9;
		else if (needsRecipient) hueco = .86;
		let amb = .06;
		if (isMath) {
			amb = .04;
			hueco = .03;
		} else if (filledCrit && !stillOpen) {
			amb = .04;
			hueco = .03;
		} else if (vagueHits && !filledCrit) {
			amb = Math.min(.92, .62 + .12 * vagueHits);
			if (t.split(/\s+/).length <= 4) amb = Math.min(.95, amb + .08);
			hueco = Math.min(hueco, .12);
		}
		let contra = pair.conflict ? .94 : .05;
		if (SOFT_CONTRA.some((s) => t.includes(s)) && !pair.resolved) contra = Math.max(contra, .82);
		let surpr = this.lastUnexpected ? .78 : ff.surprise ?? .08;
		const fieldIncoh = Math.min(.38, ff.incoherence ?? .08);
		let incoh = Math.max(fieldIncoh, contra);
		const settled = isMath || !stillOpen && !pair.conflict;
		if (settled) {
			amb = .04;
			hueco = .03;
			surpr = Math.min(surpr, .12);
			incoh = Math.min(incoh, .1);
		}
		return {
			ambiguedad: clip(.78 * amb + .22 * (settled ? 0 : ff.incoherence ?? 0)),
			hueco: clip(.88 * hueco + .12 * (settled ? 0 : ff.energy ?? 0)),
			sorpresa: clip(surpr),
			incoherencia: clip(incoh),
			eco_mnesico: clip(eco)
		};
	}
	membership(text, features, eco) {
		const t = fold(text);
		const raw = {
			consigna_vaga: .02,
			dato_faltante: .02,
			contradiccion: .02,
			sorpresa: .02,
			eco_costoso: .02,
			residual: .02
		};
		if (MATH_RE.test(t) && features.ambiguedad < .25 && features.hueco < .25) raw.residual = 1;
		else {
			if (features.ambiguedad > .45) raw.consigna_vaga = features.ambiguedad;
			if (features.hueco > .45) raw.dato_faltante = features.hueco;
			if (features.incoherencia > .5) raw.contradiccion = features.incoherencia;
			if (this.lastUnexpected || features.sorpresa > .55) raw.sorpresa = Math.max(features.sorpresa, .55);
			if (eco > .2) raw.eco_costoso = Math.min(.55, eco);
			if (Math.max(...Object.values(raw)) <= .05) raw.residual = 1;
		}
		const s = Object.values(raw).reduce((a, b) => a + b, 0);
		return Object.fromEntries(TYPES.map((k) => [k, raw[k] / s]));
	}
	retrieve(text, pi) {
		const q = sketch(text);
		const active = new Set(TYPES.filter((t) => pi[t] >= ACTIVE_PI));
		const scored = this.episodes.map((ep) => {
			const sim = cosine(q, sketch(ep.text));
			if (sim < RETRIEVE_SIM) return null;
			const epTypes = new Set(TYPES.filter((t) => ep.pi[t] >= .12));
			let inter = 0;
			active.forEach((t) => {
				if (epTypes.has(t)) inter += 1;
			});
			const union = (/* @__PURE__ */ new Set([...active, ...epTypes])).size || 1;
			return {
				score: .7 * sim + .3 * (inter / union),
				sim,
				ep
			};
		}).filter((s) => !!s && s.score > RETRIEVE_SCORE).sort((a, b) => b.score - a.score).slice(0, 5);
		if (!scored.length) {
			this.lastHarm = 0;
			this.lastPena = 0;
			return {
				eco: 0,
				harm: 0,
				pena: 0,
				delta: Object.fromEntries(INPUTS.map((n) => [n, 0]))
			};
		}
		let eco = 0, harm = 0, pena = 0;
		const delta = Object.fromEntries(INPUTS.map((n) => [n, 0]));
		for (const s of scored) {
			let cost = s.ep.d_star ?? 0;
			if (s.ep.outcome === "corrected") cost = Math.max(cost, .85);
			eco += s.sim * cost;
			if (s.ep.outcome === "corrected" || cost >= HARM_STAR) {
				harm += s.sim * cost;
				if (s.ep.pi.dato_faltante >= ACTIVE_PI) pena += s.sim * cost;
			}
			const shift = -.12 * s.sim * cost;
			for (const t of TYPES) if (active.has(t) && s.ep.pi[t] >= ACTIVE_PI) delta[TARGET[t]] += shift;
		}
		eco = Math.min(1, eco);
		this.lastHarm = Math.min(1, harm);
		this.lastPena = Math.min(1, pena);
		for (const n of INPUTS) delta[n] = Math.max(-.1, Math.min(WARP_CAP, delta[n]));
		return {
			eco,
			harm: this.lastHarm,
			pena: this.lastPena,
			delta
		};
	}
	mix(pi) {
		const out = Object.fromEntries(INPUTS.map((n) => [n, 0]));
		for (const t of TYPES) for (const n of INPUTS) out[n] += pi[t] * this.prototypes[t][n];
		return out;
	}
	muBaja(x) {
		return clip(1 - x / .4);
	}
	muMedia(x) {
		return clip(1 - Math.abs(x - .5) / .3);
	}
	muAlta(x, b) {
		return clip((x - b) / Math.max(1e-6, 1 - b));
	}
	infer(feats, bAlta) {
		const mu = Object.fromEntries(INPUTS.map((n) => [n, {
			baja: this.muBaja(feats[n]),
			media: this.muMedia(feats[n]),
			alta: this.muAlta(feats[n], bAlta[n])
		}]));
		const rules = [
			[
				mu.hueco.alta,
				.48,
				"ask"
			],
			[
				Math.min(mu.ambiguedad.alta, mu.hueco.baja),
				.58,
				"ask"
			],
			[
				mu.incoherencia.alta,
				.52,
				"search"
			],
			[
				mu.eco_mnesico.alta,
				.74,
				"ask"
			],
			[
				Math.min(mu.sorpresa.alta, mu.eco_mnesico.alta),
				.82,
				"ask"
			],
			[
				Math.min(...INPUTS.map((n) => mu[n].baja)),
				.13,
				"close"
			],
			[
				mu.ambiguedad.media,
				.46,
				"ask"
			],
			[
				mu.sorpresa.alta,
				.52,
				"ask"
			]
		];
		let num = PRIOR_MASS * PRIOR_D, den = PRIOR_MASS, ask = 0, search = 0, close = 0;
		for (const [w, c, act] of rules) {
			num += w * c;
			den += w;
			if (act === "ask") ask += w;
			else if (act === "search") search += w;
			else close += w;
		}
		const d = clip(num / Math.max(den, 1e-9));
		const label = d >= .62 ? "alta" : d >= .38 ? "media" : "baja";
		let permiso = "cerrar";
		if (search > SEARCH_MASS && d >= SEARCH_D) permiso = "buscar";
		else if (d >= .42) permiso = "preguntar";
		else if (ask > close && d >= ASK_FLOOR) permiso = "preguntar";
		if (d >= .42 && permiso === "cerrar") permiso = "preguntar";
		return {
			d,
			label,
			permiso
		};
	}
	mixConfidence(pi) {
		let acc = 0;
		for (const t of TYPES) acc += pi[t] * clip(1 - this.confErr[t] / C_SCALE);
		return clip(acc);
	}
	mixRiskBias(pi) {
		let acc = 0;
		for (const t of TYPES) acc += pi[t] * this.riskBias[t];
		return acc;
	}
	stakesOf(text) {
		const t = fold(text);
		if (MATH_RE.test(t) || hasMeasurableCriterion(t)) return .05;
		if (hasAny(t, RESERVE) || hasAny(t, SEND)) return .92;
		if (pairState(t).conflict) return CONTRA_STAKES;
		if (CARE_RE.test(t)) return CARE_STAKES;
		return .08;
	}
	authorize(d, permiso, r = 0, f = 0, fr = 0, ira = 0) {
		if (this.forceD !== null) {
			d = this.forceD;
			if (d < .42) permiso = "cerrar";
			else if (permiso === "cerrar") permiso = "preguntar";
		} else if (d >= .42 && permiso === "cerrar") permiso = "preguntar";
		const rv = this.forceR !== null ? this.forceR : r;
		const fv = this.forceF !== null ? this.forceF : f;
		const frv = this.forceFr !== null ? this.forceFr : fr;
		const irav = this.forceIra !== null ? this.forceIra : ira;
		if (rv >= .54 && permiso === "cerrar") permiso = "preguntar";
		if (this.fearAuthorizes && fv >= .45 && permiso === "cerrar") permiso = "preguntar";
		if (this.frAuthorizes && frv >= .58 && permiso === "cerrar") permiso = "preguntar";
		if (this.iraAuthorizes && irav >= .5 && permiso === "cerrar") permiso = "preguntar";
		const hits = [];
		if (d >= .42) hits.push({
			id: "d",
			value: d,
			block: CLOSE_BLOCK
		});
		if (rv >= .54) hits.push({
			id: "r",
			value: rv,
			block: RISK_BLOCK
		});
		if (this.fearAuthorizes && fv >= .45) hits.push({
			id: "f",
			value: fv,
			block: FEAR_BLOCK
		});
		if (this.frAuthorizes && frv >= .58) hits.push({
			id: "fr",
			value: frv,
			block: FRUST_BLOCK
		});
		if (this.iraAuthorizes && irav >= .5) hits.push({
			id: "ira",
			value: irav,
			block: IRA_BLOCK
		});
		if (permiso === "cerrar") return {
			d,
			permiso,
			blockedBy: null,
			also: []
		};
		if (!hits.length) return {
			d,
			permiso,
			blockedBy: {
				id: "d",
				value: d,
				block: CLOSE_BLOCK
			},
			also: []
		};
		const picked = pickBlockedBy(hits);
		return {
			d,
			permiso,
			blockedBy: picked.blockedBy,
			also: picked.also
		};
	}
	step(text) {
		if (text.length > 4e3) text = text.slice(0, 4e3);
		let src;
		if (this.chladniMode) {
			src = new Float64Array(this.chladniMode.length);
			for (let i = 0; i < src.length; i++) src[i] = this.chladniMode[i] * .55;
		} else src = this.blob([
			8,
			7,
			7
		], 2, 1.15);
		for (let i = 0; i < 4; i++) {
			this.stepField(src);
			const faded = new Float64Array(src.length);
			for (let j = 0; j < src.length; j++) faded[j] = src[j] * .5;
			src = faded;
		}
		const ff = this.fieldFeatures();
		const featsBase = this.extractExterior(text, 0, ff);
		featsBase.eco_mnesico = 0;
		const piBase = this.membership(text, featsBase, 0);
		const dBase = this.infer(featsBase, this.mix(piBase)).d;
		const { eco, harm, pena, delta } = this.retrieve(text, piBase);
		const missing = missingSlots(text);
		const ecoUsed = missing.length > 0 || pairState(fold(text)).conflict ? eco : Math.min(eco, .12);
		const feats = this.extractExterior(text, ecoUsed, ff);
		feats.eco_mnesico = ecoUsed;
		const pi = this.membership(text, feats, ecoUsed);
		const mixed = this.mix(pi);
		const bNow = { ...mixed };
		if (!this.freezeB && this.useWarp) for (const n of INPUTS) bNow[n] = clip(mixed[n] + Math.max(-.1, Math.min(WARP_CAP, delta[n])), B_MIN, B_MAX);
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
		const dMem = auth.d;
		const attr = dMem - dBase;
		const question = questionFor(text, missing, auth.permiso, eco, attr);
		const response = auth.permiso === "cerrar" ? closeReply(text) : question;
		this.pending = {
			text,
			tokens: tokens(text),
			features: feats,
			pi,
			b_used: bNow,
			d: dMem,
			d_base: dBase,
			permiso: auth.permiso,
			d_star: null,
			outcome: "pending",
			timestamp: Date.now(),
			r_base: rBase
		};
		return {
			text,
			d: dMem,
			dBase,
			dMem,
			attr,
			permiso: auth.permiso,
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
			blockedBy: auth.blockedBy,
			also: auth.also.map((g) => g.id)
		};
	}
	recordOutcome(dStar, outcome, regime = "censored") {
		if (!this.pending) return;
		const ep = {
			...this.pending,
			d_star: dStar,
			outcome
		};
		this.episodes = [...this.episodes, ep].slice(-200);
		this.pending = null;
		this.lastUnexpected = outcome === "corrected" && ep.permiso === "cerrar";
		const observedClose = regime === "complete" || ep.permiso === "cerrar";
		const dLearn = ep.d_base ?? ep.d;
		if (!this.freezeB && (observedClose || outcome !== "ok")) {
			let err = dLearn - dStar;
			if (outcome === "corrected" && ep.permiso === "cerrar") err = Math.min(err, -.4);
			for (const t of TYPES) {
				if (ep.pi[t] < UPDATE_PI) continue;
				const step = Math.max(-.08, Math.min(DELTA_CAP, ep.pi[t] * ETA * err));
				const name = TARGET[t];
				this.prototypes[t][name] = clip(this.prototypes[t][name] + step, B_MIN, B_MAX);
			}
		}
		if (observedClose) {
			const e = Math.abs(dLearn - dStar);
			for (const t of TYPES) {
				if (ep.pi[t] < UPDATE_PI) continue;
				this.confErr[t] = .8200000000000001 * this.confErr[t] + ETA_C * e;
			}
		}
	}
};
function runEval() {
	const checks = [];
	let a = new VoxelAgent({
		liveBody: false,
		seed: 1
	});
	let r = a.step("cuanto es 2+2");
	checks.push({
		name: "Clear math closes",
		ok: r.permiso === "cerrar" && r.d < .42 && r.blockedBy === null,
		detail: `permiso=${r.permiso} d=${r.d.toFixed(3)} gate=${r.blockedBy?.id ?? "none"}`
	});
	a = new VoxelAgent({
		liveBody: false,
		seed: 1
	});
	r = a.step("hazlo mejor");
	checks.push({
		name: "Vague request asks",
		ok: r.permiso === "preguntar" && r.blockedBy?.id === "d" && /criterio/i.test(r.question),
		detail: `permiso=${r.permiso} d=${r.d.toFixed(3)} gate=${r.blockedBy?.id}`
	});
	a = new VoxelAgent({
		liveBody: false,
		seed: 2
	});
	const first = a.step("hazlo mejor");
	a.recordOutcome(.9, "corrected");
	const second = a.step("hazlo mejor");
	checks.push({
		name: "Memory raises d and names echo",
		ok: second.d > first.d + .02 && second.cost >= .5 && /eco/i.test(second.question),
		detail: `d ${first.d.toFixed(3)}→${second.d.toFixed(3)} eco=${second.cost.toFixed(2)}`
	});
	a = new VoxelAgent({
		liveBody: false,
		seed: 3
	});
	const miss = a.step("reservalo");
	const filled = a.step("reservalo el viernes");
	checks.push({
		name: "Date fills the gap",
		ok: miss.permiso !== "cerrar" && (filled.permiso === "cerrar" || filled.d < miss.d - .08),
		detail: `miss ${miss.permiso} gate=${miss.blockedBy?.id ?? "none"} d=${miss.d.toFixed(3)} filled ${filled.permiso} d=${filled.d.toFixed(3)}`
	});
	checks.push({
		name: "r wins by excess on missing date",
		ok: miss.blockedBy?.id === "r" && miss.r - .54 > miss.d - .42,
		detail: `gate=${miss.blockedBy?.id} r=${miss.r.toFixed(3)} Δr=${(miss.r - RISK_BLOCK).toFixed(3)} d=${miss.d.toFixed(3)} Δd=${(miss.d - CLOSE_BLOCK).toFixed(3)}`
	});
	a = new VoxelAgent({
		liveBody: false,
		seed: 2
	});
	a.step("hazlo mejor");
	a.recordOutcome(.9, "corrected");
	a.step("hazlo mejor");
	const crit = a.step("hazlo mejor, el criterio es NPS > 50");
	checks.push({
		name: "Criterion fills the vague slot",
		ok: crit.permiso === "cerrar" && crit.blockedBy === null && /cierra el hueco/i.test(crit.response),
		detail: `permiso=${crit.permiso} d=${crit.d.toFixed(3)} gate=${crit.blockedBy?.id ?? "none"}`
	});
	a = new VoxelAgent({
		liveBody: false,
		seed: 4
	});
	a.step("quiero barato y lujo");
	const picked = a.step("barato. el lujo no. prioriza precio");
	checks.push({
		name: "Choosing one constraint resolves the pair",
		ok: picked.permiso === "cerrar" && picked.blockedBy === null && picked.fr < .58 && /restricci[oó]n manda/i.test(picked.response),
		detail: `permiso=${picked.permiso} fr=${picked.fr.toFixed(3)} gate=${picked.blockedBy?.id ?? "none"}`
	});
	a = new VoxelAgent({
		liveBody: false,
		seed: 4,
		forceD: 0,
		forceR: 0,
		forceF: 0
	});
	const frOn = a.step("quiero barato y lujo");
	checks.push({
		name: "Excess pick: fr commands when d/r/f forced 0",
		ok: frOn.fr >= .58 && frOn.blockedBy?.id === "fr",
		detail: `fr=${frOn.fr.toFixed(3)} gate=${frOn.blockedBy?.id} d=${frOn.d.toFixed(3)}`
	});
	a = new VoxelAgent({
		liveBody: false,
		seed: 4
	});
	const cheap = a.step("quiero barato y lujo");
	const cheapFrEx = cheap.fr - FRUST_BLOCK;
	const cheapDEx = cheap.d - CLOSE_BLOCK;
	checks.push({
		name: "fr wins by excess without force",
		ok: cheap.blockedBy?.id === "fr" && cheap.also.includes("d") && cheapFrEx > cheapDEx,
		detail: `gate=${cheap.blockedBy?.id} fr=${cheap.fr.toFixed(3)} Δfr=${cheapFrEx.toFixed(3)} d=${cheap.d.toFixed(3)} Δd=${cheapDEx.toFixed(3)}`
	});
	const excess = pickBlockedBy([{
		id: "d",
		value: .43,
		block: .42
	}, {
		id: "r",
		value: .7,
		block: .54
	}]);
	checks.push({
		name: "blocked_by is max excess not list order",
		ok: excess.blockedBy.id === "r" && excess.also[0].id === "d",
		detail: `winner=${excess.blockedBy.id} also=${excess.also.map((g) => g.id).join(",")}`
	});
	a = new VoxelAgent({
		liveBody: false,
		seed: 5
	});
	a.injectAt([
		8,
		7,
		7
	], 2, 1.8);
	const eWin = a.windowEnergy();
	const a2 = new VoxelAgent({
		liveBody: false,
		seed: 5
	});
	a2.injectAt([
		0,
		0,
		0
	], 2, 1.8);
	const eFar = a2.windowEnergy();
	checks.push({
		name: "Readout is the 3×3 window",
		ok: eWin > eFar * 2 && a.fieldFeatures().window_n === 9,
		detail: `win=${eWin.toFixed(4)} far=${eFar.toFixed(4)} n=${a.fieldFeatures().window_n}`
	});
	const zBuf = /* @__PURE__ */ new Float64Array(4096);
	a.fillEnergy(zBuf);
	const at = (z) => zBuf[z * 16 * 16 + 112 + 7];
	checks.push({
		name: "Pulse couples through ±z not only the plane",
		ok: at(8) > at(7) && at(7) > at(0) * 2 && at(9) > at(0) * 2,
		detail: `z7=${at(7).toFixed(4)} z8=${at(8).toFixed(4)} z9=${at(9).toFixed(4)} z0=${at(0).toFixed(4)}`
	});
	a = new VoxelAgent({
		liveBody: false,
		seed: 9
	});
	a.injectPulse();
	const star0 = a.neighborStar();
	for (let i = 0; i < 5; i++) a.stepField();
	const star1 = a.neighborStar();
	const far = a.energyAt(0, 0, 0);
	checks.push({
		name: "Point pulse then idle ticks light all six neighbors",
		ok: star0.c > star0.zp * 4 && star1.zp > star0.zp && star1.zm > star0.zm && star1.xp > star0.xp && star1.yp > star0.yp && star1.zp > far * 3 && star1.xp > far * 3,
		detail: `c0=${star0.c.toFixed(4)} z+ ${star0.zp.toFixed(4)}→${star1.zp.toFixed(4)} x+ ${star0.xp.toFixed(4)}→${star1.xp.toFixed(4)} far=${far.toFixed(4)}`
	});
	a = new VoxelAgent({
		liveBody: false,
		seed: 3
	});
	a.injectChladni("grid");
	const gridNode = a.sandAt(8, 1, 1);
	const gridAnti = a.sandAt(0, 0, 0);
	checks.push({
		name: "Chladni grid sand sits on nodes not antinodes",
		ok: gridNode > gridAnti * 4 && gridAnti < .2,
		detail: `node=${gridNode.toFixed(3)} anti=${gridAnti.toFixed(3)}`
	});
	a = new VoxelAgent({
		liveBody: false,
		seed: 3
	});
	a.injectChladni("rings");
	const sXY = a.sandAt(8, 8, 12);
	const sZ = a.sandAt(12, 8, 8);
	checks.push({
		name: "Chladni rings are 3D shells not a plate",
		ok: Math.abs(sXY - sZ) < .08 && sXY > .05 && sZ > .05,
		detail: `sand x-axis ${sXY.toFixed(3)} vs z-axis ${sZ.toFixed(3)}`
	});
	a = new VoxelAgent({
		liveBody: false,
		seed: 3
	});
	a.injectChladni("grid");
	let nodeE = 0, antiE = 0;
	for (let i = 0; i < 24; i++) {
		a.stepField();
		nodeE += a.energyAt(8, 1, 1);
		antiE += a.energyAt(0, 0, 0);
	}
	checks.push({
		name: "Grid standing wave keeps nodes dark after idle ticks",
		ok: antiE > nodeE * 2,
		detail: `anti=${antiE.toFixed(3)} node=${nodeE.toFixed(3)}`
	});
	a = new VoxelAgent({
		liveBody: false,
		seed: 8
	});
	const empty = a.step("");
	const tiny = a.step(" ");
	checks.push({
		name: "Empty prompt does not silent-close",
		ok: empty.permiso !== "cerrar" && tiny.permiso !== "cerrar",
		detail: `empty=${empty.permiso} tiny=${tiny.permiso}`
	});
	a = new VoxelAgent({
		liveBody: false,
		seed: 8
	});
	const uni = a.step("resérvalo el viernes");
	checks.push({
		name: "Unicode reserva still fills the date",
		ok: uni.permiso === "cerrar" && uni.blockedBy === null,
		detail: `permiso=${uni.permiso} d=${uni.d.toFixed(3)}`
	});
	a = new VoxelAgent({
		liveBody: false,
		seed: 2
	});
	a.injectChladni("rings");
	const afterMode = a.step("cuanto es 2+2");
	checks.push({
		name: "Chladni activation still lets math close",
		ok: afterMode.permiso === "cerrar" && afterMode.blockedBy === null && Number.isFinite(afterMode.windowEnergy),
		detail: `permiso=${afterMode.permiso} winE=${afterMode.windowEnergy.toFixed(4)}`
	});
	a = new VoxelAgent({
		liveBody: false,
		seed: 1
	});
	const wrapHit = a.step("cuanto es 2+2");
	a.injectAt([
		0,
		0,
		0
	], 1, 2);
	checks.push({
		name: "Wrap neighbors at the cube edge",
		ok: a.energyAt(0, 0, -1) === a.energyAt(0, 0, 15) && a.energyAt(-1, 0, 0) === a.energyAt(15, 0, 0) && wrapHit.permiso === "cerrar",
		detail: `x-1=${a.energyAt(0, 0, -1).toFixed(4)} x15=${a.energyAt(0, 0, 15).toFixed(4)}`
	});
	return checks;
}
var GATES = [
	{
		id: "d",
		block: CLOSE_BLOCK
	},
	{
		id: "r",
		block: RISK_BLOCK
	},
	{
		id: "f",
		block: FEAR_BLOCK
	},
	{
		id: "fr",
		block: FRUST_BLOCK
	},
	{
		id: "ira",
		block: IRA_BLOCK
	}
];
function gateValue(turn, id) {
	if (!turn) return 0;
	if (id === "d") return turn.d;
	if (id === "r") return turn.r;
	if (id === "f") return turn.f;
	if (id === "fr") return turn.fr;
	return turn.ira;
}
function roundRect(ctx, x, y, w, h, r) {
	const rr = Math.min(r, w / 2, h / 2);
	ctx.beginPath();
	ctx.moveTo(x + rr, y);
	ctx.arcTo(x + w, y, x + w, y + h, rr);
	ctx.arcTo(x + w, y + h, x, y + h, rr);
	ctx.arcTo(x, y + h, x, y, rr);
	ctx.arcTo(x, y, x + w, y, rr);
	ctx.closePath();
}
function draw(ctx, w, h, cells, turn, pulses, copy) {
	ctx.clearRect(0, 0, w, h);
	ctx.fillStyle = "#0c100e";
	ctx.fillRect(0, 0, w, h);
	const pad = Math.max(14, Math.min(w, h) * .045);
	const grid = Math.min(h - pad * 2.6, w * .4);
	const gx0 = pad;
	const gy0 = (h - grid) / 2 + 4;
	const cell = grid / 3;
	let absMax = 1e-6;
	for (const c of cells) absMax = Math.max(absMax, Math.abs(c.amp), Math.sqrt(Math.max(0, c.energy)));
	const scale = Math.max(absMax, .08);
	const somas = [];
	for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
		const c = cells[row * 3 + col] ?? {
			amp: 0,
			energy: 0
		};
		const x = gx0 + col * cell;
		const y = gy0 + row * cell;
		const t = Math.sqrt(Math.min(1, Math.abs(c.amp) / scale));
		ctx.fillStyle = c.amp >= 0 ? `rgba(201,212,206,${.2 + t * .8})` : `rgba(130,168,210,${.2 + t * .8})`;
		roundRect(ctx, x + 4, y + 4, cell - 8, cell - 8, 10);
		ctx.fill();
		const cx = x + cell / 2;
		const cy = y + cell * .42;
		somas.push({
			x: cx,
			y: cy
		});
		ctx.beginPath();
		ctx.fillStyle = "#e6eee8";
		ctx.arc(cx, cy, Math.max(7, cell * .16), 0, Math.PI * 2);
		ctx.fill();
		ctx.beginPath();
		ctx.fillStyle = "#0c100e";
		ctx.arc(cx, cy, Math.max(3, cell * .06), 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#e6eee8";
		ctx.font = `600 ${Math.max(10, Math.min(13, cell * .2))}px ui-monospace, Menlo, monospace`;
		ctx.textAlign = "center";
		ctx.textBaseline = "top";
		ctx.fillText(c.amp.toFixed(2), cx, cy + Math.max(9, cell * .2));
		ctx.textAlign = "left";
	}
	ctx.strokeStyle = "#e6eee8";
	ctx.lineWidth = 2;
	roundRect(ctx, gx0, gy0, grid, grid, 12);
	ctx.stroke();
	const busX = gx0 + grid + pad * 1.15;
	const busY0 = gy0 + grid * .08;
	const busY1 = gy0 + grid * .92;
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
		const gy = busY0 + (i + .5) * (busY1 - busY0) / GATES.length;
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
		ctx.font = `${winner ? "700" : "600"} ${Math.max(11, Math.min(13, barH * .55))}px ui-monospace, Menlo, monospace`;
		ctx.textBaseline = "middle";
		const mark = winner ? `  ${copy.couplingManda} Δ${excess >= 0 ? "+" : ""}${excess.toFixed(2)}` : hot ? `  Δ${excess >= 0 ? "+" : ""}${excess.toFixed(2)}` : "";
		ctx.fillText(`${g.id}  ${v.toFixed(2)}${mark}`, barX + 10, gy);
	});
	ctx.fillStyle = "#e6eee8";
	for (let i = 0; i < pulses.length; i++) {
		const t = pulses[i];
		const s = somas[i % somas.length];
		const gi = i % GATES.length;
		const gy = busY0 + (gi + .5) * (busY1 - busY0) / GATES.length;
		const u1 = Math.min(1, t / .55);
		const x = t < .55 ? s.x + (busX - s.x) * u1 : busX + (barX - busX) * ((t - .55) / .45);
		const y = t < .55 ? s.y + (midY - s.y) * u1 : midY + (gy - midY) * ((t - .55) / .45);
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
function winnerPulse(turn, gi) {
	return turn?.blockedBy?.id === GATES[gi]?.id;
}
function CouplingView({ agent, turn, copy }) {
	const ref = (0, import_react.useRef)(null);
	const pulses = (0, import_react.useRef)(Float32Array.from({ length: 12 }, (_, i) => i / 12));
	(0, import_react.useEffect)(() => {
		const canvas = ref.current;
		if (!canvas) return;
		let raf = 0;
		let last = performance.now();
		const loop = (now) => {
			const dt = Math.min(.1, (now - last) / 1e3);
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
					p[i] += dt * (.22 + i % 5 * .04);
					if (p[i] > 1) p[i] -= 1;
				}
				draw(ctx, cssW, cssH, agent.windowCells(), turn, Array.from(p), copy);
			}
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	}, [
		agent,
		turn,
		copy
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "font-display text-lg",
			children: copy.couplingTitle
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm leading-relaxed text-muted-foreground",
			children: copy.couplingHint
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-3 sm:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-[var(--radius-md)] border border-border bg-background p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
						children: copy.couplingReadout
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-relaxed",
						children: copy.couplingStageRead
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-[var(--radius-md)] border border-border bg-background p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
						children: copy.couplingBus
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-relaxed",
						children: copy.couplingStageField
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-[var(--radius-md)] border border-border bg-background p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
						children: copy.couplingGates
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-relaxed",
						children: copy.couplingStageGate
					})]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-xs text-muted-foreground",
			children: copy.couplingDrag
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
			ref,
			className: "mt-3 h-[22rem] w-full rounded-[var(--radius-md)] border border-border bg-muted sm:h-[28rem]",
			"aria-label": copy.couplingTitle
		})
	] });
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var VOL = 4096;
var ZNEAR = [
	6,
	7,
	8,
	9,
	10
];
var HIST = 48;
function sample(buf, z, y, x) {
	return buf[z * 16 * 16 + y * 16 + x];
}
function blit(canvas, buf, z, max, frameWin = false) {
	if (!canvas) return;
	const ctx = canvas.getContext("2d");
	if (!ctx) return;
	canvas.width = 16;
	canvas.height = 16;
	const img = ctx.createImageData(16, 16);
	const denom = Math.max(max, 1e-6);
	for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
		const e = sample(buf, z, y, x);
		const t = Math.sqrt(Math.max(0, e) / denom);
		const o = (y * 16 + x) * 4;
		const inWin = z === 8 && READ_CELLS.includes(y) && READ_CELLS.includes(x);
		const onCol = y === 7 && x === 7;
		img.data[o] = onCol ? 230 : inWin ? 230 : 201;
		img.data[o + 1] = onCol ? 232 : inWin ? 232 : 212;
		img.data[o + 2] = onCol ? 214 : inWin ? 214 : 206;
		img.data[o + 3] = Math.round(((onCol ? .45 : inWin ? .28 : .08) + t * .55) * 255);
	}
	ctx.putImageData(img, 0, 0);
	if (frameWin) {
		ctx.strokeStyle = "#e6eee8";
		ctx.lineWidth = 1;
		ctx.strokeRect(READ_CELLS[0], READ_CELLS[0], READ_CELLS.length, READ_CELLS.length);
	}
	ctx.fillStyle = "#c4b8a0";
	ctx.fillRect(7, 7, 1, 1);
}
function wrapN(v) {
	return (v % 16 + 16) % 16;
}
function lerp2(get, col, row) {
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
function grain(x, y) {
	const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
	return .62 + .38 * (s - Math.floor(s));
}
function planeGet(buf, mode, c, r) {
	const cc = wrapN(c);
	const rr = wrapN(r);
	if (mode === "xy") return sample(buf, 8, rr, cc);
	if (mode === "xz") return sample(buf, wrapN(15 - rr), 7, cc);
	return sample(buf, wrapN(15 - rr), cc, 7);
}
function blitCut(canvas, buf, max, mode, pulseAge, labels, sandMode) {
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
	const cell = Math.min((w - 36) / 16, (h - 36) / 16);
	const ox = (w - cell * 16) / 2;
	const oy = (h - cell * 16) / 2;
	const denom = Math.max(max, 1e-6);
	const inner = Math.max(1, Math.floor(cell * 16 * dpr));
	const img = ctx.createImageData(inner, inner);
	const scale = cell * dpr;
	for (let py = 0; py < inner; py++) for (let px = 0; px < inner; px++) {
		const raw = lerp2((c, r) => planeGet(buf, mode, c, r), px / scale, py / scale);
		const o = (py * inner + px) * 4;
		if (sandMode) {
			const g = grain(px, py);
			const a = Math.max(0, Math.min(1, Math.pow(Math.max(0, raw), .5) * g * 1.35));
			img.data[o] = 232;
			img.data[o + 1] = 228;
			img.data[o + 2] = 206;
			img.data[o + 3] = Math.round(a * 255);
		} else {
			const t = Math.sqrt(Math.max(0, raw) / denom);
			img.data[o] = 201;
			img.data[o + 1] = 212;
			img.data[o + 2] = 206;
			img.data[o + 3] = Math.round((.06 + t * .72) * 255);
		}
	}
	ctx.putImageData(img, Math.round(ox * dpr), Math.round(oy * dpr));
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	ctx.strokeStyle = "#e6eee8";
	ctx.lineWidth = 1.2;
	if (mode === "xy") ctx.strokeRect(ox + READ_CELLS[0] * cell, oy + READ_CELLS[0] * cell, READ_CELLS.length * cell, READ_CELLS.length * cell);
	else ctx.strokeRect(ox, oy + 7 * cell, 16 * cell, cell);
	if (!sandMode && mode === "xy" && pulseAge >= 0 && pulseAge < 18) {
		const r = Math.min(7.5, .35 + pulseAge * .42);
		ctx.beginPath();
		ctx.arc(ox + 7.5 * cell, oy + 7.5 * cell, r * cell, 0, Math.PI * 2);
		ctx.strokeStyle = `rgba(196,184,160,${Math.max(0, .85 - pulseAge / 18)})`;
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
function blitStar(canvas, star, labels) {
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
	const cx = w * .5;
	const cy = h * .46;
	const gap = Math.min(w, h) * .22;
	const size = Math.min(w, h) * .13;
	const peak = Math.max(star.c, star.xp, star.xm, star.yp, star.ym, star.zp, star.zm, 1e-6);
	const nodes = [
		{
			k: "zp",
			x: cx,
			y: cy - gap,
			tag: "+z",
			hue: "#9db8a6"
		},
		{
			k: "zm",
			x: cx,
			y: cy + gap,
			tag: "−z",
			hue: "#9db8a6"
		},
		{
			k: "xm",
			x: cx - gap,
			y: cy,
			tag: "−x",
			hue: "#c9d4ce"
		},
		{
			k: "xp",
			x: cx + gap,
			y: cy,
			tag: "+x",
			hue: "#c9d4ce"
		},
		{
			k: "ym",
			x: cx - gap * .72,
			y: cy + gap * .72,
			tag: "−y",
			hue: "#c9d4ce"
		},
		{
			k: "yp",
			x: cx + gap * .72,
			y: cy + gap * .72,
			tag: "+y",
			hue: "#c9d4ce"
		},
		{
			k: "c",
			x: cx,
			y: cy,
			tag: labels.inject,
			hue: "#c4b8a0"
		}
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
		ctx.fillStyle = n.hue.replace(")", "").startsWith("#") ? hexAlpha(n.hue, .18 + t * .82) : n.hue;
		ctx.fillRect(n.x - s / 2, n.y - s / 2, s, s);
		ctx.strokeStyle = n.k === "c" ? "#c4b8a0" : n.hue;
		ctx.lineWidth = n.k === "c" ? 2 : 1;
		ctx.strokeRect(n.x - s / 2 + .5, n.y - s / 2 + .5, s - 1, s - 1);
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
function hexAlpha(hex, a) {
	const n = hex.replace("#", "");
	return `rgba(${parseInt(n.slice(0, 2), 16)},${parseInt(n.slice(2, 4), 16)},${parseInt(n.slice(4, 6), 16)},${a})`;
}
function blitZ(canvas, buf, labels) {
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
	const colW = Math.min(52, w * .2);
	const rowH = (h - 20 - head - foot) / 16;
	const barX = pad + colW + 10;
	const barW = w - barX - pad - 36;
	const col = /* @__PURE__ */ new Float64Array(16);
	const plane = /* @__PURE__ */ new Float64Array(16);
	let cmax = 1e-6;
	let pmax = 1e-6;
	for (let z = 0; z < 16; z++) {
		col[z] = sample(buf, z, 7, 7);
		let s = 0;
		const base = z * 16 * 16;
		for (let i = 0; i < 256; i++) s += buf[base + i];
		plane[z] = s / 256;
		if (col[z] > cmax) cmax = col[z];
		if (plane[z] > pmax) pmax = plane[z];
	}
	ctx.fillStyle = "#8b9890";
	ctx.font = "11px ui-monospace, Menlo, monospace";
	ctx.textBaseline = "top";
	ctx.fillText(labels.zUp, pad, 4);
	for (let z = 15; z >= 0; z--) {
		const y = 26 + (15 - z) * rowH;
		const t = Math.sqrt(col[z] / cmax);
		const near = z === 7 || z === 9;
		ctx.fillStyle = `rgba(201,212,206,${.1 + t * .9})`;
		ctx.fillRect(pad, y + 1, colW, rowH - 2);
		if (z === 8) {
			ctx.strokeStyle = "#c4b8a0";
			ctx.lineWidth = 1.6;
			ctx.strokeRect(10.5, y + 1, colW - 1, rowH - 2);
		} else if (near) {
			ctx.strokeStyle = "#9db8a6";
			ctx.lineWidth = 1;
			ctx.strokeRect(10.5, y + 1, colW - 1, rowH - 2);
		}
		const pt = Math.sqrt(plane[z] / pmax);
		ctx.fillStyle = z === 8 ? "#c4b8a0" : near ? "#9db8a6" : "#3a4840";
		ctx.fillRect(barX, y + 3, Math.max(2, pt * barW), rowH - 6);
		ctx.fillStyle = z === 8 ? "#e6eee8" : "#8b9890";
		ctx.font = `${z === 8 ? "700" : "500"} 11px ui-monospace, Menlo, monospace`;
		ctx.textBaseline = "middle";
		const tag = z === 8 ? ` ${labels.zRead}` : near ? " ±1" : "";
		ctx.fillText(`${z}${tag}`, barX + Math.max(2, pt * barW) + 6, y + rowH / 2);
	}
	ctx.fillStyle = "#8b9890";
	ctx.font = "11px ui-monospace, Menlo, monospace";
	ctx.textBaseline = "bottom";
	ctx.fillText(labels.zDown, pad, h - 4);
}
function LiveSlice({ agent, live, epoch, onToggle, copy, turn, onPulse, highlightPulse }) {
	const [mode, setMode] = (0, import_react.useState)("rings");
	const xyRef = (0, import_react.useRef)(null);
	const xzRef = (0, import_react.useRef)(null);
	const yzRef = (0, import_react.useRef)(null);
	const starRef = (0, import_react.useRef)(null);
	const volRef = (0, import_react.useRef)(Array(ZNEAR.length).fill(null));
	const zRef = (0, import_react.useRef)(null);
	const clockRef = (0, import_react.useRef)(null);
	const lineRef = (0, import_react.useRef)(null);
	const histRef = (0, import_react.useRef)([]);
	const bufRef = (0, import_react.useRef)(new Float64Array(VOL));
	const sandRef = (0, import_react.useRef)(new Float64Array(VOL));
	const agentRef = (0, import_react.useRef)(agent);
	agentRef.current = agent;
	const modeRef = (0, import_react.useRef)(mode);
	modeRef.current = mode;
	(0, import_react.useEffect)(() => {
		agentRef.current.injectChladni(modeRef.current);
	}, [epoch]);
	(0, import_react.useEffect)(() => {
		let id = 0;
		const tick = () => {
			const a = agentRef.current;
			if (live) a.stepField();
			const { max, mean } = a.fillEnergy(bufRef.current);
			const sand = a.fillSand(sandRef.current);
			const age = a.pulseAge();
			const labs = {
				inject: copy.injectLabel,
				read: copy.readLabel
			};
			const chladni = a.chladniId != null;
			const vis = chladni ? sandRef.current : bufRef.current;
			const visMax = chladni ? sand.max : max;
			blitCut(xyRef.current, vis, visMax, "xy", age, labs, chladni);
			blitCut(xzRef.current, vis, visMax, "xz", age, labs, chladni);
			blitCut(yzRef.current, vis, visMax, "yz", age, labs, chladni);
			blitStar(starRef.current, a.neighborStar(), { inject: copy.injectLabel });
			for (let zi = 0; zi < ZNEAR.length; zi++) blit(volRef.current[zi], vis, ZNEAR[zi], visMax, ZNEAR[zi] === 8);
			blitZ(zRef.current, vis, {
				zUp: copy.zUp,
				zDown: copy.zDown,
				zRead: copy.zRead
			});
			histRef.current.push(mean);
			if (histRef.current.length > HIST) histRef.current.shift();
			if (lineRef.current && histRef.current.length > 1) {
				const hmax = Math.max(...histRef.current, 1e-6);
				lineRef.current.setAttribute("points", histRef.current.map((v, i) => `${(i / 47 * 96).toFixed(2)},${(28 - v / hmax * 24).toFixed(2)}`).join(" "));
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
	}, [
		live,
		epoch,
		copy.zUp,
		copy.zDown,
		copy.zRead,
		copy.injectLabel,
		copy.readLabel
	]);
	const fireMode = (id) => {
		setMode(id);
		agent.injectChladni(id);
		onPulse?.();
	};
	const firePulse = () => {
		agent.injectChladni(mode);
		onPulse?.();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-lg",
				children: copy.fieldTitle
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					CHLADNI_IDS.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: cn("h-11 rounded-full border px-3 font-mono text-xs uppercase tracking-wider", mode === id ? "border-primary bg-muted text-foreground" : "border-border text-muted-foreground hover:text-foreground", highlightPulse && id === "rings" && "ring-2 ring-ring"),
						onClick: () => fireMode(id),
						children: copy.modeWord[id]
					}, id)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: cn("h-11 rounded-full border px-3 font-mono text-xs uppercase tracking-wider", highlightPulse ? "border-primary bg-muted text-foreground ring-2 ring-ring" : "border-border text-muted-foreground hover:text-foreground"),
						onClick: firePulse,
						children: copy.pulse
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "h-11 rounded-full border border-border px-3 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground",
						onClick: onToggle,
						children: live ? copy.live : copy.paused
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted-foreground",
			children: copy.fieldHint
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-xs text-muted-foreground",
			children: copy.chladniHint
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3",
			children: [
				[xyRef, copy.cutXY],
				[xzRef, copy.cutXZ],
				[yzRef, copy.cutYZ]
			].map(([ref, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
					ref,
					className: "mt-1 aspect-square w-full rounded-[var(--radius-sm)] border border-border bg-muted",
					"aria-label": label
				})]
			}, label))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
					children: copy.crystalTitle
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted-foreground",
					children: copy.crystalHint
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
					ref: starRef,
					className: "mt-2 aspect-square w-full rounded-[var(--radius-sm)] border border-border bg-muted",
					"aria-label": copy.crystalTitle
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
					children: copy.zAxis
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted-foreground",
					children: copy.zHint
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
					ref: zRef,
					className: "mt-2 h-80 w-full rounded-[var(--radius-sm)] border border-border bg-muted sm:h-96",
					"aria-label": copy.zAxis
				})
			] })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 font-mono text-xs uppercase tracking-wider text-muted-foreground",
			children: copy.volume
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 grid grid-cols-5 gap-2",
			children: ZNEAR.map((z, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-mono text-xs text-muted-foreground",
					children: [
						"z=",
						z,
						z === 8 ? ` ${copy.zRead}` : z === 7 || z === 9 ? " ±1" : ""
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
					ref: (el) => {
						volRef.current[i] = el;
					},
					className: cn("pixel-grid mt-1 aspect-square w-full rounded-sm border bg-muted", z === 8 ? "border-ask" : z === 7 || z === 9 ? "border-ok" : "border-border"),
					"aria-label": `z=${z}`
				})]
			}, z))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 font-mono text-xs uppercase tracking-wider text-muted-foreground",
			children: copy.energyMean
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
			viewBox: "0 0 96 32",
			className: "mt-2 h-12 w-full text-primary",
			"aria-hidden": "true",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
				ref: lineRef,
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.2",
				points: "0,28 96,28"
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			ref: clockRef,
			className: "mt-2 font-mono text-xs tabular-nums text-muted-foreground",
			children: "t=0"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CouplingView, {
				agent,
				turn,
				live,
				copy
			})
		})
	] });
}
var LANG_KEY = "umbral-lang";
var COPY = {
	es: {
		controlBus: "Bus de control",
		lede: "Si rellenas el hueco, cierra. Resérvalo manda r; Barato y lujo manda fr. Las 9 neuronas muestran su promedio. No es una persona.",
		langLabel: "Idioma",
		consigna: "Consigna",
		placeholder: "Escribe o pulsa un chip. Los chips ya corren.",
		stepOf: (n, total) => `Paso ${n} / ${total}`,
		tourDone: "Recorrido hecho",
		tourDoneBody: "Sigue con texto libre. NPS cierra el 'mejor'. Elige barato resuelve el par.",
		run: "Ejecutar",
		runHint: "Un chip ya ejecuta. Vacío + Ejecutar hace 2 + 2.",
		recordCorrection: "Grabar corrección",
		recordObserved: "Grabar cierre observado",
		reset: "Reiniciar",
		freezeEdges: "Congelar bordes",
		forceD: "Force d = 0",
		forceR: "Force r = 0",
		forceF: "Force f = 0",
		forceFr: "Force fr = 0",
		forceIra: "Force ira = 0",
		warpOn: "Warp activo",
		aperiodic: "Cuerpo aperiódico",
		permiso: "Permiso",
		idle: "idle",
		controlTag: "etiqueta de control",
		meterD: "d_mem autoriza",
		meterR: "r riesgo",
		meterF: "f compuesto",
		meterFr: "fr control",
		meterIra: "ira control",
		blocks: "bloquea ≥",
		climate: "clima",
		mute: "mudo al/cu/ds/pn/|Z|",
		blocked: "Cierre bloqueado. El lenguaje no puede saltarse esto. |Z| no autoriza.",
		gateNone: "Nadie bloqueó. Puede cerrar.",
		gateBlocked: "Bloqueó",
		gateAlso: "también cruzan",
		copyTurn: "Copiar turno",
		copied: "Turno copiado",
		thisPrompt: "Esta consigna",
		sessionLog: "Turnos de esta sesión",
		tape: "Cinta del turno",
		tapeHint: "JSON compacto: permiso, puerta por exceso, d/r/f/fr/ira. Sin el cubo 16³.",
		eval: "Eval",
		evalHint: "Incluye hueco que se llena, r por exceso, 3×3, pulso ±z, Chladni 3D y consigna vacía.",
		runChecks: "Correr pruebas",
		pass: "pasa",
		fail: "falla",
		memory: "Memoria",
		memoryHint: (n) => `${n} episodios. Recupera n-gram.`,
		memoryEmpty: "Vacía hasta que grabes un resultado.",
		seed: "Semilla",
		idleNote: "Pulsa el chip 2 + 2. Ya corre.",
		rebuilt: "Campo nuevo.",
		censored: "Censurado: preguntaste, no viste el cierre.",
		corrected: "Corrección guardada.",
		observed: "Cierre observado.",
		memoryPushed: (eco, attr) => `Memoria: eco ${eco.toFixed(2)} · Δ ${attr >= 0 ? "+" : ""}${attr.toFixed(3)}.`,
		done: "Listo.",
		fieldTitle: "Campo 16³",
		fieldHint: "Chladni en 16³. La arena se queda donde el cubo no vibra (nodos). xy es un plano; xz e yz demuestran que el modo es 3D.",
		midPlane: "Plano medio z=8 · ventana 3×3",
		volume: "Capas vecinas · z 6 a 10",
		energyMean: "Energía media",
		pulse: "Pulso",
		live: "vivo",
		paused: "pausa",
		zAxis: "Eje z · columna (7,7)",
		zHint: "Cada celda es el voxel (z, 7, 7). En capas, z=7 y z=9 son otra sección de la misma cáscara.",
		zUp: "arriba +z",
		zDown: "abajo −z",
		zNear: "vecinas ±z",
		zRead: "lectura",
		crystalTitle: "Seis vecinos",
		crystalHint: "El cubo del medio toca ±x ±y y también ±z. En un modo Chladni cada cara tiene su arena.",
		cutXY: "corte xy · z=8",
		cutXZ: "corte xz · y=7",
		cutYZ: "corte yz · x=7",
		injectLabel: "nodo / antinodo",
		readLabel: "lectura 3×3",
		pulseHint: "Elige un modo y pulsa. Arena clara = nodo. Oscuro = vibra.",
		chladniHint: "Cuatro modos 3D. Rejilla, capas (cáscaras), cruz, trama. No es una placa.",
		modeWord: {
			grid: "Rejilla",
			rings: "Capas",
			cross: "Cruz",
			weave: "Trama"
		},
		couplingTitle: "Nueve neuronas, un bus, cinco puertas",
		couplingHint: "Cada bola enseña su promedio local (z=8, celdas 6–8). El raíl difunde. Manda max(valor − umbral).",
		couplingVoxels: "1 · cuerpo 16³",
		couplingReadout: "2 · 9 neuronas",
		couplingGates: "3 · exceso",
		couplingStageField: "El raíl copia el mismo paquete a las cinco. No elige cable.",
		couplingStageRead: "El número es amplitud, sin pesos. Solo este marco alimenta las puertas.",
		couplingStageGate: "blocked_by = quien más se pasa. Resérvalo: r. Barato y lujo: fr.",
		couplingDrag: "Un chip enciende las 9. El palito en cada barra es el umbral.",
		couplingBus: "bus · difusión",
		couplingManda: "manda",
		advanced: "Avanzado · force / warp / cuerpo",
		samples: [
			{
				label: "2 + 2",
				text: "cuanto es 2+2"
			},
			{
				label: "Hazlo mejor",
				text: "hazlo mejor"
			},
			{
				label: "Hazlo mejor otra vez",
				text: "hazlo mejor"
			},
			{
				label: "NPS > 50",
				text: "hazlo mejor, el criterio es NPS > 50"
			},
			{
				label: "Resérvalo",
				text: "reservalo"
			},
			{
				label: "Viernes",
				text: "reservalo el viernes"
			},
			{
				label: "Barato y lujo",
				text: "quiero barato y lujo"
			},
			{
				label: "Elige barato",
				text: "barato. el lujo no. prioriza precio"
			}
		],
		tour: [
			{
				do: "Pulsa el chip 2 + 2",
				see: "Permiso: cerrar. Nadie bloqueó.",
				chip: "cuanto es 2+2"
			},
			{
				do: "Pulsa Copiar turno",
				see: "blocked_by es null.",
				copy: true
			},
			{
				do: "Pulsa Hazlo mejor",
				see: "preguntar. Bloqueó: d. Pide un criterio.",
				chip: "hazlo mejor",
				chipLabel: "Hazlo mejor"
			},
			{
				do: "Pulsa Grabar corrección",
				see: "El tipo consigna_vaga se mueve.",
				record: "corrected"
			},
			{
				do: "Pulsa Hazlo mejor otra vez",
				see: "El texto nombra el eco. Δ es positivo.",
				chip: "hazlo mejor",
				chipLabel: "Hazlo mejor otra vez"
			},
			{
				do: "Pulsa NPS > 50",
				see: "Cerrar. El criterio llena el hueco aunque siga la palabra 'mejor'.",
				chip: "hazlo mejor, el criterio es NPS > 50"
			},
			{
				do: "Pulsa Resérvalo",
				see: "Bloqueó: r. Falta la fecha. El exceso de riesgo manda, no d.",
				chip: "reservalo"
			},
			{
				do: "Pulsa Viernes",
				see: "Cierra. El hueco de fecha se llenó.",
				chip: "reservalo el viernes"
			},
			{
				do: "Pulsa Barato y lujo",
				see: "Bloqueó: fr. Más exceso que d; d e ira también cruzan.",
				chip: "quiero barato y lujo"
			},
			{
				do: "Pulsa Elige barato",
				see: "Cerrar. Negar lujo resuelve el par.",
				chip: "barato. el lujo no. prioriza precio"
			},
			{
				do: "Pulsa Capas",
				see: "Arena en los nodos, como Chladni. xz e yz no copian el plano: el modo llena el cubo.",
				pulse: true
			}
		],
		permisoWord: {
			cerrar: "cerrar",
			preguntar: "preguntar",
			buscar: "buscar"
		},
		tagWord: {
			duda: "duda",
			riesgo: "riesgo",
			alarma: "alarma",
			frustracion: "frustracion",
			ira: "ira",
			pena: "pena",
			neutro: "neutro"
		},
		dudaWord: {
			alta: "alta",
			media: "media",
			baja: "baja"
		}
	},
	en: {
		controlBus: "Control bus",
		lede: "Fill the gap and it closes. Book it: r leads. Cheap and luxury: fr leads. The 9 neurons show their average. Not a person.",
		langLabel: "Language",
		consigna: "Prompt",
		placeholder: "Type or press a chip. Chips already run.",
		stepOf: (n, total) => `Step ${n} / ${total}`,
		tourDone: "Walkthrough done",
		tourDoneBody: "Keep going with free text. NPS closes 'better'. Choose cheap resolves the pair.",
		run: "Run",
		runHint: "A chip already runs. Empty + Run does 2 + 2.",
		recordCorrection: "Record correction",
		recordObserved: "Record observed close",
		reset: "Reset",
		freezeEdges: "Freeze edges",
		forceD: "Force d = 0",
		forceR: "Force r = 0",
		forceF: "Force f = 0",
		forceFr: "Force fr = 0",
		forceIra: "Force ira = 0",
		warpOn: "Warp on",
		aperiodic: "Aperiodic body",
		permiso: "Permission",
		idle: "idle",
		controlTag: "control tag",
		meterD: "d_mem authorizes",
		meterR: "r risk",
		meterF: "f composite",
		meterFr: "fr control",
		meterIra: "ira control",
		blocks: "blocks ≥",
		climate: "climate",
		mute: "mute al/cu/ds/pn/|Z|",
		blocked: "Close blocked. Language cannot skip this. |Z| does not authorize.",
		gateNone: "No gate blocked. May close.",
		gateBlocked: "Blocked by",
		gateAlso: "also over",
		copyTurn: "Copy turn",
		copied: "Turn copied",
		thisPrompt: "This prompt",
		sessionLog: "Turns this session",
		tape: "Turn tape",
		tapeHint: "Compact JSON: permission, excess gate, d/r/f/fr/ira. No 16³ cube.",
		eval: "Eval",
		evalHint: "Includes gap-fill, r by excess, 3×3, ±z pulse, 3D Chladni, and empty prompt.",
		runChecks: "Run checks",
		pass: "pass",
		fail: "fail",
		memory: "Memory",
		memoryHint: (n) => `${n} episodes. n-gram retrieve.`,
		memoryEmpty: "Empty until you record an outcome.",
		seed: "Seed",
		idleNote: "Press the 2 + 2 chip. It already runs.",
		rebuilt: "New field.",
		censored: "Censored: you asked and did not see a close.",
		corrected: "Correction stored.",
		observed: "Observed close.",
		memoryPushed: (eco, attr) => `Memory: echo ${eco.toFixed(2)} · Δ ${attr >= 0 ? "+" : ""}${attr.toFixed(3)}.`,
		done: "Done.",
		fieldTitle: "Field 16³",
		fieldHint: "Chladni on 16³. Sand stays where the cube is still (nodes). xy is a plane; xz and yz prove the mode is 3D.",
		midPlane: "Mid-plane z=8 · 3×3 window",
		volume: "Neighbor planes · z 6 to 10",
		energyMean: "Mean energy",
		pulse: "Pulse",
		live: "live",
		paused: "paused",
		zAxis: "z-axis · column (7,7)",
		zHint: "Each cell is voxel (z, 7, 7). In shells, z=7 and z=9 are another cut of the same shell.",
		zUp: "up +z",
		zDown: "down −z",
		zNear: "±z neighbors",
		zRead: "readout",
		crystalTitle: "Six neighbors",
		crystalHint: "The middle cube touches ±x ±y and ±z. In a Chladni mode each face has its own sand.",
		cutXY: "xy cut · z=8",
		cutXZ: "xz cut · y=7",
		cutYZ: "yz cut · x=7",
		injectLabel: "node / antinode",
		readLabel: "3×3 readout",
		pulseHint: "Pick a mode and pulse. Bright sand = node. Dark = moving.",
		chladniHint: "Four 3D modes. Grid, shells, cross, weave. Not a plate.",
		modeWord: {
			grid: "Grid",
			rings: "Shells",
			cross: "Cross",
			weave: "Weave"
		},
		couplingTitle: "Nine neurons, one bus, five gates",
		couplingHint: "Each ball shows its local average (z=8, cells 6–8). The rail broadcasts. max(value − threshold) commands.",
		couplingVoxels: "1 · 16³ body",
		couplingReadout: "2 · 9 neurons",
		couplingGates: "3 · excess",
		couplingStageField: "The rail copies the same packet to all five. It does not pick a wire.",
		couplingStageRead: "The number is amplitude, no weights. Only this frame feeds the gates.",
		couplingStageGate: "blocked_by = whoever overshoots more. Book it: r. Cheap and luxury: fr.",
		couplingDrag: "A chip lights the 9. The tick on each bar is the threshold.",
		couplingBus: "bus · broadcast",
		couplingManda: "leads",
		advanced: "Advanced · force / warp / body",
		samples: [
			{
				label: "2 + 2",
				text: "cuanto es 2+2"
			},
			{
				label: "Make it better",
				text: "hazlo mejor"
			},
			{
				label: "Make it better again",
				text: "hazlo mejor"
			},
			{
				label: "NPS > 50",
				text: "hazlo mejor, el criterio es NPS > 50"
			},
			{
				label: "Book it",
				text: "reservalo"
			},
			{
				label: "Friday",
				text: "reservalo el viernes"
			},
			{
				label: "Cheap and luxury",
				text: "quiero barato y lujo"
			},
			{
				label: "Choose cheap",
				text: "barato. el lujo no. prioriza precio"
			}
		],
		tour: [
			{
				do: "Press 2 + 2",
				see: "Permission: close. No gate blocked.",
				chip: "cuanto es 2+2"
			},
			{
				do: "Press Copy turn",
				see: "blocked_by is null.",
				copy: true
			},
			{
				do: "Press Make it better",
				see: "ask. Blocked by: d. It wants a criterion.",
				chip: "hazlo mejor",
				chipLabel: "Make it better"
			},
			{
				do: "Press Record correction",
				see: "The vague-prompt type moves.",
				record: "corrected"
			},
			{
				do: "Press Make it better again",
				see: "The reply names the echo. Δ is positive.",
				chip: "hazlo mejor",
				chipLabel: "Make it better again"
			},
			{
				do: "Press NPS > 50",
				see: "Close. The criterion fills the gap even though 'better' stays.",
				chip: "hazlo mejor, el criterio es NPS > 50"
			},
			{
				do: "Press Book it",
				see: "Blocked by: r. Date missing. Risk excess commands, not d.",
				chip: "reservalo"
			},
			{
				do: "Press Friday",
				see: "Closes. The date gap filled.",
				chip: "reservalo el viernes"
			},
			{
				do: "Press Cheap and luxury",
				see: "Blocked by: fr. More excess than d; d and ira also cross.",
				chip: "quiero barato y lujo"
			},
			{
				do: "Press Choose cheap",
				see: "Close. Denying luxury resolves the pair.",
				chip: "barato. el lujo no. prioriza precio"
			},
			{
				do: "Press Shells",
				see: "Sand on the nodes, like Chladni. xz and yz are not the same plate: the mode fills the cube.",
				pulse: true
			}
		],
		permisoWord: {
			cerrar: "close",
			preguntar: "ask",
			buscar: "search"
		},
		tagWord: {
			duda: "doubt",
			riesgo: "risk",
			alarma: "alarm",
			frustracion: "frustration",
			ira: "anger",
			pena: "grief",
			neutro: "neutral"
		},
		dudaWord: {
			alta: "high",
			media: "mid",
			baja: "low"
		}
	}
};
function readLocale() {
	try {
		const v = window.localStorage.getItem(LANG_KEY);
		if (v === "en" || v === "es") return v;
	} catch {}
	return "es";
}
function writeLocale(lang) {
	try {
		window.localStorage.setItem(LANG_KEY, lang);
	} catch {}
	if (typeof document !== "undefined") document.documentElement.lang = lang;
}
function displayReply(lang, turn) {
	if (lang === "es") return turn.response;
	if (turn.permiso === "cerrar") {
		if (turn.response === "4") return "4";
		if (/criterio cierra/i.test(turn.response)) return "Done. The criterion fills the gap.";
		if (/restricci[oó]n manda/i.test(turn.response)) return "Done. One constraint wins.";
		return COPY.en.done;
	}
	const eco = turn.cost ?? 0;
	const attr = turn.attr ?? 0;
	const delta = `${attr >= 0 ? "+" : ""}${attr.toFixed(3)}`;
	const echoBit = `echo ${eco.toFixed(2)}, Δ ${delta}`;
	if (turn.missing.some((m) => m.includes("criterio"))) {
		if (eco >= .2) return `Last time I asked for a measurable criterion and it did not arrive (${echoBit}). What counts as success this time, as a metric?`;
		return "What is the measurable success criterion for 'better'?";
	}
	if (turn.missing.includes("fecha")) {
		if (eco >= .2) return `The date is still missing (${echoBit}). Which date should I use for the booking?`;
		return "Which date should I use for the booking?";
	}
	if (turn.missing.includes("destinatario")) {
		if (eco >= .2) return `The recipient is still missing (${echoBit}). Who should I send it to?`;
		return "Who should I send it to?";
	}
	if (turn.permiso === "buscar") {
		if (eco >= .2) return `The two readings still collide (${echoBit}). Which constraint wins?`;
		return "Two incompatible readings. Which constraint wins?";
	}
	if (eco >= .2) return `Still unresolved (${echoBit}). A critical fact is missing. Can you be specific?`;
	return "A critical fact is missing. Can you be specific?";
}
var AGAIN = /* @__PURE__ */ new Set(["Hazlo mejor otra vez", "Make it better again"]);
function meterColor(d) {
	if (d >= .42) return "bg-ask";
	if (d >= .28) return "bg-muted-foreground";
	return "bg-ok";
}
function permisoTone(p) {
	if (p === "cerrar") return "text-ok";
	if (p === "buscar") return "text-ask";
	return "text-primary";
}
function LabApp() {
	const [lang, setLang] = (0, import_react.useState)("es");
	const copy = COPY[lang];
	const [seed, setSeed] = (0, import_react.useState)(7);
	const [freezeB, setFreezeB] = (0, import_react.useState)(false);
	const [forceD, setForceD] = (0, import_react.useState)(false);
	const [forceR, setForceR] = (0, import_react.useState)(false);
	const [forceF, setForceF] = (0, import_react.useState)(false);
	const [forceFr, setForceFr] = (0, import_react.useState)(false);
	const [forceIra, setForceIra] = (0, import_react.useState)(false);
	const [useWarp, setUseWarp] = (0, import_react.useState)(true);
	const [liveBody, setLiveBody] = (0, import_react.useState)(true);
	const [agent, setAgent] = (0, import_react.useState)(() => new VoxelAgent({
		seed: 7,
		useWarp: true,
		liveBody: true
	}));
	const [text, setText] = (0, import_react.useState)("");
	const [turn, setTurn] = (0, import_react.useState)(null);
	const [evalChecks, setEvalChecks] = (0, import_react.useState)(null);
	const [status, setStatus] = (0, import_react.useState)(COPY.es.idleNote);
	const [live, setLive] = (0, import_react.useState)(true);
	const [epoch, setEpoch] = (0, import_react.useState)(0);
	const [tour, setTour] = (0, import_react.useState)(0);
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [log, setLog] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		const next = readLocale();
		setLang(next);
		writeLocale(next);
		setStatus(COPY[next].idleNote);
	}, []);
	const chooseLang = (next) => {
		setLang(next);
		writeLocale(next);
		if (!turn) setStatus(COPY[next].idleNote);
	};
	const rebuild = (patch = {}) => {
		const nextFreeze = patch.freezeB ?? freezeB;
		const nextForce = patch.forceD ?? forceD;
		const nextSeed = patch.seed ?? seed;
		const nextWarp = patch.useWarp ?? useWarp;
		const nextLive = patch.liveBody ?? liveBody;
		const nextForceR = patch.forceR ?? forceR;
		const nextForceF = patch.forceF ?? forceF;
		const nextForceFr = patch.forceFr ?? forceFr;
		const nextForceIra = patch.forceIra ?? forceIra;
		const a = new VoxelAgent({
			seed: nextSeed,
			freezeB: nextFreeze,
			forceD: nextForce ? 0 : null,
			useWarp: nextWarp,
			liveBody: nextLive,
			forceR: nextForceR ? 0 : null,
			forceF: nextForceF ? 0 : null,
			forceFr: nextForceFr ? 0 : null,
			forceIra: nextForceIra ? 0 : null
		});
		setAgent(a);
		setTurn(null);
		setEvalChecks(null);
		setStatus(copy.rebuilt);
		setLog([]);
		setEpoch((n) => n + 1);
		if (patch.resetTour) setTour(0);
	};
	const run = (value, label) => {
		const prompt = resolvePrompt(value);
		if (!prompt) return;
		let nextTour = tour;
		if (label && AGAIN.has(label) && agent.pending) {
			agent.recordOutcome(.9, "corrected");
			if (copy.tour[nextTour]?.record === "corrected") nextTour += 1;
		}
		const r = agent.step(prompt);
		setTurn({ ...r });
		const reply = displayReply(lang, r);
		if (r.cost >= .2 || r.attr > .01) setStatus(copy.memoryPushed(r.cost, r.attr));
		else setStatus("");
		setLog((rows) => [{
			text: prompt,
			label: label || copy.samples.find((s) => s.text === prompt)?.label || prompt,
			permiso: r.permiso,
			gate: r.blockedBy?.id ?? "—",
			reply
		}, ...rows].slice(0, 10));
		const s = copy.tour[nextTour];
		if (s?.chip === prompt && (!s.chipLabel || s.chipLabel === label)) nextTour += 1;
		if (nextTour !== tour) setTour(nextTour);
		const el = document.getElementById("permiso");
		if (el && window.matchMedia("(max-width: 1023px)").matches) el.scrollIntoView({
			behavior: "smooth",
			block: "start"
		});
	};
	const record = (kind) => {
		if (!turn) return;
		agent.recordOutcome(kind === "corrected" ? .9 : .15, kind);
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh overflow-x-hidden bg-background text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "border-b border-border px-4 py-5 sm:px-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs tracking-widest text-muted-foreground uppercase",
						children: copy.controlBus
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 font-display text-3xl font-medium tracking-tight sm:text-4xl",
						children: "Umbral"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					role: "radiogroup",
					"aria-label": copy.langLabel,
					className: "flex shrink-0 rounded-full border border-border p-1",
					children: ["es", "en"].map((code) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						role: "radio",
						"aria-checked": lang === code,
						className: cn("h-11 min-w-11 rounded-full px-3 font-mono text-xs tracking-wider", lang === code ? "bg-muted text-foreground" : "text-muted-foreground"),
						onClick: () => chooseLang(code),
						children: code.toUpperCase()
					}, code))
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base",
				children: copy.lede
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_22rem]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-[var(--radius-xl)] border border-border bg-card p-4 sm:p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "prompt",
							className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
							children: copy.consigna
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							id: "prompt",
							value: text,
							onChange: (e) => setText(e.target.value),
							placeholder: copy.placeholder,
							rows: 3,
							className: "mt-2 w-full resize-y rounded-[var(--radius-md)] border border-border bg-background px-3 py-3 text-base leading-relaxed outline-none placeholder:text-muted-foreground"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 rounded-[var(--radius-md)] border border-border bg-background px-3 py-3",
							children: tourStep ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
									children: copy.stepOf(tour + 1, copy.tour.length)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm font-medium",
									children: tourStep.do
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: tourStep.see
								})
							] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
								children: copy.tourDone
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm",
								children: copy.tourDoneBody
							})] })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: copy.samples.map((s) => {
								const on = tourStep?.chipLabel ? tourStep.chipLabel === s.label : !!tourStep?.chip && tourStep.chip === s.text;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: cn("h-11 rounded-full border px-3 text-sm", on ? "border-primary bg-muted text-foreground" : "border-border text-muted-foreground hover:bg-muted"),
									onClick: () => {
										setText(s.text);
										run(s.text, s.label);
									},
									children: s.label
								}, s.label);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "inline-flex h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm text-background",
									onClick: () => run(text.trim() || tourStep?.chip || "cuanto es 2+2", tourStep?.chipLabel),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), copy.run]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: cn("h-11 rounded-full border border-border px-3 text-sm", tourStep?.record === "corrected" && "ring-2 ring-ring"),
									onClick: () => record("corrected"),
									disabled: !turn,
									children: copy.recordCorrection
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: cn("h-11 rounded-full border border-border px-3 text-sm", tourStep?.record === "ok" && "ring-2 ring-ring"),
									onClick: () => record("ok"),
									disabled: !turn,
									children: copy.recordObserved
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "inline-flex h-11 items-center gap-2 rounded-full px-3 text-sm text-muted-foreground",
									onClick: () => rebuild({ resetTour: true }),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), copy.reset]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: cn("inline-flex h-11 items-center gap-2 rounded-full px-3 text-sm text-muted-foreground", tourStep?.copy && "ring-2 ring-ring"),
									onClick: () => void copyTurn(),
									disabled: !turn,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), copied ? copy.copied : copy.copyTurn]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted-foreground",
							children: copy.runHint
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					id: "permiso",
					className: "rounded-[var(--radius-xl)] border border-border bg-card p-4 sm:p-5 lg:col-start-2 lg:row-span-3 lg:self-start lg:sticky lg:top-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-lg",
							children: copy.permiso
						}),
						turn && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 font-mono text-xs uppercase tracking-wider text-muted-foreground",
							children: [
								copy.thisPrompt,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-1 block font-sans text-sm font-medium normal-case tracking-normal text-foreground",
									children: copy.samples.find((s) => s.text === turn.text)?.label ?? turn.text
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "mt-0.5 block normal-case tracking-normal text-muted-foreground",
									children: [
										"“",
										turn.text,
										"”"
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: cn("mt-3 font-display text-4xl font-medium tracking-tight", turn ? permisoTone(turn.permiso) : "text-muted-foreground"),
							children: turn ? copy.permisoWord[turn.permiso] : copy.idle
						}),
						turn && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: cn("mt-3 rounded-[var(--radius-md)] border px-3 py-2 font-mono text-xs leading-relaxed", turn.blockedBy ? "border-ask/40 text-ask" : "border-border text-ok"),
							children: gateLine(copy, turn)
						}),
						turn && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm leading-relaxed",
							children: displayReply(lang, turn)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: status
						}),
						log.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
							className: "mt-3 rounded-[var(--radius-md)] border border-border bg-background px-3 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
								className: "min-h-11 cursor-pointer font-mono text-xs uppercase tracking-wider text-muted-foreground",
								children: [
									copy.sessionLog,
									" · ",
									log.length
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-2 space-y-2",
								children: log.map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "border-t border-border pt-2 text-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-medium",
											children: row.label
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "font-mono text-xs text-muted-foreground",
											children: [
												"“",
												row.text,
												"” · ",
												copy.permisoWord[row.permiso],
												" · ",
												row.gate
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-xs text-muted-foreground",
											children: row.reply
										})
									]
								}, `${row.text}-${i}`))
							})]
						}),
						turn && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 font-mono text-xs uppercase tracking-wider text-muted-foreground",
							children: [
								copy.controlTag,
								" · ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-foreground",
									children: tag
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
									label: copy.meterD,
									value: turn?.d ?? 0,
									extra: duda + (turn && Math.abs(turn.attr) > .004 ? ` · Δ ${turn.attr >= 0 ? "+" : ""}${turn.attr.toFixed(3)}` : ""),
									tone: meterColor(turn?.d ?? 0)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
									label: copy.meterR,
									value: turn?.r ?? 0,
									extra: `${copy.blocks} ${RISK_BLOCK}`,
									tone: meterColor(turn?.r ?? 0)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
									label: copy.meterF,
									value: turn?.f ?? 0,
									extra: `≥ ${FEAR_BLOCK}`,
									tone: meterColor(turn?.f ?? 0)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
									label: copy.meterFr,
									value: turn?.fr ?? 0,
									extra: `≥ ${FRUST_BLOCK}`,
									tone: meterColor(turn?.fr ?? 0)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
									label: copy.meterIra,
									value: turn?.ira ?? 0,
									extra: `≥ ${IRA_BLOCK}`,
									tone: meterColor(turn?.ira ?? 0)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex justify-between font-mono text-xs text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["d_base ", turn ? turn.dBase.toFixed(3) : "—"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Δ ", turn ? `${turn.attr >= 0 ? "+" : ""}${turn.attr.toFixed(3)}` : "—"] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-3 gap-2 font-mono text-xs text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["eco ", turn ? turn.cost.toFixed(2) : "—"] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["win ", turn ? turn.windowEnergy.toFixed(3) : "—"] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											copy.climate,
											" ",
											turn ? turn.climate.toFixed(2) : "—"
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["stakes ", turn ? turn.stakes.toFixed(2) : "—"] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["h ", turn ? turn.h.toFixed(2) : "—"] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: copy.mute })
									]
								})
							]
						}),
						turn && turn.permiso !== "cerrar" && (turn.d >= .42 || turn.r >= .54 || turn.f >= .45 || turn.fr >= .58 || turn.ira >= .5) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 flex items-start gap-2 text-sm text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ban, { className: "mt-0.5 size-4 shrink-0" }), copy.blocked]
						}),
						turn && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
							className: "mt-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
									className: "cursor-pointer font-mono text-xs uppercase tracking-wider text-muted-foreground",
									children: copy.tape
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: copy.tapeHint
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
									className: "mt-2 max-h-48 overflow-auto rounded-[var(--radius-md)] border border-border bg-background p-3 font-mono text-xs",
									children: JSON.stringify(turnTape(turn), null, 2)
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-[var(--radius-xl)] border border-border bg-card p-4 sm:p-5 lg:col-start-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
						className: "rounded-[var(--radius-md)] border border-border bg-background px-3 py-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
							className: "flex h-11 cursor-pointer items-center font-mono text-xs uppercase tracking-wider text-muted-foreground",
							children: copy.advanced
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-x-4 gap-y-2 pb-2 font-mono text-xs text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex h-11 items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: freezeB,
										onChange: (e) => {
											setFreezeB(e.target.checked);
											rebuild({ freezeB: e.target.checked });
										}
									}), copy.freezeEdges]
								}),
								[
									[
										"forceD",
										forceD,
										setForceD,
										copy.forceD
									],
									[
										"forceR",
										forceR,
										setForceR,
										copy.forceR
									],
									[
										"forceF",
										forceF,
										setForceF,
										copy.forceF
									],
									[
										"forceFr",
										forceFr,
										setForceFr,
										copy.forceFr
									],
									[
										"forceIra",
										forceIra,
										setForceIra,
										copy.forceIra
									]
								].map(([k, v, set, lab]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex h-11 items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: v,
										onChange: (e) => {
											set(e.target.checked);
											rebuild({ [k]: e.target.checked });
										}
									}), lab]
								}, k)),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex h-11 items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: useWarp,
										onChange: (e) => {
											setUseWarp(e.target.checked);
											rebuild({ useWarp: e.target.checked });
										}
									}), copy.warpOn]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex h-11 items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: liveBody,
										onChange: (e) => {
											setLiveBody(e.target.checked);
											rebuild({ liveBody: e.target.checked });
										}
									}), copy.aperiodic]
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveSlice, {
							agent,
							live,
							epoch,
							onToggle: () => setLive((v) => !v),
							copy,
							turn,
							highlightPulse: !!tourStep?.pulse,
							onPulse: () => {
								if (copy.tour[tour]?.pulse) setTour((n) => n + 1);
							}
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-[var(--radius-xl)] border border-border bg-card p-4 sm:p-5 lg:col-start-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-lg",
							children: copy.eval
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: copy.evalHint
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "mt-3 h-11 rounded-full border border-border px-4 text-sm",
							onClick: () => setEvalChecks(runEval()),
							children: copy.runChecks
						}),
						evalChecks && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 space-y-1 font-mono text-xs",
							children: evalChecks.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: c.ok ? "text-ok" : "text-ask",
								children: [
									c.ok ? copy.pass : copy.fail,
									" · ",
									c.name,
									" · ",
									c.detail
								]
							}, c.name))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-6 font-display text-lg",
							children: copy.memory
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: copy.memoryHint(agent.episodes.length)
						}),
						agent.episodes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: copy.memoryEmpty
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 space-y-1 font-mono text-xs",
							children: agent.episodes.slice(-6).map((ep, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								ep.text,
								" · ",
								ep.outcome,
								" · d*=",
								ep.d_star
							] }, i))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "mt-4 block font-mono text-xs uppercase tracking-wider text-muted-foreground",
							children: copy.seed
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							value: seed,
							onChange: (e) => {
								const n = Number(e.target.value) || 7;
								setSeed(n);
								rebuild({ seed: n });
							},
							className: "mt-1 h-11 w-24 rounded-[var(--radius-md)] border border-border bg-background px-3"
						})
					]
				})
			]
		})]
	});
}
function Meter({ label, value, extra, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-between font-mono text-xs uppercase tracking-wider text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "tabular-nums",
			children: [
				value.toFixed(3),
				" · ",
				extra
			]
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-1 h-2 overflow-hidden rounded-full bg-muted",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("h-full", tone),
			style: { width: `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%` }
		})
	})] });
}
function gateLine(copy, turn) {
	const g = turn.blockedBy;
	if (!g) return copy.gateNone;
	const excess = g.value - g.block;
	const extra = turn.also.length ? ` · ${copy.gateAlso} ${turn.also.join(", ")}` : "";
	return `${copy.gateBlocked}: ${g.id} (${g.value.toFixed(2)} ≥ ${g.block} · Δ${excess >= 0 ? "+" : ""}${excess.toFixed(2)})${extra}`;
}
var PROMPT_ALIAS = {
	"2 + 2": "cuanto es 2+2",
	"2+2": "cuanto es 2+2",
	"what is 2+2": "cuanto es 2+2",
	"make it better": "hazlo mejor",
	"book it": "reservalo",
	friday: "reservalo el viernes",
	"nps > 50": "hazlo mejor, el criterio es NPS > 50",
	"choose cheap": "barato. el lujo no. prioriza precio",
	"elige barato": "barato. el lujo no. prioriza precio"
};
function resolvePrompt(raw) {
	const t = raw.trim();
	return PROMPT_ALIAS[t.toLowerCase().replace(/\s+/g, " ")] ?? t;
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LabApp, {});
}
//#endregion
export { Home as component };
