// ============================================================
// Skincare ingredient reference database.
//
// Each entry has:
//   names    aliases the analyzer matches against (case + space insensitive)
//   category one of: hydration, exfoliation, anti-aging, brightening,
//                    antioxidant, soothing, barrier, sunscreen, occlusive,
//                    cleansing, acne, caution
//   good     what concerns the ingredient is well-suited for
//   caution  who should be careful with it
//   desc     short, neutral, common-knowledge description
//
// All descriptions are original prose summarising widely-available
// dermatology/cosmetic-chemistry knowledge.
// ============================================================

export const INGREDIENTS = [
  {
    names: ['hyaluronic acid', 'sodium hyaluronate', 'hydrolyzed hyaluronic acid', 'ha'],
    category: 'hydration',
    good: ['dryness', 'all skin types'],
    caution: [],
    desc: 'A humectant that pulls water into the upper layers of skin. Works well layered under a moisturiser.',
  },
  {
    names: ['glycerin', 'glycerine'],
    category: 'hydration',
    good: ['dryness', 'all skin types'],
    caution: [],
    desc: 'A classic humectant. Cheap, gentle, in almost every moisturiser.',
  },
  {
    names: ['niacinamide', 'nicotinamide', 'vitamin b3'],
    category: 'barrier',
    good: ['oiliness', 'redness', 'pores', 'uneven tone'],
    caution: [],
    desc: 'A B-vitamin that calms redness, supports the skin barrier and helps regulate sebum. Pairs well with most things.',
  },
  {
    names: ['ascorbic acid', 'l-ascorbic acid', 'vitamin c'],
    category: 'antioxidant',
    good: ['dullness', 'uneven tone', 'fine lines'],
    caution: ['sensitive skin'],
    desc: 'A potent antioxidant that brightens and helps with hyperpigmentation. Unstable; needs low pH to work in its pure form.',
  },
  {
    names: ['magnesium ascorbyl phosphate', 'sodium ascorbyl phosphate', 'tetrahexyldecyl ascorbate', 'ascorbyl glucoside'],
    category: 'antioxidant',
    good: ['dullness', 'sensitive skin'],
    caution: [],
    desc: 'A more stable, gentler vitamin C derivative. Slower-acting but easier on sensitive skin.',
  },
  {
    names: ['retinol', 'retinyl palmitate', 'retinaldehyde', 'retinyl propionate'],
    category: 'anti-aging',
    good: ['fine lines', 'wrinkles', 'pores', 'uneven tone'],
    caution: ['sensitive skin', 'pregnancy'],
    desc: 'A vitamin A derivative that boosts cell turnover and collagen. Start slow — irritation is common in the first weeks.',
  },
  {
    names: ['bakuchiol'],
    category: 'anti-aging',
    good: ['fine lines', 'sensitive skin'],
    caution: [],
    desc: 'A plant-derived alternative to retinol with similar visible effects and less irritation.',
  },
  {
    names: ['salicylic acid', 'beta hydroxy acid', 'bha'],
    category: 'exfoliation',
    good: ['acne', 'blackheads', 'oiliness', 'pores'],
    caution: ['sensitive skin', 'pregnancy'],
    desc: 'Oil-soluble exfoliant that goes inside pores to clear them. The classic acne ingredient.',
  },
  {
    names: ['glycolic acid'],
    category: 'exfoliation',
    good: ['dullness', 'fine lines', 'rough texture'],
    caution: ['sensitive skin'],
    desc: 'The smallest AHA — strong surface exfoliation, fast results, also the most likely to sting.',
  },
  {
    names: ['lactic acid'],
    category: 'exfoliation',
    good: ['dullness', 'dryness', 'gentle exfoliation'],
    caution: [],
    desc: 'A larger AHA, much gentler than glycolic. Hydrating side-effect makes it a good entry-level acid.',
  },
  {
    names: ['mandelic acid'],
    category: 'exfoliation',
    good: ['acne', 'sensitive skin', 'dullness'],
    caution: [],
    desc: 'The gentlest common AHA. A good pick if glycolic is too harsh.',
  },
  {
    names: ['polyhydroxy acid', 'pha', 'gluconolactone', 'lactobionic acid'],
    category: 'exfoliation',
    good: ['sensitive skin', 'dullness'],
    caution: [],
    desc: 'Very gentle exfoliating acids with humectant properties. Generally well tolerated.',
  },
  {
    names: ['azelaic acid'],
    category: 'brightening',
    good: ['acne', 'redness', 'rosacea', 'uneven tone'],
    caution: [],
    desc: 'A multitasker: calms redness, helps with acne and post-inflammatory dark spots, low irritation.',
  },
  {
    names: ['benzoyl peroxide'],
    category: 'acne',
    good: ['acne'],
    caution: ['sensitive skin', 'dryness'],
    desc: 'Antibacterial spot-fighter. Effective on inflamed acne but drying and bleaches fabric.',
  },
  {
    names: ['tranexamic acid'],
    category: 'brightening',
    good: ['dark spots', 'uneven tone'],
    caution: [],
    desc: 'Targets melanin production. Often paired with niacinamide for stubborn hyperpigmentation.',
  },
  {
    names: ['alpha arbutin', 'arbutin'],
    category: 'brightening',
    good: ['dark spots', 'uneven tone'],
    caution: [],
    desc: 'A gentle skin-brightener that interferes with melanin synthesis.',
  },
  {
    names: ['kojic acid'],
    category: 'brightening',
    good: ['dark spots'],
    caution: ['sensitive skin'],
    desc: 'Brightening agent from fungi. Effective but can irritate sensitive skin.',
  },
  {
    names: ['ceramides', 'ceramide np', 'ceramide ap', 'ceramide eop'],
    category: 'barrier',
    good: ['dryness', 'sensitive skin', 'barrier repair'],
    caution: [],
    desc: 'Lipids that naturally live in the skin barrier. Topping them up helps lock in moisture.',
  },
  {
    names: ['squalane'],
    category: 'occlusive',
    good: ['dryness', 'all skin types'],
    caution: [],
    desc: 'A lightweight, plant-derived emollient. Mimics skin’s own sebum without feeling greasy.',
  },
  {
    names: ['panthenol', 'pro-vitamin b5'],
    category: 'soothing',
    good: ['redness', 'irritation', 'dryness'],
    caution: [],
    desc: 'Calms irritated skin and supports the barrier. Common in post-treatment products.',
  },
  {
    names: ['allantoin'],
    category: 'soothing',
    good: ['redness', 'sensitive skin'],
    caution: [],
    desc: 'A gentle soother that promotes healing of stressed skin.',
  },
  {
    names: ['centella asiatica', 'cica', 'madecassoside', 'asiaticoside'],
    category: 'soothing',
    good: ['redness', 'sensitive skin', 'barrier repair'],
    caution: [],
    desc: 'An herbal extract popular for calming reactive, compromised skin.',
  },
  {
    names: ['aloe', 'aloe barbadensis', 'aloe vera'],
    category: 'soothing',
    good: ['redness', 'sunburn'],
    caution: [],
    desc: 'Cooling, mildly hydrating. Works best as a calming layer rather than a treatment.',
  },
  {
    names: ['green tea extract', 'camellia sinensis', 'egcg'],
    category: 'antioxidant',
    good: ['redness', 'dullness', 'environmental damage'],
    caution: [],
    desc: 'Polyphenol-rich antioxidant that helps mop up free radicals from sun and pollution.',
  },
  {
    names: ['resveratrol'],
    category: 'antioxidant',
    good: ['dullness', 'fine lines'],
    caution: [],
    desc: 'Plant-derived antioxidant. Pairs well with vitamin C in serums.',
  },
  {
    names: ['peptides', 'matrixyl', 'argireline', 'copper peptides'],
    category: 'anti-aging',
    good: ['fine lines', 'firmness'],
    caution: [],
    desc: 'Short amino-acid chains that signal the skin to build collagen and repair itself. Gentle.',
  },
  {
    names: ['caffeine'],
    category: 'soothing',
    good: ['puffiness', 'dullness'],
    caution: [],
    desc: 'Constricts blood vessels temporarily — common in eye creams for de-puffing.',
  },
  {
    names: ['zinc oxide', 'titanium dioxide'],
    category: 'sunscreen',
    good: ['sun protection', 'sensitive skin'],
    caution: [],
    desc: 'Mineral UV filters. Sit on the surface and reflect/absorb UV. Generally well tolerated.',
  },
  {
    names: ['avobenzone', 'octinoxate', 'octisalate', 'homosalate', 'oxybenzone', 'octocrylene'],
    category: 'sunscreen',
    good: ['sun protection'],
    caution: ['sensitive skin'],
    desc: 'Chemical UV filters. Lightweight, no white-cast, but more allergenic than minerals.',
  },
  {
    names: ['snail mucin', 'snail secretion filtrate'],
    category: 'hydration',
    good: ['dryness', 'dullness', 'barrier repair'],
    caution: [],
    desc: 'A K-beauty staple. Hydrates and is loaded with growth-factor-like compounds.',
  },
  {
    names: ['urea'],
    category: 'hydration',
    good: ['very dry skin', 'rough texture'],
    caution: ['sensitive skin'],
    desc: 'At low concentrations a humectant; at higher ones a mild exfoliant.',
  },
  {
    names: ['petrolatum', 'petroleum jelly', 'mineral oil'],
    category: 'occlusive',
    good: ['very dry skin', 'barrier repair'],
    caution: ['acne-prone'],
    desc: 'Heavy occlusive that traps water in. Excellent for slugging, can clog pores on some.',
  },
  {
    names: ['shea butter', 'butyrospermum parkii'],
    category: 'occlusive',
    good: ['dryness'],
    caution: [],
    desc: 'A rich emollient. Lovely for body, sometimes too heavy for oily face skin.',
  },
  {
    names: ['jojoba oil', 'simmondsia chinensis'],
    category: 'occlusive',
    good: ['dryness', 'all skin types'],
    caution: [],
    desc: 'Closely mimics skin’s own sebum. Surprisingly well-tolerated by oily skin.',
  },
  {
    names: ['rosehip oil', 'rosa canina', 'rosa moschata'],
    category: 'anti-aging',
    good: ['fine lines', 'uneven tone'],
    caution: [],
    desc: 'Rich in vitamin A precursors and essential fatty acids.',
  },
  {
    names: ['tea tree oil', 'melaleuca alternifolia'],
    category: 'acne',
    good: ['acne'],
    caution: ['sensitive skin'],
    desc: 'Naturally antibacterial. Can irritate at high concentrations.',
  },
  {
    names: ['witch hazel', 'hamamelis'],
    category: 'caution',
    good: ['oiliness'],
    caution: ['sensitive skin', 'dryness'],
    desc: 'Astringent. Some formulas contain a lot of alcohol — check the rest of the list.',
  },
  {
    names: ['alcohol denat', 'denatured alcohol', 'sd alcohol'],
    category: 'caution',
    good: [],
    caution: ['sensitive skin', 'dryness'],
    desc: 'Lightens the feel of a product but can be drying — placement near the top of the list matters.',
  },
  {
    names: ['fragrance', 'parfum', 'perfume'],
    category: 'caution',
    good: [],
    caution: ['sensitive skin', 'eczema'],
    desc: 'A blanket term for scent blends. The single most common irritant in cosmetics.',
  },
  {
    names: ['essential oil', 'limonene', 'linalool', 'citral', 'citronellol', 'geraniol'],
    category: 'caution',
    good: [],
    caution: ['sensitive skin'],
    desc: 'Natural scent compounds that are common allergens — EU labelling lists them explicitly.',
  },
  {
    names: ['sodium lauryl sulfate', 'sls'],
    category: 'cleansing',
    good: ['oiliness'],
    caution: ['sensitive skin', 'dryness'],
    desc: 'A strong cleansing surfactant. Effective but can strip the barrier if overused.',
  },
];

// Build a lookup index from alias → ingredient, normalised so we can match
// whatever a user pastes from a real product label.
function norm(s) {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
}
const INDEX = new Map();
for (const ing of INGREDIENTS) {
  for (const n of ing.names) INDEX.set(norm(n), ing);
}

/**
 * Parse a free-form INCI list (typically comma- or slash-separated) and
 * return an array of { token, match } where match is the canonical
 * ingredient or null if unrecognised.
 */
export function analyze(input) {
  const raw = input
    .split(/[,;\n•·]| - /g)
    .map(s => s.trim())
    .filter(Boolean);
  return raw.map(token => {
    const k = norm(token);
    if (INDEX.has(k)) return { token, match: INDEX.get(k) };
    // Loose contains-fallback for things like "salicylic acid 2%".
    for (const [key, ing] of INDEX) {
      if (k.includes(key) || key.includes(k)) return { token, match: ing };
    }
    return { token, match: null };
  });
}

// Category → display config (color and label).
export const CATEGORY = {
  hydration:   { color: 'var(--c-aqua)',   label: 'Hydration' },
  exfoliation: { color: 'var(--c-tan)',    label: 'Exfoliation' },
  'anti-aging':{ color: 'var(--c-plum)',   label: 'Anti-aging' },
  brightening: { color: 'var(--c-gold)',   label: 'Brightening' },
  antioxidant: { color: 'var(--c-leaf)',   label: 'Antioxidant' },
  soothing:    { color: 'var(--c-mint)',   label: 'Soothing' },
  barrier:     { color: 'var(--c-rose)',   label: 'Barrier' },
  sunscreen:   { color: 'var(--c-sun)',    label: 'Sunscreen' },
  occlusive:   { color: 'var(--c-clay)',   label: 'Occlusive' },
  cleansing:   { color: 'var(--c-slate)',  label: 'Cleansing' },
  acne:        { color: 'var(--c-coral)',  label: 'Anti-acne' },
  caution:     { color: 'var(--c-warn)',   label: 'Use with care' },
};
