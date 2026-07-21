# Linguistic QA status

Mechanical structure (`python3 tools/content_audit.py`) is **not** the same as linguistic certification.

| Language | Structure | Linguistic QA | Notes |
|----------|-----------|---------------|--------|
| Norwegian (nb-bokmal) | PASS | **PASS 2 COMPLETE** (spine certified for ship-trust) | Full POS honesty; top-1000 gloss/POS sweep; 10 packs polished; 12 stories L2/EN pass. Open only for future continuous improvement. |
| Swedish | PASS | OPEN | Next language after NB closed for product claims |
| Danish | PASS | OPEN | |
| German | PASS | OPEN | |
| French | PASS | OPEN | |
| Spanish | PASS | OPEN | |
| Italian | PASS | OPEN | |
| Dutch | PASS | OPEN | |
| Portuguese | PASS | OPEN | |
| Polish | PASS | OPEN | |

## Norwegian — closed checklist (pass 2)

- [x] Mechanical 1000 + 200 + 12 stories
- [x] POS honesty (pronoun/verb/preposition/adjective/adverb/phrase — not all `noun`)
- [x] Top-200 survival: `liker`, `mamma`, `vær så snill`; drop weak fillers
- [x] Critical glosses: `ved`, `siden`, `reker` (was `rekker`), `list`, etc.
- [x] Ranks 201–1000 POS batch + targeted gloss fixes
- [x] Airport pack: gate / bagasjebånd (not train platform)
- [x] All 10 NB thematic packs: 20 each; gloss polish (Dining…Money)
- [x] 12 stories: L2 naturalness (`kommet frem`, `Ikke noe problem`, housing line) + EN polish
- [x] Unique foreign forms still 1000; packs 200; no structure regression

## Ship rule

- **Norwegian:** trustworthy for “exact forms” product claim on the live spine.
- **Other languages:** structure only until their row is certified the same way.
- Continuous improvement always welcome; do not re-open thrash without a named defect.

## How to re-verify

```bash
python3 tools/content_audit.py
# expect: All languages PASS mechanical structure
```
