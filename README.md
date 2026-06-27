# SkinCares — Ingredient Advisor

Type your skincare ingredient list, get an annotated, skin-type-aware breakdown.

> **Live:** https://andreaisabelmontana.github.io/skincares-advisor/
> **Educational only — not medical advice.** Always patch-test new products.

A real Python INCI analyzer with a committed knowledge base, plus a
self-contained in-browser version that loads the **same** data file.

## What it does

Paste a back-of-bottle INCI list. The engine parses it, resolves canonical
names and synonyms, annotates each recognised ingredient, and aggregates a
report: function breakdown, comedogenic load, fragrance/allergen presence, and
**skin-type-aware** warnings (acne-prone, sensitive, dry, oily, pregnancy, or
plain normal). Unknown ingredients are reported, never silently dropped.

## Knowledge base — `data/ingredients.json`

A hand-curated reference of **143 skincare ingredients**. Each entry has:

| field | meaning |
|---|---|
| `inci` | canonical INCI name |
| `synonyms` | aliases the parser also matches (`aqua`, `bha`, `vitamin e`, …) |
| `functions` | one or more of: humectant, emollient, occlusive, exfoliant, antioxidant, surfactant, preservative, uv_filter, fragrance, soothing, barrier_repair, brightening, anti_aging, antimicrobial, solvent, ph_adjuster, chelator, thickener, emulsifier |
| `comedogenic` | pore-clogging rating 0–5 (approximate, context-dependent) |
| `irritant` | known irritant / sensitiser flag |
| `allergen` | common-allergen flag (incl. EU-26-style declarable fragrance allergens) |
| `pregnancy_caution` | active commonly avoided in pregnancy (e.g. retinoids) |
| `note` | one-line plain-language description |

**Scope & disclaimer.** Compiled from general cosmetic-science and dermatology
common knowledge. Comedogenic ratings are approximate and vary with
concentration, formulation, and individual skin. This is an educational tool,
**not medical advice** — consult a professional for medical concerns.

## The engine — `skincare/`

- **`parser.py`** — `parse_inci(raw, kb)` splits a free-form list on commas,
  semicolons, slashes, bullets and newlines; `normalize()` lower-cases, strips
  trailing concentrations (`"Salicylic Acid 2%"`) and parentheticals
  (`"Aqua (Water)"`), and collapses whitespace. Resolution tries an exact
  normalised match against an INCI+synonym index, then a conservative
  whole-phrase containment fallback. Unresolved tokens are kept and marked
  unknown.
- **`analyzer.py`** — `analyze(raw, skin_type, kb)` annotates each recognised
  ingredient and returns a `Report` with the function breakdown, comedogenic
  max/mean, fragrance/allergen/pregnancy-active lists, per-skin-type warnings,
  and a `.summary()`.

### Skin-type rules (transparent and simple)

| skin type | rule |
|---|---|
| `normal` | universal rules only |
| `acne_prone` | **caution** if any ingredient is comedogenic ≥ 3/5 |
| `sensitive` | **caution** on fragrance/essential oils; **caution** on other irritants/declarable allergens |
| `dry` | **caution** on strong surfactants, exfoliants, or denatured alcohol |
| `oily` | **info** on rich occlusives / high-comedogenic emollients |
| `pregnancy` | **caution** on pregnancy-caution actives (e.g. retinoids) |
| *(universal)* | **info** when a pregnancy-caution active is present, for any skin type |

## Run it

```bash
pip install -r requirements.txt   # pytest only; engine is pure stdlib
python demo.py                    # annotated breakdowns for 4 sample products
python -m pytest -q               # test suite
```

### Tests

```
$ python -m pytest -q
..................                                                       [100%]
18 passed in 0.05s
```

The suite checks: a known ingredient is annotated with the correct
function/flags; synonyms resolve (`aqua`→Aqua, `vitamin e`→Tocopherol,
`bha`→Salicylic Acid); label noise like `Salicylic Acid 2%` still resolves; a
comedogenic-heavy list is flagged for acne-prone skin and **not** for normal; a
fragranced product is flagged for sensitive skin and not for normal; unknown
ingredients are reported (not dropped); and the function-breakdown counts are
correct on a known list.

## Real example breakdowns

Both produced by `python demo.py` over `data/ingredients.json` — no edits.

**Rich repair night balm — acne-prone skin**

```
Annotated breakdown:
  - Aqua                             [solvent]
  - Coconut Oil                      [emollient, occlusive]  <comedogenic 4/5>
  - Cocoa Butter                     [emollient, occlusive]  <comedogenic 4/5>
  - Isopropyl Myristate              [emollient]  <comedogenic 5/5>
  - Cetyl Alcohol                    [emollient, emulsifier, thickener]
  - Glyceryl Stearate                [emulsifier, emollient]
  - Shea Butter                      [emollient, occlusive]
  - Tocopherol                       [antioxidant]
  - Glycerin                         [humectant]
  - Phenoxyethanol                   [preservative]
  - Fragrance                        [fragrance]  <irritant; allergen>

Warnings:
  [caution] High comedogenic rating (>= 3/5) may clog pores on acne-prone skin (Coconut Oil, Cocoa Butter, Isopropyl Myristate)

Summary:
  11/11 ingredients recognised (0 unknown). Dominant functions: emollient x6,
  occlusive x3, emulsifier x2, antioxidant x1. Comedogenic load: peak 5/5,
  mean 1.7/5. Contains fragrance/essential-oil (1). Declarable allergens
  present: 1. 1 caution(s) for acne_prone skin.
```

**Hydrating gel-cream — sensitive skin**

```
Warnings:
  [caution] Fragrance / essential oils are a frequent irritant for sensitive skin (Fragrance, Limonene, Linalool)

Summary:
  16/16 ingredients recognised (0 unknown). Dominant functions: barrier_repair x4,
  soothing x4, emollient x3, fragrance x3. Comedogenic load: peak 1/5, mean 0.1/5.
  Contains fragrance/essential-oil (3). Declarable allergens present: 3.
  1 caution(s) for sensitive skin.
```

**Anti-aging serum — pregnancy lens** (Retinol surfaced):

```
Warnings:
  [caution] Pregnancy-caution actives are commonly avoided during pregnancy /
  breastfeeding; consult a professional (Retinol)
```

## Layout

```
skincares-advisor/
├── data/ingredients.json      143-ingredient knowledge base (+ disclaimer)
├── skincare/
│   ├── parser.py              INCI parsing, normalization, synonym resolution
│   └── analyzer.py            annotation + skin-type-aware report
├── demo.py                    runnable annotated breakdowns
├── tests/test_analyzer.py     pytest suite (18 tests)
├── requirements.txt
├── index.html                 self-contained in-browser analyzer (same data)
├── style.css
└── .github/workflows/deploy.yml
```

The web page is plain HTML/CSS/JS with no build step. The Python engine in
`skincare/` is the real implementation; the in-browser analyzer mirrors the
same parse → resolve → annotate → warn logic over the same `ingredients.json`.

Nothing here is medical advice. Always patch-test new products.
