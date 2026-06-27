"""Annotate a parsed INCI list and build a skin-type-aware report.

The analyzer takes the tokens produced by :mod:`skincare.parser`, attaches the
knowledge-base data to each recognised ingredient, and aggregates a report:

* a function breakdown (how many humectants, exfoliants, fragrances, ...),
* a comedogenic load (max and mean pore-clogging rating over known items),
* fragrance/allergen presence (incl. EU-26-style declarable allergens),
* and skin-type-aware warnings driven by simple, transparent rules.

Everything here is educational, not medical advice.
"""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass, field
from typing import Dict, List, Optional

from .parser import Ingredient, KnowledgeBase, ParsedToken, load_kb, parse_inci

# Supported skin-type lenses. "normal" applies only the universal rules.
SKIN_TYPES = ("normal", "acne_prone", "sensitive", "dry", "oily", "pregnancy")

# Comedogenic rating at/above which an ingredient is "pore-clogging" for
# acne-prone skin.
COMEDOGENIC_THRESHOLD = 3


@dataclass
class AnnotatedIngredient:
    """A recognised ingredient with its source token."""

    token: str
    ingredient: Ingredient

    @property
    def inci(self) -> str:
        return self.ingredient.inci

    @property
    def functions(self) -> List[str]:
        return self.ingredient.functions

    @property
    def comedogenic(self) -> int:
        return self.ingredient.comedogenic


@dataclass
class Warning:
    """A single skin-type-aware caution with the ingredients that triggered it."""

    skin_type: str
    severity: str  # "info" | "caution"
    message: str
    ingredients: List[str] = field(default_factory=list)

    def __str__(self) -> str:
        names = ", ".join(self.ingredients)
        tail = f" ({names})" if names else ""
        return f"[{self.severity}] {self.message}{tail}"


@dataclass
class Report:
    """The aggregate result of analysing one ingredient list."""

    skin_type: str
    total: int
    recognized: List[AnnotatedIngredient]
    unknown: List[str]
    function_breakdown: Dict[str, int]
    comedogenic_max: int
    comedogenic_mean: float
    fragrance: List[str]
    allergens: List[str]
    pregnancy_actives: List[str]
    warnings: List[Warning]

    @property
    def recognized_count(self) -> int:
        return len(self.recognized)

    @property
    def unknown_count(self) -> int:
        return len(self.unknown)

    def has_function(self, fn: str) -> bool:
        return self.function_breakdown.get(fn, 0) > 0

    def summary(self) -> str:
        """A one-paragraph plain-text overview."""
        parts = [
            f"{self.recognized_count}/{self.total} ingredients recognised "
            f"({self.unknown_count} unknown).",
        ]
        if self.function_breakdown:
            top = ", ".join(
                f"{fn} x{n}"
                for fn, n in sorted(
                    self.function_breakdown.items(), key=lambda kv: (-kv[1], kv[0])
                )[:4]
            )
            parts.append(f"Dominant functions: {top}.")
        parts.append(
            f"Comedogenic load: peak {self.comedogenic_max}/5, "
            f"mean {self.comedogenic_mean:.1f}/5."
        )
        if self.fragrance:
            parts.append(f"Contains fragrance/essential-oil ({len(self.fragrance)}).")
        if self.allergens:
            parts.append(f"Declarable allergens present: {len(self.allergens)}.")
        n_caution = sum(1 for w in self.warnings if w.severity == "caution")
        parts.append(
            f"{n_caution} caution(s) for {self.skin_type} skin."
            if n_caution
            else f"No cautions for {self.skin_type} skin."
        )
        return " ".join(parts)


def _build_warnings(
    skin_type: str,
    recognized: List[AnnotatedIngredient],
    fragrance: List[str],
    allergens: List[str],
    pregnancy_actives: List[str],
    comedogenic_max: int,
    high_comedogenic: List[str],
    irritants: List[str],
) -> List[Warning]:
    """Apply the transparent skin-type rule set."""
    warnings: List[Warning] = []

    # ---- Universal (apply to every skin type) ----
    if pregnancy_actives and skin_type != "pregnancy":
        warnings.append(
            Warning(
                skin_type,
                "info",
                "Contains a pregnancy-caution active (avoid if pregnant or "
                "breastfeeding without medical advice)",
                pregnancy_actives,
            )
        )

    # ---- Acne-prone ----
    if skin_type == "acne_prone" and high_comedogenic:
        warnings.append(
            Warning(
                skin_type,
                "caution",
                f"High comedogenic rating (>= {COMEDOGENIC_THRESHOLD}/5) may clog "
                "pores on acne-prone skin",
                high_comedogenic,
            )
        )

    # ---- Sensitive ----
    if skin_type == "sensitive":
        if fragrance:
            warnings.append(
                Warning(
                    skin_type,
                    "caution",
                    "Fragrance / essential oils are a frequent irritant for "
                    "sensitive skin",
                    fragrance,
                )
            )
        # Anything irritant/allergenic not already covered by the fragrance rule.
        fragrance_set = set(fragrance)
        extra = sorted(
            (set(allergens) | set(irritants)) - fragrance_set
        )
        if extra:
            warnings.append(
                Warning(
                    skin_type,
                    "caution",
                    "Known irritants / declarable allergens may not suit "
                    "sensitive skin",
                    extra,
                )
            )

    # ---- Dry ----
    if skin_type == "dry":
        drying = [
            ai.inci
            for ai in recognized
            if any(f in ("surfactant", "exfoliant") for f in ai.functions)
            or ai.inci.lower().startswith("alcohol denat")
        ]
        drying = sorted(set(drying))
        if drying:
            warnings.append(
                Warning(
                    skin_type,
                    "caution",
                    "Strong cleansers/exfoliants/alcohol can worsen dryness; "
                    "pair with humectants and occlusives",
                    drying,
                )
            )

    # ---- Oily ----
    if skin_type == "oily":
        heavy = [
            ai.inci
            for ai in recognized
            if ai.comedogenic >= COMEDOGENIC_THRESHOLD
            or "occlusive" in ai.functions
        ]
        heavy = sorted(set(heavy))
        if heavy:
            warnings.append(
                Warning(
                    skin_type,
                    "info",
                    "Rich occlusives / high-comedogenic emollients can feel heavy "
                    "on oily skin",
                    heavy,
                )
            )

    # ---- Pregnancy ----
    if skin_type == "pregnancy" and pregnancy_actives:
        warnings.append(
            Warning(
                skin_type,
                "caution",
                "Pregnancy-caution actives are commonly avoided during pregnancy / "
                "breastfeeding; consult a professional",
                pregnancy_actives,
            )
        )

    return warnings


def analyze(
    raw: str,
    skin_type: str = "normal",
    kb: Optional[KnowledgeBase] = None,
) -> Report:
    """Parse, annotate and report on a raw INCI list for a given skin type."""
    if skin_type not in SKIN_TYPES:
        raise ValueError(
            f"unknown skin_type {skin_type!r}; expected one of {SKIN_TYPES}"
        )
    if kb is None:
        kb = load_kb()

    tokens: List[ParsedToken] = parse_inci(raw, kb)

    recognized: List[AnnotatedIngredient] = []
    unknown: List[str] = []
    for t in tokens:
        if t.ingredient is not None:
            recognized.append(AnnotatedIngredient(token=t.raw, ingredient=t.ingredient))
        else:
            unknown.append(t.raw)

    # Function breakdown.
    fn_counter: Counter = Counter()
    for ai in recognized:
        for fn in ai.functions:
            fn_counter[fn] += 1

    # Comedogenic load.
    ratings = [ai.comedogenic for ai in recognized]
    comedogenic_max = max(ratings) if ratings else 0
    comedogenic_mean = sum(ratings) / len(ratings) if ratings else 0.0

    # Flag collections (de-duplicated, order-stable by first appearance).
    fragrance = _unique([ai.inci for ai in recognized if "fragrance" in ai.functions])
    allergens = _unique([ai.inci for ai in recognized if ai.ingredient.allergen])
    irritants = _unique([ai.inci for ai in recognized if ai.ingredient.irritant])
    pregnancy_actives = _unique(
        [ai.inci for ai in recognized if ai.ingredient.pregnancy_caution]
    )
    high_comedogenic = _unique(
        [ai.inci for ai in recognized if ai.comedogenic >= COMEDOGENIC_THRESHOLD]
    )

    warnings = _build_warnings(
        skin_type=skin_type,
        recognized=recognized,
        fragrance=fragrance,
        allergens=allergens,
        pregnancy_actives=pregnancy_actives,
        comedogenic_max=comedogenic_max,
        high_comedogenic=high_comedogenic,
        irritants=irritants,
    )

    return Report(
        skin_type=skin_type,
        total=len(tokens),
        recognized=recognized,
        unknown=unknown,
        function_breakdown=dict(fn_counter),
        comedogenic_max=comedogenic_max,
        comedogenic_mean=comedogenic_mean,
        fragrance=fragrance,
        allergens=allergens,
        pregnancy_actives=pregnancy_actives,
        warnings=warnings,
    )


def _unique(items: List[str]) -> List[str]:
    """Order-preserving de-duplication."""
    seen = set()
    out: List[str] = []
    for it in items:
        if it not in seen:
            seen.add(it)
            out.append(it)
    return out
