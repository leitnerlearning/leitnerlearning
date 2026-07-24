# Leitner Learning - Agent Guide

This file is the product law for anyone (human or AI) working in this repository.
Read it before shipping. Prefer judgment over thrash.

**Live site:** https://leitnerlearning.com  
**Repo:** github.com/leitnerlearning/leitnerlearning  
**Stack:** static SPA (HTML/CSS/JS), GitHub Pages, no account required, data in `localStorage`

---

## North star

**Trust + clarity + craft + beauty.**  
The serious, beautiful way to actually learn a language - not noisy gamification.

We sell:
- Exact correct forms (no false “Looks good”)
- Calm, **beautiful**, readable UX (proportion and quiet life - not toy chrome, not sterile gray)
- Real high-frequency decks (1,000 unique cards per language)
- Stories that sound like people
- Safety (including photosensitive-friendly motion)

We do **not** sell: streak guilt, gem shops, leaderboard theater, or AI that invents “correct” answers.

**Beauty is essential** (philosophy + nature + craft): wholeness, harmony, clarity - the result of subtraction *and* composition. Empty is not enough; resolved and alive is the bar.

---

## Product spine (what exists)

| Area | Intent |
|------|--------|
| **Review** | Leitner SRS; type/speak; direction toggle L2↔EN |
| **Cards** (tab id `cards`) | Full deck, add/edit/delete, Check card, filters; live **N cards** as sole panel heading |
| **Stories** (tab id `read`) | Trail difficulties (green → double-black); natural dialogue stories |
| **Progress** | Boxes, reading stats, Basics modal, voice gender |
| **Portal** | Welcome ceremony (music/flag); no seizure-risk flashes |

**Languages (each ~1,000 unique starter cards):**  
Norwegian (nb), Swedish, Danish, German, French, Spanish, Italian, Dutch, Portuguese (Brazil standard), Polish.

---

## Hard rules (non-negotiable)

### Correctness
- Teach **exact correct forms** only.
- Never mark wrong L2 as LOOKS GOOD.
- Soft-accept **major orthographic variants** of the *same* word (e.g. BE/AE English, German ß/ss, EP→BR Portuguese clusters) - not false friends or different lemmas.
- Cards Check: strong match required for LOOKS GOOD (multi-word needs both EN↔L2); Save Anyway is OK for the user.

### Content quality
- No placeholder junk (`woche 1`, `fr-extra-976`, `kapitel 3`, etc.).
- Starter decks target **1,000 unique** foreign forms per language.
- Stories: clear L2 title + English subtitle, natural dialogue, glosses, 3 stories per trail × 4 trails when using the standard ladder.
- Prefer school/standard variety + matching flag (e.g. Portuguese = **Brazil**, label “Portuguese”, 🇧🇷, `pt-BR`).

### UX
- **Quiet chrome.** No hover `title` tooltips that restate visible labels (we removed them on purpose).
- Flag can replace written language name where the flag is already shown (e.g. Stories bar).
- Keep `aria-label`s for accessibility; do not reintroduce mouse tooltips for “helpfulness.”
- Prefer discovery by use over instructional popups.
- **Subtraction over addition.** Prefer removing restated copy, duplicate progress chrome, and empty-state marketing. One status surface per fact (e.g. theme set progress in the Review strip only - not also under the prompt).

### Platform bar (agent owns — founder cannot test every device)
The founder has a small device set (e.g. MacBook, iPhone, iPad) and limited time. **Agents must proactively guard cross-browser and cross-device integrity** after layout, scroll, or chrome changes — do not wait for a report from every surface.

**Standing scroll model (2026-07):**
- `html` = fixed viewport shell (`height: 100dvh; overflow: hidden`)
- `body` = **the** page scrollport (`overflow-y: auto`) so **Safari Mac trackpad** and keyboard share one path
- Do **not** put vertical page scroll only on `html` (trackpad fails, spacebar still “works”)
- Do **not** use `overflow-x: clip` on `html`/`body` (WebKit can refuse vertical scroll)
- Cards / Progress long pages: content grows `body`; sticky Library jump is relative to `body`
- Measure scroll with `getPageScrollY()` / listen on `body` + `window`, not `window.scrollY` alone

**Touch / iOS / iPad / Android (code-level bar):**
- Text inputs **≥ 16px** font-size (iOS/iPadOS focus zoom). iPad often hits “desktop” width CSS — still needs 16px
- Prefer **≥ 44px** min-height for primary controls when `(pointer: coarse)` (fingers on “wide” layouts)
- Keep `viewport-fit=cover` + `env(safe-area-inset-*)` on fixed chrome and bottom docks
- Nested scroll (e.g. mobile Stories sentence) needs a full flex chain: `app → main → panel → …` with `min-height: 0`
- After changing overflow/height, re-check: **Review, Stories, Cards, Progress** × **Safari + Chrome** (desktop) and reason about **iPhone / iPad / Android Chrome** even without hardware

**When shipping layout/CSS:** run `python3 tools/platform-audit.py` (or `node tools/platform-audit.mjs`); fix new antipatterns in the same change set when cheap.

### Safety & motion
- Photosensitive-safe: soft motion only; no full-screen strobes.
- Respect `prefers-reduced-motion` where relevant.

### Languages
- Prefer **Latin-script** languages with solid LanguageTool + MT + TTS.
- Do **not** add CJK / complex-script languages without explicit founder approval and a quality plan.
- Nordic languages: keep with honest Check strength (`spell` where grammar is thin) - do not delete for weak LT.

---

## Autonomy charter (decentralized control)

Founder approves **new product behavior**. Agents own **integrity** (bugs, platform, trust, craft within existing design) without micromanagement.

### Ship alone (no need to wait)
- Bug fixes and regressions (including cross-browser / scroll / crash / correctness)
- Platform safety under the Platform bar (Safari trackpad, iOS zoom, safe areas, etc.)
- Subtraction and quiet polish **that do not add a new interaction or teaching behavior**
- Content quality within existing languages under hard rules (Basics, decks, stories fixes)
- Cache version bumps (`app.js?v=`, `styles.css?v=`, pack `?v=`)
- Commits + push to `main` with clear messages
- Opening/updating GitHub Issues or Linear items for tracked work
- Draft Notion/Drive notes when asked or when documenting decisions

### Ask first (founder blesses before build)
- **Any new user-facing feature or behavior** — even a good idea (e.g. auto-playing L2 when tapping a Stories word, new chrome, new modes, new stats)
- **New language** or major new learning category
- Paid services, Stripe, auth, backend, user accounts
- Public posts or email **as the founder**
- Destructive git (force-push, history rewrite) or wiping user data models
- Final logo / brand lock (propose freely; founder blesses)
- Anything that changes the product’s moral center (e.g. “AI grades freeform L2 as correct”)

**Rule of thumb:** if a tired user would notice a **new thing the product does**, propose it in one short paragraph and wait for yes. If they would only notice that **something broken works again**, ship.

### Continuous multipass (hybrid — founder uses the app; agent keeps slicing)

**Go commands (founder law · permanent):**

| Input | Meaning |
|-------|---------|
| `go` | **1** integrity/craft slice |
| `go N` | Exactly **N** slices; one report after the batch |
| `go unit: <name>` | Finish the named unit; as many slices as needed; stop when done. Default **cap 25** if unspecified. |
| `go unit: <name> (cap N)` | Same with hard cap N; report remaining work if hit. |

Ship-alone only. One report after multipass unit (not after every micro-slice).




Founder does **not** need to type **go** for each integrity slice when a session is open (or when a standing scheduled run is active). Default is **keep improving within ship-alone**.

**Agent may continuously work on (thin slices, ship + short report):**

1. **Language content integrity (all 10)** — one language at a time when possible  
   - Basics: accuracy, examples, MED tray law, speak carriers  
   - Core deck: unique forms, no junk/placeholder, gloss honesty, orthography, rank sanity  
   - Stories: natural dialogue, glosses, trail fit, alignment with taught forms where cheap  
   - Soft-accept / variant lists when they fix real false wrongs  
2. **Platform bar** — scroll, overflow, iOS zoom, safe areas, `platform-audit.py`  
3. **Trust / correctness bugs** — grading, TTS, miss path, storage  
4. **Subtraction + quiet craft** — dead code, restated chrome, no new behaviors  
5. **Cache bumps, commits, push to main** under this charter  

**Still requires founder yes (not continuous):** new features/behaviors, new languages, paid/auth, public founder voice, destructive git, moral-center changes.

**Cadence / reporting (founder preference):**
- Prefer **complete project units** before a check-in — e.g. the full multipass goal across **all scenarios and all 10 languages** (or the whole named project), not a report after every micro-commit.
- **Do not** interrupt the founder with progress chatter mid-project unless:
  1. Ask-first boundary (new feature/behavior, new language, paid/auth, etc.)
  2. Hard-rule / moral-center ambiguity
  3. Truly blocked after repeated failure
  4. Founder uses **`/btw`** or cancels the turn
- Internal thin commits + push are still OK for safety; **user-facing report waits for project completion** (or one of the exceptions above).
- Not giant incoherent refactors: finish the unit cleanly, then one clear summary.

**Language order when multipassing content:** nb → da → sv → de → nl → fr → es → it → pt → pl (or resume mid-ladder).

### Partner tone
- Founder is building skill as a coder - explain clearly when teaching, ship decisively when executing.
- Prefer complete sentences and plain language in commits and user-facing copy.
- One focused change set > drive-by refactors.
- Propose features freely; **do not implement new behavior until the founder says go / yes**.
- Founder’s time is scarce: agents carry language expertise and platform integrity so the founder can **use** the product and only intervene on judgment calls.

---

## Engineering conventions

### Layout
- `index.html`, `app.js`, `styles.css` - main app
- `lang/*-pack.js` - STARTER_DECKS + LANGUAGE_BASICS + EXTRA_READ_STORIES
- `norwegian-frequency-deck.js` + `norwegian-reading-vocab.js` - NB 500+500
- `learning-categories.js` - language registry (speechLang, checkStrength, flags)
- `read-stories.js` - Norwegian READ_STORIES + trail helpers
- `mini-packs.js` - opt-in thematic packs (e.g. Airport & travel)
- `tools/` - generation/cleanup scripts (not required at runtime)

### Shipping checklist
1. Change code/content.
2. Bump cache query strings for every touched static asset.
3. Sanity-check: unique deck counts, no junk patterns, structure (`{}` balance) for packs.
4. Commit with a complete-sentence message (what + why).
5. `git push origin main` (GitHub Pages).

### Cards deck count
- `#deck-count` (`.library-deck-meta`) is the **sole** panel heading: live `deck.length` as a **number only** (tab already says Cards). `aria-label` still says “N cards in your deck”.

### Speech / voices
- Prefer school-region tags (`pt-BR`, `de-DE`, etc.).
- Prefer neural/premium system voices; gender toggle is user preference.

---

## Design direction (craft)

- Calm surfaces, strong typography, minimal chrome.
- Trail marks: ski-run metaphor (green-circle → double-black-diamond).
- Brand motion: portal ceremony is special; never flash-heavy.
- Visual experiments (Imagine/Canva) → **implement winners as SVG/CSS** in production (avoid soft AI mush in UI chrome).
- Next craft priorities when free: identity kit, story covers, calm finish states, share cards - without breaking quiet UX.

---

## Learning algorithm (SRS + introduction order)

- **Leitner intervals** stay: boxes 1→6 with 0 / 1 / 3 / 7 / 14 / 30 day steps; wrong answers demote to box 1.
- **Due reviews always before new cards** in the daily queue.
- **Early “hook mix”** (first ~40 introductions): interleave high-frequency *glue* (pronouns, articles, particles) with *hooks* (phrases + mid-rank content words). Pure rank-1-only order is coverage-optimal but demotivating and brutal for isolated connectors (et/a/the). Aligns with formulaic-sequence / usage-based practice.
- **Glue recognition-first**: weak glue cards (new / boxes 1–2) practice **L2→EN** even if the user toggle is EN→L2. Exact production waits until the form is less brittle.
- **Post-wrong context**: on miss/reveal, when a story uses the word, show that short L2 line + English under the answer pill.
- **Later spice**: after the hook phase, small random pulls from slightly ahead of the frequency frontier.
- Review home is **Study** under the logo only (no Start/Continue/Perfect/Done/Stories bridge). **Streak** needs one honest review that day (floss one tooth). No daily goal picker or set-size chrome. Session is due cards; go as long as you want.
- Exact-form checking stays strict; soft-accept only true orthographic variants, not wrong articles.

## Content expansion priorities

1. Quality of existing 10 languages (lemmas vs noise, story naturalness).  
2. More **phrases** and concrete hooks in ranks ~36–260 (feeds early mix).  
3. Thematic mini-packs (Airport, Café, Campus, Doctor, Housing, Work, Shopping, Social) - **opt-in** from Cards → Packs; never auto-dump into day one. Packs aim for **unique foreign forms across packs** (merge still de-dupes). Enabled packs get ranks 1001+ and a small daily intro bias after the hook phase. Cards **Packs** filter + per-pack chips; after Add, focus that pack and offer **Study now**. Progress Themes glance + **Study** (cap ~12). Misses prefer **story line → pack/phrase example → simple theme template → pack label**.  
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

## Craft skills (Grok)

- **Essential Craft** (`essential-craft`) - beauty + subtraction + 80/20 + MED; Jobs/Rams + philosophical/natural beauty; default product philosophy.
- **Leitner Product Partner** (`leitner-learning-product-partner`) - this product’s judgment layer on top of Essential Craft.
- This **AGENTS.md** remains **hard law** for correctness, autonomy, and anti-goals.

When the founder says **go**, prefer 80/20 + subtraction **and** beauty before expansion.

---

## When unsure

1. Does this increase **trust** or only **noise**?  
2. Would a tired student understand it without a tutorial?  
3. Can we ship a smaller slice that preserves the spine?

If still unsure on a hard-rule boundary → ask the founder.  
If it’s craft within the spine → ship.

---

*Last updated: Phase 0 product law - autonomous partnership enabled.*
