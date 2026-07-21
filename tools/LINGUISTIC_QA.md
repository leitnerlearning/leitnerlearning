# Linguistic QA status

Mechanical structure (`python3 tools/content_audit.py`) is **not** linguistic certification.

| Language | Structure | Linguistic QA | Notes |
|----------|-----------|---------------|--------|
| Norwegian (nb-bokmal) | PASS | **IN PROGRESS** | POS honesty; top-250 gloss/POS fixes; survival swaps (`liker`, `mamma`, `vær så snill`); airport pack; stories EN polish (2026-07-21) |
| Swedish | PASS | OPEN | |
| Danish | PASS | OPEN | |
| German | PASS | OPEN | |
| French | PASS | OPEN | |
| Spanish | PASS | OPEN | |
| Italian | PASS | OPEN | |
| Dutch | PASS | OPEN | |
| Portuguese | PASS | OPEN | |
| Polish | PASS | OPEN | |

## Norwegian pass checklist

- [x] Mechanical 1000 + 200 + 12 stories
- [x] POS honesty pass (closed-class tags; not everything `noun`)
- [x] Top-200: remove weak items (`hval`, `slipper unna`); add `liker`, `mamma`, `vær så snill`
- [x] Fix `ved` gloss (no false “know”)
- [x] Airport pack: train platform/track → gate / baggage carousel
- [x] Stories: light EN polish (housing dialogue)
- [x] Ranks 201–250 POS/gloss fixes (`siden`, adjectives)
- [x] Batch adjective/verb retag across 1–1000
- [ ] Ranks 251–500 human gloss sweep (remaining)
- [ ] Ranks 501–1000 reading vocab sweep
- [ ] All 10 thematic packs gloss sweep (airport done)
- [ ] All 12 stories L2 naturalness read-aloud
- [ ] Mark **CLOSED** only after full checklist

## Ship rule

Do **not** market “every translation verified” until a language row is **CLOSED**.
