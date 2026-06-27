"""Demo: analyse a few real-world-style INCI lists for different skin types.

Run:  python demo.py

All output is produced live by the engine in ``skincare/`` over the committed
knowledge base in ``data/ingredients.json``. Educational only, not medical advice.
"""

from __future__ import annotations

from skincare import analyze, load_kb

# Real-world-style ingredient lists (lightly trimmed back-of-bottle decks).
SAMPLES = [
    (
        "Hydrating gel-cream",
        "sensitive",
        "Aqua, Glycerin, Niacinamide, Sodium Hyaluronate, Panthenol, "
        "Centella Asiatica Extract, Squalane, Allantoin, Dimethicone, "
        "Xanthan Gum, Disodium EDTA, Phenoxyethanol, Ethylhexylglycerin, "
        "Fragrance, Limonene, Linalool",
    ),
    (
        "Rich repair night balm",
        "acne_prone",
        "Aqua, Coconut Oil, Cocoa Butter, Isopropyl Myristate, Cetyl Alcohol, "
        "Glyceryl Stearate, Shea Butter, Tocopherol, Glycerin, "
        "Phenoxyethanol, Parfum",
    ),
    (
        "Anti-aging treatment serum",
        "pregnancy",
        "Aqua, Glycerin, Retinol, Bakuchiol, Niacinamide, "
        "Palmitoyl Pentapeptide-4, Squalane, Tocopheryl Acetate, "
        "Sodium Hyaluronate, Phenoxyethanol",
    ),
    (
        "Foaming acne cleanser",
        "dry",
        "Aqua, Sodium Laureth Sulfate, Cocamidopropyl Betaine, Salicylic Acid, "
        "Glycerin, Tea Tree Oil, Menthyl Lactate, Sodium Chloride, "
        "Citric Acid, Sodium Benzoate",
    ),
]


def line(char: str = "-", n: int = 72) -> str:
    return char * n


def render(title: str, report) -> None:
    print(line("="))
    print(f"  {title}   |   skin type: {report.skin_type}")
    print(line("="))
    print("Annotated breakdown:")
    for ai in report.recognized:
        flags = []
        if ai.comedogenic >= 3:
            flags.append(f"comedogenic {ai.comedogenic}/5")
        if ai.ingredient.irritant:
            flags.append("irritant")
        if ai.ingredient.allergen:
            flags.append("allergen")
        if ai.ingredient.pregnancy_caution:
            flags.append("pregnancy-caution")
        flag_str = f"  <{'; '.join(flags)}>" if flags else ""
        fns = ", ".join(ai.functions)
        print(f"  - {ai.inci:<32} [{fns}]{flag_str}")
    if report.unknown:
        print(f"Unknown (not in KB): {', '.join(report.unknown)}")
    print()
    print("Function breakdown:")
    for fn, n in sorted(
        report.function_breakdown.items(), key=lambda kv: (-kv[1], kv[0])
    ):
        print(f"  {fn:<16} {n}")
    print()
    if report.warnings:
        print("Warnings:")
        for w in report.warnings:
            print(f"  {w}")
    else:
        print("Warnings: none")
    print()
    print("Summary:")
    print(f"  {report.summary()}")
    print()


if __name__ == "__main__":
    kb = load_kb()
    print(f"Knowledge base: {len(kb)} ingredients loaded from data/ingredients.json")
    print(f"Disclaimer: {kb.disclaimer}")
    print()
    for title, skin_type, deck in SAMPLES:
        render(title, analyze(deck, skin_type=skin_type, kb=kb))
