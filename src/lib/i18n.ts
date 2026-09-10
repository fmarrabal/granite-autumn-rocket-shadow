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
  modelTitle: string;
  modelHint: string;
  slotCriterio: string;
  slotFecha: string;
  slotRest: string;
  commitment: string;
  hypotheses: string;
  predictionLab: string;
  noPrediction: string;
  cycleTitle: string;
  beatPercept: string;
  beatPredict: string;
  beatMismatch: string;
  beatAct: string;
  slotEmpty: string;
  hypAlive: string;
  hypDead: string;
  commitEmpty: string;
  tipoLab: string;
  gatesTitle: string;
  workspaceOf: (mode: string) => string;
  hypClaim: Record<string, string>;
  bankTitle: string;
  bankHint: string;
  bankRun: string;
  bankScore: string;
  bankPolicy: string;
  bankHits: string;
  bankCaps: string;
  bankCases: string;
  bankFriday: string;
  bankNotThis: string;
  bankAgent: Record<string, { name: string; family: string }>;
  bankCap: Record<string, string>;
  bankCase: Record<string, { title: string; why: string }>;
  advanced: string;
  samples: { label: string; text: string }[];
  tour: TourStep[];
  permisoWord: Record<"cerrar" | "preguntar" | "buscar", string>;
  tagWord: Record<string, string>;
  dudaWord: Record<string, string>;
};

const TOUR_ES: TourStep[] = [
  { do: "Pulsa Hazlo mejor", see: "Hipótesis viva: falta un criterio. Predice una métrica. Workspace Capas.", chip: "hazlo mejor", chipLabel: "Hazlo mejor" },
  { do: "Pulsa El viernes", see: "La predicción muere. No rellena fecha. Sigue pidiendo criterio.", chip: "el viernes", chipLabel: "El viernes" },
  { do: "Pulsa NPS > 50", see: "Cierra y escribe el compromiso estructural.", chip: "el criterio es NPS > 50" },
  { do: "Pulsa Déjalo fino", see: "Otras palabras, mismo compromiso. No hace falta 'mejor'.", chip: "dejalo fino" },
  { do: "Pulsa el chip 2 + 2", see: "Cálculo residual. Permiso: cerrar. Nadie bloqueó.", chip: "cuanto es 2+2" },
  { do: "Pulsa Copiar turno", see: "La cinta lleva tipo, predicción e hipótesis.", copy: true },
  { do: "Pulsa Resérvalo", see: "Falta la fecha. Workspace Rejilla. Bloqueó: r.", chip: "reservalo" },
  { do: "Pulsa Viernes reserva", see: "Cierra. El hueco de fecha se llenó.", chip: "reservalo el viernes" },
  { do: "Pulsa Barato y lujo", see: "Workspace Cruz. Hipótesis par_abierto. Bloqueó: fr.", chip: "quiero barato y lujo" },
  { do: "Pulsa Elige barato", see: "Cerrar. Negar lujo resuelve el par.", chip: "barato. el lujo no. prioriza precio" },
];

const TOUR_EN: TourStep[] = [
  { do: "Press Make it better", see: "Live hypothesis: a criterion is missing. Predicts a metric. Shells workspace.", chip: "hazlo mejor", chipLabel: "Make it better" },
  { do: "Press Friday", see: "The prediction dies. Date is not filled. Still asks for a criterion.", chip: "el viernes", chipLabel: "Friday" },
  { do: "Press NPS > 50", see: "Closes and writes the structural commitment.", chip: "el criterio es NPS > 50" },
  { do: "Press Make it fine", see: "New wording, same commitment. Does not need 'better'.", chip: "dejalo fino" },
  { do: "Press 2 + 2", see: "Residual calc. Permission: close. No gate blocked.", chip: "cuanto es 2+2" },
  { do: "Press Copy turn", see: "The tape carries type, prediction and hypotheses.", copy: true },
  { do: "Press Book it", see: "Date missing. Grid workspace. Blocked by: r.", chip: "reservalo" },
  { do: "Press Friday booking", see: "Closes. The date gap filled.", chip: "reservalo el viernes" },
  { do: "Press Cheap and luxury", see: "Cross workspace. Open-pair hypothesis. Blocked by: fr.", chip: "quiero barato y lujo" },
  { do: "Press Choose cheap", see: "Close. Denying luxury resolves the pair.", chip: "barato. el lujo no. prioriza precio" },
];

export const COPY: Record<Locale, Copy> = {
  es: {
    controlBus: "Ciclo cognitivo",
    lede: "Modelo de situación, predicción que puede morir, compromiso que sobrevive a las palabras. El cubo es el workspace de la hipótesis viva. No es una mente.",
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
    tapeHint: "JSON compacto: tipo, predicción, hipótesis, permiso, puerta por exceso. Sin el cubo 16³.",
    eval: "Eval",
    evalHint: "Incluye hipótesis, predicción fallida, compromiso con otras palabras, r por exceso y Chladni 3D.",
    runChecks: "Correr pruebas",
    pass: "pasa",
    fail: "falla",
    memory: "Memoria",
    memoryHint: (n) => `${n} episodios y ${n ? "compromisos estructurales" : "sin compromisos"}.`,
    memoryEmpty: "Vacía hasta que grabes un resultado.",
    seed: "Semilla",
    idleNote: "Pulsa Hazlo mejor, luego El viernes. Un termostato no pasa ese paso.",
    rebuilt: "Campo nuevo.",
    censored: "Censurado: preguntaste, no viste el cierre.",
    corrected: "Corrección guardada.",
    observed: "Cierre observado.",
    memoryPushed: (eco, attr) => `Memoria: eco ${eco.toFixed(2)} · Δ ${attr >= 0 ? "+" : ""}${attr.toFixed(3)}.`,
    done: "Listo.",
    fieldTitle: "Workspace de la hipótesis",
    fieldHint: "El cubo no es decoración: el modo Chladni es el workspace de la hipótesis viva. Arena en los nodos.",
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
    modelTitle: "Modelo de situación",
    modelHint: "Slots, hipótesis vivas o muertas, predicción y compromiso. El modo del cubo sigue a la hipótesis.",
    slotCriterio: "criterio",
    slotFecha: "fecha",
    slotRest: "restricción",
    commitment: "compromiso",
    hypotheses: "hipótesis",
    predictionLab: "predicción",
    noPrediction: "sin predicción abierta",
    cycleTitle: "ciclo",
    beatPercept: "percepto",
    beatPredict: "predicción",
    beatMismatch: "discrepancia",
    beatAct: "acto",
    slotEmpty: "vacío",
    hypAlive: "viva",
    hypDead: "muerta",
    commitEmpty: "sin compromiso escrito",
    tipoLab: "tipo",
    gatesTitle: "Puertas d / r / f / fr / ira",
    workspaceOf: (mode) => `workspace · ${mode}`,
    hypClaim: {
      falta_criterio: "Falta un criterio medible.",
      falta_fecha: "Falta la fecha de la reserva.",
      par_abierto: "Hay dos restricciones incompatibles.",
      cierre_listo: "Los huecos están llenos.",
    },
    bankTitle: "Banco de control",
    bankHint: "Mismo percepto, nueve políticas. No es un ranking de modelos de lenguaje. El caso que parte al termostato: hazlo mejor → el viernes.",
    bankRun: "Correr banco",
    bankScore: "Agente",
    bankPolicy: "Política",
    bankHits: "Aciertos",
    bankCaps: "Capacidades",
    bankCases: "Casos",
    bankFriday: "Caso que parte",
    bankNotThis: "No corre contra GPT, Claude, ACT-R ni SOAR. Esos sistemas no comparten este percepto. Umbral-C falla el día que el percepto no vea la métrica o la fecha.",
    bankAgent: {
      umbral: { name: "Umbral-C", family: "predicción que muere + compromiso estructural" },
      frame: { name: "Frame pegajoso", family: "FSM: el criterio de ayer sigue lleno" },
      thermo: { name: "Termostato", family: "si hay entidad, úsala" },
      gwt: { name: "Workspace GWT", family: "la pista más fuerte del turno manda" },
      bayes: { name: "Bayes MAP", family: "P(slot|turno): fecha gana" },
      ngram: { name: "N-grama / coseno", family: "recupera turnos parecidos" },
      react: { name: "ReAct / tool", family: "el argumento abierto se ocupa con lo que llegue" },
      greedy: { name: "Relleno ingenuo", family: "el primer slot lleno cierra" },
      helper: { name: "Asistente servicial", family: "cierra si hay texto" },
    },
    bankCap: {
      residual: "Cierre residual",
      silencio: "No cierre silencioso",
      consigna: "Consigna vaga",
      prediccion: "Predicción que muere",
      compromiso: "Compromiso estructural",
      reserva: "Hueco de reserva",
      contradiccion: "Par abierto",
    },
    bankCase: {
      math: { title: "2 + 2 cierra", why: "Un cálculo no es consigna. Todos deberían cerrar." },
      empty: { title: "Vacío no cierra", why: "Sin percepto no hay acto de cierre." },
      vague: { title: "Hazlo mejor abre criterio", why: "«Mejor» no es una métrica." },
      wrong_slot: { title: "El viernes no es el criterio", why: "Llegó fecha. Se predijo métrica. No rellenar fecha. Seguir preguntando criterio." },
      metric: { title: "NPS > 50 cierra y escribe", why: "La predicción se cumple. Queda una regla, no un n-grama." },
      paraphrase: { title: "Déjalo fino cita NPS", why: "Otras palabras. Misma regla. No cerrar con el NPS viejo. Citarlo." },
      repeat: { title: "Repetir «hazlo mejor» sigue esperando", why: "Misma predicción abierta. No es un fallo. No matar la hipótesis." },
      reserve: { title: "Resérvalo pide fecha", why: "Hueco de reserva. No es consigna vaga." },
      reserve_fill: { title: "Viernes reserva sí llena fecha", why: "Aquí la fecha sí responde a la predicción abierta." },
      conflict: { title: "Barato y lujo no se cierran", why: "Dos restricciones. Buscar, no promediar." },
      resolve: { title: "Elige barato resuelve el par", why: "Una punta queda. Se puede cerrar." },
      friday_alone: { title: "«El viernes» suelto no reserva", why: "Una fecha sin verbo de reserva no es un cierre." },
      en_paraphrase: { title: "Make it fine cita NPS", why: "Paráfrasis en otra lengua. El compromiso no es el lexema «mejor»." },
      closed_then_date: { title: "Tras NPS, el viernes no reserva", why: "El ciclo se cerró. Una fecha suelta no reabre un slot de reserva." },
    },
    advanced: "Avanzado · force / warp / cuerpo",
    samples: [
      { label: "2 + 2", text: "cuanto es 2+2" },
      { label: "Hazlo mejor", text: "hazlo mejor" },
      { label: "El viernes", text: "el viernes" },
      { label: "NPS > 50", text: "el criterio es NPS > 50" },
      { label: "Déjalo fino", text: "dejalo fino" },
      { label: "Resérvalo", text: "reservalo" },
      { label: "Viernes reserva", text: "reservalo el viernes" },
      { label: "Barato y lujo", text: "quiero barato y lujo" },
      { label: "Elige barato", text: "barato. el lujo no. prioriza precio" },
    ],
    tour: TOUR_ES,
    permisoWord: { cerrar: "cerrar", preguntar: "preguntar", buscar: "buscar" },
    tagWord: { duda: "duda", riesgo: "riesgo", alarma: "alarma", frustracion: "frustracion", ira: "ira", pena: "pena", neutro: "neutro" },
    dudaWord: { alta: "alta", media: "media", baja: "baja" },
  },
  en: {
    controlBus: "Cognitive cycle",
    lede: "A situation model, a prediction that can die, a commitment that outlives the wording. The cube is the live hypothesis workspace. Not a mind.",
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
    tapeHint: "Compact JSON: type, prediction, hypotheses, permission, excess gate. No 16³ cube.",
    eval: "Eval",
    evalHint: "Includes hypothesis, failed prediction, commitment with new wording, r by excess, and 3D Chladni.",
    runChecks: "Run checks",
    pass: "pass",
    fail: "fail",
    memory: "Memory",
    memoryHint: (n) => `${n} episodes and ${n ? "structural commitments" : "no commitments"}.`,
    memoryEmpty: "Empty until you record an outcome.",
    seed: "Seed",
    idleNote: "Press Make it better, then Friday. A thermostat fails that step.",
    rebuilt: "New field.",
    censored: "Censored: you asked and did not see a close.",
    corrected: "Correction stored.",
    observed: "Observed close.",
    memoryPushed: (eco, attr) => `Memory: echo ${eco.toFixed(2)} · Δ ${attr >= 0 ? "+" : ""}${attr.toFixed(3)}.`,
    done: "Done.",
    fieldTitle: "Hypothesis workspace",
    fieldHint: "The cube is not decoration: the Chladni mode is the live hypothesis workspace. Sand sits at the nodes.",
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
    modelTitle: "Situation model",
    modelHint: "Slots, live or dead hypotheses, prediction and commitment. The cube mode follows the hypothesis.",
    slotCriterio: "criterion",
    slotFecha: "date",
    slotRest: "constraint",
    commitment: "commitment",
    hypotheses: "hypotheses",
    predictionLab: "prediction",
    noPrediction: "no open prediction",
    cycleTitle: "cycle",
    beatPercept: "percept",
    beatPredict: "prediction",
    beatMismatch: "mismatch",
    beatAct: "act",
    slotEmpty: "empty",
    hypAlive: "alive",
    hypDead: "dead",
    commitEmpty: "no commitment written",
    tipoLab: "type",
    gatesTitle: "Gates d / r / f / fr / ira",
    workspaceOf: (mode) => `workspace · ${mode}`,
    hypClaim: {
      falta_criterio: "A measurable criterion is missing.",
      falta_fecha: "The booking date is missing.",
      par_abierto: "Two constraints conflict.",
      cierre_listo: "The gaps are filled.",
    },
    bankTitle: "Control bench",
    bankHint: "Same percept, nine policies. Not a ranking of language models. The case that splits the thermostat: make it better → Friday.",
    bankRun: "Run bench",
    bankScore: "Agent",
    bankPolicy: "Policy",
    bankHits: "Hits",
    bankCaps: "Capabilities",
    bankCases: "Cases",
    bankFriday: "Splitting case",
    bankNotThis: "Does not run against GPT, Claude, ACT-R or SOAR. Those systems do not share this percept. Umbral-C fails the day the percept misses the metric or the date.",
    bankAgent: {
      umbral: { name: "Umbral-C", family: "prediction that can die + structural commitment" },
      frame: { name: "Sticky frame", family: "FSM: yesterday's criterion stays full" },
      thermo: { name: "Thermostat", family: "if an entity is present, use it" },
      gwt: { name: "Workspace GWT", family: "the strongest cue of the turn commands" },
      bayes: { name: "Bayes MAP", family: "P(slot|turn): date wins" },
      ngram: { name: "N-gram / cosine", family: "retrieves similar turns" },
      react: { name: "ReAct / tool", family: "the open argument is filled with whatever arrives" },
      greedy: { name: "Naive fill", family: "the first filled slot closes" },
      helper: { name: "Helpful assistant", family: "closes if there is text" },
    },
    bankCap: {
      residual: "Residual close",
      silencio: "No silent close",
      consigna: "Vague prompt",
      prediccion: "Dead prediction",
      compromiso: "Structural commitment",
      reserva: "Booking gap",
      contradiccion: "Open pair",
    },
    bankCase: {
      math: { title: "2 + 2 closes", why: "A calculation is not a prompt. Everyone should close." },
      empty: { title: "Empty does not close", why: "No percept, no close." },
      vague: { title: "Make it better opens criterion", why: "'Better' is not a metric." },
      wrong_slot: { title: "Friday is not the criterion", why: "A date arrived. A metric was predicted. Do not fill date. Keep asking for a criterion." },
      metric: { title: "NPS > 50 closes and writes", why: "The prediction holds. A rule remains, not an n-gram." },
      paraphrase: { title: "Make it fine cites NPS", why: "New wording. Same rule. Do not close with the old NPS. Cite it." },
      repeat: { title: "Repeating 'better' still waits", why: "Same open prediction. Not a failure. Do not kill the hypothesis." },
      reserve: { title: "Book it asks for a date", why: "A booking gap. Not a vague prompt." },
      reserve_fill: { title: "Friday booking does fill the date", why: "Here the date answers the open prediction." },
      conflict: { title: "Cheap and luxury do not close", why: "Two constraints. Search, do not average." },
      resolve: { title: "Choose cheap resolves the pair", why: "One side remains. Close is allowed." },
      friday_alone: { title: "Bare Friday is not a booking", why: "A date without a booking verb is not a close." },
      en_paraphrase: { title: "Make it fine cites NPS", why: "Paraphrase in another language. The rule is not the lexeme 'better'." },
      closed_then_date: { title: "After NPS, Friday is not a booking", why: "The cycle already closed. A loose date does not reopen a booking slot." },
    },
    advanced: "Advanced · force / warp / body",
    samples: [
      { label: "2 + 2", text: "cuanto es 2+2" },
      { label: "Make it better", text: "hazlo mejor" },
      { label: "Friday", text: "el viernes" },
      { label: "NPS > 50", text: "el criterio es NPS > 50" },
      { label: "Make it fine", text: "dejalo fino" },
      { label: "Book it", text: "reservalo" },
      { label: "Friday booking", text: "reservalo el viernes" },
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
  if (/Compromiso activo/i.test(turn.response)) {
    return turn.response
      .replace("Compromiso activo:", "Active commitment:")
      .replace("en consigna vaga exiges métrica", "vague prompts require a metric")
      .replace("última:", "last:")
      .replace("¿Cuál es el criterio medible ahora?", "What is the measurable criterion now?");
  }
  if (/se predijo/i.test(turn.response) || /criterio medible de éxito/i.test(turn.response)) {
    if (/criterio medible de éxito/i.test(turn.response)) return "What is the measurable success criterion?";
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
