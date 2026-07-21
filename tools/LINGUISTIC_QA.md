# Linguistic QA status

Mechanical structure (`python3 tools/content_audit.py`) is **not** the same as linguistic certification.

| Language | Structure | Linguistic QA | Notes |
|----------|-----------|---------------|--------|
| Norwegian (nb-bokmal) | PASS | **PASS 2 COMPLETE** (spine certified for ship-trust) | Full POS honesty; top-1000 gloss/POS sweep; 10 packs polished; 12 stories L2/EN pass. Open only for future continuous improvement. |
| Swedish | PASS | **PASS 1 COMPLETE** (spine certified for ship-trust) | POS honesty; weak top-100 replaced; gloss fixes; packs + 12 stories polished 2026-07-21 |
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

## Swedish — pass 1 checklist

- [x] Mechanical 1000 + 200 + 12 stories
- [x] POS honesty (not all `noun`)
- [x] Drop weak early fillers (`mörkt läge`, `logga in/ut`, cover-letter noise)
- [x] Add survival: `hejdå`, `var snäll`, `dålig`, `polisen`, `goddag`, `länge`, `sällan`, …
- [x] Gloss fixes (`vår`, `var`, `man`, …)
- [x] Thematic packs polish (Swish/BankID culture kept; awkward compounds cleaned)
- [x] 12 EXTRA stories light L2/EN polish
- [x] Unique forms still 1000

## Ship rule

- **Norwegian + Swedish:** trustworthy for “exact forms” on the live spine.
- **Other 8 languages:** structure only until certified the same way.
- Continuous improvement always welcome; do not re-open thrash without a named defect.
- **Next:** Danish (closest to NB/SV) or Spanish/German by demand.

## How to re-verify

```bash
python3 tools/content_audit.py
# expect: All languages PASS mechanical structure
```
