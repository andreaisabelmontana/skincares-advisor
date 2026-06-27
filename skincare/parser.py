"""Parsing and knowledge-base loading for the INCI analyzer.

The parser takes a raw, free-form ingredient list (the kind you copy off the
back of a bottle) and turns it into a list of resolved tokens. It:

* splits on commas, semicolons, slashes, bullets and newlines,
* normalises case and whitespace and strips trailing concentrations
  like ``"Salicylic Acid 2%"`` or ``"Aqua (Water)"``,
* resolves canonical INCI names *and* synonyms (so ``aqua`` -> Aqua,
  ``tocopherol`` -> a vitamin-E entry, ``bha`` -> Salicylic Acid),
* and flags unrecognised tokens as unknown rather than dropping them.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional

# Path to the committed knowledge base.
DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "ingredients.json"

# Separators that show up between ingredients on real labels.
_SPLIT_RE = re.compile(r"[,;\n\r•·，]+|/(?![a-z])", re.IGNORECASE)
# Trailing concentration / parenthetical noise, e.g. "2%", "(0.5%)".
_PCT_RE = re.compile(r"\b\d+(?:\.\d+)?\s*%")
_NORM_RE = re.compile(r"[^a-z0-9 ]+")
_WS_RE = re.compile(r"\s+")


@dataclass(frozen=True)
class Ingredient:
    """One entry from the knowledge base."""

    inci: str
    synonyms: List[str]
    functions: List[str]
    comedogenic: int
    irritant: bool
    allergen: bool
    pregnancy_caution: bool
    note: str

    @classmethod
    def from_dict(cls, d: dict) -> "Ingredient":
        return cls(
            inci=d["inci"],
            synonyms=list(d.get("synonyms", [])),
            functions=list(d["functions"]),
            comedogenic=int(d["comedogenic"]),
            irritant=bool(d["irritant"]),
            allergen=bool(d["allergen"]),
            pregnancy_caution=bool(d["pregnancy_caution"]),
            note=d["note"],
        )


@dataclass
class KnowledgeBase:
    """The loaded ingredient database plus a normalised lookup index."""

    ingredients: List[Ingredient]
    meta: dict = field(default_factory=dict)
    _index: Dict[str, Ingredient] = field(default_factory=dict, repr=False)

    def __post_init__(self) -> None:
        if not self._index:
            self._build_index()

    def _build_index(self) -> None:
        index: Dict[str, Ingredient] = {}
        for ing in self.ingredients:
            for name in [ing.inci, *ing.synonyms]:
                key = normalize(name)
                if key:
                    index.setdefault(key, ing)
        self._index = index

    def __len__(self) -> int:
        return len(self.ingredients)

    @property
    def function_vocabulary(self) -> List[str]:
        return list(self.meta.get("function_vocabulary", []))

    @property
    def disclaimer(self) -> str:
        return self.meta.get("disclaimer", "")

    def lookup(self, token: str) -> Optional[Ingredient]:
        """Resolve a single (already-split) token to an ingredient, or None.

        Tries an exact normalised match first, then a conservative
        whole-phrase containment fallback so that label noise such as
        ``"Salicylic Acid 2%"`` still resolves to Salicylic Acid.
        """
        key = normalize(token)
        if not key:
            return None
        hit = self._index.get(key)
        if hit is not None:
            return hit
        # Conservative fallback: the cleaned token contains a known name as a
        # whole phrase (word-boundary aware). Prefer the longest such match to
        # avoid e.g. matching "acid" inside everything.
        best: Optional[Ingredient] = None
        best_len = 0
        for name_key, ing in self._index.items():
            if len(name_key) < 4:
                continue  # skip very short aliases in fuzzy mode (ha, pg, sci...)
            if _contains_phrase(key, name_key) and len(name_key) > best_len:
                best, best_len = ing, len(name_key)
        return best


@dataclass
class ParsedToken:
    """A single parsed entry from the user's list."""

    raw: str
    normalized: str
    ingredient: Optional[Ingredient]

    @property
    def is_known(self) -> bool:
        return self.ingredient is not None


def normalize(text: str) -> str:
    """Lower-case, strip percentages/parentheticals and collapse whitespace."""
    s = text.lower()
    s = _PCT_RE.sub(" ", s)
    s = _NORM_RE.sub(" ", s)  # drop punctuation, parens, etc.
    s = _WS_RE.sub(" ", s).strip()
    return s


def _contains_phrase(haystack: str, needle: str) -> bool:
    """True if `needle` appears in `haystack` bounded by start/end/space."""
    pattern = r"(?:^| )" + re.escape(needle) + r"(?:$| )"
    return re.search(pattern, haystack) is not None


def load_kb(path: Optional[Path] = None) -> KnowledgeBase:
    """Load the committed knowledge base from JSON."""
    p = Path(path) if path is not None else DATA_PATH
    with open(p, "r", encoding="utf-8") as fh:
        data = json.load(fh)
    ingredients = [Ingredient.from_dict(d) for d in data["ingredients"]]
    return KnowledgeBase(ingredients=ingredients, meta=data.get("meta", {}))


def split_tokens(raw: str) -> List[str]:
    """Split a free-form INCI list into trimmed, non-empty token strings."""
    parts = _SPLIT_RE.split(raw)
    return [p.strip() for p in parts if p and p.strip()]


def parse_inci(raw: str, kb: KnowledgeBase) -> List[ParsedToken]:
    """Parse a raw INCI list into resolved tokens against the knowledge base."""
    tokens: List[ParsedToken] = []
    for piece in split_tokens(raw):
        tokens.append(
            ParsedToken(
                raw=piece,
                normalized=normalize(piece),
                ingredient=kb.lookup(piece),
            )
        )
    return tokens
