"""skincare - a small, real INCI ingredient-analysis engine.

Educational reference only. Not medical advice. See data/ingredients.json
for the disclaimer attached to the knowledge base.
"""

from .parser import (
    Ingredient,
    KnowledgeBase,
    ParsedToken,
    load_kb,
    normalize,
    parse_inci,
)
from .analyzer import (
    AnnotatedIngredient,
    Report,
    analyze,
    SKIN_TYPES,
)

__all__ = [
    "Ingredient",
    "KnowledgeBase",
    "ParsedToken",
    "load_kb",
    "normalize",
    "parse_inci",
    "AnnotatedIngredient",
    "Report",
    "analyze",
    "SKIN_TYPES",
]
