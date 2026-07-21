const LEGACY_STORAGE_KEYS = [
  "leitner-learning-deck-v2",
  "leitner-learning-deck-v1",
  "sprakflow-deck-v1",
];
const BOX_COUNT = 6;

const BOX_INTERVALS_DAYS = [0, 1, 3, 7, 14, 30];
const DAILY_GOAL_CAPS = [10, 15, 20, 30];
const DAILY_PRACTICE_CAP = 20;
const DAILY_GOAL_CAP_KEY = "leitner-learning-daily-goal-cap";
const VOICE_GENDER_KEY = "leitner-learning-voice-gender";
const VOICE_GENDERS = ["female", "male"];

const LEARNING_LEVELS = [
  { short: "New", interval: "Not started", celebration: "Nice start. Keep going." },
  { short: "Learning", interval: "Next day", celebration: "Good one." },
  { short: "Familiar", interval: "Every 3 days", celebration: "This one is sticking." },
  { short: "Known", interval: "Weekly", celebration: "Well done." },
  { short: "Confident", interval: "Every 2 weeks", celebration: "Almost there." },
  { short: "Mastered", interval: "Monthly", celebration: "You know this one." },
];

const BAND_LABELS = {
  A: "Essentials",
  B: "Core",
  C: "Daily",
  D: "Expanded",
  E: "Campus & Life",
  F: "Reading",
  G: "Wider Reading",
  phrase: "Phrases",
};



const NORWEGIAN_LOOKUP_SUFFIXES = [
  "elsene",
  "ingen",
  "inger",
  "ende",
  "ene",
  "hette",
  "dde",
  "tte",
  "ede",
  "ade",
  "te",
  "de",
  "er",
  "ar",
  "en",
  "et",
  "a",
  "e",
  "r",
];

const WELCOME_SEEN_KEY = "leitner-learning-welcome-seen";

const CATEGORY_LABELS = {
  pronoun: "Pronoun",
  verb: "Verb",
  particle: "Particle",
  article: "Article",
  connector: "Connector",
  preposition: "Preposition",
  question: "Question",
  adverb: "Adverb",
  time: "Time",
  adjective: "Adjective",
  number: "Number",
  noun: "Noun",
  phrase: "Phrase",
};

let activeCategoryId = getActiveCategoryId();
let deck = [];
let sessionQueue = [];
let sessionDayKey = "";
let currentCard = null;
let sessionReviewed = 0;
let sessionCorrect = 0;
/** Real misses this queue (wrong answer or reveal) — for honest end-of-round copy. */
let sessionIncorrect = 0;
let sessionJustCompleted = false;
/** When set, Review runs a focused theme set instead of the daily queue. */
let themeSessionPackId = null;
let themeSessionTotal = 0;
/** Calm note after a theme set finishes (cleared on next start). */
let lastThemeSessionNote = null;
const THEME_SESSION_CAP = 12;
let recognition = null;
let speakModeActive = false;
let speakListening = false;
let speakAttemptId = 0;
let currentCardId = null;
let currentCardAttempts = 0;
let speakCardDelayTimer = null;
let speakAttemptTimer = null;
let cardAdvanceTimer = null;
let libraryFilter = "all";
let librarySearch = "";
let libraryRenderToken = 0;
let libraryJumpObserver = null;
/**
 * Quiet post-action line on a pack tile (not a toast).
 * { packId, message, expiresAt }
 */
let lastPackActionNote = null;
const PACK_ACTION_NOTE_MS = 7000;
const LIBRARY_BATCH_SIZE = 35;
const LIBRARY_SCROLL_TOP_THRESHOLD = 360;
/** Rank ranges shown next to section titles and in jump-chip tooltips. */
const LIBRARY_JUMP_RANGE = {
  A: "1–50",
  B: "51–100",
  C: "101–160",
  D: "161–300",
  E: "301–500",
  F: "501–750",
  G: "751–1k",
};
let categoryMenuOpen = false;
let readStoryId = null;
let readSentenceIndex = 0;
let readShowEnglish = false;
let readGlossSelection = null;
let readMenuOpen = false;
let readMenuStep = "trail";
let readMenuTrail = null;
let editingCardId = null;
let addCardReviewOpen = false;
let addCardReviewState = null;
/** Signatures of pairs already applied in this review session (stop A→B→A loops). */
let addCardReviewApplyHistory = [];
/** Snapshot of the form before the user started typing / picking suggestions. */
let addCardFormBaseline = { foreign: "", native: "" };
/** Which add-card side the user last typed in: "native" | "foreign" | null */
let addCardLastEditedSide = null;
/** Ignore document “outside click” hides until this time (ms since epoch). */
let addCardSuppressOutsideHideUntil = 0;
let foreignSuggestTimer = null;
let nativeSuggestTimer = null;
let activeSuggestField = null;
let suppressAddCardSuggestions = false;
/** Bumps on each suggest pass so slow MyMemory replies cannot overwrite newer local hits. */
let foreignSuggestToken = 0;
let nativeSuggestToken = 0;
let readVocabIndex = null;
let confirmResolve = null;

const ADD_CARD_SUGGEST_DEBOUNCE_MS = 320;

function getActiveCategory() {
  return getCategoryById(activeCategoryId);
}

function getDeckStorageKey(categoryId = activeCategoryId) {
  return `leitner-learning-deck-v3-${categoryId}`;
}

function getStarterDeckEntries(category = getActiveCategory()) {
  if (category.id === "nb-bokmal") {
    const entries = [...NORWEGIAN_FREQUENCY_DECK];
    if (typeof NORWEGIAN_READING_VOCAB !== "undefined" && Array.isArray(NORWEGIAN_READING_VOCAB)) {
      entries.push(...NORWEGIAN_READING_VOCAB);
    }
    return entries;
  }
  const packs = typeof window !== "undefined" ? window.STARTER_DECKS : null;
  const entries = packs?.[category.id];
  return Array.isArray(entries) ? entries : [];
}

/** Foreign text on a Read sentence (packs may use foreign; Norwegian uses nb). */
function sentenceForeignText(s) {
  if (!s) return "";
  return s.foreign || s.nb || s.text || "";
}

function getLookupSuffixes(category = getActiveCategory()) {
  if (category.id === "nb-bokmal") return NORWEGIAN_LOOKUP_SUFFIXES;
  return Array.isArray(category.lookupSuffixes) ? category.lookupSuffixes : [];
}

function hasLanguageBasics(categoryId = activeCategoryId) {
  const data =
    typeof window !== "undefined" ? window.LANGUAGE_BASICS?.[categoryId] : null;
  return Boolean(data?.sections?.length);
}

/** Map Basics item size from glyphSize or pack glyphClass. */
function basicsGlyphSizeClass(item) {
  const size = String(item?.glyphSize || "");
  const cls = String(item?.glyphClass || "");
  if (size === "sm" || /--sm\b/.test(cls)) return " basics-glyph--sm";
  if (size === "pair" || /--pair\b/.test(cls)) return " basics-glyph--pair";
  return "";
}

/**
 * Signature letters for the Progress Basics chip (max 3).
 * Prefer data from LANGUAGE_BASICS; fall back per language when digraphs dominate.
 */
const BASICS_PREVIEW_GLYPHS_FALLBACK = {
  "nb-bokmal": ["æ", "ø", "å"],
  sv: ["å", "ä", "ö"],
  da: ["æ", "ø", "å"],
  de: ["ä", "ö", "ü"],
  fr: ["é", "è", "ç"],
  es: ["ñ", "á", "ü"],
  it: ["à", "è", "ò"],
  nl: ["ij", "ui", "oe"],
  pt: ["ã", "ç", "õ"],
  pl: ["ą", "ę", "ł"],
};

function getBasicsPreviewGlyphs(categoryId = activeCategoryId) {
  const data =
    typeof window !== "undefined" ? window.LANGUAGE_BASICS?.[categoryId] : null;
  if (Array.isArray(data?.previewGlyphs) && data.previewGlyphs.length) {
    return data.previewGlyphs.slice(0, 3).map(String);
  }

  const specialSection =
    (data?.sections || []).find((s) =>
      /special|letter/i.test(String(s?.title || ""))
    ) || data?.sections?.[0];
  const derived = [];
  for (const item of specialSection?.items || []) {
    const glyph = String(item?.glyph || "").trim();
    if (!glyph || /\s/.test(glyph)) continue;
    // Single grapheme (æ, ñ, ß) or very short pair only if listed as a unit
    const units = [...glyph];
    if (units.length > 2) continue;
    if (units.length === 2 && !/^[a-zA-Zæøåäöüœßñàèéìòùç]+$/u.test(glyph)) continue;
    // Prefer true specials over digraphs (kj, sj) when single letters exist later
    if (units.length === 2 && derived.some((g) => [...g].length === 1)) continue;
    derived.push(glyph);
    if (derived.length >= 3) break;
  }
  // Prefer only single-character specials when we have them
  const singles = derived.filter((g) => [...g].length === 1);
  if (singles.length >= 2) return singles.slice(0, 3);

  const fallback = BASICS_PREVIEW_GLYPHS_FALLBACK[categoryId];
  if (fallback?.length) return fallback.slice(0, 3);
  return derived.slice(0, 3);
}

function updateBasicsButtonVisibility(categoryId = activeCategoryId) {
  const btn = document.getElementById("progress-basics-btn");
  if (!btn) return;
  const show = hasLanguageBasics(categoryId);
  btn.classList.toggle("hidden", !show);
  if (!show) return;

  const glyphs = getBasicsPreviewGlyphs(categoryId);
  const glyphsEl = btn.querySelector("[data-basics-glyphs]");
  if (glyphsEl) {
    glyphsEl.textContent = glyphs.join(" ");
    glyphsEl.hidden = glyphs.length === 0;
  }
  const label =
    glyphs.length > 0 ? `Basics: ${glyphs.join(", ")}` : "Basics";
  btn.setAttribute("aria-label", label);
  btn.removeAttribute("title");
}

function buildStarterDeck(category = getActiveCategory()) {
  return getStarterDeckEntries(category).map((entry) =>
    createCard(entry.foreign, entry.native, {
      rank: entry.rank,
      category: entry.category,
      band: entry.band,
    })
  );
}

function getLearningLevel(box) {
  return LEARNING_LEVELS[Math.min(Math.max(box, 1), BOX_COUNT) - 1];
}

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {
      // Non-secure contexts (e.g. http://192.168.x.x) block randomUUID.
    }
  }
  return `card-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function storageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/** Warn once per session if the browser will not save progress (private mode / full storage). */
let storageWarningShown = false;

function warnIfStorageFailed(ok) {
  if (ok || storageWarningShown) return;
  storageWarningShown = true;
  // Prefer practice feedback when visible; otherwise console is enough for boot.
  try {
    showFeedback(
      "Progress may not save in this browser (private mode or full storage). Type is fine - just know results may not stick.",
      "revealed",
      { autoHideMs: 10000 }
    );
  } catch {
    /* showFeedback may run before DOM is ready */
  }
}

function isFinePointerDevice() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function focusAnswerInput() {
  const input = document.getElementById("answer-input");
  if (!input || !isFinePointerDevice()) return;
  input.focus();
}

function createCard(foreign, native, meta = {}) {
  const now = Date.now();
  const card = {
    id: createId(),
    foreign: stripFlashcardPunctuation(foreign),
    native: stripFlashcardPunctuation(native),
    box: 1,
    nextReviewAt: now,
    lastReviewedAt: null,
    correctCount: 0,
    incorrectCount: 0,
    createdAt: now,
    rank: meta.rank ?? null,
    category: meta.category ?? null,
    band: meta.band ?? null,
    packId: meta.packId ?? null,
  };
  if (meta.exampleForeign) {
    card.exampleForeign = stripFlashcardPunctuation(meta.exampleForeign);
  }
  if (meta.exampleNative) {
    card.exampleNative = stripFlashcardPunctuation(meta.exampleNative);
  }
  return card;
}

function daysToMs(days) {
  return days * 24 * 60 * 60 * 1000;
}

function getLocalDayStartAfterDays(days, fromDate = new Date()) {
  const start = new Date(fromDate);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + days);
  return start.getTime();
}

function scheduleNextReview(box) {
  const days = BOX_INTERVALS_DAYS[Math.min(box - 1, BOX_COUNT - 1)];
  if (days <= 0) return Date.now();
  return getLocalDayStartAfterDays(days);
}

function isDue(card) {
  return card.nextReviewAt <= Date.now();
}

function compareCardsWithinBox(a, b) {
  const aNew = isNewCard(a);
  const bNew = isNewCard(b);
  if (aNew !== bNew) return aNew ? 1 : -1;
  if (aNew) {
    const rankA = Number(a.rank);
    const rankB = Number(b.rank);
    if (Number.isFinite(rankA) && Number.isFinite(rankB) && rankA !== rankB) {
      return rankA - rankB;
    }
    if (Number.isFinite(rankA) && !Number.isFinite(rankB)) return -1;
    if (!Number.isFinite(rankA) && Number.isFinite(rankB)) return 1;
    return a.foreign.localeCompare(b.foreign);
  }
  return (Number(a.nextReviewAt) || 0) - (Number(b.nextReviewAt) || 0);
}

function compareCardsForPractice(a, b) {
  const boxA = Math.min(Math.max(Number(a.box) || 1, 1), BOX_COUNT);
  const boxB = Math.min(Math.max(Number(b.box) || 1, 1), BOX_COUNT);
  if (boxA !== boxB) return boxA - boxB;
  return compareCardsWithinBox(a, b);
}

function getDueCards(cards = deck) {
  if (!Array.isArray(cards)) return [];
  return cards.filter(isDue).sort(compareCardsForPractice);
}

function isNewCard(card) {
  return card.lastReviewedAt == null;
}

function getNewCards(cards = deck) {
  return cards.filter(isNewCard);
}

function getReviewDueCards(cards = deck) {
  return cards.filter((card) => !isNewCard(card) && isDue(card));
}

function getIntroducedCount(cards = deck) {
  return cards.filter((card) => !isNewCard(card)).length;
}

function getWaitingCount(cards = deck) {
  return getNewCards(cards).length;
}

function getOutstandingDueCount(daily = ensureDailyPracticeState(), cards = deck) {
  const completed = new Set(daily.completedIds);
  return getDueCards(cards).filter((card) => !completed.has(card.id)).length;
}

/**
 * Human-facing practice status for Review home + Progress.
 * Never dump the full unpaid mountain (e.g. 976 due) - the daily cap is
 * the honest "today" size. Big queues become calm labels + small sets.
 */
function getProgressPracticeStat() {
  const daily = ensureDailyPracticeState();
  const cap = getDailyPracticeCap();
  const remainingToday = getDailyRemainingCount(daily);
  const outstanding = getOutstandingDueCount(daily);
  const reviewDue = getReviewDueCards().length;
  const newDue = getDueCards().filter(
    (card) => isNewCard(card) && !daily.completedIds.includes(card.id)
  ).length;
  const setWord = cap === 1 ? "card" : "cards";

  // In-progress daily goal (normal mode only - extra mode can make remaining = full backlog)
  // Home chips: one-word labels. Prefer REMAINING over LEFT (LEFT is ambiguous).
  if (!daily.extraMode && remainingToday > 0) {
    return {
      value: remainingToday,
      label: "Remaining",
      line: `${remainingToday} remaining`,
      ariaLabel: `${remainingToday} card${remainingToday === 1 ? "" : "s"} remaining in today's review`,
      highlight: true,
      actionable: true,
      kind: "left-today",
    };
  }

  if (!daily.extraMode && daily.goalMet && daily.goal > 0) {
    return {
      value: `${daily.reviewed}/${daily.goal}`,
      label: "Done",
      line: `Done · ${daily.reviewed}/${daily.goal}`,
      ariaLabel: `Completed today's goal: ${daily.reviewed} of ${daily.goal} cards reviewed`,
      highlight: false,
      actionable: false,
      kind: "done-today",
    };
  }

  // Extra practice after goal - never a huge unpaid count on the home chip
  if (daily.extraMode && outstanding > 0) {
    return {
      value: "→",
      label: "Extra",
      line: "Extra open",
      ariaLabel: `Extra practice available. Work in small sets of about ${cap} ${setWord}.`,
      highlight: true,
      actionable: true,
      kind: "extras",
    };
  }

  // Goal complete, extras available (not yet in extra mode)
  if (outstanding > 0 && daily.goalMet) {
    return {
      value: "→",
      label: "Extra",
      line: "Extra ready",
      ariaLabel: `Today's goal is done. Extra practice is available in small sets.`,
      highlight: false,
      actionable: true,
      kind: "extras-ready",
    };
  }

  // Reviews waiting (not yet framed as today's goal) - hide mountain size
  if (reviewDue > 0) {
    if (reviewDue > cap) {
      return {
        value: String(cap),
        label: "Set",
        line: `Set · up to ${cap}`,
        ariaLabel: `Reviews are ready. Today's set is up to ${cap} ${setWord}.`,
        highlight: true,
        actionable: true,
        kind: "reviews-soft",
      };
    }
    return {
      value: reviewDue,
      label: "Due",
      line: `${reviewDue} due`,
      ariaLabel: `Review ${reviewDue} card${reviewDue === 1 ? "" : "s"} due for review`,
      highlight: true,
      actionable: true,
      kind: "reviews",
    };
  }

  // New cards / mixed outstanding - invite, don't intimidate
  if (outstanding > 0) {
    const allNew = newDue === outstanding;
    if (allNew || outstanding > cap) {
      return {
        value: String(cap),
        label: "Set",
        line: allNew ? `Set · up to ${cap}` : `Set · up to ${cap}`,
        ariaLabel: allNew
          ? `New cards are waiting. Today's set is up to ${cap} ${setWord}.`
          : `Cards are waiting. Today's set is up to ${cap} ${setWord}.`,
        highlight: true,
        actionable: true,
        kind: "start-soft",
      };
    }
    return {
      value: outstanding,
      label: "Due",
      line: `${outstanding} due`,
      ariaLabel: `${outstanding} card${outstanding === 1 ? "" : "s"} ready now`,
      highlight: true,
      actionable: true,
      kind: "due-now",
    };
  }

  const nextReview = getNextReviewStat();
  if (nextReview) {
    return {
      ...nextReview,
      line:
        nextReview.label === "Next review"
          ? `Next review · ${nextReview.value}`
          : `${nextReview.value} · ${nextReview.label}`,
      kind: "next",
    };
  }

  return {
    value: "✓",
    label: "Clear",
    line: "All clear for now",
    ariaLabel: "All caught up for now",
    highlight: false,
    actionable: false,
    kind: "caught-up",
  };
}

function getNextReviewStat() {
  const unlockMs = getNextReviewUnlockMs();
  if (!unlockMs) return null;

  const diff = unlockMs - Date.now();
  if (diff <= 0) return null;

  const unlockDay = getLocalDayKey(new Date(unlockMs));
  const tomorrow = getLocalDayKey(new Date(Date.now() + daysToMs(1)));
  const teaser = formatNextReviewTeaser(unlockMs);

  if (unlockDay === tomorrow) {
    return {
      value: "Tomorrow",
      label: "Next review",
      ariaLabel: teaser || "Reviews unlock tomorrow",
      highlight: false,
      actionable: false,
    };
  }

  const hours = Math.ceil(diff / 3600000);
  if (hours < 48) {
    return {
      value: `~${hours}h`,
      label: "Next review",
      ariaLabel: teaser || `Reviews unlock in about ${hours} hours`,
      highlight: false,
      actionable: false,
    };
  }

  const dayDiff = Math.max(
    2,
    Math.ceil(
      (getLocalDayStartAfterDays(0, new Date(unlockMs)) - getLocalDayStartAfterDays(0)) /
        daysToMs(1)
    )
  );
  return {
    value: `~${dayDiff}d`,
    label: "Next review",
    ariaLabel: teaser || `Reviews unlock in about ${dayDiff} days`,
    highlight: false,
    actionable: false,
  };
}

function isStreakAtRisk(categoryId = activeCategoryId) {
  const state = loadStreakState(categoryId);
  if (!state?.lastGoalDay || state.currentStreak <= 0) return false;

  const today = getLocalDayKey();
  if (state.lastGoalDay === today) return false;

  const yesterday = getYesterdayDayKey();
  if (state.lastGoalDay !== yesterday) return false;

  const daily = ensureDailyPracticeState();
  return !daily.goalMet;
}

function getHomeStreakStat(categoryId = activeCategoryId) {
  const streak = getDisplayStreak(categoryId);
  const atRisk = isStreakAtRisk(categoryId);

  return {
    value: streak,
    // One-word chip label; risk is color/aria, not a longer string.
    label: "Streak",
    ariaLabel: atRisk
      ? `${streak}-day streak. Finish today's review to keep it.`
      : streak > 0
        ? `${streak}-day streak`
        : "No streak yet",
    highlight: streak > 0,
    atRisk,
  };
}

function getLocalDayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getDailyPracticeStorageKey(categoryId = activeCategoryId) {
  return `leitner-learning-daily-practice-${categoryId}`;
}

function shuffleInPlace(items, randomFn = Math.random) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(randomFn() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function getDailyPracticeCap() {
  const n = Number(storageGet(DAILY_GOAL_CAP_KEY));
  return DAILY_GOAL_CAPS.includes(n) ? n : DAILY_PRACTICE_CAP;
}

function setDailyPracticeCap(cap) {
  const next = DAILY_GOAL_CAPS.includes(Number(cap)) ? Number(cap) : DAILY_PRACTICE_CAP;
  storageSet(DAILY_GOAL_CAP_KEY, String(next));
  return next;
}

function computeDailyGoal(dueCount) {
  if (dueCount <= 0) return 0;
  return Math.min(dueCount, getDailyPracticeCap());
}

/** Recompute today's goal from the saved cap (raise or lower mid-day safely). */
function applyCapToTodayState() {
  const state = ensureDailyPracticeState();
  const cap = getDailyPracticeCap();
  const due = getDueCards(deck);
  const completed = new Set(state.completedIds);
  const remainingDue = due.filter((card) => !completed.has(card.id)).length;

  if (state.reviewed === 0 && remainingDue === 0) {
    state.goal = 0;
    state.goalMet = deck.length > 0;
    state.dailyQueue = [];
    state.extraMode = false;
    saveDailyPractice(state);
    return state;
  }

  const newGoal = Math.max(state.reviewed, Math.min(cap, state.reviewed + remainingDue));
  state.goal = newGoal;
  state.goalMet = newGoal > 0 && state.reviewed >= newGoal;
  if (!state.goalMet) state.extraMode = false;

  const need = Math.max(0, state.goal - state.reviewed);
  const completedInQueue = state.dailyQueue.filter((id) => completed.has(id));
  const pending = state.dailyQueue.filter((id) => !completed.has(id));
  state.dailyQueue = [...completedInQueue, ...pending.slice(0, need)];

  refreshDailyPracticeQueue(state);
  saveDailyPractice(state);
  return state;
}

function selectDailyGoalCap(cap) {
  setDailyPracticeCap(cap);
  applyCapToTodayState();
  const keepId = currentCard?.id || null;
  buildSessionQueue();
  if (keepId) {
    sessionQueue = sessionQueue.filter((id) => id !== keepId);
  }
  closeGoalCapModal();
  renderAll();
}

function sortCardIdsByPracticePriority(cardIds, completed = new Set()) {
  const cards = cardIds
    .map((id) => deck.find((card) => card.id === id))
    .filter((card) => card && !completed.has(card.id));
  cards.sort(compareCardsForPractice);
  return cards.map((card) => card.id);
}

/** How many new thematic-pack cards to prefer per day after the early hook phase. */
const THEMATIC_PACK_NEW_PER_DAY = 2;

function buildDailyQueue(dueCards, goal) {
  if (!goal) return [];

  const packNewCards = getEnabledPackNewCards(dueCards);
  const packNewIds = new Set(packNewCards.map((card) => card.id));
  const introduced = getIntroducedCount(deck);
  const hookThreshold =
    (window.SrsCore && Number(SrsCore.HOOK_INTRO_THRESHOLD)) || 40;
  // Keep day-one hook mix pure; after that, sprinkle pack cards into new slots.
  const includePackBias = introduced >= hookThreshold && packNewCards.length > 0;

  let queue;
  if (window.SrsCore) {
    queue = SrsCore.buildDailyQueue(dueCards, goal, deck, {
      excludedIds: includePackBias ? packNewIds : new Set(),
    });
  } else {
    queue = dueCards
      .slice()
      .sort(compareCardsForPractice)
      .slice(0, goal)
      .map((card) => card.id);
  }

  if (!includePackBias) return queue;

  return injectPackNewIntoQueue(queue, dueCards, goal, packNewCards);
}

function getEnabledPackNewCards(dueCards) {
  const enabled = new Set(getEnabledPackIds());
  if (!enabled.size) return [];
  return dueCards
    .filter(
      (card) =>
        isNewCard(card) && card.packId && enabled.has(card.packId)
    )
    .slice()
    .sort((a, b) => (Number(a.rank) || 99999) - (Number(b.rank) || 99999));
}

function injectPackNewIntoQueue(queue, dueCards, goal, packNewCards) {
  const want = Math.min(THEMATIC_PACK_NEW_PER_DAY, packNewCards.length);
  if (want <= 0) return queue;

  const byId = new Map(dueCards.map((card) => [card.id, card]));
  const deckById = new Map(deck.map((card) => [card.id, card]));
  const resolve = (id) => byId.get(id) || deckById.get(id);
  const isReviewId = (id) => {
    const card = resolve(id);
    return Boolean(card && !isNewCard(card));
  };

  const ids = queue.slice();
  let capacity = Math.max(0, goal - ids.length);

  if (capacity < want) {
    let need = want - capacity;
    for (let i = ids.length - 1; i >= 0 && need > 0; i -= 1) {
      if (!isReviewId(ids[i])) {
        ids.splice(i, 1);
        need -= 1;
      }
    }
    capacity = Math.max(0, goal - ids.length);
  }

  const add = Math.min(want, packNewCards.length, capacity);
  for (let i = 0; i < add; i += 1) {
    ids.push(packNewCards[i].id);
  }
  return ids;
}

function loadDailyPractice(categoryId = activeCategoryId) {
  const raw = storageGet(getDailyPracticeStorageKey(categoryId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const completedIds = Array.isArray(parsed.completedIds)
      ? parsed.completedIds
      : Array.isArray(parsed.reviewedIds)
        ? parsed.reviewedIds
        : [];
    return {
      day: parsed.day || "",
      reviewed: Number(parsed.reviewed) || completedIds.length,
      goal: Number(parsed.goal) || 0,
      goalMet: Boolean(parsed.goalMet),
      dailyQueue: Array.isArray(parsed.dailyQueue) ? parsed.dailyQueue : [],
      completedIds,
      extraMode: Boolean(parsed.extraMode),
    };
  } catch {
    return null;
  }
}

function saveDailyPractice(state, categoryId = activeCategoryId) {
  warnIfStorageFailed(
    storageSet(getDailyPracticeStorageKey(categoryId), JSON.stringify(state))
  );
}

function resetDailyPractice(categoryId = activeCategoryId) {
  try {
    localStorage.removeItem(getDailyPracticeStorageKey(categoryId));
  } catch {
    // ignore
  }
}

function resetStreakState(categoryId = activeCategoryId) {
  try {
    localStorage.removeItem(getStreakStorageKey(categoryId));
  } catch {
    // ignore
  }
}

function clearReadProgress(categoryId = activeCategoryId) {
  try {
    localStorage.removeItem(getReadProgressKey(categoryId));
  } catch {
    // ignore
  }
}

function normalizeDailyPracticeState(state) {
  state.completedIds = Array.isArray(state.completedIds) ? state.completedIds : [];
  state.dailyQueue = Array.isArray(state.dailyQueue) ? state.dailyQueue : [];
  state.reviewed = state.completedIds.length;
  state.goal = Number(state.goal) || 0;
  state.goalMet = Boolean(state.goalMet);
  state.extraMode = Boolean(state.extraMode);
  return state;
}

function refreshDailyPracticeQueue(state) {
  normalizeDailyPracticeState(state);
  const due = getDueCards(deck);
  const dueIds = new Set(due.map((card) => card.id));
  const completed = new Set(state.completedIds);

  state.dailyQueue = state.dailyQueue.filter(
    (id) => completed.has(id) || dueIds.has(id)
  );

  if (!state.goalMet && state.goal > 0) {
    const pendingInQueue = state.dailyQueue.filter((id) => !completed.has(id)).length;
    const slotsOpen = Math.max(0, state.goal - pendingInQueue - state.reviewed);
    if (slotsOpen > 0) {
      const inQueue = new Set(state.dailyQueue);
      const pool = due.filter((card) => !completed.has(card.id) && !inQueue.has(card.id));
      // Use app queue (hook mix + thematic pack bias), not raw SrsCore alone.
      const additions = buildDailyQueue(pool, slotsOpen).filter((id) => !inQueue.has(id));
      state.dailyQueue.push(...additions);
    }
  }

  const completedInQueue = state.dailyQueue.filter((id) => completed.has(id));
  const pendingSorted = sortCardIdsByPracticePriority(state.dailyQueue, completed);
  state.dailyQueue = [...completedInQueue, ...pendingSorted];

  state.reviewed = state.completedIds.length;
  if (state.goal > 0) {
    state.goalMet = state.reviewed >= state.goal;
  } else if (deck.length > 0 && due.length === 0) {
    state.goalMet = true;
  }
  return state;
}

function pruneDailyPracticeForCard(cardId, categoryId = activeCategoryId) {
  const state = loadDailyPractice(categoryId);
  if (!state || state.day !== getLocalDayKey()) return;

  state.completedIds = state.completedIds.filter((id) => id !== cardId);
  state.dailyQueue = state.dailyQueue.filter((id) => id !== cardId);
  state.reviewed = state.completedIds.length;
  state.goalMet = state.goal > 0 && state.reviewed >= state.goal;
  saveDailyPractice(state, categoryId);
}

function ensureDailyPracticeState() {
  const today = getLocalDayKey();
  const due = getDueCards(deck);
  let state = loadDailyPractice();

  if (!state || state.day !== today) {
    const goal = computeDailyGoal(due.length);
    const restDay = goal === 0 && deck.length > 0;
    state = normalizeDailyPracticeState({
      day: today,
      reviewed: 0,
      goal,
      goalMet: restDay,
      dailyQueue: buildDailyQueue(due, goal),
      completedIds: [],
      extraMode: false,
    });
    if (restDay) {
      recordGoalStreak();
    }
    saveDailyPractice(state);
    return state;
  }

  normalizeDailyPracticeState(state);

  if (!state.goalMet && state.goal === 0 && due.length > 0) {
    state.goal = computeDailyGoal(due.length);
    state.dailyQueue = buildDailyQueue(due, state.goal);
    state.extraMode = false;
  }

  if (!state.completedIds.length && state.reviewed > 0) {
    state.completedIds = state.dailyQueue.slice(0, state.reviewed);
  }

  refreshDailyPracticeQueue(state);
  saveDailyPractice(state);
  return state;
}

function recordDailyCompletion(cardId) {
  syncPracticeSessionDay();
  const state = ensureDailyPracticeState();
  if (state.completedIds.includes(cardId)) return state;

  state.completedIds.push(cardId);
  state.reviewed = state.completedIds.length;
  if (state.goal > 0 && state.reviewed >= state.goal) {
    state.goalMet = true;
    recordGoalStreak();
  }
  saveDailyPractice(state);
  return state;
}

function enableExtraPractice() {
  const state = ensureDailyPracticeState();
  state.extraMode = true;
  saveDailyPractice(state);
}

function getDailyRemainingCount(state = ensureDailyPracticeState()) {
  if (state.extraMode) {
    return getOutstandingDueCount(state);
  }

  const dueIds = new Set(getDueCards(deck).map((card) => card.id));
  return state.dailyQueue.filter(
    (id) => dueIds.has(id) && !state.completedIds.includes(id)
  ).length;
}

function hasDailyGoalRemaining(daily = ensureDailyPracticeState()) {
  if (daily.extraMode || daily.goalMet || daily.goal <= 0) return false;
  return getDailyRemainingCount(daily) > 0;
}

function pausePracticeSession() {
  if (!currentCard) return;

  const daily = ensureDailyPracticeState();
  const cardId = currentCard.id;
  if (!daily.completedIds.includes(cardId) && !sessionQueue.includes(cardId)) {
    sessionQueue.unshift(cardId);
  }

  currentCard = null;
  currentCardId = null;
  resetCardAttempts();
  hideFeedback();
}

function getStreakStorageKey(categoryId = activeCategoryId) {
  return `leitner-learning-streak-${categoryId}`;
}

function loadStreakState(categoryId = activeCategoryId) {
  const raw = storageGet(getStreakStorageKey(categoryId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return {
      currentStreak: Math.max(0, Number(parsed.currentStreak) || 0),
      lastGoalDay: parsed.lastGoalDay || "",
    };
  } catch {
    return null;
  }
}

function saveStreakState(state, categoryId = activeCategoryId) {
  warnIfStorageFailed(
    storageSet(getStreakStorageKey(categoryId), JSON.stringify(state))
  );
}

function getYesterdayDayKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return getLocalDayKey(date);
}

function recordGoalStreak(categoryId = activeCategoryId) {
  const today = getLocalDayKey();
  const state = loadStreakState(categoryId) || { currentStreak: 0, lastGoalDay: "" };
  if (state.lastGoalDay === today) return state.currentStreak;

  const yesterday = getYesterdayDayKey();
  state.currentStreak = state.lastGoalDay === yesterday ? state.currentStreak + 1 : 1;
  state.lastGoalDay = today;
  saveStreakState(state, categoryId);
  return state.currentStreak;
}

function getDisplayStreak(categoryId = activeCategoryId) {
  const state = loadStreakState(categoryId);
  if (!state?.lastGoalDay) return 0;

  const today = getLocalDayKey();
  const yesterday = getYesterdayDayKey();
  if (state.lastGoalDay === today || state.lastGoalDay === yesterday) {
    return state.currentStreak;
  }
  return 0;
}

function formatStreakLabel(count) {
  if (count <= 0) return "";
  return count === 1 ? "1-day streak" : `${count}-day streak`;
}

function getNextReviewUnlockMs() {
  const now = Date.now();
  const upcoming = deck
    .map((card) => Number(card.nextReviewAt))
    .filter((time) => Number.isFinite(time) && time > now);
  if (!upcoming.length) return null;
  return Math.min(...upcoming);
}

function formatNextReviewTeaser(unlockMs = getNextReviewUnlockMs()) {
  if (!unlockMs) return "";

  const diff = unlockMs - Date.now();
  if (diff <= 0) return "";

  const unlockDay = getLocalDayKey(new Date(unlockMs));
  const today = getLocalDayKey();
  const tomorrow = getLocalDayKey(new Date(Date.now() + daysToMs(1)));

  if (unlockDay === tomorrow) return "Reviews unlock tomorrow";
  if (unlockDay !== today) {
    const dayDiff = Math.max(
      2,
      Math.ceil((getLocalDayStartAfterDays(0, new Date(unlockMs)) - getLocalDayStartAfterDays(0)) / daysToMs(1))
    );
    return `Reviews unlock in ~${dayDiff} days`;
  }

  const minutes = Math.ceil(diff / 60000);
  const hours = Math.ceil(diff / 3600000);
  if (hours >= 2) return `Reviews unlock in ~${hours} hours`;
  if (hours === 1) return "Reviews unlock in ~1 hour";
  if (minutes >= 2) return `Reviews unlock in ~${minutes} minutes`;
  return "Reviews unlock soon";
}

function promote(card) {
  const newBox = Math.min(card.box + 1, BOX_COUNT);
  return {
    ...card,
    box: newBox,
    nextReviewAt: scheduleNextReview(newBox),
    lastReviewedAt: Date.now(),
    correctCount: card.correctCount + 1,
  };
}

function demote(card) {
  return {
    ...card,
    box: 1,
    nextReviewAt: Date.now(),
    lastReviewedAt: Date.now(),
    incorrectCount: card.incorrectCount + 1,
  };
}

function normalizeAnswer(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:'"“”‘’]/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Flashcards are lemmas and short phrases - not full sentences.
 * Strip wrapping quotes and trailing . ! … that MT likes to add
 * (those also glitch review copy: … “spise”. Tap…).
 * Keep ? so questions still read as questions.
 */
function stripFlashcardPunctuation(text) {
  if (text == null) return "";
  return String(text)
    .trim()
    .replace(/^["'“”‘’«»]+|["'“”‘’«»]+$/g, "")
    .replace(/[\s.!…。．,;:]+$/u, "")
    .replace(/^[\s.!…。．,;:]+/u, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Norwegian without a special keyboard:
 *   å → aa   æ → ae   ø → oe
 * Also maps the special letters themselves into those digraphs.
 */
function foldNorwegianDigraphs(text) {
  return normalizeAnswer(text)
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa");
}

/**
 * Even looser ASCII: allow a/o for å/ø and a for æ when typing fast.
 *   går ≈ gaar ≈ gar   bøker ≈ boeker ≈ boker   bær ≈ baer ≈ bar
 */
function foldNorwegianLoose(text) {
  return foldNorwegianDigraphs(text)
    .replace(/aa/g, "a")
    .replace(/ae/g, "a")
    .replace(/oe/g, "o");
}

function norwegianTypingMatches(user, expected) {
  if (!user || !expected) return false;
  if (foldNorwegianDigraphs(user) === foldNorwegianDigraphs(expected)) return true;
  if (foldNorwegianLoose(user) === foldNorwegianLoose(expected)) return true;
  return false;
}

/**
 * Optional infinitive particles so bare verbs still count:
 *   å spise ≈ spise    to be ≈ be
 * Typing å without the letter: "a vaere" / "aa vaere" ≈ "å være" / "være".
 */
function stripAnswerParticles(text) {
  let t = normalizeAnswer(text);
  if (!t) return "";
  // Norwegian infinitive marker (and common keyboard stand-ins)
  t = t.replace(/^(å|aa)\s+/, "");
  // English infinitive "to eat" → "eat"
  t = t.replace(/^to\s+/, "");
  // Leading "a " as ASCII for å (a være → være). English "a dog" → "dog" is usually fine too.
  t = t.replace(/^a\s+/, "");
  return t.trim();
}

/** All comparable cores for one answer (particles off/on + æøå typing folds). */
function answerCoreVariants(text) {
  const n = normalizeAnswer(text);
  const cores = new Set();
  if (!n) return cores;

  const base = stripAnswerParticles(n) || n;
  const forms = [n, base];
  // Bare verb ↔ with particle (either side may be the card or the user)
  if (base && !base.includes(" ")) {
    forms.push(`å ${base}`);
    forms.push(`to ${base}`);
  }

  for (const form of forms) {
    if (!form) continue;
    cores.add(form);
    cores.add(foldNorwegianDigraphs(form));
    cores.add(foldNorwegianLoose(form));
    cores.add(foldEnglishDialectSpelling(form));
  }
  return cores;
}

function particleAnswerMatches(a, b) {
  if (!a || !b) return false;
  const left = answerCoreVariants(a);
  for (const core of answerCoreVariants(b)) {
    if (left.has(core)) return true;
  }
  return false;
}

function getAcceptedAnswers(native) {
  return native.split("/").map((part) => normalizeAnswer(part));
}

/**
 * British ↔ American spelling for answer matching.
 * Cards stay American; learners taught BE spelling still count as correct.
 * Fold both sides to American-ish form, then compare.
 */
const EN_SPELLING_WORD_MAP = {
  colour: "color",
  colours: "colors",
  coloured: "colored",
  colouring: "coloring",
  colourful: "colorful",
  colourless: "colorless",
  favour: "favor",
  favours: "favors",
  favoured: "favored",
  favouring: "favoring",
  favourite: "favorite",
  favourites: "favorites",
  favourable: "favorable",
  favourably: "favorably",
  honour: "honor",
  honours: "honors",
  honoured: "honored",
  honouring: "honoring",
  honourable: "honorable",
  honourably: "honorably",
  humour: "humor",
  humours: "humors",
  labour: "labor",
  labours: "labors",
  laboured: "labored",
  labouring: "laboring",
  neighbour: "neighbor",
  neighbours: "neighbors",
  neighbourhood: "neighborhood",
  neighbouring: "neighboring",
  behaviour: "behavior",
  behaviours: "behaviors",
  harbour: "harbor",
  harbours: "harbors",
  harboured: "harbored",
  harbouring: "harboring",
  flavour: "flavor",
  flavours: "flavors",
  flavoured: "flavored",
  flavouring: "flavoring",
  rumour: "rumor",
  rumours: "rumors",
  vapour: "vapor",
  vapours: "vapors",
  endeavour: "endeavor",
  endeavours: "endeavors",
  endeavoured: "endeavored",
  centre: "center",
  centres: "centers",
  centred: "centered",
  centring: "centering",
  theatre: "theater",
  theatres: "theaters",
  metre: "meter",
  metres: "meters",
  litre: "liter",
  litres: "liters",
  fibre: "fiber",
  fibres: "fibers",
  calibre: "caliber",
  calibres: "calibers",
  grey: "gray",
  greys: "grays",
  defence: "defense",
  defences: "defenses",
  offence: "offense",
  offences: "offenses",
  licence: "license",
  licences: "licenses",
  practise: "practice",
  practised: "practiced",
  practising: "practicing",
  catalogue: "catalog",
  catalogues: "catalogs",
  dialogue: "dialog",
  dialogues: "dialogs",
  programme: "program",
  programmes: "programs",
  traveller: "traveler",
  travellers: "travelers",
  travelling: "traveling",
  travelled: "traveled",
  cancelled: "canceled",
  cancelling: "canceling",
  jewellery: "jewelry",
  aeroplane: "airplane",
  aeroplanes: "airplanes",
  aluminium: "aluminum",
  maths: "math",
  cheque: "check",
  cheques: "checks",
  lorry: "truck",
  lorries: "trucks",
  tyre: "tire",
  tyres: "tires",
  kerb: "curb",
  kerbs: "curbs",
};

/** Words that keep -ise / -yse in American English (do not fold to -ize). */
const EN_ISE_KEEP = new Set([
  "advertise",
  "advertises",
  "advertised",
  "advertising",
  "advise",
  "advises",
  "advised",
  "advising",
  "arise",
  "arises",
  "arisen",
  "arising",
  "chastise",
  "chastises",
  "chastised",
  "chastising",
  "circumcise",
  "circumcises",
  "circumcised",
  "circumcising",
  "comprise",
  "comprises",
  "comprised",
  "comprising",
  "compromise",
  "compromises",
  "compromised",
  "compromising",
  "concise",
  "concisely",
  "demise",
  "despise",
  "despises",
  "despised",
  "despising",
  "devise",
  "devises",
  "devised",
  "devising",
  "disguise",
  "disguises",
  "disguised",
  "disguising",
  "enterprise",
  "enterprises",
  "excise",
  "exercise",
  "exercises",
  "exercised",
  "exercising",
  "expertise",
  "franchise",
  "franchises",
  "franchised",
  "franchising",
  "guise",
  "improvise",
  "improvises",
  "improvised",
  "improvising",
  "merchandise",
  "noise",
  "noises",
  "otherwise",
  "paradise",
  "poise",
  "poised",
  "precise",
  "precisely",
  "premise",
  "premises",
  "promise",
  "promises",
  "promised",
  "promising",
  "raise",
  "raises",
  "raised",
  "raising",
  "praise",
  "praises",
  "praised",
  "praising",
  "bruise",
  "bruises",
  "bruised",
  "bruising",
  "cruise",
  "cruises",
  "cruised",
  "cruising",
  "revise",
  "revises",
  "revised",
  "revising",
  "rise",
  "rises",
  "risen",
  "rising",
  "supervise",
  "supervises",
  "supervised",
  "supervising",
  "supervisor",
  "supervisors",
  "surmise",
  "surmises",
  "surmised",
  "surmising",
  "surprise",
  "surprises",
  "surprised",
  "surprising",
  "televise",
  "televises",
  "televised",
  "televising",
  "treatise",
  "treatises",
  "wise",
  "wisely",
  "likewise",
  "clockwise",
  "counterclockwise",
]);

function foldEnglishDialectWord(word) {
  if (!word) return word;
  if (EN_SPELLING_WORD_MAP[word]) return EN_SPELLING_WORD_MAP[word];

  let w = word;
  if (!EN_ISE_KEEP.has(w)) {
    w = w
      .replace(/isation(s?)$/g, "ization$1")
      .replace(/ising$/g, "izing")
      .replace(/ised$/g, "ized")
      .replace(/ises$/g, "izes")
      .replace(/ise$/g, "ize")
      .replace(/ysation(s?)$/g, "yzation$1")
      .replace(/ysing$/g, "yzing")
      .replace(/ysed$/g, "yzed")
      .replace(/yses$/g, "yzes")
      .replace(/yse$/g, "yze");
  }
  return w;
}

/** Fold a phrase word-by-word (city centre → city center). */
function foldEnglishDialectSpelling(text) {
  const normalized = normalizeAnswer(text);
  if (!normalized) return "";
  return normalized
    .split(/\s+/)
    .map((word) => foldEnglishDialectWord(word))
    .join(" ");
}

/** colour ≈ color, organise ≈ organize, city centre ≈ city center */
function englishDialectSpellingMatches(a, b) {
  if (!a || !b) return false;
  const x = normalizeAnswer(a);
  const y = normalizeAnswer(b);
  if (!x || !y) return false;
  if (x === y) return true;
  return foldEnglishDialectSpelling(x) === foldEnglishDialectSpelling(y);
}

/**
 * Major regional / orthographic variants of the *same* word.
 * School standard stays on the card; Check may soft-accept the other form
 * (like BE/AE for English). Never maps true false friends or different lemmas.
 */
const PT_BR_EP_WORD_MAP = {
  // European Portuguese → Brazilian teaching standard (lemma pairs)
  facto: "fato",
  factos: "fatos",
  acção: "ação",
  acções: "ações",
  óptimo: "ótimo",
  óptima: "ótima",
  óptimos: "ótimos",
  óptimas: "ótimas",
  actual: "atual",
  actuals: "atuais",
  actuais: "atuais",
  actualidade: "atualidade",
  actualização: "atualização",
  actualizar: "atualizar",
  actualizado: "atualizado",
  actualizada: "atualizada",
  eléctrico: "elétrico",
  eléctrica: "elétrica",
  eléctricos: "elétricos",
  eléctricas: "elétricas",
  eléctricidade: "eletricidade",
  eletricidade: "eletricidade",
  contracção: "contração",
  direcção: "direção",
  direcções: "direções",
  objecto: "objeto",
  objectos: "objetos",
  projecto: "projeto",
  projectos: "projetos",
  secção: "seção",
  secções: "seções",
  selecção: "seleção",
  selecções: "seleções",
  colecção: "coleção",
  colecções: "coleções",
  protecção: "proteção",
  protecções: "proteções",
  óptico: "ótico",
  óptica: "ótica",
};

/** Fold one token for orthography-equivalence (lowercase, already normalized). */
function foldForeignOrthographyToken(word, langCode) {
  if (!word) return word;
  const code = String(langCode || "")
    .toLowerCase()
    .split(/[-_]/)[0];

  if (code === "en") return foldEnglishDialectWord(word);

  let w = word;

  // German: ß↔ss, and common umlaut digraphs (ae/oe/ue) when comparing
  if (code === "de") {
    w = w.replace(/ß/g, "ss");
    // Only expand digraphs that typically stand for umlauts (not every "ae")
    // Compare both sides after normalizing ß; also map äöü ↔ ae/oe/ue
    w = w
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/Ä/g, "ae")
      .replace(/Ö/g, "oe")
      .replace(/Ü/g, "ue");
    return w;
  }

  // Dutch: ĳ / ij
  if (code === "nl") {
    return w.replace(/ĳ/g, "ij").replace(/Ĳ/g, "ij");
  }

  // French: œ/æ ligatures
  if (code === "fr") {
    return w.replace(/œ/g, "oe").replace(/æ/g, "ae").replace(/Œ/g, "oe").replace(/Æ/g, "ae");
  }

  // Portuguese (Brazil teaching standard): EP spellings fold to BR
  if (code === "pt") {
    if (PT_BR_EP_WORD_MAP[w]) return PT_BR_EP_WORD_MAP[w];
    // Safe cluster patterns only (not free-for-all letter deletion)
    w = w.replace(/cç/g, "ç"); // acção → ação
    w = w.replace(/ópt/g, "ót").replace(/opt(?=[ií])/g, "ot"); // óptimo / optimismo-ish
    w = w.replace(/ct(?=[aoãõeéiíuú])/g, "t"); // actual → atual, objecto → objeto
    w = w.replace(/pç/g, "ç"); // concepções edge cases
    return w;
  }

  // Norwegian / Danish / Swedish: common ASCII fallbacks for special letters
  if (code === "nb" || code === "no" || code === "nn" || code === "da") {
    return w
      .replace(/æ/g, "ae")
      .replace(/ø/g, "oe")
      .replace(/å/g, "aa");
  }
  if (code === "sv") {
    return w
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/å/g, "aa");
  }

  // Polish: rarely need soft-accept beyond case; keep exact forms
  return w;
}

function foldForeignOrthography(text, langCode) {
  const normalized = normalizeAnswer(text);
  if (!normalized) return "";
  return normalized
    .split(/\s+/)
    .map((word) => foldForeignOrthographyToken(word, langCode))
    .join(" ");
}

/**
 * True when a and b are the same word under major orthographic variants
 * for the given language (or English BE/AE when lang is en).
 */
function foreignOrthographyMatches(a, b, langCode) {
  if (!a || !b) return false;
  const x = normalizeAnswer(a);
  const y = normalizeAnswer(b);
  if (!x || !y) return false;
  if (x === y) return true;

  const code = String(langCode || "")
    .toLowerCase()
    .split(/[-_]/)[0];

  if (code === "en" || !code) {
    if (englishDialectSpellingMatches(x, y)) return true;
  }

  const fx = foldForeignOrthography(x, code || langCode);
  const fy = foldForeignOrthography(y, code || langCode);
  if (fx && fy && fx === fy) return true;

  // English side of cards often mixed into comparisons
  if (englishDialectSpellingMatches(x, y)) return true;
  return false;
}

/** Spoken forms that should count as the same answer (ASR often picks the wrong spelling). */
const SPEECH_HOMOPHONE_GROUPS = {
  en: [
    ["to", "too", "two", "2"],
    ["for", "four", "fore", "4"],
    ["one", "won", "1"],
    ["two", "to", "too", "2"],
    ["four", "for", "fore", "4"],
    ["eight", "ate", "8"],
    ["there", "their", "they're"],
    ["your", "you're"],
    ["its", "it's"],
    ["who", "who"],
    ["which", "witch"],
    ["where", "wear", "ware"],
    ["here", "hear"],
    ["right", "write", "rite"],
    ["know", "no"],
    ["new", "knew"],
    ["see", "sea"],
    ["be", "bee"],
    ["by", "bye", "buy"],
    ["our", "hour"],
    ["sun", "son"],
    ["some", "sum"],
    ["so", "sew", "sow"],
    ["wait", "weight"],
    ["way", "weigh"],
    ["week", "weak"],
    ["peace", "piece"],
    ["plain", "plane"],
    ["pair", "pear", "pare"],
    ["bare", "bear"],
    ["break", "brake"],
    ["flower", "flour"],
    ["mail", "male"],
    ["meet", "meat"],
    ["night", "knight"],
    ["not", "knot"],
    ["or", "ore", "oar"],
    ["red", "read"],
    ["sail", "sale"],
    ["scene", "seen"],
    ["steal", "steel"],
    ["tail", "tale"],
    ["threw", "through"],
    ["weather", "whether"],
    ["wood", "would"],
    ["hole", "whole"],
    ["hi", "high"],
    ["i", "eye", "aye"],
    ["oh", "owe", "o"],
    ["you", "u", "ewe"],
  ],
  nb: [
    // Spelling / ASR variants that sound the same (not different grammar forms)
    ["en", "enn"],
    ["et", "ett"],
    ["jeg", "je", "jæi"],
    ["meg", "mæ"],
    ["deg", "dæ"],
    ["seg", "sæ"],
    ["å", "aa", "a"],
    ["æ", "ae"],
    ["ø", "oe", "o"],
    ["nå", "naa"],
    ["så", "saa"],
    ["også", "ogsaa"],
    ["blå", "blaa"],
    ["gå", "gaa"],
    ["få", "faa"],
    ["hvor", "vor"],
    ["hvem", "vem"],
    ["hva", "va", "ka"],
    ["hvordan", "vordan"],
    ["hvorfor", "vorfor"],
    ["ikke", "ikkje"],
    ["mye", "mykje"],
    ["noe", "noko"],
    ["noen", "nokon"],
    ["mellom", "mellom"],
    ["kjøre", "kjore", "kjoere"],
    ["gjøre", "gjore", "gjoere"],
    ["skjønne", "skjonne", "skjoenne"],
  ],
};

const SPEECH_HOMOPHONE_LOOKUP = (() => {
  const out = { en: new Map(), nb: new Map() };
  for (const [lang, groups] of Object.entries(SPEECH_HOMOPHONE_GROUPS)) {
    groups.forEach((group, index) => {
      const key = `${lang}:${index}`;
      for (const word of group) {
        const normalized = normalizeAnswer(String(word));
        if (!normalized) continue;
        if (!out[lang].has(normalized)) out[lang].set(normalized, new Set());
        out[lang].get(normalized).add(key);
      }
    });
  }
  return out;
})();

function getAnswerSpeechLang(card = currentCard) {
  const lang = getDirectionLabels(getActiveCategory(), card).answerLang || "en-US";
  const lower = String(lang).toLowerCase();
  if (lower.startsWith("nb") || lower.startsWith("no")) return "nb";
  // Map speech BCP-47-ish tags to our homophone tables
  if (lower.startsWith("en")) return "en";
  const short = lower.split("-")[0];
  return short || "en";
}

function sameSpeechHomophoneGroup(a, b, lang) {
  if (!a || !b || a === b) return a === b;
  const table = SPEECH_HOMOPHONE_LOOKUP[lang] || SPEECH_HOMOPHONE_LOOKUP.en;
  const groupsA = table.get(a);
  const groupsB = table.get(b);
  if (!groupsA || !groupsB) return false;
  for (const key of groupsA) {
    if (groupsB.has(key)) return true;
  }
  return false;
}

/**
 * Lightweight English metaphone-style code for speech matching.
 * Good enough for common ASR spelling swaps (to/two, write/right).
 */
function englishSpeechCode(word) {
  let w = normalizeAnswer(word).replace(/[^a-z]/g, "");
  if (!w) return "";
  if (w.length === 1) return w;

  w = w
    .replace(/^kn|^gn|^pn|^ae|^wr/g, (m) => m.slice(-1))
    .replace(/mb$/g, "m")
    .replace(/sch/g, "sk")
    .replace(/x/g, "ks")
    .replace(/cia|tch/g, "x")
    .replace(/[dt]ion/g, "xn")
    .replace(/[dt]ia/g, "x")
    .replace(/[aeiouy]/g, (ch, i) => (i === 0 ? ch : ""))
    .replace(/ph/g, "f")
    .replace(/th/g, "0")
    .replace(/gh/g, "")
    .replace(/ck/g, "k")
    .replace(/q/g, "k")
    .replace(/z/g, "s")
    .replace(/v/g, "f")
    .replace(/dg/g, "j")
    .replace(/c(?=[eiy])/g, "s")
    .replace(/c/g, "k")
    .replace(/d(?=g)/g, "j")
    .replace(/g(?=[eiy])/g, "j")
    .replace(/g/g, "k")
    .replace(/h(?![aeiou])/g, "")
    .replace(/w(?![aeiou])/g, "")
    .replace(/y(?![aeiou])/g, "")
    .replace(/(.)\1+/g, "$1");

  return w.slice(0, 8);
}

function norwegianSpeechCode(word) {
  let w = normalizeAnswer(word)
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "aa")
    .replace(/[^a-z]/g, "");
  if (!w) return "";

  w = w
    .replace(/hj|gj|lj/g, "j")
    .replace(/kj|tj|ski|sky|sky/g, "sh")
    .replace(/skj|sj|rs/g, "sh")
    .replace(/dt$/g, "t")
    .replace(/nd$/g, "n")
    .replace(/ld$/g, "l")
    .replace(/[aeiouy]/g, (ch, i) => (i === 0 ? ch : ""))
    .replace(/(.)\1+/g, "$1");

  return w.slice(0, 8);
}

function speechCode(word, lang) {
  return lang === "nb" ? norwegianSpeechCode(word) : englishSpeechCode(word);
}

function speechTokensMatch(userToken, expectedToken, lang) {
  if (!userToken || !expectedToken) return false;
  if (userToken === expectedToken) return true;
  if (norwegianTypingMatches(userToken, expectedToken)) return true;
  if (lang === "en" && englishDialectSpellingMatches(userToken, expectedToken)) return true;
  if (sameSpeechHomophoneGroup(userToken, expectedToken, lang)) return true;

  const userCode = speechCode(userToken, lang);
  const expectedCode = speechCode(expectedToken, lang);
  if (userCode && expectedCode && userCode === expectedCode) return true;

  // Short ASR swaps (e.g. final letter) when both words are still short-ish
  const distance = levenshtein(userToken, expectedToken);
  const minLen = Math.min(userToken.length, expectedToken.length);
  if (minLen >= 2 && minLen <= 5 && distance === 1) return true;
  if (minLen >= 6 && distance <= 2) return true;

  return false;
}

function answersSoundAlike(user, expected, lang = "en") {
  if (!user || !expected) return false;
  if (user === expected) return true;
  if (particleAnswerMatches(user, expected)) return true;
  if (sameSpeechHomophoneGroup(user, expected, lang)) return true;

  const userWords = user.split(" ").filter(Boolean);
  const expectedWords = expected.split(" ").filter(Boolean);

  if (userWords.length === expectedWords.length) {
    return userWords.every((word, index) => speechTokensMatch(word, expectedWords[index], lang));
  }

  // Single-token vs multi-token is usually wrong; allow full-phrase homophone only.
  if (userWords.length === 1 && expectedWords.length === 1) {
    return speechTokensMatch(userWords[0], expectedWords[0], lang);
  }

  return false;
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const next = Math.min(row[j] + 1, prev + 1, row[j - 1] + cost);
      row[j - 1] = prev;
      prev = next;
    }
    row[b.length] = prev;
  }
  return row[b.length];
}

function maxEditDistance(text) {
  const len = text.length;
  if (len <= 3) return 0;
  if (len <= 6) return 1;
  if (len <= 10) return 2;
  return Math.max(2, Math.floor(len * 0.22));
}

function answersAreClose(user, expected) {
  if (user === expected) return true;
  // Type æ ø å as ae/oe/aa (or plain a/o) - works for Norwegian answers
  if (norwegianTypingMatches(user, expected)) return true;
  // British spelling taught in Europe counts for American deck glosses
  if (englishDialectSpellingMatches(user, expected)) return true;
  // å spise ≈ spise, to be ≈ be, a vaere ≈ være
  if (particleAnswerMatches(user, expected)) return true;
  if (user.includes(expected) || expected.includes(user)) return true;

  const userCore = stripAnswerParticles(user) || user;
  const expectedCore = stripAnswerParticles(expected) || expected;
  const distance = Math.min(
    levenshtein(user, expected),
    levenshtein(userCore, expectedCore),
    levenshtein(foldNorwegianLoose(user), foldNorwegianLoose(expected)),
    levenshtein(foldNorwegianLoose(userCore), foldNorwegianLoose(expectedCore)),
    levenshtein(foldEnglishDialectSpelling(user), foldEnglishDialectSpelling(expected)),
    levenshtein(foldEnglishDialectSpelling(userCore), foldEnglishDialectSpelling(expectedCore))
  );
  // Score distance against the shorter core so "spise" vs "å spise" is not over-penalized
  const distanceBudget = Math.max(maxEditDistance(expected), maxEditDistance(expectedCore));
  return distance <= distanceBudget;
}

/**
 * Glue = high-frequency connectors/pronouns/articles (rank &lt; ~36, not phrases).
 * Review is always L2 → English (recognition); glue still matters for other UI.
 */
function isGluePracticeCard(card) {
  if (!card) return false;
  if (window.SrsCore && typeof SrsCore.isGlueCard === "function") {
    return Boolean(SrsCore.isGlueCard(card));
  }
  if (card.band === "phrase") return false;
  const foreign = String(card.foreign || "").trim();
  if (/\s/.test(foreign)) return false;
  const rank = Number(card.rank);
  return Number.isFinite(rank) && rank < 36;
}

function updateAnswerInputPlaceholder() {
  const answerInput = document.getElementById("answer-input");
  if (answerInput) answerInput.placeholder = "";
}

/**
 * Review orientation is fixed: see the learning language, answer in English.
 * (No EN → L2 production toggle - special characters + fuzzy L2 answers were a trap.)
 */
function getDirectionLabels(category = getActiveCategory()) {
  return {
    promptLabel: category.promptLabel || "Practice",
    answerLang: category.answerLang || "en-US",
    hearTitle: category.hearTitle || "Hear",
    speakTitle: category.speakTitle || "Speak your answer",
    promptLang: category.foreignLang || "nb",
    promptSpeechLang: category.speechLang || "nb-NO",
  };
}

function getPromptDisplayText(card) {
  return card?.foreign || "";
}

function getAnswerTargetText(card) {
  return card?.native || "";
}

function getExpectedAnswers(card) {
  return getAcceptedAnswers(getAnswerTargetText(card));
}

function maxNearMissDistance(expected) {
  const len = expected.length;
  if (len <= 3) return 1;
  if (len <= 6) return 2;
  if (len <= 12) return 3;
  return Math.max(3, Math.floor(len * 0.4));
}

function isSubstringNearMiss(user, expected) {
  if (user.length < 2 || expected.length < 2) return false;
  return expected.includes(user) || user.includes(expected);
}

function evaluateAnswer(userAnswer, card, options = {}) {
  const fromSpeech = Boolean(options.fromSpeech);
  const speechLang = getAnswerSpeechLang();
  const normalized = normalizeAnswer(userAnswer);
  if (!normalized) return { correct: false, near: false, far: true, close: false };

  const accepted = getExpectedAnswers(card);
  let nearest = accepted[0] || "";
  let minDistance = Infinity;
  let substringNear = false;
  let speechNear = false;

  for (const ans of accepted) {
    if (answersAreClose(normalized, ans)) {
      return {
        correct: true,
        near: false,
        far: false,
        close: normalized !== ans,
        matched: ans,
      };
    }

    if (fromSpeech && answersSoundAlike(normalized, ans, speechLang)) {
      return {
        correct: true,
        near: false,
        far: false,
        close: true,
        matched: ans,
        speechMatch: true,
      };
    }

    const distance = levenshtein(normalized, ans);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = ans;
    }

    if (isSubstringNearMiss(normalized, ans)) {
      substringNear = true;
    }
  }

  // Speech near-miss: same sound shape, but not close enough to auto-accept
  if (fromSpeech && !substringNear) {
    speechNear = accepted.some((ans) => {
      const userCode = speechCode(normalized.replace(/\s+/g, ""), speechLang);
      const ansCode = speechCode(ans.replace(/\s+/g, ""), speechLang);
      return Boolean(userCode && ansCode && userCode === ansCode && normalized !== ans);
    });
  }

  const near =
    speechNear ||
    substringNear ||
    (Number.isFinite(minDistance) &&
      minDistance > 0 &&
      minDistance <= maxNearMissDistance(nearest));

  return {
    correct: false,
    near,
    far: !near,
    nearest,
    distance: minDistance,
    close: false,
  };
}

function checkAnswer(userAnswer, card) {
  const result = evaluateAnswer(userAnswer, card);
  return { correct: result.correct, close: result.close || false };
}

function formatInterval(box) {
  return getLearningLevel(box).interval || "";
}

function formatCategory(category) {
  if (!category) return "";
  return CATEGORY_LABELS[category] || category;
}

function isLegacyDeck(cards) {
  if (!Array.isArray(cards) || cards.length === 0) return true;
  return !cards.some((card) => card.rank != null);
}

function sanitizeDeck(cards) {
  if (!Array.isArray(cards)) return [];

  const now = Date.now();
  return cards
    .filter((card) => card && card.foreign && card.native)
    .map((card) => {
      const box = Math.min(Math.max(Number(card.box) || 1, 1), BOX_COUNT);
      const nextReviewAt = Number(card.nextReviewAt);
      return {
        id: card.id || createId(),
        foreign: stripFlashcardPunctuation(card.foreign),
        native: stripFlashcardPunctuation(card.native),
        box,
        nextReviewAt: Number.isFinite(nextReviewAt) ? nextReviewAt : now,
        lastReviewedAt: card.lastReviewedAt ? Number(card.lastReviewedAt) : null,
        correctCount: Number(card.correctCount) || 0,
        incorrectCount: Number(card.incorrectCount) || 0,
        createdAt: Number(card.createdAt) || now,
        rank: card.rank ?? null,
        category: card.category ?? null,
        band: card.band ?? null,
        packId: card.packId ?? null,
        exampleForeign: card.exampleForeign
          ? stripFlashcardPunctuation(card.exampleForeign)
          : null,
        exampleNative: card.exampleNative
          ? stripFlashcardPunctuation(card.exampleNative)
          : null,
      };
    });
}

/** Prefer the card with more learning history when collapsing duplicates. */
function cardProgressScore(card) {
  if (!card) return -1;
  const box = Math.min(Math.max(Number(card.box) || 1, 1), BOX_COUNT);
  const correct = Number(card.correctCount) || 0;
  const incorrect = Number(card.incorrectCount) || 0;
  const reviewed = card.lastReviewedAt != null ? 1 : 0;
  return reviewed * 10000 + (box - 1) * 100 + correct * 2 + incorrect;
}

function cardHasLearningProgress(card) {
  if (!card) return false;
  if (card.lastReviewedAt != null) return true;
  if ((Number(card.correctCount) || 0) > 0) return true;
  if ((Number(card.incorrectCount) || 0) > 0) return true;
  if ((Number(card.box) || 1) > 1) return true;
  return false;
}

/**
 * Merge curated starter into saved deck without unbounded growth.
 * - One card per normalized foreign form (keeps best progress)
 * - Refresh gloss/band from starter
 * - Add new starter words
 * - Drop obsolete starter words only when they have no progress
 * - Always keep user-added cards (no rank)
 */
function mergeStarterIntoDeck(existing, category = getActiveCategory()) {
  const starter = buildStarterDeck(category);
  const starterByKey = new Map();
  starter.forEach((card) => {
    const key = normalizeAnswer(card.foreign);
    if (key) starterByKey.set(key, card);
  });

  // Collapse duplicates already in the saved deck.
  const existingByKey = new Map();
  let hadDuplicateKeys = false;
  existing.forEach((card) => {
    const key = normalizeAnswer(card.foreign);
    if (!key) return;
    const prev = existingByKey.get(key);
    if (!prev) {
      existingByKey.set(key, card);
      return;
    }
    hadDuplicateKeys = true;
    existingByKey.set(
      key,
      cardProgressScore(card) >= cardProgressScore(prev) ? card : prev
    );
  });

  const merged = [];
  const usedKeys = new Set();

  // Current curated set, preserving SRS when the word already exists.
  for (const entry of starter) {
    const key = normalizeAnswer(entry.foreign);
    if (!key || usedKeys.has(key)) continue;
    usedKeys.add(key);

    const current = existingByKey.get(key);
    if (current) {
      current.foreign = entry.foreign;
      current.native = entry.native;
      current.rank = entry.rank ?? current.rank;
      current.category = entry.category ?? current.category;
      current.band = entry.band ?? current.band;
      merged.push(current);
      existingByKey.delete(key);
      continue;
    }

    merged.push(entry);
  }

  // Leftovers: user cards, thematic pack cards, or studied old starter words.
  for (const card of existingByKey.values()) {
    const key = normalizeAnswer(card.foreign);
    if (!key || usedKeys.has(key)) continue;
    const isUserCard = card.rank == null;
    const isPackCard = Boolean(card.packId);
    if (isUserCard || isPackCard || cardHasLearningProgress(card)) {
      usedKeys.add(key);
      merged.push(card);
    }
    // else: drop unused obsolete starter word (e.g. replaced reading vocab)
  }

  const changed =
    hadDuplicateKeys ||
    merged.length !== existing.length ||
    merged.some((card, index) => card !== existing[index]);

  if (!changed) return existing;
  return merged.sort((a, b) => (a.rank ?? 99999) - (b.rank ?? 99999));
}

function ensureDeckIsUsable(cards) {
  let sanitized = sanitizeDeck(cards);
  if (!sanitized.length) return buildStarterDeck();

  const due = getDueCards(sanitized);
  const everReviewed = sanitized.some((card) => card.lastReviewedAt != null);
  if (!due.length && !everReviewed) {
    const now = Date.now();
    sanitized = sanitized.map((card) => ({
      ...card,
      box: 1,
      nextReviewAt: now,
    }));
  }

  return sanitized;
}

/* Thematic mini-packs (opt-in from Library → Themes) */

function getThematicPackList() {
  if (typeof window !== "undefined" && Array.isArray(window.THEMATIC_PACK_LIST)) {
    return window.THEMATIC_PACK_LIST;
  }
  if (typeof window !== "undefined" && window.THEMATIC_PACKS) {
    return Object.values(window.THEMATIC_PACKS);
  }
  return [];
}

function getThematicPackById(packId) {
  if (!packId) return null;
  if (typeof window !== "undefined" && window.THEMATIC_PACKS?.[packId]) {
    return window.THEMATIC_PACKS[packId];
  }
  return getThematicPackList().find((pack) => pack.id === packId) || null;
}

function getPackEntriesForCategory(pack, categoryId = activeCategoryId) {
  if (!pack?.byCategory) return [];
  const entries = pack.byCategory[categoryId];
  return Array.isArray(entries) ? entries : [];
}

function getEnabledPacksStorageKey(categoryId = activeCategoryId) {
  return `leitner-learning-enabled-packs-v1-${categoryId}`;
}

function getEnabledPackIds(categoryId = activeCategoryId) {
  const raw = storageGet(getEnabledPacksStorageKey(categoryId));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(String).filter(Boolean);
  } catch {
    return [];
  }
}

function setEnabledPackIds(ids, categoryId = activeCategoryId) {
  const clean = [...new Set((ids || []).map(String).filter(Boolean))];
  warnIfStorageFailed(
    storageSet(getEnabledPacksStorageKey(categoryId), JSON.stringify(clean))
  );
  return clean;
}

function isPackEnabled(packId, categoryId = activeCategoryId) {
  return getEnabledPackIds(categoryId).includes(packId);
}

function clearEnabledPacks(categoryId = activeCategoryId) {
  try {
    localStorage.removeItem(getEnabledPacksStorageKey(categoryId));
  } catch {
    // ignore
  }
}

/** Stable ranks after the 1–1000 core so packs never steal day-one order. */
function getPackRankBase(packId) {
  const list = getThematicPackList();
  const index = Math.max(
    0,
    list.findIndex((pack) => pack.id === packId)
  );
  return 1001 + index * 200;
}

function buildPackCards(pack, categoryId = activeCategoryId) {
  const entries = getPackEntriesForCategory(pack, categoryId);
  const base = getPackRankBase(pack.id);
  return entries.map((entry, index) =>
    createCard(entry.foreign, entry.native, {
      rank: base + index,
      category: entry.category || "noun",
      band: entry.band || "C",
      packId: pack.id,
      exampleForeign: entry.exampleForeign || entry.example || null,
      exampleNative: entry.exampleNative || entry.exampleEn || null,
    })
  );
}

/**
 * Merge enabled thematic packs into the deck.
 * - Skips foreign forms already present (keeps progress)
 * - Tags new cards with packId + high ranks
 * - Disable/remove is handled by removeThematicPack (pack-owned rows only)
 */
function mergeEnabledThematicPacks(cards, category = getActiveCategory()) {
  const categoryId = category?.id || activeCategoryId;
  const enabled = getEnabledPackIds(categoryId);
  if (!enabled.length) return cards;

  const byKey = new Map();
  cards.forEach((card) => {
    const key = normalizeAnswer(card.foreign);
    if (key) byKey.set(key, card);
  });

  let changed = false;
  const next = cards.slice();

  for (const packId of enabled) {
    const pack = getThematicPackById(packId);
    if (!pack) continue;
    const packCards = buildPackCards(pack, categoryId);
    for (const entry of packCards) {
      const key = normalizeAnswer(entry.foreign);
      if (!key) continue;
      const existing = byKey.get(key);
      if (existing) {
        // Leave core/user cards alone - only brand-new rows get packId,
        // so frequency intro order is never hijacked by theme tagging.
        // Pack-owned cards may pick up example lines when we add them.
        if (
          existing.packId === packId &&
          entry.exampleForeign &&
          entry.exampleNative &&
          (existing.exampleForeign !== entry.exampleForeign ||
            existing.exampleNative !== entry.exampleNative)
        ) {
          existing.exampleForeign = entry.exampleForeign;
          existing.exampleNative = entry.exampleNative;
          changed = true;
        }
        continue;
      }
      byKey.set(key, entry);
      next.push(entry);
      changed = true;
    }
  }

  if (!changed) return cards;
  return next.sort((a, b) => (a.rank ?? 99999) - (b.rank ?? 99999));
}

function countPackCardsInDeck(packId, cards = deck) {
  if (!packId) return 0;
  return cards.filter((card) => card.packId === packId).length;
}

function countPackCoverage(pack, categoryId = activeCategoryId, cards = deck) {
  const entries = getPackEntriesForCategory(pack, categoryId);
  if (!entries.length) return { total: 0, present: 0, missing: 0 };
  const existing = new Set(
    cards.map((card) => normalizeAnswer(card.foreign)).filter(Boolean)
  );
  let present = 0;
  for (const entry of entries) {
    const key = normalizeAnswer(entry.foreign);
    if (key && existing.has(key)) present += 1;
  }
  return {
    total: entries.length,
    present,
    missing: entries.length - present,
  };
}

function countNewPackCardsAvailable(pack, categoryId = activeCategoryId, cards = deck) {
  return countPackCoverage(pack, categoryId, cards).missing;
}

function setPackActionNote(packId, message) {
  if (!packId || !message) return;
  lastPackActionNote = {
    packId: String(packId),
    message: String(message),
    expiresAt: Date.now() + PACK_ACTION_NOTE_MS,
  };
  window.setTimeout(() => {
    if (
      lastPackActionNote &&
      lastPackActionNote.packId === String(packId) &&
      Date.now() >= lastPackActionNote.expiresAt
    ) {
      lastPackActionNote = null;
      if (libraryFilter === "themes") renderThematicPacks();
    }
  }, PACK_ACTION_NOTE_MS + 80);
}

function getPackActionNote(packId) {
  if (!lastPackActionNote || lastPackActionNote.packId !== String(packId || "")) {
    return "";
  }
  if (Date.now() > lastPackActionNote.expiresAt) {
    lastPackActionNote = null;
    return "";
  }
  return lastPackActionNote.message;
}

/**
 * Before merge: how many pack forms already sit in the deck, and how many
 * would disagree on English (we keep the user’s gloss).
 */
function analyzePackOverlap(pack, categoryId = activeCategoryId, cards = deck) {
  const entries = getPackEntriesForCategory(pack, categoryId);
  let already = 0;
  let glossKept = 0;
  const byKey = new Map();
  cards.forEach((card) => {
    const key = normalizeAnswer(card.foreign);
    if (key && !byKey.has(key)) byKey.set(key, card);
  });
  for (const entry of entries) {
    const key = normalizeAnswer(entry.foreign);
    if (!key) continue;
    const existing = byKey.get(key);
    if (!existing) continue;
    already += 1;
    if (
      entry.native &&
      existing.native &&
      !glossPartsMatch(existing.native, entry.native)
    ) {
      glossKept += 1;
    }
  }
  return { total: entries.length, already, glossKept };
}

function formatPackAddNote({ added, already, glossKept, total }) {
  const glossBit =
    glossKept > 0 ? `kept your English on ${glossKept}` : null;
  if (added > 0 && already > 0) {
    return [`Added ${added}`, `${already} already yours`, glossBit]
      .filter(Boolean)
      .join(" · ");
  }
  if (added > 0) {
    const base =
      total && added < total ? `Added ${added} of ${total}` : `Added ${added}`;
    return glossBit ? `${base} · ${glossBit}` : base;
  }
  if (already > 0) {
    return glossBit
      ? `All already in your deck · ${glossBit}`
      : "All already in your deck";
  }
  return total ? `Added 0 of ${total}` : "Added";
}

/**
 * Enable a pack and merge its cards into the live deck.
 * One full Add - no partial “Add rest” second step.
 * Returns { added, total, already, glossKept, packId, title }.
 */
function enableThematicPack(packId, options = {}) {
  const pack = getThematicPackById(packId);
  if (!pack) return { added: 0, total: 0, already: 0, glossKept: 0, packId, title: packId };

  const overlap = analyzePackOverlap(pack);
  const beforeKeys = new Set(
    deck.map((card) => normalizeAnswer(card.foreign)).filter(Boolean)
  );
  const enabled = getEnabledPackIds();
  if (!enabled.includes(packId)) {
    setEnabledPackIds([...enabled, packId]);
  }

  const merged = mergeEnabledThematicPacks(deck, getActiveCategory());
  let added = 0;
  merged.forEach((card) => {
    const key = normalizeAnswer(card.foreign);
    if (key && !beforeKeys.has(key) && card.packId === packId) added += 1;
  });

  deck = ensureDeckIsUsable(merged);
  saveDeck();
  // Rebuild today's queue so pack cards can enter when appropriate.
  try {
    const daily = ensureDailyPracticeState();
    if (daily && !daily.goalMet) {
      refreshDailyPracticeQueue(daily);
      saveDailyPractice(daily);
    }
  } catch {
    // non-fatal
  }

  // Stay put in Library - live line + Study on the pack card is enough.
  // Optional focusLibrary: true jumps to Themes filter (rare / tests).
  if (options.focusLibrary === true) {
    libraryFilter = "themes";
    document.querySelectorAll(".filter-chip").forEach((el) => {
      el.classList.toggle("active", el.dataset.band === "themes");
    });
  }

  const result = {
    added,
    total: overlap.total || getPackEntriesForCategory(pack).length,
    already: overlap.already,
    glossKept: overlap.glossKept,
    packId,
    title: pack.title || packId,
  };
  setPackActionNote(packId, formatPackAddNote(result));

  renderAll();
  return result;
}

/**
 * Turn off a theme and remove only pack-owned rows (packId match).
 * Core frequency cards that overlap the theme stay - progress on the spine is sacred.
 * Returns { removed, packId, title }.
 */
function removeThematicPack(packId) {
  const pack = getThematicPackById(packId);
  const title = pack?.title || packId || "Theme";
  if (!packId) return { removed: 0, packId, title };

  setEnabledPackIds(getEnabledPackIds().filter((id) => id !== packId));

  let removed = 0;
  const next = deck.filter((card) => {
    if (card.packId === packId) {
      removed += 1;
      return false;
    }
    return true;
  });

  // Always drop pack-owned rows; core overlaps (no packId) stay.
  if (removed > 0) {
    deck = ensureDeckIsUsable(next);
    saveDeck();
  }
  try {
    const daily = ensureDailyPracticeState();
    if (daily) {
      refreshDailyPracticeQueue(daily);
      saveDailyPractice(daily);
    }
  } catch {
    // non-fatal
  }

  if (themeSessionPackId === packId) {
    clearThemePracticeSession();
    sessionQueue = [];
    currentCard = null;
    currentCardId = null;
  }

  renderAll();
  return { removed, packId, title };
}

function renderThemePackWordList(pack, category) {
  const entries = getPackEntriesForCategory(pack, category.id);
  if (!entries.length) return "";
  const rows = entries
    .map((entry) => {
      const foreign = String(entry.foreign || "").trim();
      const native = String(entry.native || "").trim();
      if (!foreign) return "";
      // English left (anchor) · L2 right (target) - tight pair for scanning before Add.
      return `<li class="library-theme-word">
        <span class="library-theme-word-en">${escapeHtml(native)}</span>
        <span class="library-theme-word-l2" lang="${escapeAttr(category.foreignLang || "nb")}">${escapeHtml(foreign)}</span>
      </li>`;
    })
    .filter(Boolean)
    .join("");
  if (!rows) return "";
  // Preview before Add (and quick reference after) - collapsed by default.
  // Scroll fades (more above/below) mirror the language menu: 20 words never look “complete” at a glance.
  return `<details class="library-theme-preview">
    <summary class="library-theme-preview-summary">${entries.length}</summary>
    <ul class="library-theme-word-list" role="list" data-pack-word-scroll>${rows}</ul>
  </details>`;
}

function renderThemePackCard(pack, category) {
  const coverage = countPackCoverage(pack, category.id);
  const enabled = isPackEnabled(pack.id);
  // Ephemeral Add result wins briefly; else coverage when enabled.
  const actionNote = getPackActionNote(pack.id);
  const status = actionNote
    ? actionNote
    : enabled && coverage.total > 0
      ? `${coverage.present}/${coverage.total}`
      : "";

  let actions = "";
  if (enabled) {
    // Study top-right (primary) · Remove bottom-right (quiet reverse).
    // Full pack merges on Add - no “Add rest” half-step.
    actions = `<button
        type="button"
        class="btn primary library-theme-btn library-theme-btn--study"
        data-pack-study="${escapeAttr(pack.id)}"
        aria-label="${escapeAttr(`Study ${pack.title}`)}"
      >Study</button><button
        type="button"
        class="btn ghost library-theme-btn library-theme-btn--remove"
        data-pack-remove="${escapeAttr(pack.id)}"
        aria-label="${escapeAttr(`Remove ${pack.title} from deck`)}"
      >Remove</button>`;
  } else {
    actions = `<button
        type="button"
        class="btn secondary library-theme-btn library-theme-btn--add"
        data-pack-enable="${escapeAttr(pack.id)}"
        aria-label="${escapeAttr(`Add ${pack.title} to deck`)}"
      >Add</button>`;
  }

  // Compact tile:
  //   Name              [Study / Add]
  //   20/20 (if any)
  //   › N               [Remove]
  // Open word list spans the full tile under that.
  return `
    <li class="library-theme-card${enabled ? " is-enabled" : ""}" data-pack-id="${escapeAttr(pack.id)}">
      <div class="library-theme-top">
        <p class="library-theme-name">${escapeHtml(pack.title)}</p>
        <div class="library-theme-actions">${actions}</div>
        ${
          status
            ? `<p class="library-theme-status">${escapeHtml(status)}</p>`
            : ""
        }
        ${renderThemePackWordList(pack, category)}
      </div>
    </li>`;
}

function renderThematicPacks() {
  const root = document.getElementById("library-themes");
  const body = document.getElementById("library-themes-body");
  if (!root) return;

  // Packs filter only - never under All / Phrases / Yours.
  if (libraryFilter !== "themes") {
    root.classList.add("hidden");
    root.classList.remove("has-enabled");
    if (body) body.innerHTML = "";
    return;
  }

  const category = getActiveCategory();
  // Alphabetical - stable, scannable; not “random” pack-definition order.
  const packs = getThematicPackList()
    .filter((pack) => getPackEntriesForCategory(pack, category.id).length > 0)
    .slice()
    .sort((a, b) =>
      String(a.title || a.id || "").localeCompare(
        String(b.title || b.id || ""),
        "en",
        { sensitivity: "base" }
      )
    );

  if (!packs.length) {
    root.classList.add("hidden");
    if (body) body.innerHTML = "";
    return;
  }

  const enabledCount = packs.filter((pack) => isPackEnabled(pack.id)).length;
  const grid = `<ul class="library-themes-grid" role="list">${packs
    .map((pack) => renderThemePackCard(pack, category))
    .join("")}</ul>`;

  root.classList.remove("hidden");
  root.classList.toggle("has-enabled", enabledCount > 0);
  if (body) body.innerHTML = grid;
  else root.innerHTML = grid;

  // One peek at a time - opening Bank closes Dining (and vice versa).
  bindLibraryThemePreviewAccordion(body || root);
}

/**
 * Fade when more pack words sit above/below the fold (same lesson as the language menu).
 * Classes only - no extra chrome that jumps layout.
 */
function updatePackWordListScrollHints(list) {
  if (!list) return;
  const canScroll = list.scrollHeight > list.clientHeight + 4;
  const atTop = list.scrollTop <= 2;
  const atBottom =
    list.scrollTop + list.clientHeight >= list.scrollHeight - 4;
  list.classList.toggle("is-scrollable", canScroll);
  list.classList.toggle("has-more-below", canScroll && !atBottom);
  list.classList.toggle("has-more-above", canScroll && !atTop);
}

/**
 * Pack word previews: exclusive open. Keeps the Packs grid calm when
 * scanning - one expanded list, not a page of open columns.
 * Always start the open list at the top (not mid-scroll from a prior peek).
 * Scroll fades show “more words” above/below - same as language picker.
 */
function bindLibraryThemePreviewAccordion(scope) {
  if (!scope) return;
  scope.querySelectorAll(".library-theme-preview").forEach((details) => {
    const list =
      details.querySelector("[data-pack-word-scroll]") ||
      details.querySelector(".library-theme-word-list");
    if (list && list.dataset.scrollHintsBound !== "1") {
      list.dataset.scrollHintsBound = "1";
      list.addEventListener(
        "scroll",
        () => updatePackWordListScrollHints(list),
        { passive: true }
      );
    }

    details.addEventListener("toggle", () => {
      if (!details.open) {
        if (list) {
          list.classList.remove(
            "is-scrollable",
            "has-more-below",
            "has-more-above"
          );
        }
        return;
      }
      scope.querySelectorAll(".library-theme-preview[open]").forEach((other) => {
        if (other !== details) other.open = false;
      });
      if (!list) return;
      // After layout - top of list + fade cue for “more below.”
      list.scrollTop = 0;
      requestAnimationFrame(() => {
        list.scrollTop = 0;
        updatePackWordListScrollHints(list);
        requestAnimationFrame(() => updatePackWordListScrollHints(list));
      });
    });
  });
}

function migrateLegacyStorage(categoryId) {
  const modernKey = getDeckStorageKey(categoryId);
  if (storageGet(modernKey)) return;

  for (const key of LEGACY_STORAGE_KEYS) {
    try {
      const raw = storageGet(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        storageSet(modernKey, JSON.stringify(parsed));
        return;
      }
    } catch {
      // try next key
    }
  }
}

function loadDeck(categoryId = activeCategoryId) {
  migrateLegacyStorage(categoryId);
  const storageKey = getDeckStorageKey(categoryId);

  try {
    const raw = storageGet(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (isLegacyDeck(parsed)) {
          const upgraded = ensureDeckIsUsable(buildStarterDeck(getCategoryById(categoryId)));
          storageSet(storageKey, JSON.stringify(upgraded));
          return upgraded;
        }
        let usable = ensureDeckIsUsable(parsed);
        const merged = mergeStarterIntoDeck(usable, getCategoryById(categoryId));
        // Reassign when cards were added or gloss/metadata refreshed.
        if (merged !== usable) {
          usable = ensureDeckIsUsable(merged);
        }
        const withPacks = mergeEnabledThematicPacks(
          usable,
          getCategoryById(categoryId)
        );
        if (withPacks !== usable) {
          usable = ensureDeckIsUsable(withPacks);
        }
        if (usable.length) {
          storageSet(storageKey, JSON.stringify(usable));
          return usable;
        }
      }
    }
  } catch {
    // fall through to starter deck
  }

  const starter = ensureDeckIsUsable(buildStarterDeck(getCategoryById(categoryId)));
  storageSet(storageKey, JSON.stringify(starter));
  return starter;
}

function saveDeck() {
  invalidateKnownForeignFormCache();
  warnIfStorageFailed(storageSet(getDeckStorageKey(), JSON.stringify(deck)));
}

async function resetToStarter() {
  const category = getActiveCategory();
  const confirmed = await showConfirm(
    category.resetConfirm || {
      verb: "Reset",
      storyTitle: "Deck",
      note: "Your progress and any words you added will be cleared.",
    },
    { confirmLabel: "Reset deck", cancelLabel: "Cancel", compact: true }
  );
  if (!confirmed) return;
  clearEnabledPacks(category.id);
  deck = buildStarterDeck(category);
  saveDeck();
  resetDailyPractice();
  resetStreakState();
  clearReadProgress();
  sessionDayKey = "";
  sessionQueue = [];
  sessionReviewed = 0;
  sessionCorrect = 0;
  sessionIncorrect = 0;
  sessionJustCompleted = false;
  clearThemePracticeSession();
  currentCard = null;
  setSpeakMode(false);
  startPractice();
  renderAll();
}

function syncPracticeSessionDay() {
  const today = getLocalDayKey();
  if (sessionDayKey && sessionDayKey !== today) {
    sessionQueue = [];
    currentCard = null;
    sessionReviewed = 0;
    sessionCorrect = 0;
    sessionIncorrect = 0;
    sessionJustCompleted = false;
    clearThemePracticeSession();
  }
  sessionDayKey = today;
}

function buildSessionQueue() {
  syncPracticeSessionDay();

  // Theme focus session owns the queue until it empties.
  if (themeSessionPackId) {
    if (!sessionQueue.length && !currentCard) {
      themeSessionPackId = null;
    } else {
      return;
    }
  }

  const state = ensureDailyPracticeState();
  const due = getDueCards(deck);
  const completed = new Set(state.completedIds);

  if (state.extraMode) {
    sessionQueue = due
      .filter((card) => !completed.has(card.id))
      .sort(compareCardsForPractice)
      .map((card) => card.id);
    return;
  }

  const dueIds = new Set(due.map((card) => card.id));
  sessionQueue = state.dailyQueue.filter(
    (id) => dueIds.has(id) && !completed.has(id)
  );
}

function nextInSession() {
  if (sessionQueue.length === 0) {
    if (themeSessionPackId) {
      const pack = getThematicPackById(themeSessionPackId);
      lastThemeSessionNote = {
        title: pack?.title || "Theme",
        reviewed: themeSessionTotal || sessionReviewed || 0,
      };
      clearThemePracticeSession();
    }
    currentCard = null;
    return null;
  }
  const id = sessionQueue.shift();
  currentCard = deck.find((c) => c.id === id) || null;
  return currentCard;
}

function clearThemePracticeSession() {
  themeSessionPackId = null;
  themeSessionTotal = 0;
}

function getThemeSessionRemaining() {
  if (!themeSessionPackId) return 0;
  return sessionQueue.length + (currentCard ? 1 : 0);
}

function getThemeSessionDoneCount() {
  if (!themeSessionPackId || !themeSessionTotal) return 0;
  return Math.max(0, themeSessionTotal - getThemeSessionRemaining());
}

/**
 * Cards belonging to a theme: packId tag or matching foreign form from the pack list.
 */
function getDeckCardsForPack(packId, categoryId = activeCategoryId, cards = deck) {
  const pack = getThematicPackById(packId);
  if (!pack) return [];
  const keys = new Set(
    getPackEntriesForCategory(pack, categoryId)
      .map((entry) => normalizeAnswer(entry.foreign))
      .filter(Boolean)
  );
  return cards.filter((card) => {
    if (card.packId === packId) return true;
    const key = normalizeAnswer(card.foreign);
    return key && keys.has(key);
  });
}

/** Ensure pack is enabled and its unique cards are merged into the deck. */
function ensurePackInDeck(packId) {
  const pack = getThematicPackById(packId);
  if (!pack) return false;
  const enabled = getEnabledPackIds();
  if (!enabled.includes(packId)) {
    setEnabledPackIds([...enabled, packId]);
  }
  const merged = mergeEnabledThematicPacks(deck, getActiveCategory());
  if (merged !== deck) {
    deck = ensureDeckIsUsable(merged);
    saveDeck();
  }
  return true;
}

/**
 * Start a short focused Review set for one theme (due first, then new).
 * Caps at THEME_SESSION_CAP so it stays a small bite.
 */
function startThemePracticeSession(packId) {
  if (!packId || !ensurePackInDeck(packId)) {
    return { ok: false, reason: "missing", count: 0 };
  }

  const packCards = getDeckCardsForPack(packId);
  if (!packCards.length) {
    return { ok: false, reason: "empty", count: 0 };
  }

  const dueReviews = packCards
    .filter((card) => isDue(card) && !isNewCard(card))
    .sort(compareCardsForPractice);
  const dueNew = packCards
    .filter((card) => isDue(card) && isNewCard(card))
    .sort((a, b) => (Number(a.rank) || 99999) - (Number(b.rank) || 99999));
  const waiting = packCards
    .filter((card) => !isDue(card))
    .sort(compareCardsForPractice);

  const cap = Math.min(THEME_SESSION_CAP, getDailyPracticeCap() || THEME_SESSION_CAP);
  const ordered = [...dueReviews, ...dueNew];
  // If nothing is due, still offer a small intentional set from waiting cards.
  if (!ordered.length) {
    ordered.push(...waiting.slice(0, Math.min(6, cap)));
  } else if (ordered.length < cap) {
    // Light fill only when the due set is short.
    for (const card of waiting) {
      if (ordered.length >= cap) break;
      ordered.push(card);
    }
  }

  const picked = [];
  const seen = new Set();
  for (const card of ordered) {
    if (seen.has(card.id)) continue;
    picked.push(card.id);
    seen.add(card.id);
    if (picked.length >= cap) break;
  }

  if (!picked.length) {
    return { ok: false, reason: "empty", count: 0 };
  }

  // Make any waiting cards in this bite due now (user asked to study them).
  const now = Date.now();
  let touched = false;
  picked.forEach((id) => {
    const card = deck.find((c) => c.id === id);
    if (card && card.nextReviewAt > now) {
      card.nextReviewAt = now;
      touched = true;
    }
  });
  if (touched) saveDeck();

  themeSessionPackId = packId;
  themeSessionTotal = picked.length;
  lastThemeSessionNote = null;
  sessionJustCompleted = false;
  sessionReviewed = 0;
  sessionCorrect = 0;
  sessionIncorrect = 0;
  sessionQueue = picked.slice();
  currentCard = null;
  currentCardId = null;
  resetCardAttempts();
  hideFeedback();
  setSpeakMode(false);
  nextInSession();
  switchTab("practice");
  renderPractice();
  return { ok: true, reason: "started", count: picked.length };
}

function updateCardInDeck(updated) {
  const idx = deck.findIndex((c) => c.id === updated.id);
  if (idx !== -1) deck[idx] = updated;
  saveDeck();
}

function handleCorrect() {
  recordDailyCompletion(currentCard.id);
  const updated = promote(currentCard);
  updateCardInDeck(updated);
  currentCard = updated;
  sessionReviewed += 1;
  sessionCorrect += 1;
  return updated;
}

function handleIncorrect(requeue = true) {
  const updated = demote(currentCard);
  updateCardInDeck(updated);
  currentCard = updated;
  if (requeue) sessionQueue.push(updated.id);
  sessionReviewed += 1;
  sessionIncorrect += 1;
  return updated;
}

function advanceCard() {
  const hadCard = currentCard !== null;
  currentCard = nextInSession();
  if (hadCard && !currentCard && sessionReviewed > 0) {
    sessionJustCompleted = true;
  }
  renderAll();
}

function getSpeechRecognitionCtor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function speechRecognitionAvailable() {
  return Boolean(getSpeechRecognitionCtor());
}

function getSpeechUnavailableMessage() {
  if (!window.isSecureContext) {
    return "Speaking needs a secure link (https). You can type instead.";
  }
  if (!speechRecognitionAvailable()) {
    return "Speaking is not available in this browser. Type instead.";
  }
  return "Could not start speaking. Type instead.";
}

/**
 * Platform notes (Speak + Hear) - verify all when changing audio code:
 * - Desktop Chrome: cloud speech; interim + stable accept for normal volume.
 * - Desktop Safari: Nora TTS; never force Google when OS nb exists.
 * - Mobile Chrome: continuous recognition is unreliable and still re-toasts on restart;
 *   use one-shot listen that actually hears. Toast on each card is a Chrome OS UI limit.
 * - Mobile Safari/iOS: unlock AudioContext; prefer system nb TTS (Nora) at rate/pitch 1.
 */
function isCoarsePointerDevice() {
  try {
    return window.matchMedia("(pointer: coarse)").matches;
  } catch {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");
  }
}

function isAppleWebKitBrowser() {
  const ua = navigator.userAgent || "";
  return /AppleWebKit/i.test(ua) && !/Chrome|Chromium|CriOS|Edg|EdgiOS|Firefox|FxiOS/i.test(ua);
}

function isIosDevice() {
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua)) return true;
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

function prefersAppleSystemTts() {
  return isAppleWebKitBrowser() || isIosDevice();
}

/** Reuse one SpeechRecognition object (less flaky than new every time). */
let speakRecInstance = null;
let speakInterimStableTimer = null;

function getSpeakRecognition() {
  const SpeechRecognition = getSpeechRecognitionCtor();
  if (!SpeechRecognition) return null;

  if (!speakRecInstance) {
    speakRecInstance = new SpeechRecognition();
  }

  const rec = speakRecInstance;
  rec.lang = getDirectionLabels(getActiveCategory(), currentCard).answerLang || "en-US";
  rec.interimResults = true;
  // one-shot: reliable hearing on mobile Chrome (continuous broke pickup there)
  rec.continuous = false;
  rec.maxAlternatives = 5;
  return rec;
}

/** Wake audio on first tap so Hear works on iOS. Avoid speechSynthesis cancel warm-up. */
let audioPipelineUnlocked = false;

function unlockAudioPipeline() {
  if (audioPipelineUnlocked) return;
  audioPipelineUnlocked = true;

  try {
    const ctx = getGoalAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
  } catch {
    /* ignore */
  }

  try {
    const a = new Audio();
    a.src =
      "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
    a.volume = 0.01;
    const p = a.play();
    if (p && typeof p.then === "function") {
      p.then(() => {
        a.pause();
      }).catch(() => {});
    }
  } catch {
    /* ignore */
  }
}

function ensureAudioUnlockListeners() {
  if (ensureAudioUnlockListeners.bound) return;
  ensureAudioUnlockListeners.bound = true;
  const once = () => {
    unlockAudioPipeline();
    document.removeEventListener("pointerdown", once, true);
    document.removeEventListener("keydown", once, true);
    document.removeEventListener("touchstart", once, true);
  };
  document.addEventListener("pointerdown", once, true);
  document.addEventListener("keydown", once, true);
  document.addEventListener("touchstart", once, true);
}

const SPEAK_CARD_DELAY_MS = 400;
const SPEAK_RETRY_DELAY_MS = 3200;
/** Longer window so normal-volume speech is not cut off mid-phrase. */
const SPEAK_ATTEMPT_MS = 16000;
/** After interim text is stable this long, accept it (helps quiet speakers on Chrome). */
const SPEAK_INTERIM_STABLE_MS = 900;
const SPEAK_ADVANCE_CORRECT_MS = 4000;
const SPEAK_ADVANCE_WRONG_MS = 5000;
const TYPING_ADVANCE_CORRECT_MS = 4500;
const TYPING_ADVANCE_WRONG_MS = 5500;
const MAX_CLOSE_RETRIES = 2;
/** Cap quiet re-listens so Chrome "network" errors cannot loop forever. */
const SPEAK_SOFT_RETRY_MAX = 2;
let speakSoftRetries = 0;

function clearSpeakAttemptTimer() {
  if (speakAttemptTimer) {
    window.clearTimeout(speakAttemptTimer);
    speakAttemptTimer = null;
  }
}

function clearSpeakCardDelayTimer() {
  if (speakCardDelayTimer) {
    window.clearTimeout(speakCardDelayTimer);
    speakCardDelayTimer = null;
  }
}

function clearCardAdvanceTimer() {
  if (cardAdvanceTimer) {
    window.clearTimeout(cardAdvanceTimer);
    cardAdvanceTimer = null;
  }
}

function clearSpeakScheduling() {
  speakAttemptId += 1;
  clearSpeakAttemptTimer();
  clearSpeakCardDelayTimer();
}

function updateSpeakButtonUI() {
  const btn = document.getElementById("speak-btn");
  if (!btn) return;

  btn.setAttribute("aria-pressed", String(speakModeActive));
  btn.textContent = speakListening ? "Listening…" : "Speak";
  btn.classList.toggle("listening", speakListening);

  btn.removeAttribute("title");
}

function setListeningUI(active) {
  speakListening = active;
  updateSpeakButtonUI();
}

function clearSpeakInterimTimer() {
  if (speakInterimStableTimer) {
    window.clearTimeout(speakInterimStableTimer);
    speakInterimStableTimer = null;
  }
}

function stopActiveRecognition() {
  speakAttemptId += 1;
  clearSpeakInterimTimer();
  clearSpeakAttemptTimer();
  const rec = recognition;
  recognition = null;
  if (!rec) return;
  rec.onresult = null;
  rec.onerror = null;
  rec.onend = null;
  rec.onstart = null;
  try {
    rec.stop();
  } catch {
    try {
      rec.abort();
    } catch {
      /* ignore */
    }
  }
}

function setSpeakMode(active) {
  speakModeActive = active;
  if (!active) {
    clearSpeakScheduling();
    stopActiveRecognition();
    setListeningUI(false);
    speakSoftRetries = 0;
  } else {
    hideFeedback();
    speakSoftRetries = 0;
  }
  updateSpeakButtonUI();
  updateAnswerInputPlaceholder();
}

/**
 * Toggle speak mode. No permission lectures / getUserMedia (those re-prompt on phones).
 */
function toggleSpeakMode() {
  if (speakModeActive) {
    setSpeakMode(false);
    hideFeedback();
    return;
  }

  hideFeedback();
  unlockAudioPipeline();

  if (!window.isSecureContext || !speechRecognitionAvailable()) {
    showFeedback(getSpeechUnavailableMessage(), "revealed", { autoHideMs: 5000 });
    return;
  }

  setSpeakMode(true);
  if (currentCard) {
    beginSpeakAttempt();
  }
}

function ensureCardAttemptState() {
  if (!currentCard) {
    currentCardId = null;
    currentCardAttempts = 0;
    return;
  }
  if (currentCard.id !== currentCardId) {
    currentCardId = currentCard.id;
    currentCardAttempts = 0;
  }
}

function resetCardAttempts() {
  currentCardAttempts = 0;
}

function setAnswerFieldHighlight(nearMiss) {
  const input = document.getElementById("answer-input");
  if (!input) return;
  input.classList.toggle("near-miss", nearMiss);
  if (nearMiss) input.classList.remove("received");
}

function setAnswerReceivedState(received) {
  const input = document.getElementById("answer-input");
  if (!input) return;
  input.classList.toggle("received", received);
  if (received) input.classList.remove("near-miss", "incorrect");
}

function setAnswerIncorrectState(on) {
  const input = document.getElementById("answer-input");
  if (!input) return;
  input.classList.toggle("incorrect", on);
  if (on) input.classList.remove("received", "near-miss");
}

function scheduleSpeakForCurrentCard(delayMs = SPEAK_CARD_DELAY_MS) {
  clearSpeakScheduling();
  if (!speakModeActive || !currentCard) return;

  clearCardAdvanceTimer();
  speakCardDelayTimer = window.setTimeout(() => {
    speakCardDelayTimer = null;
    beginSpeakAttempt();
  }, delayMs);
}

function handleSpeakAttemptTimeout() {
  if (!speakModeActive || !currentCard) return;

  stopActiveRecognition();
  setListeningUI(false);

  const answerText = getAnswerTargetText(currentCard);
  setAnswerIncorrectState(true);
  handleIncorrect();
  const withExample = showIncorrectWithExample(currentCard, answerText);
  finishCardAndContinue(getAdvanceDelay(false, true, { withExample }));
}

function bestTranscriptFromSpeechEvent(event) {
  if (!event?.results?.length) return "";
  let finalText = "";
  let interimText = "";
  for (let i = event.resultIndex; i < event.results.length; i += 1) {
    const result = event.results[i];
    if (!result?.[0]) continue;
    let piece = "";
    let bestConf = -1;
    for (let a = 0; a < result.length; a += 1) {
      const alt = result[a];
      const conf = typeof alt.confidence === "number" ? alt.confidence : 0;
      if (!piece || conf >= bestConf) {
        piece = String(alt.transcript || "").trim();
        bestConf = conf;
      }
    }
    if (!piece) continue;
    if (result.isFinal) finalText = piece;
    else interimText = piece;
  }
  return finalText || interimText;
}

/**
 * One-shot listen for the current card.
 * Priority: actually hear speech. Chrome mobile may toast on each start() - 
 * continuous mode there still re-toasted and stopped capturing audio.
 */
function beginSpeakAttempt() {
  if (!speakModeActive || !currentCard) return;
  if (!window.isSecureContext || !speechRecognitionAvailable()) {
    setSpeakMode(false);
    return;
  }

  unlockAudioPipeline();
  stopActiveRecognition();
  clearSpeakAttemptTimer();
  clearSpeakInterimTimer();

  const attemptId = ++speakAttemptId;
  const rec = getSpeakRecognition();
  if (!rec) {
    setSpeakMode(false);
    return;
  }
  recognition = rec;

  setListeningUI(true);
  hideFeedback();

  let settled = false;
  let lastHeard = "";

  const acceptTranscript = (raw) => {
    if (settled || attemptId !== speakAttemptId) return;
    const transcript = String(raw || "").trim();
    if (!transcript) return;
    settled = true;
    speakSoftRetries = 0;
    clearSpeakInterimTimer();
    clearSpeakAttemptTimer();
    stopActiveRecognition();
    setListeningUI(false);
    const answerInput = document.getElementById("answer-input");
    if (answerInput) answerInput.value = transcript;
    submitAnswer({ fromSpeech: true });
  };

  rec.onstart = () => {
    if (attemptId !== speakAttemptId) return;
    setListeningUI(true);
  };

  rec.onresult = (event) => {
    if (attemptId !== speakAttemptId || settled) return;
    const transcript = bestTranscriptFromSpeechEvent(event);
    if (!transcript) return;

    lastHeard = transcript;
    const answerInput = document.getElementById("answer-input");
    if (answerInput) answerInput.value = transcript;

    const last = event.results?.[event.results.length - 1];
    if (last?.isFinal) {
      clearSpeakInterimTimer();
      acceptTranscript(transcript);
      return;
    }

    clearSpeakInterimTimer();
    speakInterimStableTimer = window.setTimeout(() => {
      speakInterimStableTimer = null;
      if (!settled && attemptId === speakAttemptId && lastHeard) {
        acceptTranscript(lastHeard);
      }
    }, SPEAK_INTERIM_STABLE_MS);
  };

  rec.onerror = (event) => {
    if (attemptId !== speakAttemptId || settled) return;
    clearSpeakInterimTimer();
    clearSpeakAttemptTimer();
    stopActiveRecognition();
    setListeningUI(false);

    if (event.error === "aborted") return;

    if (lastHeard) {
      acceptTranscript(lastHeard);
      return;
    }

    if (event.error === "not-allowed" || event.error === "service-not-allowed") {
      setSpeakMode(false);
      return;
    }

    if (event.error === "network" || event.error === "no-speech") {
      if (speakModeActive && currentCard && speakSoftRetries < SPEAK_SOFT_RETRY_MAX) {
        speakSoftRetries += 1;
        scheduleSpeakForCurrentCard(400);
        return;
      }
      speakSoftRetries = 0;
      if (event.error === "network") {
        setSpeakMode(false);
      }
      return;
    }

    if (speakModeActive) {
      handleSpeakAttemptTimeout();
    }
  };

  rec.onend = () => {
    if (attemptId !== speakAttemptId || settled) return;

    if (lastHeard) {
      acceptTranscript(lastHeard);
      return;
    }

    // Desktop: one more listen window. Mobile: do not auto-restart (toast + flaky).
    if (!isCoarsePointerDevice() && speakModeActive && currentCard) {
      try {
        rec.start();
        setListeningUI(true);
      } catch {
        /* ignore */
      }
    }
  };

  speakAttemptTimer = window.setTimeout(() => {
    if (attemptId !== speakAttemptId || settled) return;
    clearSpeakInterimTimer();
    if (lastHeard) {
      acceptTranscript(lastHeard);
      return;
    }
    handleSpeakAttemptTimeout();
  }, SPEAK_ATTEMPT_MS);

  try {
    rec.start();
  } catch {
    try {
      rec.stop();
    } catch {
      /* ignore */
    }
    window.setTimeout(() => {
      if (attemptId !== speakAttemptId || !speakModeActive) return;
      try {
        rec.start();
      } catch {
        setListeningUI(false);
        setSpeakMode(false);
      }
    }, 100);
  }
}

function getAdvanceDelay(correct, fromSpeech = false, options = {}) {
  const withExample = Boolean(options.withExample);
  let ms;
  if (fromSpeech || speakModeActive) {
    ms = correct ? SPEAK_ADVANCE_CORRECT_MS : SPEAK_ADVANCE_WRONG_MS;
  } else {
    ms = correct ? TYPING_ADVANCE_CORRECT_MS : TYPING_ADVANCE_WRONG_MS;
  }
  // Give time to read a story line after a miss.
  if (!correct && withExample) ms += 2200;
  return ms;
}

function finishCardAndContinue(delayMs) {
  clearSpeakScheduling();
  stopActiveRecognition();
  setListeningUI(false);
  clearCardAdvanceTimer();

  cardAdvanceTimer = window.setTimeout(() => {
    cardAdvanceTimer = null;
    advanceCard();
    resumeSpeakModeIfNeeded();
  }, delayMs);
}

function resumeSpeakModeIfNeeded() {
  if (!speakModeActive) return;
  if (!currentCard) {
    setSpeakMode(false);
    return;
  }
  scheduleSpeakForCurrentCard();
}

/**
 * Speech synthesis (Hear)
 * -----------------------
 * Simple, testable routing - prefer reliability over clever hacks:
 * - Safari/iOS female → Apple Nora (natural)
 * - Safari/iOS male → Google TTS male profile when no OS male (clear difference)
 * - Chrome → Google TTS first (works when system voices are empty/broken), then system
 * - Never use createMediaElementSource (silences Chrome cross-origin / CORS audio)
 * - No speechSynthesis warm-up cancel (degrades Safari quality)
 */
let speechVoicesCache = [];
let speechVoicesListening = false;
let preferredVoiceGender = loadVoiceGender();
let ttsPlayToken = 0;
let ttsAudioEl = null;
/** Every Audio we create - must all be killed on stop (orphans can keep playing). */
const ttsActiveAudios = new Set();
/** Delayed speak timer (must clear on stop - else sample phrase can replay later). */
let ttsSpeakDelayTimer = null;
/** Minimum score to treat an OS Norwegian voice as "premium neural". */
const NB_PREMIUM_VOICE_SCORE = 45;

/** Short preview so a stuck sample cannot dominate Hear. */
const VOICE_PREVIEW_PHRASE = "Hei";

function loadVoiceGender() {
  const saved = storageGet(VOICE_GENDER_KEY);
  return VOICE_GENDERS.includes(saved) ? saved : "female";
}

function saveVoiceGender(gender) {
  preferredVoiceGender = VOICE_GENDERS.includes(gender) ? gender : "female";
  storageSet(VOICE_GENDER_KEY, preferredVoiceGender);
  updateVoiceGenderUI();
}

function triggerVoiceGenderHaptic() {
  // Short single tick - lighter than goal / language-switch patterns.
  if (typeof navigator.vibrate === "function") {
    navigator.vibrate(12);
  }
}

function setVoiceGender(gender) {
  const next = VOICE_GENDERS.includes(gender) ? gender : "female";
  unlockAudioPipeline();
  const changed = next !== preferredVoiceGender;
  if (changed) {
    saveVoiceGender(next);
    triggerVoiceGenderHaptic();
  } else {
    updateVoiceGenderUI();
  }
  /* Isolated preview - separate from Hear so it cannot stick in a queue/timer */
  playVoiceGenderPreview();
}

function voiceGenderLabel(gender = preferredVoiceGender) {
  return gender === "male" ? "Male" : "Female";
}

function updateVoiceGenderUI() {
  const label = voiceGenderLabel();
  const control = document.getElementById("voice-gender-control");
  if (control) {
    control.dataset.voiceGender = preferredVoiceGender;
    control.setAttribute("aria-label", `Voice: ${label}`);
  }
  document.querySelectorAll("[data-voice-gender]").forEach((btn) => {
    const on = btn.dataset.voiceGender === preferredVoiceGender;
    const gender = btn.dataset.voiceGender === "male" ? "Male" : "Female";
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.setAttribute("aria-label", `${gender} voice${on ? ", selected" : ""}`);
  });
}

function killTtsAudioElement(audio) {
  if (!audio) return;
  try {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
  } catch {
    /* ignore */
  }
  ttsActiveAudios.delete(audio);
}

function stopAllSpeech() {
  ttsPlayToken += 1;
  if (ttsSpeakDelayTimer) {
    window.clearTimeout(ttsSpeakDelayTimer);
    ttsSpeakDelayTimer = null;
  }
  // Kill every Audio we ever started (preview can otherwise finish loading and play late)
  for (const audio of [...ttsActiveAudios]) {
    killTtsAudioElement(audio);
  }
  ttsActiveAudios.clear();
  ttsAudioEl = null;
  // Safari often keeps speaking after a single cancel(); double-cancel clears the queue.
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* ignore */
  }
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* ignore */
  }
}

function ensureSpeechVoicesListener() {
  if (speechVoicesListening || !window.speechSynthesis) return;
  speechVoicesListening = true;
  const refresh = () => {
    speechVoicesCache = window.speechSynthesis.getVoices() || [];
  };
  refresh();
  if (typeof window.speechSynthesis.addEventListener === "function") {
    window.speechSynthesis.addEventListener("voiceschanged", refresh);
  } else {
    window.speechSynthesis.onvoiceschanged = refresh;
  }
}

function getSpeechVoices() {
  ensureSpeechVoicesListener();
  if (!window.speechSynthesis) return [];
  const live = window.speechSynthesis.getVoices() || [];
  if (live.length) speechVoicesCache = live;
  return speechVoicesCache;
}

function isNorwegianLangTag(lang) {
  const tag = String(lang || "")
    .toLowerCase()
    .replace(/_/g, "-");
  return tag.startsWith("nb") || tag.startsWith("nn") || tag === "no" || tag.startsWith("no-");
}

function isEnglishLangTag(lang) {
  return String(lang || "")
    .toLowerCase()
    .replace(/_/g, "-")
    .startsWith("en");
}

/** Infer gender from engine name (Web Speech API has no gender field). */
function detectVoiceGender(voice) {
  const hay = `${voice.name || ""} ${voice.voiceURI || ""}`.toLowerCase();

  if (
    /\b(female|woman|girl|fiona|samantha|karen|moira|tessa|veena|zira|susan|hazel|serena|martha|catherine|victoria)\b/.test(
      hay
    ) ||
    /\b(nora|hulda|pernille|iselin|kari|liv|astrid|freja|freya|sonia|jenny|sara|emma|ava)\b/.test(
      hay
    ) ||
    // DE / FR / ES / IT / NL / PT / PL / SV / DA common system-voice names
    /\b(anna|hedda|katja|vicki|hedda|amelie|julie|paulina|hortense|denise|eloise|brigitte|celine|marie|lucia|elsa|bianca|paola|cosima|elsa|alva|klara|sofie|naja|sara|ellen|fiona|monica|paulina|zira|helena|joana|raquel|maria|ines|inês|fernanda|luciana|vitória|vitoria|zira|maja|zosia|agnieszka|zofia)\b/.test(
      hay
    )
  ) {
    return "female";
  }

  if (
    /\b(male|man|boy|david|daniel|james|mark|george|fred|ravi|thomas|arthur|aaron|guy|ryan|eric)\b/.test(
      hay
    ) ||
    /\b(henrik|finn|jon|olav|lars|anders|bjorn|bjørn|magnus|erik|nils)\b/.test(hay) ||
    /\b(stefan|hedda|stefan|yannick|claude|jacques|pierre|enrique|pablo|jorge|diego|alvaro|álvaro|luca|diego|cosimo|giorgio|rinaldo|xander|ruben|ruud|lucas|francisco|duarte|antonio|antónio|cristiano|marek|adam|jakub|szymon|mattias|erik|oskar|mikkel|magnus|jeppe)\b/.test(
      hay
    )
  ) {
    return "male";
  }

  if (/microsoft\s+(pernille|hulda|nora|iselin)\b/.test(hay)) return "female";
  if (/microsoft\s+(finn|henrik|jon|olav)\b/.test(hay)) return "male";

  return "unknown";
}

/**
 * Preferred BCP-47 tags for a learning language (first = school standard).
 * Used so pt-BR wins over pt-PT, de-DE over de-AT, etc.
 */
function preferredSpeechLangTags(wantedLang) {
  const raw = String(wantedLang || "")
    .toLowerCase()
    .replace(/_/g, "-");
  const base = raw.split("-")[0] || "";
  const map = {
    nb: ["nb-no", "nb", "no-no", "no"],
    nn: ["nn-no", "nn", "nb-no", "no"],
    no: ["nb-no", "nb", "no-no", "no"],
    sv: ["sv-se", "sv"],
    da: ["da-dk", "da"],
    de: ["de-de", "de-at", "de-ch", "de"],
    fr: ["fr-fr", "fr-ca", "fr-be", "fr-ch", "fr"],
    es: ["es-es", "es-mx", "es-us", "es-ar", "es"],
    it: ["it-it", "it"],
    nl: ["nl-nl", "nl-be", "nl"],
    pt: ["pt-br", "pt-pt", "pt"],
    pl: ["pl-pl", "pl"],
    en: ["en-us", "en-gb", "en-au", "en"],
  };
  if (map[raw]) return map[raw];
  if (map[base]) {
    // Prefer exact regional tag first when provided (pt-BR, es-ES…)
    if (raw.includes("-")) return [raw, ...map[base].filter((t) => t !== raw)];
    return map[base];
  }
  return raw ? [raw, base] : [];
}

/** Named premium / natural voices per language (boost score). */
function premiumVoiceNameBonus(voice, wantedLang) {
  const hay = `${voice.name || ""} ${voice.voiceURI || ""}`.toLowerCase();
  const base = String(wantedLang || "")
    .toLowerCase()
    .replace(/_/g, "-")
    .split("-")[0];

  const names = {
    nb: /\b(nora|pernille|finn|henrik|hulda|iselin)\b/,
    no: /\b(nora|pernille|finn|henrik|hulda|iselin)\b/,
    sv: /\b(alva|klara|oskar|mattias|sofie)\b/,
    da: /\b(naja|sara|mikkel|magnus)\b/,
    de: /\b(anna|hedda|katja|stefan|hedda|vicki|google deutsch)\b/,
    fr: /\b(thomas|aurelie|aurélie|julie|paulina|denise|hortense|google français)\b/,
    es: /\b(paulina|monica|enrique|jorge|pablo|google español)\b/,
    it: /\b(elsa|bianca|cosimo|diego|google italiano)\b/,
    nl: /\b(xander|claire|google nederlands)\b/,
    pt: /\b(luciana|fernanda|vitória|vitoria|raquel|google português|google portugues)\b/,
    pl: /\b(maja|zosia|adam|google polski)\b/,
    en: /\b(samantha|karen|moira|daniel|google us english|google uk english)\b/,
  };
  const re = names[base];
  if (re && re.test(hay)) return 50;
  return 0;
}

function voiceQualityBonus(voice) {
  const hay = `${voice.name || ""} ${voice.voiceURI || ""}`.toLowerCase();
  let bonus = 0;
  if (/\b(natural|neural|online|premium|enhanced|wavenet|studio)\b/.test(hay)) bonus += 45;
  if (/\b(google|microsoft|apple|siri|samsung)\b/.test(hay)) bonus += 12;
  if (/\b(compact|eloquence|espeak|festival|robot)\b/.test(hay)) bonus -= 55;
  if (voice.localService === false) bonus += 8;
  return bonus;
}

function langMatchScore(voiceLang, wantedLang) {
  const v = String(voiceLang || "")
    .toLowerCase()
    .replace(/_/g, "-");
  const w = String(wantedLang || "")
    .toLowerCase()
    .replace(/_/g, "-");
  if (!v || !w) return 0;
  if (v === w) return 100;

  // Prefer school-standard region tags (pt-BR over pt-PT when wanted is pt-BR)
  const preferred = preferredSpeechLangTags(wantedLang);
  const prefIdx = preferred.indexOf(v);
  if (prefIdx === 0) return 100;
  if (prefIdx === 1) return 92;
  if (prefIdx > 1) return 86;

  if (v.split("-")[0] === w.split("-")[0]) return 80;
  if (isNorwegianLangTag(v) && isNorwegianLangTag(w)) return 70;
  // Same base language as any preferred tag
  const base = w.split("-")[0];
  if (base && v.split("-")[0] === base) return 78;
  return 0;
}

function pickBestVoice(lang, gender = preferredVoiceGender) {
  const voices = getSpeechVoices();
  if (!voices.length) return null;

  const wantNb = isNorwegianLangTag(lang);
  const wantEn = isEnglishLangTag(lang);
  const preferred = gender === "male" ? "male" : "female";
  const preferredTags = preferredSpeechLangTags(lang);

  let best = null;
  let bestScore = -Infinity;

  for (const voice of voices) {
    let score = langMatchScore(voice.lang, lang);
    if (score <= 0) {
      if (wantNb && isNorwegianLangTag(voice.lang)) score = 60;
      else if (wantEn && isEnglishLangTag(voice.lang)) score = 50;
      else {
        // Accept same base language even if region tag missing from map
        const vBase = String(voice.lang || "")
          .toLowerCase()
          .split(/[-_]/)[0];
        const wBase = String(lang || "")
          .toLowerCase()
          .split(/[-_]/)[0];
        if (vBase && wBase && vBase === wBase) score = 70;
        else continue;
      }
    }

    score += voiceQualityBonus(voice);
    score += premiumVoiceNameBonus(voice, lang);

    // Exact preferred regional tag on the voice
    const vTag = String(voice.lang || "")
      .toLowerCase()
      .replace(/_/g, "-");
    if (preferredTags[0] && vTag === preferredTags[0]) score += 18;
    else if (preferredTags.includes(vTag)) score += 8;

    // Portuguese: strongly prefer Brazilian when teaching pt-BR
    if (String(lang || "").toLowerCase().startsWith("pt-br") || String(lang || "").toLowerCase() === "pt") {
      if (vTag.startsWith("pt-br")) score += 22;
      else if (vTag.startsWith("pt-pt")) score -= 12;
    }

    const g = detectVoiceGender(voice);
    if (g === preferred) score += 55;
    else if (g === "unknown") score += 8;
    else score -= 35;

    if (wantNb) {
      const v = String(voice.lang || "").toLowerCase();
      if (v.startsWith("nb")) score += 10;
      else if (v.startsWith("nn")) score -= 5;
    }

    if (score > bestScore) {
      bestScore = score;
      best = voice;
    }
  }

  return best;
}

/** Split long lines so Google TTS stays under its length limit. */
function splitTtsChunks(text, maxLen = 160) {
  const cleaned = String(text || "").replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  if (cleaned.length <= maxLen) return [cleaned];

  const parts = [];
  let rest = cleaned;
  while (rest.length > maxLen) {
    let cut = -1;
    for (const sep of [". ", "? ", "! ", "; ", ", ", " "]) {
      const at = rest.lastIndexOf(sep, maxLen);
      if (at > maxLen * 0.4) {
        cut = at + sep.length;
        break;
      }
    }
    if (cut <= 0) cut = maxLen;
    parts.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) parts.push(rest);
  return parts;
}

function googleTtsUrl(text, langTag) {
  // Prefer full regional tags Google understands (pt-BR, nb, es-ES…).
  let tl;
  if (isNorwegianLangTag(langTag)) {
    tl = "nb";
  } else {
    const raw = String(langTag || "en").replace(/_/g, "-");
    const preferred = preferredSpeechLangTags(raw);
    // Google TTS: use regional when we teach a specific standard
    if (/^(pt-BR|pt-br|es-ES|es-MX|es-es|es-mx|zh-CN|zh-TW|en-US|en-GB)$/i.test(raw)) {
      tl = raw;
    } else if (preferred[0] && preferred[0].includes("-")) {
      // pt-br → pt-BR style
      const p = preferred[0];
      const [b, r] = p.split("-");
      tl = r ? `${b}-${r.toUpperCase()}` : b;
      // Google expects pt-BR, es-ES, en-US specifically
      if (p === "pt-br") tl = "pt-BR";
      else if (p === "es-es") tl = "es";
      else if (p === "es-mx") tl = "es-MX";
      else if (p === "en-us") tl = "en";
      else if (p === "en-gb") tl = "en-GB";
      else if (p === "nl-nl") tl = "nl";
      else if (p === "de-de") tl = "de";
      else if (p === "fr-fr") tl = "fr";
      else if (p === "it-it") tl = "it";
      else if (p === "pl-pl") tl = "pl";
      else if (p === "sv-se") tl = "sv";
      else if (p === "da-dk") tl = "da";
      else tl = b || "en";
    } else {
      tl = raw.split("-")[0] || "en";
    }
  }
  return (
    "https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=" +
    encodeURIComponent(tl) +
    "&q=" +
    encodeURIComponent(text)
  );
}

/** Score a system voice for Norwegian quality (higher = more natural). */
function scoreNorwegianSystemVoice(voice) {
  if (!voice || !isNorwegianLangTag(voice.lang)) return -Infinity;
  const hay = `${voice.name || ""} ${voice.voiceURI || ""}`.toLowerCase();
  if (/\b(eloquence|espeak|festival|robot)\b/.test(hay)) return -100;

  let score = voiceQualityBonus(voice);
  if (/\b(nora|pernille|finn|henrik|hulda|iselin)\b/.test(hay)) score += 60;
  if (/\b(natural|neural|online|premium|enhanced|wavenet|studio)\b/.test(hay)) score += 45;
  if (/\b(microsoft|apple|siri)\b/.test(hay)) score += 25;
  if (voice.localService !== false && /\b(apple|com\.apple)\b/.test(hay)) score += 30;
  if (/\bgoogle\b/.test(hay)) score += 8;
  if (/\bcompact\b/.test(hay)) score -= 25;
  const lang = String(voice.lang || "").toLowerCase().replace(/_/g, "-");
  if (lang.startsWith("nb")) score += 15;
  else if (lang.startsWith("nn")) score += 4;
  return score;
}

function findPremiumNorwegianVoice(gender = null) {
  const want = gender === "male" || gender === "female" ? gender : null;
  let best = null;
  let bestScore = -Infinity;
  const threshold = prefersAppleSystemTts() ? 15 : 30;

  for (const voice of getSpeechVoices()) {
    const score = scoreNorwegianSystemVoice(voice);
    if (score < threshold) continue;
    if (want) {
      const g = detectVoiceGender(voice);
      if (g !== want && !(want === "female" && g === "unknown")) continue;
    }
    if (score > bestScore) {
      bestScore = score;
      best = voice;
    }
  }
  return best;
}

function pickAnyNorwegianSystemVoice() {
  let best = null;
  let bestScore = -Infinity;
  for (const voice of getSpeechVoices()) {
    if (!isNorwegianLangTag(voice.lang)) continue;
    const score = scoreNorwegianSystemVoice(voice);
    if (score > bestScore) {
      bestScore = score;
      best = voice;
    }
  }
  return best;
}

/**
 * Gender cue when one physical voice must serve both (rate + pitch).
 * Audible difference without cartoon distortion.
 */
function genderUtteranceProfile(gender) {
  if (gender === "male") {
    return { rate: 0.9, pitch: 0.7 };
  }
  return { rate: 1.0, pitch: 1.15 };
}

/**
 * Minimal Google TTS (last resort only). Exact text only; rate after canplay.
 */
function playGoogleTtsSimple(text, lang, gender, token) {
  return new Promise((resolve, reject) => {
    if (token !== ttsPlayToken) {
      resolve();
      return;
    }
    const onlyText = String(text || "").trim();
    if (!onlyText) {
      resolve();
      return;
    }

    const audio = new Audio();
    ttsActiveAudios.add(audio);
    ttsAudioEl = audio;
    audio.preload = "auto";
    audio.volume = 1;
    const targetRate = gender === "male" ? 0.88 : 1.0;

    const cleanup = () => {
      ttsActiveAudios.delete(audio);
      if (ttsAudioEl === audio) ttsAudioEl = null;
    };

    const fail = (err) => {
      cleanup();
      killTtsAudioElement(audio);
      reject(err || new Error("tts failed"));
    };

    audio.onended = () => {
      cleanup();
      resolve();
    };
    audio.onerror = () => fail(new Error("tts audio error"));

    audio.addEventListener(
      "canplay",
      () => {
        if (token !== ttsPlayToken) {
          cleanup();
          killTtsAudioElement(audio);
          resolve();
          return;
        }
        try {
          audio.playbackRate = targetRate;
          audio.volume = 1;
        } catch {
          /* ignore */
        }
        const p = audio.play();
        if (p && typeof p.then === "function") {
          p.then(() => {
            if (token !== ttsPlayToken) killTtsAudioElement(audio);
          }).catch((err) => fail(err));
        }
      },
      { once: true }
    );

    audio.src = googleTtsUrl(onlyText, lang);
    try {
      audio.load();
    } catch {
      /* ignore */
    }
  });
}

/** Voice toggle sample - one short word via the same Hear pipeline. */
function playVoiceGenderPreview() {
  speakText(VOICE_PREVIEW_PHRASE, getActiveCategory().speechLang || "nb-NO", {
    isPreview: true,
  });
}

/**
 * Speak exact `text` only via speechSynthesis (primary Hear path).
 * Single utterance - no second engine, no backup race.
 */
function speakWithSystemVoice(text, lang, forcedVoice, rate, pitch, token) {
  if (!window.speechSynthesis) return false;
  if (token != null && token !== ttsPlayToken) return false;

  const payload = String(text || "").trim();
  if (!payload) return false;

  ensureSpeechVoicesListener();
  const utterance = new SpeechSynthesisUtterance(payload);
  const wantedLang = lang || "en-US";

  let voice = forcedVoice;
  if (!voice) {
    if (isNorwegianLangTag(wantedLang)) {
      voice =
        findPremiumNorwegianVoice(preferredVoiceGender) ||
        pickAnyNorwegianSystemVoice() ||
        pickBestVoice(wantedLang, preferredVoiceGender);
    } else {
      voice = pickBestVoice(wantedLang, preferredVoiceGender);
    }
  }

  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang || wantedLang;
  } else {
    utterance.lang = isNorwegianLangTag(wantedLang) ? "nb-NO" : wantedLang;
  }

  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = 1;

  try {
    // Do not resume() before speak - can revive a cancelled leftover utterance on Chrome.
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

/**
 * Hear / preview entry.
 * Chrome desktop: speechSynthesis ONLY with one utterance of the exact string.
 * (Google dual-path was stacking garbled audio before the real word.)
 */
function speakText(text, lang, options = {}) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return;

  unlockAudioPipeline();
  stopAllSpeech();

  const token = ttsPlayToken;
  const wantedLang = lang || "nb-NO";
  const gender = preferredVoiceGender === "male" ? "male" : "female";
  const nb = isNorwegianLangTag(wantedLang);
  const isPreview = Boolean(options.isPreview);
  const profile = genderUtteranceProfile(gender);

  // Capture immutable payload for this call only
  const payload = trimmed;

  ensureSpeechVoicesListener();
  try {
    window.speechSynthesis?.getVoices();
  } catch {
    /* ignore */
  }

  // Pick voice once
  let forcedVoice = null;
  let rate = profile.rate;
  let pitch = profile.pitch;

  if (nb && prefersAppleSystemTts() && gender === "female") {
    forcedVoice =
      findPremiumNorwegianVoice("female") || pickAnyNorwegianSystemVoice();
    // Nora sounds best natural
    if (forcedVoice) {
      rate = 1;
      pitch = 1;
    }
  } else if (nb && prefersAppleSystemTts() && gender === "male") {
    forcedVoice = findPremiumNorwegianVoice("male");
    if (forcedVoice) {
      rate = 1;
      pitch = 1;
    }
  } else if (nb) {
    forcedVoice =
      findPremiumNorwegianVoice(gender) ||
      pickAnyNorwegianSystemVoice() ||
      pickBestVoice(wantedLang, gender);
  } else {
    forcedVoice = pickBestVoice(wantedLang, gender);
  }

  // Chrome needs a gap after cancel() or speak() is a no-op / glitches.
  ttsSpeakDelayTimer = window.setTimeout(() => {
    ttsSpeakDelayTimer = null;
    if (token !== ttsPlayToken) return;

    // Hard clear queue one more time, then single speak
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }

    window.setTimeout(() => {
      if (token !== ttsPlayToken) return;

      const ok = speakWithSystemVoice(
        payload,
        wantedLang,
        forcedVoice,
        rate,
        pitch,
        token
      );

      // Google only if synthesis missing entirely (not as a second parallel track)
      if (!ok && nb) {
        playGoogleTtsSimple(payload, wantedLang, gender, token).catch(() => {});
      }
    }, 40);
  }, 80);
}

function speakForeign(text) {
  speakText(text, getActiveCategory().speechLang || "nb-NO");
}


let goalAudioContext = null;

function getGoalAudioContext() {
  if (goalAudioContext) return goalAudioContext;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  try {
    goalAudioContext = new Ctor();
  } catch {
    goalAudioContext = null;
  }
  return goalAudioContext;
}

/**
 * UI sounds (switch / goal) need a *running* AudioContext.
 * Mobile Safari often stays suspended if we only fire-and-forget resume() - 
 * tones schedule against silence. Always await resume in the user-gesture chain.
 * Returns null when audio cannot play; callers must treat that as fine.
 */
async function ensureUiAudioReady() {
  unlockAudioPipeline();
  const ctx = getGoalAudioContext();
  if (!ctx) return null;
  try {
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
  } catch {
    return null;
  }
  return ctx.state === "running" ? ctx : null;
}

function prefersReducedMotion() {
  try {
    return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
  } catch {
    return false;
  }
}

function playGoalCompleteChime() {
  void (async () => {
    if (prefersReducedMotion()) return;
    const ctx = await ensureUiAudioReady();
    if (!ctx) return;

    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.11, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
    gain.connect(ctx.destination);

    [523.25, 659.25, 783.99].forEach((frequency, index) => {
      const oscillator = ctx.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      const start = now + index * 0.11;
      oscillator.start(start);
      oscillator.stop(start + 0.42);
    });
  })();
}

function triggerGoalHaptic() {
  if (typeof navigator.vibrate === "function") {
    navigator.vibrate([14, 36, 20]);
  }
}

function celebrateGoalComplete() {
  // Haptic first on phones (reliable); chime is a bonus when audio is free.
  triggerGoalHaptic();
  playGoalCompleteChime();
}

/**
 * Soft rising triad - a short “portal” into the new language track.
 * Flourish only: ceremony must still feel complete with visual + haptic alone.
 * Distinct from the goal-complete chime (higher, brighter).
 */
function playTrackSwitchSound() {
  void (async () => {
    if (prefersReducedMotion()) return;
    const ctx = await ensureUiAudioReady();
    if (!ctx) return;

    const now = ctx.currentTime;
    const master = ctx.createGain();
    // Slightly quieter than goal chime - ambient, not a win fanfare.
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.07, now + 0.04);
    master.gain.exponentialRampToValueAtTime(0.03, now + 0.32);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.78);
    master.connect(ctx.destination);

    // Low open → mid settle → high lift (C4 · E4 · G4-ish)
    [261.63, 329.63, 392.0].forEach((frequency, index) => {
      const oscillator = ctx.createOscillator();
      const voice = ctx.createGain();
      oscillator.type = index === 0 ? "triangle" : "sine";
      oscillator.frequency.value = frequency;
      voice.gain.setValueAtTime(0.0001, now);
      const start = now + index * 0.1;
      voice.gain.exponentialRampToValueAtTime(0.65 - index * 0.12, start + 0.035);
      voice.gain.exponentialRampToValueAtTime(0.0001, start + 0.38);
      oscillator.connect(voice);
      voice.connect(master);
      oscillator.start(start);
      oscillator.stop(start + 0.44);
    });
  })();
}

/**
 * First-entry portal sound: soft pad + rising triad + brief high settle.
 * Still a flourish (never required). More presence than a mid-session switch.
 */
function playWelcomeEnterSound() {
  void (async () => {
    if (prefersReducedMotion()) return;
    const ctx = await ensureUiAudioReady();
    if (!ctx) return;

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.09, now + 0.05);
    master.gain.exponentialRampToValueAtTime(0.045, now + 0.45);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 1.15);
    master.connect(ctx.destination);

    // Soft low pad (presence under the triad)
    const pad = ctx.createOscillator();
    const padGain = ctx.createGain();
    pad.type = "sine";
    pad.frequency.value = 130.81; // C3
    padGain.gain.setValueAtTime(0.0001, now);
    padGain.gain.exponentialRampToValueAtTime(0.28, now + 0.08);
    padGain.gain.exponentialRampToValueAtTime(0.12, now + 0.55);
    padGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.05);
    pad.connect(padGain);
    padGain.connect(master);
    pad.start(now);
    pad.stop(now + 1.1);

    // Rising portal: C4 · E4 · G4 · C5
    [261.63, 329.63, 392.0, 523.25].forEach((frequency, index) => {
      const oscillator = ctx.createOscillator();
      const voice = ctx.createGain();
      oscillator.type = index === 0 ? "triangle" : "sine";
      oscillator.frequency.value = frequency;
      voice.gain.setValueAtTime(0.0001, now);
      const start = now + 0.06 + index * 0.11;
      const peak = index === 3 ? 0.42 : 0.62 - index * 0.08;
      voice.gain.exponentialRampToValueAtTime(peak, start + 0.04);
      voice.gain.exponentialRampToValueAtTime(0.0001, start + 0.42 + index * 0.04);
      oscillator.connect(voice);
      voice.connect(master);
      oscillator.start(start);
      oscillator.stop(start + 0.55);
    });
  })();
}

/** Mobile confirmation for language switch - works with the silent switch off. */
function triggerTrackSwitchHaptic() {
  if (typeof navigator.vibrate === "function") {
    // Short dual pulse: “leave · land”
    navigator.vibrate([16, 32, 20]);
  }
}

/** First-entry haptic: open · hold · land */
function triggerWelcomeEnterHaptic() {
  if (typeof navigator.vibrate === "function") {
    navigator.vibrate([18, 40, 22, 48, 28]);
  }
}

let trackSwitchOverlayTimer = null;
let trackSwitchLanguageFlashTimer = null;

/**
 * After the switch overlay lifts, gently pulse the language control
 * (flag + name in the prefs row) so attention lands on the durable UI.
 */
function flashProgressLanguageControl() {
  const el = document.getElementById("progress-language-btn");
  if (!el) return;
  if (trackSwitchLanguageFlashTimer) {
    window.clearTimeout(trackSwitchLanguageFlashTimer);
    trackSwitchLanguageFlashTimer = null;
  }
  el.classList.remove("is-flashing");
  void el.offsetWidth;
  el.classList.add("is-flashing");
  trackSwitchLanguageFlashTimer = window.setTimeout(() => {
    trackSwitchLanguageFlashTimer = null;
    el.classList.remove("is-flashing");
  }, 900);
}

/**
 * Language lives inside the Read story selector (flag + muted name).
 * Read-only - switching languages stays on Progress.
 */
function updateReadLanguageIndicator(category = getActiveCategory()) {
  const label =
    category?.label || category?.learningLanguageName || "Language";
  const flag = category?.flag || "🏳️";

  document.querySelectorAll("[data-read-language-flag]").forEach((node) => {
    node.textContent = flag;
  });
  document.querySelectorAll("[data-read-language-label]").forEach((node) => {
    node.textContent = label;
  });
  document.querySelectorAll("[data-read-empty-flag]").forEach((node) => {
    node.textContent = flag;
  });

  const storyBtn = document.getElementById("read-story-select");
  const titleEl = document.getElementById("read-story-title");
  if (storyBtn) {
    const title = (titleEl?.textContent || "").trim();
    storyBtn.setAttribute(
      "aria-label",
      title && title !== "-"
        ? `${label} story: ${title}. Choose story`
        : `Choose ${label} story`
    );
    // Flag + story title are visible; no hover that only renames the control.
    storyBtn.removeAttribute("title");
  }

  // Keep empty-state copy in sync if Read is open with no stories
  const empty = document.getElementById("read-empty");
  if (empty && !empty.hidden) {
    const copyEl = document.getElementById("read-empty-copy");
    if (copyEl && !getStoriesForCategory().length) {
      copyEl.textContent = `Reading for ${label} is still being prepared.`;
    }
  }
}

/**
 * Full-screen language ceremony: logo bloom + optional flag + language name.
 * @param {string} label
 * @param {{ flag?: string, durationMs?: number, welcome?: boolean, portal?: boolean, flashProgress?: boolean, showKicker?: boolean, restart?: boolean }} [options]
 */
function showTrackSwitchOverlay(label, options = {}) {
  const el = document.getElementById("track-switch-overlay");
  const nameEl = document.getElementById("track-switch-overlay-name");
  const flagEl = document.getElementById("track-switch-overlay-flag");
  const kickerEl = document.getElementById("track-switch-overlay-kicker");
  const logoEl = el?.querySelector(".track-switch-logo");
  const logoWrap = el?.querySelector(".track-switch-logo-wrap");
  if (!el || !nameEl) return;
  const text = String(label || "").trim();
  if (!text) return;

  if (trackSwitchOverlayTimer) {
    window.clearTimeout(trackSwitchOverlayTimer);
    trackSwitchOverlayTimer = null;
  }

  const flag = String(options.flag || "").trim();
  const durationMs = Number(options.durationMs) > 0 ? Number(options.durationMs) : 1250;
  const isWelcome = Boolean(options.welcome);
  const isPortal = Boolean(options.portal);
  // Default off - brand is already "Leitner Learning"; kicker felt redundant.
  const showKicker = options.showKicker === true;
  const restart = options.restart !== false;
  // Mid-session Progress picks: pulse the language chip after the veil
  const shouldFlashProgress =
    options.flashProgress === true || (!isWelcome && options.flashProgress !== false);

  nameEl.textContent = text;
  if (kickerEl) {
    // Portal may show "Now learning" after the logo→language handoff
    kickerEl.hidden = !(isPortal && showKicker);
  }
  if (flagEl) {
    if (flag) {
      flagEl.textContent = flag;
      flagEl.hidden = false;
    } else {
      flagEl.textContent = "";
      flagEl.hidden = true;
    }
  }

  el.classList.toggle("is-welcome-enter", isWelcome);
  el.classList.toggle("is-welcome-portal", isPortal);
  el.classList.toggle("is-hide-kicker", isPortal && !showKicker);
  el.dataset.flashProgress = shouldFlashProgress ? "1" : "0";
  el.classList.remove("is-phase-language");
  logoEl?.classList.remove("is-beat-flash");
  logoWrap?.classList.remove("is-beat-flash");
  flagEl?.classList.remove("is-beat-flash");
  nameEl?.classList.remove("is-beat-flash");
  el.classList.remove("hidden", "is-leaving");
  el.setAttribute("aria-hidden", "false");

  // restart:false keeps an already-visible veil stable (no opacity blink)
  if (restart || !el.classList.contains("is-visible")) {
    if (isPortal) {
      // Instant cover - never fade in over Review / welcome
      el.classList.add("is-visible");
      void el.offsetHeight;
    } else {
      el.classList.remove("is-visible");
      void el.offsetWidth;
      el.classList.add("is-visible");
    }
  }

  scheduleTrackSwitchOverlayEnd(durationMs, { isPortal, shouldFlashProgress });
}

/**
 * End the ceremony timer without re-animating the veil.
 * Used after the beatmap loads so the first-entry cover can paint before await.
 */
function scheduleTrackSwitchOverlayEnd(durationMs, options = {}) {
  const el = document.getElementById("track-switch-overlay");
  if (!el) return;
  if (trackSwitchOverlayTimer) {
    window.clearTimeout(trackSwitchOverlayTimer);
    trackSwitchOverlayTimer = null;
  }
  const isPortal =
    options.isPortal != null ? Boolean(options.isPortal) : el.classList.contains("is-welcome-portal");
  const shouldFlashProgress =
    options.shouldFlashProgress != null
      ? Boolean(options.shouldFlashProgress)
      : el.dataset.flashProgress === "1";
  const ms = Number(durationMs) > 0 ? Number(durationMs) : 1250;

  trackSwitchOverlayTimer = window.setTimeout(() => {
    trackSwitchOverlayTimer = null;
    // Soft exit for portal; keep cover opaque until fade starts
    if (isPortal) el.classList.add("is-leaving");
    el.classList.remove("is-visible");
    if (isPortal) {
      clearWelcomePortalTimers();
      const portalAudio = document.getElementById("welcome-portal-audio");
      if (portalAudio) {
        try {
          portalAudio.pause();
          portalAudio.currentTime = 0;
        } catch {
          /* ignore */
        }
      }
    }
    window.setTimeout(() => {
      if (!el.classList.contains("is-visible")) {
        el.classList.add("hidden");
        el.classList.remove(
          "is-welcome-enter",
          "is-welcome-portal",
          "is-phase-language",
          "is-hide-kicker",
          "is-leaving"
        );
        el.setAttribute("aria-hidden", "true");
        el.querySelector(".track-switch-logo")?.classList.remove("is-beat-flash");
        el.querySelector(".track-switch-logo-wrap")?.classList.remove("is-beat-flash");
        document.getElementById("track-switch-overlay-name")?.classList.remove("is-beat-flash");
        const kickerEl = document.getElementById("track-switch-overlay-kicker");
        if (kickerEl) kickerEl.hidden = true;
        const flagEl = document.getElementById("track-switch-overlay-flag");
        if (flagEl) {
          flagEl.hidden = true;
          flagEl.textContent = "";
          flagEl.classList.remove("is-beat-flash");
        }
        // First-visit shell may still be hidden under the gate class
        document.documentElement.classList.remove("needs-welcome");
      }
    }, 320);
    if (shouldFlashProgress) flashProgressLanguageControl();
  }, ms);
}

/**
 * Mid-session language switch (Progress tab picker, etc.).
 * Same music portal as first entry - logo on the beat, then target language on denser bass.
 */
function announceTrackSwitch(category = getActiveCategory()) {
  announceLanguagePortal(category, { firstEntry: false });
}

/** Beat map + audio for the language-select portal (from Music for Leitner clip). */
let welcomePortalBeatmap = null;
let welcomePortalTimers = [];
let welcomePortalRaf = 0;

function clearWelcomePortalTimers() {
  welcomePortalTimers.forEach((id) => window.clearTimeout(id));
  welcomePortalTimers = [];
  if (welcomePortalRaf) {
    window.cancelAnimationFrame(welcomePortalRaf);
    welcomePortalRaf = 0;
  }
}

function pulseWelcomeBeat(el) {
  if (!el || el.hidden) return;
  el.classList.remove("is-beat-flash");
  void el.offsetWidth;
  el.classList.add("is-beat-flash");
}

async function loadWelcomePortalBeatmap() {
  if (welcomePortalBeatmap) return welcomePortalBeatmap;
  try {
    const res = await fetch("assets/welcome-portal-beats.json?v=18", { cache: "force-cache" });
    if (!res.ok) return null;
    welcomePortalBeatmap = await res.json();
    return welcomePortalBeatmap;
  } catch {
    return null;
  }
}

/**
 * First-run: user chooses a language and steps through the door.
 * Same portal as Progress language switches.
 */
function announceWelcomeEnter(category = getActiveCategory()) {
  announceLanguagePortal(category, { firstEntry: true });
}

/**
 * Drive portal visuals from the audio clock so flashes stay locked to the music.
 * Falls back to performance.now() if currentTime is unavailable.
 */
function runPortalBeatClock(audio, events, onEvent) {
  const sorted = events
    .filter((e) => e && Number.isFinite(e.t))
    .slice()
    .sort((a, b) => a.t - b.t);
  let i = 0;
  const tWall0 = performance.now();
  const lookAhead = 0.028; // fire slightly early so CSS peak lands on the hit

  const tick = () => {
    let t;
    try {
      t = audio && !audio.paused ? audio.currentTime : (performance.now() - tWall0) / 1000;
    } catch {
      t = (performance.now() - tWall0) / 1000;
    }
    while (i < sorted.length && t + lookAhead >= sorted[i].t) {
      try {
        onEvent(sorted[i]);
      } catch {
        /* keep clock running */
      }
      i += 1;
    }
    if (i < sorted.length) {
      welcomePortalRaf = window.requestAnimationFrame(tick);
    } else {
      welcomePortalRaf = 0;
    }
  };
  welcomePortalRaf = window.requestAnimationFrame(tick);
}

/**
 * Language-select music portal (welcome + Progress):
 * Soft logo pulse on the main beat; gentle handoff to the target-language flag
 * when the bass densifies. No screen flashes/ripples (photosensitive-safe).
 * Falls back to short synth if audio/beatmap unavailable or reduced motion.
 *
 * The veil paints synchronously so first-entry never flashes Review underneath.
 *
 * @param {{ firstEntry?: boolean, showKicker?: boolean }} [options]
 */
function announceLanguagePortal(category = getActiveCategory(), options = {}) {
  const firstEntry = Boolean(options.firstEntry);
  // Default: no "Now learning" kicker (user-preferred; cleaner under Leitner Learning brand)
  const showKicker = options.showKicker === true;
  const label = category?.label || category?.learningLanguageName || "Language";
  const flag = category?.flag || "";
  unlockAudioPipeline();
  void ensureUiAudioReady();
  clearWelcomePortalTimers();

  const shortFallback = () => {
    // Mid-session short path still lands attention on Progress language control.
    showTrackSwitchOverlay(label, {
      flag,
      durationMs: firstEntry ? 1400 : 1250,
      welcome: firstEntry,
      showKicker,
    });
    if (firstEntry) {
      triggerWelcomeEnterHaptic();
      playWelcomeEnterSound();
    } else {
      triggerTrackSwitchHaptic();
      playTrackSwitchSound();
    }
  };

  // Reduced motion → short calm ceremony (no beat pulses)
  if (prefersReducedMotion()) {
    shortFallback();
    return;
  }

  // Paint the veil immediately (before any await) so Review never peeks through
  // when the welcome gate closes on first language pick.
  const provisionalMs = Math.round(
    (Number(welcomePortalBeatmap?.duration) || 5.06) * 1000 + 420
  );
  showTrackSwitchOverlay(label, {
    flag,
    durationMs: provisionalMs,
    welcome: true,
    portal: true,
    flashProgress: !firstEntry,
    showKicker,
  });
  if (firstEntry) triggerWelcomeEnterHaptic();
  else triggerTrackSwitchHaptic();

  void (async () => {
    const map = await loadWelcomePortalBeatmap();
    const audio = document.getElementById("welcome-portal-audio");
    const overlay = document.getElementById("track-switch-overlay");
    const logoEl = overlay?.querySelector(".track-switch-logo");
    const logoWrap = overlay?.querySelector(".track-switch-logo-wrap");
    const flagEl = document.getElementById("track-switch-overlay-flag");
    const nameEl = document.getElementById("track-switch-overlay-name");

    if (!map || !audio) {
      // Veil already up - soft synth underlay only
      if (firstEntry) playWelcomeEnterSound();
      else playTrackSwitchSound();
      return;
    }

    // Match end time to the real clip without blinking the veil
    const durationMs = Math.round((Number(map.duration) || 5) * 1000 + 420);
    scheduleTrackSwitchOverlayEnd(durationMs, {
      isPortal: true,
      shouldFlashProgress: !firstEntry,
    });

    const volume = Math.min(1, Math.max(0, Number(map.volume) || 0.75));
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = volume;
      await audio.play();
    } catch {
      // Autoplay blocked or decode fail - keep visuals + soft synth underlay
      if (firstEntry) playWelcomeEnterSound();
      else playTrackSwitchSound();
    }

    const switchAt = Number(map.switchAt) || 2;
    const events = [];
    (map.phase1Beats || []).forEach((t) => events.push({ t: Number(t), type: "logo" }));
    events.push({ t: switchAt, type: "switch" });
    // Phase 2: soft flag pulse, but not on every dense hit - keeps under
    // the WCAG “3 flashes per second” caution for large bright changes.
    const phase2 = (map.phase2Beats || [])
      .map(Number)
      .filter((t) => Math.abs(t - switchAt) >= 0.04);
    phase2.forEach((t, idx) => {
      if (idx % 2 === 0) events.push({ t, type: "flag" });
    });

    const fireLogoBeat = () => {
      pulseWelcomeBeat(logoEl);
      pulseWelcomeBeat(logoWrap);
      if (typeof navigator.vibrate === "function") navigator.vibrate(8);
    };

    const fireFlagBeat = () => {
      pulseWelcomeBeat(flagEl);
      pulseWelcomeBeat(nameEl);
      if (typeof navigator.vibrate === "function") navigator.vibrate(6);
    };

    const fireSwitch = () => {
      overlay?.classList.add("is-phase-language");
      pulseWelcomeBeat(flagEl);
      pulseWelcomeBeat(nameEl);
      if (typeof navigator.vibrate === "function") navigator.vibrate([10, 40, 10]);
    };

    runPortalBeatClock(audio, events, (ev) => {
      if (ev.type === "logo") fireLogoBeat();
      else if (ev.type === "switch") fireSwitch();
      else if (ev.type === "flag") fireFlagBeat();
    });
  })();
}

function speakPromptForCard(card) {
  const labels = getDirectionLabels(getActiveCategory(), card);
  speakText(getPromptDisplayText(card), labels.promptSpeechLang);
}

let feedbackHideTimer = null;

function showFeedback(message, type, options = {}) {
  const el = document.getElementById("feedback");
  if (!el) return;
  if (feedbackHideTimer) {
    window.clearTimeout(feedbackHideTimer);
    feedbackHideTimer = null;
  }
  el.textContent = message;
  el.className = `feedback ${type}`;
  const autoHideMs = Number(options.autoHideMs) || 0;
  if (autoHideMs > 0) {
    feedbackHideTimer = window.setTimeout(() => {
      feedbackHideTimer = null;
      // Only clear if this message is still showing (don't wipe a newer result).
      if (el.textContent === message) hideFeedback();
    }, autoHideMs);
  }
}

function hideFeedbackExample() {
  const el = document.getElementById("feedback-example");
  if (!el) return;
  el.classList.add("hidden");
  el.innerHTML = "";
  el.removeAttribute("lang");
}

/**
 * Whole-token / whole-phrase match in a story line (case-insensitive).
 * Avoids "en" matching inside "venstre".
 */
function sentenceContainsForm(sentenceText, form) {
  const hay = String(sentenceText || "").trim();
  const needle = String(form || "").trim();
  if (!hay || !needle) return false;
  try {
    const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(?:^|[^\\p{L}\\p{N}_])${escaped}(?:[^\\p{L}\\p{N}_]|$)`, "iu");
    return re.test(hay);
  } catch {
    // Older engines without Unicode property escapes
    const lower = hay.toLowerCase();
    const n = needle.toLowerCase();
    const idx = lower.indexOf(n);
    if (idx < 0) return false;
    const before = idx === 0 ? " " : lower[idx - 1];
    const after = idx + n.length >= lower.length ? " " : lower[idx + n.length];
    return /[^\wà-ÿ]/i.test(before) && /[^\wà-ÿ]/i.test(after);
  }
}

/**
 * Pull a short natural sentence from Read stories that uses this card's L2 form.
 * Prefer easier trails and shorter lines so the teaching beat stays calm.
 */
function findExampleSentenceForCard(card, categoryId = activeCategoryId) {
  if (!card?.foreign) return null;
  const form = String(card.foreign).trim();
  if (!form) return null;

  const stories = typeof getStoriesForCategory === "function" ? getStoriesForCategory(categoryId) : [];
  if (!stories.length) return null;

  const trailScore = (trail) => {
    if (trail === "green-circle" || trail === "Starter") return 0;
    if (trail === "blue-square" || trail === "blue-circle") return 1;
    if (trail === "black-diamond") return 2;
    return 3;
  };

  let best = null;
  let bestScore = Infinity;

  for (const story of stories) {
    const sentences = story.sentences || [];
    for (const s of sentences) {
      const foreign = sentenceForeignText(s);
      if (!sentenceContainsForm(foreign, form)) continue;
      const en = String(s.en || "").trim();
      if (!en) continue;
      // Prefer short, easy lines; slight penalty if form is only a tiny substring of a long line
      const score =
        trailScore(story.trail) * 1000 +
        foreign.length +
        (form.length <= 2 && foreign.length > 40 ? 80 : 0);
      if (score < bestScore) {
        bestScore = score;
        best = { foreign, en, storyId: story.id };
      }
    }
  }

  return best;
}

function showFeedbackExample(example, card = currentCard) {
  const el = document.getElementById("feedback-example");
  if (!el) return;
  if (!example?.foreign || !example?.en) {
    hideFeedbackExample();
    return;
  }
  const foreignLang = getActiveCategory().foreignLang || "nb";
  el.classList.remove("hidden");
  el.setAttribute("lang", foreignLang);
  el.innerHTML = `<span class="feedback-example-l2" lang="${escapeAttr(foreignLang)}">${escapeHtml(
    example.foreign
  )}</span><span class="feedback-example-en">${escapeHtml(example.en)}</span>`;
}

/**
 * Prefer: Read story → stored example → phrase → simple in-language line.
 * Never return the bare card pair — the answer pill already shows the gloss.
 * (Glue used to fall back to {ikke, not} under the pill: pure redundancy.)
 */
function getCardContextExample(card) {
  if (!card) return null;

  const fromStory = findExampleSentenceForCard(card);
  if (fromStory) return fromStory;

  const storedL2 = String(card.exampleForeign || "").trim();
  const storedEn = String(card.exampleNative || "").trim();
  if (storedL2 && storedEn) {
    return { foreign: storedL2, en: storedEn };
  }

  const foreign = String(card.foreign || "").trim();
  const native = String(card.native || "")
    .split("/")[0]
    .trim();
  if (!foreign || !native) return null;

  // Multi-word / sentence cards already are usable context (not a bare lemma).
  if (card.band === "phrase" || /\s|[?!…]/.test(foreign)) {
    return { foreign, en: native };
  }

  // Glue / tiny words: no fake “I need et” — and no restated pair under the pill.
  if (isGluePracticeCard(card) || foreign.length <= 2) {
    return null;
  }

  const built = buildSimpleThemeExample(
    foreign,
    native,
    getActiveCategory().foreignLang || "nb"
  );
  if (built) return built;

  // Bare lemma again would only restate the prompt + answer pill.
  return null;
}

/** True when the “example” is just the same flashcard again (skip it). */
function isRedundantFeedbackExample(example, card, answerText) {
  if (!example?.foreign || !card) return true;
  const exL2 = normalizeAnswer(example.foreign);
  const exEn = normalizeAnswer(example.en || "");
  const cardL2 = normalizeAnswer(card.foreign || "");
  const cardEn = normalizeAnswer(
    String(card.native || "")
      .split("/")[0]
      .trim()
  );
  const pill = normalizeAnswer(answerText || "");

  // Same L2 as the prompt (with EN matching gloss or the answer pill)
  if (exL2 === cardL2 && (exEn === cardEn || exEn === pill || !exEn)) {
    return true;
  }
  // Example is only the English answer, restated
  if (exL2 === pill || exEn === pill && exL2 === cardL2) {
    return true;
  }
  return false;
}

/**
 * Tiny in-context lines for single theme lemmas when Read has no match.
 * Patterns stay honest and short - not full generative sentences.
 */
function buildSimpleThemeExample(foreign, native, langCode) {
  const lang = String(langCode || "nb").split("-")[0].toLowerCase();
  const f = foreign;
  const n = native.replace(/^to\s+/i, "").trim();
  const isVerb =
    /^to\s+/i.test(native) ||
    /^(å|att|at)\s+/i.test(foreign) ||
    cardLooksLikeInfinitive(foreign, lang);
  const isQuality =
    /^(delayed|cancelled|canceled|expensive|cheap|open|closed|full|quiet|noisy|delicious|furnished|available)/i.test(
      native
    ) ||
    /^(forsinket|kansellert|dyr|billig|åpen|stengt|mett|stille|støyende)/i.test(foreign);

  const need = {
    nb: [`Jeg trenger ${f}.`, `I need ${n}.`],
    no: [`Jeg trenger ${f}.`, `I need ${n}.`],
    sv: [`Jag behöver ${f}.`, `I need ${n}.`],
    da: [`Jeg har brug for ${f}.`, `I need ${n}.`],
    de: [`Ich brauche ${f}.`, `I need ${n}.`],
    fr: [`J'ai besoin de ${f}.`, `I need ${n}.`],
    es: [`Necesito ${f}.`, `I need ${n}.`],
    it: [`Mi serve ${f}.`, `I need ${n}.`],
    nl: [`Ik heb ${f} nodig.`, `I need ${n}.`],
    pt: [`Preciso de ${f}.`, `I need ${n}.`],
    pl: [`Potrzebuję: ${f}.`, `I need ${n}.`],
  };
  const quality = {
    nb: [`Det er ${f}.`, `It is ${n}.`],
    no: [`Det er ${f}.`, `It is ${n}.`],
    sv: [`Det är ${f}.`, `It is ${n}.`],
    da: [`Det er ${f}.`, `It is ${n}.`],
    de: [`Es ist ${f}.`, `It is ${n}.`],
    fr: [`C'est ${f}.`, `It is ${n}.`],
    es: [`Está ${f}.`, `It is ${n}.`],
    it: [`È ${f}.`, `It is ${n}.`],
    nl: [`Het is ${f}.`, `It is ${n}.`],
    pt: [`Está ${f}.`, `It is ${n}.`],
    pl: [`To jest ${f}.`, `It is ${n}.`],
  };
  const verb = {
    nb: [`Kan du ${f.replace(/^å\s+/i, "")}?`, `Can you ${n}?`],
    no: [`Kan du ${f.replace(/^å\s+/i, "")}?`, `Can you ${n}?`],
    sv: [`Kan du ${f.replace(/^att\s+/i, "")}?`, `Can you ${n}?`],
    da: [`Kan du ${f.replace(/^at\s+/i, "")}?`, `Can you ${n}?`],
    de: [`Kannst du ${f}?`, `Can you ${n}?`],
    fr: [`Tu peux ${f}?`, `Can you ${n}?`],
    es: [`¿Puedes ${f}?`, `Can you ${n}?`],
    it: [`Puoi ${f}?`, `Can you ${n}?`],
    nl: [`Kun je ${f}?`, `Can you ${n}?`],
    pt: [`Você pode ${f}?`, `Can you ${n}?`],
    pl: [`Czy możesz ${f}?`, `Can you ${n}?`],
  };

  let pair;
  if (isVerb) pair = verb[lang] || verb.nb;
  else if (isQuality) pair = quality[lang] || quality.nb;
  else pair = need[lang] || need.nb;

  if (!pair) return null;
  return { foreign: pair[0], en: pair[1] };
}

function cardLooksLikeInfinitive(foreign, lang) {
  const f = String(foreign || "").toLowerCase();
  if (lang === "de") return /en$/.test(f) && f.length > 4;
  if (lang === "fr") return /er$|ir$|re$/.test(f);
  if (lang === "es" || lang === "pt") return /ar$|er$|ir$/.test(f);
  if (lang === "it") return /are$|ere$|ire$/.test(f);
  if (lang === "nl") return /en$/.test(f) && f.length > 3;
  if (lang === "pl") return /ć$/.test(f);
  return false;
}

/**
 * After a miss/reveal: show the answer pill, plus a real-sentence beat when we have one.
 * Skip when the “example” only restates the card (prompt + gloss already on screen).
 */
function showIncorrectWithExample(card, answerText) {
  showFeedback(answerText, "incorrect");
  const example = getCardContextExample(card);
  if (example && !isRedundantFeedbackExample(example, card, answerText)) {
    showFeedbackExample(example, card);
    return true;
  }
  hideFeedbackExample();
  return false;
}

function hideFeedback() {
  if (feedbackHideTimer) {
    window.clearTimeout(feedbackHideTimer);
    feedbackHideTimer = null;
  }
  const el = document.getElementById("feedback");
  if (el) {
    el.textContent = "";
    el.className = "feedback is-empty";
  }
  hideFeedbackExample();
}

function renderBoxDots(box) {
  document.querySelectorAll(".level-dot, .box-dot").forEach((dot, i) => {
    dot.classList.remove("active", "passed");
    if (i + 1 < box) dot.classList.add("passed");
    if (i + 1 === box) dot.classList.add("active");
  });
}

function renderWordPreview(containerId, words, clickable = false) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const foreignLang = getActiveCategory().foreignLang || "nb";

  if (!words.length) {
    container.hidden = true;
    container.innerHTML = "";
    return;
  }

  container.hidden = false;
  container.innerHTML = words
    .map((word) => {
      const attrs = clickable
        ? `class="preview-word" data-foreign="${escapeAttr(word.foreign)}"`
        : `class="preview-word"`;
      return `<span ${attrs}><span class="preview-no" lang="${foreignLang}">${escapeHtml(word.foreign)}</span><span class="preview-en">${escapeHtml(word.native.split("/")[0].trim())}</span></span>`;
    })
    .join("");

  if (clickable) {
    container.querySelectorAll("[data-foreign]").forEach((el) => {
      el.addEventListener("click", () => speakForeign(el.dataset.foreign));
    });
  }
}

function setEmptyStateIcon(mode) {
  const iconEl = document.getElementById("empty-icon");
  if (!iconEl) return;
  const earned = mode === "earned";
  iconEl.textContent = earned ? "✓" : "";
  iconEl.classList.toggle("empty-icon--earned", earned);
  iconEl.classList.toggle("empty-icon--idle", !earned);
}

function setEmptyStateActionsMode(emptyEl, iconEl, titleEl, messageEl, enabled) {
  emptyEl.classList.toggle("empty-state--actions", enabled);
  iconEl.classList.toggle("hidden", enabled);
  titleEl.classList.toggle("hidden", enabled);
  messageEl.classList.toggle("hidden", enabled || !messageEl.textContent.trim());
}

function setEmptyStatePowerAction(
  powerEl,
  hintEl,
  {
    show = false,
    mode = "start",
    ariaLabel = "Start Review",
    hint = "",
    celebrate = false,
    enabled = true,
  } = {}
) {
  powerEl?.classList.toggle("hidden", !show);
  // Status line under the power button - primary “what do I do?” cue.
  if (hintEl) {
    const text = String(hint || "").trim();
    hintEl.textContent = text;
    hintEl.classList.toggle("hidden", !show || !text);
    const actionable = show && text && enabled && mode !== "complete";
    const completeActive = show && text && enabled && mode === "complete";
    const idle = show && text && !enabled;
    hintEl.classList.toggle("power-on-hint--action", actionable || completeActive);
    hintEl.classList.toggle("power-on-hint--idle", idle);
  }

  const startBtn = document.getElementById("start-practice-btn");
  if (startBtn) {
    startBtn.classList.remove(
      "power-on-btn--start",
      "power-on-btn--continue",
      "power-on-btn--complete"
    );
    if (show) startBtn.classList.add(`power-on-btn--${mode}`);
    startBtn.disabled = !enabled;
    startBtn.setAttribute("aria-disabled", enabled ? "false" : "true");
    startBtn.setAttribute("aria-label", ariaLabel || hint || "Review");
    // Status text already lives under the power button - no duplicate hover.
    startBtn.removeAttribute("title");
  }

  if (powerEl) {
    powerEl.classList.remove("power-on--celebrate");
    if (celebrate) {
      void powerEl.offsetWidth;
      powerEl.classList.add("power-on--celebrate");
      celebrateGoalComplete();
    }
  }
}

/**
 * Short status under the logo power button.
 * Counts live in home stats - don't repeat them here.
 * Fully done (no extras): silence under the logo - complete logo is enough.
 */
function formatPowerHomeHint({
  mode = "start",
  extraDue = 0,
  sessionLine = "",
} = {}) {
  if (sessionLine) return sessionLine;
  if (mode === "start") return "Start Review";
  if (mode === "continue") return "Continue";
  // complete - only speak when there's something left to do
  if (extraDue > 0) return "Extras Ready";
  return ""; // idle done: no caption under the logo
}

function renderHomeStatus() {
  const container = document.getElementById("empty-home-status");
  if (!container) return;

  const practiceStat = getProgressPracticeStat();
  const streakStat = getHomeStreakStat();
  const streakClasses = [
    "home-stat",
    streakStat.highlight ? "home-stat--highlight" : "",
    streakStat.atRisk ? "home-stat--risk" : "",
  ]
    .filter(Boolean)
    .join(" ");

  container.innerHTML = `
    <div class="home-stat${practiceStat.highlight ? " home-stat--highlight" : ""}" aria-label="${escapeAttr(practiceStat.ariaLabel)}">
      <span class="home-stat__value">${escapeHtml(String(practiceStat.value))}</span>
      <span class="home-stat__label">${escapeHtml(practiceStat.label)}</span>
    </div>
    <div class="${streakClasses}" aria-label="${escapeAttr(streakStat.ariaLabel)}">
      <span class="home-stat__value">${streakStat.value}</span>
      <span class="home-stat__label">${escapeHtml(streakStat.label)}</span>
    </div>`;
}

function renderPowerOnExtras({
  teaserEl,
  readBridgeBtn,
  showTeaser = false,
  showReadBridge = false,
} = {}) {
  if (teaserEl) {
    const teaser = showTeaser ? formatNextReviewTeaser() : "";
    teaserEl.textContent = teaser;
    teaserEl.classList.toggle("hidden", !teaser);
  }

  readBridgeBtn?.classList.toggle("hidden", !showReadBridge);
}

function setEmptyStateSecondaryActions({ libraryBtn, showLibrary = false }) {
  libraryBtn?.classList.toggle("hidden", !showLibrary);
}

function renderEmptyState() {
  const emptyEl = document.getElementById("practice-empty");
  const iconEl = document.getElementById("empty-icon");
  const titleEl = document.getElementById("empty-title");
  const messageEl = document.getElementById("empty-message");
  const powerEl = document.getElementById("empty-power");
  const powerHintEl = document.getElementById("power-on-hint");
  const powerTeaserEl = document.getElementById("power-on-teaser");
  const readBridgeBtn = document.getElementById("read-bridge-btn");
  const libraryBtn = document.getElementById("empty-library-btn");

  messageEl.classList.remove("hidden");
  titleEl.classList.remove("hidden");
  iconEl.classList.remove("hidden");
  emptyEl.classList.remove("empty-state--power-complete");
  setEmptyStateActionsMode(emptyEl, iconEl, titleEl, messageEl, false);
  setEmptyStatePowerAction(powerEl, powerHintEl);
  renderPowerOnExtras({
    teaserEl: powerTeaserEl,
    readBridgeBtn,
  });
  setEmptyStateSecondaryActions({ libraryBtn });

  const daily = ensureDailyPracticeState();
  const remainingToday = getDailyRemainingCount(daily);
  const extraDue = getOutstandingDueCount(daily);
  const emptyPreview = document.getElementById("empty-preview");

  function hideLegacyCopy() {
    if (emptyPreview) emptyPreview.hidden = true;
    // Status lives under the power button - avoid a second paragraph by default.
    messageEl.textContent = "";
    messageEl.classList.add("hidden");
  }

  const storiesReady =
    typeof getStoriesForCategory === "function" &&
    getStoriesForCategory().length > 0;

  function showPowerHome({
    mode = "start",
    enabled = true,
    celebrate = false,
    hint = "",
    ariaLabel = "",
    showTeaser = false,
    showReadBridge,
    detail = "",
  } = {}) {
    emptyEl.classList.add("empty-state--power-complete");
    setEmptyStateActionsMode(emptyEl, iconEl, titleEl, messageEl, true);
    hideLegacyCopy();
    if (detail) {
      messageEl.textContent = detail;
      messageEl.classList.remove("hidden");
    }
    const resolvedHint =
      hint !== undefined && hint !== null && String(hint).length
        ? String(hint)
        : formatPowerHomeHint({
            mode,
            extraDue,
          });
    // When fully done, keep aria on the button even if the caption is silent.
    const resolvedAria =
      ariaLabel ||
      resolvedHint ||
      (mode === "complete" && !enabled ? "Done for Today" : "Review");
    setEmptyStatePowerAction(powerEl, powerHintEl, {
      show: true,
      mode,
      ariaLabel: resolvedAria,
      hint: resolvedHint,
      celebrate,
      enabled,
    });
    // Vital few #4: after today's Review job, invite Read when stories exist.
    // Stay quiet during an active set (start/continue without goal met).
    const goalSettled = Boolean(daily.goalMet) || mode === "complete";
    const offerRead =
      typeof showReadBridge === "boolean"
        ? showReadBridge
        : storiesReady && goalSettled && mode !== "start";
    const offerTeaser =
      showTeaser || (mode === "complete" && extraDue === 0 && remainingToday === 0);
    renderPowerOnExtras({
      teaserEl: powerTeaserEl,
      readBridgeBtn,
      showTeaser: offerTeaser,
      showReadBridge: offerRead,
    });
    renderHomeStatus();
  }

  if (sessionJustCompleted) {
    emptyEl.classList.add("session-complete");
    emptyEl.classList.toggle("goal-met", daily.goalMet);
    // Honest end line: never claim “N right” when misses happened.
    // Perfect round only — soft note. Otherwise silence (DONE chip already tells truth).
    const sessionLine =
      sessionIncorrect === 0 && sessionCorrect > 0
        ? sessionCorrect === 1
          ? "1 right this round"
          : `All ${sessionCorrect} right`
        : "";

    // Theme set finished - name it once; skip a second score paragraph.
    if (lastThemeSessionNote) {
      const themeLine = `${lastThemeSessionNote.title} done`;
      showPowerHome({
        mode: remainingToday > 0 || extraDue > 0 ? "continue" : "complete",
        enabled: remainingToday > 0 || extraDue > 0 || hasDailyGoalRemaining(daily),
        hint: themeLine,
        ariaLabel:
          remainingToday > 0
            ? `${themeLine}. Continue daily review`
            : themeLine,
      });
      return;
    }

    if (daily.goalMet && !daily.extraMode) {
      showPowerHome({
        mode: "complete",
        enabled: extraDue > 0,
        celebrate: true,
        hint: formatPowerHomeHint({
          mode: "complete",
          extraDue,
          sessionLine,
        }),
        ariaLabel: extraDue > 0 ? "Keep reviewing extras" : "Done for Today",
      });
    } else if (remainingToday > 0) {
      showPowerHome({
        mode: "continue",
        hint: formatPowerHomeHint({ mode: "continue" }),
        ariaLabel: "Continue",
      });
    } else {
      showPowerHome({
        mode: extraDue > 0 ? "continue" : "complete",
        enabled: extraDue > 0,
        hint: formatPowerHomeHint({
          mode: extraDue > 0 ? "continue" : "complete",
          extraDue,
          sessionLine,
        }),
        ariaLabel: extraDue > 0 ? "Keep reviewing" : "Done for Today",
      });
    }
    return;
  }

  emptyEl.classList.remove("session-complete");
  emptyEl.classList.toggle("goal-met", daily.goalMet && !daily.extraMode);

  if (hasDailyGoalRemaining(daily)) {
    const continuing = daily.reviewed > 0;
    showPowerHome({
      mode: continuing ? "continue" : "start",
      hint: formatPowerHomeHint({
        mode: continuing ? "continue" : "start",
      }),
      ariaLabel: continuing ? "Continue" : "Start Review",
    });
    return;
  }

  if (daily.goalMet && !daily.extraMode) {
    showPowerHome({
      mode: "complete",
      enabled: extraDue > 0,
      hint: formatPowerHomeHint({ mode: "complete", extraDue }),
      ariaLabel: extraDue > 0 ? "Keep reviewing extras" : "Done for Today",
    });
    return;
  }

  emptyEl.classList.remove("goal-met");
  showPowerHome({
    mode: "complete",
    enabled: extraDue > 0,
    hint: formatPowerHomeHint({ mode: "complete", extraDue }),
    ariaLabel: extraDue > 0 ? "Keep reviewing" : "Done for Today",
  });
}

function isWelcomeOpen() {
  const welcome = document.getElementById("welcome-modal");
  return Boolean(welcome && !welcome.classList.contains("hidden"));
}

function setWelcomeGateActive(active) {
  document.body.classList.toggle("welcome-open", active);
  document.body.classList.toggle("modal-open", active);

  const app = document.querySelector(".app");
  if (!app) return;

  if (active) {
    app.setAttribute("inert", "");
    app.setAttribute("aria-hidden", "true");
  } else {
    app.removeAttribute("inert");
    app.removeAttribute("aria-hidden");
  }
}

function blockWelcomeBypass(event) {
  if (!isWelcomeOpen()) return;
  // Allow interaction anywhere inside the welcome card *or* its language menu
  // (menu is portaled in layout as absolute and must stay scrollable / tappable).
  if (
    event.target.closest(".welcome-card") ||
    event.target.closest(".category-picker--welcome") ||
    event.target.closest("#welcome-category-picker-menu")
  ) {
    return;
  }
  event.preventDefault();
  event.stopPropagation();
}

function isOnProgressTab() {
  const statsPanel = document.getElementById("stats-panel");
  return Boolean(statsPanel?.classList.contains("active") && !statsPanel.hidden);
}

function isCategoryPickerAvailable() {
  // Welcome gate or Progress tab (flag control lives on Progress).
  return isWelcomeOpen() || isOnProgressTab();
}

function updateCategoryPickerAvailability() {
  if (!isCategoryPickerAvailable() && categoryMenuOpen) closeCategoryMenu();
}

function updatePracticeFocusClass() {
  const app = document.querySelector(".app");
  const practicePanel = document.getElementById("practice-panel");
  if (!app || !practicePanel) return;
  const onPracticeTab = practicePanel.classList.contains("active") && !practicePanel.hidden;
  app.classList.toggle("practice-focus", onPracticeTab && Boolean(currentCard));
  updateCategoryPickerAvailability();
}

function updateReadFocusClass() {
  const app = document.querySelector(".app");
  const readPanel = document.getElementById("read-panel");
  if (!app || !readPanel) return;
  const onReadTab = readPanel.classList.contains("active") && !readPanel.hidden;
  app.classList.toggle("read-focus", onReadTab);
}

function renderPractice() {
  const daily = ensureDailyPracticeState();
  const goalChip = document.getElementById("daily-goal-chip");
  const progressBar = document.getElementById("daily-progress");
  const progressFill = document.getElementById("daily-progress-fill");
  const practiceMeta = document.getElementById("practice-meta");

  const inTheme = Boolean(themeSessionPackId && themeSessionTotal > 0);
  const showGoal = !inTheme && daily.goal > 0 && !daily.extraMode;

  if (practiceMeta) {
    practiceMeta.classList.toggle("hidden", !showGoal && !inTheme);
    practiceMeta.classList.toggle("is-theme", inTheme);
    practiceMeta.classList.toggle(
      "is-complete",
      Boolean(showGoal && daily.goalMet)
    );
    practiceMeta.classList.toggle(
      "is-active",
      Boolean(
        (showGoal && !daily.goalMet && daily.reviewed > 0) ||
          (inTheme && getThemeSessionDoneCount() > 0)
      )
    );
  }

  if (goalChip) {
    if (inTheme) {
      const pack = getThematicPackById(themeSessionPackId);
      const done = getThemeSessionDoneCount();
      const total = themeSessionTotal;
      const left = getThemeSessionRemaining();
      const name = (pack?.title || "Theme").split(/[&·]/)[0].trim();
      const countText = `${name} ${done}/${total}`;
      const countEl = document.getElementById("daily-goal-count");
      if (countEl) countEl.textContent = countText;
      else goalChip.textContent = countText;
      goalChip.classList.remove("hidden", "goal-met");
      goalChip.classList.add("is-live", "is-theme-chip");
      // Theme set is not the daily-cap control - keep it non-interactive look via aria only.
      goalChip.setAttribute(
        "aria-label",
        `${pack?.title || "Theme"}: ${done} of ${total}, ${left} left`
      );
      goalChip.removeAttribute("title");
    } else {
      goalChip.classList.remove("is-theme-chip");
      goalChip.classList.toggle("hidden", !showGoal);
      goalChip.classList.toggle("goal-met", Boolean(showGoal && daily.goalMet));
      goalChip.classList.toggle(
        "is-live",
        Boolean(showGoal && !daily.goalMet && daily.reviewed > 0)
      );
      if (showGoal) {
        const countEl = document.getElementById("daily-goal-count");
        const countText = `${daily.reviewed}/${daily.goal}`;
        if (countEl) countEl.textContent = countText;
        else goalChip.textContent = countText;
        const status = daily.goalMet
          ? "Goal complete"
          : `Daily goal ${daily.reviewed} of ${daily.goal}`;
        goalChip.setAttribute(
          "aria-label",
          `${status}. Tap to change daily target.`
        );
        goalChip.removeAttribute("title");
      }
    }
  }

  if (progressBar && progressFill) {
    if (inTheme) {
      const done = getThemeSessionDoneCount();
      const total = themeSessionTotal || 1;
      const pct = Math.min(100, Math.round((done / total) * 100));
      progressBar.classList.remove("hidden", "is-complete");
      progressBar.classList.add("is-theme-bar");
      progressFill.style.width = `${pct}%`;
      progressBar.setAttribute("aria-valuenow", String(done));
      progressBar.setAttribute("aria-valuemax", String(total));
      const pack = getThematicPackById(themeSessionPackId);
      progressBar.setAttribute(
        "aria-label",
        `${pack?.title || "Theme"}: ${done} of ${total}`
      );
    } else {
      progressBar.classList.remove("is-theme-bar");
      const showBar = showGoal;
      progressBar.classList.toggle("hidden", !showBar);
      progressBar.classList.toggle(
        "is-complete",
        Boolean(showBar && daily.goalMet)
      );
      if (showBar) {
        const pct = Math.min(100, Math.round((daily.reviewed / daily.goal) * 100));
        progressFill.style.width = `${pct}%`;
        progressBar.setAttribute("aria-valuenow", String(daily.reviewed));
        progressBar.setAttribute("aria-valuemax", String(daily.goal));
        progressBar.setAttribute(
          "aria-label",
          daily.goalMet
            ? `Daily goal complete: ${daily.reviewed} of ${daily.goal}`
            : `${daily.reviewed} of ${daily.goal} cards reviewed today`
        );
      }
    }
  }

  const emptyEl = document.getElementById("practice-empty");
  const activeEl = document.getElementById("practice-active");

  if (!currentCard) {
    renderEmptyState();
    emptyEl.classList.remove("hidden");
    activeEl.classList.add("hidden");
    updatePracticeFocusClass();
    return;
  }

  sessionJustCompleted = false;
  emptyEl.classList.add("hidden");
  activeEl.classList.remove("hidden");
  updatePracticeFocusClass();

  const labels = getDirectionLabels(getActiveCategory(), currentCard);
  const promptEl = document.getElementById("prompt-text");
  promptEl.textContent = getPromptDisplayText(currentCard);
  promptEl.lang = labels.promptLang;
  promptEl.className = "prompt norwegian";

  // Theme progress lives in the goal strip - no second “N left” line under the prompt.
  const promptHint = document.getElementById("prompt-hint");
  if (promptHint) {
    promptHint.textContent = "";
    promptHint.classList.add("hidden");
  }

  const directionLabel = document.getElementById("prompt-direction");
  if (directionLabel) {
    directionLabel.textContent = labels.promptLabel;
  }

  hideFeedback();
  ensureCardAttemptState();
  setAnswerFieldHighlight(false);
  setAnswerReceivedState(false);
  setAnswerIncorrectState(false);

  const input = document.getElementById("answer-input");
  input.value = "";
  if (input) {
    input.lang = String(labels.answerLang || "en").split("-")[0];
  }
  if (!speakModeActive) focusAnswerInput();
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return str.replace(/"/g, "&quot;");
}

function sortCards(cards) {
  return [...cards].sort((a, b) => {
    if (a.rank && b.rank) return a.rank - b.rank;
    if (a.rank) return -1;
    if (b.rank) return 1;
    return a.foreign.localeCompare(b.foreign);
  });
}

function isWordBand(band) {
  return (
    band === "A" ||
    band === "B" ||
    band === "C" ||
    band === "D" ||
    band === "E" ||
    band === "F" ||
    band === "G"
  );
}

function matchesLibraryFilter(card) {
  if (libraryFilter === "phrase" && card.band !== "phrase") return false;
  if (libraryFilter === "yours" && card.band) return false;
  if (libraryFilter === "themes" && !card.packId) return false;

  if (!librarySearch.trim()) return true;

  const query = normalizeAnswer(librarySearch);
  const foreign = normalizeAnswer(card.foreign);
  const native = normalizeAnswer(card.native);
  return foreign.includes(query) || native.includes(query);
}

function getThemeSectionLabel(packId) {
  const pack = getThematicPackById(packId);
  if (pack?.title) return pack.title;
  if (!packId) return "Theme";
  return packId.charAt(0).toUpperCase() + packId.slice(1);
}

function preferLibraryCard(existing, candidate) {
  if (existing.rank != null && candidate.rank != null) {
    return candidate.rank < existing.rank ? candidate : existing;
  }
  if (candidate.rank != null) return candidate;
  if (existing.rank != null) return existing;
  if (existing.band && !candidate.band) return existing;
  if (candidate.band && !existing.band) return candidate;
  return existing;
}

function dedupeLibraryCards(cards) {
  const byForeign = new Map();
  cards.forEach((card) => {
    const key = normalizeAnswer(card.foreign);
    const existing = byForeign.get(key);
    byForeign.set(key, existing ? preferLibraryCard(existing, card) : card);
  });
  return sortCards([...byForeign.values()]);
}

function getCategoryLanguageCodes(category = getActiveCategory()) {
  const foreignCode = (category.foreignLang || "nb").split("-")[0];
  const nativeCode = (category.answerLang || "en-US").split("-")[0];
  return { foreignCode, nativeCode };
}

function findDeckCardByForeign(foreign, excludeId = null) {
  const key = normalizeAnswer(foreign);
  if (!key) return null;
  // Exact normalized form first
  const exact = deck.find(
    (card) => card.id !== excludeId && normalizeAnswer(card.foreign) === key
  );
  if (exact) return exact;

  // Soft: orthography / typing-equivalent L2 is the same card (kafé ≈ kafe).
  // Prevents silent doubles; review shows the stored form.
  const foreignCode = getActiveCategory()?.foreignLang || "";
  return (
    deck.find((card) => {
      if (card.id === excludeId) return false;
      const other = card.foreign;
      if (!other) return false;
      return (
        norwegianTypingMatches(other, foreign) ||
        foreignOrthographyMatches(other, foreign, foreignCode)
      );
    }) || null
  );
}

/** True when stored L2 display form differs from what the user typed (soft match). */
function deckCardIsNearSpelling(card, foreign) {
  if (!card || !foreign) return false;
  return (
    stripFlashcardPunctuation(card.foreign) !==
    stripFlashcardPunctuation(foreign)
  );
}

/** Pack title for quiet “From Dining” / “Also in Dining” copy. */
function getPackDisplayTitle(packId) {
  if (!packId) return "";
  const pack = getThematicPackById(packId);
  return String(pack?.title || packId || "").trim();
}

/**
 * Match an L2 form to a thematic pack entry (enabled or not).
 * Used for add-card feedback - not for auto-adding the pack.
 */
function findThematicPackMatch(foreign, categoryId = activeCategoryId) {
  const key = normalizeAnswer(foreign);
  if (!key) return null;
  for (const pack of getThematicPackList()) {
    const entries = getPackEntriesForCategory(pack, categoryId);
    for (const entry of entries) {
      if (normalizeAnswer(entry.foreign) !== key) continue;
      return {
        packId: pack.id,
        title: getPackDisplayTitle(pack.id) || pack.id,
        foreign: entry.foreign,
        native: entry.native,
        enabled: isPackEnabled(pack.id, categoryId),
      };
    }
  }
  return null;
}

/** Quiet source line when a deck card came from an optional pack. */
function describeDeckCardPackSource(card) {
  if (!card?.packId) return "";
  const title = getPackDisplayTitle(card.packId);
  return title ? `From ${title}` : "";
}

/** Slash glosses: "dog / hound" matches "dog". Case-insensitive. */
function glossPartsMatch(a, b) {
  if (!a || !b) return false;
  if (normalizeAnswer(a) === normalizeAnswer(b)) return true;
  if (norwegianTypingMatches(a, b)) return true;
  if (englishDialectSpellingMatches(a, b)) return true;
  if (
    foreignOrthographyMatches(a, b, getActiveCategory()?.foreignLang || "") ||
    foreignOrthographyMatches(a, b, "en")
  ) {
    return true;
  }
  if (particleAnswerMatches(a, b)) return true;

  const partsA = String(a)
    .split("/")
    .map((part) => normalizeAnswer(part))
    .filter(Boolean);
  const partsB = String(b)
    .split("/")
    .map((part) => normalizeAnswer(part))
    .filter(Boolean);

  const foreignCode = getActiveCategory()?.foreignLang || "";
  for (const left of partsA) {
    for (const right of partsB) {
      if (
        left === right ||
        norwegianTypingMatches(left, right) ||
        englishDialectSpellingMatches(left, right) ||
        foreignOrthographyMatches(left, right, foreignCode) ||
        foreignOrthographyMatches(left, right, "en") ||
        particleAnswerMatches(left, right)
      ) {
        return true;
      }
    }
  }
  return false;
}

/** resume ≈ resumes, box ≈ boxes (simple English inflection, not full stemming). */
function englishInflectionMatch(a, b) {
  // Fold BE/AE first so organises ≈ organizes
  const x = foldEnglishDialectSpelling(a);
  const y = foldEnglishDialectSpelling(b);
  if (!x || !y || x.includes(" ") || y.includes(" ")) return false;
  if (x === y) return true;
  if (x + "s" === y || y + "s" === x) return true;
  if (x + "es" === y || y + "es" === x) return true;
  if (x.endsWith("y") && x.length > 2 && x.slice(0, -1) + "ies" === y) return true;
  if (y.endsWith("y") && y.length > 2 && y.slice(0, -1) + "ies" === x) return true;
  if (x.endsWith("ie") && x + "s" === y) return true;
  if (y.endsWith("ie") && y + "s" === x) return true;
  return false;
}

/**
 * One substitution/insert/delete for longer single tokens.
 * Requires the same first letter so flott ≉ slott (which was hijacking great/flott → castle).
 * minLen defaults to 5 (answer matching). Review spelling may pass 4 for feel≈feal in phrases.
 */
function withinOneEdit(a, b, minLen = 5) {
  const s = normalizeAnswer(a);
  const t = normalizeAnswer(b);
  if (!s || !t || s === t) return s === t;
  if (s.includes(" ") || t.includes(" ")) return false;
  if (s.length < minLen || t.length < minLen) return false;
  if (s[0] !== t[0]) return false;
  if (Math.abs(s.length - t.length) > 1) return false;

  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < s.length && j < t.length) {
    if (s[i] === t[j]) {
      i += 1;
      j += 1;
      continue;
    }
    edits += 1;
    if (edits > 1) return false;
    if (s.length > t.length) i += 1;
    else if (t.length > s.length) j += 1;
    else {
      i += 1;
      j += 1;
    }
  }
  edits += s.length - i + (t.length - j);
  return edits <= 1;
}

/** Normalized word tokens for review spelling compare. */
function reviewTokens(text) {
  return normalizeAnswer(String(text || ""))
    .split(" ")
    .filter(Boolean);
}

/**
 * Single-token soft match (exact, dialect, inflection, one-edit, Norwegian typing).
 * minEditLen: 5 for answers; 4 allowed in multi-word review so feel≈feal is caught.
 */
function softTokenMatch(a, b, minEditLen = 5) {
  if (!a || !b) return false;
  const x = normalizeAnswer(a);
  const y = normalizeAnswer(b);
  if (!x || !y) return false;
  if (x === y) return true;
  if (norwegianTypingMatches(x, y)) return true;
  if (englishDialectSpellingMatches(x, y)) return true;
  if (
    foreignOrthographyMatches(x, y, getActiveCategory()?.foreignLang || "") ||
    foreignOrthographyMatches(x, y, "en")
  ) {
    return true;
  }
  if (englishInflectionMatch(x, y)) return true;
  if (withinOneEdit(x, y, minEditLen)) return true;
  return false;
}

/**
 * Review-time gloss compare: exact vs soft (typo / inflection / dialect).
 * Multi-word: same token count, each word soft-matches (min edit 4 so "feal"→"feel").
 * spellingOnly means soft match that is NOT exact - never treat as "Looks good".
 */
function reviewGlossCompare(user, suggested) {
  if (!user || !suggested) {
    return { exact: false, soft: false, spellingOnly: false };
  }

  const u = stripFlashcardPunctuation(user);
  const s = stripFlashcardPunctuation(suggested);
  if (!u || !s) {
    return { exact: false, soft: false, spellingOnly: false };
  }

  if (normalizeAnswer(u) === normalizeAnswer(s)) {
    return { exact: true, soft: true, spellingOnly: false };
  }

  // Slash / particle / dialect exact-enough (still may differ in display form)
  if (glossPartsMatch(u, s) || particleAnswerMatches(u, s)) {
    return { exact: true, soft: true, spellingOnly: false };
  }

  // BE/AE English + major L2 orthography variants count as exact for Check
  if (englishDialectSpellingMatches(u, s)) {
    return { exact: true, soft: true, spellingOnly: false };
  }
  const foreignCode = getActiveCategory()?.foreignLang || "";
  if (
    foreignOrthographyMatches(u, s, foreignCode) ||
    foreignOrthographyMatches(u, s, "en")
  ) {
    return { exact: true, soft: true, spellingOnly: false };
  }

  const wu = reviewTokens(u);
  const ws = reviewTokens(s);

  // Multi-word phrase: require same length, allow one-letter typos on long tokens
  if (wu.length >= 2 && wu.length === ws.length) {
    let allExact = true;
    for (let i = 0; i < wu.length; i += 1) {
      if (wu[i] === ws[i]) continue;
      allExact = false;
      // Anchored by the rest of the phrase → minLen 4 catches feel/feal
      if (!softTokenMatch(wu[i], ws[i], 4)) {
        return { exact: false, soft: false, spellingOnly: false };
      }
    }
    return { exact: allExact, soft: true, spellingOnly: !allExact };
  }

  // Single token: prefer min 5, then min 4 for 4+ letter words (feel/feal)
  if (wu.length === 1 && ws.length === 1) {
    if (softTokenMatch(wu[0], ws[0], 5) || softTokenMatch(wu[0], ws[0], 4)) {
      return { exact: false, soft: true, spellingOnly: true };
    }
  }

  // Full-string soft (slash parts, short phrases that didn't token-align)
  if (softGlossMatch(u, s)) {
    return { exact: false, soft: true, spellingOnly: true };
  }

  return { exact: false, soft: false, spellingOnly: false };
}

/**
 * Soft match for suggestions/review: case, æ/ø/å typing, slash glosses,
 * simple plurals, one-letter typos, and multi-word phrase typos.
 */
function softGlossMatch(a, b) {
  if (!a || !b) return false;
  if (glossPartsMatch(a, b)) return true;
  if (particleAnswerMatches(a, b)) return true;

  const partsA = String(a)
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
  const partsB = String(b)
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

  for (const left of partsA) {
    for (const right of partsB) {
      if (particleAnswerMatches(left, right)) return true;
      if (englishInflectionMatch(left, right)) return true;
      if (englishDialectSpellingMatches(left, right)) return true;
      if (withinOneEdit(left, right)) return true;
      if (norwegianTypingMatches(left, right)) return true;

      // Multi-word: same token count, each word soft-matches (min 4 in phrases)
      const wl = reviewTokens(left);
      const wr = reviewTokens(right);
      if (wl.length >= 2 && wl.length === wr.length) {
        if (wl.every((word, i) => softTokenMatch(word, wr[i], 4))) return true;
      }
    }
  }
  return false;
}

/**
 * Light display polish only. Do NOT uppercase normal words (god → GOD was wrong).
 * Only promote true consonant-only acronyms: cv → CV, pdf → PDF.
 */
function preferDisplayForm(text) {
  const cleaned = stripFlashcardPunctuation(cleanTranslationCandidate(text));
  if (!cleaned) return cleaned;
  if (/^[a-z]{2,4}$/.test(cleaned) && !/[aeiouyæøåäöü]/i.test(cleaned)) {
    return cleaned.toUpperCase();
  }
  return cleaned;
}

function suggestionMatchScore(query, foreign, native) {
  const q = normalizeAnswer(query);
  if (!q) return 0;
  const qCore = stripAnswerParticles(q) || q;

  const scoreSide = (sideRaw) => {
    const side = normalizeAnswer(sideRaw);
    if (!side) return 0;
    if (side === q) return 100;
    // å spise ≈ spise, to be ≈ be (same card, optional particle)
    if (particleAnswerMatches(sideRaw, query) || particleAnswerMatches(side, q)) return 96;
    if (softGlossMatch(sideRaw, query) || softGlossMatch(side, q)) return 92;
    if (side.startsWith(q) || (qCore.length >= 2 && side.startsWith(qCore))) return 80;
    const words = side.split(" ");
    if (words.some((word) => word === q || word === qCore)) return 70;
    if (
      words.some(
        (word) =>
          particleAnswerMatches(word, q) ||
          particleAnswerMatches(word, qCore) ||
          englishInflectionMatch(word, q) ||
          withinOneEdit(word, q) ||
          withinOneEdit(word, qCore)
      )
    ) {
      return 68;
    }
    if (words.some((word) => word.startsWith(q) || (qCore.length >= 2 && word.startsWith(qCore)))) {
      return 55;
    }
    // Avoid flooding on 1–2 letter mid-word hits (en, er, to…)
    if (q.length >= 3 && side.includes(q)) return 30;
    if (qCore.length >= 3 && side.includes(qCore)) return 28;
    if (q.length === 2 && (side.startsWith(q) || words.some((word) => word.startsWith(q)))) return 20;
    return 0;
  };

  let score = Math.max(scoreSide(foreign), scoreSide(native));
  if (q.includes(" ") && score >= 30) score += 8;
  return score;
}

function rankSuggestionEntries(entries, query, limit) {
  return entries
    .map((entry) => ({
      ...entry,
      _score: suggestionMatchScore(query, entry.foreign, entry.native),
    }))
    .filter((entry) => entry._score > 0)
    .sort((a, b) => b._score - a._score || (a.rank || 9999) - (b.rank || 9999))
    .slice(0, limit)
    .map(({ _score, ...entry }) => entry);
}

function getStarterSuggestions(query, limit = 5) {
  const q = normalizeAnswer(query);
  if (!q || q.length < 2) return [];

  const entries = getStarterDeckEntries().map((entry) => {
    const inDeck = Boolean(findDeckCardByForeign(entry.foreign));
    return {
      foreign: entry.foreign,
      native: entry.native,
      rank: entry.rank,
      // Honest label - starter catalog is not always already in the live deck.
      meta: inDeck ? "In your deck" : "Essentials",
      selectable: true,
    };
  });

  return rankSuggestionEntries(entries, query, limit);
}

function getLibrarySuggestions(query, limit = 5) {
  const q = normalizeAnswer(query);
  if (!q || q.length < 2) return [];

  const entries = sortCards(deck)
    .filter((card) => card.id !== editingCardId)
    .map((card) => ({
      foreign: card.foreign,
      native: card.native,
      rank: card.rank,
      meta: card.packId
        ? `In your deck · ${getPackDisplayTitle(card.packId) || "Pack"}`
        : "In your deck",
      selectable: true,
    }));

  return rankSuggestionEntries(entries, query, limit);
}

/**
 * Words from packs the user has not Added yet - discoverable in typeahead,
 * never auto-enables the pack.
 */
function getPackCatalogSuggestions(query, limit = 5) {
  const q = normalizeAnswer(query);
  if (!q || q.length < 2) return [];

  const entries = [];
  for (const pack of getThematicPackList()) {
    if (isPackEnabled(pack.id)) continue;
    const title = getPackDisplayTitle(pack.id) || pack.id;
    for (const entry of getPackEntriesForCategory(pack)) {
      if (!entry?.foreign) continue;
      // Skip forms already in the deck (those surface via library suggestions).
      if (findDeckCardByForeign(entry.foreign)) continue;
      entries.push({
        foreign: entry.foreign,
        native: entry.native,
        rank: 8000,
        meta: `In ${title}`,
        selectable: true,
      });
    }
  }
  return rankSuggestionEntries(entries, query, limit);
}

/** Prefer curated deck pairs over machine translation for review. */
function findLocalDeckPair(foreign, native) {
  const candidates = [];

  getStarterDeckEntries().forEach((entry) => {
    const inDeck = Boolean(findDeckCardByForeign(entry.foreign));
    candidates.push({
      foreign: entry.foreign,
      native: entry.native,
      meta: inDeck ? "In your deck" : "Essentials",
      source: "starter",
    });
  });

  deck.forEach((card) => {
    if (card.id === editingCardId) return;
    candidates.push({
      foreign: card.foreign,
      native: card.native,
      meta: card.packId
        ? `In your deck · ${getPackDisplayTitle(card.packId) || "Pack"}`
        : "In your deck",
      source: "library",
    });
  });

  const hasForeign = Boolean(foreign?.trim());
  const hasNative = Boolean(native?.trim());

  // Full pair only when BOTH sides clearly match (never flott+great → slott+castle).
  if (hasForeign && hasNative) {
    const exactPair = candidates.find(
      (entry) =>
        (glossPartsMatch(entry.foreign, foreign) || norwegianTypingMatches(entry.foreign, foreign)) &&
        (glossPartsMatch(entry.native, native) || englishInflectionMatch(entry.native, native))
    );
    if (exactPair) return exactPair;
  }

  if (hasForeign) {
    const exactForeign = candidates.find((entry) => glossPartsMatch(entry.foreign, foreign));
    if (exactForeign) return exactForeign;

    const foldForeign = candidates.find((entry) => norwegianTypingMatches(entry.foreign, foreign));
    if (foldForeign) return foldForeign;
  }

  if (hasNative) {
    const exactNative = candidates.find((entry) => glossPartsMatch(entry.native, native));
    if (exactNative) return exactNative;

    const softNative = candidates.find(
      (entry) =>
        englishInflectionMatch(entry.native, native) || glossPartsMatch(entry.native, native)
    );
    if (softNative) return softNative;
  }

  return null;
}

function cleanTranslationCandidate(text) {
  if (!text) return "";
  return stripFlashcardPunctuation(text);
}

/**
 * Drop TM junk: JSON fragments, CSS/code compounds (Supervertical-align), etc.
 * sourceText helps reject absurd expansions of short everyday words.
 */
function isGarbageTranslation(text, sourceText = "") {
  const cleaned = cleanTranslationCandidate(text);
  if (!cleaned) return true;
  if (cleaned.length > 140) return true;
  if (/^["'][\p{L}\p{N}\s-]+["']\s*:\s*["'].*["'],?\s*$/u.test(cleaned)) return true;
  if (/["']\s*:\s*["']/.test(cleaned)) return true;
  if (/^[{[\]}]+$/.test(cleaned)) return true;

  const specialCount = (cleaned.match(/[{}[\]":,]/g) || []).length;
  if (specialCount >= 2 || specialCount / cleaned.length > 0.12) return true;

  // CSS / layout / code-ish tokens that leak into Public_Corpora
  if (
    /(?:vertical-align|text-align|font-(?:size|weight|family)|line-height|letter-spacing|background-color|border-radius|z-index|flexbox|min-width|max-width|min-height|max-height|box-shadow|text-decoration|white-space|overflow-x|overflow-y|justify-content|align-items|align-self|grid-template|padding-|margin-|border-)/i.test(
      cleaned
    )
  ) {
    return true;
  }
  if (
    /(?:vertical|horizontal|align|opacity|overflow|position|display|cursor|pointer|scroll|transform|transition|animation|keyframes|stylesheet|!important)/i.test(
      cleaned
    ) &&
    /-/i.test(cleaned)
  ) {
    return true;
  }

  // Dated slang TM noise (flott → bang-up) when a normal word is expected
  if (/^(bang-up|bully|corking|top-hole|spiffing)$/i.test(cleaned)) return true;

  // camelCase / PascalCase compounds (getElementById, SuperVertical)
  if (/[a-z][A-Z]/.test(cleaned)) return true;
  if (/^[A-Z][a-z]+[A-Z]/.test(cleaned)) return true;

  // Short everyday source → long hyphenated blob (super → Supervertical-align)
  const source = cleanTranslationCandidate(sourceText);
  if (source) {
    const sourceWords = source.split(/\s+/).filter(Boolean);
    const sourceCompact = source.replace(/[\s-]/g, "");
    const cleanedCompact = cleaned.replace(/[\s-]/g, "");
    if (sourceWords.length === 1 && sourceCompact.length <= 12) {
      if (cleanedCompact.length >= Math.max(12, sourceCompact.length * 2 + 2) && /-/u.test(cleaned)) {
        return true;
      }
      // One short word should not become a multi-hyphen technical phrase
      if ((cleaned.match(/-/g) || []).length >= 1 && cleanedCompact.length > sourceCompact.length + 8) {
        return true;
      }
    }
  }

  return false;
}

/**
 * MyMemory's memory is thinner for `nb` than for `no` (same written Bokmål for our purposes).
 * Using `nb` is why NO→EN suggestions are worse than EN→NO more often.
 */
function toMyMemoryLangCode(code) {
  const base = String(code || "")
    .split("-")[0]
    .toLowerCase();
  if (base === "nb" || base === "nn") return "no";
  return base || code;
}

/**
 * Rank translation memory hits. Not spell-correcting Norwegian - picking among API candidates.
 * Near-ties like "fucke" (0.99) vs "fuck" (0.98) should prefer real English.
 */
function scoreTranslationCandidate(entry, peers, toLang, sourceWordCount) {
  let score = Number(entry.match) || 0;
  const text = normalizeAnswer(entry.text);
  const toEnglish = toLang === "en";
  const words = text.split(" ").filter(Boolean);

  // Prefer US English TM rows when the app's answer language is English
  if (toEnglish && /^en-us$/i.test(entry.target || "")) score += 0.03;
  if (toEnglish && /^en-gb$/i.test(entry.target || "")) score -= 0.01;

  // Crowd TMs sometimes paste Scandinavian infinitive -e onto English ("fucke")
  if (toEnglish && sourceWordCount === 1 && words.length === 1) {
    for (const peer of peers) {
      const peerText = normalizeAnswer(peer.text);
      if (!peerText || peerText === text) continue;
      if (text.startsWith(peerText) && text.length - peerText.length <= 2) {
        const extra = text.slice(peerText.length);
        // "fuck"+"e", "run"+"s", "dog"+"s" when both are candidates
        if (/^[es]$/i.test(extra)) score -= 0.08;
      }
    }
  }

  // Single-word sources: prefer a compact gloss (super → Super, not Supervertical-align)
  if (sourceWordCount === 1) {
    if (words.length === 1 && !entry.text.includes("-")) score += 0.04;
    if (words.length === 1 && entry.text.includes("-")) score -= 0.06;
    if (words.length >= 3) score -= 0.04;
    const outLen = text.replace(/\s+/g, "").length;
    if (entry._sourceLen > 0 && outLen > entry._sourceLen * 2.5 && outLen >= 12) {
      score -= 0.1;
    }
    // great: god and flott often tie at 0.99 - slight preference for a fuller everyday gloss
    if (!toEnglish && words.length === 1 && outLen >= 4 && outLen <= 12) {
      score += 0.015;
    }
  }

  // Short acronyms (CV, ID…): prefer a real English word over echoing the acronym
  if (sourceWordCount === 1 && toEnglish && entry._sourceLen > 0 && entry._sourceLen <= 3) {
    if (words.length === 1 && text.length > entry._sourceLen + 1) score += 0.05;
    if (words.length >= 2) score += 0.03;
  }

  // Prefer conventional acronym casing when the hit is already a short ALL-CAPS token
  if (words.length === 1 && /^[A-Z]{2,4}$/.test(entry.text)) {
    score += 0.01;
  }

  // For short sources, lightly prefer neural MT over dusty TM junk - but only as a tie-break
  if (sourceWordCount <= 2 && entry.fromMachine) score += 0.01;

  return score;
}

function pickBestTranslationSuggestion(data, sourceText, toLang = "en") {
  const source = sourceText.trim();
  const wordCount = source.split(/\s+/).filter(Boolean).length;
  const candidates = [];
  const targetLang = toMyMemoryLangCode(toLang);

  // Primary neural/default response - prefer this over dusty TM "quality" scores
  // (those can rank "I want a blow job" above a correct sword/birthday gloss).
  const primaryRaw = data.responseData?.translatedText;
  const primaryClean = primaryRaw ? cleanTranslationCandidate(primaryRaw) : "";
  const primaryOk =
    primaryClean &&
    !isGarbageTranslation(primaryClean, source) &&
    isPlausibleCardText(primaryClean);

  if (primaryClean) {
    candidates.push({
      text: primaryClean,
      match: Number(data.responseData?.match) || 0.7,
      fromMachine: true,
      target: "",
      isPrimary: true,
    });
  }

  if (Array.isArray(data.matches)) {
    data.matches.forEach((entry) => {
      if (!entry?.translation) return;
      const fromMachine =
        entry["created-by"] === "MT!" ||
        entry.reference === "Machine Translation." ||
        entry.model === "neural";
      candidates.push({
        text: entry.translation,
        match: Number(entry.match) || 0,
        fromMachine,
        target: entry.target || "",
        isPrimary: false,
      });
    });
  }

  // Idioms / long slang: demand higher confidence or skip the suggestion
  const minMatch = wordCount >= 3 ? 0.72 : wordCount === 2 ? 0.55 : 0.45;

  const cleaned = candidates
    .map((entry) => ({
      ...entry,
      text: entry.isPrimary ? entry.text : cleanTranslationCandidate(entry.text),
    }))
    .filter((entry) => entry.text && !isGarbageTranslation(entry.text, source))
    .filter((entry) => isPlausibleCardText(entry.text))
    // Do NOT drop loanwords that match the source (super → Super / super).
    .filter(
      (entry) =>
        entry.isPrimary ||
        entry.match >= minMatch ||
        (!entry.fromMachine && entry.match >= 0.35)
    );

  // Multi-word: drop TM hits whose length is wildly unlike the primary (wrong sense)
  const primaryWords = primaryOk ? reviewTokens(primaryClean).length : 0;
  const lengthSane = cleaned.filter((entry) => {
    if (entry.isPrimary || primaryWords < 3) return true;
    const w = reviewTokens(entry.text).length;
    return Math.abs(w - primaryWords) <= 2;
  });

  // Dedupe by normalized text, keep the best raw match per form
  const byText = new Map();
  lengthSane.forEach((entry) => {
    const key = normalizeAnswer(entry.text);
    const prev = byText.get(key);
    if (
      !prev ||
      entry.isPrimary ||
      (!prev.isPrimary && entry.match > prev.match)
    ) {
      byText.set(key, entry);
    }
  });
  const unique = [...byText.values()];

  // Prefer primary when present and plausible - never let a higher TM score hijack meaning
  if (primaryOk) {
    const primaryHit = unique.find(
      (entry) => normalizeAnswer(entry.text) === normalizeAnswer(primaryClean)
    );
    if (primaryHit) return preferDisplayForm(primaryHit.text);
    return preferDisplayForm(primaryClean);
  }

  const sourceLen = normalizeAnswer(source).replace(/\s+/g, "").length;
  const ranked = unique
    .map((entry) => ({
      ...entry,
      _sourceLen: sourceLen,
      _rank: scoreTranslationCandidate(
        { ...entry, _sourceLen: sourceLen },
        unique,
        targetLang,
        wordCount
      ),
    }))
    .sort((a, b) => b._rank - a._rank || b.match - a.match);

  const best = ranked[0]?.text || null;
  return best ? preferDisplayForm(best) : null;
}

/** Session cache so Check card / suggestions don't burn rate limits on the same phrase. */
const translationSuggestionCache = new Map();

function translationSuggestionCacheKey(text, from, to) {
  return `${from}|${to}|${normalizeAnswer(text)}`;
}

function acceptTranslationCandidate(picked, sourceText) {
  if (!picked || looksLikeGibberish(picked) || !isPlausibleCardText(picked)) return null;
  const sourceCompact = normalizeAnswer(sourceText).replace(/\s+/g, "");
  const pickedCompact = normalizeAnswer(picked).replace(/\s+/g, "");
  // Refuse absurd compressions: resumekeieie → CV-en
  if (
    sourceCompact.length >= 9 &&
    pickedCompact.length <= 6 &&
    sourceCompact.length >= pickedCompact.length * 2
  ) {
    return null;
  }
  return preferDisplayForm(stripFlashcardPunctuation(picked));
}

async function fetchMyMemoryTranslation(trimmed, from, to) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${encodeURIComponent(`${from}|${to}`)}`;
  try {
    const response = await fetch(url);
    if (response.status === 429) return { rateLimited: true, text: null };
    if (!response.ok) return { rateLimited: false, text: null };
    const data = await response.json();
    if (data.responseStatus !== 200) return { rateLimited: false, text: null };
    const picked = pickBestTranslationSuggestion(data, trimmed, to);
    return { rateLimited: false, text: acceptTranslationCandidate(picked, trimmed) };
  } catch {
    return { rateLimited: false, text: null };
  }
}

/**
 * Fallback when MyMemory is rate-limited or empty.
 * Unofficial Google translate endpoint (client=gtx) - used only as backup.
 */
async function fetchGoogleTranslateFallback(trimmed, from, to) {
  try {
    const url =
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(from)}` +
      `&tl=${encodeURIComponent(to)}&dt=t&q=${encodeURIComponent(trimmed)}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    if (!Array.isArray(data) || !Array.isArray(data[0])) return null;
    const translated = data[0]
      .map((part) => (Array.isArray(part) ? part[0] : ""))
      .filter(Boolean)
      .join("");
    return acceptTranslationCandidate(translated, trimmed);
  } catch {
    return null;
  }
}

async function fetchTranslationSuggestion(text, fromLang, toLang) {
  const trimmed = text.trim();
  if (!trimmed || !shouldRequestTranslation(trimmed)) return null;

  const from = toMyMemoryLangCode(fromLang);
  const to = toMyMemoryLangCode(toLang);
  const cacheKey = translationSuggestionCacheKey(trimmed, from, to);
  if (translationSuggestionCache.has(cacheKey)) {
    return translationSuggestionCache.get(cacheKey);
  }

  // 1) MyMemory (primary)
  let result = await fetchMyMemoryTranslation(trimmed, from, to);
  // 2) Brief retry after rate limit
  if (result.rateLimited || !result.text) {
    if (result.rateLimited) {
      await new Promise((resolve) => window.setTimeout(resolve, 450));
      result = await fetchMyMemoryTranslation(trimmed, from, to);
    }
  }
  // 3) Google fallback so Check card can still offer epler/jenter etc.
  let picked = result.text;
  if (!picked) {
    picked = await fetchGoogleTranslateFallback(trimmed, from, to);
  }

  if (picked) translationSuggestionCache.set(cacheKey, picked);
  return picked;
}

/** Small Levenshtein for spelling picks (short tokens only). */
function editDistance(a, b) {
  const s = normalizeAnswer(a);
  const t = normalizeAnswer(b);
  if (s === t) return 0;
  if (!s) return t.length;
  if (!t) return s.length;
  if (Math.abs(s.length - t.length) > 3) return 99;
  const rows = s.length + 1;
  const cols = t.length + 1;
  const prev = new Array(cols);
  const cur = new Array(cols);
  for (let j = 0; j < cols; j += 1) prev[j] = j;
  for (let i = 1; i < rows; i += 1) {
    cur[0] = i;
    for (let j = 1; j < cols; j += 1) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j < cols; j += 1) prev[j] = cur[j];
  }
  return prev[t.length];
}

/** Map app language codes → LanguageTool language ids. */
function toLanguageToolCode(langCode) {
  const raw = String(langCode || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-");
  if (!raw) return null;
  const base = raw.split("-")[0];
  const map = {
    en: "en-US",
    "en-us": "en-US",
    "en-gb": "en-GB",
    nb: "nb",
    no: "nb",
    nn: "nb",
    sv: "sv",
    "sv-se": "sv",
    da: "da-DK",
    "da-dk": "da-DK",
    de: "de-DE",
    "de-de": "de-DE",
    "de-at": "de-AT",
    "de-ch": "de-CH",
    fr: "fr",
    "fr-fr": "fr",
    es: "es",
    "es-es": "es",
    it: "it",
    "it-it": "it",
    // Tier A LanguageTool languages (next expansion)
    nl: "nl",
    "nl-nl": "nl",
    "nl-be": "nl-BE",
    // Brazilian Portuguese is our teaching standard (flag 🇧🇷 / speech pt-BR)
    pt: "pt-BR",
    "pt-pt": "pt-PT",
    "pt-br": "pt-BR",
    pl: "pl",
    "pl-pl": "pl",
    ro: "ro",
    "ro-ro": "ro",
    ca: "ca",
  };
  return map[raw] || map[base] || null;
}

/**
 * How reliable Library Check is for a track (LanguageTool depth).
 * full - strong spell + grammar (DE/FR/ES/NL/PT/PL…)
 * spell - spell/dictionary ok; grammar thin (Nordic, Italian…)
 * mt - mostly translation double-check; avoid false LOOKS GOOD
 */
function getCheckStrength(category = getActiveCategory()) {
  const raw = String(category?.checkStrength || "").toLowerCase();
  if (raw === "full" || raw === "spell" || raw === "mt") return raw;
  // Infer from known LanguageTool depth when field omitted
  const code = String(category?.foreignLang || "").split("-")[0].toLowerCase();
  if (["de", "fr", "es", "nl", "pt", "pl", "en", "ca"].includes(code)) return "full";
  if (["nb", "no", "nn", "sv", "da", "it", "ro"].includes(code)) return "spell";
  return "mt";
}

/** Cached normalized → display forms for the active learning language (starter + library). */
let knownForeignFormCache = { categoryId: null, forms: null };

function invalidateKnownForeignFormCache() {
  knownForeignFormCache = { categoryId: null, forms: null };
}

function getKnownForeignForms() {
  if (knownForeignFormCache.categoryId === activeCategoryId && knownForeignFormCache.forms) {
    return knownForeignFormCache.forms;
  }
  const forms = new Map();
  const addForm = (text) => {
    const cleaned = stripFlashcardPunctuation(text);
    if (!cleaned) return;
    const fullKey = normalizeAnswer(cleaned);
    if (fullKey && !forms.has(fullKey)) forms.set(fullKey, cleaned);
    for (const tok of reviewTokens(cleaned)) {
      if (tok.length < 3) continue;
      if (!forms.has(tok)) forms.set(tok, tok);
    }
  };
  getStarterDeckEntries().forEach((entry) => {
    String(entry.foreign || "")
      .split("/")
      .forEach((part) => addForm(part));
  });
  deck.forEach((card) => {
    if (card.id === editingCardId) return;
    String(card.foreign || "")
      .split("/")
      .forEach((part) => addForm(part));
  });
  knownForeignFormCache = { categoryId: activeCategoryId, forms };
  return forms;
}

/**
 * High-frequency English typos LanguageTool ranks poorly
 * (e.g. aet → AET acronym instead of eat).
 */
const COMMON_ENGLISH_TYPOS = {
  aet: "eat",
  teh: "the",
  adn: "and",
  taht: "that",
  waht: "what",
  whta: "what",
  wiht: "with",
  whith: "with",
  fro: "for",
  formr: "from",
  fomr: "form",
  // kiss / common short verbs LT ranks poorly for jumbled letters
  ksi: "kiss",
  kis: "kiss",
  ksis: "kiss",
  kss: "kiss",
  recieve: "receive",
  beleive: "believe",
  seperate: "separate",
  definately: "definitely",
  occured: "occurred",
  untill: "until",
  tommorrow: "tomorrow",
  begining: "beginning",
  enviroment: "environment",
  goverment: "government",
  langauge: "language",
  lanugage: "language",
  becuase: "because",
  beacuse: "because",
  freind: "friend",
  peice: "piece",
  thier: "their",
  wierd: "weird",
  acheive: "achieve",
  truely: "truly",
  realy: "really",
  realyl: "really",
  botom: "bottom",
  resturant: "restaurant",
  tommorow: "tomorrow",
  hte: "the",
  fo: "of",
  ot: "to",
  nad: "and",
  yuo: "you",
  yuor: "your",
  jsut: "just",
  dont: "don't",
  wont: "won't",
  cant: "can't",
  didnt: "didn't",
  isnt: "isn't",
  wasnt: "wasn't",
  hasnt: "hasn't",
  havent: "haven't",
  wouldnt: "wouldn't",
  shouldnt: "shouldn't",
  couldnt: "couldn't",
};

/** Frequent short English words we may recover via 1–2 edits when LT misses them. */
const COMMON_ENGLISH_RECOVER_WORDS = [
  "kiss",
  "eat",
  "like",
  "love",
  "want",
  "need",
  "have",
  "make",
  "take",
  "give",
  "go",
  "get",
  "see",
  "know",
  "think",
  "say",
  "tell",
  "use",
  "find",
  "help",
  "come",
  "look",
  "feel",
  "try",
  "leave",
  "call",
  "keep",
  "let",
  "begin",
  "seem",
  "help",
  "show",
  "hear",
  "play",
  "run",
  "move",
  "live",
  "believe",
  "hold",
  "bring",
  "happen",
  "write",
  "sit",
  "stand",
  "lose",
  "pay",
  "meet",
  "include",
  "continue",
  "set",
  "learn",
  "change",
  "lead",
  "understand",
  "watch",
  "follow",
  "stop",
  "create",
  "speak",
  "read",
  "allow",
  "add",
  "spend",
  "grow",
  "open",
  "walk",
  "win",
  "offer",
  "remember",
  "love",
  "consider",
  "appear",
  "buy",
  "wait",
  "serve",
  "die",
  "send",
  "expect",
  "build",
  "stay",
  "fall",
  "cut",
  "reach",
  "kill",
  "remain",
];

function commonEnglishTypoFix(word) {
  const raw = String(word || "");
  const key = normalizeAnswer(raw).replace(/'/g, "");
  const fix = COMMON_ENGLISH_TYPOS[key];
  if (!fix) return null;
  // Keep natural casing: mid-sentence typos stay lowercase
  if (raw === raw.toUpperCase() && raw.length <= 3 && FLASHCARD_ACRONYMS.has(key)) {
    return fix.toUpperCase();
  }
  if (/^[A-Z][a-z]+$/.test(raw)) return titleCaseWord(fix);
  return fix;
}

/** Adjacent letter swap (aet ↔ eat). */
function isAdjacentTransposition(a, b) {
  const s = normalizeAnswer(a);
  const t = normalizeAnswer(b);
  if (!s || !t || s.length !== t.length || s.length < 2) return false;
  let i = -1;
  for (let k = 0; k < s.length; k += 1) {
    if (s[k] !== t[k]) {
      if (i >= 0) return false;
      i = k;
    }
  }
  if (i < 0 || i >= s.length - 1) return false;
  return s[i] === t[i + 1] && s[i + 1] === t[i] && s.slice(i + 2) === t.slice(i + 2);
}

/** longer is shorter with exactly one inserted letter (ksi → kiss). */
function isOneLetterInsert(shorter, longer) {
  const s = normalizeAnswer(shorter);
  const t = normalizeAnswer(longer);
  if (!s || !t || t.length !== s.length + 1) return false;
  let i = 0;
  let j = 0;
  let skipped = 0;
  while (i < s.length && j < t.length) {
    if (s[i] === t[j]) {
      i += 1;
      j += 1;
    } else {
      skipped += 1;
      j += 1;
      if (skipped > 1) return false;
    }
  }
  return true;
}

/**
 * Recover real English words near a misspelling when LT misses them
 * (ksi → kiss is not in LT's list; ski/kis are wrong neighbors).
 */
function englishRecoveryCandidates(misspelled) {
  const o = normalizeAnswer(misspelled);
  if (!o || o.length < 2) return [];
  const out = [];
  const seen = new Set();
  const add = (word) => {
    const w = normalizeAnswer(word);
    if (!w || w === o || seen.has(w)) return;
    seen.add(w);
    out.push(w);
  };

  const mapped = commonEnglishTypoFix(misspelled);
  if (mapped) add(mapped);

  // Known typo keys that are close to what the user typed
  Object.keys(COMMON_ENGLISH_TYPOS).forEach((key) => {
    if (key === o || editDistance(o, key) <= 1 || isAdjacentTransposition(o, key)) {
      add(COMMON_ENGLISH_TYPOS[key]);
    }
  });

  // High-frequency words within 1–2 edits / one insert (ksi→kiss)
  COMMON_ENGLISH_RECOVER_WORDS.forEach((word) => {
    if (isOneLetterInsert(o, word) || isAdjacentTransposition(o, word)) {
      add(word);
      return;
    }
    const dist = editDistance(o, word);
    if (dist > 0 && dist <= 2 && Math.abs(o.length - word.length) <= 2) add(word);
  });

  return out;
}

/**
 * Pick the best spelling replacement from LanguageTool + recovery candidates.
 * Never invent garbage neighbors (ksi → kis) via blind letter swaps.
 */
function pickSpellingReplacement(original, replacements, fullText, knownForms = null) {
  const o = normalizeAnswer(original);
  if (!o) return null;

  // Recovery first (kiss), then LT - never blind adjacent swaps (those produced "kis")
  const pool = [...englishRecoveryCandidates(original), ...(replacements || [])];
  if (!pool.length) return null;

  const phraseTokens = reviewTokens(fullText);
  const contextTokens = new Set(phraseTokens);
  const inPhrase = phraseTokens.length >= 2;
  const userLower = String(original || "") === String(original || "").toLowerCase();
  const missIdx = phraseTokens.indexOf(o);
  const prevTok = missIdx > 0 ? phraseTokens[missIdx - 1] : "";
  const nextTok = missIdx >= 0 && missIdx < phraseTokens.length - 1 ? phraseTokens[missIdx + 1] : "";

  let best = null;
  let bestScore = -Infinity;

  pool.forEach((raw, index) => {
    const candidate = String(raw || "").trim();
    // Allow accented single tokens; reject multi-word rewrites
    if (!candidate || /\s/.test(candidate)) return;
    const n = normalizeAnswer(candidate);
    if (!n) return;
    // Never accept symbol junk as a "spelling" fix
    if (!/[a-zæøåäöü]/i.test(candidate)) return;
    if (/[#@$%{}[\]\\|<>]/.test(candidate)) return;

    const caseOnly = n === o && candidate !== original;
    if (n === o && !caseOnly) return;

    // aet → AET is almost never right mid-phrase (LT ranks org acronyms first)
    const acronymCaseOnly =
      caseOnly &&
      userLower &&
      /^[A-Z]{2,6}$/.test(candidate) &&
      !FLASHCARD_ACRONYMS.has(n);
    if (acronymCaseOnly && inPhrase) return;

    const dist = caseOnly
      ? 0
      : isOneLetterInsert(o, n)
        ? 1
        : isAdjacentTransposition(o, n)
          ? 1
          : editDistance(o, n);
    if (!caseOnly && dist > 3) return;

    let score = 0;
    if (COMMON_ENGLISH_TYPOS[o] === n) score += 130;
    if (isOneLetterInsert(o, n) && COMMON_ENGLISH_RECOVER_WORDS.includes(n)) score += 95;
    if (isAdjacentTransposition(o, n) && COMMON_ENGLISH_RECOVER_WORDS.includes(n)) score += 55;
    // Blind scramble neighbors that aren't real recover words (ksi→kis)
    if (
      isAdjacentTransposition(o, n) &&
      !COMMON_ENGLISH_RECOVER_WORDS.includes(n) &&
      !COMMON_ENGLISH_TYPOS[o]
    ) {
      score -= 60;
    }
    if (caseOnly) score += 20;
    // Prefer real lowercase word over shouting acronym when user typed lower
    if (userLower && /^[a-z]/.test(candidate)) score += 18;
    if (userLower && /^[A-Z]{2,}$/.test(candidate)) score -= 90;
    if (contextTokens.has(n)) score += 40;
    if (knownForms && knownForms.has(n)) score += 35;
    // Phrase context: "and X girls" strongly prefers verbs like kiss, not ski
    if (nextTok === "girls" || nextTok === "boys" || nextTok === "someone") {
      if (n === "kiss" || n === "hug" || n === "love") score += 70;
      if (n === "ski" || n === "kai" || n === "psi") score -= 50;
    }
    if (prevTok === "to" || prevTok === "and" || prevTok === "or") {
      if (COMMON_ENGLISH_RECOVER_WORDS.includes(n)) score += 25;
    }
    // LanguageTool order - weaker so acronyms / ski don't dominate
    score += Math.max(0, 12 - index * 1.5);
    score += Math.max(0, 12 - dist * 3);
    if (n[0] === o[0]) score += 4;
    if (Math.abs(n.length - o.length) <= 1) score += 2;
    // Proper noun Title Case only when user already used a capital
    if (caseOnly && /^[A-Z][a-z]/.test(candidate) && /^[A-Z]/.test(String(original || ""))) {
      score += 12;
    }
    // Penalize "delete first letter only" (yamo→amo) - usually wrong
    if (dist === 1 && o.length === n.length + 1 && o.endsWith(n)) score -= 10;
    if (dist === 1 && n.length === o.length + 1 && n.endsWith(o) && !isOneLetterInsert(o, n)) {
      score -= 4;
    }

    if (score > bestScore) {
      bestScore = score;
      // Prefer deck display form; force lowercase for mid-phrase ordinary fixes
      if (knownForms && knownForms.has(n)) {
        best = knownForms.get(n);
      } else if (userLower && inPhrase && !FLASHCARD_ACRONYMS.has(n)) {
        best = n; // lowercase ordinary English in a phrase
      } else {
        best = candidate;
      }
    }
  });

  return best;
}

/**
 * Known acronyms that must stay UPPER on flashcards (ATM, not atm / Atm).
 * Keep short and high-confidence - better miss than invent.
 */
const FLASHCARD_ACRONYMS = new Set(
  [
    "atm",
    "ai",
    "cv",
    "id",
    "pc",
    "pdf",
    "usb",
    "tv",
    "ok",
    "gps",
    "wifi",
    "pin",
    "sim",
    "eu",
    "un",
    "uk",
    "usa",
    "us",
    "dna",
    "rna",
    "phd",
    "doi",
    "http",
    "https",
    "url",
    "app",
    "api",
    "faq",
    "diy",
    "asap",
    "vip",
    "am",
    "pm",
    "bc",
    "ad",
    "nrk",
  ].map((w) => w.toLowerCase())
);

/** English days / months / common proper nouns that must be capitalized mid-card. */
const ENGLISH_PROPER_LOWER = new Set(
  [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
    "christmas",
    "easter",
    "europe",
    "asia",
    "africa",
    "america",
    "australia",
    "antarctica",
    "norway",
    "sweden",
    "denmark",
    "finland",
    "iceland",
    "germany",
    "france",
    "spain",
    "italy",
    "england",
    "scotland",
    "ireland",
    "britain",
    "london",
    "paris",
    "berlin",
    "madrid",
    "rome",
    "oslo",
    "bergen",
    "trondheim",
    "stockholm",
    "copenhagen",
    "english",
    "norwegian",
    "swedish",
    "danish",
    "german",
    "french",
    "spanish",
    "italian",
    "american",
    "british",
    "european",
  ].map((w) => w.toLowerCase())
);

/** LanguageTool rule ids that only force sentence-start caps - wrong for lemma flashcards. */
const LT_SENTENCE_START_RULES = new Set([
  "UPPERCASE_SENTENCE_START",
  "SENTENCE_FRAGMENT",
]);

function isFlashcardAcronymToken(token) {
  const t = String(token || "").trim();
  if (!t) return false;
  const bare = t.replace(/\./g, "");
  const key = normalizeAnswer(bare);
  if (FLASHCARD_ACRONYMS.has(key)) return true;
  // Consonant-only 2–4 letter tokens (cv, pdf) - same idea as preferDisplayForm
  if (/^[a-z]{2,4}$/i.test(bare) && !/[aeiouyæøåäöü]/i.test(bare)) return true;
  // Short ALLCAPS only if consonant-heavy (ATM, not HUNGER / NORGE)
  if (/^[A-Z]{2,5}$/.test(bare) && !/[AEIOUYaeiouy]/.test(bare)) return true;
  return false;
}

function titleCaseWord(word) {
  const s = String(word || "");
  if (!s) return s;
  // Preserve internal caps for known patterns like PhD after lower base
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function acronymDisplayForm(token) {
  const bare = String(token || "").replace(/\./g, "");
  const key = normalizeAnswer(bare);
  if (key === "phd") return "PhD";
  if (key === "wifi") return "WiFi";
  return bare.toUpperCase();
}

/**
 * Should we apply this LanguageTool match for flashcard orthography?
 * - Misspellings, grammar, apostrophes, agreement: yes
 * - Casing that is language-correct (German nouns, Norway…): yes
 * - Sentence-start capitalization / pure style: no (fights lemma flashcards)
 */
function isFlashcardOrthographyMatch(match) {
  if (!match?.rule) return false;
  const issue = match.rule.issueType || "";
  const cat = match.rule.category?.id || "";
  const id = match.rule.id || "";
  const msg = `${id} ${match.message || ""} ${match.shortMessage || ""}`;

  if (LT_SENTENCE_START_RULES.has(id)) return false;
  // Pure style / punctuation cosmetics - not teaching accuracy
  if (
    /WHITESPACE|DASH_RULE|ELLIPSIS|OXFORD_COMMA|COMMA_PARENTHESIS|SENTENCE_WHITESPACE|EN_QUOTES|FR_SPACING|PUNCTUATION_PARAGRAPH_END/i.test(
      id
    )
  ) {
    return false;
  }

  if (issue === "misspelling" || issue === "grammar") return true;
  if (cat === "TYPOS" || cat === "GRAMMAR" || cat === "CASING") return true;
  // Apostrophe / possessive / contraction rules often land as typographical or uncategorized
  if (/APOS|POSSESS|CONTRACTION|AGREEMENT|PLURAL|SPURIOUS_APOSTROPHE|IT_IS|WONT_|CANT|DONT|EN_CONTRACTION/i.test(msg)) {
    return true;
  }
  if (issue === "typographical" || issue === "uncategorized") {
    if (/CASE|CAPITAL|GROSS|MAJUSCUL|MAYÚSCUL|STOR|APOS|POSSESS|CONTRACTION/i.test(msg)) {
      return true;
    }
  }
  return false;
}

/**
 * Local English grammar that free LanguageTool often misses in free-form phrases:
 * - banana's up / three banana's → bananas (false possessive / plural)
 * - girls asses → girls' asses (plural possessive)
 * Kept conservative so we never invent nonsense.
 */
function applyEnglishGrammarFixes(text) {
  let result = String(text || "");
  if (!result.trim()) return result;

  // Quantifier + noun's → plural (three banana's → three bananas)
  result = result.replace(
    /\b(a\s+few|a\s+lot\s+of|lots\s+of|many|several|few|some|these|those|all|both|two|three|four|five|six|seven|eight|nine|ten|\d+)\s+([A-Za-z]{2,})['’]s\b/gi,
    (_, quant, noun) => `${quant} ${noun}s`
  );

  // noun's + plural verb → plurals (banana's are → bananas are)
  result = result.replace(
    /\b([A-Za-z]{2,})['’]s\s+(are|were|aren't|weren't|have|haven't)\b/gi,
    (_, noun, verb) => `${noun}s ${verb}`
  );

  // noun's + preposition → usually intended plural object (banana's up → bananas up)
  // Possessives almost always take a following noun, not a bare preposition.
  result = result.replace(
    /\b([A-Za-z]{3,})['’]s\s+(up|on|in|into|onto|over|under|through|with|without|from|to|for|at|by|off|out|about|across|around|between|among|behind|beside|near)\b/gi,
    (_, noun, prep) => `${noun}s ${prep}`
  );

  // Missing plural possessive: people-plurals + common "owned" plurals
  // girls asses → girls' asses
  const owners =
    "girls|boys|kids|children|women|men|students|teachers|friends|parents|people|ladies|guys|players|workers|nurses|doctors|babies|cats|dogs";
  const owned =
    "asses|shoes|books|cars|hats|bags|rooms|houses|phones|names|lives|jobs|faces|hands|eyes|ears|legs|arms|heads|clothes|toys|wives|husbands|bodies|minds|hearts|voices|rights|problems|ideas|opinions|beds|desks|chairs|doors|windows|keys|wallets|purses";
  result = result.replace(
    new RegExp(`\\b(${owners})\\s+(${owned})\\b`, "gi"),
    (full, owner, thing) => {
      if (/['’]s?$/i.test(owner)) return full;
      return `${owner}' ${thing}`;
    }
  );

  // childrens / peoples → children's / people's (common miss)
  result = result.replace(/\bchildrens\b/gi, "children's");
  result = result.replace(/\bpeoples\b/gi, (m) =>
    m[0] === "P" ? "People's" : "people's"
  );

  return result;
}

/** German closed-class words - flashcard style keeps these lowercase. */
const GERMAN_FUNCTION_LOWER = new Set(
  [
    "ich",
    "du",
    "er",
    "sie",
    "es",
    "wir",
    "ihr",
    "mich",
    "mir",
    "dich",
    "dir",
    "ihm",
    "ihn",
    "uns",
    "euch",
    "ein",
    "eine",
    "einer",
    "einem",
    "einen",
    "der",
    "die",
    "das",
    "den",
    "dem",
    "des",
    "und",
    "oder",
    "aber",
    "nicht",
    "auch",
    "noch",
    "nur",
    "mit",
    "von",
    "zu",
    "zum",
    "zur",
    "in",
    "im",
    "an",
    "am",
    "auf",
    "für",
    "ist",
    "sind",
    "war",
    "hat",
    "habe",
    "haben",
    "bin",
    "bist",
    "sein",
  ].map((w) => w.toLowerCase())
);

/**
 * True when token casing is wrong for a flashcard (not when Title Case is
 * legitimate German noun / protected proper form).
 */
function flashcardTokenNeedsLower(core, langBase, key, protectedKeys) {
  if (!core || protectedKeys.has(key)) return false;
  // ALL CAPS long token that isn't an acronym → lower (or title in German below)
  if (/^[A-ZÆØÅÄÖÜ]{5,}$/.test(core) && !isFlashcardAcronymToken(core)) {
    // German: ALLCAPS noun-shaped → prefer Title (Hunger), not lower
    if (langBase === "de") return false;
    return true;
  }
  // Weird internal caps: hElLo
  if (
    /[a-zæøåäöü]/.test(core) &&
    /[A-ZÆØÅÄÖÜ]/.test(core) &&
    core !== titleCaseWord(core) &&
    !/^PhD$/i.test(core) &&
    !/^WiFi$/i.test(core)
  ) {
    return true;
  }
  // English: unnecessary Title Case on ordinary words (Hello → hello)
  if (
    langBase === "en" &&
    /^[A-Z][a-z'+-]+$/.test(core) &&
    !ENGLISH_PROPER_LOWER.has(key) &&
    key !== "i"
  ) {
    return true;
  }
  // German: only force-lower known function words (Ich→ich), never nouns
  if (langBase === "de") {
    return GERMAN_FUNCTION_LOWER.has(key) && core !== core.toLowerCase();
  }
  // Other languages: Title Case ordinary words → lowercase for deck aesthetics
  // (proper nouns should be protected via LT / deck forms / English list)
  if (/^[A-ZÆØÅÄÖÜ][a-zæøåäöü'+-]+$/.test(core) && !protectedKeys.has(key)) {
    return true;
  }
  return false;
}

/**
 * Flashcard casing convention after spelling/orthography fixes:
 * - acronyms → ATM / PhD
 * - English "I" → I
 * - English proper nouns (days, countries…) → Title
 * - German nouns (Title) kept; function words lower
 * - LanguageTool-protected tokens kept
 * - unnecessary Title/ALLCAPS on ordinary words → lowercase (deck aesthetics)
 * Never invent wrong language orthography.
 */
function applyFlashcardCasingConvention(text, langCode, protectedNormKeys = null) {
  const trimmed = stripFlashcardPunctuation(text);
  if (!trimmed) return trimmed;
  const base = String(langCode || "en")
    .toLowerCase()
    .split("-")[0];
  const isEnglish = base === "en";
  const protectedKeys = protectedNormKeys || new Set();

  const parts = trimmed.split(/(\s+|\/)/);
  const out = parts.map((part) => {
    if (!part || /^\s+$/.test(part) || part === "/") return part;
    const core = part.replace(
      /^[^A-Za-zÀ-ÖØ-öø-ÿÆØÅæøåÄÖäöÜü0-9]+|[^A-Za-zÀ-ÖØ-öø-ÿÆØÅæøåÄÖäöÜü0-9]+$/g,
      ""
    );
    if (!core) return part;
    const key = normalizeAnswer(core);

    let replacement = core;
    if (isFlashcardAcronymToken(core)) {
      replacement = acronymDisplayForm(core);
    } else if (isEnglish && key === "i") {
      replacement = "I";
    } else if (isEnglish && ENGLISH_PROPER_LOWER.has(key)) {
      replacement = titleCaseWord(core);
    } else if (protectedKeys.has(key)) {
      replacement = core;
    } else if (
      base === "de" &&
      /^[A-ZÄÖÜ]{2,}$/.test(core) &&
      !isFlashcardAcronymToken(core)
    ) {
      // HUNGER → Hunger (German noun orthography), not hunger
      replacement = titleCaseWord(core);
    } else if (flashcardTokenNeedsLower(core, base, key, protectedKeys)) {
      replacement = core.toLowerCase();
    }

    if (replacement === core) return part;
    return part.replace(core, replacement);
  });

  return stripFlashcardPunctuation(out.join(""));
}

/**
 * Full orthography pass via LanguageTool (CORS open):
 * spelling + language-correct capitalization (not sentence-start style).
 * Then flashcard casing convention (acronyms, proper nouns, lemma lowercase).
 * Returns corrected text, or null if unchanged / unavailable.
 */
async function fetchSpellingCorrection(text, langCode) {
  const trimmed = String(text || "").trim();
  if (!trimmed || trimmed.length < 2) return null;
  if (looksLikeGibberish(trimmed)) return null;
  const ltLang = toLanguageToolCode(langCode);
  const baseLang = String(langCode || "")
    .toLowerCase()
    .split("-")[0];
  const knownForms =
    baseLang === "en" ? null : getKnownForeignForms();
  const protectedKeys = new Set();

  if (!ltLang) {
    // Local grammar + casing when LT has no language pack
    return finalizeOrthographyCorrection(trimmed, langCode, knownForms, protectedKeys);
  }

  try {
    const body = new URLSearchParams({
      language: ltLang,
      text: trimmed,
      level: "picky",
    });
    const response = await fetch("https://api.languagetool.org/v2/check", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!response.ok) {
      return finalizeOrthographyCorrection(trimmed, langCode, knownForms, protectedKeys);
    }
    const data = await response.json();
    const matches = (data.matches || []).filter(
      (m) =>
        m &&
        isFlashcardOrthographyMatch(m) &&
        Array.isArray(m.replacements) &&
        m.replacements.length > 0 &&
        Number.isFinite(m.offset) &&
        Number.isFinite(m.length) &&
        m.length > 0
    );

    let result = trimmed;

    if (matches.length) {
      const sorted = [...matches].sort((a, b) => b.offset - a.offset);
      for (const match of sorted) {
        if (match.offset < 0 || match.offset + match.length > result.length) continue;
        const original = result.slice(match.offset, match.offset + match.length);
        const reps = match.replacements
          .map((r) => r.value)
          .filter((v) => v != null && String(v).length > 0);
        const issue = match.rule?.issueType || "";
        const id = match.rule?.id || "";
        let pick = null;

        if (issue === "misspelling") {
          // Single-token typos: ranked pick (blocks aet→AET acronym noise)
          if (!/\s/.test(original)) {
            pick = pickSpellingReplacement(original, reps, trimmed, knownForms);
            if (
              pick &&
              editDistance(original, pick) > 3 &&
              !isAdjacentTransposition(original, pick) &&
              !isOneLetterInsert(original, pick) &&
              COMMON_ENGLISH_TYPOS[normalizeAnswer(original)] !== normalizeAnswer(pick)
            ) {
              pick = null;
            }
          } else {
            pick = reps.find((r) => isPlausibleCardText(r) && !/[#@$%{}[\]\\|<>]/.test(r)) || null;
          }
        } else {
          // Grammar / apostrophe / casing: first plausible replacement
          for (const rep of reps) {
            if (!isPlausibleCardText(rep) && !/['’]/.test(rep)) continue;
            if (/[#@$%{}[\]\\|<>]/.test(rep)) continue;
            // Never “fix” lowercase aet → AET mid-phrase via casing rules
            if (
              String(original) === String(original).toLowerCase() &&
              /^[A-Z]{2,6}$/.test(rep) &&
              normalizeAnswer(rep) === normalizeAnswer(original) &&
              !FLASHCARD_ACRONYMS.has(normalizeAnswer(rep))
            ) {
              continue;
            }
            // Skip wild expansions
            if (rep.length > original.length + 12) continue;
            if (rep === original) continue;
            pick = rep;
            break;
          }
        }

        if (!pick || pick === original) continue;
        result =
          result.slice(0, match.offset) + pick + result.slice(match.offset + match.length);
        // Protect real orthography (I, Norway, girls') - not ALLCAPS noise for lower typos
        for (const tok of reviewTokens(pick)) {
          if (
            /^[A-Z]{2,}$/.test(tok) &&
            String(original) === String(original).toLowerCase() &&
            !FLASHCARD_ACRONYMS.has(normalizeAnswer(tok))
          ) {
            continue;
          }
          if (tok !== tok.toLowerCase() || /['’]/.test(tok)) {
            protectedKeys.add(normalizeAnswer(tok));
          }
        }
      }
    }

    return finalizeOrthographyCorrection(result, langCode, knownForms, protectedKeys, trimmed);
  } catch {
    return finalizeOrthographyCorrection(trimmed, langCode, knownForms, protectedKeys);
  }
}

/** Apply COMMON_ENGLISH_TYPOS across a phrase (aet → eat). */
function applyCommonEnglishTypoPass(text) {
  return String(text || "").replace(/[A-Za-z']+/g, (word) => {
    const fixed = commonEnglishTypoFix(word);
    return fixed || word;
  });
}

/**
 * Local grammar + casing + deck forms after LanguageTool (or when LT fails).
 * Returns corrected text or null if nothing meaningful changed.
 */
function finalizeOrthographyCorrection(
  text,
  langCode,
  knownForms = null,
  protectedKeys = null,
  originalText = null
) {
  const source = originalText != null ? originalText : text;
  let result = String(text || "");
  const base = String(langCode || "")
    .toLowerCase()
    .split("-")[0];
  const protected = protectedKeys || new Set();

  // English: common typos first (aet→eat), then apostrophe / possessive heuristics
  if (base === "en") {
    const typoFixed = applyCommonEnglishTypoPass(result);
    if (typoFixed !== result) result = typoFixed;

    const grammarFixed = applyEnglishGrammarFixes(result);
    if (grammarFixed !== result) {
      result = grammarFixed;
      for (const tok of reviewTokens(result)) {
        if (/['’]/.test(tok) || tok !== tok.toLowerCase()) {
          protected.add(normalizeAnswer(tok));
        }
      }
    }
  }

  // Deck-known display forms (Bodø, etc.)
  if (knownForms && knownForms.size) {
    result = result
      .split(/(\s+|\/)/)
      .map((part) => {
        if (!part || /^\s+$/.test(part) || part === "/") return part;
        const key = normalizeAnswer(part);
        if (knownForms.has(key)) {
          const display = knownForms.get(key);
          if (display && display !== part) {
            if (display !== display.toLowerCase()) protected.add(key);
            return display;
          }
        }
        return part;
      })
      .join("");
  }

  const cased = applyFlashcardCasingConvention(result, langCode, protected);
  if (cased) result = cased;

  const cleaned = stripFlashcardPunctuation(result);
  if (!cleaned || !isPlausibleCardText(cleaned)) return null;
  if (cleaned === stripFlashcardPunctuation(source)) return null;
  return cleaned;
}

/** English convenience wrapper (answer side). */
async function fetchEnglishSpellingCorrection(text) {
  return fetchSpellingCorrection(text, "en-US");
}

/**
 * When LanguageTool misses a learning-language typo, try a near match against
 * the starter deck + library (e.g. snaker → snakker if snakker is in the deck).
 * Only rewrites tokens that already look like a known form within 1–2 edits.
 */
function correctForeignViaDeckNearMatch(text) {
  const trimmed = stripFlashcardPunctuation(text);
  if (!trimmed || looksLikeGibberish(trimmed)) return null;

  const forms = getKnownForeignForms();
  if (!forms.size) return null;

  // Prefer full-phrase deck match first
  const fullKey = normalizeAnswer(trimmed);
  if (forms.has(fullKey)) {
    const exact = forms.get(fullKey);
    return exact !== trimmed ? exact : null;
  }

  // Single-token or multi-token: fix only clearly near tokens
  const rawTokens = trimmed.split(/(\s+)/);
  let changed = false;
  const out = rawTokens.map((piece) => {
    if (/^\s+$/.test(piece) || !piece) return piece;
    const core = stripFlashcardPunctuation(piece);
    if (!core || core.length < 4) return piece;
    const key = normalizeAnswer(core);
    if (forms.has(key)) {
      const known = forms.get(key);
      // Keep user casing if already the known word
      return piece;
    }

    let bestDisplay = null;
    let bestDist = 99;
    for (const [formKey, display] of forms) {
      if (formKey.includes(" ")) continue;
      if (formKey.length < 4) continue;
      if (formKey[0] !== key[0]) continue;
      if (Math.abs(formKey.length - key.length) > 2) continue;
      const dist = editDistance(key, formKey);
      if (dist > 0 && dist <= 2 && dist < bestDist) {
        bestDist = dist;
        bestDisplay = display;
      }
    }
    if (!bestDisplay) return piece;
    // Require same first letter already enforced; soft token match for safety
    if (!softTokenMatch(core, bestDisplay, 4) && bestDist > 1) return piece;
    changed = true;
    // Preserve surrounding punctuation on the piece if any
    if (piece === core) return bestDisplay;
    return piece.replace(core, bestDisplay);
  });

  if (!changed) return null;
  const cleaned = stripFlashcardPunctuation(out.join(""));
  if (!cleaned || normalizeAnswer(cleaned) === normalizeAnswer(trimmed)) return null;
  return preferDisplayForm(cleaned);
}

/**
 * Best-effort learning-language orthography:
 * LanguageTool (spelling + correct casing) first, then deck near-match,
 * then local flashcard casing convention.
 */
async function fetchLearningSpellingCorrection(text, foreignCode) {
  const fromTool = await fetchSpellingCorrection(text, foreignCode);
  if (fromTool) return fromTool;
  const fromDeck = correctForeignViaDeckNearMatch(text);
  if (fromDeck) {
    const cased = applyFlashcardCasingConvention(fromDeck, foreignCode);
    if (cased && orthographyFixIsPlausible(text, cased)) return cased;
    if (orthographyFixIsPlausible(text, fromDeck)) return fromDeck;
  }
  const localOnly = applyFlashcardCasingConvention(text, foreignCode);
  if (localOnly && orthographyFixIsPlausible(text, localOnly)) return localOnly;
  return null;
}

function syncAddCardSuggestingState() {
  const form = document.getElementById("add-card-form");
  if (!form) return;
  const open = Boolean(
    document.getElementById("foreign-suggestions")?.classList.contains("hidden") === false ||
      document.getElementById("native-suggestions")?.classList.contains("hidden") === false
  );
  form.classList.toggle("is-suggesting", open);
}

function hideLibrarySuggestions() {
  activeSuggestField = null;
  document.getElementById("foreign-suggestions")?.classList.add("hidden");
  document.getElementById("native-suggestions")?.classList.add("hidden");
  syncAddCardSuggestingState();
}

function markSuggestionPicked() {
  // Keep suggestions available while editing / refining a card.
  // Only hide the open list so the pick doesn't leave a stale menu open.
  hideLibrarySuggestions();
}

function shouldShowAddCardSuggestions() {
  return !suppressAddCardSuggestions;
}

/**
 * One-pass spelling + capitalization polish for both sides.
 * Used after picks/applies so Check card is not a multi-step casing treadmill.
 */
async function polishCardPair(foreign, native) {
  const f0 = stripFlashcardPunctuation(foreign);
  const n0 = stripFlashcardPunctuation(native);
  if (!f0 && !n0) return { foreign: f0, native: n0 };

  const { foreignCode } = getCategoryLanguageCodes();
  const [nFix, fFix] = await Promise.all([
    n0 ? fetchEnglishSpellingCorrection(n0) : Promise.resolve(null),
    f0 ? fetchLearningSpellingCorrection(f0, foreignCode) : Promise.resolve(null),
  ]);

  let nextNative = n0;
  let nextForeign = f0;
  if (nFix && orthographyFixIsPlausible(n0, nFix)) {
    nextNative = stripFlashcardPunctuation(nFix);
  }
  if (fFix && orthographyFixIsPlausible(f0, fFix)) {
    nextForeign = stripFlashcardPunctuation(fFix);
  } else if (fFix && isCasingOnlyDiff(f0, fFix)) {
    nextForeign = stripFlashcardPunctuation(fFix);
  }
  if (nFix && isCasingOnlyDiff(n0, nFix)) {
    nextNative = stripFlashcardPunctuation(nFix);
  }

  // Prefer display form for learning side (cv → CV) without re-uppercasing normal words
  nextForeign = preferDisplayForm(nextForeign);
  return {
    foreign: nextForeign,
    native: stripFlashcardPunctuation(nextNative),
  };
}

/** Queue suggestions for the active field after edit load / focus settle. */
function refreshAddCardSuggestions(preferField = "native") {
  suppressAddCardSuggestions = false;
  activeSuggestField = preferField === "foreign" ? "foreign" : "native";
  if (preferField === "foreign") queueForeignSuggestions();
  else queueNativeSuggestions();
}

function renderSuggestionOption(item, index) {
  const meta = item.meta ? `<span class="library-suggest-option-meta">${escapeHtml(item.meta)}</span>` : "";
  // English then Norwegian - same order as the form and review
  const native = `<span class="library-suggest-option-native">${escapeHtml(item.native)}</span>`;
  const sep = `<span class="library-suggest-option-sep" aria-hidden="true">·</span>`;
  const foreign = `<span class="library-suggest-option-foreign" lang="${getActiveCategory().foreignLang || "nb"}">${escapeHtml(item.foreign)}</span>`;

  if (item.selectable) {
    return `
      <button
        type="button"
        class="library-suggest-option is-selectable"
        data-suggest-index="${index}"
        role="option"
      >
        ${meta}${native}${sep}${foreign}
      </button>`;
  }

  return `
    <div class="library-suggest-option is-info" role="listitem" aria-disabled="true">
      ${meta}${native}${sep}${foreign}
    </div>`;
}

function renderSuggestionList(container, suggestions, onPick) {
  if (!container) return;
  if (!suggestions.length) {
    container.classList.add("hidden");
    container.innerHTML = "";
    syncAddCardSuggestingState();
    return;
  }

  container.classList.remove("hidden");
  syncAddCardSuggestingState();
  container.innerHTML = suggestions.map((item, index) => renderSuggestionOption(item, index)).join("");

  container.querySelectorAll(".library-suggest-option.is-selectable").forEach((btn) => {
    btn.addEventListener("mousedown", (e) => e.preventDefault());
    btn.addEventListener("click", () => {
      const item = suggestions[Number(btn.dataset.suggestIndex)];
      if (!item?.selectable) return;
      onPick(item);
      markSuggestionPicked();
    });
  });
}

async function updateForeignSuggestions() {
  const input = document.getElementById("new-foreign");
  const container = document.getElementById("foreign-suggestions");
  if (!input || !container || activeSuggestField !== "foreign" || !shouldShowAddCardSuggestions()) return;

  const query = input.value.trim();
  const token = ++foreignSuggestToken;
  if (!query) {
    container.classList.add("hidden");
    syncAddCardSuggestingState();
    return;
  }

  const seen = new Set();
  const suggestions = [];

  const addSuggestion = (item) => {
    const key = `${normalizeAnswer(item.foreign)}|${normalizeAnswer(item.native)}`;
    if (seen.has(key)) return;
    seen.add(key);
    suggestions.push(item);
  };

  const paint = () => {
    if (token !== foreignSuggestToken || activeSuggestField !== "foreign") return;
    if (input.value.trim() !== query) return;
    renderSuggestionList(container, suggestions.slice(0, 6), (item) => {
      void (async () => {
        const polished = await polishCardPair(item.foreign, item.native);
        if (token !== foreignSuggestToken) return;
        document.getElementById("new-foreign").value = polished.foreign;
        document.getElementById("new-native").value = polished.native;
        addCardLastEditedSide = "foreign";
        markSuggestionPicked();
        syncAddCardResetButton();
        document.getElementById("new-foreign")?.focus({ preventScroll: true });
      })();
    });
  };

  // Local deck first - do not wait on MyMemory or nothing shows while the network spins
  getStarterSuggestions(query, 6).forEach(addSuggestion);
  getLibrarySuggestions(query, 6).forEach(addSuggestion);
  getPackCatalogSuggestions(query, 4).forEach(addSuggestion);
  paint();

  // Don't advertise a "translation" of keyboard mash - it only creates false confidence later.
  if (shouldRequestTranslation(query)) {
    const { foreignCode, nativeCode } = getCategoryLanguageCodes();
    // Spell learning language first, then translate once from the corrected form
    const spellingFixedForeign = await fetchLearningSpellingCorrection(query, foreignCode);
    if (token !== foreignSuggestToken || input.value.trim() !== query) return;

    const spellingFixed = Boolean(
      spellingFixedForeign &&
        stripFlashcardPunctuation(spellingFixedForeign) !== stripFlashcardPunctuation(query)
    );
    const foreignForMt = spellingFixed
      ? preferDisplayForm(spellingFixedForeign)
      : query;
    let nativeSide = await fetchTranslationSuggestion(foreignForMt, foreignCode, nativeCode);
    if (token !== foreignSuggestToken || input.value.trim() !== query) return;

    let foreignSide = foreignForMt;

    if (!spellingFixed && nativeSide) {
      const correctedForeign = await correctSideViaRoundTrip(
        query,
        nativeSide,
        foreignCode,
        nativeCode,
        "foreign"
      );
      if (token !== foreignSuggestToken || input.value.trim() !== query) return;
      if (
        correctedForeign &&
        stripFlashcardPunctuation(correctedForeign) !== stripFlashcardPunctuation(query)
      ) {
        foreignSide = preferDisplayForm(correctedForeign);
        const retranslated = await fetchTranslationSuggestion(
          foreignSide,
          foreignCode,
          nativeCode
        );
        if (token !== foreignSuggestToken || input.value.trim() !== query) return;
        if (retranslated) nativeSide = retranslated;
      }
    }

    if (nativeSide) {
      addSuggestion({
        foreign: foreignSide,
        native: nativeSide,
        meta:
          spellingFixed ||
          normalizeAnswer(foreignSide) !== normalizeAnswer(query)
            ? "Suggested · spelling fixed"
            : "Suggested translation",
        selectable: true,
      });
      paint();
    }
  }
}

/**
 * True soft spelling fix only: same token count, at most one token is a 1-edit
 * typo, all others exact. Blocks meaning rewrites (sword → hard one).
 */
function isSafeSoftSpellingFix(userText, suggestedText) {
  if (!userText || !suggestedText) return false;
  if (!isPlausibleCardText(suggestedText)) return false;
  if (isCasingOnlyDiff(userText, suggestedText)) return true;
  if (isApostropheGrammarDiff(userText, suggestedText)) return true;
  const wu = reviewTokens(userText);
  const ws = reviewTokens(suggestedText);
  if (!wu.length || wu.length !== ws.length) return false;
  let diffs = 0;
  const foreignCode = getActiveCategory()?.foreignLang || "";
  for (let i = 0; i < wu.length; i += 1) {
    if (wu[i] === ws[i]) continue;
    // Major orthography variants (ß/ss, BE/AE, EP/BR) count as the same form
    if (
      foreignOrthographyMatches(wu[i], ws[i], foreignCode) ||
      foreignOrthographyMatches(wu[i], ws[i], "en") ||
      englishDialectSpellingMatches(wu[i], ws[i])
    ) {
      continue;
    }
    const common = COMMON_ENGLISH_TYPOS[wu[i]] === ws[i];
    const trans = isAdjacentTransposition(wu[i], ws[i]);
    const insert =
      isOneLetterInsert(wu[i], ws[i]) || isOneLetterInsert(ws[i], wu[i]);
    // Multi-word: never treat epler≈eller style soft edits as "safe spelling"
    // (that false-approved bad translations). Only map/transposition/insert.
    if (wu.length >= 2) {
      if (!common && !trans && !insert) return false;
    } else if (
      !common &&
      !trans &&
      !insert &&
      !softTokenMatch(wu[i], ws[i], 4)
    ) {
      return false;
    }
    diffs += 1;
    if (diffs > 1) return false;
  }
  return diffs === 1;
}

/**
 * Full alternative gloss for the non-anchor side (e.g. DA→EN when Danish was typed first).
 * Allows real translation alternatives, not only one-letter typos - but blocks junk / wild length.
 */
function isPlausibleTranslationAlternative(userText, suggestedText) {
  if (!userText || !suggestedText) return false;
  if (!isPlausibleCardText(suggestedText)) return false;
  if (stripFlashcardPunctuation(userText) === stripFlashcardPunctuation(suggestedText)) {
    return false;
  }
  if (isSafeSoftSpellingFix(userText, suggestedText)) return true;
  const wu = reviewTokens(userText);
  const ws = reviewTokens(suggestedText);
  if (!ws.length) return false;
  // Empty-ish user side: always allow a real gloss
  if (!wu.length) return true;
  // Wild length swings are usually wrong-sense TM
  if (wu.length >= 3 && (ws.length < 2 || ws.length > wu.length + 4 || ws.length < wu.length - 3)) {
    return false;
  }
  return true;
}

/**
 * Strong translation agreement for LOOKS GOOD / anchors.
 * Exact letters (ignoring case) or casing/apostrophe-only - NOT soft one-edit
 * neighbors (epler ≉ eller, jenter ≉ jente). Those used to false-approve bad cards.
 */
function isStrongTranslationMatch(userText, suggestedText, langCode = null) {
  if (!userText || !suggestedText) return false;
  if (!isPlausibleCardText(suggestedText)) return false;
  const u = stripFlashcardPunctuation(userText);
  const s = stripFlashcardPunctuation(suggestedText);
  if (!u || !s) return false;
  if (normalizeAnswer(u) === normalizeAnswer(s)) return true;
  if (isCasingOnlyDiff(u, s)) return true;
  if (isApostropheGrammarDiff(u, s)) return true;
  // Major dialect / orthography variants (BE/AE, ß/ss, EP/BR Portuguese…)
  const code =
    langCode ||
    getActiveCategory()?.foreignLang ||
    getCategoryLanguageCodes?.()?.foreignCode ||
    "";
  if (foreignOrthographyMatches(u, s, code)) return true;
  if (foreignOrthographyMatches(u, s, "en")) return true;
  return false;
}

/**
 * Round-trip a translation to catch typos on the source side.
 * EN "… i feal" → NO → EN "… I feel" → only if a safe one-token spelling fix.
 * Never rewrite meaning (sword ↛ hard one).
 */
async function correctSideViaRoundTrip(sourceText, translated, foreignCode, nativeCode, direction) {
  if (!sourceText || !translated) return null;
  const back =
    direction === "native"
      ? await fetchTranslationSuggestion(translated, foreignCode, nativeCode)
      : await fetchTranslationSuggestion(translated, nativeCode, foreignCode);
  if (!back) return null;
  if (!isSafeSoftSpellingFix(sourceText, back)) return null;
  return direction === "native"
    ? stripFlashcardPunctuation(back)
    : preferDisplayForm(back);
}

async function updateNativeSuggestions() {
  const input = document.getElementById("new-native");
  const container = document.getElementById("native-suggestions");
  if (!input || !container || activeSuggestField !== "native" || !shouldShowAddCardSuggestions()) return;

  const query = input.value.trim();
  const token = ++nativeSuggestToken;
  if (!query) {
    container.classList.add("hidden");
    syncAddCardSuggestingState();
    return;
  }

  const seen = new Set();
  const suggestions = [];

  const addSuggestion = (item) => {
    const key = `${normalizeAnswer(item.foreign)}|${normalizeAnswer(item.native)}`;
    if (seen.has(key)) return;
    seen.add(key);
    suggestions.push(item);
  };

  const paint = () => {
    if (token !== nativeSuggestToken || activeSuggestField !== "native") return;
    if (input.value.trim() !== query) return;
    renderSuggestionList(container, suggestions.slice(0, 6), (item) => {
      void (async () => {
        // Polish spelling + casing on pick so Check card isn't a multi-step treadmill
        const polished = await polishCardPair(item.foreign, item.native);
        if (token !== nativeSuggestToken) return;
        document.getElementById("new-foreign").value = polished.foreign;
        document.getElementById("new-native").value = polished.native;
        addCardLastEditedSide = "native";
        markSuggestionPicked();
        syncAddCardResetButton();
        document.getElementById("new-foreign")?.focus({ preventScroll: true });
      })();
    });
  };

  getStarterSuggestions(query, 6).forEach(addSuggestion);
  getLibrarySuggestions(query, 6).forEach(addSuggestion);
  getPackCatalogSuggestions(query, 4).forEach(addSuggestion);
  paint();

  if (shouldRequestTranslation(query)) {
    const { foreignCode, nativeCode } = getCategoryLanguageCodes();
    // Spell/grammar first, then translate the corrected English once.
    // Avoids "aet" → translate junk → AET capitalization treadmill on Check card.
    const spellingFixedNative = await fetchEnglishSpellingCorrection(query);
    if (token !== nativeSuggestToken || input.value.trim() !== query) return;

    const spellingFixed = Boolean(
      spellingFixedNative &&
        stripFlashcardPunctuation(spellingFixedNative) !== stripFlashcardPunctuation(query)
    );
    const englishForMt = spellingFixed ? spellingFixedNative : query;
    let foreignSide = await fetchTranslationSuggestion(englishForMt, nativeCode, foreignCode);
    if (token !== nativeSuggestToken || input.value.trim() !== query) return;

    let nativeSide = spellingFixed ? spellingFixedNative : query;

    if (!spellingFixed && foreignSide) {
      const correctedNative = await correctSideViaRoundTrip(
        query,
        foreignSide,
        foreignCode,
        nativeCode,
        "native"
      );
      if (token !== nativeSuggestToken || input.value.trim() !== query) return;
      if (
        correctedNative &&
        stripFlashcardPunctuation(correctedNative) !== stripFlashcardPunctuation(query)
      ) {
        nativeSide = correctedNative;
        const retranslated = await fetchTranslationSuggestion(
          correctedNative,
          nativeCode,
          foreignCode
        );
        if (token !== nativeSuggestToken || input.value.trim() !== query) return;
        if (retranslated) foreignSide = retranslated;
      }
    }

    if (foreignSide) {
      addSuggestion({
        foreign: foreignSide,
        native: nativeSide,
        meta:
          spellingFixed ||
          normalizeAnswer(nativeSide) !== normalizeAnswer(query)
            ? "Suggested · spelling fixed"
            : "Suggested translation",
        selectable: true,
      });
      paint();
    }
  }
}

function queueForeignSuggestions() {
  window.clearTimeout(foreignSuggestTimer);
  foreignSuggestTimer = window.setTimeout(updateForeignSuggestions, ADD_CARD_SUGGEST_DEBOUNCE_MS);
}

function queueNativeSuggestions() {
  window.clearTimeout(nativeSuggestTimer);
  nativeSuggestTimer = window.setTimeout(updateNativeSuggestions, ADD_CARD_SUGGEST_DEBOUNCE_MS);
}

function applyAddCardFormUI() {
  const category = getActiveCategory();
  const foreignLabel = document.getElementById("new-foreign-label");
  const nativeLabel = document.getElementById("new-native-label");
  const foreignInput = document.getElementById("new-foreign");
  const nativeInput = document.getElementById("new-native");
  const reviewForeignLabel = document.getElementById("add-card-review-foreign-label");
  const reviewNativeLabel = document.getElementById("add-card-review-native-label");
  const submitBtn = document.getElementById("add-card-submit");
  const modeLabel = document.getElementById("add-card-mode-label");
  const cancelEditBtn = document.getElementById("add-card-cancel-edit");
  const confirmBtn = document.getElementById("add-card-confirm");

  const learningName = category.learningLanguageName || category.label.split(" · ")[0] || "Norwegian";
  const answerName = category.answerLanguageName || "English";

  if (foreignLabel) foreignLabel.textContent = learningName;
  if (nativeLabel) nativeLabel.textContent = answerName;
  if (reviewForeignLabel) reviewForeignLabel.textContent = learningName;
  if (reviewNativeLabel) reviewNativeLabel.textContent = answerName;
  if (foreignInput) {
    foreignInput.placeholder = "";
    foreignInput.lang = category.foreignLang || "";
  }
  if (nativeInput) {
    nativeInput.placeholder = "";
    nativeInput.lang = (category.answerLang || "en-US").split("-")[0];
  }

  const editing = Boolean(editingCardId);
  if (submitBtn) submitBtn.textContent = editing ? "Save" : "Add";
  if (modeLabel) modeLabel.classList.toggle("hidden", !editing);
  if (cancelEditBtn) cancelEditBtn.classList.toggle("hidden", !editing);
  if (confirmBtn) confirmBtn.textContent = editing ? "Save" : "Add";
}

function getRelatedEntriesForReview(foreign, native, limit = 5) {
  const seen = new Set();
  const exactForeign = normalizeAnswer(foreign);
  const results = [];
  const terms = [foreign, native].map((term) => term.trim()).filter((term) => term.length >= 2);

  const consider = (item, term) => {
    const foreignKey = normalizeAnswer(item.foreign);
    if (seen.has(foreignKey)) return;
    if (foreignKey === exactForeign) return;
    // Skip weak mid-string hits (great → great-grandmother) - only clear relatives
    const score = suggestionMatchScore(term, item.foreign, item.native);
    if (score < 55) return;
    if (editingCardId) {
      const editingCard = deck.find((card) => card.id === editingCardId);
      if (editingCard && foreignKey === normalizeAnswer(editingCard.foreign)) return;
    }
    seen.add(foreignKey);
    results.push(item);
  };

  terms.forEach((term) => {
    getStarterSuggestions(term, 6).forEach((item) => consider(item, term));
    getLibrarySuggestions(term, 6).forEach((item) => consider(item, term));
    getPackCatalogSuggestions(term, 4).forEach((item) => consider(item, term));
  });

  return results.slice(0, limit);
}

/**
 * Keyboard mash / nonsense detector.
 * Also catches "real stem + babble" like resumekeieie (MT still invents CV-en from that).
 */
function wordLooksLikeGibberish(word) {
  if (!word || word.length < 5) return false;

  const vowels = (word.match(/[aeiouyæøåäöü]/gi) || []).length;
  const ratio = vowels / word.length;

  if (vowels === 0) return true;

  // Explicit smash fragments (not "any subset of a keyboard row")
  if (
    /asdf|sdfg|dfgh|fghj|ghjk|hjkl|qwer|werty|ertyu|rtyui|tyuio|yuiop|zxcv|xcvb|cvbn|vbnm/i.test(
      word
    )
  ) {
    return true;
  }

  // Long mash with too few vowels (length gate avoids "strengths")
  if (word.length >= 10 && ratio < 0.28) return true;
  if (word.length >= 14 && ratio < 0.34) return true;

  // Extremely rare in Norwegian/English lemmas
  if (/[bcdfghjklmnpqrstvwxz]{6,}/i.test(word)) return true;

  if (/(.)\1{3,}/i.test(word)) return true;

  // Babbling tails: eieie, lololo, kekeke (real words rarely end this way)
  if (word.length >= 8 && /([aeiouyæøåäöü]{2})\1{2,}/i.test(word)) return true;
  if (word.length >= 8 && /(..)\1{2,}/i.test(word)) return true;

  // Last 5 letters all vowels - "…keieie" (not "…poeia" in onomatopoeia)
  if (word.length >= 9) {
    const tip = word.slice(-5);
    const tipVowels = (tip.match(/[aeiouyæøåäöü]/gi) || []).length;
    if (tipVowels >= 5) return true;
  }

  return false;
}

function looksLikeGibberish(text) {
  const words = normalizeAnswer(String(text || ""))
    .split(" ")
    .map((word) => word.replace(/[^a-zæøåäöü]/gi, ""))
    .filter(Boolean);

  if (!words.length) return false;
  return words.some((word) => wordLooksLikeGibberish(word));
}

/** Never ask the translation API to "fix" keyboard mash into a real word. */
function shouldRequestTranslation(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed || trimmed.length < 2) return false;
  if (looksLikeGibberish(trimmed)) return false;
  return true;
}

function nonsenseReviewSummary(learningName, foreignGibberish, nativeGibberish, suggestedForeign, suggestedNative) {
  if (foreignGibberish && nativeGibberish) {
    return {
      matches: false,
      targetField: null,
      suggestedValue: null,
      title: "Looks unclear",
      copy: "Try rewriting both sides.",
    };
  }

  // Only ever suggest a fix FROM the side that looks real
  if (foreignGibberish) {
    if (
      suggestedForeign &&
      !looksLikeGibberish(suggestedForeign) &&
      isPlausibleCardText(suggestedForeign)
    ) {
      return {
        matches: false,
        targetField: "foreign",
        suggestedValue: suggestedForeign,
        title: `Suggested ${learningName}`,
        copy: `Use “${suggestedForeign}”?`,
      };
    }
    return {
      matches: false,
      targetField: null,
      suggestedValue: null,
      title: `${learningName} looks unclear`,
      copy: "Try rewriting that side.",
    };
  }

  if (nativeGibberish) {
    if (
      suggestedNative &&
      !looksLikeGibberish(suggestedNative) &&
      isPlausibleCardText(suggestedNative)
    ) {
      return {
        matches: false,
        targetField: "native",
        suggestedValue: suggestedNative,
        title: "Suggested English",
        copy: `Use “${suggestedNative}”?`,
      };
    }
    return {
      matches: false,
      targetField: null,
      suggestedValue: null,
      title: "English looks unclear",
      copy: "Try rewriting that side.",
    };
  }

  return null;
}

/** English then Norwegian - same order as the review panel. No trailing periods inside. */
function formatReviewPair(foreign, native) {
  const en = stripFlashcardPunctuation(native);
  const nb = preferDisplayForm(foreign);
  return `“${en}” / “${nb}”`;
}

/** Must look like real flashcard text (letters), not # / junk / empty symbols. */
function isPlausibleCardText(text) {
  const cleaned = stripFlashcardPunctuation(text);
  if (!cleaned || cleaned.length > 140) return false;
  // At least one letter in any script we care about
  if (!/[a-zA-ZæøåäöüÆØÅÄÖÜàâäéèêëïîôùûüçÀ-ÖØ-öø-ÿ]/.test(cleaned)) return false;
  // Reject pure/mostly symbol noise (incl. lone # from bad MT)
  const symbols = (cleaned.match(/[#@$%{}[\]\\|<>*_~`^+=]/g) || []).length;
  if (symbols > 0 && symbols >= cleaned.replace(/\s/g, "").length * 0.4) return false;
  if (/^[#@$%&*+=./\\|-]+$/.test(cleaned)) return false;
  return true;
}

/** Casing-only difference (Hello→hello, norway→Norway). Apostrophes count as different. */
function isCasingOnlyDiff(a, b) {
  const x = stripFlashcardPunctuation(a);
  const y = stripFlashcardPunctuation(b);
  if (!x || !y || x === y) return false;
  return x.toLocaleLowerCase() === y.toLocaleLowerCase();
}

/**
 * Same letters if we strip punctuation (banana's ≈ bananas in normalizeAnswer).
 * Those are NOT safe auto-fixes - possessives/plurals mean different things.
 */
function isNormalizeOnlyDiff(a, b) {
  const x = stripFlashcardPunctuation(a);
  const y = stripFlashcardPunctuation(b);
  if (!x || !y || x === y) return false;
  if (isCasingOnlyDiff(x, y)) return false;
  return normalizeAnswer(x) === normalizeAnswer(y);
}

function spellingFixIsPlausible(userText, correctedText) {
  if (!userText || !correctedText) return false;
  if (!isPlausibleCardText(correctedText)) return false;
  if (normalizeAnswer(userText) === normalizeAnswer(correctedText)) return false;
  const spellingCmp = reviewGlossCompare(userText, correctedText);
  if (spellingCmp.spellingOnly || spellingCmp.soft) return true;
  const tokenDist = editDistance(
    reviewTokens(userText).join(" "),
    reviewTokens(correctedText).join(" ")
  );
  return tokenDist <= Math.max(2, Math.floor(reviewTokens(userText).length / 2));
}

/** Apostrophe / possessive placement differs (banana's↔bananas, girls↔girls'). */
function isApostropheGrammarDiff(a, b) {
  const x = stripFlashcardPunctuation(a);
  const y = stripFlashcardPunctuation(b);
  if (!x || !y || x === y) return false;
  const stripApos = (s) => s.replace(/['’]/g, "");
  return stripApos(x).toLocaleLowerCase() === stripApos(y).toLocaleLowerCase();
}

/**
 * Plausible orthography fix from the spell/grammar pipeline:
 * letter typos, casing, OR apostrophe/possessive grammar (banana's → bananas).
 * Not: MT junk, symbols, empty, or aet→AET acronym shouting.
 */
function orthographyFixIsPlausible(userText, correctedText, langCode = null) {
  if (!userText || !correctedText) return false;
  if (!isPlausibleCardText(correctedText)) return false;
  const userClean = stripFlashcardPunctuation(userText);
  const fixClean = stripFlashcardPunctuation(correctedText);
  if (!userClean || !fixClean || userClean === fixClean) return false;

  // School-standard vs major regional variant (Straße/Strasse, color/colour…)
  // is not a "fix" - Check should soft-accept, not nag.
  const code =
    langCode ||
    getActiveCategory()?.foreignLang ||
    "";
  if (foreignOrthographyMatches(userClean, fixClean, code)) return false;
  if (foreignOrthographyMatches(userClean, fixClean, "en")) return false;

  // Reject pure acronym shouting of a lowercase typo (aet → AET)
  const uTokens = reviewTokens(userClean);
  const fTokens = reviewTokens(fixClean);
  if (uTokens.length === fTokens.length) {
    let onlyAcronymShout = true;
    let anyDiff = false;
    for (let i = 0; i < uTokens.length; i += 1) {
      if (uTokens[i] === fTokens[i]) continue;
      anyDiff = true;
      const u = uTokens[i];
      const f = fTokens[i];
      if (
        u === u.toLowerCase() &&
        /^[A-Z]{2,6}$/.test(f) &&
        normalizeAnswer(u) === normalizeAnswer(f) &&
        !FLASHCARD_ACRONYMS.has(normalizeAnswer(f))
      ) {
        continue;
      }
      onlyAcronymShout = false;
      break;
    }
    if (anyDiff && onlyAcronymShout) return false;
  }

  // Pure capitalization / acronym form (ATM, Norway) - not noise above
  if (isCasingOnlyDiff(userClean, fixClean)) return true;
  // Grammar: apostrophe placement
  if (isApostropheGrammarDiff(userClean, fixClean)) return true;
  // Other normalize-only noise still blocked
  if (isNormalizeOnlyDiff(userClean, fixClean)) return false;
  return spellingFixIsPlausible(userClean, fixClean);
}

/** Short, human recommendation copy. No em dashes, no lecture. */
function orthographyFixCopy(learningName, userNative, userForeign, fixNative, fixForeign) {
  const nativeChanged =
    fixNative && stripFlashcardPunctuation(userNative) !== stripFlashcardPunctuation(fixNative);
  const foreignChanged =
    fixForeign && stripFlashcardPunctuation(userForeign) !== stripFlashcardPunctuation(fixForeign);
  const nativeSpell =
    nativeChanged && !isCasingOnlyDiff(userNative, fixNative);
  const foreignSpell =
    foreignChanged && !isCasingOnlyDiff(userForeign, fixForeign);

  const pair = formatReviewPair(fixForeign || userForeign, fixNative || userNative);

  if (nativeChanged && foreignChanged) {
    if (nativeSpell || foreignSpell) {
      return { title: "Suggested fix", copy: `Use ${pair}?` };
    }
    return { title: "Suggested capitalization", copy: `Use ${pair}?` };
  }
  if (nativeChanged) {
    if (nativeSpell) {
      return { title: "Suggested English", copy: `Use ${pair}?` };
    }
    return { title: "Suggested capitalization", copy: `Use ${pair}?` };
  }
  if (foreignChanged) {
    if (foreignSpell) {
      return { title: `Suggested ${learningName}`, copy: `Use ${pair}?` };
    }
    return { title: "Suggested capitalization", copy: `Use ${pair}?` };
  }
  return { title: "Suggested fix", copy: `Use ${pair}?` };
}

function getTranslationReviewSummary(
  foreign,
  native,
  suggestedNative,
  suggestedForeign,
  localPair = null,
  spellingCorrectedNative = null,
  spellingCorrectedForeign = null
) {
  const learningName = getActiveCategory().learningLanguageName || "Norwegian";
  const foreignWords = foreign.trim().split(/\s+/).filter(Boolean).length;
  const nativeWords = native.trim().split(/\s+/).filter(Boolean).length;
  // 2+ words is already idiom/phrase territory for MT
  const isPhrase = foreignWords >= 2 || nativeWords >= 2;
  const where = "your deck";

  const foreignGibberish = looksLikeGibberish(foreign);
  const nativeGibberish = looksLikeGibberish(native);

  // Never treat a translation OF mash as evidence that mash is fine.
  // Strip sentence punctuation so "eat." never becomes a "spelling tweak" vs "eat".
  const safeSuggestedNative =
    foreignGibberish || looksLikeGibberish(suggestedNative)
      ? null
      : stripFlashcardPunctuation(suggestedNative) || null;
  const safeSuggestedForeign =
    nativeGibberish || looksLikeGibberish(suggestedForeign)
      ? null
      : preferDisplayForm(suggestedForeign) || null;

  // Orthography (spelling + capitalization). Independent of MT. User can still Add.
  const safeSpellingNative =
    !nativeGibberish &&
    spellingCorrectedNative &&
    isPlausibleCardText(spellingCorrectedNative)
      ? stripFlashcardPunctuation(spellingCorrectedNative) || null
      : null;
  const safeSpellingForeign =
    !foreignGibberish &&
    spellingCorrectedForeign &&
    isPlausibleCardText(spellingCorrectedForeign)
      ? stripFlashcardPunctuation(spellingCorrectedForeign) || null
      : null;

  const makePairFix = (title, copy, pairForeign, pairNative) => {
    const f = stripFlashcardPunctuation(pairForeign);
    const n = stripFlashcardPunctuation(pairNative);
    if (!isPlausibleCardText(f) || !isPlausibleCardText(n)) return null;
    // Don't "recommend" the same pair the user already has
    if (
      stripFlashcardPunctuation(foreign) === f &&
      stripFlashcardPunctuation(native) === n
    ) {
      return null;
    }
    return {
      matches: false,
      targetField: "pair",
      suggestedValue: null,
      suggestedForeign: f,
      suggestedNative: n,
      title,
      copy,
    };
  };

  const nativeNeedsOrtho =
    safeSpellingNative && orthographyFixIsPlausible(native, safeSpellingNative, "en");
  const foreignNeedsOrtho =
    safeSpellingForeign &&
    orthographyFixIsPlausible(
      foreign,
      safeSpellingForeign,
      getActiveCategory()?.foreignLang || ""
    );

  if (nativeNeedsOrtho || foreignNeedsOrtho) {
    const pairNative = nativeNeedsOrtho
      ? safeSpellingNative
      : stripFlashcardPunctuation(native);
    const pairForeign = foreignNeedsOrtho
      ? safeSpellingForeign
      : stripFlashcardPunctuation(foreign);
    // Don't pull unstable MT into an orthography-only fix (loop fuel)
    const msg = orthographyFixCopy(
      learningName,
      native,
      foreign,
      nativeNeedsOrtho ? pairNative : null,
      foreignNeedsOrtho ? pairForeign : null
    );
    const fix = makePairFix(msg.title, msg.copy, pairForeign, pairNative);
    if (fix) return fix;
  }

  // Curated local data first (can still rescue mash on one side with a real deck pair).
  // One-letter "typos" alone are not enough to claim the same card (flott ≉ slott/castle).
  if (localPair) {
    const foreignExact = glossPartsMatch(localPair.foreign, foreign);
    const nativeExact = glossPartsMatch(localPair.native, native);
    const foreignStrong =
      foreignExact || norwegianTypingMatches(localPair.foreign, foreign);
    const nativeStrong =
      nativeExact ||
      englishInflectionMatch(localPair.native, native) ||
      glossPartsMatch(localPair.native, native);
    const displayMatches =
      foreign === localPair.foreign && native === localPair.native;

    // Exact curated pair (including capitalization)
    if (foreignExact && nativeExact && displayMatches && !foreignGibberish && !nativeGibberish) {
      return {
        matches: true,
        targetField: null,
        suggestedValue: null,
        title: "Looks good",
        copy: `That pair is already in ${where}.`,
      };
    }

    // Both sides clearly the same card, minor spelling/caps difference
    if (foreignStrong && nativeStrong && !foreignGibberish && !nativeGibberish && !displayMatches) {
      const fix = makePairFix(
        "In your deck",
        `Use ${formatReviewPair(localPair.foreign, localPair.native)}?`,
        localPair.foreign,
        localPair.native
      );
      if (fix) return fix;
    }

    // Same Norwegian headword, different English - only if Norwegian match is strong
    if (foreignStrong && !nativeStrong && !foreignGibberish) {
      const fix = makePairFix(
        "In your deck",
        `Use ${formatReviewPair(localPair.foreign, localPair.native)}?`,
        localPair.foreign,
        localPair.native
      );
      if (fix) return fix;
    }

    // Same English gloss, different Norwegian - only if English match is strong
    if (nativeStrong && !foreignStrong && !nativeGibberish) {
      const fix = makePairFix(
        "In your deck",
        `Use ${formatReviewPair(localPair.foreign, localPair.native)}?`,
        localPair.foreign,
        localPair.native
      );
      if (fix) return fix;
    }
  }

  // Nonsense wins over "MT says it matches" (the confidence loophole).
  if (foreignGibberish || nativeGibberish) {
    const nonsense = nonsenseReviewSummary(
      learningName,
      foreignGibberish,
      nativeGibberish,
      // Fixes only FROM the side that looks real
      nativeGibberish ? null : suggestedForeign,
      foreignGibberish ? null : suggestedNative
    );
    if (nonsense) return nonsense;
  }

  // Drop junk MT before any soft-match / suggest path
  const usableSuggestedForeign =
    safeSuggestedForeign && isPlausibleCardText(safeSuggestedForeign)
      ? safeSuggestedForeign
      : null;
  const usableSuggestedNative =
    safeSuggestedNative && isPlausibleCardText(safeSuggestedNative)
      ? safeSuggestedNative
      : null;

  const foreignCmp = usableSuggestedForeign
    ? reviewGlossCompare(foreign, usableSuggestedForeign)
    : { exact: false, soft: false, spellingOnly: false };
  const nativeCmp = usableSuggestedNative
    ? reviewGlossCompare(native, usableSuggestedNative)
    : { exact: false, soft: false, spellingOnly: false };

  // Soft = fuzzy (epler≈eller). Never use soft alone for LOOKS GOOD.
  const foreignSoft = foreignCmp.soft || foreignCmp.exact;
  const nativeSoft = nativeCmp.soft || nativeCmp.exact;
  // Strong = exact / casing / apostrophe / major orthography variants only
  const foreignStrong =
    usableSuggestedForeign &&
    isStrongTranslationMatch(
      foreign,
      usableSuggestedForeign,
      getActiveCategory()?.foreignLang || ""
    );
  const nativeStrong =
    usableSuggestedNative && isStrongTranslationMatch(native, usableSuggestedNative, "en");

  // Safe one-token spelling only (feal→feel). Never multi-word false friends.
  const nativeSafeSpell =
    usableSuggestedNative && isSafeSoftSpellingFix(native, usableSuggestedNative);
  const foreignSafeSpell =
    usableSuggestedForeign && isSafeSoftSpellingFix(foreign, usableSuggestedForeign);
  const hasSpellingIssue = nativeSafeSpell || foreignSafeSpell;

  // Fields look swapped (English in Norwegian box and vice versa)
  if (
    usableSuggestedForeign &&
    usableSuggestedNative &&
    !foreignSoft &&
    !nativeSoft &&
    softGlossMatch(usableSuggestedForeign, native) &&
    softGlossMatch(usableSuggestedNative, foreign)
  ) {
    return {
      matches: false,
      targetField: "swap",
      suggestedValue: null,
      suggestedForeign: stripFlashcardPunctuation(usableSuggestedForeign),
      suggestedNative: stripFlashcardPunctuation(usableSuggestedNative),
      title: "Sides look swapped",
      copy: `Use ${formatReviewPair(usableSuggestedForeign, usableSuggestedNative)}?`,
    };
  }

  // Safe soft spelling only - keep the other side as the user typed it
  if (!foreignGibberish && !nativeGibberish && hasSpellingIssue) {
    if (nativeSafeSpell && foreignSafeSpell) {
      const fix = makePairFix(
        "Suggested fix",
        `Use ${formatReviewPair(usableSuggestedForeign, usableSuggestedNative)}?`,
        usableSuggestedForeign,
        usableSuggestedNative
      );
      if (fix) return fix;
    }
    if (nativeSafeSpell) {
      const fix = makePairFix(
        "Suggested English",
        `Use ${formatReviewPair(foreign, usableSuggestedNative)}?`,
        foreign,
        usableSuggestedNative
      );
      if (fix) return fix;
    }
    if (foreignSafeSpell) {
      const fix = makePairFix(
        `Suggested ${learningName}`,
        `Use ${formatReviewPair(usableSuggestedForeign, native)}?`,
        usableSuggestedForeign,
        native
      );
      if (fix) return fix;
    }
  }

  // Anchor = strong agreement only (not epler≈eller soft-match)
  // englishIsAnchor: EN→NB matches user NB exactly → English is solid source
  // learningIsAnchor: NB→EN matches user EN exactly → Norwegian is solid source
  const englishIsAnchor = foreignStrong && !nativeGibberish;
  const learningIsAnchor = nativeStrong && !foreignGibberish;

  // LOOKS GOOD only when at least one direction is a strong (exact) match
  if (
    (englishIsAnchor || learningIsAnchor) &&
    !foreignGibberish &&
    !nativeGibberish &&
    !hasSpellingIssue
  ) {
    if (
      englishIsAnchor &&
      usableSuggestedForeign &&
      isCasingOnlyDiff(foreign, usableSuggestedForeign)
    ) {
      const fix = makePairFix(
        "Suggested capitalization",
        `Use ${formatReviewPair(usableSuggestedForeign, native)}?`,
        usableSuggestedForeign,
        native
      );
      if (fix) return fix;
    }
    if (
      learningIsAnchor &&
      usableSuggestedNative &&
      isCasingOnlyDiff(native, usableSuggestedNative)
    ) {
      const fix = makePairFix(
        "Suggested capitalization",
        `Use ${formatReviewPair(foreign, usableSuggestedNative)}?`,
        foreign,
        usableSuggestedNative
      );
      if (fix) return fix;
    }

    return {
      matches: true,
      targetField: null,
      suggestedValue: null,
      title: "Looks good",
      copy: "",
    };
  }

  // Inconsistent pair: fix only the non-anchor side. Never rewrite both via reverse MT.
  // Soft-near wrong translations (eller/jente) fall through here and get a real alternative.
  if (!foreignGibberish && !nativeGibberish) {
    const last = addCardLastEditedSide;
    const preferEnglishSource =
      englishIsAnchor ||
      (!learningIsAnchor && last === "native") ||
      (!learningIsAnchor &&
        !englishIsAnchor &&
        last !== "foreign" &&
        reviewTokens(native).length >= reviewTokens(foreign).length);

    const preferLearningSource =
      learningIsAnchor ||
      (!englishIsAnchor && last === "foreign") ||
      (!learningIsAnchor && !englishIsAnchor && last === "foreign");

    // English is source → only offer learning-language alternative
    if (
      preferEnglishSource &&
      !learningIsAnchor &&
      usableSuggestedForeign &&
      !foreignStrong &&
      isPlausibleTranslationAlternative(foreign, usableSuggestedForeign)
    ) {
      return {
        matches: false,
        targetField: "foreign",
        suggestedValue: preferDisplayForm(usableSuggestedForeign),
        title: `Suggested ${learningName}`,
        copy: `Use “${preferDisplayForm(usableSuggestedForeign)}”?`,
      };
    }

    // Learning language is source → only offer English alternative
    if (
      preferLearningSource &&
      !englishIsAnchor &&
      usableSuggestedNative &&
      !nativeStrong &&
      isPlausibleTranslationAlternative(native, usableSuggestedNative)
    ) {
      return {
        matches: false,
        targetField: "native",
        suggestedValue: stripFlashcardPunctuation(usableSuggestedNative),
        title: "Suggested English",
        copy: `Use “${stripFlashcardPunctuation(usableSuggestedNative)}”?`,
      };
    }

    // Neither anchor clear: prefer offering the learning-language fix when English is solid text
    if (
      usableSuggestedForeign &&
      !foreignStrong &&
      isPlausibleTranslationAlternative(foreign, usableSuggestedForeign)
    ) {
      return {
        matches: false,
        targetField: "foreign",
        suggestedValue: preferDisplayForm(usableSuggestedForeign),
        title: `Suggested ${learningName}`,
        copy: `Use “${preferDisplayForm(usableSuggestedForeign)}”?`,
      };
    }
    if (
      usableSuggestedNative &&
      !nativeStrong &&
      isPlausibleTranslationAlternative(native, usableSuggestedNative)
    ) {
      return {
        matches: false,
        targetField: "native",
        suggestedValue: stripFlashcardPunctuation(usableSuggestedNative),
        title: "Suggested English",
        copy: `Use “${stripFlashcardPunctuation(usableSuggestedNative)}”?`,
      };
    }
  }

  // Never default a multi-word pair to LOOKS GOOD. That was approving
  // bad cards when MT failed (rate limit) or returned no usable alternative.
  if (isPhrase) {
    return {
      matches: false,
      targetField: null,
      suggestedValue: null,
      title: "Couldn't double-check",
      copy: "Online check was weak for this phrase. Only save if both sides look right to you.",
    };
  }

  if (usableSuggestedForeign || usableSuggestedNative) {
    return {
      matches: false,
      targetField: null,
      suggestedValue: null,
      title: "Hard to check online",
      copy: "Add if both sides look right to you.",
    };
  }

  return {
    matches: false,
    targetField: null,
    suggestedValue: null,
    title: "Couldn't double-check",
    copy: "Add if both sides look right to you.",
  };
}

/** Drop a stale review if the form was edited after the check ran. */
function invalidateAddCardReviewIfStale() {
  if (!addCardReviewOpen || !addCardReviewState) return;
  const foreign = document.getElementById("new-foreign")?.value.trim() || "";
  const native = document.getElementById("new-native")?.value.trim() || "";
  if (
    foreign === (addCardReviewState.foreign || "").trim() &&
    native === (addCardReviewState.native || "").trim()
  ) {
    return;
  }
  closeAddCardReview();
}

function getAddCardConfirmLabel(translation) {
  const editing = Boolean(editingCardId);
  const differs = translation && !translation.matches;

  if (!differs) {
    return editing ? "Save" : "Add";
  }

  return editing ? "Save Anyway" : "Add Anyway";
}

function renderAddCardReviewContext({
  foreign,
  native,
  duplicate,
  suggestedNative,
  suggestedForeign,
  related,
  localPair = null,
  spellingCorrectedNative = null,
  spellingCorrectedForeign = null,
}) {
  const container = document.getElementById("add-card-review-context");
  if (!container) return;

  const blocks = [];
  const translation = getTranslationReviewSummary(
    foreign,
    native,
    suggestedNative,
    suggestedForeign,
    localPair,
    spellingCorrectedNative,
    spellingCorrectedForeign
  );

  if (duplicate) {
    const packSource = describeDeckCardPackSource(duplicate);
    const nearSpell = deckCardIsNearSpelling(duplicate, foreign);
    blocks.push(`
      <section class="review-context-block is-warning">
        <h4 class="review-context-title">Already in your deck</h4>
        <p class="review-context-copy">“${escapeHtml(stripFlashcardPunctuation(duplicate.native))}” · “${escapeHtml(preferDisplayForm(duplicate.foreign))}”</p>
        ${
          nearSpell
            ? `<p class="review-context-hint">Close spelling to what you typed</p>`
            : ""
        }
        ${
          packSource
            ? `<p class="review-context-hint">${escapeHtml(packSource)}</p>`
            : ""
        }
      </section>`);
  } else if (translation) {
    const canApplyOne =
      !translation.matches &&
      Boolean(translation.targetField && translation.suggestedValue) &&
      translation.targetField !== "swap" &&
      translation.targetField !== "pair";
    const canApplyPair =
      !translation.matches &&
      (translation.targetField === "swap" || translation.targetField === "pair") &&
      Boolean(translation.suggestedForeign && translation.suggestedNative);
    const actionable = canApplyOne || canApplyPair;
    const actionLabel =
      translation.targetField === "swap"
        ? "Swap fields to suggested pair"
        : translation.targetField === "pair"
          ? "Use suggested pair on both sides"
          : "Use suggested translation";
    // Skip extra hint when the copy already says "Tap to…"
    // Actionable blocks are tappable; skip extra "Tap to…" line when title is enough
    const actionHint =
      !actionable || (translation.copy && /^Tap to\b/i.test(translation.copy.trim()))
        ? ""
        : translation.targetField === "swap"
          ? "Tap to swap sides"
          : translation.targetField === "pair"
            ? "Tap to apply both"
            : "Tap to use suggestion";
    blocks.push(`
      <section
        class="review-context-block ${translation.matches ? "is-match" : "is-differs"}${actionable ? " is-actionable" : ""}"
        ${actionable ? `data-action="apply-suggestion" role="button" tabindex="0" aria-label="${escapeHtml(actionLabel)}"` : ""}
      >
        <h4 class="review-context-title">${escapeHtml(translation.title)}</h4>
        ${
          translation.copy
            ? `<p class="review-context-copy">${escapeHtml(translation.copy)}</p>`
            : ""
        }
        ${actionable && actionHint ? `<p class="review-context-hint">${escapeHtml(actionHint)}</p>` : ""}
      </section>`);
  }

  if (related.length) {
    const items = related
      .map(
        (item) => `
        <li class="review-context-item">
          <span class="review-context-item-pair">
            <span class="review-context-en">${escapeHtml(item.native)}</span>
            <span aria-hidden="true">·</span>
            <span class="review-context-nb" lang="${getActiveCategory().foreignLang || "nb"}">${escapeHtml(item.foreign)}</span>
          </span>
        </li>`
      )
      .join("");

    blocks.push(`
      <section class="review-context-block is-info">
        <h4 class="review-context-title">Related in deck</h4>
        <ul class="review-context-list">${items}</ul>
      </section>`);
  }

  // Quiet success when the pair looks fine and nothing stronger is shown yet
  if (!blocks.length && !duplicate) {
    blocks.push(`
      <section class="review-context-block is-match">
        <h4 class="review-context-title">Looks good</h4>
      </section>`);
  }

  // Word lives in a pack the user hasn’t Added - allow free Add, quiet tip only.
  if (!duplicate) {
    const packMatch = findThematicPackMatch(foreign);
    if (packMatch && !packMatch.enabled) {
      blocks.push(`
      <section class="review-context-block is-info">
        <h4 class="review-context-title">Also in ${escapeHtml(packMatch.title)}</h4>
        <p class="review-context-copy">Add this word alone, or Add the pack later.</p>
      </section>`);
    }
  }

  const confirmBtn = document.getElementById("add-card-confirm");
  const editExistingBtn = document.getElementById("add-card-edit-existing");
  if (duplicate) {
    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.textContent = editingCardId ? "Save" : "Add";
    }
    if (editExistingBtn) {
      editExistingBtn.classList.remove("hidden");
      editExistingBtn.dataset.cardId = duplicate.id;
    }
  } else {
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.textContent = getAddCardConfirmLabel(translation);
    }
    if (editExistingBtn) {
      editExistingBtn.classList.add("hidden");
      editExistingBtn.dataset.cardId = "";
    }
  }

  container.classList.remove("hidden");
  container.innerHTML = blocks.join("");

  addCardReviewState = {
    foreign,
    native,
    duplicate,
    suggestedNative,
    suggestedForeign,
    related,
    localPair,
    spellingCorrectedNative,
    spellingCorrectedForeign,
    translation,
  };
}

async function applyReviewSuggestion() {
  const state = addCardReviewState;
  if (!state?.translation || state.translation.matches) return;

  const { targetField, suggestedValue, suggestedForeign, suggestedNative } = state.translation;
  if (!targetField) return;
  if (targetField !== "swap" && targetField !== "pair" && !suggestedValue) return;
  if (
    (targetField === "swap" || targetField === "pair") &&
    !(suggestedForeign && suggestedNative)
  ) {
    return;
  }

  // Reject junk suggestions (e.g. lone # from bad MT)
  if (targetField === "swap" || targetField === "pair") {
    if (!isPlausibleCardText(suggestedForeign) || !isPlausibleCardText(suggestedNative)) return;
  } else if (!isPlausibleCardText(suggestedValue)) {
    return;
  }

  const foreignInput = document.getElementById("new-foreign");
  const nativeInput = document.getElementById("new-native");
  const reviewForeign = document.getElementById("review-foreign");
  const reviewNative = document.getElementById("review-native");

  let nextForeign =
    targetField === "swap" || targetField === "pair"
      ? stripFlashcardPunctuation(suggestedForeign)
      : targetField === "foreign"
        ? stripFlashcardPunctuation(suggestedValue)
        : foreignInput?.value.trim() || "";
  let nextNative =
    targetField === "swap" || targetField === "pair"
      ? stripFlashcardPunctuation(suggestedNative)
      : targetField === "native"
        ? stripFlashcardPunctuation(suggestedValue)
        : nativeInput?.value.trim() || "";

  // Light display form only for acronyms (cv→CV)
  if (targetField === "swap" || targetField === "pair" || targetField === "foreign") {
    nextForeign = preferDisplayForm(nextForeign);
  }

  // Fold remaining spelling/casing into this same apply (fewer Check card hops)
  try {
    const polished = await polishCardPair(nextForeign, nextNative);
    nextForeign = polished.foreign;
    nextNative = polished.native;
  } catch {
    /* keep unpolished pair */
  }

  const sig = `${normalizeAnswer(nextForeign)}|${normalizeAnswer(nextNative)}|${nextForeign}|${nextNative}`;
  // Already applied this exact pair, or too many hops: settle instead of looping
  const shouldSettle =
    addCardReviewApplyHistory.includes(sig) || addCardReviewApplyHistory.length >= 4;

  if (foreignInput) foreignInput.value = nextForeign;
  if (nativeInput) nativeInput.value = nextNative;
  if (reviewForeign) reviewForeign.textContent = nextForeign;
  if (reviewNative) reviewNative.textContent = nextNative;
  syncAddCardResetButton();

  if (shouldSettle) {
    renderAddCardReviewContext({
      foreign: nextForeign,
      native: nextNative,
      duplicate: findDeckCardByForeign(nextForeign, editingCardId),
      suggestedNative: nextNative,
      suggestedForeign: nextForeign,
      related: getRelatedEntriesForReview(nextForeign, nextNative),
      localPair: findLocalDeckPair(nextForeign, nextNative),
      spellingCorrectedNative: null,
      spellingCorrectedForeign: null,
    });
    return;
  }

  addCardReviewApplyHistory.push(sig);
  openAddCardReview();
}

function closeAddCardReview() {
  addCardReviewOpen = false;
  addCardReviewState = null;
  addCardReviewApplyHistory = [];
  document.getElementById("add-card-review")?.classList.add("hidden");
  const confirmBtn = document.getElementById("add-card-confirm");
  if (confirmBtn) confirmBtn.disabled = false;
  document.getElementById("add-card-edit-existing")?.classList.add("hidden");
}

async function openAddCardReview() {
  const foreign = document.getElementById("new-foreign")?.value.trim();
  const native = document.getElementById("new-native")?.value.trim();
  if (!foreign || !native) return;

  hideLibrarySuggestions();

  const review = document.getElementById("add-card-review");
  const reviewForeign = document.getElementById("review-foreign");
  const reviewNative = document.getElementById("review-native");
  const context = document.getElementById("add-card-review-context");
  if (!review || !reviewForeign || !reviewNative || !context) return;

  reviewForeign.textContent = stripFlashcardPunctuation(foreign);
  reviewNative.textContent = stripFlashcardPunctuation(native);
  context.classList.remove("hidden");
  context.innerHTML = `<p class="review-context-loading"><span class="review-context-loading-dot" aria-hidden="true"></span>Checking translation…</p>`;

  const duplicate = findDeckCardByForeign(foreign, editingCardId);
  const editExistingBtn = document.getElementById("add-card-edit-existing");
  const confirmBtn = document.getElementById("add-card-confirm");
  if (duplicate) {
    if (editExistingBtn) {
      editExistingBtn.classList.remove("hidden");
      editExistingBtn.dataset.cardId = duplicate.id;
    }
    if (confirmBtn) confirmBtn.disabled = true;
  } else {
    if (editExistingBtn) {
      editExistingBtn.classList.add("hidden");
      editExistingBtn.dataset.cardId = "";
    }
    if (confirmBtn) confirmBtn.disabled = false;
  }

  addCardReviewOpen = true;
  review.classList.remove("hidden");
  review.scrollIntoView({ block: "nearest", behavior: "smooth" });

  const related = getRelatedEntriesForReview(foreign, native);
  const localPair = findLocalDeckPair(foreign, native);
  const { foreignCode, nativeCode } = getCategoryLanguageCodes();
  // Spell-check BOTH sides in parallel with MT - MT often echoes typos.
  // Learning-language side uses LanguageTool + deck near-match.
  const [
    suggestedNativeRaw,
    suggestedForeignRaw,
    spellingCorrectedNative,
    spellingCorrectedForeign,
  ] = await Promise.all([
    fetchTranslationSuggestion(foreign, foreignCode, nativeCode),
    fetchTranslationSuggestion(native, nativeCode, foreignCode),
    fetchEnglishSpellingCorrection(native),
    fetchLearningSpellingCorrection(foreign, foreignCode),
  ]);

  if (!addCardReviewOpen || reviewForeign.textContent.trim() !== foreign) return;

  let suggestedNative = suggestedNativeRaw;
  let suggestedForeign = suggestedForeignRaw;

  // If English spelling was fixed, re-translate EN→learning for a better foreign gloss.
  // Do NOT reverse-translate learning→English into a "better" English - that morphs
  // meaning (sword → hard one / blow job) via bad TM hits.
  const nativeFixed =
    spellingCorrectedNative &&
    normalizeAnswer(spellingCorrectedNative) !== normalizeAnswer(native);

  if (nativeFixed) {
    const fromCorrected = await fetchTranslationSuggestion(
      spellingCorrectedNative,
      nativeCode,
      foreignCode
    );
    if (!addCardReviewOpen || reviewForeign.textContent.trim() !== foreign) return;
    if (fromCorrected) suggestedForeign = fromCorrected;
  }

  // Retry EN→learning once if the first pass failed (rate limits / empty)
  // so bad deck cards still get a real "Suggested Norwegian" instead of LOOKS GOOD.
  if (!suggestedForeign && native) {
    const retryForeign = await fetchTranslationSuggestion(
      nativeFixed && spellingCorrectedNative ? spellingCorrectedNative : native,
      nativeCode,
      foreignCode
    );
    if (!addCardReviewOpen || reviewForeign.textContent.trim() !== foreign) return;
    if (retryForeign) suggestedForeign = retryForeign;
  }

  renderAddCardReviewContext({
    foreign,
    native,
    duplicate,
    suggestedNative,
    suggestedForeign,
    related,
    localPair,
    spellingCorrectedNative,
    spellingCorrectedForeign,
  });
}

function setAddCardFormBaseline(foreign = "", native = "") {
  addCardFormBaseline = {
    foreign: String(foreign || ""),
    native: String(native || ""),
  };
  syncAddCardResetButton();
}

function isAddCardFormDirty() {
  const foreign = document.getElementById("new-foreign")?.value || "";
  const native = document.getElementById("new-native")?.value || "";
  return foreign !== addCardFormBaseline.foreign || native !== addCardFormBaseline.native;
}

function syncAddCardResetButton() {
  const btn = document.getElementById("add-card-reset-fields");
  if (!btn) return;
  const dirty = isAddCardFormDirty();
  btn.hidden = !dirty;
  btn.disabled = !dirty;
}

/** Restore English/Norwegian boxes to how they were before this add/edit session. */
function restoreAddCardFormBaseline() {
  const foreignInput = document.getElementById("new-foreign");
  const nativeInput = document.getElementById("new-native");
  if (foreignInput) foreignInput.value = addCardFormBaseline.foreign;
  if (nativeInput) nativeInput.value = addCardFormBaseline.native;
  suppressAddCardSuggestions = false;
  closeAddCardReview();
  hideLibrarySuggestions();
  syncAddCardResetButton();
  (nativeInput || foreignInput)?.focus();
}

function resetAddCardForm() {
  editingCardId = null;
  suppressAddCardSuggestions = false;
  addCardLastEditedSide = null;
  document.getElementById("add-card-form")?.reset();
  setAddCardFormBaseline("", "");
  closeAddCardReview();
  hideLibrarySuggestions();
  applyAddCardFormUI();
  document.querySelectorAll(".card-item.is-editing").forEach((el) => el.classList.remove("is-editing"));
  syncAddCardResetButton();
}

/**
 * Load a card into the editor.
 * options.seedNative / seedForeign: keep the pair the user just refined (e.g. from
 * Check card) instead of overwriting with the old wrong deck text.
 * options.autoReview: default true when both sides filled - always run Check card
 * so wrong deck text still gets translation / spelling suggestions.
 */
function startEditCard(cardId, options = {}) {
  const card = deck.find((entry) => entry.id === cardId);
  if (!card) return;

  suppressAddCardSuggestions = false;
  editingCardId = card.id;
  // The Edit click bubbles to document and would clear suggestions - ignore briefly.
  addCardSuppressOutsideHideUntil = Date.now() + 600;

  const seedForeign = stripFlashcardPunctuation(
    options.seedForeign != null && String(options.seedForeign).trim()
      ? options.seedForeign
      : card.foreign
  );
  const seedNative = stripFlashcardPunctuation(
    options.seedNative != null && String(options.seedNative).trim()
      ? options.seedNative
      : card.native
  );

  const foreignInput = document.getElementById("new-foreign");
  const nativeInput = document.getElementById("new-native");
  if (foreignInput) foreignInput.value = seedForeign;
  if (nativeInput) nativeInput.value = seedNative;
  setAddCardFormBaseline(seedForeign, seedNative);
  closeAddCardReview();
  hideLibrarySuggestions();
  applyAddCardFormUI();

  document.querySelectorAll(".card-item.is-editing").forEach((el) => el.classList.remove("is-editing"));
  document.querySelector(`.card-item[data-card-id="${card.id}"]`)?.classList.add("is-editing");

  document.getElementById("add-card-form")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  syncAddCardResetButton();

  // Prefer treating English as source when editing (offer better Norwegian).
  addCardLastEditedSide = "native";

  // After the Edit click finishes bubbling, run the same Check process as Add.
  window.setTimeout(() => {
    suppressAddCardSuggestions = false;
    nativeInput?.focus({ preventScroll: true });
    refreshAddCardSuggestions("native");
    // Default: always Check when both sides present (list Edit + Edit existing).
    const autoReview = options.autoReview !== false;
    if (autoReview && seedForeign && seedNative) {
      openAddCardReview();
    }
  }, 40);
}

function saveLibraryCard(foreign, native) {
  const trimmedForeign = stripFlashcardPunctuation(foreign);
  const trimmedNative = stripFlashcardPunctuation(native);
  if (!trimmedForeign || !trimmedNative) return false;

  const duplicate = findDeckCardByForeign(trimmedForeign, editingCardId);
  if (duplicate) return false;

  if (editingCardId) {
    const card = deck.find((entry) => entry.id === editingCardId);
    if (!card) return false;
    const foreignChanged =
      normalizeAnswer(card.foreign) !== normalizeAnswer(trimmedForeign);
    const nativeChanged =
      normalizeAnswer(card.native) !== normalizeAnswer(trimmedNative);
    card.foreign = trimmedForeign;
    card.native = trimmedNative;
    // Editing a pack-owned card makes it Yours - Remove pack must not delete it later.
    if (card.packId && (foreignChanged || nativeChanged)) {
      card.packId = null;
    }
  } else {
    deck.push(createCard(trimmedForeign, trimmedNative));
  }

  saveDeck();
  resetAddCardForm();
  renderAll();
  return true;
}

function renderCardItem(card) {
  const isEditing = card.id === editingCardId;
  return `
      <article class="card-item${isEditing ? " is-editing" : ""}" data-card-id="${escapeAttr(card.id)}" id="card-${escapeAttr(card.id)}">
        <div class="card-item-text">
          <div class="card-item-foreign" lang="${getActiveCategory().foreignLang || "nb"}">${escapeHtml(card.foreign)}</div>
          <div class="card-item-native">${escapeHtml(card.native)}</div>
        </div>
        <div class="card-item-actions">
          <button class="btn ghost small hear-card-btn card-action card-action--hear" data-foreign="${escapeAttr(card.foreign)}" type="button" aria-label="Hear ${escapeAttr(card.foreign)}">Hear</button>
          <button class="btn ghost small edit-card-btn card-action" data-id="${escapeAttr(card.id)}" type="button">Edit</button>
          <button class="btn ghost small danger delete-card-btn card-action card-action--delete" data-id="${escapeAttr(card.id)}" type="button">Delete</button>
        </div>
      </article>`;
}

function isCardsPanelActive() {
  const panel = document.getElementById("cards-panel");
  return Boolean(panel?.classList.contains("active"));
}

function updateDeckCount() {
  const deckCount = document.getElementById("deck-count");
  if (!deckCount) return;
  const n = Array.isArray(deck) ? deck.length : 0;
  const formatted = n.toLocaleString("en-US");
  // Live size of the user's deck (starter + added − deleted), not a fixed pack size.
  deckCount.textContent = n === 1 ? "1 card" : `${formatted} cards`;
  deckCount.setAttribute("aria-label", `${formatted} cards in your deck`);
}

function getLibraryBandGroups() {
  // All = full library (bands + phrases + yours). Phrases / Yours are filters only.
  if (libraryFilter === "all") {
    return ["A", "B", "C", "D", "E", "F", "G", "phrase", null];
  }
  if (libraryFilter === "yours") {
    return [null];
  }
  if (libraryFilter === "themes") {
    // Sections are built per packId in renderCardList.
    return [];
  }
  return [libraryFilter];
}

function librarySectionKey(band) {
  if (band == null || band === "yours") return "yours";
  return String(band);
}

function clearLibraryJumpNav() {
  libraryJumpObserver?.disconnect();
  libraryJumpObserver = null;

  const nav = document.getElementById("library-jump");
  if (!nav) return;
  nav.innerHTML = "";
  nav.classList.add("hidden");
}

function setActiveLibraryJump(key) {
  document.querySelectorAll(".library-jump-chip").forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.jumpSection === key);
  });
}

function setLibraryFilterChip(filter) {
  libraryFilter = filter;
  document.querySelectorAll(".filter-chip").forEach((el) => {
    el.classList.toggle("active", el.dataset.band === filter);
  });
}

/** Deck-band sections for the jump bar (always A–G that have cards). */
function getLibraryBandJumpSectionsFromDeck() {
  return ["A", "B", "C", "D", "E", "F", "G"]
    .map((band) => ({
      band,
      label: BAND_LABELS[band],
      cards: deck.filter((card) => card.band === band),
    }))
    .filter((section) => section.cards.length > 0);
}

function scrollToLibrarySection(key) {
  // Phrases / Yours / search hide band sections - switch back to All, then jump.
  const needsAllView =
    libraryFilter === "phrase" ||
    libraryFilter === "yours" ||
    Boolean(librarySearch.trim());

  if (needsAllView) {
    librarySearch = "";
    const searchInput = document.getElementById("library-search");
    if (searchInput) searchInput.value = "";
    setLibraryFilterChip("all");
    renderCardList();

    const tryScroll = (attempts = 0) => {
      const target = document.getElementById(`library-section-${key}`);
      if (target) {
        setActiveLibraryJump(key);
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (attempts < 48) {
        requestAnimationFrame(() => tryScroll(attempts + 1));
      }
    };
    requestAnimationFrame(() => tryScroll());
    return;
  }

  const target = document.getElementById(`library-section-${key}`);
  if (!target) return;
  setActiveLibraryJump(key);
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function isStatsPanelActive() {
  const panel = document.getElementById("stats-panel");
  return Boolean(panel?.classList.contains("active") && !panel.hidden);
}

/**
 * One Top control: return to site header (tabs) so you can leave the page.
 * On Library, gently pulse Search as a visual cue - but do not focus it.
 * Focusing opens the mobile keyboard and covers the header/tabs.
 */
function handlePageFloatTop() {
  setActiveLibraryJump(null);

  const header =
    document.querySelector(".header") || document.querySelector(".app");
  if (header) {
    header.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!isCardsPanelActive()) return;

  const input = document.getElementById("library-search");
  if (!input) return;

  // Dismiss keyboard if search (or anything) was already focused.
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  // Visual only - user taps Search when they actually want to type.
  input.classList.add("library-search--ready");
  window.setTimeout(() => input.classList.remove("library-search--ready"), 1200);
}

function updatePageFloatTopVisibility() {
  const libraryDock = document.getElementById("library-float-actions");
  const progressDock = document.getElementById("progress-float-actions");
  const scrolled = window.scrollY > LIBRARY_SCROLL_TOP_THRESHOLD;

  if (libraryDock) {
    libraryDock.classList.toggle("hidden", !(isCardsPanelActive() && scrolled));
  }
  if (progressDock) {
    progressDock.classList.toggle("hidden", !(isStatsPanelActive() && scrolled));
  }
}

/** @deprecated name kept for existing call sites */
function updateLibraryScrollTopVisibility() {
  updatePageFloatTopVisibility();
}

function observeLibraryJumpSections(sections) {
  libraryJumpObserver?.disconnect();
  libraryJumpObserver = null;

  if (!sections.length || typeof IntersectionObserver === "undefined") return;

  const targets = sections
    .map(({ band }) => document.getElementById(`library-section-${librarySectionKey(band)}`))
    .filter(Boolean);
  if (!targets.length) return;

  libraryJumpObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (!visible.length) return;
      const key = visible[0].target.dataset.librarySection;
      if (key) setActiveLibraryJump(key);
    },
    {
      root: null,
      rootMargin: "-20% 0px -55% 0px",
      threshold: [0.08, 0.2, 0.4],
    }
  );

  targets.forEach((el) => libraryJumpObserver.observe(el));
}

function isLibraryJumpBand(band) {
  // Jump bar = deck bands only. Phrases / Yours are filters above, not jumps.
  return typeof band === "string" && /^[A-G]$/.test(band);
}

/** Shorter jump labels on narrow screens so chips stay tappable. */
const BAND_JUMP_LABELS_COMPACT = {
  A: "Essentials",
  B: "Core",
  C: "Daily",
  D: "Expanded",
  E: "Campus",
  F: "Reading",
  G: "Wider",
};

function isCompactLibraryJump() {
  // Phone + tablet: shorter jump labels so the bar stays tappable.
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(max-width: 1024px)").matches
  );
}

function renderLibraryJumpNav(sections) {
  const nav = document.getElementById("library-jump");
  if (!nav) return;

  const jumpSections = sections.filter(({ band }) => isLibraryJumpBand(band));
  if (jumpSections.length < 2) {
    clearLibraryJumpNav();
    return;
  }

  const compact = isCompactLibraryJump();
  nav.classList.remove("hidden");
  const chips = jumpSections
    .map(({ band, label }) => {
      const key = librarySectionKey(band);
      const full = BAND_LABELS[key] || label;
      const chipLabel = compact
        ? BAND_JUMP_LABELS_COMPACT[key] || full
        : full;
      return `<button type="button" class="library-jump-chip" data-jump-section="${escapeAttr(key)}">${escapeHtml(chipLabel)}</button>`;
    })
    .join("");
  // Inner track = horizontal scroll on mobile only; outer nav stays sticky.
  nav.innerHTML = `<div class="library-jump-track">${chips}</div>`;

  observeLibraryJumpSections(jumpSections);
}

function bindCardListListeners(list) {
  if (!list) return;

  list.querySelectorAll(".edit-card-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      startEditCard(btn.dataset.id, { autoReview: true });
    });
  });

  list.querySelectorAll(".delete-card-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const confirmed = await showConfirm("Delete this card?", {
        confirmLabel: "Delete",
        cancelLabel: "Cancel",
      });
      if (!confirmed) return;
      if (editingCardId === id) resetAddCardForm();
      deck = deck.filter((c) => c.id !== id);
      sessionQueue = sessionQueue.filter((qid) => qid !== id);
      pruneDailyPracticeForCard(id);
      if (currentCard?.id === id) currentCard = nextInSession();
      saveDeck();
      renderAll();
    });
  });

  list.querySelectorAll(".hear-card-btn").forEach((btn) => {
    btn.addEventListener("click", () => speakForeign(btn.dataset.foreign));
  });
}

function renderCardsInBatches(cards, container, token, onComplete) {
  if (!container || !cards.length) {
    onComplete?.();
    return;
  }

  let index = 0;

  function step() {
    if (token !== libraryRenderToken) return;

    const batch = cards.slice(index, index + LIBRARY_BATCH_SIZE);
    if (!batch.length) {
      onComplete?.();
      return;
    }

    container.insertAdjacentHTML("beforeend", batch.map(renderCardItem).join(""));
    index += LIBRARY_BATCH_SIZE;
    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function renderCardListSections(sections, list, token) {
  list.innerHTML = "";

  const pending = sections.map(({ band, label, cards }) => {
    const key = librarySectionKey(band);
    const range = LIBRARY_JUMP_RANGE[key];
    // Curated bands: rank range. Yours: count once the user has added cards.
    let meta = range || "";
    if (key === "yours" && cards.length > 0) {
      meta = String(cards.length);
    }
    // Theme pack sections: show card count instead of rank range.
    if (libraryFilter === "themes" && cards.length > 0) {
      meta = String(cards.length);
    }
    const metaHtml = meta
      ? ` <span class="card-group-range">${escapeHtml(meta)}</span>`
      : "";
    const sectionEl = document.createElement("section");
    sectionEl.className = "card-group";
    sectionEl.id = `library-section-${key}`;
    sectionEl.dataset.librarySection = key;
    sectionEl.innerHTML = `
      <h3 class="card-group-title">${escapeHtml(label)}${metaHtml}</h3>
      <div class="card-group-list"></div>`;
    list.appendChild(sectionEl);
    return {
      cards,
      container: sectionEl.querySelector(".card-group-list"),
    };
  });

  renderLibraryJumpNav(sections);

  let sectionIndex = 0;

  function renderNextSection() {
    if (token !== libraryRenderToken) return;
    if (sectionIndex >= pending.length) {
      bindCardListListeners(list);
      return;
    }

    const { cards, container } = pending[sectionIndex];
    sectionIndex += 1;
    renderCardsInBatches(cards, container, token, renderNextSection);
  }

  renderNextSection();
}

function renderCardList() {
  const list = document.getElementById("card-list");
  updateDeckCount();
  renderThematicPacks();
  if (!list || !isCardsPanelActive()) return;

  libraryRenderToken += 1;
  const token = libraryRenderToken;

  const searching = Boolean(librarySearch.trim());
  let filtered = sortCards(deck).filter(matchesLibraryFilter);
  if (searching) filtered = dedupeLibraryCards(filtered);

  if (!filtered.length) {
    // Keep band jumps available even when this filter has no cards.
    if (!searching) {
      renderLibraryJumpNav(getLibraryBandJumpSectionsFromDeck());
      setActiveLibraryJump(null);
    } else {
      clearLibraryJumpNav();
    }
    list.innerHTML = `
      <div class="library-empty">
        <p class="library-empty-title">${searching ? "No matches" : "Nothing here"}</p>
        <p class="library-empty-copy">${
          searching
            ? "Try another search."
            : libraryFilter === "yours"
              ? "Cards you add show up here."
              : libraryFilter === "phrase"
                ? "No phrases in this deck yet."
                : libraryFilter === "themes"
                  ? "Add a pack to put those cards in your deck."
                  : "No cards in this view."
        }</p>
      </div>`;
    updateLibraryScrollTopVisibility();
    return;
  }

  // Themes: group by pack title (Travel, Dining, …) - jump chips use those sections.
  if (libraryFilter === "themes") {
    const packOrder = getThematicPackList().map((pack) => pack.id);
    const byPack = new Map();
    filtered.forEach((card) => {
      const key = card.packId || "other";
      if (!byPack.has(key)) byPack.set(key, []);
      byPack.get(key).push(card);
    });
    const orderedIds = [
      ...packOrder.filter((id) => byPack.has(id)),
      ...[...byPack.keys()].filter((id) => !packOrder.includes(id)),
    ];
    const sections = orderedIds.map((packId) => ({
      band: packId,
      label: getThemeSectionLabel(packId),
      cards: sortCards(byPack.get(packId) || []),
    }));
    renderCardListSections(sections, list, token);
    updateLibraryScrollTopVisibility();
    return;
  }

  // Phrases / Yours / search: flat list, but keep Essentials→Wider jump bar
  // so those filters don’t strip deck navigation.
  if (searching || libraryFilter === "phrase" || libraryFilter === "yours") {
    if (searching) {
      clearLibraryJumpNav();
    } else {
      renderLibraryJumpNav(getLibraryBandJumpSectionsFromDeck());
      setActiveLibraryJump(null);
    }
    list.innerHTML = `<div class="card-group-list"></div>`;
    renderCardsInBatches(filtered, list.querySelector(".card-group-list"), token, () => {
      if (token === libraryRenderToken) bindCardListListeners(list);
    });
    updateLibraryScrollTopVisibility();
    return;
  }

  const sections = [];
  for (const band of getLibraryBandGroups()) {
    const cards = filtered.filter((card) =>
      band === null ? !card.band : card.band === band
    );
    // Keep empty Yours section on full library so the list layout stays stable
    // when the first personal card is added (Yours itself is a filter, not a jump chip).
    const alwaysShowYours =
      band === null && libraryFilter === "all" && !searching;
    if (!cards.length && !alwaysShowYours) continue;
    sections.push({
      band,
      label: band ? BAND_LABELS[band] : "Yours",
      cards,
    });
  }

  if (!sections.length) {
    clearLibraryJumpNav();
    list.innerHTML = `
      <div class="library-empty">
        <p class="library-empty-title">Nothing here</p>
        <p class="library-empty-copy">No cards in this view.</p>
      </div>`;
    updateLibraryScrollTopVisibility();
    return;
  }

  renderCardListSections(sections, list, token);
  updateLibraryScrollTopVisibility();
}

function getReadProgressKey(categoryId = activeCategoryId) {
  return `leitner-learning-read-progress-${categoryId}`;
}

function loadReadProgress(categoryId = activeCategoryId) {
  try {
    const raw = storageGet(getReadProgressKey(categoryId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function normalizeStoryPosition(value) {
  if (value == null) return { current: 0, furthest: 0 };
  if (typeof value === "number") {
    const index = Math.max(0, Number(value) || 0);
    return { current: index, furthest: index };
  }
  const current = Math.max(0, Number(value.current) || 0);
  const furthest = Math.max(current, Number(value.furthest ?? value.current) || 0);
  return { current, furthest };
}

function getStoryPosition(storyId, categoryId = activeCategoryId) {
  const saved = loadReadProgress(categoryId);
  if (!saved) return { current: 0, furthest: 0 };

  const positions = saved.positions || {};
  if (positions[storyId] != null) {
    return normalizeStoryPosition(positions[storyId]);
  }

  if (saved.storyId === storyId && saved.sentenceIndex != null) {
    return normalizeStoryPosition(saved.sentenceIndex);
  }

  return { current: 0, furthest: 0 };
}

function sanitizeReadProgress(categoryId = activeCategoryId) {
  const saved = loadReadProgress(categoryId);
  if (!saved) return;

  const stories = getStoriesForCategory(categoryId);
  const validIds = new Set(stories.map((story) => story.id));
  if (!validIds.size) return;

  const positions = { ...(saved.positions || {}) };
  let changed = false;

  for (const id of Object.keys(positions)) {
    if (!validIds.has(id)) {
      delete positions[id];
      changed = true;
      continue;
    }
    const normalized = normalizeStoryPosition(positions[id]);
    if (JSON.stringify(normalized) !== JSON.stringify(positions[id])) {
      positions[id] = normalized;
      changed = true;
    }
  }

  if (saved.storyId && !validIds.has(saved.storyId)) {
    saved.storyId = stories[0].id;
    changed = true;
  }

  if (!saved.storyId) {
    saved.storyId = stories[0].id;
    changed = true;
  }

  if (changed) {
    saved.positions = positions;
    storageSet(getReadProgressKey(categoryId), JSON.stringify(saved));
  }
}

function saveReadProgress() {
  if (!readStoryId) return;
  const saved = loadReadProgress() || {};
  const positions = { ...(saved.positions || {}) };
  const existing = normalizeStoryPosition(positions[readStoryId]);

  positions[readStoryId] = {
    current: readSentenceIndex,
    furthest: Math.max(existing.furthest, readSentenceIndex),
  };

  warnIfStorageFailed(
    storageSet(
      getReadProgressKey(),
      JSON.stringify({
        storyId: readStoryId,
        sentenceIndex: readSentenceIndex,
        showEnglish: readShowEnglish,
        positions,
      })
    )
  );

  const statsPanel = document.getElementById("stats-panel");
  if (statsPanel?.classList.contains("active")) {
    renderProgressReadStats();
  }
}

function getStoriesForCategory(categoryId = activeCategoryId) {
  const base =
    typeof READ_STORIES !== "undefined" && Array.isArray(READ_STORIES) ? READ_STORIES : [];
  const extra =
    typeof window !== "undefined" && Array.isArray(window.EXTRA_READ_STORIES)
      ? window.EXTRA_READ_STORIES
      : [];
  const stories = [...base, ...extra].filter((story) => story.categoryId === categoryId);
  return typeof sortStoriesByTrail === "function" ? sortStoriesByTrail(stories) : stories;
}

function getActiveReadStory() {
  const stories = getStoriesForCategory();
  if (!stories.length) return null;
  return stories.find((story) => story.id === readStoryId) || stories[0];
}

function getSavedStoryPosition(storyId, kind = "current") {
  const pos = getStoryPosition(storyId);
  return kind === "furthest" ? pos.furthest : pos.current;
}

function getStoryProgressPercent(story, furthestIndex) {
  if (!story?.sentences?.length) return 0;
  const total = story.sentences.length;
  const furthest = Math.max(0, Number(furthestIndex) || 0);
  if (furthest <= 0) return 0;
  if (total === 1) return 100;
  if (furthest >= total - 1) return 100;
  return Math.round((furthest / (total - 1)) * 100);
}

function formatStoryProgressCount(story, furthestIndex) {
  const pct = getStoryProgressPercent(story, furthestIndex);
  return pct >= 100 ? "Finished" : `${pct}%`;
}

function isStoryComplete(story, furthestIndex) {
  if (!story?.sentences?.length) return false;
  return Math.max(0, Number(furthestIndex) || 0) >= story.sentences.length - 1;
}

function storyHasReadProgress(storyId, categoryId = activeCategoryId) {
  const pos = getStoryPosition(storyId, categoryId);
  return pos.furthest > 0 || pos.current > 0;
}

function applyStoryReadProgressReset(storyId) {
  const stories = getStoriesForCategory();
  const story = stories.find((entry) => entry.id === storyId);
  if (!story || !storyHasReadProgress(storyId)) return false;

  const saved = loadReadProgress() || {};
  const positions = { ...(saved.positions || {}) };
  positions[storyId] = { current: 0, furthest: 0 };

  const payload = {
    ...saved,
    positions,
  };

  if (readStoryId === storyId) {
    readSentenceIndex = 0;
    payload.storyId = readStoryId;
    payload.sentenceIndex = 0;
    closeReadGloss();
  }

  warnIfStorageFailed(storageSet(getReadProgressKey(), JSON.stringify(payload)));

  if (readStoryId === storyId) {
    renderReadPanel();
    renderReadHeader(story);
  }

  const statsPanel = document.getElementById("stats-panel");
  if (statsPanel?.classList.contains("active")) {
    renderProgressReadStats();
  }
  if (readMenuOpen) renderReadMenu();

  return true;
}

async function resetStoryReadProgress(storyId) {
  const stories = getStoriesForCategory();
  const story = stories.find((entry) => entry.id === storyId);
  if (!story || !storyHasReadProgress(storyId)) return false;

  const pos = getStoryPosition(storyId);
  const finished = isStoryComplete(story, pos.furthest);
  const confirmed = await showConfirm(finished ? "Reset Story?" : "Restart Story?", {
    confirmLabel: finished ? "Reset" : "Restart",
    cancelLabel: "Cancel",
  });

  if (!confirmed) return false;
  return applyStoryReadProgressReset(storyId);
}

function anyStoryHasReadProgress(categoryId = activeCategoryId) {
  return getStoriesForCategory(categoryId).some((story) => storyHasReadProgress(story.id, categoryId));
}

async function resetAllStoriesReadProgress() {
  const stories = getStoriesForCategory();
  if (!stories.some((story) => storyHasReadProgress(story.id))) return false;

  const confirmed = await showConfirm("Reset all stories?", {
    confirmLabel: "Reset all",
    cancelLabel: "Cancel",
  });
  if (!confirmed) return false;

  const saved = loadReadProgress() || {};
  const positions = { ...(saved.positions || {}) };
  for (const story of stories) {
    positions[story.id] = { current: 0, furthest: 0 };
  }

  const payload = { ...saved, positions };
  if (readStoryId) {
    readSentenceIndex = 0;
    payload.sentenceIndex = 0;
    closeReadGloss();
  }

  storageSet(getReadProgressKey(), JSON.stringify(payload));
  renderProgressReadStats();

  if (readStoryId) {
    const story = getActiveReadStory();
    renderReadPanel();
    if (story) renderReadHeader(story);
  }
  if (readMenuOpen) renderReadMenu();

  return true;
}

function getStoriesForTrail(trailId, categoryId = activeCategoryId) {
  return getStoriesForCategory(categoryId).filter((story) => story.trail === trailId);
}

function ensureReadState(forceInit = false) {
  const stories = getStoriesForCategory();
  if (!stories.length) {
    readStoryId = null;
    readSentenceIndex = 0;
    return;
  }

  const saved = loadReadProgress();
  const positions = saved?.positions || {};
  let story = readStoryId ? stories.find((entry) => entry.id === readStoryId) : null;

  if (!story || forceInit) {
    const savedStory = saved ? stories.find((entry) => entry.id === saved.storyId) : null;
    story = savedStory || stories[0];
    readStoryId = story.id;
  }

  if (saved?.showEnglish != null) {
    readShowEnglish = Boolean(saved.showEnglish);
  }

  const resumeIndex = getStoryPosition(readStoryId).current;
  readSentenceIndex = Math.min(
    Math.max(resumeIndex, 0),
    story.sentences.length - 1
  );
}

function buildDeckLookup() {
  const map = new Map();
  deck.forEach((card) => {
    map.set(normalizeAnswer(card.foreign), card);
  });
  return map;
}

function generateLookupVariants(word, category = getActiveCategory()) {
  const base = normalizeAnswer(word);
  if (!base) return [];
  const variants = new Set([base]);
  for (const suffix of getLookupSuffixes(category)) {
    if (base.length > suffix.length + 2 && base.endsWith(suffix)) {
      variants.add(base.slice(0, -suffix.length));
    }
  }
  return [...variants];
}

/** @deprecated use generateLookupVariants */
function generateNorwegianLookupVariants(word) {
  return generateLookupVariants(word);
}

function addReadVocabEntry(map, foreign, native, source) {
  const key = normalizeAnswer(foreign);
  if (!key || map.has(key)) return;
  map.set(key, { foreign, native, source });
}

function rebuildReadVocabIndex() {
  const map = new Map();

  deck.forEach((card) => {
    addReadVocabEntry(map, card.foreign, card.native, "deck");
  });

  const storyPools = [];
  if (typeof READ_STORIES !== "undefined" && Array.isArray(READ_STORIES)) {
    storyPools.push(...READ_STORIES);
  }
  if (typeof window !== "undefined" && Array.isArray(window.EXTRA_READ_STORIES)) {
    storyPools.push(...window.EXTRA_READ_STORIES);
  }
  storyPools.forEach((story) => {
    if (!story?.glosses) return;
    Object.entries(story.glosses).forEach(([foreign, native]) => {
      addReadVocabEntry(map, foreign, native, "gloss");
    });
  });

  readVocabIndex = map;
  return map;
}

function getReadVocabIndex() {
  if (!readVocabIndex) return rebuildReadVocabIndex();
  return readVocabIndex;
}

function lookupReadVocabEntry(token, story) {
  const index = getReadVocabIndex();
  const variants = generateLookupVariants(token);

  for (const variant of variants) {
    const hit = index.get(variant);
    if (hit) return hit;
  }

  const storyGloss = story?.glosses?.[normalizeAnswer(token)];
  if (storyGloss) {
    return { foreign: token, native: storyGloss, source: "gloss" };
  }

  return null;
}

function buildReadPhraseList(story) {
  const phrases = new Set();
  getReadVocabIndex().forEach((_entry, key) => phrases.add(key));
  if (story?.glosses) {
    Object.keys(story.glosses).forEach((word) => phrases.add(word.toLowerCase()));
  }
  return [...phrases].sort((a, b) => b.length - a.length);
}

function parseReadSentence(text, phrases) {
  const tokens = [];
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (/\s/.test(ch)) {
      tokens.push({ type: "space", text: ch });
      i += 1;
      continue;
    }

    if (/[.,!?;:'"()—–\-«»""''…]/.test(ch)) {
      let punct = "";
      while (i < text.length && /[.,!?;:'"()—–\-«»""''…]/.test(text[i])) {
        punct += text[i];
        i += 1;
      }
      tokens.push({ type: "punct", text: punct });
      continue;
    }

    const rest = text.slice(i);
    const restLower = rest.toLowerCase();
    let matched = null;

    // Letters for Western European target languages (nb/sv/da/de/fr/es/it).
    const isWordChar = (c) =>
      /[a-zA-ZæøåäöüÆØÅÄÖÜáàâãéèêëíìîïóòôõúùûñçÁÀÂÃÉÈÊËÍÌÎÏÓÒÔÕÚÙÛÑÇß']/.test(c);

    for (const phrase of phrases) {
      if (!restLower.startsWith(phrase)) continue;
      const end = i + phrase.length;
      if (end < text.length && isWordChar(text[end])) continue;
      matched = text.slice(i, end);
      i = end;
      break;
    }

    if (matched) {
      tokens.push({ type: "word", text: matched });
      continue;
    }

    let word = "";
    while (i < text.length && isWordChar(text[i])) {
      word += text[i];
      i += 1;
    }
    if (word) {
      tokens.push({ type: "word", text: word });
      continue;
    }

    tokens.push({ type: "punct", text: ch });
    i += 1;
  }

  return tokens;
}

function lookupReadWord(token, deckMap, story) {
  const hit = lookupReadVocabEntry(token, story);
  if (!hit) return null;

  const key = normalizeAnswer(token);
  const card = deckMap.get(key);
  if (card) {
    return { source: "deck", foreign: card.foreign, native: card.native, card };
  }

  for (const variant of generateLookupVariants(token)) {
    const variantCard = deckMap.get(variant);
    if (variantCard) {
      return {
        source: "deck",
        foreign: token,
        native: variantCard.native,
        card: variantCard,
        matchedLemma: variantCard.foreign,
      };
    }
  }

  return {
    source: hit.source,
    foreign: token,
    native: hit.native,
    card: null,
    matchedLemma: hit.foreign !== token ? hit.foreign : null,
  };
}

function getReadWordClasses(lookup) {
  if (!lookup) return "read-word";
  const classes = ["read-word", "read-word--tappable"];
  if (lookup.source === "deck" || lookup.card) {
    classes.push("read-word--deck");
  } else {
    classes.push("read-word--extra");
  }
  return classes.join(" ");
}

const READ_CLOSING_PUNCT = /^[.,!?;:»'")\u201d\u2019\u2026\u2014\u2013-]+$/;

function groupReadDisplayTokens(tokens) {
  const groups = [];
  let pendingOpen = "";

  for (const token of tokens) {
    if (token.type === "space") {
      if (groups.length) groups[groups.length - 1].spaceAfter = true;
      continue;
    }

    if (token.type === "punct") {
      if (groups.length && groups[groups.length - 1].word && READ_CLOSING_PUNCT.test(token.text)) {
        groups[groups.length - 1].trailPunct += token.text;
      } else {
        pendingOpen += token.text;
      }
      continue;
    }

    if (token.type === "word") {
      groups.push({
        leadPunct: pendingOpen,
        word: token,
        trailPunct: "",
        spaceAfter: false,
      });
      pendingOpen = "";
    }
  }

  if (pendingOpen) {
    if (groups.length) groups[groups.length - 1].trailPunct += pendingOpen;
    else groups.push({ leadPunct: pendingOpen, word: null, trailPunct: "", spaceAfter: false });
  }

  return groups;
}

function renderReadWordMarkup(token, story, deckMap, interactive) {
  const lookup = lookupReadWord(token.text, deckMap, story);
  if (!lookup || !interactive) {
    return escapeHtml(token.text);
  }

  const classes = getReadWordClasses(lookup);
  const payload = escapeAttr(
    JSON.stringify({
      foreign: lookup.foreign,
      native: lookup.native,
      source: lookup.source,
      cardId: lookup.card?.id ?? null,
      matchedLemma: lookup.matchedLemma ?? null,
    })
  );

  return `<button type="button" class="${classes}" data-read-word="${payload}">${escapeHtml(token.text)}</button>`;
}

function renderReadSentenceMarkup(sentenceText, story, deckMap, interactive = true) {
  const phrases = buildReadPhraseList(story);
  const tokens = parseReadSentence(sentenceText, phrases);
  const groups = groupReadDisplayTokens(tokens);

  return groups
    .map((group) => {
      const glued = Boolean(group.leadPunct || group.trailPunct);
      const unitClass = glued ? "read-unit read-unit--glued" : "read-unit";
      const lead = escapeHtml(group.leadPunct);
      const trail = escapeHtml(group.trailPunct);
      const wordMarkup = group.word ? renderReadWordMarkup(group.word, story, deckMap, interactive) : "";
      const space = group.spaceAfter ? " " : "";

      return `<span class="${unitClass}">${lead}${wordMarkup}${trail}</span>${space}`;
    })
    .join("");
}

function closeReadGloss() {
  readGlossSelection = null;
  const glossEl = document.getElementById("read-gloss");
  if (glossEl) {
    glossEl.classList.add("is-collapsed");
    glossEl.classList.remove("is-deck", "is-extra");
    glossEl.hidden = true;
  }
  const meaningEl = document.getElementById("read-gloss-meaning");
  if (meaningEl) meaningEl.textContent = "";
  document.querySelectorAll(".read-word--active").forEach((el) => el.classList.remove("read-word--active"));
}

function openReadGloss(button) {
  if (!button?.dataset?.readWord) return;

  if (button.classList.contains("read-word--active")) {
    closeReadGloss();
    return;
  }

  let payload;
  try {
    payload = JSON.parse(button.dataset.readWord);
  } catch {
    return;
  }

  readGlossSelection = payload;
  document.querySelectorAll(".read-word--active").forEach((el) => el.classList.remove("read-word--active"));
  button.classList.add("read-word--active");

  const glossEl = document.getElementById("read-gloss");
  const meaningEl = document.getElementById("read-gloss-meaning");
  if (!glossEl || !meaningEl) return;

  const native = String(payload.native || "").trim();
  const lemma = String(payload.matchedLemma || "").trim();
  const surface = String(payload.foreign || button.textContent || "").trim();
  const inDeck = Boolean(payload.cardId || payload.source === "deck");

  // Calm structure: English meaning primary; lemma only when form differs.
  let html = `<span class="read-gloss-en">${escapeHtml(native || "-")}</span>`;
  if (lemma && normalizeAnswer(lemma) !== normalizeAnswer(surface)) {
    html += `<span class="read-gloss-lemma">${escapeHtml(lemma)}</span>`;
  } else if (inDeck && surface && normalizeAnswer(surface) !== normalizeAnswer(native)) {
    // Surface L2 already in the sentence - no need to repeat unless helpful
  }
  meaningEl.innerHTML = html;
  glossEl.classList.toggle("is-deck", inDeck);
  glossEl.classList.toggle("is-extra", !inDeck);
  glossEl.classList.remove("is-collapsed");
  glossEl.hidden = false;
}

function alignReadContextTrack(contextBefore) {
  const anchor = contextBefore?.querySelector(".read-context-anchor");
  const track = anchor?.querySelector(".read-context-track");
  if (!anchor || !track) return;

  const positionTrack = () => {
    const containerWidth = anchor.clientWidth;
    const trackWidth = track.scrollWidth;

    let offsetX;
    if (trackWidth <= containerWidth) {
      offsetX = (containerWidth - trackWidth) / 2;
    } else {
      offsetX = containerWidth - trackWidth;
    }

    track.style.transform = `translate(${offsetX}px, -50%)`;
  };

  requestAnimationFrame(() => {
    positionTrack();
    requestAnimationFrame(positionTrack);
  });
}

function navigateReadSentence(delta) {
  const story = getActiveReadStory();
  if (!story) return;

  closeReadGloss();
  readSentenceIndex = Math.min(
    Math.max(readSentenceIndex + delta, 0),
    story.sentences.length - 1
  );
  saveReadProgress();
  renderReadPanel();
}

function updateReadEnglishToggle() {
  const toggle = document.getElementById("read-toggle-en");
  const englishSlot = document.getElementById("read-focus-en-slot");
  if (!toggle || !englishSlot) return;

  toggle.setAttribute("aria-pressed", String(readShowEnglish));
  toggle.classList.toggle("is-on", Boolean(readShowEnglish));
  // Short label; pressed/on state carries the meaning.
  toggle.textContent = "English";
  toggle.removeAttribute("title");
  toggle.setAttribute(
    "aria-label",
    readShowEnglish ? "Hide English translation" : "Show English translation"
  );
  englishSlot.classList.toggle("is-collapsed", !readShowEnglish);
}

function getReadTrailSymbolMarkup(trailId) {
  const trail = typeof getReadTrailLevel === "function" ? getReadTrailLevel(trailId) : null;
  const id = trail?.id || "green-circle";

  if (id === "double-black-diamond") {
    return `<span class="read-trail-symbol read-trail-symbol--double-black-diamond" aria-hidden="true"><span class="read-trail-diamond"></span><span class="read-trail-diamond"></span></span>`;
  }

  return `<span class="read-trail-symbol read-trail-symbol--${id}" aria-hidden="true"></span>`;
}

function closeReadMenu() {
  readMenuOpen = false;
  readMenuStep = "trail";
  readMenuTrail = null;
  const menu = document.getElementById("read-menu");
  const trailBtn = document.getElementById("read-trail-btn");
  const storySelect = document.getElementById("read-story-select");
  const shell = document.querySelector(".read-shell");
  if (menu) menu.classList.add("hidden");
  shell?.classList.remove("read-shell--menu-open");
  if (trailBtn) {
    trailBtn.classList.remove("is-pressed");
    trailBtn.setAttribute("aria-expanded", "false");
  }
  if (storySelect) storySelect.setAttribute("aria-expanded", "false");
}

function openReadMenu(fromTrail = false) {
  const story = getActiveReadStory();
  if (!story) return;

  readMenuOpen = true;
  document.querySelector(".read-shell")?.classList.add("read-shell--menu-open");

  if (fromTrail) {
    readMenuStep = "trail";
    readMenuTrail = null;
  } else {
    readMenuStep = "stories";
    readMenuTrail = story.trail;
  }

  renderReadMenu();
}

function selectReadTrail(trailId) {
  readMenuTrail = trailId;
  readMenuStep = "stories";
  renderReadMenu();
}

function switchReadStory(storyId) {
  const stories = getStoriesForCategory();
  const story = stories.find((entry) => entry.id === storyId);
  if (!story) return;

  if (story.id !== readStoryId) {
    const pos = getStoryPosition(story.id);
    readStoryId = story.id;
    readSentenceIndex = Math.min(
      Math.max(pos.current, 0),
      story.sentences.length - 1
    );
  }

  closeReadGloss();
  closeReadMenu();
  saveReadProgress();
  renderReadPanel();
}

function openReadStoryFromProgress(storyId) {
  const stories = getStoriesForCategory();
  const story = stories.find((entry) => entry.id === storyId);
  if (!story) return;

  const pos = getStoryPosition(storyId);
  readStoryId = story.id;
  readSentenceIndex = Math.min(
    Math.max(pos.current, 0),
    story.sentences.length - 1
  );

  closeReadGloss();
  closeReadMenu();
  switchTab("read");
}

function renderReadMenu() {
  const menu = document.getElementById("read-menu");
  const trailBtn = document.getElementById("read-trail-btn");
  const storySelect = document.getElementById("read-story-select");
  if (!menu) return;

  if (!readMenuOpen) {
    menu.classList.add("hidden");
    menu.innerHTML = "";
    return;
  }

  menu.classList.remove("hidden");
  menu.setAttribute("aria-label", readMenuStep === "trail" ? "Choose difficulty" : "Choose story");
  trailBtn?.classList.toggle("is-pressed", readMenuStep === "trail");
  trailBtn?.setAttribute("aria-expanded", String(readMenuStep === "trail"));
  storySelect?.setAttribute("aria-expanded", String(readMenuStep === "stories"));

  if (readMenuStep === "trail") {
    const trails = typeof READ_TRAIL_ORDER !== "undefined" ? READ_TRAIL_ORDER : [];
    menu.innerHTML = trails
      .map((trailId) => {
        const trail = getReadTrailLevel(trailId);
        const count = getStoriesForTrail(trailId).length;
        if (!count) return "";
        const isActive = trailId === getActiveReadStory()?.trail;
        return `
          <button
            type="button"
            class="read-menu-option${isActive ? " active" : ""}"
            data-read-trail="${escapeAttr(trailId)}"
            role="option"
            aria-selected="${isActive}"
          >
            <span class="read-menu-option-symbol">${getReadTrailSymbolMarkup(trailId)}</span>
            <span class="read-menu-option-text">
              <span class="read-menu-option-title">${escapeHtml(trail?.label || trailId)}</span>
              <span class="read-menu-option-meta">${count} ${count === 1 ? "story" : "stories"}</span>
            </span>
          </button>`;
      })
      .join("");
    return;
  }

  const stories = getStoriesForTrail(readMenuTrail);
  const trail = getReadTrailLevel(readMenuTrail);

  if (!stories.length) {
    menu.innerHTML = `
      <button type="button" class="read-menu-back" data-read-menu-back>
        <span class="read-menu-back-symbol">${getReadTrailSymbolMarkup(readMenuTrail)}</span>
        ${escapeHtml(trail?.label || "Stories")}
      </button>
      <p class="read-menu-empty">No stories at this level yet.</p>`;
    return;
  }

  menu.innerHTML = `
    <button type="button" class="read-menu-back" data-read-menu-back>
      <span class="read-menu-back-symbol">${getReadTrailSymbolMarkup(readMenuTrail)}</span>
      ${escapeHtml(trail?.label || "Stories")}
    </button>
    ${stories
      .map((story) => {
        const pos = getStoryPosition(story.id);
        const progressLabel = formatStoryProgressCount(story, pos.furthest);
        const isActive = story.id === readStoryId;
        return `
          <button
            type="button"
            class="read-menu-option${isActive ? " active" : ""}"
            data-story-id="${escapeAttr(story.id)}"
            role="option"
            aria-selected="${isActive}"
          >
            <span class="read-menu-option-text">
              <span class="read-menu-option-title">${escapeHtml(story.title)}</span>
              <span class="read-menu-option-meta">${escapeHtml(story.subtitle || "")}</span>
            </span>
            <span class="read-menu-option-pct">${escapeHtml(progressLabel)}</span>
          </button>`;
      })
      .join("")}`;
}

function updateReadStoryStatus(story) {
  const resetBtn = document.getElementById("read-reset-btn");
  const progressBar = document.getElementById("read-progress-bar");
  if (!story) return;

  const hasProgress = storyHasReadProgress(story.id);
  const pos = getStoryPosition(story.id);
  const finished = hasProgress && isStoryComplete(story, pos.furthest);

  /* Footer stays fixed: progress is the bar; reset is a stable header slot. */
  if (resetBtn) {
    resetBtn.disabled = !hasProgress;
    resetBtn.classList.toggle("is-idle", !hasProgress);
    resetBtn.setAttribute("aria-hidden", hasProgress ? "false" : "true");
    resetBtn.tabIndex = hasProgress ? 0 : -1;
  }

  if (progressBar) {
    progressBar.classList.toggle("is-complete", finished);
  }
}

function renderReadHeader(story) {
  const trailBtn = document.getElementById("read-trail-btn");
  const titleEl = document.getElementById("read-story-title");
  const progressBar = document.getElementById("read-progress-bar");
  const progressFill = document.getElementById("read-progress-fill");

  if (!story) return;

  const trail = getReadTrailLevel(story.trail);
  const pos = getStoryPosition(story.id);
  const pct = getStoryProgressPercent(story, pos.furthest);
  const category = getActiveCategory();
  const langLabel =
    category?.label || category?.learningLanguageName || "Language";

  if (trailBtn) {
    const trailLabel = trail?.label || "Beginner";
    trailBtn.innerHTML = `${getReadTrailSymbolMarkup(story.trail)}<span class="read-trail-btn__label">${escapeHtml(trailLabel)}</span>`;
    // Screen readers still get the level; no hover title - it only repeated the visible label.
    trailBtn.setAttribute("aria-label", `Difficulty: ${trailLabel}`);
    trailBtn.removeAttribute("title");
  }

  if (titleEl) titleEl.textContent = story.title;

  const storyBtn = document.getElementById("read-story-select");
  if (storyBtn) {
    storyBtn.setAttribute(
      "aria-label",
      `${langLabel} story: ${story.title}. Choose story`
    );
    storyBtn.removeAttribute("title");
  }

  const sourceEl = document.getElementById("read-story-source");
  if (sourceEl) {
    sourceEl.textContent = "";
    sourceEl.hidden = true;
  }

  if (progressBar && progressFill) {
    progressBar.setAttribute("aria-valuenow", String(pct));
    progressBar.setAttribute(
      "aria-label",
      pct >= 100 ? "Story finished" : `${pct}% read`
    );
    progressFill.style.width = `${pct}%`;
  }

  updateReadStoryStatus(story);
}

function setReadEmptyVisible(show, { title = "", copy = "", showBrowse = false } = {}) {
  const empty = document.getElementById("read-empty");
  const shell = document.querySelector(".read-shell");
  if (!empty) return;

  empty.classList.toggle("hidden", !show);
  empty.hidden = !show;
  if (shell) shell.classList.toggle("hidden", show);

  if (!show) return;

  const category = getActiveCategory();
  const flagEl = empty.querySelector("[data-read-empty-flag]");
  const titleEl = document.getElementById("read-empty-title");
  const copyEl = document.getElementById("read-empty-copy");
  const browseBtn = document.getElementById("read-empty-browse");

  if (flagEl) flagEl.textContent = category?.flag || "🏳️";
  if (titleEl) titleEl.textContent = title || "No stories yet";
  if (copyEl) {
    copyEl.textContent =
      copy ||
      `Reading for ${category?.label || "this language"} is still being prepared.`;
  }
  if (browseBtn) {
    browseBtn.classList.toggle("hidden", !showBrowse);
  }
}

function renderReadPanel() {
  const panel = document.getElementById("read-panel");
  if (!panel) return;

  ensureReadState();
  const stories = getStoriesForCategory();
  const story = getActiveReadStory();
  const shell = panel.querySelector(".read-shell");

  // No pack stories (or broken story) - calm empty, not a blank panel
  if (!stories.length || !story?.sentences?.length) {
    closeReadMenu();
    setReadEmptyVisible(true, {
      title: "No stories yet",
      copy: `Reading for ${getActiveCategory()?.label || "this language"} is still being prepared.`,
      showBrowse: false,
    });
    return;
  }

  setReadEmptyVisible(false);

  if (shell) shell.classList.remove("hidden");

  renderReadHeader(story);
  if (readMenuOpen) renderReadMenu();

  const deckMap = buildDeckLookup();
  const sentence = story.sentences[readSentenceIndex];
  const priorSentences = story.sentences.slice(0, readSentenceIndex);

  document.getElementById("read-progress").textContent = `${readSentenceIndex + 1} / ${story.sentences.length}`;

  const focusNb = document.getElementById("read-focus-nb");
  const focusEn = document.getElementById("read-focus-en");
  const contextBefore = document.getElementById("read-context-before");

  if (focusNb) {
    focusNb.innerHTML = renderReadSentenceMarkup(
      sentenceForeignText(sentence),
      story,
      deckMap,
      true
    );
  }
  if (focusEn) {
    focusEn.textContent = sentence.en;
  }
  if (contextBefore) {
    if (!priorSentences.length) {
      contextBefore.innerHTML = '<div class="read-context-anchor" aria-hidden="true"></div>';
    } else {
      const chunks = priorSentences
        .map(
          (entry) =>
            `<span class="read-context-sentence">${escapeHtml(sentenceForeignText(entry))}</span>`
        )
        .join('<span class="read-context-gap" aria-hidden="true"> </span>');
      contextBefore.innerHTML = `<div class="read-context-anchor"><div class="read-context-track">${chunks}</div></div>`;
      alignReadContextTrack(contextBefore);
    }
  }

  document.getElementById("read-prev-btn")?.toggleAttribute("disabled", readSentenceIndex === 0);
  document.getElementById("read-next-btn")?.toggleAttribute(
    "disabled",
    readSentenceIndex >= story.sentences.length - 1
  );

  updateReadEnglishToggle();
  saveReadProgress();
}

function getBoxCounts() {
  const counts = Array.from({ length: BOX_COUNT }, () => 0);
  deck.forEach((card) => {
    const box = Math.min(Math.max(Number(card.box) || 1, 1), BOX_COUNT);
    counts[box - 1] += 1;
  });
  return counts;
}

function renderProgressBoxStats() {
  const container = document.getElementById("box-stats");
  if (!container) return;

  const counts = getBoxCounts();
  const total = deck.length || 1;

  container.innerHTML = counts
    .map((count, index) => {
      const box = index + 1;
      const level = getLearningLevel(box);
      // True share of the deck (no 8% floor that made 1/1000 look huge).
      const width = count && total ? (count / total) * 100 : 0;
      const emptyClass = count === 0 ? " box-stat-row--empty" : "";
      const barClass = count > 0 ? " box-stat-bar--has" : "";
      return `
        <div class="box-stat-row${emptyClass}">
          <div class="box-stat-label">
            <span class="box-stat-name">${escapeHtml(level.short)}</span>
            <span class="box-stat-interval">${escapeHtml(formatInterval(box))}</span>
          </div>
          <div class="box-stat-bar-wrap" role="presentation">
            <div class="box-stat-bar${barClass}" style="width: ${width}%"></div>
          </div>
          <span class="box-stat-count">${count}</span>
        </div>`;
    })
    .join("");
}

function renderProgressReadStats() {
  const section = document.getElementById("progress-read-section");
  const container = document.getElementById("read-progress-stats");
  if (!section || !container) return;

  sanitizeReadProgress();
  const stories = getStoriesForCategory();
  if (!stories.length) {
    section.classList.add("hidden");
    container.innerHTML = "";
    return;
  }

  section.classList.remove("hidden");

  const resetAllBtn = document.getElementById("reset-all-stories-btn");
  if (resetAllBtn) {
    resetAllBtn.classList.toggle("hidden", !anyStoryHasReadProgress());
  }

  const trails = typeof READ_TRAIL_ORDER !== "undefined" ? READ_TRAIL_ORDER : [];
  const sections = [];

  for (const trailId of trails) {
    const trailStories = stories.filter((story) => story.trail === trailId);
    if (!trailStories.length) continue;

    const trail =
      typeof getReadTrailLevel === "function" ? getReadTrailLevel(trailId) : null;
    const rows = trailStories
      .map((story) => {
        const pos = getStoryPosition(story.id);
        const pct = getStoryProgressPercent(story, pos.furthest);
        // True percent (no 6% floor). Tiny non-zero fill uses CSS min-width.
        const width = pct > 0 ? pct : 0;
        const completed = isStoryComplete(story, pos.furthest);
        const progressLabel = formatStoryProgressCount(story, pos.furthest);
        const hasProgress = storyHasReadProgress(story.id);
        const barClass = pct > 0 ? " box-stat-bar--has" : "";
        return `
          <div class="read-stat-row-wrap${completed ? " read-stat-row-wrap--completed" : ""}">
            <button
              type="button"
              class="read-stat-row read-stat-row--link"
              data-open-story-id="${escapeAttr(story.id)}"
              aria-label="Open ${escapeAttr(story.title)}"
            >
              <div class="read-stat-label">
                <span class="read-stat-title">${escapeHtml(story.title)}</span>
                ${story.subtitle ? `<span class="read-stat-trail">${escapeHtml(story.subtitle)}</span>` : ""}
              </div>
              <div class="box-stat-bar-wrap" role="presentation">
                <div class="box-stat-bar${barClass}" style="width: ${width}%"></div>
              </div>
            </button>
            <div class="read-stat-actions">
              <span class="read-stat-count">${escapeHtml(progressLabel)}</span>
              ${
                hasProgress
                  ? `<button
                      type="button"
                      class="read-stat-reset-btn"
                      data-reset-story-id="${escapeAttr(story.id)}"
                      aria-label="Reset ${escapeAttr(story.title)}"
                    >↺</button>`
                  : `<span class="read-stat-reset-spacer" aria-hidden="true"></span>`
              }
            </div>
          </div>`;
      })
      .join("");

    sections.push(`
      <div class="read-stat-group">
        <h4 class="read-stat-group-title">
          <span class="read-stat-group-symbol">${getReadTrailSymbolMarkup(trailId)}</span>
          <span>${escapeHtml(trail?.label || trailId)}</span>
        </h4>
        ${rows}
      </div>`);
  }

  container.innerHTML = sections.join("");
}

function renderStatsSummary() {
  // Progress page: Leitner levels (+ Reading when relevant).
  // Streak / daily goal live on Review; no duplicate deck summary here.
  renderProgressBoxStats();
  renderProgressReadStats();
}

function applyCategoryUI() {
  const category = getActiveCategory();
  // Progress (and any non-welcome) pickers only - welcome stays "Choose a Language"
  // until the user commits a pick and enters the app.
  document.querySelectorAll("[data-category-picker-label]").forEach((el) => {
    if (el.closest(".category-picker--welcome")) return;
    el.textContent = category.label;
  });
  document.querySelectorAll("[data-category-picker-flag]").forEach((el) => {
    if (el.closest(".category-picker--welcome")) return;
    el.textContent = category.flag || "🏳️";
  });
  const progressLangBtn = document.getElementById("progress-language-btn");
  if (progressLangBtn) {
    progressLangBtn.setAttribute(
      "aria-label",
      `Current language: ${category.label || "Language"}`
    );
  }

  applyAddCardFormUI();
  applyPracticeDirectionUI();
  updateBasicsButtonVisibility(category.id);
  updateReadLanguageIndicator(category);

  document.title = "Leitner Learning";
}

function applyPracticeDirectionUI() {
  const category = getActiveCategory();
  const labels = getDirectionLabels(category);
  const directionLabel = document.getElementById("prompt-direction");
  const answerInput = document.getElementById("answer-input");
  const hearBtn = document.getElementById("hear-btn");
  const speakBtn = document.getElementById("speak-btn");
  const revealBtn = document.getElementById("reveal-btn");

  if (directionLabel) {
    directionLabel.textContent = labels.promptLabel;
  }

  if (answerInput) {
    updateAnswerInputPlaceholder();
    answerInput.lang = labels.answerLang.split("-")[0] || "en";
  }

  if (hearBtn) {
    hearBtn.textContent = category.hearLabel || "Hear";
    hearBtn.removeAttribute("title");
    hearBtn.setAttribute("aria-label", labels.hearTitle || "Hear the prompt");
  }

  if (speakBtn) {
    const speakAria = speakModeActive
      ? "Speak mode on. Tap to turn off"
      : labels.speakTitle;
    speakBtn.removeAttribute("title");
    speakBtn.setAttribute("aria-pressed", String(speakModeActive));
    speakBtn.setAttribute("aria-label", speakAria);
    speakBtn.classList.toggle("is-active", Boolean(speakModeActive));
  }

  if (revealBtn) {
    revealBtn.removeAttribute("title");
    revealBtn.setAttribute("aria-label", "Show the answer");
  }
}

/**
 * Menu / welcome order: alphabetical by display name (A–Z).
 * Scales better as languages are added - users can scan and find a language.
 */
function sortCategoriesForDisplay(categories) {
  return [...categories].sort((a, b) => {
    const la = String(a.label || a.id || "");
    const lb = String(b.label || b.id || "");
    const byName = la.localeCompare(lb, "en", { sensitivity: "base" });
    if (byName !== 0) return byName;
    return String(a.id || "").localeCompare(String(b.id || ""), "en");
  });
}

function renderAvailableCategoryOption(category, { showActive = true } = {}) {
  const isActive = showActive && category.id === activeCategoryId;
  const flag = category.flag || "🏳️";
  return `
    <button
      type="button"
      class="category-option category-option--compact${isActive ? " active" : ""}"
      role="option"
      aria-selected="${isActive}"
      data-category-id="${category.id}"
    >
      <span class="category-option-flag" aria-hidden="true">${flag}</span>
      <span class="category-option-label">${escapeHtml(category.label)}</span>
    </button>`;
}

function renderUpcomingCategoryOption(category) {
  const flag = category.flag || "🏳️";
  return `
    <button
      type="button"
      class="category-option category-option--soon unavailable"
      role="option"
      aria-selected="false"
      data-category-id="${category.id}"
      disabled
    >
      <span class="category-option-flag" aria-hidden="true">${flag}</span>
      <span class="category-option-label">${escapeHtml(category.label)}</span>
    </button>`;
}

function buildCategoryPickerMenuMarkup({ forWelcome = false } = {}) {
  const available = sortCategoriesForDisplay(
    LEARNING_CATEGORIES.filter((category) => category.available)
  );
  const upcoming = sortCategoriesForDisplay(
    LEARNING_CATEGORIES.filter((category) => !category.available)
  );

  const sections = [];
  if (available.length) {
    sections.push(
      available
        .map((category) =>
          renderAvailableCategoryOption(category, { showActive: !forWelcome })
        )
        .join("")
    );
  }
  if (upcoming.length) {
    sections.push(`
      <p class="category-picker-group-label" role="presentation">Coming soon</p>
      ${upcoming.map(renderUpcomingCategoryOption).join("")}`);
  }

  return sections.join("");
}

function bindCategoryPickerMenu(menu, { forWelcome = false } = {}) {
  if (!menu) return;
  menu.querySelectorAll("[data-category-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      const id = btn.dataset.categoryId;
      if (forWelcome || isWelcomeOpen()) {
        completeWelcomeWithLanguage(id);
        return;
      }
      switchCategory(id);
    });
  });
}

/**
 * Fade + overlay arrows when the language list continues past the fold.
 * Down cue: more languages below. Up cue: more languages above (after scrolling).
 * Cues are scroll-only (not clickable) and never change list layout.
 */
function updateCategoryMenuScrollHints(menu) {
  if (!menu) return;
  const scroller =
    menu.querySelector("[data-category-menu-scroll]") ||
    menu.querySelector(".category-picker-menu-scroll");
  if (!scroller) {
    menu.classList.remove("is-scrollable", "has-more-below", "has-more-above");
    return;
  }

  const canScroll = scroller.scrollHeight > scroller.clientHeight + 4;
  const atTop = scroller.scrollTop <= 3;
  const atBottom =
    scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 4;

  menu.classList.toggle("is-scrollable", canScroll);
  menu.classList.toggle("has-more-below", canScroll && !atBottom);
  menu.classList.toggle("has-more-above", canScroll && !atTop);

  // Keep cues in the DOM; CSS fades opacity. Never hidden=true (that caused jumps).
  menu
    .querySelectorAll("[data-category-scroll-cue], [data-category-scroll-cue-up]")
    .forEach((cue) => {
      cue.hidden = false;
      cue.setAttribute("aria-hidden", "true");
    });
}

function bindCategoryMenuScrollHints(menu) {
  if (!menu || menu.dataset.scrollHintsBound === "1") return;
  const scroller =
    menu.querySelector("[data-category-menu-scroll]") ||
    menu.querySelector(".category-picker-menu-scroll");
  if (!scroller) return;
  menu.dataset.scrollHintsBound = "1";
  scroller.addEventListener(
    "scroll",
    () => {
      updateCategoryMenuScrollHints(menu);
    },
    { passive: true }
  );

  // Decorative only - no click/keyboard activation (avoids mis-taps on last language)
  menu
    .querySelectorAll("[data-category-scroll-cue], [data-category-scroll-cue-up]")
    .forEach((cue) => {
      cue.removeAttribute("role");
      cue.removeAttribute("tabindex");
      cue.removeAttribute("aria-label");
      cue.setAttribute("aria-hidden", "true");
    });
}

function renderCategoryPicker() {
  document.querySelectorAll(".category-picker-menu").forEach((menu) => {
    const forWelcome = Boolean(menu.closest(".category-picker--welcome"));
    const scroller =
      menu.querySelector("[data-category-menu-scroll]") ||
      menu.querySelector(".category-picker-menu-scroll");
    const target = scroller || menu;
    // Keep the scroll cue sibling outside the scrolling region
    if (scroller) {
      scroller.innerHTML = buildCategoryPickerMenuMarkup({ forWelcome });
    } else {
      menu.innerHTML = buildCategoryPickerMenuMarkup({ forWelcome });
    }
    bindCategoryPickerMenu(menu, { forWelcome });
    bindCategoryMenuScrollHints(menu);
    // Measure after paint when open; harmless when hidden
    requestAnimationFrame(() => updateCategoryMenuScrollHints(menu));
  });
}

/**
 * First-run: picking a language *is* entering the app (no Start button).
 * Full portal ceremony (visual + haptic + sound) - then land in Review.
 *
 * Order matters: paint the portal veil first, then swap app state under it,
 * so Review never flashes before the ceremony covers the screen.
 */
function completeWelcomeWithLanguage(categoryId) {
  const nextCategory = getCategoryById(categoryId);
  if (!nextCategory?.available) return;

  // Same user-gesture turn as the pick: unlock audio so the portal can chime on mobile.
  unlockAudioPipeline();
  void ensureUiAudioReady();
  closeCategoryMenu();

  // 1) Cover the screen immediately (sync solid veil + start music/beats)
  announceWelcomeEnter(nextCategory);

  // Force a layout pass so the portal is painted before we drop the welcome gate
  const portal = document.getElementById("track-switch-overlay");
  if (portal) void portal.offsetHeight;

  // 2) Swap language + land on Review underneath the solid portal cover
  if (categoryId !== activeCategoryId) {
    applyCategorySwitch(categoryId, { announce: false });
  } else {
    setActiveCategoryId(categoryId);
    renderAll();
  }

  // 3) Drop the welcome gate only after the ceremony is already covering
  closeWelcomeModal(true);
  try {
    switchTab("practice");
  } catch {
    /* keep safe */
  }
  // Keep html.needs-welcome until the portal ends so Review stays hidden if
  // anything peeks around the ceremony card. Cleared in scheduleTrackSwitchOverlayEnd.
}

/**
 * Progress language menu: land on the currently selected language
 * (centered when possible) instead of always starting at the top.
 * Welcome menu has no current pick - stays at top.
 */
function scrollCategoryMenuToActive(menu) {
  if (!menu || menu.closest(".category-picker--welcome")) return;
  const scroller =
    menu.querySelector("[data-category-menu-scroll]") ||
    menu.querySelector(".category-picker-menu-scroll");
  if (!scroller) return;
  const active =
    menu.querySelector('.category-option.active[aria-selected="true"]') ||
    menu.querySelector(".category-option.active");
  if (!active) {
    scroller.scrollTop = 0;
    return;
  }

  const scrollerRect = scroller.getBoundingClientRect();
  const activeRect = active.getBoundingClientRect();
  // Position of active relative to scroller content
  const activeOffset =
    activeRect.top - scrollerRect.top + scroller.scrollTop;
  const target =
    activeOffset - scroller.clientHeight / 2 + active.offsetHeight / 2;
  const maxScroll = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
  scroller.scrollTop = Math.max(0, Math.min(target, maxScroll));
}

/**
 * Cap the open language menu to remaining viewport space so all languages
 * stay reachable (welcome gate + Progress language chip).
 * Prefer opening downward; flip upward when more room above the button.
 * Progress uses position:fixed so page scroll / parent overflow never clips it.
 */
function fitCategoryMenuToViewport(menu, btn) {
  if (!menu || !btn) return;
  const gap = 8;
  const edgePad = 12;
  const hardCap = 28 * 16; // 28rem
  const rect = btn.getBoundingClientRect();
  const vv = window.visualViewport;
  const vh = vv?.height || document.documentElement.clientHeight || window.innerHeight;
  const vOffsetTop = vv?.offsetTop || 0;
  const viewTop = vOffsetTop;
  const viewBottom = vOffsetTop + vh;
  const roomBelow = Math.max(0, viewBottom - rect.bottom - gap - edgePad);
  const roomAbove = Math.max(0, rect.top - viewTop - gap - edgePad);
  // Flip up when below is tight (short screens / Progress scrolled mid-page)
  const openUp = roomBelow < 14 * 16 && roomAbove > roomBelow + 16;
  const room = openUp ? roomAbove : roomBelow;
  const maxH = Math.max(9 * 16, Math.min(hardCap, room));
  const maxHpx = `${Math.round(maxH)}px`;

  const forProgress = Boolean(menu.closest(".category-picker--progress"));
  menu.classList.toggle("is-open-up", openUp);
  menu.style.maxHeight = maxHpx;

  if (forProgress) {
    // Fixed to the viewport so the list is never clipped by main/panel scroll.
    const menuWidth = Math.min(
      14 * 16,
      Math.max(rect.width, Math.min(14 * 16, window.documentElement.clientWidth - 1.25 * 16))
    );
    let left = rect.left;
    const maxLeft = document.documentElement.clientWidth - menuWidth - edgePad;
    left = Math.max(edgePad, Math.min(left, maxLeft));

    menu.style.position = "fixed";
    menu.style.left = `${Math.round(left)}px`;
    menu.style.right = "auto";
    menu.style.width = `${Math.round(menuWidth)}px`;
    menu.style.minWidth = `${Math.round(menuWidth)}px`;
    menu.style.maxWidth = `${Math.round(menuWidth)}px`;
    menu.style.transform = "none";
    menu.style.zIndex = "60";
    if (openUp) {
      menu.style.top = "auto";
      menu.style.bottom = `${Math.round(vh - (rect.top - vOffsetTop) + gap)}px`;
    } else {
      menu.style.top = `${Math.round(rect.bottom - vOffsetTop + gap)}px`;
      menu.style.bottom = "auto";
    }
    return;
  }

  // Welcome (and any other absolute menus): keep in-flow under the control.
  menu.style.position = "";
  menu.style.left = "";
  menu.style.right = "";
  menu.style.width = "";
  menu.style.minWidth = "";
  menu.style.maxWidth = "";
  menu.style.transform = "";
  menu.style.zIndex = "";
  if (openUp) {
    menu.style.top = "auto";
    menu.style.bottom = "calc(100% + 0.45rem)";
  } else {
    menu.style.top = "";
    menu.style.bottom = "";
  }
}

function clearCategoryMenuViewportFit(menu) {
  if (!menu) return;
  menu.style.maxHeight = "";
  menu.style.top = "";
  menu.style.bottom = "";
  menu.style.position = "";
  menu.style.left = "";
  menu.style.right = "";
  menu.style.width = "";
  menu.style.minWidth = "";
  menu.style.maxWidth = "";
  menu.style.transform = "";
  menu.style.zIndex = "";
  menu.classList.remove("is-open-up");
}

function openCategoryMenu(btn) {
  const picker = btn?.closest(".category-picker");
  const menu = picker?.querySelector(".category-picker-menu");
  if (!btn || !menu) return;
  // First half of the switch gesture - unlock audio so the pick can chime on mobile.
  unlockAudioPipeline();
  void ensureUiAudioReady();
  categoryMenuOpen = true;
  btn.setAttribute("aria-expanded", "true");
  menu.classList.remove("hidden");

  const forWelcome = Boolean(picker?.classList.contains("category-picker--welcome"));
  const scroller =
    menu.querySelector("[data-category-menu-scroll]") ||
    menu.querySelector(".category-picker-menu-scroll");

  // Welcome: start at top. Progress: jump to current language after layout.
  if (scroller && forWelcome) scroller.scrollTop = 0;

  // Size to remaining viewport *before* scroll hints so overflow is real.
  fitCategoryMenuToViewport(menu, btn);

  requestAnimationFrame(() => {
    fitCategoryMenuToViewport(menu, btn);
    if (!forWelcome) scrollCategoryMenuToActive(menu);
    updateCategoryMenuScrollHints(menu);
    // Second frame: fonts/layout settled (esp. mobile)
    requestAnimationFrame(() => {
      fitCategoryMenuToViewport(menu, btn);
      if (!forWelcome) scrollCategoryMenuToActive(menu);
      updateCategoryMenuScrollHints(menu);
    });
  });
}

function closeCategoryMenu() {
  categoryMenuOpen = false;
  document.querySelectorAll(".category-picker-btn").forEach((btn) => {
    btn.setAttribute("aria-expanded", "false");
  });
  document.querySelectorAll(".category-picker-menu").forEach((menu) => {
    menu.classList.add("hidden");
    menu.classList.remove("is-scrollable", "has-more-below", "has-more-above");
    clearCategoryMenuViewportFit(menu);
  });
}

function refitOpenCategoryMenu() {
  if (!categoryMenuOpen) return;
  const btn = document.querySelector(
    '.category-picker-btn[aria-expanded="true"]'
  );
  const menu = btn?.closest(".category-picker")?.querySelector(
    ".category-picker-menu:not(.hidden)"
  );
  if (!btn || !menu) return;
  fitCategoryMenuToViewport(menu, btn);
  updateCategoryMenuScrollHints(menu);
}

function toggleCategoryMenu(btn) {
  if (!isCategoryPickerAvailable()) return;
  const picker = btn.closest(".category-picker");
  const menu = picker?.querySelector(".category-picker-menu");
  const isOpen = Boolean(menu && !menu.classList.contains("hidden"));
  closeCategoryMenu();
  if (!isOpen) openCategoryMenu(btn);
}

function applyCategorySwitch(nextCategoryId, { announce = true } = {}) {
  const nextCategory = getCategoryById(nextCategoryId);
  if (!nextCategory?.available) return false;

  saveDeck();
  activeCategoryId = nextCategoryId;
  setActiveCategoryId(nextCategoryId);
  setSpeakMode(false);
  recognition = null;

  deck = loadDeck(nextCategoryId);
  sessionQueue = [];
  currentCard = null;
  sessionReviewed = 0;
  sessionCorrect = 0;
  sessionIncorrect = 0;
  sessionJustCompleted = false;
  clearThemePracticeSession();
  libraryFilter = "all";
  librarySearch = "";

  const searchInput = document.getElementById("library-search");
  if (searchInput) searchInput.value = "";

  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.band === "all");
  });

  readStoryId = null;
  readSentenceIndex = 0;
  readShowEnglish = false;
  readGlossSelection = null;
  readMenuOpen = false;
  readMenuStep = "trail";
  readMenuTrail = null;
  closeReadGloss();
  closeReadMenu();
  resetAddCardForm();

  closeCategoryMenu();
  sanitizeReadProgress(nextCategoryId);
  ensureReadState(true);
  startPractice();
  renderAll();
  if (announce) announceTrackSwitch(nextCategory);
  return true;
}

function switchCategory(nextCategoryId) {
  if (isWelcomeOpen()) {
    completeWelcomeWithLanguage(nextCategoryId);
    return;
  }
  if (nextCategoryId === activeCategoryId) {
    closeCategoryMenu();
    return;
  }
  applyCategorySwitch(nextCategoryId, { announce: true });
}

function renderAll() {
  rebuildReadVocabIndex();
  applyCategoryUI();
  renderCategoryPicker();
  renderPractice();
  if (document.getElementById("read-panel")?.classList.contains("active")) {
    renderReadPanel();
  }
  updateDeckCount();
  if (isCardsPanelActive()) {
    renderCardList();
  }
  renderStatsSummary();
}

function preparePracticeSession() {
  syncPracticeSessionDay();
  buildSessionQueue();

  if (sessionQueue.length === 0 && deck.length > 0) {
    const everReviewed = deck.some((card) => card.lastReviewedAt != null);
    if (!everReviewed) {
      const now = Date.now();
      deck = deck.map((card) => ({ ...card, box: 1, nextReviewAt: now }));
      saveDeck();
      buildSessionQueue();
    }
  }
}

function startPractice() {
  if (!currentCard && !sessionJustCompleted) {
    preparePracticeSession();
  }
  renderPractice();
}

function beginPracticeSession() {
  sessionJustCompleted = false;
  lastThemeSessionNote = null;
  // Leaving a theme set when starting normal Review keeps the daily spine honest.
  clearThemePracticeSession();
  const daily = ensureDailyPracticeState();
  if (
    !daily.extraMode &&
    !daily.goalMet &&
    getDailyRemainingCount(daily) === 0 &&
    getDueCards(deck).length > 0
  ) {
    refreshDailyPracticeQueue(daily);
    saveDailyPractice(daily);
  }
  preparePracticeSession();
  if (sessionQueue.length > 0) {
    nextInSession();
  }
  renderPractice();
}

function submitAnswer(options = {}) {
  const answerInput = document.getElementById("answer-input");
  const answer = answerInput?.value || "";
  if (!currentCard) return;

  if (!answer.trim()) {
    if (speakModeActive) {
      scheduleSpeakForCurrentCard();
      return;
    }
    showFeedback("Type or say your answer first.", "revealed");
    return;
  }

  ensureCardAttemptState();
  const result = evaluateAnswer(answer, currentCard, { fromSpeech: options.fromSpeech });

  if (result.correct) {
    resetCardAttempts();
    setAnswerFieldHighlight(false);
    setAnswerIncorrectState(false);
    setAnswerReceivedState(true);
    hideFeedbackExample();
    // Prefer the card's spelling when speech picked a homophone (two → to).
    if (result.matched && answerInput && normalizeAnswer(answer) !== result.matched) {
      answerInput.value = result.matched;
    }
    handleCorrect();
    showFeedback(getAnswerTargetText(currentCard), "correct");
    finishCardAndContinue(getAdvanceDelay(true, options.fromSpeech));
    return;
  }

  const answerText = getAnswerTargetText(currentCard);

  if (speakModeActive && result.near) {
    currentCardAttempts += 1;
    setAnswerFieldHighlight(true);
    setAnswerIncorrectState(false);
    hideFeedbackExample();

    if (currentCardAttempts <= MAX_CLOSE_RETRIES) {
      const triesLeft = MAX_CLOSE_RETRIES - currentCardAttempts + 1;
      showFeedback(`Try again · ${triesLeft} left`, "near");
      if (!options.fromSpeech) focusAnswerInput();
      scheduleSpeakForCurrentCard(SPEAK_RETRY_DELAY_MS);
      return;
    }
  }

  resetCardAttempts();
  setAnswerFieldHighlight(false);
  setAnswerReceivedState(false);
  setAnswerIncorrectState(true);
  handleIncorrect();
  const withExample = showIncorrectWithExample(currentCard, answerText);

  finishCardAndContinue(getAdvanceDelay(false, options.fromSpeech, { withExample }));
}

function switchTab(tabName) {
  if (isWelcomeOpen()) return;

  document.querySelectorAll(".tab").forEach((tab) => {
    const isActive = tab.dataset.tab === tabName;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", isActive);
  });

  document.querySelectorAll(".panel").forEach((panel) => {
    const isActive = panel.id === `${tabName}-panel`;
    panel.classList.toggle("active", isActive);
    panel.hidden = !isActive;
  });

  // Leaving Library collapses Packs view - don’t leave it “stuck open.”
  if (tabName !== "cards") {
    if (libraryFilter !== "all" || librarySearch) {
      librarySearch = "";
      const searchInput = document.getElementById("library-search");
      if (searchInput) searchInput.value = "";
      setLibraryFilterChip("all");
    }
    renderThematicPacks();
  }

  if (tabName !== "practice") {
    setSpeakMode(false);
    sessionJustCompleted = false;
    pausePracticeSession();
    updatePracticeFocusClass();
  }
  updateReadFocusClass();
  if (tabName === "practice") {
    startPractice();
  }
  if (tabName === "read") {
    renderReadPanel();
  } else if (readStoryId) {
    saveReadProgress();
  }
  if (tabName === "stats") renderStatsSummary();
  if (tabName === "cards") renderCardList();
  document.getElementById("library-float-actions")?.classList.add("hidden");
  document.getElementById("progress-float-actions")?.classList.add("hidden");
  if (tabName === "cards" || tabName === "stats") {
    updatePageFloatTopVisibility();
  }
  updateCategoryPickerAvailability();
}

function initEventListeners() {
  window.addEventListener("resize", refitOpenCategoryMenu, { passive: true });
  window.visualViewport?.addEventListener("resize", refitOpenCategoryMenu, {
    passive: true,
  });
  window.addEventListener("orientationchange", () => {
    requestAnimationFrame(refitOpenCategoryMenu);
  });

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });

  document.querySelectorAll("[data-tab-jump]").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tabJump));
  });

  document.getElementById("start-practice-btn")?.addEventListener("click", (e) => {
    if (e.currentTarget.disabled) return;
    const daily = ensureDailyPracticeState();
    if (daily.goalMet && !daily.extraMode) {
      enableExtraPractice();
    }
    sessionReviewed = 0;
    sessionCorrect = 0;
    sessionIncorrect = 0;
    beginPracticeSession();
  });

  document.getElementById("answer-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    submitAnswer();
  });

  document.getElementById("reveal-btn")?.addEventListener("click", () => {
    if (!currentCard) return;
    const answerText = getAnswerTargetText(currentCard);
    setAnswerReceivedState(false);
    setAnswerIncorrectState(true);
    handleIncorrect();
    const withExample = showIncorrectWithExample(currentCard, answerText);
    finishCardAndContinue(
      getAdvanceDelay(false, speakModeActive, { withExample })
    );
  });

  document.getElementById("speak-btn")?.addEventListener("click", toggleSpeakMode);

  document.getElementById("hear-btn")?.addEventListener("click", () => {
    if (!currentCard) return;
    clearSpeakScheduling();
    stopActiveRecognition();
    setListeningUI(false);
    speakPromptForCard(currentCard);
    if (speakModeActive) {
      scheduleSpeakForCurrentCard(2200);
    }
  });

  document.getElementById("voice-gender-control")?.addEventListener("click", (e) => {
    const option = e.target.closest("[data-voice-gender]");
    if (!option || !document.getElementById("voice-gender-control")?.contains(option)) return;
    setVoiceGender(option.dataset.voiceGender);
  });

  document.getElementById("add-card-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    openAddCardReview();
  });

  document.getElementById("add-card-cancel-edit")?.addEventListener("click", resetAddCardForm);

  document.getElementById("add-card-reset-fields")?.addEventListener("click", () => {
    restoreAddCardFormBaseline();
  });

  document.getElementById("add-card-edit-existing")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const cardId = e.currentTarget.dataset.cardId;
    if (!cardId) return;
    // Keep the pair the user just refined (correct EN + NB), edit the old card id.
    const seedForeign = document.getElementById("new-foreign")?.value.trim() || "";
    const seedNative = document.getElementById("new-native")?.value.trim() || "";
    closeAddCardReview();
    startEditCard(cardId, {
      seedForeign,
      seedNative,
      autoReview: true,
    });
  });

  document.getElementById("add-card-edit-review")?.addEventListener("click", () => {
    closeAddCardReview();
    document.getElementById("new-native")?.focus();
  });

  document.getElementById("add-card-review-context")?.addEventListener("click", (e) => {
    if (!e.target.closest('[data-action="apply-suggestion"]')) return;
    void applyReviewSuggestion();
  });

  document.getElementById("add-card-review-context")?.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    if (!e.target.closest('[data-action="apply-suggestion"]')) return;
    e.preventDefault();
    void applyReviewSuggestion();
  });

  document.getElementById("add-card-confirm")?.addEventListener("click", () => {
    const formForeign = document.getElementById("new-foreign")?.value.trim() || "";
    const formNative = document.getElementById("new-native")?.value.trim() || "";
    // If the form was edited after review, re-check instead of saving a stale "looks good"
    if (
      addCardReviewState &&
      (formForeign !== (addCardReviewState.foreign || "").trim() ||
        formNative !== (addCardReviewState.native || "").trim())
    ) {
      openAddCardReview();
      return;
    }
    const foreign = addCardReviewState?.foreign || formForeign;
    const native = addCardReviewState?.native || formNative;
    const duplicate = findDeckCardByForeign(foreign, editingCardId);
    if (duplicate) {
      renderAddCardReviewContext({
        foreign,
        native,
        duplicate,
        suggestedNative: addCardReviewState?.suggestedNative || null,
        suggestedForeign: addCardReviewState?.suggestedForeign || null,
        related: addCardReviewState?.related || [],
        localPair: addCardReviewState?.localPair || findLocalDeckPair(foreign, native),
      });
      return;
    }
    if (!saveLibraryCard(foreign, native)) return;
  });

  document.getElementById("new-foreign")?.addEventListener("focus", () => {
    activeSuggestField = "foreign";
    if (shouldShowAddCardSuggestions()) queueForeignSuggestions();
  });

  document.getElementById("new-foreign")?.addEventListener("input", () => {
    suppressAddCardSuggestions = false;
    activeSuggestField = "foreign";
    addCardLastEditedSide = "foreign";
    invalidateAddCardReviewIfStale();
    syncAddCardResetButton();
    queueForeignSuggestions();
  });

  document.getElementById("new-native")?.addEventListener("focus", () => {
    activeSuggestField = "native";
    if (shouldShowAddCardSuggestions()) queueNativeSuggestions();
  });

  document.getElementById("new-native")?.addEventListener("input", () => {
    suppressAddCardSuggestions = false;
    activeSuggestField = "native";
    addCardLastEditedSide = "native";
    invalidateAddCardReviewIfStale();
    syncAddCardResetButton();
    queueNativeSuggestions();
  });

  document.addEventListener("click", (e) => {
    // Don't kill suggestions when using review/edit chrome in the same form
    if (Date.now() < addCardSuppressOutsideHideUntil) return;
    if (e.target.closest(".add-card-field")) return;
    if (e.target.closest("#add-card-edit-existing")) return;
    if (e.target.closest("#add-card-review")) return;
    if (e.target.closest(".library-suggest")) return;
    if (e.target.closest(".edit-card-btn")) return;
    if (e.target.closest(".card-item")) return;
    hideLibrarySuggestions();
  });

  document.getElementById("reset-deck-btn")?.addEventListener("click", resetToStarter);

  document.getElementById("library-themes")?.addEventListener("click", (e) => {
    const studyBtn = e.target.closest("[data-pack-study]");
    if (studyBtn) {
      const packId = studyBtn.getAttribute("data-pack-study");
      if (!packId) return;
      startThemePracticeSession(packId);
      return;
    }

    const removeBtn = e.target.closest("[data-pack-remove]");
    if (removeBtn) {
      const packId = removeBtn.getAttribute("data-pack-remove");
      if (!packId) return;
      removeThematicPack(packId);
      return;
    }

    const btn = e.target.closest("[data-pack-enable]");
    if (!btn || btn.disabled) return;
    const packId = btn.getAttribute("data-pack-enable");
    if (!packId) return;
    enableThematicPack(packId);
  });

  document.getElementById("library-search")?.addEventListener("input", (e) => {
    librarySearch = e.target.value;
    renderCardList();
  });

  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const band = chip.dataset.band;
      // Tap active filter again → back to All (Themes especially felt “stuck open”).
      if (band && band === libraryFilter && band !== "all") {
        setLibraryFilterChip("all");
      } else {
        setLibraryFilterChip(band);
      }
      renderCardList();
    });
  });

  document.getElementById("library-jump")?.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-jump-section]");
    if (!chip) return;
    scrollToLibrarySection(chip.dataset.jumpSection);
  });

  document.getElementById("library-scroll-top")?.addEventListener("click", () => {
    handlePageFloatTop();
  });

  document.getElementById("progress-scroll-top")?.addEventListener("click", () => {
    handlePageFloatTop();
  });

  window.addEventListener("scroll", updatePageFloatTopVisibility, { passive: true });

  document.querySelectorAll(".category-picker-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleCategoryMenu(btn);
    });
  });

  document.addEventListener("click", (e) => {
    if (!categoryMenuOpen) return;
    if (e.target.closest(".category-picker")) return;
    closeCategoryMenu();
  });



  document.addEventListener("click", blockWelcomeBypass, true);
  document.addEventListener("touchend", blockWelcomeBypass, true);

  document.getElementById("about-open-btn")?.addEventListener("click", () => openAboutModal());
  document.getElementById("about-close-btn")?.addEventListener("click", () => closeAboutModal());
  document.getElementById("about-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "about-modal") closeAboutModal();
  });

  document.getElementById("progress-basics-btn")?.addEventListener("click", () =>
    openBasicsModal("progress-basics-btn")
  );
  document.getElementById("basics-close-btn")?.addEventListener("click", () => closeBasicsModal());
  document.getElementById("basics-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "basics-modal") closeBasicsModal();
    const speakBtn = e.target.closest("[data-speak]");
    if (speakBtn && e.currentTarget.contains(speakBtn)) {
      e.preventDefault();
      speakForeign(speakBtn.getAttribute("data-speak"));
    }
  });

  document.getElementById("daily-goal-chip")?.addEventListener("click", () => {
    // Theme set uses this chip as progress only - don't open daily-cap modal.
    if (themeSessionPackId) return;
    openGoalCapModal();
  });
  document.getElementById("goal-cap-modal")?.addEventListener("click", (e) => {
    // Backdrop dismiss - no Close button; pick a number or tap away / Escape.
    if (e.target.id === "goal-cap-modal") closeGoalCapModal();
  });
  document.getElementById("goal-cap-options")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-goal-cap]");
    if (!btn) return;
    selectDailyGoalCap(Number(btn.dataset.goalCap));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const basics = document.getElementById("basics-modal");
      if (basics && !basics.classList.contains("hidden")) {
        closeBasicsModal();
        return;
      }
      const welcome = document.getElementById("welcome-modal");
      if (welcome && !welcome.classList.contains("hidden")) return;
      if (isGoalCapOpen()) {
        closeGoalCapModal();
        return;
      }
      const about = document.getElementById("about-modal");
      if (about && !about.classList.contains("hidden")) {
        closeAboutModal();
        return;
      }
      closeCategoryMenu();
      closeReadGloss();
      closeReadMenu();
      if (addCardReviewOpen) {
        closeAddCardReview();
      } else if (editingCardId) {
        resetAddCardForm();
        renderCardList();
      } else {
        hideLibrarySuggestions();
      }
    }
  });

  document.addEventListener("click", (e) => {
    if (readMenuOpen && !e.target.closest(".read-header")) closeReadMenu();
  });

  document.getElementById("read-focus-nb")?.addEventListener("click", (e) => {
    const button = e.target.closest("[data-read-word]");
    if (!button) return;
    openReadGloss(button);
  });

  document.getElementById("read-prev-btn")?.addEventListener("click", () => navigateReadSentence(-1));
  document.getElementById("read-next-btn")?.addEventListener("click", () => navigateReadSentence(1));

  document.getElementById("read-toggle-en")?.addEventListener("click", () => {
    readShowEnglish = !readShowEnglish;
    updateReadEnglishToggle();
    saveReadProgress();
  });

  document.getElementById("read-empty-browse")?.addEventListener("click", () => {
    const stories = getStoriesForCategory();
    if (!stories.length) return;
    // Prefer a real story view if one can load
    ensureReadState(true);
    const story = getActiveReadStory();
    if (story?.sentences?.length) {
      setReadEmptyVisible(false);
      renderReadPanel();
      openReadMenu(true);
      return;
    }
    openReadMenu(true);
  });

  document.getElementById("read-hear-sentence")?.addEventListener("click", () => {
    const story = getActiveReadStory();
    if (!story) return;
    speakForeign(sentenceForeignText(story.sentences[readSentenceIndex]));
  });

  document.getElementById("read-trail-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (readMenuOpen && readMenuStep === "trail") closeReadMenu();
    else openReadMenu(true);
  });

  document.getElementById("read-story-select")?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (readMenuOpen && readMenuStep === "stories") closeReadMenu();
    else openReadMenu(false);
  });

  document.getElementById("read-menu")?.addEventListener("click", (e) => {
    e.stopPropagation();
    const trailBtn = e.target.closest("[data-read-trail]");
    if (trailBtn) {
      selectReadTrail(trailBtn.dataset.readTrail);
      return;
    }
    const storyBtn = e.target.closest("[data-story-id]");
    if (storyBtn) {
      switchReadStory(storyBtn.dataset.storyId);
      return;
    }
    if (e.target.closest("[data-read-menu-back]")) {
      readMenuStep = "trail";
      readMenuTrail = null;
      renderReadMenu();
    }
  });

  document.getElementById("read-progress-stats")?.addEventListener("click", (e) => {
    const resetBtn = e.target.closest("[data-reset-story-id]");
    if (resetBtn) {
      resetStoryReadProgress(resetBtn.dataset.resetStoryId);
      return;
    }
    const btn = e.target.closest("[data-open-story-id]");
    if (!btn) return;
    openReadStoryFromProgress(btn.dataset.openStoryId);
  });

  document.getElementById("reset-all-stories-btn")?.addEventListener("click", () => {
    resetAllStoriesReadProgress();
  });

  document.getElementById("read-reset-btn")?.addEventListener("click", () => {
    if (readStoryId) resetStoryReadProgress(readStoryId);
  });

}

function formatConfirmFallback(content) {
  if (typeof content === "string") return content;
  const { verb, storyTitle, note } = content;
  const lead = `${verb} ${storyTitle} ?`;
  return note ? `${lead}\n${note}` : lead;
}

function renderConfirmMessage(messageEl, content) {
  if (!messageEl) return;

  if (typeof content === "string") {
    messageEl.textContent = content;
    return;
  }

  const { verb, storyTitle, note } = content;
  messageEl.innerHTML = `<span class="confirm-story-title">${escapeHtml(verb)}</span> <span class="confirm-story-title">${escapeHtml(storyTitle)}</span> ?${
    note
      ? `<span class="confirm-message-note">${escapeHtml(note)}</span>`
      : ""
  }`;
}

function showConfirm(content, { confirmLabel = "OK", cancelLabel = "Cancel", compact } = {}) {
  const modal = document.getElementById("confirm-modal");
  const messageEl = document.getElementById("confirm-message");
  const cardEl = modal?.querySelector(".confirm-card");
  const okBtn = document.getElementById("confirm-ok-btn");
  const cancelBtn = document.getElementById("confirm-cancel-btn");
  const isCompact = compact ?? typeof content === "string";

  if (!modal || !messageEl || !okBtn || !cancelBtn) {
    return Promise.resolve(window.confirm(formatConfirmFallback(content)));
  }

  return new Promise((resolve) => {
    renderConfirmMessage(messageEl, content);
    okBtn.textContent = confirmLabel;
    cancelBtn.textContent = cancelLabel;
    cardEl?.classList.toggle("confirm-card--compact", isCompact);
    confirmResolve = resolve;
    modal.classList.remove("hidden");
    document.body.classList.add("modal-open");
    cancelBtn.focus();
  });
}

function closeConfirm(result) {
  const modal = document.getElementById("confirm-modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.querySelector(".confirm-card")?.classList.remove("confirm-card--compact");
  }

  const welcomeOpen = !document.getElementById("welcome-modal")?.classList.contains("hidden");
  if (!welcomeOpen) document.body.classList.remove("modal-open");

  if (confirmResolve) {
    confirmResolve(result);
    confirmResolve = null;
  }
}

function initConfirmModal() {
  document.getElementById("confirm-ok-btn")?.addEventListener("click", () => closeConfirm(true));
  document.getElementById("confirm-cancel-btn")?.addEventListener("click", () => closeConfirm(false));
  document.getElementById("confirm-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "confirm-modal") closeConfirm(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const modal = document.getElementById("confirm-modal");
    if (modal && !modal.classList.contains("hidden")) closeConfirm(false);
  });
}

function isAboutOpen() {
  const modal = document.getElementById("about-modal");
  return Boolean(modal && !modal.classList.contains("hidden"));
}

function isGoalCapOpen() {
  const modal = document.getElementById("goal-cap-modal");
  return Boolean(modal && !modal.classList.contains("hidden"));
}

function openGoalCapModal() {
  if (isWelcomeOpen() || isAboutOpen()) return;
  const modal = document.getElementById("goal-cap-modal");
  if (!modal) return;
  const cap = getDailyPracticeCap();
  modal.querySelectorAll("[data-goal-cap]").forEach((btn) => {
    const value = Number(btn.dataset.goalCap);
    const selected = value === cap;
    btn.classList.toggle("is-selected", selected);
    btn.setAttribute("aria-checked", selected ? "true" : "false");
  });
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  const selectedBtn =
    modal.querySelector("[data-goal-cap].is-selected") ||
    modal.querySelector("[data-goal-cap]");
  selectedBtn?.focus({ preventScroll: true });
}

function closeGoalCapModal() {
  const modal = document.getElementById("goal-cap-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  if (!isWelcomeOpen() && !isAboutOpen()) {
    const confirmOpen = !document.getElementById("confirm-modal")?.classList.contains("hidden");
    if (!confirmOpen) document.body.classList.remove("modal-open");
  }
  document.getElementById("daily-goal-chip")?.focus({ preventScroll: true });
}

function openAboutModal() {
  if (isWelcomeOpen()) return;
  closeBasicsModal({ restoreFocus: false });
  const modal = document.getElementById("about-modal");
  if (!modal) return;
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  document.getElementById("about-close-btn")?.focus({ preventScroll: true });
}

function closeAboutModal(options = {}) {
  const { restoreFocus = true } = options;
  const modal = document.getElementById("about-modal");
  if (!modal) return;
  const wasOpen = !modal.classList.contains("hidden");
  modal.classList.add("hidden");
  if (!isWelcomeOpen() && !isBasicsOpen()) {
    const confirmOpen = !document.getElementById("confirm-modal")?.classList.contains("hidden");
    if (!confirmOpen) document.body.classList.remove("modal-open");
  }
  if (restoreFocus && wasOpen) {
    document.getElementById("about-open-btn")?.focus({ preventScroll: true });
  }
}

/** @type {string | null} */
let basicsReturnFocusId = null;

function isBasicsOpen() {
  const modal = document.getElementById("basics-modal");
  return Boolean(modal && !modal.classList.contains("hidden"));
}

function renderLanguageBasics(category = getActiveCategory()) {
  const body = document.getElementById("basics-body");
  if (!body) return;

  const data =
    typeof window !== "undefined" ? window.LANGUAGE_BASICS?.[category.id] : null;
  if (!data?.sections?.length) {
    body.innerHTML = `<p class="basics-empty">Basics coming soon for ${escapeHtml(
      category.label || "this language"
    )}.</p>`;
    return;
  }

  const sectionsHtml = data.sections
    .map((section, sectionIndex) => {
      const titleId = `basics-section-${sectionIndex}`;
      const listClass = section.compact
        ? "basics-sound-list basics-sound-list--compact"
        : "basics-sound-list";
      const items = (section.items || [])
        .map((item) => {
          const speak = item.speak || item.glyph || "";
          // Packs may use glyphClass ("basics-glyph--pair"); older data uses glyphSize.
          const sizeClass = basicsGlyphSizeClass(item);
          const examples = (item.examples || [])
            .map((ex) => {
              const word = ex.text || ex.speak || "";
              const gloss = ex.gloss != null ? String(ex.gloss) : "";
              const glossHtml = gloss
                ? `<span class="basics-example-gloss">${escapeHtml(gloss)}</span>`
                : "";
              return `<span class="basics-example">
                <button type="button" class="basics-word" data-speak="${escapeAttr(
                  ex.speak || word
                )}">${escapeHtml(word)}</button>${glossHtml}
              </span>`;
            })
            .join("");
          return `
            <li class="basics-sound-row">
              <button type="button" class="basics-glyph${sizeClass}" data-speak="${escapeAttr(
                speak
              )}" aria-label="Hear ${escapeAttr(item.glyph || speak)}">${escapeHtml(
                item.glyph || speak
              )}</button>
              <div class="basics-sound-copy">
                <p class="basics-sound-approx">${item.approxHtml || ""}</p>
                ${
                  examples
                    ? `<div class="basics-sound-examples">${examples}</div>`
                    : ""
                }
              </div>
            </li>`;
        })
        .join("");
      return `
        <section class="basics-section" aria-labelledby="${titleId}">
          <h3 class="basics-section-title" id="${titleId}">${escapeHtml(section.title || "")}</h3>
          <ul class="${listClass}">${items}</ul>
        </section>`;
    })
    .join("");

  body.innerHTML = sectionsHtml;
}

function openBasicsModal(returnFocusId) {
  if (isWelcomeOpen()) return;
  if (!hasLanguageBasics()) return;
  closeAboutModal({ restoreFocus: false });
  const modal = document.getElementById("basics-modal");
  if (!modal) return;
  basicsReturnFocusId = returnFocusId || "progress-basics-btn";
  const category = getActiveCategory();
  const title = document.getElementById("basics-title");
  if (title) {
    title.textContent = category?.label || "Basics";
  }
  const flagEl = document.getElementById("basics-hero-flag");
  if (flagEl) {
    flagEl.textContent = category?.flag || "🏳️";
  }
  modal.setAttribute(
    "aria-label",
    `Letters and sounds for ${category?.label || "this language"}`
  );
  renderLanguageBasics(category);
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  document.getElementById("basics-close-btn")?.focus({ preventScroll: true });
}

function closeBasicsModal(options = {}) {
  const { restoreFocus = true } = options;
  const modal = document.getElementById("basics-modal");
  if (!modal || modal.classList.contains("hidden")) return;
  modal.classList.add("hidden");
  stopAllSpeech();
  if (!isWelcomeOpen()) {
    const aboutOpen = !document.getElementById("about-modal")?.classList.contains("hidden");
    const confirmOpen = !document.getElementById("confirm-modal")?.classList.contains("hidden");
    if (!aboutOpen && !confirmOpen) document.body.classList.remove("modal-open");
  }
  if (restoreFocus) {
    const focusId = basicsReturnFocusId || "progress-basics-btn";
    document.getElementById(focusId)?.focus({ preventScroll: true });
  }
  basicsReturnFocusId = null;
}

function showWelcomeModal() {
  const modal = document.getElementById("welcome-modal");
  if (!modal) return;
  renderCategoryPicker();
  // Never pre-fill - picking a language is the only way in.
  const welcomeLabel = modal.querySelector("[data-welcome-language-label]");
  if (welcomeLabel) welcomeLabel.textContent = "Choose a Language";
  const welcomeBtn = document.getElementById("welcome-language-btn");
  if (welcomeBtn) {
    welcomeBtn.setAttribute("aria-label", "Choose a Language");
  }
  modal.classList.remove("hidden");
  setWelcomeGateActive(true);
  updateCategoryPickerAvailability();
  welcomeBtn?.focus({ preventScroll: true });
  // Warm portal assets so the first pick can cover the screen without waiting
  void loadWelcomePortalBeatmap();
  try {
    document.getElementById("welcome-portal-audio")?.load?.();
  } catch {
    /* ignore */
  }
}

function closeWelcomeModal(markSeen = true) {
  const modal = document.getElementById("welcome-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  setWelcomeGateActive(false);
  updateCategoryPickerAvailability();
  if (markSeen) {
    try {
      localStorage.setItem(WELCOME_SEEN_KEY, "1");
    } catch {
      // storage blocked
    }
  }
  // Only reveal the app shell once the portal is covering, or when no portal is up.
  // (Portal end handler also clears needs-welcome.)
  const portal = document.getElementById("track-switch-overlay");
  const portalCovering =
    portal &&
    !portal.classList.contains("hidden") &&
    portal.classList.contains("is-visible");
  if (!portalCovering) {
    document.documentElement.classList.remove("needs-welcome");
  }
}

function maybeShowWelcome() {
  try {
    if (localStorage.getItem(WELCOME_SEEN_KEY)) {
      document.documentElement.classList.remove("needs-welcome");
      return false;
    }
  } catch {
    // storage blocked - treat as first visit
  }
  showWelcomeModal();
  return true;
}

function bootApp() {
  try {
    const category = getActiveCategory();
    if (category.id === "nb-bokmal" && typeof NORWEGIAN_FREQUENCY_DECK === "undefined") {
      throw new Error("Deck data did not load. Check your network connection and refresh.");
    }
    const starterEntries = getStarterDeckEntries(category);
    if (!starterEntries.length) {
      throw new Error("The deck is empty.");
    }

    deck = loadDeck();
    if (!deck.length) {
      deck = ensureDeckIsUsable(buildStarterDeck());
      saveDeck();
    }

    sanitizeReadProgress();
    initConfirmModal();
    ensureAudioUnlockListeners();
    ensureSpeechVoicesListener();
    updateVoiceGenderUI();
    initEventListeners();
    startPractice();
    renderAll();
    const showedWelcome = maybeShowWelcome();
    // Returning visitors: ensure the app shell is visible even if a stale class stuck
    if (!showedWelcome) {
      document.documentElement.classList.remove("needs-welcome");
    }
  } catch (error) {
    console.error("Leitner Learning failed to start:", error);
    const main = document.querySelector("main");
    if (main) {
      main.innerHTML = `
        <section class="panel active boot-error" role="alert">
          <h2>Could not load the app</h2>
          <p>Something went wrong while starting Leitner Learning on this device.</p>
          <p class="boot-error-detail">${escapeHtml(error?.message || "Unknown error")}</p>
          <button class="btn primary" type="button" onclick="location.reload()">Try again</button>
        </section>`;
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootApp);
} else {
  bootApp();
}