// The model behind the figure. Pure functions: the geometry, the motion and the readout all read from here.
// Real, from the code: four pipeline steps (prep, train, evaluate, register-check), an 80/20 stratified split,
// a Random Forest of 100 trees with max depth 10, a managed online endpoint with one Standard_DS2_v2 instance,
// score.py with init() once and run() per request. Illustrative: the needle position on the evaluation dial
// (no real metric is shown) and the look of the data cards.

export const CYCLE = 30;
export const TREES = 100;
export const DEPTH = 10;
export const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const seg = (u, a, b) => clamp((u - a) / (b - a));
export const ease = (t) => t * t * (3 - 2 * t);
export const wave = (u, a, b) => Math.sin(Math.PI * seg(u, a, b));

export const T = {
  raw: [0.02, 0.12], // raw CSV card arrives at the splitter
  split: [0.12, 0.2], // 80/20 split
  trainMove: [0.2, 0.3], // train card to the trainer
  press: [0.3, 0.38], // training stroke
  model: [0.38, 0.5], // three files leave the trainer
  evalMove: [0.5, 0.58], // test card and model reach the evaluator
  needle: [0.58, 0.66],
  verify: [0.66, 0.72], // register step checks the two files exist
  handoff: [0.74, 0.8], // deploy: trained_model/ folder goes into the registry
  load: [0.8, 0.86], // endpoint loads it once: init()
  request: [0.86, 0.93], // a request card enters, run() answers
  fade: [0.985, 1.0],
};

const X = { start: -194, split: -150, trainer: -82, evalr: -12, end: 48 };

export function pose(u) {
  const fade = 1 - seg(u, T.fade[0], T.fade[1]);
  const p = { u, fade };

  // raw card -> splitter, then two cards
  const rawX = X.start + (X.split - X.start) * ease(seg(u, ...T.raw));
  const sp = ease(seg(u, ...T.split));
  p.raw = { shown: u >= T.raw[0] && u < T.split[1], x: rawX, split: sp };
  const trainX = X.split + (X.trainer - X.split) * ease(seg(u, ...T.trainMove));
  p.train = { shown: u >= T.split[0] + 0.03, x: u < T.trainMove[0] ? X.split : trainX, done: u > T.press[1] };
  // test card slides to its side tray, waits, then rides to the evaluator
  const toTray = ease(seg(u, T.split[0] + 0.02, T.split[1]));
  const toEval = ease(seg(u, ...T.evalMove));
  p.test = { shown: u >= T.split[0] + 0.03, x: X.split + (X.evalr - X.split) * toEval, y: -44 + 29 * toTray * (1 - toEval) };
  p.press = wave(u, ...T.press);
  p.model = { shown: u >= T.model[0], x: X.trainer + 8 + (X.evalr + 4 - X.trainer - 8) * ease(seg(u, ...T.model)), out: ease(seg(u, T.model[0], T.model[0] + 0.04)) };
  p.needle = 0.5 * ease(seg(u, ...T.needle)); // illustrative position, not a result
  p.lampA = seg(u, T.verify[0], T.verify[0] + 0.03);
  p.lampB = seg(u, T.verify[0] + 0.03, T.verify[1]);

  // phase 2
  p.folder = { shown: u >= T.handoff[0] - 0.04 && u < T.request[0] - 0.01, x: -120 + 38 * ease(seg(u, ...T.handoff)) + 144 * ease(seg(u, ...T.load)), sink: ease(seg(u, T.load[1] - 0.03, T.load[1])) };
  p.load = ease(seg(u, ...T.load));
  p.loaded = u >= T.load[1];
  p.req = { shown: u >= T.request[0] && u < T.request[0] + 0.05, x: 200 - 36 * ease(seg(u, T.request[0], T.request[0] + 0.04)) };
  p.resp = { shown: u >= T.request[0] + 0.05, y: 64 + 12 * ease(seg(u, T.request[0] + 0.05, T.request[1])), op: seg(u, T.request[0] + 0.05, T.request[0] + 0.065) };
  return p;
}

export function describe(u) {
  if (u < T.raw[1]) return "raw CSV enters the pipeline";
  if (u < T.trainMove[0]) return "step 1: clean, then split 80% train / 20% test";
  if (u < T.model[0]) return `step 2: train a Random Forest (${TREES} trees, depth ${DEPTH})`;
  if (u < T.verify[0]) return "step 3: score the model on the held-out 20%";
  if (u < T.handoff[0]) return "step 4: check that model.pkl and scaler.pkl exist";
  if (u < T.load[0]) return "deploy: register trained_model/ in the model registry";
  if (u < T.request[0]) return "the endpoint starts and loads the model once: init()";
  if (u < T.fade[0]) return "a JSON request arrives: run() returns predictions and probabilities";
  return "ready for the next run";
}
