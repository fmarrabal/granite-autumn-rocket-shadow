export type Locale = "es" | "en";
export const LANG_KEY = "umbral-lang";

type TourStep = { do: string; see: string; chip?: string; chipLabel?: string; record?: "ok" | "corrected"; copy?: boolean; pulse?: boolean };

export type Copy = {
  controlBus: string;
  lede: string;
  langLabel: string;
  consigna: string;
  placeholder: string;
  stepOf: (n: number, total: number) => string;
  tourDone: string;
  tourDoneBody: string;
  run: string;
  runHint: string;
  recordCorrection: string;
  recordObserved: string;
  reset: string;
  freezeEdges: string;
  forceD: string;
  forceR: string;
  forceF: string;
  forceFr: string;
  forceIra: string;
  warpOn: string;
  aperiodic: string;
  permiso: string;
  idle: string;
  controlTag: string;
  meterD: string;
  meterR: string;
  meterF: string;
  meterFr: string;
  meterIra: string;
  blocks: string;
  climate: string;
  mute: string;
  blocked: string;
  gateNone: string;
  gateBlocked: string;
  gateAlso: string;
  copyTurn: string;
  copied: string;
  thisPrompt: string;
  sessionLog: string;
  tape: string;
  tapeHint: string;
  eval: string;
  evalHint: string;
  runChecks: string;
  pass: string;
  fail: string;
  memory: string;
  memoryHint: (n: number) => string;
  memoryEmpty: string;
  seed: string;
  idleNote: string;
  rebuilt: string;
  censored: string;
  corrected: string;
  observed: string;
  memoryPushed: (eco: number, attr: number) => string;
  done: string;
  fieldTitle: string;
  fieldHint: string;
  midPlane: string;
  volume: string;
  energyMean: string;
  pulse: string;
  live: string;
  paused: string;
  zAxis: string;
  zHint: string;
  zUp: string;
  zDown: string;
  zNear: string;
  zRead: string;
  crystalTitle: string;
  crystalHint: string;
  cutXY: string;
  cutXZ: string;
  cutYZ: string;
  injectLabel: string;
  readLabel: string;
  pulseHint: string;
  chladniHint: string;
  modeWord: Record<"grid" | "rings" | "cross" | "weave", string>;
  couplingTitle: string;
  couplingHint: string;
  couplingVoxels: string;
  couplingReadout: string;
  couplingGates: string;
  couplingStageField: string;
  couplingStageRead: string;
  couplingStageGate: string;
  couplingDrag: string;
  couplingBus: string;
  couplingManda: string;
  advanced: string;
  samples: { label: string; text: string }[];
  tour: TourStep[];
  permisoWord: Record<"cerrar" | "preguntar" | "buscar", string>;
  tagWord: Record<string, string>;
  dudaWord: Record<string, string>;
};

const TOUR_ES: TourStep[] = [
  { do: "Pulsa el chip 2 + 2", see: "Permiso: cerrar. Nadie bloqueó.", chip: "cuanto es 2+2" },
  { do: "Pulsa Copiar turno", see: "blocked_by es null.", copy: true },
  { do: "Pulsa Hazlo mejor", see: "preguntar. Bloqueó: d. Pide un criterio.", chip: "hazlo mejor", chipLabel: "Hazlo mejor" },
  { do: "Pulsa Grabar corrección", see: "El tipo consigna_vaga se mueve.", record: "corrected" },
  { do: "Pulsa Hazlo mejor otra vez", see: "El texto nombra el eco. Δ es positivo.", chip: "hazlo mejor", chipLabel: "Hazlo mejor otra vez" },
  { do: "Pulsa NPS > 50", see: "Cerrar. El criterio llena el hueco aunque siga la palabra 'mejor'.", chip: "hazlo mejor, el criterio es NPS > 50" },
  { do: "Pulsa Resérvalo", see: "Bloqueó: r. Falta la fecha. El exceso de riesgo manda, no d.", chip: "reservalo" },
  { do: "Pulsa Viernes", see: "Cierra. El hueco de fecha se llenó.", chip: "reservalo el viernes" },
  { do: "Pulsa Barato y lujo", see: "Bloqueó: fr. Más exceso que d; d e ira también cruzan.", chip: "quiero barato y lujo" },
  { do: "Pulsa Elige barato", see: "Cerrar. Negar lujo resuelve el par.", chip: "barato. el lujo no. prioriza precio" },
  { do: "Pulsa Capas", see: "Arena en los nodos, como Chladni. xz e yz no copian el plano: el modo llena el cubo.", pulse: true },
];

const TOUR_EN: TourStep[] = [
  { do: "Press 2 + 2", see: "Permission: close. No gate blocked.", chip: "cuanto es 2+2" },
  { do: "Press Copy turn", see: "blocked_by is null.", copy: true },
  { do: "Press Make it better", see: "ask. Blocked by: d. It wants a criterion.", chip: "hazlo mejor", chipLabel: "Make it better" },
  { do: "Press Record correction", see: "The vague-prompt type moves.", record: "corrected" },
  { do: "Press Make it better again", see: "The reply names the echo. Δ is positive.", chip: "hazlo mejor", chipLabel: "Make it better again" },
  { do: "Press NPS > 50", see: "Close. The criterion fills the gap even though 'better' stays.", chip: "hazlo mejor, el criterio es NPS > 50" },
  { do: "Press Book it", see: "Blocked by: r. Date missing. Risk excess commands, not d.", chip: "reservalo" },
  { do: "Press Friday", see: "Closes. The date gap filled.", chip: "reservalo el viernes" },
  { do: "Press Cheap and luxury", see: "Blocked by: fr. More excess than d; d and ira also cross.", chip: "quiero barato y lujo" },
  { do: "Press Choose cheap", see: "Close. Denying luxury resolves the pair.", chip: "barato. el lujo no. prioriza precio" },
  { do: "Press Shells", see: "Sand on the nodes, like Chladni. xz and yz are not the same plate: the mode fills the cube.", pulse: true },
];

export const COPY: Record<Locale, Copy> = {
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
    modeWord: { grid: "Rejilla", rings: "Capas", cross: "Cruz", weave: "Trama" },
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
      { label: "2 + 2", text: "cuanto es 2+2" },
      { label: "Hazlo mejor", text: "hazlo mejor" },
      { label: "Hazlo mejor otra vez", text: "hazlo mejor" },
      { label: "NPS > 50", text: "hazlo mejor, el criterio es NPS > 50" },
      { label: "Resérvalo", text: "reservalo" },
      { label: "Viernes", text: "reservalo el viernes" },
      { label: "Barato y lujo", text: "quiero barato y lujo" },
      { label: "Elige barato", text: "barato. el lujo no. prioriza precio" },
    ],
    tour: TOUR_ES,
    permisoWord: { cerrar: "cerrar", preguntar: "preguntar", buscar: "buscar" },
    tagWord: { duda: "duda", riesgo: "riesgo", alarma: "alarma", frustracion: "frustracion", ira: "ira", pena: "pena", neutro: "neutro" },
    dudaWord: { alta: "alta", media: "media", baja: "baja" },
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
    modeWord: { grid: "Grid", rings: "Shells", cross: "Cross", weave: "Weave" },
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
      { label: "2 + 2", text: "cuanto es 2+2" },
      { label: "Make it better", text: "hazlo mejor" },
      { label: "Make it better again", text: "hazlo mejor" },
      { label: "NPS > 50", text: "hazlo mejor, el criterio es NPS > 50" },
      { label: "Book it", text: "reservalo" },
      { label: "Friday", text: "reservalo el viernes" },
      { label: "Cheap and luxury", text: "quiero barato y lujo" },
      { label: "Choose cheap", text: "barato. el lujo no. prioriza precio" },
    ],
    tour: TOUR_EN,
    permisoWord: { cerrar: "close", preguntar: "ask", buscar: "search" },
    tagWord: { duda: "doubt", riesgo: "risk", alarma: "alarm", frustracion: "frustration", ira: "anger", pena: "grief", neutro: "neutral" },
    dudaWord: { alta: "high", media: "mid", baja: "low" },
  },
};

export function readLocale(): Locale {
  try {
    const v = window.localStorage.getItem(LANG_KEY);
    if (v === "en" || v === "es") return v;
  } catch {
    /* ignore */
  }
  return "es";
}

export function writeLocale(lang: Locale) {
  try {
    window.localStorage.setItem(LANG_KEY, lang);
  } catch {
    /* ignore */
  }
  if (typeof document !== "undefined") document.documentElement.lang = lang;
}

export function displayReply(
  lang: Locale,
  turn: { permiso: string; response: string; missing: string[]; question: string; cost?: number; attr?: number },
): string {
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
    if (eco >= 0.2) {
      return `Last time I asked for a measurable criterion and it did not arrive (${echoBit}). What counts as success this time, as a metric?`;
    }
    return "What is the measurable success criterion for 'better'?";
  }
  if (turn.missing.includes("fecha")) {
    if (eco >= 0.2) return `The date is still missing (${echoBit}). Which date should I use for the booking?`;
    return "Which date should I use for the booking?";
  }
  if (turn.missing.includes("destinatario")) {
    if (eco >= 0.2) return `The recipient is still missing (${echoBit}). Who should I send it to?`;
    return "Who should I send it to?";
  }
  if (turn.permiso === "buscar") {
    if (eco >= 0.2) return `The two readings still collide (${echoBit}). Which constraint wins?`;
    return "Two incompatible readings. Which constraint wins?";
  }
  if (eco >= 0.2) {
    return `Still unresolved (${echoBit}). A critical fact is missing. Can you be specific?`;
  }
  return "A critical fact is missing. Can you be specific?";
}
