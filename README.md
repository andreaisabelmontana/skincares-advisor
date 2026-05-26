# SkinCares — Ingredient Advisor

A portfolio-quality skincare ingredient analyzer and skin-type quiz.

> **Live:** https://andreaisabelmontana.github.io/skincares-advisor/

## What it does

- **Analyzer.** Paste an INCI list. The page recognises ~40 of the most common active and functional ingredients (with their aliases — `HA`, `BHA`, `vitamin B3`, etc.), color-codes each by category, shows its purpose in one line, and flags cautions.
- **Quiz.** Five short questions → a recommended ingredient palette built from the same reference data the analyzer uses.
- **Glossary.** The twelve categories explained, with consistent color-coding across the page.

## Tech

Plain HTML + CSS + JS. No frameworks, no build step. The ingredient database (`src/ingredients.js`) is a 40-entry hand-curated reference and the analyzer is a normalised-string lookup with a loose contains-fallback so labels like "Salicylic Acid 2%" still match.

```
skincares-advisor/
├── index.html
├── style.css
├── favicon.svg
├── src/
│   ├── ingredients.js     reference database + analyzer
│   └── app.js             analyzer UI + quiz flow + glossary
└── .github/workflows/deploy.yml
```

## Credits

Inspired by **Geethika**'s
[`Geethika2506/SkinCares`](https://github.com/Geethika2506/SkinCares) project. This site is an
independent portfolio piece by Andrea Montana (IE BCSAI, Fall 2025) — code, design, and
content all written from scratch.

The ingredient descriptions are general dermatology / cosmetic-chemistry common knowledge,
rewritten in our own voice. Nothing here is medical advice; always patch-test new products.
