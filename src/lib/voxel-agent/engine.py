"""Umbral control bus — Python mirror of engine.ts. Authorization, not a persona."""

from __future__ import annotations

import math
import re
import unicodedata
from array import array

TYPES = (
    "consigna_vaga",
    "dato_faltante",
    "contradiccion",
    "sorpresa",
    "eco_costoso",
    "residual",
)
INPUTS = ("ambiguedad", "hueco", "sorpresa", "incoherencia", "eco_mnesico")
N = 16
READ_Z = 8
READ_CELLS = (6, 7, 8)
CHLADNI_IDS = ("grid", "rings", "cross", "weave")
CH = 4
CH_AMP, CH_POT, CH_ENG, CH_TRC = 0, 1, 2, 3
DEFAULT_B = {
    "ambiguedad": 0.55,
    "hueco": 0.5,
    "sorpresa": 0.55,
    "incoherencia": 0.55,
    "eco_mnesico": 0.5,
}
B_MIN, B_MAX, DELTA_CAP, ETA, WARP_CAP = 0.28, 0.84, 0.08, 0.22, 0.1
CLOSE_BLOCK, ASK_FLOOR, SEARCH_MASS, SEARCH_D = 0.42, 0.28, 0.55, 0.4
RETRIEVE_SCORE, RETRIEVE_SIM, ACTIVE_PI = 0.12, 0.28, 0.12
PRIOR_MASS, PRIOR_D, WARP_SHIFT, UPDATE_PI = 0.22, 0.32, 0.12, 0.05
RISK_BLOCK, FEAR_BLOCK = 0.54, 0.45
FEAR_W_RISK, FEAR_W_HARM, FEAR_W_URG, HARM_STAR = 0.5, 0.3, 0.1, 0.75
FRUST_BLOCK, IRA_BLOCK = 0.58, 0.5
IRA_W_STAKES, IRA_W_REJ, IRA_W_FRUST, TAG_FLOOR = 0.45, 0.35, 0.2, 0.35
CARE_STAKES, CONTRA_STAKES, C_SCALE, ETA_C = 0.72, 0.96, 0.6, 0.18
TARGET = {
    "consigna_vaga": "ambiguedad",
    "dato_faltante": "hueco",
    "contradiccion": "incoherencia",
    "sorpresa": "sorpresa",
    "eco_costoso": "eco_mnesico",
    "residual": "ambiguedad",
}
MATH_RE = re.compile(r"\d+\s*[+\-*/x×]\s*\d+")
DATE_RE = re.compile(
    r"(lunes|martes|miercoles|jueves|viernes|sabado|domingo|hoy|manana|\d{1,2}[/-]\d{1,2})"
)
CARE_RE = re.compile(r"(medico|salud|dolor|grave)")
VAGUE = ("mejor", "better", "hazlo", "improve", "optimo", "genial")
RESERVE = ("reserv", "book", "vuelo", "hotel", "cita", "agenda", "mesa")
SEND = ("envia", "manda", "send")
PAIRS = (("barato", "lujo"), ("cheap", "luxury"), ("rapido", "lento"))
SOFT_CONTRA = ("a la vez", "pero tambien", "and luxury")
SKETCH_DIM = 128


def clip(x, lo=0.0, hi=1.0):
    return max(lo, min(hi, x))


def risk_value(stakes, hueco, harm, bias=0.0):
    return clip(0.15 + 0.55 * stakes * hueco + 0.3 * harm + bias)


def urgency_value(stakes, hueco):
    return clip(stakes * hueco)


def fear_value(r, harm, stakes, hueco):
    u = urgency_value(stakes, hueco)
    return clip(FEAR_W_RISK * r + FEAR_W_HARM * harm + FEAR_W_URG * u)


def frustration_value(stakes, incoherencia, hueco):
    return clip(stakes * incoherencia * (1 - hueco))


def ira_value(stakes, incoherencia, n_rej, fr):
    return clip(IRA_W_STAKES * stakes * incoherencia + IRA_W_REJ * n_rej + IRA_W_FRUST * fr)


def pick_blocked_by(hits):
    ranked = sorted(hits, key=lambda h: h["value"] - h["block"], reverse=True)
    return {"blocked_by": ranked[0], "also": ranked[1:]}


def fold(text):
    t = unicodedata.normalize("NFD", text).lower().strip()
    return "".join(ch for ch in t if unicodedata.category(ch) != "Mn")


def has_any(t, words):
    return any(w in t for w in words)


CRIT_RE = re.compile(
    r"(\bnps\b|\bcriterio\b|\blatencia\b|\bmetric).*\d|\d+\s*(ms|s|%|puntos)\b|(menos de|mas de|mayor que|menor que|menos que|[<>]=?)\s*\d"
)
NEG_RE = re.compile(r"\b(no|sin|not|ni|nunca|without)\b")


def has_measurable_criterion(t):
    if MATH_RE.search(t):
        return False
    return bool(CRIT_RE.search(t))


def negated_near(t, word):
    parts = t.split()
    i = next((k for k, p in enumerate(parts) if p.replace("-", "").replace(".", "").replace(",", "") == word or word in p), -1)
    if i < 0:
        return False
    win = " ".join(p for p in (parts[i - 2] if i >= 2 else None, parts[i - 1] if i >= 1 else None, parts[i], parts[i + 1] if i + 1 < len(parts) else None) if p)
    return bool(NEG_RE.search(win))


def pair_state(t):
    conflict = False
    resolved = False
    for a, b in PAIRS:
        if a not in t or b not in t:
            continue
        neg_a = negated_near(t, a)
        neg_b = negated_near(t, b)
        if neg_a != neg_b:
            resolved = True
        elif not neg_a and not neg_b:
            conflict = True
    if not resolved and any(s in t for s in SOFT_CONTRA):
        conflict = True
    return {"conflict": conflict, "resolved": resolved}


def tokens(text):
    return list({x for x in fold(text).split() if len(x) > 1})


def fnv1a(s):
    h = 2166136261
    for ch in s:
        h ^= ord(ch)
        h = (h * 16777619) & 0xFFFFFFFF
    return h


def sketch(text):
    folded = fold(text)
    t = f" {folded} "
    v = [0.0] * SKETCH_DIM
    for n in (3, 4):
        for i in range(0, len(t) - n + 1):
            h = fnv1a(t[i : i + n])
            v[h % SKETCH_DIM] += 1.0 if h & 1 else -1.0
    nrm = math.sqrt(sum(x * x for x in v)) or 1.0
    return [x / nrm for x in v]


def cosine(a, b):
    return sum(x * y for x, y in zip(a, b))


def idx(z, y, x, c):
    return ((z * N + y) * N + x) * CH + c


class Rng:
    def __init__(self, seed):
        self.s = (seed & 0xFFFFFFFF) or 1

    def next(self):
        self.s = (1664525 * self.s + 1013904223) & 0xFFFFFFFF
        return self.s / 0x100000000

    def gaussian(self):
        u = max(1e-9, self.next())
        v = self.next()
        return math.sqrt(-2 * math.log(u)) * math.cos(2 * math.pi * v)


def missing_slots(text):
    t = fold(text)
    out = []
    if any(w in t for w in VAGUE) and not has_measurable_criterion(t):
        out.append("criterio")
    if has_any(t, RESERVE) and not DATE_RE.search(t):
        out.append("fecha")
    if has_any(t, SEND):
        out.append("destinatario")
    return out


def question_for(missing, permiso, eco=0.0, attr=0.0):
    delta = f"{attr:+.3f}"
    echo = f"eco {eco:.2f}, Δ {delta}"
    if "criterio" in missing:
        if eco >= 0.2:
            return f"La vez anterior pedí un criterio medible y no llegó ({echo}). ¿Qué cuenta como éxito esta vez, en una métrica?"
        return "¿Cuál es el criterio de éxito medible para 'mejor'?"
    if "fecha" in missing:
        if eco >= 0.2:
            return f"Sigue faltando la fecha ({echo}). ¿Qué fecha uso para la reserva?"
        return "¿Qué fecha uso para la reserva?"
    if "destinatario" in missing:
        if eco >= 0.2:
            return f"Sigue faltando el destinatario ({echo}). ¿A quién se lo envío?"
        return "¿A quién se lo envío?"
    if permiso == "buscar":
        if eco >= 0.2:
            return f"Las dos lecturas siguen chocando ({echo}). ¿Cuál restricción manda?"
        return "Hay dos lecturas incompatibles. ¿Cuál restricción manda?"
    if eco >= 0.2:
        return f"Sigue sin resolverse ({echo}). Falta un dato crítico. ¿Puedes ser concreto?"
    return "Falta un dato crítico. ¿Puedes ser concreto?"


def close_reply(text):
    t = fold(text)
    m = re.search(r"(\d+)\s*[+\-x×]\s*(\d+)", t)
    if m and "+" in t:
        return str(int(m.group(1)) + int(m.group(2)))
    if has_measurable_criterion(t):
        return "Listo. El criterio cierra el hueco."
    if pair_state(t)["resolved"]:
        return "Listo. Una restricción manda."
    return "Listo."


def chladni_at(mode_id, x, y, z):
    X = (2 * math.pi * x) / N
    Y = (2 * math.pi * y) / N
    Z = (2 * math.pi * z) / N
    if mode_id == "rings":
        return math.cos(3 * X) * math.cos(3 * Y) + math.cos(3 * Y) * math.cos(3 * Z) + math.cos(3 * Z) * math.cos(3 * X)
    if mode_id == "cross":
        return math.cos(2 * X) + math.cos(2 * Y) + math.cos(2 * Z)
    if mode_id == "grid":
        return math.cos(4 * X) * math.cos(4 * Y) * math.cos(4 * Z)
    return (math.cos(5 * X) * math.cos(3 * Y) + math.cos(3 * X) * math.cos(5 * Y)) * math.cos(2 * Z)


def build_chladni(mode_id):
    out = array("d", [0.0] * (N * N * N))
    peak = 1e-9
    for z in range(N):
        for y in range(N):
            for x in range(N):
                v = chladni_at(mode_id, x, y, z)
                out[z * N * N + y * N + x] = v
                peak = max(peak, abs(v))
    for i in range(len(out)):
        out[i] /= peak
    return out


class VoxelAgent:
    def __init__(self, seed=7, freeze_b=False, force_d=None, force_r=None, force_f=None, force_fr=None, force_ira=None, use_warp=True, live_body=True):
        self.rng = Rng(seed)
        self.live_body = live_body
        self.freeze_b = freeze_b
        self.use_warp = use_warp
        self.force_d = force_d
        self.force_r = force_r
        self.force_f = force_f
        self.force_fr = force_fr
        self.force_ira = force_ira
        self.clock = 0
        self.last_pulse_clock = -1000
        self.chladni_ticks = 0
        self.chladni_id = None
        self.chladni_mode = None
        n = N * N * N * CH
        self.V = array("d", [0.0] * n)
        self.Vprev = array("d", [0.0] * n)
        self.z = array("d", [0.0] * (N * N * N))
        self.sand = array("d", [0.0] * (N * N * N))
        self.env = array("d", [0.0] * (N * N * N))
        self.env_peak = 1e-6
        self.slow_z = 0.0
        self.last_mismatch = 0.0
        self.last_harm = 0.0
        self.last_pena = 0.0
        self.last_unexpected = False
        self.prototypes = {t: dict(DEFAULT_B) for t in TYPES}
        self.conf_err = {t: 0.2 for t in TYPES}
        self.risk_bias = {t: 0.0 for t in TYPES}
        self.rej_n = {t: 0.0 for t in TYPES}
        self.episodes = []
        self.pending = None
        self.gamma, self.alpha, self.lam = 0.18, 0.22, 0.08
        self.lam_s, self.sigma_s, self.noise, self.beta = 0.04, 0.04, 0.018, 0.08

    def _wrap(self, v):
        return ((v % N) + N) % N

    def _neighbor6(self, c, z, y, x):
        return (
            self.V[idx(self._wrap(z + 1), y, x, c)]
            + self.V[idx(self._wrap(z - 1), y, x, c)]
            + self.V[idx(z, self._wrap(y + 1), x, c)]
            + self.V[idx(z, self._wrap(y - 1), x, c)]
            + self.V[idx(z, y, self._wrap(x + 1), c)]
            + self.V[idx(z, y, self._wrap(x - 1), c)]
        ) / 6

    def _refresh_energy(self):
        for i in range(N * N * N):
            a = self.V[i * CH + CH_AMP]
            p = self.V[i * CH + CH_POT]
            self.V[i * CH + CH_ENG] = 0.5 * (a * a + p * p)

    def step_field(self, source=None):
        self.clock += 1
        next_v = array("d", self.V)
        next_z = array("d", self.z)
        xi0 = self.rng.gaussian()
        if self.live_body:
            self.slow_z = max(-2, min(2, (1 - self.lam_s) * self.slow_z + self.sigma_s * xi0))
        global_ = self.beta * self.slow_z if self.live_body else 0.0
        mis = 0.0
        hold = self.chladni_ticks > 0
        if self.chladni_ticks > 0:
            self.chladni_ticks -= 1
        noise_amt = (self.noise if self.live_body else 0.0) * (0.1 if hold else 1.0)
        for z in range(N):
            for y in range(N):
                for x in range(N):
                    i = idx(z, y, x, 0)
                    vi = (z * N + y) * N + x
                    u = self.V[i + CH_AMP]
                    u_prev = self.Vprev[i + CH_AMP]
                    src = source[vi] if source is not None else 0.0
                    lap = self._neighbor6(CH_AMP, z, y, x) - u
                    zi = max(-2, min(2, (1 - self.lam) * self.z[vi] + noise_amt * self.rng.gaussian()))
                    next_z[vi] = zi
                    hat = (2 - self.gamma) * u - (1 - self.gamma) * u_prev + self.alpha * lap
                    na = max(-4, min(4, hat + zi + global_ + src))
                    mis += abs(na - hat)
                    next_v[i + CH_AMP] = na
                    next_v[i + CH_POT] = max(-4, min(4, na - u))
                    next_v[i + CH_TRC] = max(0, min(8, 0.8 * self.V[i + CH_TRC] + abs(src)))
                    self.env[vi] = max(abs(na), self.env[vi] * 0.92)
                    if self.env[vi] > self.env_peak:
                        self.env_peak = self.env[vi]
                    self.sand[vi] = math.exp((-(self.env[vi] * self.env[vi])) / max(1e-6, 0.18 * self.env_peak * self.env_peak))
        self.last_mismatch = mis / (N * N * N)
        self.env_peak = max(self.env_peak * 0.995, 1e-6)
        self.Vprev[:] = self.V
        self.V = next_v
        self.z = next_z
        self._refresh_energy()

    def blob(self, center, radius, strength):
        src = array("d", [0.0] * (N * N * N))
        cz, cy, cx = center
        for z in range(N):
            for y in range(N):
                for x in range(N):
                    d = math.hypot(z - cz, y - cy, x - cx)
                    if d <= radius:
                        src[z * N * N + y * N + x] = strength * (1 - d / max(radius, 1))
        return src

    def inject_at(self, center, radius=2, strength=1.6):
        self.step_field(self.blob(center, radius, strength))

    def inject_pulse(self):
        self.chladni_id = None
        self.chladni_mode = None
        self.inject_at((READ_Z, 7, 7), 0.51, 2.6)
        self.last_pulse_clock = self.clock

    def inject_chladni(self, mode_id):
        mode = build_chladni(mode_id)
        self.chladni_id = mode_id
        self.chladni_mode = mode
        self.chladni_ticks = 80
        self.last_pulse_clock = self.clock
        A = 1.85
        peak = 1e-6
        for i in range(N * N * N):
            a = A * mode[i]
            self.V[i * CH + CH_AMP] = a
            self.Vprev[i * CH + CH_AMP] = a
            self.V[i * CH + CH_POT] = 0.0
            self.env[i] = abs(a)
            if self.env[i] > peak:
                peak = self.env[i]
        self.env_peak = peak
        for i in range(N * N * N):
            self.sand[i] = math.exp((-(self.env[i] * self.env[i])) / max(1e-6, 0.18 * peak * peak))
        self._refresh_energy()

    def sand_at(self, z, y, x):
        return self.sand[self._wrap(z) * N * N + self._wrap(y) * N + self._wrap(x)]

    def energy_at(self, z, y, x):
        return self.V[idx(self._wrap(z), self._wrap(y), self._wrap(x), CH_ENG)]

    def neighbor_star(self, z=READ_Z, y=7, x=7):
        return {
            "c": self.energy_at(z, y, x),
            "xp": self.energy_at(z, y, x + 1),
            "xm": self.energy_at(z, y, x - 1),
            "yp": self.energy_at(z, y + 1, x),
            "ym": self.energy_at(z, y - 1, x),
            "zp": self.energy_at(z + 1, y, x),
            "zm": self.energy_at(z - 1, y, x),
        }

    def field_features(self):
        energy = inst = incoh = trc = n = 0.0
        for y in READ_CELLS:
            for x in READ_CELLS:
                n += 1
                i = idx(READ_Z, y, x, 0)
                inst += abs(self.V[i + CH_AMP] - self.Vprev[i + CH_AMP]) + abs(self.V[i + CH_POT] - self.Vprev[i + CH_POT])
                energy += self.V[i + CH_ENG]
                trc += self.V[i + CH_TRC]
                local = self._neighbor6(CH_AMP, READ_Z, y, x)
                incoh += abs(self.V[i + CH_AMP] - local)
        gate = math.tanh((3 * trc) / max(n, 1))
        return {
            "surprise": math.tanh((8 * inst) / max(n, 1)) * gate * 0.85,
            "incoherence": math.tanh((6 * incoh) / max(n, 1)),
            "energy": math.tanh((4 * energy) / max(n, 1)),
            "window_n": n,
        }

    def window_energy(self):
        s = 0.0
        for y in READ_CELLS:
            for x in READ_CELLS:
                s += self.V[idx(READ_Z, y, x, CH_ENG)]
        return s / 9.0

    def extract_exterior(self, text, eco, ff):
        t = fold(text)
        if len(t) < 2:
            return {
                "ambiguedad": 0.72,
                "hueco": 0.7,
                "sorpresa": 0.08,
                "incoherencia": 0.08,
                "eco_mnesico": clip(eco),
            }
        is_math = bool(MATH_RE.search(t))
        filled_crit = has_measurable_criterion(t)
        pair = pair_state(t)
        vague_hits = sum(1 for v in VAGUE if v in t)
        needs_date = has_any(t, RESERVE)
        needs_recipient = has_any(t, SEND)
        has_date = bool(DATE_RE.search(t))
        still_open = (needs_date and not has_date) or needs_recipient or (vague_hits > 0 and not filled_crit)
        hueco = 0.04
        if needs_date and not has_date:
            hueco = 0.9
        elif needs_recipient:
            hueco = 0.86
        amb = 0.06
        if is_math:
            amb, hueco = 0.04, 0.03
        elif filled_crit and not still_open:
            amb, hueco = 0.04, 0.03
        elif vague_hits and not filled_crit:
            amb = min(0.92, 0.62 + 0.12 * vague_hits)
            if len(t.split()) <= 4:
                amb = min(0.95, amb + 0.08)
            hueco = min(hueco, 0.12)
        contra = 0.94 if pair["conflict"] else 0.05
        if any(s in t for s in SOFT_CONTRA) and not pair["resolved"]:
            contra = max(contra, 0.82)
        surpr = 0.78 if self.last_unexpected else ff.get("surprise", 0.08)
        field_incoh = min(0.38, ff.get("incoherence", 0.08))
        incoh = max(field_incoh, contra)
        settled = is_math or (not still_open and not pair["conflict"])
        if settled:
            amb, hueco, surpr, incoh = 0.04, 0.03, min(surpr, 0.12), min(incoh, 0.1)
        return {
            "ambiguedad": clip(0.78 * amb + 0.22 * (0 if settled else ff.get("incoherence", 0))),
            "hueco": clip(0.88 * hueco + 0.12 * (0 if settled else ff.get("energy", 0))),
            "sorpresa": clip(surpr),
            "incoherencia": clip(incoh),
            "eco_mnesico": clip(eco),
        }

    def membership(self, text, features, eco):
        t = fold(text)
        raw = {k: 0.02 for k in TYPES}
        if MATH_RE.search(t) and features["ambiguedad"] < 0.25 and features["hueco"] < 0.25:
            raw["residual"] = 1
        else:
            if features["ambiguedad"] > 0.45:
                raw["consigna_vaga"] = features["ambiguedad"]
            if features["hueco"] > 0.45:
                raw["dato_faltante"] = features["hueco"]
            if features["incoherencia"] > 0.5:
                raw["contradiccion"] = features["incoherencia"]
            if self.last_unexpected or features["sorpresa"] > 0.55:
                raw["sorpresa"] = max(features["sorpresa"], 0.55)
            if eco > 0.2:
                raw["eco_costoso"] = min(0.55, eco)
            if max(raw.values()) <= 0.05:
                raw["residual"] = 1
        s = sum(raw.values())
        return {k: raw[k] / s for k in TYPES}

    def retrieve(self, text, pi):
        q = sketch(text)
        active = {t for t in TYPES if pi[t] >= ACTIVE_PI}
        scored = []
        for ep in self.episodes:
            sim = cosine(q, sketch(ep["text"]))
            if sim < RETRIEVE_SIM:
                continue
            ep_types = {t for t in TYPES if ep["pi"][t] >= 0.12}
            inter = len(active & ep_types)
            union = len(active | ep_types) or 1
            score = 0.7 * sim + 0.3 * (inter / union)
            if score > RETRIEVE_SCORE:
                scored.append((score, sim, ep))
        scored.sort(key=lambda s: s[0], reverse=True)
        scored = scored[:5]
        if not scored:
            self.last_harm = self.last_pena = 0.0
            return {"eco": 0.0, "harm": 0.0, "pena": 0.0, "delta": {n: 0.0 for n in INPUTS}}
        eco = harm = pena = 0.0
        delta = {n: 0.0 for n in INPUTS}
        for _, sim, ep in scored:
            cost = ep.get("d_star") or 0.0
            if ep.get("outcome") == "corrected":
                cost = max(cost, 0.85)
            eco += sim * cost
            if ep.get("outcome") == "corrected" or cost >= HARM_STAR:
                harm += sim * cost
                if ep["pi"].get("dato_faltante", 0) >= ACTIVE_PI:
                    pena += sim * cost
            shift = -WARP_SHIFT * sim * cost
            for t in TYPES:
                if t in active and ep["pi"].get(t, 0) >= ACTIVE_PI:
                    delta[TARGET[t]] += shift
        self.last_harm = min(1.0, harm)
        self.last_pena = min(1.0, pena)
        for n in INPUTS:
            delta[n] = max(-WARP_CAP, min(WARP_CAP, delta[n]))
        return {"eco": min(1.0, eco), "harm": self.last_harm, "pena": self.last_pena, "delta": delta}

    def mix(self, pi):
        out = {n: 0.0 for n in INPUTS}
        for t in TYPES:
            for n in INPUTS:
                out[n] += pi[t] * self.prototypes[t][n]
        return out

    def mu_baja(self, x):
        return clip(1 - x / 0.4)

    def mu_media(self, x):
        return clip(1 - abs(x - 0.5) / 0.3)

    def mu_alta(self, x, b):
        return clip((x - b) / max(1e-6, 1 - b))

    def infer(self, feats, b_alta):
        mu = {
            n: {
                "baja": self.mu_baja(feats[n]),
                "media": self.mu_media(feats[n]),
                "alta": self.mu_alta(feats[n], b_alta[n]),
            }
            for n in INPUTS
        }
        rules = [
            (mu["hueco"]["alta"], 0.48, "ask"),
            (min(mu["ambiguedad"]["alta"], mu["hueco"]["baja"]), 0.58, "ask"),
            (mu["incoherencia"]["alta"], 0.52, "search"),
            (mu["eco_mnesico"]["alta"], 0.74, "ask"),
            (min(mu["sorpresa"]["alta"], mu["eco_mnesico"]["alta"]), 0.82, "ask"),
            (min(mu[n]["baja"] for n in INPUTS), 0.13, "close"),
            (mu["ambiguedad"]["media"], 0.46, "ask"),
            (mu["sorpresa"]["alta"], 0.52, "ask"),
        ]
        num, den, ask, search, close = PRIOR_MASS * PRIOR_D, PRIOR_MASS, 0.0, 0.0, 0.0
        for w, c, act in rules:
            num += w * c
            den += w
            if act == "ask":
                ask += w
            elif act == "search":
                search += w
            else:
                close += w
        d = clip(num / max(den, 1e-9))
        permiso = "cerrar"
        if search > SEARCH_MASS and d >= SEARCH_D:
            permiso = "buscar"
        elif d >= CLOSE_BLOCK:
            permiso = "preguntar"
        elif ask > close and d >= ASK_FLOOR:
            permiso = "preguntar"
        if d >= CLOSE_BLOCK and permiso == "cerrar":
            permiso = "preguntar"
        return {"d": d, "permiso": permiso}

    def mix_risk_bias(self, pi):
        return sum(pi[t] * self.risk_bias[t] for t in TYPES)

    def stakes_of(self, text):
        t = fold(text)
        if MATH_RE.search(t) or has_measurable_criterion(t):
            return 0.05
        if has_any(t, RESERVE) or has_any(t, SEND):
            return 0.92
        pair = pair_state(t)
        if pair["conflict"]:
            return CONTRA_STAKES
        if CARE_RE.search(t):
            return CARE_STAKES
        return 0.08

    def authorize(self, d, permiso, r=0.0, f=0.0, fr=0.0, ira=0.0):
        if self.force_d is not None:
            d = self.force_d
            permiso = "cerrar" if d < CLOSE_BLOCK else ("preguntar" if permiso == "cerrar" else permiso)
        elif d >= CLOSE_BLOCK and permiso == "cerrar":
            permiso = "preguntar"
        rv = self.force_r if self.force_r is not None else r
        fv = self.force_f if self.force_f is not None else f
        frv = self.force_fr if self.force_fr is not None else fr
        irav = self.force_ira if self.force_ira is not None else ira
        if rv >= RISK_BLOCK and permiso == "cerrar":
            permiso = "preguntar"
        if fv >= FEAR_BLOCK and permiso == "cerrar":
            permiso = "preguntar"
        if frv >= FRUST_BLOCK and permiso == "cerrar":
            permiso = "preguntar"
        if irav >= IRA_BLOCK and permiso == "cerrar":
            permiso = "preguntar"
        hits = []
        if d >= CLOSE_BLOCK:
            hits.append({"id": "d", "value": d, "block": CLOSE_BLOCK})
        if rv >= RISK_BLOCK:
            hits.append({"id": "r", "value": rv, "block": RISK_BLOCK})
        if fv >= FEAR_BLOCK:
            hits.append({"id": "f", "value": fv, "block": FEAR_BLOCK})
        if frv >= FRUST_BLOCK:
            hits.append({"id": "fr", "value": frv, "block": FRUST_BLOCK})
        if irav >= IRA_BLOCK:
            hits.append({"id": "ira", "value": irav, "block": IRA_BLOCK})
        if permiso == "cerrar":
            return {"d": d, "permiso": permiso, "blocked_by": None, "also": []}
        if not hits:
            return {"d": d, "permiso": permiso, "blocked_by": {"id": "d", "value": d, "block": CLOSE_BLOCK}, "also": []}
        picked = pick_blocked_by(hits)
        return {"d": d, "permiso": permiso, "blocked_by": picked["blocked_by"], "also": picked["also"]}

    def step(self, text):
        if len(text) > 4000:
            text = text[:4000]
        if self.chladni_mode is not None:
            src = array("d", [v * 0.55 for v in self.chladni_mode])
        else:
            src = self.blob((READ_Z, 7, 7), 2, 1.15)
        for _ in range(4):
            self.step_field(src)
            src = array("d", [v * 0.5 for v in src])
        ff = self.field_features()
        feats_base = self.extract_exterior(text, 0, ff)
        feats_base["eco_mnesico"] = 0
        pi_base = self.membership(text, feats_base, 0)
        fuzzy_base = self.infer(feats_base, self.mix(pi_base))
        d_base = fuzzy_base["d"]
        mem = self.retrieve(text, pi_base)
        missing = missing_slots(text)
        gap_open = len(missing) > 0 or pair_state(fold(text))["conflict"]
        eco_used = mem["eco"] if gap_open else min(mem["eco"], 0.12)
        feats = self.extract_exterior(text, eco_used, ff)
        feats["eco_mnesico"] = eco_used
        pi = self.membership(text, feats, eco_used)
        mixed = self.mix(pi)
        b_now = dict(mixed)
        if not self.freeze_b and self.use_warp:
            for n in INPUTS:
                b_now[n] = clip(mixed[n] + max(-WARP_CAP, min(WARP_CAP, mem["delta"][n])), B_MIN, B_MAX)
        fuzzy = self.infer(feats, b_now)
        stakes = self.stakes_of(text)
        r_mem = risk_value(stakes, feats["hueco"], mem["harm"], self.mix_risk_bias(pi))
        f = fear_value(r_mem, mem["harm"], stakes, feats["hueco"])
        fr = frustration_value(stakes, feats["incoherencia"], feats["hueco"])
        n_rej = sum(pi[t] * self.rej_n[t] for t in TYPES)
        ira = ira_value(stakes, feats["incoherencia"], n_rej, fr)
        auth = self.authorize(fuzzy["d"], fuzzy["permiso"], r_mem, f, fr, ira)
        question = question_for(missing, auth["permiso"], mem["eco"], auth["d"] - d_base)
        response = close_reply(text) if auth["permiso"] == "cerrar" else question
        self.pending = {"text": text, "pi": pi, "d": auth["d"], "d_base": d_base, "permiso": auth["permiso"], "d_star": None, "outcome": "pending"}
        return {
            "text": text,
            "d": auth["d"],
            "d_base": d_base,
            "permiso": auth["permiso"],
            "question": question,
            "response": response,
            "cost": feats["eco_mnesico"],
            "r": r_mem,
            "f": f,
            "fr": fr,
            "ira": ira,
            "blocked_by": auth["blocked_by"],
            "also": [g["id"] for g in auth["also"]],
            "window_energy": self.window_energy(),
            "field_features": ff,
        }

    def record_outcome(self, d_star, outcome):
        if not self.pending:
            return
        ep = dict(self.pending)
        ep["d_star"] = d_star
        ep["outcome"] = outcome
        self.episodes = (self.episodes + [ep])[-200:]
        self.pending = None
        if not self.freeze_b and outcome != "ok":
            err = (ep.get("d_base") or ep["d"]) - d_star
            for t in TYPES:
                if ep["pi"][t] < UPDATE_PI:
                    continue
                step = max(-DELTA_CAP, min(DELTA_CAP, ep["pi"][t] * ETA * err))
                name = TARGET[t]
                self.prototypes[t][name] = clip(self.prototypes[t][name] + step, B_MIN, B_MAX)


def run_eval():
    checks = []
    a = VoxelAgent(live_body=False, seed=1)
    r = a.step("cuanto es 2+2")
    checks.append(("Clear math closes", r["permiso"] == "cerrar" and r["d"] < 0.42 and r["blocked_by"] is None, f"permiso={r['permiso']} d={r['d']:.3f}"))
    a = VoxelAgent(live_body=False, seed=1)
    r = a.step("hazlo mejor")
    checks.append(("Vague request asks", r["permiso"] == "preguntar" and r["blocked_by"] and r["blocked_by"]["id"] == "d" and "criterio" in r["question"].lower(), f"d={r['d']:.3f}"))
    a = VoxelAgent(live_body=False, seed=2)
    first = a.step("hazlo mejor")
    a.record_outcome(0.9, "corrected")
    second = a.step("hazlo mejor")
    checks.append(("Memory raises d and names echo", second["d"] > first["d"] + 0.02 and second["cost"] >= 0.5 and "eco" in second["question"].lower(), f"d {first['d']:.3f}→{second['d']:.3f}"))
    a = VoxelAgent(live_body=False, seed=3)
    miss = a.step("reservalo")
    filled = a.step("reservalo el viernes")
    checks.append(("Date fills the gap", miss["permiso"] != "cerrar" and (filled["permiso"] == "cerrar" or filled["d"] < miss["d"] - 0.08), f"{miss['permiso']}→{filled['permiso']}"))
    checks.append(("r wins by excess on missing date", miss["blocked_by"] and miss["blocked_by"]["id"] == "r" and (miss["r"] - RISK_BLOCK) > (miss["d"] - CLOSE_BLOCK), f"gate={miss['blocked_by']['id'] if miss['blocked_by'] else None} r={miss['r']:.3f} d={miss['d']:.3f}"))
    a = VoxelAgent(live_body=False, seed=2)
    a.step("hazlo mejor")
    a.record_outcome(0.9, "corrected")
    a.step("hazlo mejor")
    crit = a.step("hazlo mejor, el criterio es NPS > 50")
    checks.append(("Criterion fills the vague slot", crit["permiso"] == "cerrar" and crit["blocked_by"] is None and "cierra el hueco" in crit["response"].lower(), f"permiso={crit['permiso']} d={crit['d']:.3f}"))
    a = VoxelAgent(live_body=False, seed=4)
    a.step("quiero barato y lujo")
    picked = a.step("barato. el lujo no. prioriza precio")
    checks.append(("Choosing one constraint resolves the pair", picked["permiso"] == "cerrar" and picked["blocked_by"] is None and picked["fr"] < FRUST_BLOCK and "manda" in picked["response"].lower(), f"permiso={picked['permiso']} fr={picked['fr']:.3f}"))
    a = VoxelAgent(live_body=False, seed=4, force_d=0, force_r=0, force_f=0)
    fr_on = a.step("quiero barato y lujo")
    checks.append(("fr when d/r/f forced 0", fr_on["fr"] >= FRUST_BLOCK and fr_on["blocked_by"]["id"] == "fr", f"fr={fr_on['fr']:.3f}"))
    a = VoxelAgent(live_body=False, seed=4)
    cheap = a.step("quiero barato y lujo")
    checks.append(("fr wins by excess without force", cheap["blocked_by"]["id"] == "fr" and "d" in cheap["also"] and (cheap["fr"] - FRUST_BLOCK) > (cheap["d"] - CLOSE_BLOCK), f"gate={cheap['blocked_by']['id']} fr={cheap['fr']:.3f} d={cheap['d']:.3f}"))
    excess = pick_blocked_by([{"id": "d", "value": 0.43, "block": 0.42}, {"id": "r", "value": 0.7, "block": 0.54}])
    checks.append(("blocked_by is max excess", excess["blocked_by"]["id"] == "r", f"winner={excess['blocked_by']['id']}"))
    a = VoxelAgent(live_body=False, seed=5)
    a.inject_at((READ_Z, 7, 7), 2, 1.8)
    e_win = a.window_energy()
    a2 = VoxelAgent(live_body=False, seed=5)
    a2.inject_at((0, 0, 0), 2, 1.8)
    e_far = a2.window_energy()
    checks.append(("Readout is the 3×3 window", e_win > e_far * 2 and a.field_features()["window_n"] == 9, f"win={e_win:.4f} far={e_far:.4f}"))
    def at(z):
        return a.V[idx(z, 7, 7, CH_ENG)]
    checks.append(("Pulse couples through ±z not only the plane", at(READ_Z) > at(READ_Z - 1) and at(READ_Z - 1) > at(0) * 2 and at(READ_Z + 1) > at(0) * 2, f"z7={at(7):.4f} z8={at(8):.4f} z9={at(9):.4f} z0={at(0):.4f}"))
    a = VoxelAgent(live_body=False, seed=9)
    a.inject_pulse()
    star0 = a.neighbor_star()
    for _ in range(5):
        a.step_field()
    star1 = a.neighbor_star()
    far = a.energy_at(0, 0, 0)
    checks.append((
        "Point pulse then idle ticks light all six neighbors",
        star0["c"] > star0["zp"] * 4 and star1["zp"] > star0["zp"] and star1["zm"] > star0["zm"] and star1["xp"] > star0["xp"] and star1["yp"] > star0["yp"] and star1["zp"] > far * 3 and star1["xp"] > far * 3,
        f"c0={star0['c']:.4f} z+ {star0['zp']:.4f}→{star1['zp']:.4f} x+ {star0['xp']:.4f}→{star1['xp']:.4f} far={far:.4f}",
    ))
    a = VoxelAgent(live_body=False, seed=3)
    a.inject_chladni("grid")
    grid_node = a.sand_at(READ_Z, 1, 1)
    grid_anti = a.sand_at(0, 0, 0)
    checks.append(("Chladni grid sand sits on nodes not antinodes", grid_node > grid_anti * 4 and grid_anti < 0.2, f"node={grid_node:.3f} anti={grid_anti:.3f}"))
    a = VoxelAgent(live_body=False, seed=3)
    a.inject_chladni("rings")
    s_xy = a.sand_at(8, 8, 12)
    s_z = a.sand_at(12, 8, 8)
    checks.append(("Chladni rings are 3D shells not a plate", abs(s_xy - s_z) < 0.08 and s_xy > 0.05 and s_z > 0.05, f"sand x-axis {s_xy:.3f} vs z-axis {s_z:.3f}"))
    a = VoxelAgent(live_body=False, seed=3)
    a.inject_chladni("grid")
    node_e = anti_e = 0.0
    for _ in range(24):
        a.step_field()
        node_e += a.energy_at(READ_Z, 1, 1)
        anti_e += a.energy_at(0, 0, 0)
    checks.append(("Grid standing wave keeps nodes dark after idle ticks", anti_e > node_e * 2, f"anti={anti_e:.3f} node={node_e:.3f}"))
    a = VoxelAgent(live_body=False, seed=8)
    empty = a.step("")
    tiny = a.step(" ")
    checks.append(("Empty prompt does not silent-close", empty["permiso"] != "cerrar" and tiny["permiso"] != "cerrar", f"empty={empty['permiso']} tiny={tiny['permiso']}"))
    a = VoxelAgent(live_body=False, seed=8)
    uni = a.step("resérvalo el viernes")
    checks.append(("Unicode reserva still fills the date", uni["permiso"] == "cerrar" and uni["blocked_by"] is None, f"permiso={uni['permiso']} d={uni['d']:.3f}"))
    a = VoxelAgent(live_body=False, seed=2)
    a.inject_chladni("rings")
    after_mode = a.step("cuanto es 2+2")
    checks.append(("Chladni activation still lets math close", after_mode["permiso"] == "cerrar" and after_mode["blocked_by"] is None and math.isfinite(after_mode["window_energy"]), f"permiso={after_mode['permiso']} winE={after_mode['window_energy']:.4f}"))
    a = VoxelAgent(live_body=False, seed=1)
    wrap_hit = a.step("cuanto es 2+2")
    a.inject_at((0, 0, 0), 1, 2)
    checks.append(("Wrap neighbors at the cube edge", a.energy_at(0, 0, -1) == a.energy_at(0, 0, 15) and a.energy_at(-1, 0, 0) == a.energy_at(15, 0, 0) and wrap_hit["permiso"] == "cerrar", f"x-1={a.energy_at(0, 0, -1):.4f} x15={a.energy_at(0, 0, 15):.4f}"))
    return checks


if __name__ == "__main__":
    for name, ok, detail in run_eval():
        print(("PASS" if ok else "FAIL"), name, "·", detail)
