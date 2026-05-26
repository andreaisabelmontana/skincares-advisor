// ============================================================
// Analyzer + skin-type quiz wiring.
// ============================================================
import { INGREDIENTS, analyze, CATEGORY } from './ingredients.js';

// ---------- Sample INCI lists ---------------------------------------------
// Generic representative compositions of each product type; they include
// only widely-used ingredients so the analyzer has plenty to recognise.
const SAMPLES = {
  hydration:   'Aqua, Glycerin, Niacinamide, Sodium Hyaluronate, Panthenol, Allantoin, Centella Asiatica, Aloe Barbadensis, Squalane, Phenoxyethanol',
  acne:        'Aqua, Salicylic Acid, Niacinamide, Tea Tree Oil, Witch Hazel, Glycerin, Allantoin, Aloe, Phenoxyethanol, Fragrance',
  aging:       'Aqua, Glycerin, Retinol, Squalane, Bakuchiol, Peptides, Ceramides, Tocopherol, Rosehip Oil, Phenoxyethanol',
  brightening: 'Aqua, L-Ascorbic Acid, Ferulic Acid, Tocopherol, Tranexamic Acid, Niacinamide, Alpha Arbutin, Glycerin, Hyaluronic Acid',
  sunscreen:   'Zinc Oxide, Titanium Dioxide, Squalane, Niacinamide, Glycerin, Allantoin, Tocopherol, Centella Asiatica',
};

// ---------- DOM refs -------------------------------------------------------
const inci      = document.getElementById('inci');
const btnAnal   = document.getElementById('btn-analyze');
const btnClear  = document.getElementById('btn-clear');
const resultsEl = document.getElementById('results');
const sumEl     = document.getElementById('summary');
const distEl    = document.getElementById('dist');
const sTotal    = document.getElementById('s-total');
const sUnknown  = document.getElementById('s-unknown');
const sCaution  = document.getElementById('s-caution');
const catGrid   = document.getElementById('cat-grid');

// Sample chips
document.querySelectorAll('.chip[data-sample]').forEach(b => {
  b.addEventListener('click', () => {
    inci.value = SAMPLES[b.dataset.sample] || '';
    runAnalysis();
  });
});

btnAnal.addEventListener('click', runAnalysis);
btnClear.addEventListener('click', () => {
  inci.value = '';
  resultsEl.innerHTML = '';
  sumEl.hidden = true;
});

inci.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') runAnalysis();
});

function runAnalysis() {
  const txt = inci.value.trim();
  if (!txt) { resultsEl.innerHTML = ''; sumEl.hidden = true; return; }

  const parsed = analyze(txt);
  const known = parsed.filter(p => p.match);
  const unknown = parsed.filter(p => !p.match);

  // Deduplicate matches (a label sometimes lists the same active twice).
  const seen = new Set();
  const unique = [];
  for (const p of known) {
    if (seen.has(p.match)) continue;
    seen.add(p.match);
    unique.push(p);
  }
  const cautions = unique.filter(p => p.match.category === 'caution' || (p.match.caution || []).length > 0);

  // Summary numbers
  sTotal.textContent   = unique.length;
  sUnknown.textContent = unknown.length;
  sCaution.textContent = cautions.length;

  // Distribution bar — one stripe per category found, width prop. to count.
  const counts = {};
  for (const p of unique) counts[p.match.category] = (counts[p.match.category] || 0) + 1;
  distEl.innerHTML = '';
  const total = unique.length || 1;
  for (const [cat, n] of Object.entries(counts)) {
    const span = document.createElement('span');
    span.style.width = `${(n / total) * 100}%`;
    span.style.background = CATEGORY[cat]?.color || 'var(--border)';
    span.title = `${CATEGORY[cat]?.label || cat}: ${n}`;
    distEl.appendChild(span);
  }
  sumEl.hidden = false;

  // Result cards
  resultsEl.innerHTML = '';
  for (const p of unique) renderIng(p.match);
  for (const p of unknown) renderUnknown(p.token);
}

function renderIng(ing) {
  const cat = CATEGORY[ing.category];
  const el = document.createElement('article');
  el.className = 'ing';
  el.style.setProperty('--cat', cat?.color || 'var(--border)');
  const tags = [
    ...(ing.good || []).map(g => `+ ${g}`),
    ...(ing.caution || []).map(c => `⚠ ${c}`),
  ].join(' · ');
  el.innerHTML = `
    <div>
      <strong>${ing.names[0]}</strong>
      ${ing.names.length > 1 ? `<span class="muted small"> · ${ing.names.slice(1, 3).join(', ')}</span>` : ''}
    </div>
    <span class="cat-pill">${cat?.label || ing.category}</span>
    <span class="desc">${ing.desc}${tags ? ` <span class="tags">— ${tags}</span>` : ''}</span>
  `;
  resultsEl.appendChild(el);
}
function renderUnknown(token) {
  const el = document.createElement('article');
  el.className = 'ing unknown';
  el.innerHTML = `<div><strong>${escapeHtml(token)}</strong></div>
                  <span class="cat-pill" style="background:var(--bg-soft); color:var(--muted)">not recognised</span>
                  <span class="desc">Not in the reference list — likely a preservative, solvent, texture agent, or a less-common active.</span>`;
  resultsEl.appendChild(el);
}
function escapeHtml(s) { return s.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

// ---------- Glossary -------------------------------------------------------
const CATEGORY_DESC = {
  hydration:   'Pull water into the upper layers of skin. Best layered under a moisturiser.',
  exfoliation: 'Remove dead surface cells. AHA/BHA/PHA do this via chemistry, not scrubbing.',
  'anti-aging':'Stimulate cell turnover and collagen. Slow-and-steady wins; harsh-and-fast just irritates.',
  brightening: 'Interfere with melanin synthesis to fade dark spots and even out tone.',
  antioxidant: 'Neutralise free radicals from UV and pollution. A morning serum staple.',
  soothing:    'Calm reactive, red, or compromised skin.',
  barrier:     'Reinforce the skin barrier so it loses less water and tolerates more.',
  sunscreen:   'Block UV. The single most effective anti-aging move you can make.',
  occlusive:   'Sit on top of the skin to seal water in. Heavy but effective on dry skin.',
  cleansing:   'Surfactants that lift oil and dirt off the skin. Stronger isn’t better.',
  acne:        'Direct attack on acne — antibacterial, comedolytic, or anti-inflammatory.',
  caution:     'Common irritants or drying agents — fine for most, problematic for sensitive skin.',
};
for (const [k, c] of Object.entries(CATEGORY)) {
  const el = document.createElement('article');
  el.className = 'cat-card';
  el.style.setProperty('--cat', c.color);
  el.innerHTML = `<strong>${c.label}</strong><p>${CATEGORY_DESC[k]}</p>`;
  catGrid.appendChild(el);
}

// ---------- Skin-type quiz -------------------------------------------------
const QUESTIONS = [
  {
    q: 'How does your skin feel an hour after washing?',
    opts: [
      { l: 'Tight and dry',                 v: 'dry' },
      { l: 'Balanced, comfortable',         v: 'normal' },
      { l: 'Shiny in the t-zone',           v: 'combo' },
      { l: 'Oily across the face',          v: 'oily' },
    ],
    key: 'type',
  },
  {
    q: 'Pick the concern that bothers you most.',
    opts: [
      { l: 'Breakouts and clogged pores',   v: 'acne' },
      { l: 'Fine lines and loss of firmness', v: 'aging' },
      { l: 'Dullness or uneven tone',       v: 'dullness' },
      { l: 'Redness or sensitivity',        v: 'redness' },
      { l: 'Just dryness',                  v: 'dryness' },
    ],
    key: 'concern',
  },
  {
    q: 'How does your skin react to new products?',
    opts: [
      { l: 'Generally fine',                v: 'tough' },
      { l: 'Occasional sting / redness',    v: 'mid' },
      { l: 'Reacts to almost everything',   v: 'sensitive' },
    ],
    key: 'sensitivity',
  },
  {
    q: 'How much sun do you get on an average day?',
    opts: [
      { l: 'Barely any — I’m indoors',      v: 'low' },
      { l: 'Some — commute and lunch',      v: 'mid' },
      { l: 'A lot — I spend time outside',  v: 'high' },
    ],
    key: 'sun',
  },
  {
    q: 'How many steps are you willing to do?',
    opts: [
      { l: 'Minimal: 2–3 steps',            v: 'min' },
      { l: 'Standard: 4–5 steps',           v: 'std' },
      { l: 'I’ll do the full routine',      v: 'max' },
    ],
    key: 'effort',
  },
];

const quizState = { i: 0, answers: {} };
const stage = document.getElementById('quiz-stage');
const progBar = document.getElementById('qprog-bar');
const progText = document.getElementById('qprog-text');

function renderQ() {
  const idx = quizState.i;
  if (idx >= QUESTIONS.length) return renderResult();
  const q = QUESTIONS[idx];
  progBar.style.width = `${((idx + 1) / QUESTIONS.length) * 100}%`;
  progText.textContent = `Step ${idx + 1} of ${QUESTIONS.length}`;
  stage.innerHTML = `
    <div class="q">
      <h3>${q.q}</h3>
      <div class="q-opts">
        ${q.opts.map((o, i) => `
          <button class="q-opt${quizState.answers[q.key] === o.v ? ' selected' : ''}" data-v="${o.v}">${o.l}</button>
        `).join('')}
      </div>
      <div class="q-actions">
        <button class="btn btn-secondary" id="q-back" ${idx === 0 ? 'disabled' : ''}>← Back</button>
        <button class="btn btn-primary" id="q-next" ${quizState.answers[q.key] ? '' : 'disabled'}>
          ${idx === QUESTIONS.length - 1 ? 'See my routine →' : 'Next →'}
        </button>
      </div>
    </div>
  `;
  stage.querySelectorAll('.q-opt').forEach(b => {
    b.addEventListener('click', () => {
      quizState.answers[q.key] = b.dataset.v;
      renderQ();
    });
  });
  document.getElementById('q-back').addEventListener('click', () => {
    if (quizState.i > 0) { quizState.i--; renderQ(); }
  });
  document.getElementById('q-next').addEventListener('click', () => {
    if (!quizState.answers[q.key]) return;
    quizState.i++;
    renderQ();
  });
}

function renderResult() {
  const { type, concern, sensitivity, sun, effort } = quizState.answers;
  progBar.style.width = '100%';
  progText.textContent = 'Done';

  // Determine ingredient picks. Each category can be triggered by one or
  // more answer combinations; we collect a small set and dedupe.
  const picks = new Set();

  if (type === 'dry' || concern === 'dryness') {
    picks.add('hydration'); picks.add('barrier'); picks.add('occlusive');
  }
  if (type === 'oily' || type === 'combo' || concern === 'acne') {
    picks.add('exfoliation'); picks.add('acne');
  }
  if (concern === 'aging') {
    picks.add('anti-aging'); picks.add('antioxidant'); picks.add('barrier');
  }
  if (concern === 'dullness') {
    picks.add('brightening'); picks.add('antioxidant');
  }
  if (concern === 'redness' || sensitivity === 'sensitive') {
    picks.add('soothing'); picks.add('barrier');
    picks.delete('exfoliation'); picks.delete('acne');
  }
  if (sun === 'high' || effort !== 'min') {
    picks.add('sunscreen');
  } else {
    picks.add('sunscreen');     // always
  }
  if (effort === 'min') {
    // Trim to essentials
    const keep = new Set(['hydration', 'sunscreen', concern === 'acne' ? 'acne' : concern === 'aging' ? 'anti-aging' : 'barrier']);
    for (const c of [...picks]) if (!keep.has(c)) picks.delete(c);
  }
  if (picks.size === 0) {
    picks.add('hydration'); picks.add('barrier'); picks.add('sunscreen');
  }

  // Pick 1-2 specific ingredients per category to make it concrete.
  const examples = {};
  for (const cat of picks) {
    const candidates = INGREDIENTS.filter(i => i.category === cat && i.category !== 'caution');
    examples[cat] = candidates.slice(0, 2);
  }

  const order = ['hydration', 'soothing', 'antioxidant', 'brightening', 'anti-aging', 'exfoliation', 'acne', 'barrier', 'occlusive', 'sunscreen'];
  const ordered = order.filter(c => picks.has(c));

  stage.innerHTML = `
    <div class="quiz-result">
      <div class="summary">
        <h3>Your routine outline</h3>
        <p class="muted" style="margin:0">
          <strong>${typeLabel(type)}</strong> skin · main goal: <strong>${concern}</strong> ·
          sensitivity: <strong>${sensitivity}</strong> · sun: <strong>${sun}</strong> ·
          steps: <strong>${effort}</strong>
        </p>
      </div>
      <h3 style="font-family: var(--font-display); font-weight: 700; margin: 0 0 0.5rem">Ingredient palette</h3>
      <div class="reco">
        ${ordered.map(cat => `
          <article class="reco-card" style="--cat:${CATEGORY[cat].color}">
            <strong>${CATEGORY[cat].label}</strong>
            <span>${examples[cat].map(i => i.names[0]).join(', ') || '—'}</span>
          </article>
        `).join('')}
      </div>
      <p class="muted small" style="margin-top: 1.25rem">
        This is a general orientation, not medical advice. Patch-test any new product on a small area for 48 hours.
      </p>
      <button class="btn btn-secondary" id="q-restart">↺ Start over</button>
    </div>
  `;
  document.getElementById('q-restart').addEventListener('click', () => {
    quizState.i = 0; quizState.answers = {}; renderQ();
  });
}
function typeLabel(v) {
  return { dry: 'Dry', normal: 'Balanced', combo: 'Combination', oily: 'Oily' }[v] || v;
}

renderQ();

document.getElementById('yr').textContent = new Date().getFullYear();
