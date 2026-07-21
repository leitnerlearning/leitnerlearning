# Linguistic QA status

Mechanical structure (`python3 tools/content_audit.py`) is **not** the same as linguistic certification.

| Language | Structure | Linguistic QA | Notes |
|----------|-----------|---------------|--------|
| Norwegian (nb-bokmal) | PASS | **PASS 2 COMPLETE** (spine certified for ship-trust) | Full POS honesty; top-1000 gloss/POS sweep; 10 packs polished; 12 stories L2/EN pass. Open only for future continuous improvement. |
| Swedish | PASS | **PASS 1 COMPLETE** (spine certified for ship-trust) | POS honesty; weak top-100 replaced; gloss fixes; packs + 12 stories polished 2026-07-21 |
| Danish | PASS | **PASS 1 COMPLETE** (spine certified for ship-trust) | POS honesty; weak top-100 replaced; survival adds; packs + 12 stories polished 2026-07-21 |
| German | PASS | **PASS 1 COMPLETE** (spine certified for ship-trust) | POS honesty; weak fillers out; groß/klein/schlecht early; packs + 12 stories 2026-07-21 |
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

## Danish — pass 1 checklist

- [x] Mechanical 1000 + 200 + 12 stories
- [x] POS honesty (not all `noun`)
- [x] Drop weak early fillers (dark mode, log ind/ud, cover letter, lost keys, …)
- [x] Add survival: `farvel`, `vær sød`, `dårlig`, `politiet`, `sød`, `middag`, `sjældent`, …
- [x] Gloss fixes (`ved`, `var`, `tog`/`tag`, …)
- [x] Packs polish (Rejsekort/MobilePay/Dankort culture; airport told not double carousel)
- [x] 12 stories light polish
- [x] Unique forms still 1000

## German — pass 1 checklist

- [x] Mechanical 1000 + 200 + 12 stories
- [x] POS honesty (not all `noun`)
- [x] Drop weak early fillers (lost keys, gym membership, unavailable)
- [x] Add survival adjectives early: `groß`, `klein`, `schlecht`
- [x] Gloss fixes (`sie`, `weiß`, `sein`, `ihr`, …)
- [x] Packs polish (Gate/Gepäckband; Pläne; Angebot)
- [x] 12 stories light EN polish
- [x] Unique forms still 1000

## Ship rule

- **NB + SV + DA + DE:** trustworthy for “exact forms” on certified spines.
- **Other 6 languages:** structure only until certified the same way.
- Continuous improvement always welcome; do not re-open thrash without a named defect.
- **Next:** Spanish (large market) or French.

## How to re-verify

```bash
python3 tools/content_audit.py
# expect: All languages PASS mechanical structure
```
