# Leitner Learning — Agent Guide

This file is the product law for anyone (human or AI) working in this repository.
Read it before shipping. Prefer judgment over thrash.

**Live site:** https://leitnerlearning.com  
**Repo:** github.com/leitnerlearning/leitnerlearning  
**Stack:** static SPA (HTML/CSS/JS), GitHub Pages, no account required, data in `localStorage`

---

## North star

**Trust + clarity + craft.**  
The serious, beautiful way to actually learn a language — not noisy gamification.

We sell:
- Exact correct forms (no false “Looks good”)
- Calm, readable UX
- Real high-frequency decks (1,000 unique cards per language)
- Stories that sound like people
- Safety (including photosensitive-friendly motion)

We do **not** sell: streak guilt, gem shops, leaderboard theater, or AI that invents “correct” answers.

---

## Product spine (what exists)

| Area | Intent |
|------|--------|
| **Review** | Leitner SRS; type/speak; direction toggle L2↔EN |
| **Library** | Full deck, add/edit/delete, Check card, filters, live **N cards** count |
| **Read** | Trail difficulties (green → double-black); natural dialogue stories |
| **Progress** | Boxes, reading stats, Basics modal, voice gender |
| **Portal** | Welcome ceremony (music/flag); no seizure-risk flashes |

**Languages (each ~1,000 unique starter cards):**  
Norwegian (nb), Swedish, Danish, German, French, Spanish, Italian, Dutch, Portuguese (Brazil standard), Polish.

---

## Hard rules (non-negotiable)

### Correctness
- Teach **exact correct forms** only.
- Never mark wrong L2 as LOOKS GOOD.
- Soft-accept **major orthographic variants** of the *same* word (e.g. BE/AE English, German ß/ss, EP→BR Portuguese clusters) — not false friends or different lemmas.
- Library Check: strong match required for LOOKS GOOD; Save Anyway is OK for the user.

### Content quality
- No placeholder junk (`woche 1`, `fr-extra-976`, `kapitel 3`, etc.).
- Starter decks target **1,000 unique** foreign forms per language.
- Read stories: clear L2 title + English subtitle, natural dialogue, glosses, 3 stories per trail × 4 trails when using the standard ladder.
- Prefer school/standard variety + matching flag (e.g. Portuguese = **Brazil**, label “Portuguese”, 🇧🇷, `pt-BR`).

### UX
- **Quiet chrome.** No hover `title` tooltips that restate visible labels (we removed them on purpose).
- Flag can replace written language name where the flag is already shown (e.g. Read story bar).
- Keep `aria-label`s for accessibility; do not reintroduce mouse tooltips for “helpfulness.”
- Prefer discovery by use over instructional popups.
- **Subtraction over addition.** Prefer removing restated copy, duplicate progress chrome, and empty-state marketing. One status surface per fact (e.g. theme set progress in the Review strip only — not also under the prompt).

### Safety & motion
- Photosensitive-safe: soft motion only; no full-screen strobes.
- Respect `prefers-reduced-motion` where relevant.

### Languages
- Prefer **Latin-script** languages with solid LanguageTool + MT + TTS.
- Do **not** add CJK / complex-script languages without explicit founder approval and a quality plan.
- Nordic languages: keep with honest Check strength (`spell` where grammar is thin) — do not delete for weak LT.

---

## Autonomy charter (decentralized control)

### Ship alone (no need to wait)
- Bug fixes, UX polish, content quality within existing languages
- Deck/story/Basics improvements under hard rules
- Cache version bumps (`app.js?v=`, `styles.css?v=`, pack `?v=`)
- Commits + push to `main` with clear messages
- Small design tweaks consistent with quiet craft
- Opening/updating GitHub Issues or Linear items for tracked work
- Draft Notion/Drive notes when asked or when documenting decisions

### Ask first
- **New language** or major new learning category
- Paid services, Stripe, auth, backend, user accounts
- Public posts or email **as the founder**
- Destructive git (force-push, history rewrite) or wiping user data models
- Final logo / brand lock (propose freely; founder blesses)
- Anything that changes the product’s moral center (e.g. “AI grades freeform L2 as correct”)

### Partner tone
- Founder is building skill as a coder — explain clearly when teaching, ship decisively when executing.
- Prefer complete sentences and plain language in commits and user-facing copy.
- One focused change set > drive-by refactors.

---

## Engineering conventions

### Layout
- `index.html`, `app.js`, `styles.css` — main app
- `lang/*-pack.js` — STARTER_DECKS + LANGUAGE_BASICS + EXTRA_READ_STORIES
- `norwegian-frequency-deck.js` + `norwegian-reading-vocab.js` — NB 500+500
- `learning-categories.js` — language registry (speechLang, checkStrength, flags)
- `read-stories.js` — Norwegian READ_STORIES + trail helpers
- `mini-packs.js` — opt-in thematic packs (e.g. Airport & travel)
- `tools/` — generation/cleanup scripts (not required at runtime)

### Shipping checklist
1. Change code/content.
2. Bump cache query strings for every touched static asset.
3. Sanity-check: unique deck counts, no junk patterns, structure (`{}` balance) for packs.
4. Commit with a complete-sentence message (what + why).
5. `git push origin main` (GitHub Pages).

### Library deck count
- `#deck-count` shows **live** `deck.length` as “N cards” (user’s deck, not a fixed marketing number).

### Speech / voices
- Prefer school-region tags (`pt-BR`, `de-DE`, etc.).
- Prefer neural/premium system voices; gender toggle is user preference.

---

## Design direction (craft)

- Calm surfaces, strong typography, minimal chrome.
- Trail marks: ski-run metaphor (green-circle → double-black-diamond).
- Brand motion: portal ceremony is special; never flash-heavy.
- Visual experiments (Imagine/Canva) → **implement winners as SVG/CSS** in production (avoid soft AI mush in UI chrome).
- Next craft priorities when free: identity kit, story covers, calm finish states, share cards — without breaking quiet UX.

---

## Learning algorithm (SRS + introduction order)

- **Leitner intervals** stay: boxes 1→6 with 0 / 1 / 3 / 7 / 14 / 30 day steps; wrong answers demote to box 1.
- **Due reviews always before new cards** in the daily queue.
- **Early “hook mix”** (first ~40 introductions): interleave high-frequency *glue* (pronouns, articles, particles) with *hooks* (phrases + mid-rank content words). Pure rank-1-only order is coverage-optimal but demotivating and brutal for isolated connectors (et/a/the). Aligns with formulaic-sequence / usage-based practice.
- **Glue recognition-first**: weak glue cards (new / boxes 1–2) practice **L2→EN** even if the user toggle is EN→L2. Exact production waits until the form is less brittle.
- **Post-wrong context**: on miss/reveal, when a Read story uses the word, show that short L2 line + English under the answer pill.
- **Later spice**: after the hook phase, small random pulls from slightly ahead of the frequency frontier.
- Daily goal remains a **small bite** (cap 10–30, default 20) — never dump the whole unpaid mountain into the UI.
- Exact-form checking stays strict; soft-accept only true orthographic variants, not wrong articles.

## Content expansion priorities

1. Quality of existing 10 languages (lemmas vs noise, story naturalness).  
2. More **phrases** and concrete hooks in ranks ~36–260 (feeds early mix).  
3. Thematic mini-packs (Airport, Café, Campus, Doctor, Housing, Work, Shopping, Social) — **opt-in** from Library → Themes; never auto-dump into day one. Packs aim for **unique foreign forms across packs** (merge still de-dupes). Enabled packs get ranks 1001+ and a small daily intro bias after the hook phase. Library **Themes** filter + per-pack chips; after Add, focus that pack and offer **Study now**. Progress Themes glance + **Study** (cap ~12). Misses prefer **Read story → pack/phrase example → simple theme template → pack label**.  
4. New full language only after LT/TTS/content research + founder OK.

---

## External tools (founder-connected)

Use when helpful; do not spam:

| Tool | Use for |
|------|---------|
| **GitHub** | Code, PRs, issues |
| **Linear** | Backlog / P0–P1 execution |
| **Notion** | Product notes, longer specs |
| **Canva** | Marketing/layout experiments |
| **Google Drive** | Shared QA docs |
| **Gmail / Calendar** | Only when the task needs them |
| **Vercel** | Optional deploy experiments; primary site is GitHub Pages |
| **Grok Imagine** | Moodboards, icons, covers → hand into sharp assets |

Grok.com skill **Leitner Learning Product Partner** encodes the same judgment for chat sessions.

---

## Anti-goals

- Fake engagement metrics and dark patterns  
- Expanding language count for screenshots  
- LLM-as-oracle for student correctness in the client  
- Reintroducing tooltip clutter  
- “Week N / extra-N” filler cards  

---

## When unsure

1. Does this increase **trust** or only **noise**?  
2. Would a tired student understand it without a tutorial?  
3. Can we ship a smaller slice that preserves the spine?

If still unsure on a hard-rule boundary → ask the founder.  
If it’s craft within the spine → ship.

---

*Last updated: Phase 0 product law — autonomous partnership enabled.*
