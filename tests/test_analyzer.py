"""Tests for the skincare INCI engine."""

from __future__ import annotations

import pytest

from skincare import analyze, load_kb, parse_inci
from skincare.parser import normalize


@pytest.fixture(scope="module")
def kb():
    return load_kb()


# --------------------------------------------------------------------------- #
# Knowledge base sanity
# --------------------------------------------------------------------------- #
def test_kb_loads_and_is_substantial(kb):
    assert len(kb) >= 120
    assert kb.disclaimer  # non-empty educational disclaimer
    # Every declared function is in the vocabulary.
    vocab = set(kb.function_vocabulary)
    for ing in kb.ingredients:
        for fn in ing.functions:
            assert fn in vocab, f"{ing.inci} has out-of-vocab function {fn}"


# --------------------------------------------------------------------------- #
# A known ingredient is annotated with the correct function/flags
# --------------------------------------------------------------------------- #
def test_known_ingredient_annotation(kb):
    report = analyze("Salicylic Acid", skin_type="normal", kb=kb)
    assert report.recognized_count == 1
    sal = report.recognized[0].ingredient
    assert sal.inci == "Salicylic Acid"
    assert "exfoliant" in sal.functions
    assert sal.irritant is True
    assert sal.pregnancy_caution is True


def test_niacinamide_functions(kb):
    report = analyze("Niacinamide", skin_type="normal", kb=kb)
    ing = report.recognized[0].ingredient
    assert ing.inci == "Niacinamide"
    assert "barrier_repair" in ing.functions
    assert ing.comedogenic == 0
    assert ing.allergen is False


# --------------------------------------------------------------------------- #
# Synonym resolution
# --------------------------------------------------------------------------- #
def test_synonym_aqua_to_water(kb):
    tokens = parse_inci("aqua", kb)
    assert tokens[0].is_known
    assert tokens[0].ingredient.inci == "Aqua"


def test_synonym_tocopherol_to_vitamin_e(kb):
    # "tocopherol" is the INCI; "vitamin e" is a synonym -> same entry.
    via_inci = analyze("Tocopherol", kb=kb).recognized[0].ingredient
    via_syn = analyze("Vitamin E", kb=kb).recognized[0].ingredient
    assert via_inci.inci == "Tocopherol"
    assert via_syn.inci == "Tocopherol"
    assert "antioxidant" in via_inci.functions


def test_synonym_bha_to_salicylic(kb):
    report = analyze("BHA", kb=kb)
    assert report.recognized[0].ingredient.inci == "Salicylic Acid"


def test_label_noise_resolves(kb):
    # Concentration and parentheticals should not break resolution.
    report = analyze("Salicylic Acid 2%", kb=kb)
    assert report.recognized_count == 1
    assert report.recognized[0].ingredient.inci == "Salicylic Acid"


# --------------------------------------------------------------------------- #
# Comedogenic-heavy list: flagged for acne-prone, not for normal
# --------------------------------------------------------------------------- #
COMEDOGENIC_LIST = "Aqua, Coconut Oil, Isopropyl Myristate, Cocoa Butter, Glycerin"


def test_comedogenic_flagged_for_acne_prone(kb):
    report = analyze(COMEDOGENIC_LIST, skin_type="acne_prone", kb=kb)
    cautions = [w for w in report.warnings if w.severity == "caution"]
    assert cautions, "acne-prone skin should get a comedogenic caution"
    triggered = cautions[0].ingredients
    assert "Coconut Oil" in triggered
    assert "Isopropyl Myristate" in triggered
    assert "Cocoa Butter" in triggered


def test_comedogenic_not_flagged_for_normal(kb):
    report = analyze(COMEDOGENIC_LIST, skin_type="normal", kb=kb)
    cautions = [w for w in report.warnings if w.severity == "caution"]
    assert cautions == []


# --------------------------------------------------------------------------- #
# Fragranced product flagged for sensitive skin
# --------------------------------------------------------------------------- #
FRAGRANCED_LIST = "Aqua, Glycerin, Niacinamide, Fragrance, Limonene, Linalool"


def test_fragrance_flagged_for_sensitive(kb):
    report = analyze(FRAGRANCED_LIST, skin_type="sensitive", kb=kb)
    assert report.fragrance  # fragrance/essential oils detected
    fragrance_warnings = [
        w for w in report.warnings if "Fragrance" in w.ingredients or "fragrance" in w.message
    ]
    assert any(w.severity == "caution" for w in fragrance_warnings)


def test_fragrance_not_a_caution_for_normal(kb):
    report = analyze(FRAGRANCED_LIST, skin_type="normal", kb=kb)
    # Fragrance is still detected, but no caution is raised for normal skin.
    assert report.fragrance
    assert [w for w in report.warnings if w.severity == "caution"] == []


# --------------------------------------------------------------------------- #
# Unknown ingredients are reported, not silently dropped
# --------------------------------------------------------------------------- #
def test_unknown_reported(kb):
    report = analyze("Aqua, Unobtainium Extract, Glycerin", kb=kb)
    assert report.recognized_count == 2
    assert report.unknown == ["Unobtainium Extract"]
    assert report.total == 3  # nothing dropped


# --------------------------------------------------------------------------- #
# Function breakdown counts are correct on a known list
# --------------------------------------------------------------------------- #
def test_function_breakdown_counts(kb):
    # Aqua=solvent; Glycerin=humectant; Sodium Hyaluronate=humectant;
    # Phenoxyethanol=preservative.
    report = analyze("Aqua, Glycerin, Sodium Hyaluronate, Phenoxyethanol", kb=kb)
    fb = report.function_breakdown
    assert fb["solvent"] == 1
    assert fb["humectant"] == 2
    assert fb["preservative"] == 1


def test_function_breakdown_total_matches_known(kb):
    report = analyze("Aqua, Glycerin, Niacinamide", kb=kb)
    # Sum of all function counts >= number of recognised ingredients
    # (multi-function ingredients contribute more than once).
    total_fn = sum(report.function_breakdown.values())
    assert total_fn >= report.recognized_count


# --------------------------------------------------------------------------- #
# Pregnancy-caution actives surfaced
# --------------------------------------------------------------------------- #
def test_pregnancy_active_flagged(kb):
    report = analyze("Aqua, Retinol, Glycerin", skin_type="pregnancy", kb=kb)
    assert "Retinol" in report.pregnancy_actives
    assert any(
        w.severity == "caution" and "Retinol" in w.ingredients
        for w in report.warnings
    )


# --------------------------------------------------------------------------- #
# Parser / normalization details
# --------------------------------------------------------------------------- #
def test_parser_handles_mixed_separators(kb):
    tokens = parse_inci("Aqua; Glycerin\nNiacinamide, Squalane", kb)
    assert len(tokens) == 4
    assert all(t.is_known for t in tokens)


def test_normalize_strips_case_and_punctuation():
    assert normalize("  Aqua (Water) 100% ") == "aqua water"
    # Punctuation (incl. hyphens) becomes a space, so "l-ascorbic" -> "l ascorbic".
    assert normalize("L-Ascorbic Acid") == "l ascorbic acid"


def test_invalid_skin_type_raises(kb):
    with pytest.raises(ValueError):
        analyze("Aqua", skin_type="combination", kb=kb)
