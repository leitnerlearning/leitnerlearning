# Leitner Learning

A language-learning app using the **Leitner spaced-repetition method**, built for international students learning Norwegian in Norway.

**1,000 frequency-ranked words** · The first **500** cover **~80%** of words in our stories · **Complete all 1,000** to read every story with confidence — all in the browser, no account required.

## Who it's for

International students at **Nord University, Bodø** (and anyone learning Bokmål). The starter deck covers:

- **1,000 unique cards** — no duplicates; a real milestone when you finish
- **Bands A–E (1–500)** — frequency-ranked essentials; the core ~500 cover **~80%** of words in Read
- **Bands F–G (501–1,000)** — reading vocabulary that brings story coverage to **100%** (every word tappable)
- **Phrases** — greetings, study talk, and survival expressions

Words are ranked from [Wiktionary Bokmål frequency data](https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists/Norwegian_Bokm%C3%A5l_wordlist) (OpenSubtitles) — the same 80/20 logic behind most “learn the most common words first” approaches.

The **Read** tab includes 17 stories across four difficulty levels: Bodø mornings, campus life, marine fieldwork, and public-domain Norwegian folktales (Askeladden, De tre bukkene Bruse, Soria Moria, and more).

## Run it

```bash
python3 -m http.server 8080
```

Open **http://localhost:8080** (Chrome or Safari recommended for speech input).

Or double-click `index.html` — review works; speech may need the local server.

## Features

- **Leitner boxes** — 6 levels; correct cards advance, wrong cards drop back
- **Daily review cap** — 20 cards per day (optional extra practice)
- **Type or speak** answers (Web Speech API)
- **1,000 unique-word Norwegian deck** — frequency-ranked Bokmål; core 500 ≈ 80% of words in Read, full 1,000 = 100%
- **Graded reading** — Norwegian with optional English, tap words for glosses
- **Add your own cards** — from lectures, textbooks, or conversation
- **Progress view** — library size, due cards, mastery %, Leitner levels, reading completion per story
- **Local storage** — everything stays on your device

## Leitner intervals

| Box | Review interval |
|-----|-----------------|
| 1   | Every session   |
| 2   | 1 day           |
| 3   | 3 days          |
| 4   | 1 week          |
| 5   | 2 weeks         |
| 6   | 1 month         |

## Sharing with classmates

1. Host the `sprakflow/` folder on any static host (GitHub Pages, Netlify, university server).
2. Share the URL — no install, no login.
3. Suggest starting with **Review** (20 cards/day) and one **Beginner** story in **Read**.

## Ideas for making it sustainable

- **University partnership** — offer as a free resource for international programmes at Nord; later pitch a licensed version to other Norwegian universities.
- **Premium tier** — advanced decks (exam prep, workplace Norwegian, dialect packs), audio recordings by native speakers, CSV import/export.
- **Institutional licence** — site licence for language centres; includes custom vocabulary packs per faculty (marine science, nursing, business).
- **Workshops** — paid “Norwegian for researchers” sessions in Bodø using the app as the core tool.
- **Content marketplace** — user-created story packs; revenue share with contributors.
- **Grants** — Innovation Norway, regional innovation funds, or EU mobility/education programmes for open educational resources.

## Languages

| Track | Status |
|-------|--------|
| Norwegian | Full (1,000 cards, 17 stories, full Basics) — Bokmål |
| Swedish, Danish, German, French, Spanish, Italian | v1 (1,000 cards, 12+ stories, Basics) |

Language packs live in `lang/*-pack.js`. Progress is stored per language in the browser.

## What's next (technical)

- Quality pass on non-Norwegian decks (native review)
- CSV deck import/export
- Norwegian speech recognition for reverse cards
- PWA / offline install
- Nynorsk track
- More world languages (e.g. East Asian) after EU set is polished

## Content sources

- Vocabulary: [Wiktionary Bokmål frequency list](https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists/Norwegian_Bokm%C3%A5l_wordlist) (OpenSubtitles corpus) + learner curation
- Stories: original Bodø/campus texts; public-domain works by Asbjørnsen & Moe, H. C. Andersen, and European folk tales