#!/usr/bin/env python3
"""
Content integrity audit for Leitner Learning.

This does NOT prove every translation is correct - it proves structure and
detects mechanical failure modes. Human / Grok linguistic QA is still required.

Run from repo root:
  python3 tools/content_audit.py
"""
from __future__ import annotations

import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LANGS = [
    ("nb-bokmal", "Norwegian"),
    ("sv", "Swedish"),
    ("da", "Danish"),
    ("de", "German"),
    ("fr", "French"),
    ("es", "Spanish"),
    ("it", "Italian"),
    ("nl", "Dutch"),
    ("pt", "Portuguese"),
    ("pl", "Polish"),
]

JUNK_RE = re.compile(
    r"(fr-extra-\d+|woche\s*\d+|kapitel\s*\d+|placeholder|TODO:|xxx{2,}|"
    r"lorem ipsum|test-card|undefined|null\b)",
    re.I,
)


def extract_quoted_fields(text: str, field: str) -> list[str]:
    # single- or double-quoted JS object fields (keep UTF-8 as written)
    pat = rf"{field}:\s*(['\"])((?:\\.|(?!\1).)*)\1"
    out = []
    for m in re.finditer(pat, text):
        raw = m.group(2)
        # Unescape common JS string sequences without breaking UTF-8 (å/ä/ö).
        raw = (
            raw.replace(r"\\", "\\")
            .replace(r"\'", "'")
            .replace(r'\"', '"')
            .replace(r"\n", "\n")
        )
        out.append(raw)
    return out


def extract_ranks(text: str) -> list[int]:
    return [int(x) for x in re.findall(r"rank:\s*(\d+)", text)]


def load_nb_core() -> list[dict]:
    cards = []
    for path, offset_note in [
        (ROOT / "norwegian-frequency-deck.js", "core"),
        (ROOT / "norwegian-reading-vocab.js", "reading"),
    ]:
        text = path.read_text(encoding="utf-8")
        foreigns = extract_quoted_fields(text, "foreign")
        natives = extract_quoted_fields(text, "native")
        ranks = extract_ranks(text)
        for i, foreign in enumerate(foreigns):
            cards.append(
                {
                    "foreign": foreign,
                    "native": natives[i] if i < len(natives) else "",
                    "rank": ranks[i] if i < len(ranks) else None,
                    "source": offset_note,
                }
            )
    return cards


def load_lang_pack(lang_id: str) -> list[dict]:
    if lang_id == "nb-bokmal":
        return load_nb_core()
    path = ROOT / "lang" / f"{lang_id}-pack.js"
    if lang_id == "nb-bokmal":
        path = None
    # file names: sv-pack.js etc; nb is special
    file_id = lang_id if lang_id != "nb-bokmal" else None
    if file_id is None:
        return load_nb_core()
    path = ROOT / "lang" / f"{file_id}-pack.js"
    text = path.read_text(encoding="utf-8")
    foreigns = extract_quoted_fields(text, "foreign")
    natives = extract_quoted_fields(text, "native")
    ranks = extract_ranks(text)
    cats = extract_quoted_fields(text, "category")
    cards = []
    for i, foreign in enumerate(foreigns):
        cards.append(
            {
                "foreign": foreign,
                "native": natives[i] if i < len(natives) else "",
                "rank": ranks[i] if i < len(ranks) else None,
                "category": cats[i] if i < len(cats) else "",
            }
        )
    return cards


def load_mini_pack_counts() -> dict[str, int]:
    mp = (ROOT / "mini-packs.js").read_text(encoding="utf-8")
    out: dict[str, int] = {}
    for lang_id, _ in LANGS:
        key = lang_id
        blocks = re.findall(
            rf'byCategory\["{re.escape(key)}"\]\s*=\s*buildEntries\(\[(.*?)\]\s*\)',
            mp,
            re.S,
        )
        total = 0
        for block in blocks:
            total += len(re.findall(r"\[['\"]", block))
        out[lang_id] = total
    return out


def load_story_counts() -> dict[str, dict]:
    result: dict[str, dict] = {}
    # Norwegian primary file
    rs = (ROOT / "read-stories.js").read_text(encoding="utf-8")
    nb_trails = Counter(re.findall(r'trail:\s*"([^"]+)"', rs))
    result["nb-bokmal"] = {
        "stories": len(re.findall(r'id:\s*"nb-', rs)),
        "trails": dict(nb_trails),
    }
    for lang_id, _ in LANGS:
        if lang_id == "nb-bokmal":
            continue
        path = ROOT / "lang" / f"{lang_id}-pack.js"
        text = path.read_text(encoding="utf-8")
        m = re.search(r"EXTRA_READ_STORIES\.push\(\.\.\.(\[.*\])\)\s*;", text, re.S)
        if not m:
            result[lang_id] = {"stories": 0, "trails": {}}
            continue
        try:
            arr = json.loads(m.group(1))
        except json.JSONDecodeError:
            result[lang_id] = {"stories": -1, "trails": {}, "error": "json"}
            continue
        trails = Counter(s.get("trail") for s in arr)
        result[lang_id] = {"stories": len(arr), "trails": dict(trails)}
    return result


def audit_cards(lang_id: str, label: str, cards: list[dict]) -> dict:
    foreigns = [
        " ".join(c["foreign"].split()) for c in cards if c.get("foreign")
    ]
    natives = [c.get("native", "").strip() for c in cards]
    ranks = [c["rank"] for c in cards if c.get("rank") is not None]
    uniq = set(f.casefold() for f in foreigns)
    junk = [f for f in foreigns if JUNK_RE.search(f)]
    empty_native = sum(1 for n in natives if not n)
    cats = Counter(c.get("category") or "?" for c in cards)
    missing_ranks = []
    if ranks:
        rset = set(ranks)
        # expect 1..1000 continuous for starter
        missing_ranks = [r for r in range(1, 1001) if r not in rset]
    return {
        "lang": lang_id,
        "label": label,
        "count": len(foreigns),
        "unique": len(uniq),
        "dupes": len(foreigns) - len(uniq),
        "junk": junk[:10],
        "junk_count": len(junk),
        "empty_native": empty_native,
        "rank_min": min(ranks) if ranks else None,
        "rank_max": max(ranks) if ranks else None,
        "missing_ranks_1_1000": len(missing_ranks),
        "category_top": cats.most_common(4),
        "ok_structure": (
            len(foreigns) == 1000
            and len(uniq) == 1000
            and empty_native == 0
            and len(junk) == 0
            and len(missing_ranks) == 0
        ),
    }


def main() -> int:
    print("Leitner Learning - content structure audit")
    print("=" * 60)
    print(
        "NOTE: Passing structure checks ≠ linguistic correctness.\n"
        "Translation naturalness and story quality need a separate QA pass.\n"
    )

    pack_counts = load_mini_pack_counts()
    stories = load_story_counts()
    failures = []

    for lang_id, label in LANGS:
        cards = load_lang_pack(lang_id)
        report = audit_cards(lang_id, label, cards)
        packs_n = pack_counts.get(lang_id, 0)
        st = stories.get(lang_id, {})
        print(f"\n{label} ({lang_id})")
        print(
            f"  Core cards: {report['count']} total, {report['unique']} unique, "
            f"dupes={report['dupes']}, empty_native={report['empty_native']}"
        )
        print(
            f"  Ranks: {report['rank_min']}–{report['rank_max']}, "
            f"missing 1–1000 slots: {report['missing_ranks_1_1000']}"
        )
        print(f"  Packs (thematic): {packs_n} entries (target 200)")
        print(
            f"  Stories: {st.get('stories')} | trails={st.get('trails')}"
        )
        print(f"  Categories: {report['category_top']}")
        if report["junk_count"]:
            print(f"  JUNK hits ({report['junk_count']}): {report['junk']}")
        structural_ok = (
            report["ok_structure"]
            and packs_n == 200
            and st.get("stories") == 12
        )
        print(f"  Structure gate: {'PASS' if structural_ok else 'FAIL'}")
        if not structural_ok:
            failures.append(lang_id)
        # Linguistic QA is always OPEN until a signed pass exists
        print("  Linguistic QA: OPEN (not certified)")

    print("\n" + "=" * 60)
    print("Totals expected per language: 1000 core + 200 pack = 1200 teachable forms")
    print("Stories expected: 12 (3 per trail × 4 trails)")
    if failures:
        print(f"Structure failures: {', '.join(failures)}")
        return 1
    print("All languages PASS mechanical structure.")
    print("Do NOT ship as 'translations verified' until linguistic QA closes.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
