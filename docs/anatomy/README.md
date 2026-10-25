# ML pipeline bench: the interactive figure

An isometric, interactive drawing of this repo's pipeline, built with the [Anatomy](https://github.com/wheresryan22/anatomy) Agent Skill by Ryan (MIT). Back row: the four pipeline steps. Front row: the `deploy` command and the scoring endpoint.

| File | What it is |
|---|---|
| `ml-pipeline-bench-light.html` | The figure, light theme. Standalone: open it in a browser. |
| `ml-pipeline-bench.html` | The same figure, dark theme. |
| `ml-pipeline-bench.gif` | A recording of one full cycle, used in the main README. |
| `ml-pipeline-bench.png` | A still of the finished state. |
| `rig.mjs` | The model: the repo's settings and the timeline. |
| `parts.mjs` | The geometry of every part, shared by the build and the live page. |
| `build.mjs` | Writes the HTML pages. |
| `kit/`, `scripts/` | The Anatomy drawing kit and its capture and line-check scripts, copied unchanged. `LICENSE-anatomy` is its licence. |

## Use it

Hover to scrub through the cycle, click or press Space or Enter to replay, arrow keys to step, Home and End to jump. The figure tours by itself when left alone and shows one still frame under reduced motion.

```bash
node build.mjs --light   # writes ml-pipeline-bench-light.html  (Node 20.10 or later, nothing to install)
node build.mjs           # writes ml-pipeline-bench.html
node scripts/lines.mjs ml-pipeline-bench-light.html --reduced   # every drawn line must end on something (needs Chrome; set CHROME_PATH)
```

## What is real and what is drawn

Real, from the code: the four steps, the stratified 80/20 split, a Random Forest of 100 trees with maximum depth 10, the register step that only checks the two files exist, the `deploy` command that registers the local `trained_model/` folder, one `Standard_DS2_v2` instance, `init()` once and `run()` per request.

Drawn for the picture: the position of the evaluation dial (it shows no metric) and the contents of the slips.
