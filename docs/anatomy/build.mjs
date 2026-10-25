// Builds the interactive ML pipeline bench: node build.mjs [--light]
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "./kit/iso-kit.mjs";
import { kitScript } from "./scripts/inline-kit.mjs";
import * as rig from "./rig.mjs";
import * as g from "./parts.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const WIDTH = 860;
const HEIGHT = 400;
const { W } = g;
const REST = 0.975;

const P = k.fitProjection(
  [...k.boxCorners(W.PLATE, -17, 0), [-82, -44, 42], [150, 70, 30], [-12, -72, 30]],
  WIDTH,
  HEIGHT,
  { pad: 20, azimuth: 62 },
);

const XS = { split: -150, trainer: -82 };

function slips(p) {
  const f = p.fade;
  const raw = p.raw.shown ? g.slip(P, p.raw.x, W.Y1, 24, [0.9, 0.7, 0.8, 0.6], f * (1 - p.raw.split)) : "";
  const train = p.train.shown ? g.slip(P, p.train.x, W.Y1, 24 * 0.8 + 0, [0.9, 0.7, 0.8], f * (p.train.done ? 0 : 1) * p.raw.split) : "";
  const test = p.test.shown ? g.slip(P, p.test.x, p.test.y, 24 * 0.4 + 2, [0.9, 0.6], f * p.raw.split) : "";
  const model = p.model.shown ? g.files(P, p.model.x, W.Y1, p.model.out, f) : "";
  return { raw, train, test, model };
}
const folder = (p) => (p.folder.shown ? g.files(P, p.folder.x, W.Y2, 1, p.fade * (1 - p.folder.sink)) : "");
const request = (p) => (p.req.shown ? g.slip(P, p.req.x, W.Y2, 24, [0.5, 0.5, 0.5], p.fade) : "");
const response = (p) => (p.resp.shown ? g.slip(P, 125, p.resp.y, 24, [0.9, 0.4], p.resp.op * p.fade, true, 0.8) : "");

function scene(u) {
  const p = rig.pose(u);
  const s = slips(p);
  const lift = `transform="${k.translateAlong(P, [0, 0, -4 * p.press])}"`;
  return [
    g.plate(P),
    g.belts(P),
    g.tray(P),
    g.folderPad(P),
    g.evalPad(P),
    `<g data-part="verifier">${g.verifier(P, p.lampA, p.lampB)}</g>`,
    g.archBack(P, XS.split, W.Y1),
    g.archBack(P, XS.trainer, W.Y1),
    `<g data-part="raw">${s.raw}</g>`,
    `<g data-part="train">${s.train}</g>`,
    `<g data-part="test">${s.test}</g>`,
    `<g data-part="model">${s.model}</g>`,
    `<g data-part="head" ${lift}>${g.head(P, XS.trainer, W.Y1)}</g>`,
    g.archTop(P, XS.split, W.Y1, "split"),
    g.archTop(P, XS.trainer, W.Y1, "train"),
    g.archFront(P, XS.split, W.Y1),
    g.archFront(P, XS.trainer, W.Y1),
    g.gauge(P),
    `<path data-part="needle" class="iso-line" data-tone="lit" data-free="start" d="${g.needleD(P, p.needle)}" style="stroke-width:1"/>`,
    `<g data-part="folder">${folder(p)}</g>`,
    g.cabinet(P),
    `<g data-part="endpoint">${g.endpoint(P, p.loaded)}</g>`,
    g.outTray(P),
    `<g data-part="request">${request(p)}</g>`,
    `<g data-part="response">${response(p)}</g>`,
  ];
}

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "A bench that works like the Azure ML pipeline in this repo. Back row, left to right: a raw CSV slip is split 80/20 at a first arch, a second arch trains a Random Forest and releases three model files, an evaluator dial scores the model on the held-out slip, and a verifier block lights two lamps for model.pkl and scaler.pkl. Front row: the trained_model folder is registered in a registry cabinet, the endpoint box loads it once, and a request slip goes in while a response slip with predictions comes out.",
  body: scene(REST),
});

const strip = (file) => readFileSync(join(HERE, file), "utf8").replace(/^export /gm, "").replace(/^import .*$/gm, "");
const kitNames = Object.keys(k).join(", ");

const live = `
const P = ${JSON.stringify(P)};
const REST = ${REST};
const XS = ${JSON.stringify(XS)};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const part = (name) => svg.querySelector('[data-part="' + name + '"]');
const E = Object.fromEntries(["verifier", "raw", "train", "test", "model", "head", "needle", "folder", "endpoint", "request", "response"].map((n) => [n, part(n)]));
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const cache = {};
const put = (key, node, html) => { if (cache[key] !== html) { cache[key] = html; node.innerHTML = html; } };
const q4 = (v) => Math.round(v * 4) / 4;
const q20 = (v) => Math.round(v * 20) / 20;
let u = still.matches ? REST : 0, target = u, touring = !still.matches, frame = 0, last = 0, visible = false, idleTimer = 0;

function render() {
  const p = pose(u);
  const f = q20(p.fade);
  put("verifier", E.verifier, verifier(P, q20(p.lampA), q20(p.lampB)));
  put("raw", E.raw, p.raw.shown ? slip(P, q4(p.raw.x), W.Y1, 24, [0.9, 0.7, 0.8, 0.6], f * (1 - q20(p.raw.split))) : "");
  put("train", E.train, p.train.shown ? slip(P, q4(p.train.x), W.Y1, 19.2, [0.9, 0.7, 0.8], f * (p.train.done ? 0 : 1) * q20(p.raw.split)) : "");
  put("test", E.test, p.test.shown ? slip(P, q4(p.test.x), q4(p.test.y), 11.6, [0.9, 0.6], f * q20(p.raw.split)) : "");
  put("model", E.model, p.model.shown ? files(P, q4(p.model.x), W.Y1, q20(p.model.out), f) : "");
  E.head.setAttribute("transform", translateAlong(P, [0, 0, -4 * p.press]));
  E.needle.setAttribute("d", needleD(P, p.needle));
  put("folder", E.folder, p.folder.shown ? files(P, q4(p.folder.x), W.Y2, 1, f * (1 - q20(p.folder.sink))) : "");
  put("endpoint", E.endpoint, endpoint(P, p.loaded));
  put("request", E.request, p.req.shown ? slip(P, q4(p.req.x), W.Y2, 24, [0.5, 0.5, 0.5], f) : "");
  put("response", E.response, p.resp.shown ? slip(P, 125, q4(p.resp.y), 24, [0.9, 0.4], q20(p.resp.op) * f, true, 0.8) : "");
  const text = describe(u);
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuenow", String(Math.round(u * 100)));
  stage.setAttribute("aria-valuetext", text);
}

function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  if (touring) { u += dt / CYCLE; if (u >= 1) u -= 1; target = u; }
  else { u = still.matches ? target : u + (target - u) * (1 - Math.exp(-dt / 0.12)); if (Math.abs(target - u) < 0.0004) u = target; }
  render();
  frame = visible && (touring || u !== target) ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
const hold = () => { touring = false; clearTimeout(idleTimer); idleTimer = setTimeout(() => { touring = !still.matches; run(); }, 3600); run(); };
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
stage.addEventListener("pointermove", (event) => { const box = svg.getBoundingClientRect(); target = clamp(((event.clientX - box.left) / box.width - 0.06) / 0.88, 0, 0.995); hold(); });
stage.addEventListener("pointerleave", () => { clearTimeout(idleTimer); idleTimer = setTimeout(() => { touring = !still.matches; run(); }, 1200); });
stage.addEventListener("click", () => { u = target = 0; touring = !still.matches; if (still.matches) u = target = REST; clearTimeout(idleTimer); render(); run(); });
stage.addEventListener("keydown", (event) => {
  const key = event.key;
  if (key === "ArrowRight" || key === "ArrowUp") target = clamp(target + 0.03, 0, 0.995);
  else if (key === "ArrowLeft" || key === "ArrowDown") target = clamp(target - 0.03, 0, 0.995);
  else if (key === "Home") target = 0;
  else if (key === "End") target = REST;
  else if (key === " " || key === "Enter") { event.preventDefault(); u = target = 0; touring = !still.matches; render(); run(); return; }
  else return;
  event.preventDefault();
  hold();
});
window.__set = (uu) => { u = target = uu; touring = false; render(); };
render();
`;

const phone = `<style>@media (max-width:560px){.iso-plate-corner[data-corner="hint"]{display:none}.iso-plate-corner[data-corner="readout"]{left:0;right:0;white-space:normal;text-align:right;font-size:9.5px;line-height:1.35}}</style>`;
const body = phone + k.plateHtml({
  fig: "Fig 1",
  title: "ML pipeline bench",
  hint: "Hover to scrub · click to replay",
  readout: rig.describe(REST),
  keys: [
    { mark: "lit", label: "Slips and model files in motion, lamps, the dial needle" },
    { mark: "raised", label: "Back row: the four pipeline steps. Front row: register, deploy, score" },
  ],
  caption:
    "Back row, the pipeline run in Azure ML: a CSV is cleaned and split 80/20, a Random Forest (100 trees, depth 10) is trained, scored on the held-out 20%, and the register step checks that model.pkl and scaler.pkl exist. Front row, the deploy command: the local trained_model folder is registered, a managed endpoint loads it once with init(), and run() answers each JSON request. The dial position and the slip contents are illustrative; no real metric is shown.",
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="ML pipeline bench: hover to scrub, click to replay, arrow keys step" aria-valuemin="0" aria-valuemax="100" aria-valuenow="97">${svg}</div>`,
});

const script = kitScript() + `\nconst k = { ${kitNames} };\n` + strip("rig.mjs") + "\n" + strip("parts.mjs") + "\n" + live;
const file = theme === "light" ? "ml-pipeline-bench-light.html" : "ml-pipeline-bench.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "ML pipeline bench", theme, body, script, width: 900 }));
console.log("wrote", file);
