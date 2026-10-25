// Geometry for the ML pipeline bench. Every function takes the projection P and returns SVG text.
// The same file is used by build.mjs (first frame) and inlined into the page (live frames).
import * as k from "./kit/iso-kit.mjs";

export const W = {
  PLATE: { x: -214, y: -88, w: 428, d: 176, r: 9 },
  PLATE_H: 12,
  FOOT_H: 5,
  Y1: -44, // phase 1 belt
  Y2: 44, // phase 2 belt
  B1: { x0: -204, x1: 66, w: 20 },
  B2: { x0: -128, x1: 210, w: 20 },
  CARD: { w: 24, d: 15 },
  EVAL: [-12, -44],
  GAUGE: { cx: -12, cy: -72, R: 16, z: 15, h: 7, label: "metrics" },
  A0: -0.75 * Math.PI,
  SPAN: 1.5 * Math.PI,
  TRAY: { x: -166, y: -26, w: 30, d: 22, r: 2 },
  VER: { x: 22, y: -84, w: 44, d: 18, r: 2 },
  FOLDER: { x: -142, y: 30, w: 34, d: 28, r: 2 },
  CAB: { x: -100, y: 26, w: 36, d: 40, r: 3 },
  CAB_H: 24,
  END: { x: 100, y: 22, w: 50, d: 44, r: 3 },
  END_H: 26,
  OUT: { x: 104, y: 66, w: 42, d: 18, r: 2 },
};

const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const at = (P, p) => k.iso(p, P);
const opaque = (svg, op) => (op >= 0.999 ? svg : `<g opacity="${Math.max(0, op).toFixed(3)}">${svg}</g>`);

export function plate(P) {
  const { PLATE, PLATE_H, FOOT_H } = W;
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  const feet = [...k.corners(PLATE, 22), [0, PLATE.y + 22], [0, PLATE.y + PLATE.d - 22]];
  for (const [x, y] of [...feet].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P))) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const corner = k.corners(PLATE, 10);
  out.push(L(corner.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(corner.map(([x, y]) => at(P, [x, y, 0])), { size: 0.5 }));
  return out.join("");
}

export function belt(P, y, b) {
  const out = [];
  const plan = { x: b.x0, y: y - b.w / 2, w: b.x1 - b.x0, d: b.w, r: 2 };
  out.push(S(k.slabOf(plan, 0, 1.6, P, 4, 0.4), { tone: "mid" }));
  out.push(L(k.lineOnTop([b.x0, y - 6.5], [b.x1, y - 6.5], 1.6, P), { tone: "faint" }));
  out.push(L(k.lineOnTop([b.x0, y + 6.5], [b.x1, y + 6.5], 1.6, P), { tone: "faint" }));
  out.push(L(k.topTicks(b.x0 + 4, b.x1 - 4, 6, 4, y - 9.2, 1.6, [1.2, 2.2], P).minor, { tone: "lo" }));
  out.push(D([at(P, [b.x0 + 2.6, y, 1.6]), at(P, [b.x1 - 2.6, y, 1.6])], { size: 0.45 }));
  return out.join("");
}
export const belts = (P) => belt(P, W.Y1, W.B1) + belt(P, W.Y2, W.B2);

function pad(P, plan, h = 0.8) {
  const out = [S(k.slabOf(plan, 0, h, P, 4, 0.3), { tone: "lo", crease: "none" })];
  out.push(L(k.planOutline(k.insetPlan(plan, 2), h, P, 4), { tone: "faint" }));
  return out.join("");
}
export const tray = (P) => pad(P, W.TRAY);
export const folderPad = (P) => pad(P, W.FOLDER);
export const evalPad = (P) => pad(P, { x: W.EVAL[0] - 20, y: W.EVAL[1] - 14, w: 40, d: 28, r: 2 }, 1.2);

// a gantry arch over a belt; with a head if `head` is set
export function arch(P, x, y, label) {
  const out = [];
  for (const sy of [-17, 17]) out.push(S(k.slabOf({ x: x - 6, y: y + sy - 3, w: 12, d: 6, r: 1.2 }, 0, 24, P, 3, 0.5), { tone: "mid" }));
  out.push(S(k.slabOf({ x: x - 7, y: y - 20, w: 14, d: 40, r: 1.8 }, 24, 7, P, 4, 0.5), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan({ x: x - 7, y: y - 20, w: 14, d: 40, r: 1.8 }, 2), 31, P, 4), { tone: "faint" }));
  if (label) out.push(k.faceTextSvg(k.topMatrix([x - 2.6, y + 15], 31, P, "y"), label, { size: 3, tone: "mid" }));
  return out.join("");
}
export const archBack = (P, x, y) => S(k.slabOf({ x: x - 6, y: y - 20, w: 12, d: 6, r: 1.2 }, 0, 24, P, 3, 0.5), { tone: "mid" });
export const archFront = (P, x, y, label) => {
  const out = [S(k.slabOf({ x: x - 6, y: y + 14, w: 12, d: 6, r: 1.2 }, 0, 24, P, 3, 0.5), { tone: "mid" })];
  return out.join("");
};
export function archTop(P, x, y, label) {
  const plan = { x: x - 7, y: y - 20, w: 14, d: 40, r: 1.8 };
  const out = [S(k.slabOf(plan, 24, 7, P, 4, 0.5), { tone: "mid" })];
  out.push(L(k.planOutline(k.insetPlan(plan, 2), 31, P, 4), { tone: "faint" }));
  if (label) out.push(k.faceTextSvg(k.topMatrix([x + 1.6, y + 14], 31, P, "y"), label, { size: 3, tone: "mid" }));
  return out.join("");
}

export function head(P, x, y) {
  const out = [];
  out.push(S(k.cylinder(x, y, 2.2, 12, 12, P, 20), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(x, y, 6.5, 6, 6, P, 28, 0.5), { tone: "hi", lit: true }));
  out.push(L(k.knurl(x, y, 6.5, 6, 12, 20, P), { tone: "lo" }));
  return out.join("");
}

// slips: raw (wide, full), train (80%), test (20%), model files (three narrow slabs)
export function slip(P, x, y, w, bars, op = 1, lit = true, z = 1.6) {
  if (op <= 0.003) return "";
  const d = W.CARD.d;
  const plan = { x: x - w / 2, y: y - d / 2, w, d, r: 1.2 };
  const out = [S(k.slabOf(plan, z, 1.2, P, 4, 0.3), { tone: "hi", lit, crease: "lo" })];
  bars.forEach((f, i) => out.push(L(k.lineOnTop([x - w / 2 + 2.4, y - d / 2 + 3.6 + i * 3.8], [x - w / 2 + 2.4 + (w - 5) * f, y - d / 2 + 3.6 + i * 3.8], z + 1.2, P), { tone: "lo", free: true })));
  return opaque(out.join(""), op);
}
export function files(P, x, y, out1 = 1, op = 1) {
  const out = [];
  [-7, 0, 7].forEach((dy, i) => {
    const plan = { x: x - 8, y: y + dy * out1 - 2.8, w: 16, d: 5.6, r: 1 };
    out.push(S(k.slabOf(plan, 1.6, 2, P, 3, 0.3), { tone: "hi", lit: true, crease: "lo" }));
  });
  return opaque(out.join(""), op);
}

export function gauge(P) {
  const g = W.GAUGE;
  const { cx: x, cy: y, R, z: Z, h: H } = g;
  const { A0, SPAN } = W;
  const top = Z + H;
  const out = [];
  const foot = { x: x - 13, y: y - 13, w: 26, d: 26, r: 3 };
  out.push(S(k.slabOf(foot, 0, 4, P, 5, 0.6), { tone: "mid" }));
  out.push(D(k.corners(foot, 3).map(([a, b]) => at(P, [a, b, 4])), { size: 0.4 }));
  out.push(S(k.cylinder(x, y, 3.6, 4, Z - 4, P, 24), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(x, y, R, Z, H, P, 48, 0.7), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(x, y, R, top - 3, top, 60, P, 0.3), { tone: "lo" }));
  out.push(L(k.ring(x, y, R - 2, top, P, 48), { tone: "lo" }));
  const ticks = k.radialTicks(x, y, R - 2.6, 40, 5, top, [1.2, 2.5], P, A0, SPAN);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(L(k.ring(x, y, 1.5, top, P, 16), { tone: "mid" }));
  out.push(k.faceTextSvg(k.topMatrix([x, y + 8.4], top, P, "x"), g.label, { size: 2.6, tone: "mid", anchor: "middle" }));
  return out.join("");
}
export function needleD(P, v) {
  const { cx: x, cy: y, R, z: Z, h: H } = W.GAUGE;
  const a = W.A0 + W.SPAN * v;
  return k.lineOnTop([x - Math.sin(a) * 3, y + Math.cos(a) * 3], [x + Math.sin(a) * (R - 4), y - Math.cos(a) * (R - 4)], Z + H + 0.2, P);
}

// the register step's two checks
export function verifier(P, a, b) {
  const { VER } = W;
  const out = [S(k.slabOf(VER, 0, 8, P, 4, 0.6), { tone: "mid" })];
  out.push(L(k.planOutline(k.insetPlan(VER, 2.2), 8, P, 4), { tone: "faint" }));
  [[VER.x + 12, a], [VER.x + 32, b]].forEach(([x, on]) => {
    const y = VER.y + VER.d / 2;
    out.push(S(k.cylinder(x, y, 3.6, 8, 2.4 + 3 * on, P, 20), { tone: on > 0.5 ? "hi" : "mid", lit: on > 0.5 }));
    out.push(L(k.ring(x, y, 5.4, 8, P, 20), { tone: "faint" }));
  });
  out.push(D(k.corners(VER, 2.4).map(([x, y]) => at(P, [x, y, 8])), { size: 0.4 }));
  return out.join("");
}

export function cabinet(P) {
  const { CAB, CAB_H } = W;
  const out = [`<path class="iso-halo" d="${k.haloOf(CAB, 0, CAB_H, P)}" style="filter:blur(4px)"/>`];
  const h = CAB_H / 3;
  for (let i = 0; i < 3; i++) {
    out.push(S(k.slabOf(CAB, h * i, h, P, 5, 0.6), { tone: "mid" }));
    out.push(D([at(P, [CAB.x + CAB.w / 2, CAB.y + CAB.d, h * i + h / 2])], { size: 0.8, tone: "hi" }));
  }
  out.push(L(k.planOutline(k.insetPlan(CAB, 2.4), CAB_H, P, 4), { tone: "faint" }));
  out.push(k.faceTextSvg(k.topMatrix([CAB.x + 3.4, CAB.y + CAB.d - 4], CAB_H, P, "x"), "registry", { size: 3.6, tone: "mid" }));
  out.push(D(k.corners(CAB, 2.6).map(([x, y]) => at(P, [x, y, CAB_H])), { size: 0.4 }));
  return out.join("");
}

export function endpoint(P, loaded) {
  const { END, END_H } = W;
  const out = [`<path class="iso-halo" d="${k.haloOf(END, 0, END_H, P)}" style="filter:blur(4px)"/>`];
  out.push(S(k.slabOf(END, 0, END_H, P, 5, 0.7), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(END, 3), END_H, P, 4), { tone: "faint" }));
  out.push(k.faceTextSvg(k.topMatrix([END.x + 5, END.y + 12], END_H, P, "x"), "score.py", { size: 4.4, tone: "mid" }));
  const lx = END.x + END.w - 9, ly = END.y + END.d - 9;
  out.push(S(k.cylinder(lx, ly, 3.6, END_H, 2.6, P, 20), { tone: loaded ? "hi" : "mid", lit: !!loaded }));
  out.push(L(k.ring(lx, ly, 5.6, END_H, P, 20), { tone: "faint" }));
  out.push(D(k.corners(END, 3).map(([x, y]) => at(P, [x, y, END_H])), { size: 0.4 }));
  return out.join("");
}
export const outTray = (P) => pad(P, W.OUT);
