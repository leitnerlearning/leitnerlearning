# Linguistic QA status

Mechanical structure (`python3 tools/content_audit.py`) is **not** the same as linguistic certification — but both are now green for all 10 languages at **PASS 1** (NB at PASS 2).

| Language | Structure | Linguistic QA | Notes |
|----------|-----------|---------------|--------|
| Norwegian (nb-bokmal) | PASS | **PASS 2 COMPLETE** | Full spine; packs; stories |
| Swedish | PASS | **PASS 1 COMPLETE** | POS; survival; packs; stories |
| Danish | PASS | **PASS 1 COMPLETE** | POS; survival; packs; stories |
| German | PASS | **PASS 1 COMPLETE** | POS; survival; packs; stories |
| Spanish | PASS | **PASS 1 COMPLETE** | POS; survival; packs; stories |
| French | PASS | **PASS 1 COMPLETE** | POS; survival; packs; stories |
| Italian | PASS | **PASS 1 COMPLETE** | POS; survival; packs; stories |
| Dutch | PASS | **PASS 1 COMPLETE** | POS; survival; packs; stories |
| Portuguese | PASS | **PASS 1 COMPLETE** | BR standard; POS; packs; stories |
| Polish | PASS | **PASS 1 COMPLETE** | POS; zła/przepraszam; packs; stories |

## Polish — pass 1 checklist

- [x] Mechanical 1000 + 200 + 12 stories
- [x] POS honesty (not all `noun`)
- [x] Drop login/logout fillers; add `zła`, `przepraszam bardzo`, `proszę pana`, `pies`, `kot`
- [x] Gloss fixes (`być`, `mieć`, `w`/`na`/`z`, aspect-aware go verbs, …)
- [x] Packs polish (BLIK, grupa czatu, zniżka)
- [x] 12 stories light EN polish
- [x] Unique forms still 1000; fixed broken `o` gloss

## Ship rule

- **All 10 languages:** structure PASS + linguistic PASS 1 (NB PASS 2).
- Continuous improvement always welcome; re-open a language only for a **named defect**.
- Do not thrash certified decks without evidence.

## How to re-verify

```bash
python3 tools/content_audit.py
# expect: All languages PASS mechanical structure
```
