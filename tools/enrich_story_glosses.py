#!/usr/bin/env python3
"""
Enrich EXTRA_READ_STORIES / READ_STORIES gloss maps from starter decks.
MED: aim for ~12–18 high-value keys per story; keep existing glosses;
prefer content words; never invent out-of-deck translations when deck has the form.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# High-frequency glue — skip unless already glossed (too noisy as solo chips)
GLUE = {
    "i", "a", "an", "the", "to", "of", "for", "in", "on", "at", "and", "or", "is", "am", "are",
    "be", "do", "did", "not", "no", "yes", "so", "as", "if", "by", "my", "me", "we", "he", "she",
    "it", "you", "your", "our", "their", "this", "that", "with", "from",
    "jeg", "du", "han", "hun", "vi", "de", "det", "en", "et", "ei", "og", "på", "av", "til",
    "med", "er", "som", "har", "hadde", "var", "være", "skal", "vil", "kan", "må", "meg", "deg",
    "seg", "oss", "dem", "min", "din", "sin", "vår", "deres", "den", "dette", "disse", "ikke",
    "ja", "nei", "jo", "da", "nå", "her", "der", "ut", "inn", "opp", "ned", "om", "over",
    "att", "och", "är", "jag", "ni", "sig", "ett", "man", "var", "vad", "hur", "när",
    "ich", "du", "er", "sie", "es", "wir", "ihr", "der", "die", "das", "den", "dem", "des",
    "ein", "eine", "einen", "einem", "einer", "und", "ist", "sind", "war", "mit", "von", "zu",
    "im", "am", "zum", "zur", "nicht", "auch", "noch", "schon", "nur", "aber", "oder", "wenn",
    "je", "tu", "il", "elle", "nous", "vous", "ils", "elles", "le", "la", "les", "un", "une",
    "des", "de", "du", "au", "aux", "et", "est", "sont", "pas", "ne", "qui", "que", "quoi",
    "el", "los", "las", "una", "unos", "unas", "y", "o", "es", "son", "no", "sí", "lo", "al",
    "del", "por", "para", "con", "sin", "como", "más", "muy",
    "io", "mi", "ti", "ci", "vi", "gli", "lo", "li", "le", "un", "uno", "una", "di", "da",
    "in", "su", "per", "con", "non", "che", "è", "sono", "ha", "ho",
    "ik", "je", "hij", "zij", "het", "een", "de", "het", "en", "van", "te", "op", "aan",
    "bij", "uit", "met", "niet", "ook", "nog", "wel", "als", "dan", "wat", "wie",
    "eu", "você", "ele", "ela", "nós", "eles", "elas", "o", "a", "os", "as", "um", "uma",
    "em", "no", "na", "do", "da", "dos", "das", "ao", "à", "é", "são", "não", "sim", "se",
    "ja", "ty", "on", "ona", "my", "wy", "oni", "one", "w", "z", "i", "oraz", "to", "się",
    "nie", "tak", "jest", "są", "być", "do", "na", "po", "za", "od", "u", "o", "że",
}


def tokenize(text: str) -> list[str]:
    return re.findall(
        r"[A-Za-zÀ-ÖØ-öø-ÿĄĆĘŁŃÓŚŹŻąćęłńóśźżÃÕÑÁÉÍÓÚÜÑãõñáéíóúü]+(?:['''][A-Za-zÀ-ÖØ-öø-ÿ]+)?",
        text,
    )


_PAIR_RE = re.compile(
    r'foreign:\s*["\']([^"\']+)["\']\s*,\s*native:\s*["\']([^"\']+)["\']'
)


def load_deck_map_nb() -> dict[str, str]:
    m: dict[str, str] = {}
    for path in ["norwegian-frequency-deck.js", "norwegian-reading-vocab.js"]:
        t = (ROOT / path).read_text(encoding="utf-8")
        for fm, nm in _PAIR_RE.findall(t):
            m[fm.strip().lower()] = nm.strip()
    return m


def load_deck_map_pack(path: Path) -> dict[str, str]:
    t = path.read_text(encoding="utf-8")
    cut = t.find("LANGUAGE_BASICS")
    body = t[:cut] if cut > 0 else t
    m: dict[str, str] = {}
    for fm, nm in _PAIR_RE.findall(body):
        m[fm.strip().lower()] = nm.strip()
    return m


def enrich_glosses(
    sentences: list[dict],
    glosses: dict[str, str],
    deck: dict[str, str],
    target: int = 22,
) -> dict[str, str]:
    out = dict(glosses)
    if len(out) >= target:
        # Still allow multi-word survival phrases below even when "full"
        pass

    full_text = " ".join(
        (s.get("foreign") or s.get("nb") or "") for s in sentences
    ).lower()

    # 1) Multi-word / hyphen deck phrases that appear in the story
    multi = sorted(
        (k for k in deck if " " in k or "-" in k),
        key=lambda k: (-len(k), k),
    )
    for key in multi:
        if len(out) >= target + 6:
            break
        if key not in full_text:
            continue
        if any(k.lower() == key for k in out):
            continue
        out[key] = deck[key]

    if len(out) >= target:
        return out

    # 2) Collect content tokens in order of first appearance
    seen: set[str] = set()
    candidates: list[str] = []
    for s in sentences:
        foreign = s.get("foreign") or s.get("nb") or ""
        for tok in tokenize(foreign):
            key = tok.lower()
            if key in seen:
                continue
            seen.add(key)
            if key in GLUE:
                continue
            if len(key) < 2:
                continue
            candidates.append(tok)

    # Prefer longer / less glue first for remaining slots
    candidates.sort(key=lambda t: (-len(t), t.lower()))

    for tok in candidates:
        if len(out) >= target:
            break
        key = tok.lower()
        # skip if already covered as exact key (case-insensitive)
        if any(k.lower() == key for k in out):
            continue
        if key not in deck:
            continue
        # Prefer surface casing from story when it's a proper-looking token
        gloss_key = tok if tok[:1].isupper() else key
        # avoid overwriting multi-word keys
        if gloss_key in out:
            continue
        out[gloss_key] = deck[key]

    return out


def format_js_glosses(glosses: dict[str, str], indent: str = "      ") -> str:
    lines = ["{"]
    items = list(glosses.items())
    for i, (k, v) in enumerate(items):
        # quote keys that need it
        if re.match(r"^[A-Za-zÀ-ÿ_æøåäöüßœçñ][\w'æøåäöüßœçñ]*$", k):
            key_js = k
        else:
            key_js = json.dumps(k, ensure_ascii=False)
        val_js = json.dumps(v, ensure_ascii=False)
        comma = "," if i < len(items) - 1 else ""
        lines.append(f"{indent}  {key_js}: {val_js}{comma}")
    lines.append(f"{indent}}}")
    return "\n".join(lines)


def enrich_nb() -> int:
    path = ROOT / "read-stories.js"
    text = path.read_text(encoding="utf-8")
    deck = load_deck_map_nb()
    changed = 0

    # Process each story block with glosses: { ... },
    pattern = re.compile(
        r"(id:\s*\"(nb-[^\"]+)\"[\s\S]*?sentences:\s*\[([\s\S]*?)\],\s*glosses:\s*)(\{[\s\S]*?\n    \})",
        re.M,
    )

    def repl(m: re.Match) -> str:
        nonlocal changed
        sid = m.group(2)
        sblock = m.group(3)
        gblock = m.group(4)
        sents = []
        for sm in re.finditer(
            r"\{\s*nb:\s*\"([^\"]*)\"\s*,\s*en:\s*\"([^\"]*)\"", sblock
        ):
            sents.append({"foreign": sm.group(1), "en": sm.group(2)})
        glosses = {}
        for gm in re.finditer(
            r"(?:\"([^\"]+)\"|([A-Za-zÀ-ÿæøåäöüßœçñ][\w'æøåäöüßœçñ]*))\s*:\s*\"([^\"]*)\"",
            gblock,
        ):
            k = gm.group(1) or gm.group(2)
            glosses[k] = gm.group(3)
        before = len(glosses)
        new_g = enrich_glosses(sents, glosses, deck, target=22)
        if new_g == glosses:
            return m.group(0)
        changed += 1
        new_block = format_js_glosses(new_g, indent="    ")
        # format_js_glosses uses 4-space base; match file "    glosses: {"
        return m.group(1) + new_block

    new_text, n = pattern.subn(repl, text)
    if changed:
        path.write_text(new_text, encoding="utf-8")
    return changed


def enrich_pack(path: Path) -> int:
    text = path.read_text(encoding="utf-8")
    if "EXTRA_READ_STORIES" not in text:
        return 0
    deck = load_deck_map_pack(path)
    # Extract JSON array
    m = re.search(
        r"(window\.EXTRA_READ_STORIES\.push\(\.\.\.)(\[[\s\S]*\])(\);)",
        text,
    )
    if not m:
        print("  skip parse", path.name)
        return 0
    try:
        stories = json.loads(m.group(2))
    except json.JSONDecodeError as e:
        print("  json error", path.name, e)
        return 0

    changed = 0
    for st in stories:
        sents = st.get("sentences") or []
        glosses = dict(st.get("glosses") or {})
        before = len(glosses)
        # normalize sentence keys to foreign
        norm = []
        for s in sents:
            norm.append(
                {
                    "foreign": s.get("foreign") or s.get("nb") or "",
                    "en": s.get("en") or "",
                }
            )
        new_g = enrich_glosses(norm, glosses, deck, target=22)
        if new_g != glosses:
            st["glosses"] = new_g
            changed += 1

    if not changed:
        return 0

    # Compact JSON like original (one story per readability — compact is fine)
    new_json = json.dumps(stories, ensure_ascii=False, separators=(",", ":"))
    new_text = text[: m.start(2)] + new_json + text[m.end(2) :]
    path.write_text(new_text, encoding="utf-8")
    return changed


def main() -> int:
    print("Enriching NB…")
    n = enrich_nb()
    print(f"  NB stories updated: {n}")

    total = 0
    for p in sorted((ROOT / "lang").glob("*-pack.js")):
        c = enrich_pack(p)
        print(f"  {p.name}: {c} stories enriched")
        total += c
    print(f"Pack stories enriched: {total}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
