# Illustration sources

The three images one level up are drawn by `mlpipe.py` with the small kit in `xh.py` (wobbly black lines, a black creature with white dot eyes, orange for the path, red for the key point, blue for side notes). They are hand-authored vector drawings, not AI-generated art.

```bash
python3 mlpipe.py                                       # writes 07-clean-split.svg, 08-train-score.svg, 09-deploy-answer.svg
node render.js 07-clean-split 08-train-score 09-deploy-answer   # needs playwright with Chromium; writes the PNGs
```

The lettering font is Caveat (SIL Open Font License 1.1), embedded in each SVG from `caveat-latin-600-normal.woff2`.

The drawings show no measured data. The only numbers (80/20, 100 trees, depth 10) are the settings in `src/run_pipeline.py` and `components/`.
