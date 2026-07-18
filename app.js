const LEGACY_STORAGE_KEYS = [
  "leitner-learning-deck-v2",
  "leitner-learning-deck-v1",
  "sprakflow-deck-v1",
];
const BOX_COUNT = 6;

const BOX_INTERVALS_DAYS = [0, 1, 3, 7, 14, 30];
const DAILY_PRACTICE_CAP = 20;

const LEARNING_LEVELS = [
  { short: "New", interval: "Waiting to learn", celebration: "Nice start. Keep going." },
  { short: "Learning", interval: "Next day", celebration: "Good one." },
  { short: "Familiar", interval: "Every 3 days", celebration: "This one is sticking." },
  { short: "Known", interval: "Weekly", celebration: "Well done." },
  { short: "Confident", interval: "Every 2 weeks", celebration: "Almost there." },
  { short: "Mastered", interval: "Monthly", celebration: "You know this one." },
];

const BAND_LABELS = {
  A: "1–50 · most used",
  B: "51–100 · common",
  C: "101–160 · more words",
  D: "161–300 · building fluency",
  E: "301–500 · campus & marine",
  F: "501–750 · reading words",
  G: "751–1000 · story forms",
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

const PRACTICE_DIRECTION_KEY = "leitner-learning-practice-direction";

let activeCategoryId = getActiveCategoryId();
let practiceDirection = getPracticeDirection();
let deck = [];
let sessionQueue = [];
let sessionDayKey = "";
let currentCard = null;
let sessionReviewed = 0;
let sessionCorrect = 0;
let sessionJustCompleted = false;
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
const LIBRARY_BATCH_SIZE = 35;
const LIBRARY_SCROLL_TOP_THRESHOLD = 360;
const LIBRARY_JUMP_SHORT = {
  A: "1–50",
  B: "51–100",
  C: "101–160",
  D: "161–300",
  E: "301–500",
  F: "501–750",
  G: "751–1k",
  phrase: "Phrases",
  yours: "Yours",
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
/** Snapshot of the form before the user started typing / picking suggestions. */
let addCardFormBaseline = { foreign: "", native: "" };
let foreignSuggestTimer = null;
let nativeSuggestTimer = null;
let activeSuggestField = null;
let suppressAddCardSuggestions = false;
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
  if (category.id !== "nb-bokmal") return [];
  const entries = [...NORWEGIAN_FREQUENCY_DECK];
  if (typeof NORWEGIAN_READING_VOCAB !== "undefined" && Array.isArray(NORWEGIAN_READING_VOCAB)) {
    entries.push(...NORWEGIAN_READING_VOCAB);
  }
  return entries;
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
  return {
    id: createId(),
    foreign: foreign.trim(),
    native: native.trim(),
    box: 1,
    nextReviewAt: now,
    lastReviewedAt: null,
    correctCount: 0,
    incorrectCount: 0,
    createdAt: now,
    rank: meta.rank ?? null,
    category: meta.category ?? null,
    band: meta.band ?? null,
  };
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

function getProgressPracticeStat() {
  const daily = ensureDailyPracticeState();
  const remainingToday = getDailyRemainingCount(daily);
  const outstanding = getOutstandingDueCount(daily);
  const reviewDue = getReviewDueCards().length;
  const newDue = getDueCards().filter(
    (card) => isNewCard(card) && !daily.completedIds.includes(card.id)
  ).length;

  if (!daily.extraMode && remainingToday > 0) {
    return {
      value: remainingToday,
      label: "Left today",
      ariaLabel: `${remainingToday} card${remainingToday === 1 ? "" : "s"} left in today's review`,
      highlight: true,
      actionable: true,
    };
  }

  if (!daily.extraMode && daily.goalMet && daily.goal > 0) {
    return {
      value: `${daily.reviewed}/${daily.goal}`,
      label: "Done today",
      ariaLabel: `Completed today's goal: ${daily.reviewed} of ${daily.goal} cards reviewed`,
      highlight: false,
      actionable: false,
    };
  }

  if (reviewDue > 0) {
    return {
      value: reviewDue,
      label: "Due for review",
      ariaLabel: `Review ${reviewDue} card${reviewDue === 1 ? "" : "s"} due for review`,
      highlight: true,
      actionable: true,
    };
  }

  if (outstanding > 0) {
    const label = newDue === outstanding ? "Ready to learn" : "Due now";
    return {
      value: outstanding,
      label,
      ariaLabel: `${outstanding} card${outstanding === 1 ? "" : "s"} ${label.toLowerCase()}`,
      highlight: true,
      actionable: true,
    };
  }

  const nextReview = getNextReviewStat();
  if (nextReview) return nextReview;

  return {
    value: "✓",
    label: "Caught up",
    ariaLabel: "All caught up for now",
    highlight: false,
    actionable: false,
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
    label: atRisk ? "Keep streak" : "Day streak",
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

function computeDailyGoal(dueCount) {
  if (dueCount <= 0) return 0;
  return Math.min(dueCount, DAILY_PRACTICE_CAP);
}

function sortCardIdsByPracticePriority(cardIds, completed = new Set()) {
  const cards = cardIds
    .map((id) => deck.find((card) => card.id === id))
    .filter((card) => card && !completed.has(card.id));
  cards.sort(compareCardsForPractice);
  return cards.map((card) => card.id);
}

function buildDailyQueue(dueCards, goal) {
  if (window.SrsCore) {
    return SrsCore.buildDailyQueue(dueCards, goal, deck);
  }
  if (!goal) return [];

  return dueCards
    .slice()
    .sort(compareCardsForPractice)
    .slice(0, goal)
    .map((card) => card.id);
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
  storageSet(getDailyPracticeStorageKey(categoryId), JSON.stringify(state));
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
      const additions = window.SrsCore
        ? SrsCore.buildDailyQueue(pool, slotsOpen, deck, { excludedIds: inQueue })
        : buildDailyQueue(pool, slotsOpen);
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
  storageSet(getStreakStorageKey(categoryId), JSON.stringify(state));
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

function getAcceptedAnswers(native) {
  return native.split("/").map((part) => normalizeAnswer(part));
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

function getAnswerSpeechLang() {
  const lang = getDirectionLabels().answerLang || "en-US";
  if (String(lang).toLowerCase().startsWith("nb") || String(lang).toLowerCase().startsWith("no")) {
    return "nb";
  }
  return "en";
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
  // Type æ ø å as ae/oe/aa (or plain a/o) — works for Norwegian answers
  if (norwegianTypingMatches(user, expected)) return true;
  if (user.includes(expected) || expected.includes(user)) return true;

  const distance = Math.min(
    levenshtein(user, expected),
    levenshtein(foldNorwegianLoose(user), foldNorwegianLoose(expected))
  );
  return distance <= maxEditDistance(expected);
}

function getPracticeDirectionKey(categoryId = activeCategoryId) {
  return `${PRACTICE_DIRECTION_KEY}-${categoryId}`;
}

function getPracticeDirection(categoryId = activeCategoryId) {
  const saved = storageGet(getPracticeDirectionKey(categoryId));
  return saved === "native-to-foreign" ? "native-to-foreign" : "foreign-to-native";
}

function setPracticeDirection(direction, categoryId = activeCategoryId) {
  storageSet(getPracticeDirectionKey(categoryId), direction);
}

function isReversePractice() {
  return practiceDirection === "native-to-foreign";
}

function updateAnswerInputPlaceholder() {
  const answerInput = document.getElementById("answer-input");
  if (answerInput) answerInput.placeholder = "";
}

function getDirectionLabels(category = getActiveCategory()) {
  if (isReversePractice()) {
    return {
      promptLabel: category.reversePromptLabel || "English → " + category.label.split(" · ")[0],
      answerLang: category.reverseAnswerLang || category.speechLang || "nb-NO",
      hearTitle: category.reverseHearTitle || "Hear the prompt",
      speakTitle: category.reverseSpeakTitle || "Speak your answer",
      promptLang: category.answerLang?.split("-")[0] || "en",
      promptSpeechLang: category.nativeSpeechLang || "en-US",
    };
  }

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
  return isReversePractice() ? card.native.split("/")[0].trim() : card.foreign;
}

function getAnswerTargetText(card) {
  return isReversePractice() ? card.foreign : card.native;
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

function togglePracticeDirection() {
  practiceDirection = isReversePractice() ? "foreign-to-native" : "native-to-foreign";
  setPracticeDirection(practiceDirection);
  recognition = null;
  applyPracticeDirectionUI();
  hideFeedback();
  if (currentCard) {
    const input = document.getElementById("answer-input");
    if (input) input.value = "";
    renderPractice();
    if (speakModeActive) scheduleSpeakForCurrentCard();
  }
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
        foreign: String(card.foreign).trim(),
        native: String(card.native).trim(),
        box,
        nextReviewAt: Number.isFinite(nextReviewAt) ? nextReviewAt : now,
        lastReviewedAt: card.lastReviewedAt ? Number(card.lastReviewedAt) : null,
        correctCount: Number(card.correctCount) || 0,
        incorrectCount: Number(card.incorrectCount) || 0,
        createdAt: Number(card.createdAt) || now,
        rank: card.rank ?? null,
        category: card.category ?? null,
        band: card.band ?? null,
      };
    });
}

function mergeStarterIntoDeck(existing, category = getActiveCategory()) {
  const starter = buildStarterDeck(category);
  const byForeign = new Map();
  existing.forEach((card) => {
    byForeign.set(normalizeAnswer(card.foreign), card);
  });

  let added = false;
  const merged = [...existing];
  for (const entry of starter) {
    const key = normalizeAnswer(entry.foreign);
    if (byForeign.has(key)) continue;
    const newCard = createCard(entry.foreign, entry.native, {
      rank: entry.rank,
      category: entry.category,
      band: entry.band,
    });
    merged.push(newCard);
    byForeign.set(key, newCard);
    added = true;
  }

  if (!added) return existing;
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
        if (merged.length !== usable.length) {
          usable = ensureDeckIsUsable(merged);
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
  storageSet(getDeckStorageKey(), JSON.stringify(deck));
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
  deck = buildStarterDeck(category);
  saveDeck();
  resetDailyPractice();
  resetStreakState();
  clearReadProgress();
  sessionDayKey = "";
  sessionQueue = [];
  sessionReviewed = 0;
  sessionCorrect = 0;
  sessionJustCompleted = false;
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
    sessionJustCompleted = false;
  }
  sessionDayKey = today;
}

function buildSessionQueue() {
  syncPracticeSessionDay();
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
    currentCard = null;
    return null;
  }
  const id = sessionQueue.shift();
  currentCard = deck.find((c) => c.id === id) || null;
  return currentCard;
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
  return "Could not start the mic. Type instead.";
}

function initSpeech() {
  const SpeechRecognition = getSpeechRecognitionCtor();
  if (!SpeechRecognition) return null;

  const rec = new SpeechRecognition();
  rec.lang = getDirectionLabels().answerLang;
  rec.interimResults = false;
  rec.continuous = false;
  rec.maxAlternatives = 1;
  return rec;
}

const SPEAK_CARD_DELAY_MS = 550;
const SPEAK_RETRY_DELAY_MS = 3200;
const SPEAK_ATTEMPT_MS = 10000;
const SPEAK_ADVANCE_CORRECT_MS = 4000;
const SPEAK_ADVANCE_WRONG_MS = 5000;
const TYPING_ADVANCE_CORRECT_MS = 4500;
const TYPING_ADVANCE_WRONG_MS = 5500;
const MAX_CLOSE_RETRIES = 2;

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

  const labels = getDirectionLabels();
  btn.title = speakModeActive
    ? "Speak mode on. Tap to turn off"
    : labels.speakTitle;
}

function setListeningUI(active) {
  speakListening = active;
  updateSpeakButtonUI();
}

function stopActiveRecognition() {
  speakAttemptId += 1;
  if (!recognition) return;
  const rec = recognition;
  recognition = null;
  rec.onresult = null;
  rec.onerror = null;
  rec.onend = null;
  try {
    rec.abort();
  } catch {
    try {
      rec.stop();
    } catch {
      // ignore
    }
  }
}

function setSpeakMode(active) {
  speakModeActive = active;
  if (!active) {
    clearSpeakScheduling();
    stopActiveRecognition();
    setListeningUI(false);
  }
  updateSpeakButtonUI();
  updateAnswerInputPlaceholder();
}

function toggleSpeakMode() {
  if (speakModeActive) {
    setSpeakMode(false);
    return;
  }

  if (!window.isSecureContext || !speechRecognitionAvailable()) {
    showFeedback(getSpeechUnavailableMessage(), "revealed");
    return;
  }

  setSpeakMode(true);
  if (currentCard) scheduleSpeakForCurrentCard();
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
  if (received) input.classList.remove("near-miss");
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
  handleIncorrect();
  showFeedback(answerText, "incorrect");
  finishCardAndContinue(SPEAK_ADVANCE_WRONG_MS);
}

function beginSpeakAttempt() {
  if (!speakModeActive || !currentCard) return;
  if (!window.isSecureContext || !speechRecognitionAvailable()) {
    setSpeakMode(false);
    showFeedback(getSpeechUnavailableMessage(), "revealed");
    return;
  }

  stopActiveRecognition();
  clearSpeakAttemptTimer();

  const attemptId = ++speakAttemptId;
  recognition = initSpeech();
  if (!recognition) {
    setSpeakMode(false);
    showFeedback(getSpeechUnavailableMessage(), "revealed");
    return;
  }

  setListeningUI(true);

  recognition.onresult = (event) => {
    if (attemptId !== speakAttemptId) return;
    clearSpeakAttemptTimer();

    const transcript = event.results?.[0]?.[0]?.transcript?.trim();
    stopActiveRecognition();
    setListeningUI(false);

    if (!transcript) {
      if (speakModeActive) handleSpeakAttemptTimeout();
      return;
    }

    document.getElementById("answer-input").value = transcript;
    submitAnswer({ fromSpeech: true });
  };

  recognition.onerror = (event) => {
    if (attemptId !== speakAttemptId) return;
    clearSpeakAttemptTimer();
    stopActiveRecognition();
    setListeningUI(false);

    if (event.error === "not-allowed") {
      showFeedback(
        "Mic is blocked. Allow it for this site in Settings, or just type.",
        "revealed"
      );
      setSpeakMode(false);
      return;
    }

    if (event.error === "aborted") return;

    if (event.error === "service-not-allowed") {
      showFeedback(getSpeechUnavailableMessage(), "revealed");
      setSpeakMode(false);
      return;
    }

    if (speakModeActive) {
      handleSpeakAttemptTimeout();
      return;
    }

    showFeedback("Didn't catch that. Try again, or type it.", "revealed");
  };

  recognition.onend = () => {
    if (attemptId !== speakAttemptId) return;
    // Safari ends the session after silence; keep the attempt (and indicator) alive until timeout or result.
    try {
      recognition.start();
    } catch {
      // Already running or the attempt was cancelled — ignore.
    }
  };

  speakAttemptTimer = window.setTimeout(() => {
    if (attemptId !== speakAttemptId) return;
    handleSpeakAttemptTimeout();
  }, SPEAK_ATTEMPT_MS);

  try {
    recognition.start();
  } catch {
    clearSpeakAttemptTimer();
    stopActiveRecognition();
    setListeningUI(false);
    if (speakModeActive) {
      setSpeakMode(false);
    }
    showFeedback(getSpeechUnavailableMessage(), "revealed");
  }
}

function getAdvanceDelay(correct, fromSpeech = false) {
  if (fromSpeech || speakModeActive) {
    return correct ? SPEAK_ADVANCE_CORRECT_MS : SPEAK_ADVANCE_WRONG_MS;
  }
  return correct ? TYPING_ADVANCE_CORRECT_MS : TYPING_ADVANCE_WRONG_MS;
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

function speakText(text, lang) {
  if (!text || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.92;
  window.speechSynthesis.speak(utterance);
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

function playGoalCompleteChime() {
  const ctx = getGoalAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

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
}

function triggerGoalHaptic() {
  if (typeof navigator.vibrate === "function") {
    navigator.vibrate([14, 36, 20]);
  }
}

function celebrateGoalComplete() {
  playGoalCompleteChime();
  triggerGoalHaptic();
}

function speakPromptForCard(card) {
  const labels = getDirectionLabels();
  speakText(getPromptDisplayText(card), labels.promptSpeechLang);
}

function showFeedback(message, type) {
  const el = document.getElementById("feedback");
  el.textContent = message;
  el.className = `feedback ${type}`;
}

function hideFeedback() {
  const el = document.getElementById("feedback");
  el.textContent = "";
  el.className = "feedback is-empty";
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
    ariaLabel = "Start review",
    hint = "",
    celebrate = false,
    enabled = true,
  } = {}
) {
  powerEl?.classList.toggle("hidden", !show);
  if (hintEl) {
    hintEl.textContent = hint;
    hintEl.classList.toggle("hidden", !hint);
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
    startBtn.setAttribute("aria-label", ariaLabel);
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
  const keepBtn = document.getElementById("keep-practicing-btn");
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
  const due = getDueCards(deck);
  const remainingToday = getDailyRemainingCount(daily);
  const extraDue = getOutstandingDueCount(daily);

  function showGoalCompletePower({
    celebrate = false,
    message = "",
    showTeaser = false,
  } = {}) {
    emptyEl.classList.add("empty-state--power-complete");
    setEmptyStateActionsMode(emptyEl, iconEl, titleEl, messageEl, true);
    messageEl.classList.toggle("hidden", !message);
    if (message) messageEl.textContent = message;
    document.getElementById("empty-preview").hidden = true;
    const canKeepGoing = extraDue > 0;
    setEmptyStatePowerAction(powerEl, powerHintEl, {
      show: true,
      mode: "complete",
      ariaLabel: canKeepGoing ? "Keep reviewing" : "Done for today",
      celebrate,
      enabled: canKeepGoing,
    });
    renderPowerOnExtras({
      teaserEl: powerTeaserEl,
      readBridgeBtn,
      showTeaser,
    });
    renderHomeStatus();
  }

  if (sessionJustCompleted) {
    emptyEl.classList.add("session-complete");
    emptyEl.classList.toggle("goal-met", daily.goalMet);
    const correct =
      sessionCorrect === 1 ? "1 answer right" : `${sessionCorrect} answers right`;

    if (daily.goalMet && !daily.extraMode) {
      showGoalCompletePower({
        celebrate: true,
        message: `${correct} this round. Nice work. You're done for today.`,
      });
    } else if (remainingToday > 0) {
      setEmptyStateActionsMode(emptyEl, iconEl, titleEl, messageEl, true);
      document.getElementById("empty-preview").hidden = true;
      setEmptyStatePowerAction(powerEl, powerHintEl, {
        show: true,
        mode: "continue",
        ariaLabel: "Continue today's review",
      });
    } else {
      setEmptyStateActionsMode(emptyEl, iconEl, titleEl, messageEl, true);
      document.getElementById("empty-preview").hidden = true;
      setEmptyStatePowerAction(powerEl, powerHintEl, {
        show: true,
        mode: extraDue > 0 ? "continue" : "complete",
        ariaLabel: extraDue > 0 ? "Keep reviewing" : "Done for today",
        enabled: extraDue > 0,
      });
      renderPowerOnExtras({
        teaserEl: powerTeaserEl,
        readBridgeBtn,
      });
    }

    if (keepBtn) keepBtn.classList.add("hidden");
    renderHomeStatus();
    return;
  }

  emptyEl.classList.remove("session-complete");
  emptyEl.classList.toggle("goal-met", daily.goalMet && !daily.extraMode);

  if (hasDailyGoalRemaining(daily)) {
    const continuing = daily.reviewed > 0;
    setEmptyStateActionsMode(emptyEl, iconEl, titleEl, messageEl, true);
    document.getElementById("empty-preview").hidden = true;
    if (keepBtn) keepBtn.classList.add("hidden");
    setEmptyStatePowerAction(powerEl, powerHintEl, {
      show: true,
      mode: continuing ? "continue" : "start",
      ariaLabel: continuing ? "Continue today's review" : "Start today's review",
      enabled: true,
    });
    renderHomeStatus();
    return;
  }

  if (daily.goalMet && !daily.extraMode) {
    let goalMessage = "";
    const fullyCaughtUp = extraDue === 0;
    if (extraDue > 0) {
      goalMessage = `${extraDue} more ${
        extraDue === 1 ? "card is" : "cards are"
      } ready if you want extra practice. Or stop here and come back tomorrow.`;
    } else if (due.length > 0) {
      goalMessage =
        "You hit today's goal. Extra cards can wait until tomorrow.";
    } else {
      goalMessage = "You're all caught up. More reviews show up when they're due.";
    }
    showGoalCompletePower({
      message: fullyCaughtUp ? "" : goalMessage,
    });
    if (keepBtn) keepBtn.classList.add("hidden");
    return;
  }

  emptyEl.classList.remove("goal-met");

  if (keepBtn) keepBtn.classList.add("hidden");
  document.getElementById("empty-preview").hidden = true;
  showGoalCompletePower({
    message: "",
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
  if (event.target.closest(".welcome-card")) return;
  event.preventDefault();
  event.stopPropagation();
}

function isOnProgressTab() {
  const statsPanel = document.getElementById("stats-panel");
  return Boolean(statsPanel?.classList.contains("active") && !statsPanel.hidden);
}

function isCategoryPickerAvailable() {
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

  const onPracticeHome = !currentCard;
  const showGoal = !onPracticeHome && daily.goal > 0 && !daily.extraMode;
  const practiceMeta = document.getElementById("practice-meta");

  if (goalChip) {
    goalChip.classList.toggle("hidden", !showGoal);
    goalChip.classList.toggle("goal-met", daily.goalMet);
    if (showGoal) {
      goalChip.textContent = `${daily.reviewed}/${daily.goal}`;
    }
  }

  if (practiceMeta) {
    practiceMeta.classList.toggle("hidden", !showGoal);
  }

  if (progressBar && progressFill) {
    const showBar = daily.goal > 0 && !daily.extraMode;
    progressBar.classList.toggle("hidden", !showBar);
    if (showBar) {
      const pct = Math.min(100, Math.round((daily.reviewed / daily.goal) * 100));
      progressFill.style.width = `${pct}%`;
      progressBar.setAttribute("aria-valuenow", String(daily.reviewed));
      progressBar.setAttribute("aria-valuemax", String(daily.goal));
      progressBar.setAttribute(
        "aria-label",
        `${daily.reviewed} of ${daily.goal} cards reviewed today`
      );
    }
  }

  const emptyEl = document.getElementById("practice-empty");
  const activeEl = document.getElementById("practice-active");

  const panelLead = document.getElementById("panel-lead");

  if (!currentCard) {
    renderEmptyState();
    emptyEl.classList.remove("hidden");
    activeEl.classList.add("hidden");
    const ritualFocus =
      emptyEl.classList.contains("empty-state--actions") ||
      emptyEl.classList.contains("empty-state--power-complete");
    panelLead?.classList.toggle("hidden", ritualFocus);
    updatePracticeFocusClass();
    return;
  }

  sessionJustCompleted = false;
  emptyEl.classList.add("hidden");
  activeEl.classList.remove("hidden");
  panelLead?.classList.add("hidden");
  updatePracticeFocusClass();

  const labels = getDirectionLabels();
  const promptEl = document.getElementById("prompt-text");
  promptEl.textContent = getPromptDisplayText(currentCard);
  promptEl.lang = labels.promptLang;
  promptEl.className = "prompt norwegian";

  const categoryChip = document.getElementById("prompt-category");
  if (categoryChip) {
    categoryChip.textContent = "";
    categoryChip.classList.add("hidden");
  }

  const promptHint = document.getElementById("prompt-hint");
  if (promptHint) {
    promptHint.textContent = "";
    promptHint.classList.add("hidden");
  }

  hideFeedback();
  ensureCardAttemptState();
  setAnswerFieldHighlight(false);
  setAnswerReceivedState(false);

  const input = document.getElementById("answer-input");
  input.value = "";
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
  if (libraryFilter === "words" && !isWordBand(card.band)) return false;
  if (libraryFilter === "phrase" && card.band !== "phrase") return false;
  if (libraryFilter === "yours" && card.band) return false;

  if (!librarySearch.trim()) return true;

  const query = normalizeAnswer(librarySearch);
  const foreign = normalizeAnswer(card.foreign);
  const native = normalizeAnswer(card.native);
  return foreign.includes(query) || native.includes(query);
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
  return deck.find(
    (card) => card.id !== excludeId && normalizeAnswer(card.foreign) === key
  );
}

/** Slash glosses: "dog / hound" matches "dog". Case-insensitive. */
function glossPartsMatch(a, b) {
  if (!a || !b) return false;
  if (normalizeAnswer(a) === normalizeAnswer(b)) return true;
  if (norwegianTypingMatches(a, b)) return true;

  const partsA = String(a)
    .split("/")
    .map((part) => normalizeAnswer(part))
    .filter(Boolean);
  const partsB = String(b)
    .split("/")
    .map((part) => normalizeAnswer(part))
    .filter(Boolean);

  for (const left of partsA) {
    for (const right of partsB) {
      if (left === right || norwegianTypingMatches(left, right)) return true;
    }
  }
  return false;
}

/** resume ≈ resumes, box ≈ boxes (simple English inflection, not full stemming). */
function englishInflectionMatch(a, b) {
  const x = normalizeAnswer(a);
  const y = normalizeAnswer(b);
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
 */
function withinOneEdit(a, b) {
  const s = normalizeAnswer(a);
  const t = normalizeAnswer(b);
  if (!s || !t || s === t) return s === t;
  if (s.includes(" ") || t.includes(" ")) return false;
  if (s.length < 5 || t.length < 5) return false;
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

/**
 * Soft match for suggestions/review: case, æ/ø/å typing, slash glosses,
 * simple plurals, and one-letter typos on longer words.
 */
function softGlossMatch(a, b) {
  if (!a || !b) return false;
  if (glossPartsMatch(a, b)) return true;

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
      if (englishInflectionMatch(left, right)) return true;
      if (withinOneEdit(left, right)) return true;
      if (norwegianTypingMatches(left, right)) return true;
    }
  }
  return false;
}

/**
 * Light display polish only. Do NOT uppercase normal words (god → GOD was wrong).
 * Only promote true consonant-only acronyms: cv → CV, pdf → PDF.
 */
function preferDisplayForm(text) {
  const cleaned = cleanTranslationCandidate(text);
  if (!cleaned) return cleaned;
  if (/^[a-z]{2,4}$/.test(cleaned) && !/[aeiouyæøåäöü]/i.test(cleaned)) {
    return cleaned.toUpperCase();
  }
  return cleaned;
}

function suggestionMatchScore(query, foreign, native) {
  const q = normalizeAnswer(query);
  if (!q) return 0;

  const scoreSide = (sideRaw) => {
    const side = normalizeAnswer(sideRaw);
    if (!side) return 0;
    if (side === q) return 100;
    if (softGlossMatch(sideRaw, query) || softGlossMatch(side, q)) return 92;
    if (side.startsWith(q)) return 80;
    const words = side.split(" ");
    if (words.some((word) => word === q)) return 70;
    if (words.some((word) => englishInflectionMatch(word, q) || withinOneEdit(word, q))) return 68;
    if (words.some((word) => word.startsWith(q))) return 55;
    // Avoid flooding on 1–2 letter mid-word hits (en, er, to…)
    if (q.length >= 3 && side.includes(q)) return 30;
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

  const entries = getStarterDeckEntries().map((entry) => ({
    foreign: entry.foreign,
    native: entry.native,
    rank: entry.rank,
    meta: "In starter deck",
    selectable: true,
  }));

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
      meta: "In your library",
      selectable: true,
    }));

  return rankSuggestionEntries(entries, query, limit);
}

/** Prefer curated deck pairs over machine translation for review. */
function findLocalDeckPair(foreign, native) {
  const candidates = [];

  getStarterDeckEntries().forEach((entry) => {
    candidates.push({
      foreign: entry.foreign,
      native: entry.native,
      meta: "In starter deck",
      source: "starter",
    });
  });

  deck.forEach((card) => {
    if (card.id === editingCardId) return;
    candidates.push({
      foreign: card.foreign,
      native: card.native,
      meta: "In your library",
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
  return text
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .replace(/,+\s*$/, "")
    .trim();
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
 * Rank translation memory hits. Not spell-correcting Norwegian — picking among API candidates.
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
    // great: god and flott often tie at 0.99 — slight preference for a fuller everyday gloss
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

  // For short sources, lightly prefer neural MT over dusty TM junk — but only as a tie-break
  if (sourceWordCount <= 2 && entry.fromMachine) score += 0.01;

  return score;
}

function pickBestTranslationSuggestion(data, sourceText, toLang = "en") {
  const source = sourceText.trim();
  const wordCount = source.split(/\s+/).filter(Boolean).length;
  const candidates = [];
  const targetLang = toMyMemoryLangCode(toLang);

  const primary = data.responseData?.translatedText;
  if (primary) {
    candidates.push({
      text: primary,
      match: Number(data.responseData?.match) || 0,
      fromMachine: false,
      target: "",
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
      });
    });
  }

  // Idioms / long slang: demand higher confidence or skip the suggestion
  const minMatch = wordCount >= 3 ? 0.72 : wordCount === 2 ? 0.55 : 0.45;

  const cleaned = candidates
    .map((entry) => ({ ...entry, text: cleanTranslationCandidate(entry.text) }))
    .filter((entry) => entry.text && !isGarbageTranslation(entry.text, source))
    // Do NOT drop loanwords that match the source (super → Super / super).
    // Old filter required text ≠ source and hid valid shared words.
    .filter((entry) => entry.match >= minMatch || (!entry.fromMachine && entry.match >= 0.35));

  // Dedupe by normalized text, keep the best raw match per form
  const byText = new Map();
  cleaned.forEach((entry) => {
    const key = normalizeAnswer(entry.text);
    const prev = byText.get(key);
    if (!prev || entry.match > prev.match) byText.set(key, entry);
  });
  const unique = [...byText.values()];

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

async function fetchTranslationSuggestion(text, fromLang, toLang) {
  const trimmed = text.trim();
  if (!trimmed || !shouldRequestTranslation(trimmed)) return null;

  const from = toMyMemoryLangCode(fromLang);
  const to = toMyMemoryLangCode(toLang);
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${encodeURIComponent(`${from}|${to}`)}`;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.responseStatus !== 200) return null;
    const picked = pickBestTranslationSuggestion(data, trimmed, to);
    if (!picked || looksLikeGibberish(picked)) return null;
    // Refuse absurd compressions: resumekeieie → CV-en (API guessing from a stem)
    const sourceCompact = normalizeAnswer(trimmed).replace(/\s+/g, "");
    const pickedCompact = normalizeAnswer(picked).replace(/\s+/g, "");
    if (
      sourceCompact.length >= 9 &&
      pickedCompact.length <= 6 &&
      sourceCompact.length >= pickedCompact.length * 2
    ) {
      return null;
    }
    return picked;
  } catch {
    return null;
  }
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
  suppressAddCardSuggestions = true;
  hideLibrarySuggestions();
}

function shouldShowAddCardSuggestions() {
  return !suppressAddCardSuggestions;
}

function renderSuggestionOption(item, index) {
  const meta = item.meta ? `<span class="library-suggest-option-meta">${escapeHtml(item.meta)}</span>` : "";
  const foreign = `<span class="library-suggest-option-foreign" lang="${getActiveCategory().foreignLang || "nb"}">${escapeHtml(item.foreign)}</span>`;
  const native = `<span class="library-suggest-option-native">${escapeHtml(item.native)}</span>`;

  if (item.selectable) {
    return `
      <button
        type="button"
        class="library-suggest-option is-selectable"
        data-suggest-index="${index}"
        role="option"
      >
        ${meta}${foreign}${native}
      </button>`;
  }

  return `
    <div class="library-suggest-option is-info" role="listitem" aria-disabled="true">
      ${meta}${foreign}${native}
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

  getStarterSuggestions(query, 4).forEach(addSuggestion);
  getLibrarySuggestions(query, 4).forEach(addSuggestion);

  // Don't advertise a "translation" of keyboard mash — it only creates false confidence later.
  if (shouldRequestTranslation(query)) {
    const { foreignCode, nativeCode } = getCategoryLanguageCodes();
    const translated = await fetchTranslationSuggestion(query, foreignCode, nativeCode);
    if (translated && activeSuggestField === "foreign" && input.value.trim() === query) {
      addSuggestion({
        foreign: query,
        native: translated,
        meta: "Suggested translation",
        selectable: true,
      });
    }
  }

  renderSuggestionList(container, suggestions.slice(0, 6), (item) => {
    document.getElementById("new-foreign").value = item.foreign;
    document.getElementById("new-native").value = item.native;
    syncAddCardResetButton();
    document.getElementById("new-foreign")?.focus();
  });
}

async function updateNativeSuggestions() {
  const input = document.getElementById("new-native");
  const container = document.getElementById("native-suggestions");
  if (!input || !container || activeSuggestField !== "native" || !shouldShowAddCardSuggestions()) return;

  const query = input.value.trim();
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

  getStarterSuggestions(query, 4).forEach(addSuggestion);
  getLibrarySuggestions(query, 4).forEach(addSuggestion);

  if (shouldRequestTranslation(query)) {
    const { foreignCode, nativeCode } = getCategoryLanguageCodes();
    const translated = await fetchTranslationSuggestion(query, nativeCode, foreignCode);
    if (translated && activeSuggestField === "native" && input.value.trim() === query) {
      addSuggestion({
        foreign: translated,
        native: query,
        meta: "Suggested translation",
        selectable: true,
      });
    }
  }

  renderSuggestionList(container, suggestions.slice(0, 6), (item) => {
    document.getElementById("new-foreign").value = item.foreign;
    document.getElementById("new-native").value = item.native;
    syncAddCardResetButton();
    document.getElementById("new-foreign")?.focus();
  });
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
  if (confirmBtn) confirmBtn.textContent = editing ? "Save changes" : "Add to library";
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
    // Skip weak mid-string hits (great → great-grandmother) — only clear relatives
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

  // Last 5 letters all vowels — "…keieie" (not "…poeia" in onomatopoeia)
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
      title: "Looks like nonsense",
      copy: "Neither side looks like a real word. Fix the text before adding, or only add it if you really mean to.",
    };
  }

  // Only ever suggest a fix FROM the side that looks real — never "translate" mash into approval.
  if (foreignGibberish) {
    if (suggestedForeign && !looksLikeGibberish(suggestedForeign)) {
      return {
        matches: false,
        targetField: "foreign",
        suggestedValue: suggestedForeign,
        title: `${learningName} looks like nonsense`,
        copy: `“${suggestedForeign}” is a normal ${learningName} for the English you typed. Tap to use it, or rewrite the ${learningName} yourself.`,
      };
    }
    return {
      matches: false,
      targetField: null,
      suggestedValue: null,
      title: `${learningName} looks like nonsense`,
      copy: `That doesn’t look like real ${learningName}. Rewrite it before adding — a translation tool will still “match” pure gibberish if you let it.`,
    };
  }

  if (nativeGibberish) {
    if (suggestedNative && !looksLikeGibberish(suggestedNative)) {
      return {
        matches: false,
        targetField: "native",
        suggestedValue: suggestedNative,
        title: "English looks like nonsense",
        copy: `“${suggestedNative}” is a common English for the ${learningName} you typed. Tap to use it, or rewrite the English yourself.`,
      };
    }
    return {
      matches: false,
      targetField: null,
      suggestedValue: null,
      title: "English looks like nonsense",
      copy: "That doesn’t look like real English. Rewrite it before adding.",
    };
  }

  return null;
}

function getTranslationReviewSummary(foreign, native, suggestedNative, suggestedForeign, localPair = null) {
  const learningName = getActiveCategory().learningLanguageName || "Norwegian";
  const foreignWords = foreign.trim().split(/\s+/).filter(Boolean).length;
  const nativeWords = native.trim().split(/\s+/).filter(Boolean).length;
  // 2+ words is already idiom/phrase territory for MT
  const isPhrase = foreignWords >= 2 || nativeWords >= 2;
  const where = localPair?.source === "library" ? "your library" : "the starter deck";

  const foreignGibberish = looksLikeGibberish(foreign);
  const nativeGibberish = looksLikeGibberish(native);

  // Never treat a translation OF mash as evidence that mash is fine.
  const safeSuggestedNative =
    foreignGibberish || looksLikeGibberish(suggestedNative) ? null : suggestedNative;
  const safeSuggestedForeign =
    nativeGibberish || looksLikeGibberish(suggestedForeign) ? null : suggestedForeign;

  const makePairFix = (title, copy, pairForeign, pairNative) => ({
    matches: false,
    targetField: "pair",
    suggestedValue: null,
    suggestedForeign: preferDisplayForm(pairForeign),
    suggestedNative: pairNative,
    title,
    copy,
  });

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
      return makePairFix(
        "Close — use the deck spelling?",
        `In ${where} this is “${localPair.foreign}” / “${localPair.native}”. Tap to fill both sides that way.`,
        localPair.foreign,
        localPair.native
      );
    }

    // Same Norwegian headword, different English — only if Norwegian match is strong
    if (foreignStrong && !nativeStrong && !foreignGibberish) {
      return makePairFix(
        "Same Norwegian in your deck",
        `In ${where}, “${localPair.foreign}” is “${localPair.native}”. You typed “${native}”. Tap to use the deck pair.`,
        localPair.foreign,
        localPair.native
      );
    }

    // Same English gloss, different Norwegian — only if English match is strong
    if (nativeStrong && !foreignStrong && !nativeGibberish) {
      return makePairFix(
        "Same English in your deck",
        `In ${where}, “${localPair.native}” is “${localPair.foreign}”. You typed “${foreign}”. Tap to use the deck pair.`,
        localPair.foreign,
        localPair.native
      );
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

  const foreignOk = safeSuggestedForeign ? softGlossMatch(safeSuggestedForeign, foreign) : false;
  const nativeOk = safeSuggestedNative ? softGlossMatch(safeSuggestedNative, native) : false;
  const foreignExact = safeSuggestedForeign ? glossPartsMatch(safeSuggestedForeign, foreign) : false;
  const nativeExact = safeSuggestedNative ? glossPartsMatch(safeSuggestedNative, native) : false;

  // Fields look swapped (English in Norwegian box and vice versa)
  if (
    safeSuggestedForeign &&
    safeSuggestedNative &&
    !foreignOk &&
    !nativeOk &&
    softGlossMatch(safeSuggestedForeign, native) &&
    softGlossMatch(safeSuggestedNative, foreign)
  ) {
    return {
      matches: false,
      targetField: "swap",
      suggestedValue: null,
      suggestedForeign: preferDisplayForm(safeSuggestedForeign),
      suggestedNative: safeSuggestedNative,
      title: "Sides look swapped",
      copy: `This reads like English and ${learningName} are in the wrong boxes. Tap to swap to “${safeSuggestedNative}” / “${preferDisplayForm(safeSuggestedForeign)}”.`,
    };
  }

  // Either direction confirming is enough for a real everyday pair.
  // Requiring both caused false alarms: great/flott is valid, but reverse TM may say
  // "bang-up", or EN→NO may prefer "god" while the learner chose "flott" (also fine).
  if ((foreignOk || nativeOk) && !foreignGibberish && !nativeGibberish) {
    const both = foreignOk && nativeOk;
    if (both && safeSuggestedForeign && safeSuggestedNative) {
      const canonForeign = preferDisplayForm(safeSuggestedForeign);
      const canonNative = safeSuggestedNative;
      // Only nudge tiny form tweaks when BOTH directions agree on the same pair
      if (
        foreignExact &&
        nativeExact &&
        (foreign !== canonForeign || native !== canonNative) &&
        softGlossMatch(canonForeign, foreign) &&
        softGlossMatch(canonNative, native)
      ) {
        return makePairFix(
          "Tiny spelling tweak?",
          `Usual written form is “${canonForeign}” / “${canonNative}”. Tap to use that, or keep yours.`,
          safeSuggestedForeign,
          safeSuggestedNative
        );
      }
    }

    // Title only: "common translation" overclaims obscure words the tool still accepts.
    return {
      matches: true,
      targetField: null,
      suggestedValue: null,
      title: "Looks good",
      copy: "",
    };
  }

  // Both sides disagree, or multi-word: MT is unreliable for idioms/slang/dialect.
  if (isPhrase || (safeSuggestedForeign && safeSuggestedNative)) {
    // Still offer a full pair when both directions returned something usable
    if (safeSuggestedForeign && safeSuggestedNative && !isPhrase) {
      return makePairFix(
        "Suggested pair",
        `A common pair is “${preferDisplayForm(safeSuggestedForeign)}” / “${safeSuggestedNative}”. Tap to use it, or keep yours if you prefer.`,
        safeSuggestedForeign,
        safeSuggestedNative
      );
    }
    const toolBits = [];
    if (safeSuggestedForeign) toolBits.push(`${learningName}: “${preferDisplayForm(safeSuggestedForeign)}”`);
    if (safeSuggestedNative) toolBits.push(`English: “${safeSuggestedNative}”`);
    const toolNote = toolBits.length ? ` Tool guessed ${toolBits.join(", ")}.` : "";
    return {
      matches: false,
      targetField: null,
      suggestedValue: null,
      title: "Hard to check online",
      copy: `Idioms, slang, and dialect often confuse translation tools. If your pair looks right to you, add it.${toolNote}`,
    };
  }

  // Single-word: only suggest a fix FROM a non-mash source
  if (safeSuggestedForeign) {
    return {
      matches: false,
      targetField: "foreign",
      suggestedValue: preferDisplayForm(safeSuggestedForeign),
      title: "Different translation found",
      copy: `For “${native}”, a common ${learningName} is “${preferDisplayForm(safeSuggestedForeign)}”. You typed “${foreign}”.`,
    };
  }

  if (safeSuggestedNative) {
    return {
      matches: false,
      targetField: "native",
      suggestedValue: safeSuggestedNative,
      title: "Different translation found",
      copy: `For “${foreign}”, a common English is “${safeSuggestedNative}”. You typed “${native}”.`,
    };
  }

  if (isPhrase) {
    return {
      matches: false,
      targetField: null,
      suggestedValue: null,
      title: "Couldn't double-check",
      copy: "No strong online match. That's normal for rare phrases. Add it if it looks right.",
    };
  }

  return null;
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
    return editing ? "Save changes" : "Add to library";
  }

  if (!translation.targetField) {
    return editing ? "Save anyway" : "Add anyway";
  }

  return editing ? "Save anyway" : "Add to library anyway";
}

function renderAddCardReviewContext({
  foreign,
  native,
  duplicate,
  suggestedNative,
  suggestedForeign,
  related,
  localPair = null,
}) {
  const container = document.getElementById("add-card-review-context");
  if (!container) return;

  const blocks = [];
  const translation = getTranslationReviewSummary(
    foreign,
    native,
    suggestedNative,
    suggestedForeign,
    localPair
  );

  if (duplicate) {
    blocks.push(`
      <section class="review-context-block is-warning">
        <h4 class="review-context-title">Already in your library</h4>
        <p class="review-context-copy">“${escapeHtml(duplicate.foreign)}” is already listed as “${escapeHtml(duplicate.native)}”.</p>
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
    const actionHint =
      translation.targetField === "swap"
        ? "Tap to swap the two sides"
        : translation.targetField === "pair"
          ? "Tap to fill both boxes with the usual form"
          : "Tap to use the suggested translation";
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
        ${actionable ? `<p class="review-context-hint">${escapeHtml(actionHint)}</p>` : ""}
      </section>`);
  }

  if (related.length) {
    const items = related
      .map(
        (item) => `
        <li class="review-context-item">
          <span class="review-context-item-meta">${escapeHtml(item.meta)}</span>
          <span class="review-context-item-pair">
            <span lang="${getActiveCategory().foreignLang || "nb"}">${escapeHtml(item.foreign)}</span>
            <span aria-hidden="true">·</span>
            <span>${escapeHtml(item.native)}</span>
          </span>
        </li>`
      )
      .join("");

    blocks.push(`
      <section class="review-context-block is-info">
        <h4 class="review-context-title">Related in your deck</h4>
        <ul class="review-context-list">${items}</ul>
      </section>`);
  }

  const confirmBtn = document.getElementById("add-card-confirm");
  const editExistingBtn = document.getElementById("add-card-edit-existing");
  if (duplicate) {
    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.textContent = editingCardId ? "Save changes" : "Add to library";
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

  if (!blocks.length) {
    container.innerHTML = "";
    container.classList.add("hidden");
    return;
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
    translation,
  };
}

function applyReviewSuggestion() {
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

  const foreignInput = document.getElementById("new-foreign");
  const nativeInput = document.getElementById("new-native");
  const reviewForeign = document.getElementById("review-foreign");
  const reviewNative = document.getElementById("review-native");

  if (targetField === "swap" || targetField === "pair") {
    const nextForeign = preferDisplayForm(suggestedForeign);
    const nextNative = suggestedNative;
    if (foreignInput) foreignInput.value = nextForeign;
    if (nativeInput) nativeInput.value = nextNative;
    if (reviewForeign) reviewForeign.textContent = nextForeign;
    if (reviewNative) reviewNative.textContent = nextNative;
  } else if (targetField === "foreign") {
    const nextForeign = preferDisplayForm(suggestedValue);
    if (foreignInput) foreignInput.value = nextForeign;
    if (reviewForeign) reviewForeign.textContent = nextForeign;
  } else {
    if (nativeInput) nativeInput.value = suggestedValue;
    if (reviewNative) reviewNative.textContent = suggestedValue;
  }

  syncAddCardResetButton();
  // Full re-check with fresh MT — never re-approve using stale translations of the old text.
  openAddCardReview();
}

function closeAddCardReview() {
  addCardReviewOpen = false;
  addCardReviewState = null;
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

  reviewForeign.textContent = foreign;
  reviewNative.textContent = native;
  context.classList.remove("hidden");
  context.innerHTML = `<p class="review-context-loading">Checking…</p>`;

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
  const [suggestedNative, suggestedForeign] = await Promise.all([
    fetchTranslationSuggestion(foreign, foreignCode, nativeCode),
    fetchTranslationSuggestion(native, nativeCode, foreignCode),
  ]);

  if (!addCardReviewOpen || reviewForeign.textContent.trim() !== foreign) return;

  renderAddCardReviewContext({
    foreign,
    native,
    duplicate,
    suggestedNative,
    suggestedForeign,
    related,
    localPair,
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
  document.getElementById("add-card-form")?.reset();
  setAddCardFormBaseline("", "");
  closeAddCardReview();
  hideLibrarySuggestions();
  applyAddCardFormUI();
  document.querySelectorAll(".card-item.is-editing").forEach((el) => el.classList.remove("is-editing"));
  syncAddCardResetButton();
}

function startEditCard(cardId) {
  const card = deck.find((entry) => entry.id === cardId);
  if (!card) return;

  suppressAddCardSuggestions = false;
  editingCardId = card.id;
  document.getElementById("new-foreign").value = card.foreign;
  document.getElementById("new-native").value = card.native;
  setAddCardFormBaseline(card.foreign, card.native);
  closeAddCardReview();
  hideLibrarySuggestions();
  applyAddCardFormUI();

  document.querySelectorAll(".card-item.is-editing").forEach((el) => el.classList.remove("is-editing"));
  document.querySelector(`.card-item[data-card-id="${card.id}"]`)?.classList.add("is-editing");

  document.getElementById("add-card-form")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  document.getElementById("new-native")?.focus();
  syncAddCardResetButton();
}

function saveLibraryCard(foreign, native) {
  const trimmedForeign = foreign.trim();
  const trimmedNative = native.trim();
  if (!trimmedForeign || !trimmedNative) return false;

  const duplicate = findDeckCardByForeign(trimmedForeign, editingCardId);
  if (duplicate) return false;

  if (editingCardId) {
    const card = deck.find((entry) => entry.id === editingCardId);
    if (!card) return false;
    card.foreign = trimmedForeign;
    card.native = trimmedNative;
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
          <button class="btn ghost small hear-card-btn" data-foreign="${escapeAttr(card.foreign)}" type="button" title="Hear">Hear</button>
          <button class="btn ghost small edit-card-btn" data-id="${escapeAttr(card.id)}" type="button">Edit</button>
          <button class="btn ghost small danger delete-card-btn" data-id="${escapeAttr(card.id)}" type="button">Delete</button>
        </div>
      </article>`;
}

function isCardsPanelActive() {
  const panel = document.getElementById("cards-panel");
  return Boolean(panel?.classList.contains("active"));
}

function updateDeckCount() {
  const deckCount = document.getElementById("deck-count");
  if (deckCount) deckCount.textContent = deck.length;
}

function getLibraryBandGroups() {
  if (libraryFilter === "all") {
    return ["A", "B", "C", "D", "E", "F", "G", "phrase", null];
  }
  if (libraryFilter === "words") {
    return ["A", "B", "C", "D", "E", "F", "G"];
  }
  if (libraryFilter === "yours") {
    return [null];
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

function scrollToLibrarySection(key) {
  const target = document.getElementById(`library-section-${key}`);
  if (!target) return;
  setActiveLibraryJump(key);
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function scrollLibraryToTop() {
  const anchor =
    document.querySelector(".library-controls") || document.getElementById("cards-panel");
  anchor?.scrollIntoView({ behavior: "smooth", block: "start" });
  setActiveLibraryJump(null);
}

function updateLibraryScrollTopVisibility() {
  const btn = document.getElementById("library-scroll-top");
  if (!btn) return;
  const show = isCardsPanelActive() && window.scrollY > LIBRARY_SCROLL_TOP_THRESHOLD;
  btn.classList.toggle("hidden", !show);
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

function renderLibraryJumpNav(sections) {
  const nav = document.getElementById("library-jump");
  if (!nav) return;

  if (sections.length < 2) {
    clearLibraryJumpNav();
    return;
  }

  nav.classList.remove("hidden");
  nav.innerHTML = sections
    .map(({ band, label }) => {
      const key = librarySectionKey(band);
      const short = LIBRARY_JUMP_SHORT[key] || label;
      return `<button type="button" class="library-jump-chip" data-jump-section="${escapeAttr(key)}" title="${escapeAttr(label)}">${escapeHtml(short)}</button>`;
    })
    .join("");

  observeLibraryJumpSections(sections);
}

function bindCardListListeners(list) {
  if (!list) return;

  list.querySelectorAll(".edit-card-btn").forEach((btn) => {
    btn.addEventListener("click", () => startEditCard(btn.dataset.id));
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
    const sectionEl = document.createElement("section");
    sectionEl.className = "card-group";
    sectionEl.id = `library-section-${key}`;
    sectionEl.dataset.librarySection = key;
    sectionEl.innerHTML = `
      <h3 class="card-group-title">${escapeHtml(label)}</h3>
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
  if (!list || !isCardsPanelActive()) return;

  libraryRenderToken += 1;
  const token = libraryRenderToken;

  const searching = Boolean(librarySearch.trim());
  let filtered = sortCards(deck).filter(matchesLibraryFilter);
  if (searching) filtered = dedupeLibraryCards(filtered);

  if (!filtered.length) {
    clearLibraryJumpNav();
    list.innerHTML = `<div class="library-empty">No matches</div>`;
    updateLibraryScrollTopVisibility();
    return;
  }

  if (searching || libraryFilter === "phrase" || libraryFilter === "yours") {
    clearLibraryJumpNav();
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
    if (!cards.length) continue;
    sections.push({
      band,
      label: band ? BAND_LABELS[band] : "Yours",
      cards,
    });
  }

  if (!sections.length) {
    clearLibraryJumpNav();
    list.innerHTML = `<div class="library-empty">No matches</div>`;
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

  storageSet(
    getReadProgressKey(),
    JSON.stringify({
      storyId: readStoryId,
      sentenceIndex: readSentenceIndex,
      showEnglish: readShowEnglish,
      positions,
    })
  );

  const statsPanel = document.getElementById("stats-panel");
  if (statsPanel?.classList.contains("active")) {
    renderProgressReadStats();
  }
}

function getStoriesForCategory(categoryId = activeCategoryId) {
  if (typeof READ_STORIES === "undefined" || !Array.isArray(READ_STORIES)) return [];
  const stories = READ_STORIES.filter((story) => story.categoryId === categoryId);
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

  storageSet(getReadProgressKey(), JSON.stringify(payload));

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

function generateNorwegianLookupVariants(word) {
  const base = normalizeAnswer(word);
  if (!base) return [];
  const variants = new Set([base]);
  for (const suffix of NORWEGIAN_LOOKUP_SUFFIXES) {
    if (base.length > suffix.length + 2 && base.endsWith(suffix)) {
      variants.add(base.slice(0, -suffix.length));
    }
  }
  return [...variants];
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

  if (typeof READ_STORIES !== "undefined" && Array.isArray(READ_STORIES)) {
    READ_STORIES.forEach((story) => {
      if (!story?.glosses) return;
      Object.entries(story.glosses).forEach(([foreign, native]) => {
        addReadVocabEntry(map, foreign, native, "gloss");
      });
    });
  }

  readVocabIndex = map;
  return map;
}

function getReadVocabIndex() {
  if (!readVocabIndex) return rebuildReadVocabIndex();
  return readVocabIndex;
}

function lookupReadVocabEntry(token, story) {
  const index = getReadVocabIndex();
  const variants = generateNorwegianLookupVariants(token);

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

    for (const phrase of phrases) {
      if (!restLower.startsWith(phrase)) continue;
      const end = i + phrase.length;
      if (end < text.length && /[a-zæøåA-ZÆØÅ]/.test(text[end])) continue;
      matched = text.slice(i, end);
      i = end;
      break;
    }

    if (matched) {
      tokens.push({ type: "word", text: matched });
      continue;
    }

    let word = "";
    while (i < text.length && /[a-zæøåA-ZÆØÅ]/.test(text[i])) {
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

  for (const variant of generateNorwegianLookupVariants(token)) {
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
  return "read-word read-word--tappable";
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
    glossEl.hidden = true;
  }
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

  const lemma = payload.matchedLemma;
  meaningEl.textContent = lemma
    ? `${payload.native} (from ${lemma})`
    : payload.native;
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
  toggle.textContent = readShowEnglish ? "Hide English" : "Show English";
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
  const statusEl = document.getElementById("read-story-status");
  const labelEl = document.getElementById("read-story-status-label");
  if (!statusEl || !labelEl || !story) return;

  if (!storyHasReadProgress(story.id)) {
    statusEl.classList.add("hidden");
    return;
  }

  const pos = getStoryPosition(story.id);
  const progressLabel = formatStoryProgressCount(story, pos.furthest);
  const finished = isStoryComplete(story, pos.furthest);

  labelEl.textContent = progressLabel;
  labelEl.classList.toggle("read-story-status-label--finished", finished);
  statusEl.classList.remove("hidden");
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

  if (trailBtn) {
    const trailLabel = trail?.label || "Beginner";
    trailBtn.innerHTML = `${getReadTrailSymbolMarkup(story.trail)}<span class="read-trail-btn__label">${escapeHtml(trailLabel)}</span>`;
    trailBtn.setAttribute("aria-label", `Difficulty: ${trailLabel}`);
    trailBtn.title = trailLabel;
  }

  if (titleEl) titleEl.textContent = story.title;

  const sourceEl = document.getElementById("read-story-source");
  if (sourceEl) {
    sourceEl.textContent = "";
    sourceEl.hidden = true;
  }

  if (progressBar && progressFill) {
    progressBar.setAttribute("aria-valuenow", String(pct));
    progressBar.setAttribute("aria-label", `${pct}% read`);
    progressFill.style.width = `${pct}%`;
  }

  updateReadStoryStatus(story);
}

function renderReadPanel() {
  const panel = document.getElementById("read-panel");
  if (!panel) return;

  ensureReadState();
  const story = getActiveReadStory();
  const shell = panel.querySelector(".read-shell");

  if (!story) {
    closeReadMenu();
    if (shell) shell.classList.add("hidden");
    return;
  }

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
    focusNb.innerHTML = renderReadSentenceMarkup(sentence.nb, story, deckMap, true);
  }
  if (focusEn) {
    focusEn.textContent = sentence.en;
  }
  if (contextBefore) {
    if (!priorSentences.length) {
      contextBefore.innerHTML = '<div class="read-context-anchor" aria-hidden="true"></div>';
    } else {
      const chunks = priorSentences
        .map((entry) => `<span class="read-context-sentence">${escapeHtml(entry.nb)}</span>`)
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

function renderProgressSummary() {
  const container = document.getElementById("stats-summary");
  if (!container) return;

  const daily = ensureDailyPracticeState();
  const streakStat = getHomeStreakStat();
  const reviewedToday = daily.reviewed;
  const total = deck.length;
  const introduced = getIntroducedCount();
  const introducedPct = total ? Math.round((introduced / total) * 100) : 0;
  const mastered = deck.filter((card) => card.box === BOX_COUNT).length;
  const masteredPct = total ? Math.round((mastered / total) * 100) : 0;
  container.innerHTML = `
    <div class="stat-card" aria-label="${escapeAttr(streakStat.ariaLabel)}">
      <span class="stat-value">${streakStat.value}</span>
      <span class="stat-label">${escapeHtml(streakStat.label)}</span>
    </div>
    <div class="stat-card" aria-label="${reviewedToday} card${reviewedToday === 1 ? "" : "s"} reviewed today">
      <span class="stat-value">${reviewedToday}</span>
      <span class="stat-label">Reviewed today</span>
    </div>
    <div class="stat-card" aria-label="${introduced} of ${total} words introduced (${introducedPct}%)">
      <span class="stat-value">${introducedPct}%</span>
      <span class="stat-label">Introduced</span>
    </div>
    <div class="stat-card" aria-label="${mastered} of ${total} words mastered (${masteredPct}%)">
      <span class="stat-value">${masteredPct}%</span>
      <span class="stat-label">Mastered</span>
    </div>`;
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
      const width = count ? Math.max(6, Math.round((count / total) * 100)) : 0;
      return `
        <div class="box-stat-row">
          <div class="box-stat-label">
            <span class="box-stat-name">${escapeHtml(level.short)}</span>
            <span class="box-stat-interval">${escapeHtml(formatInterval(box))}</span>
          </div>
          <div class="box-stat-bar-wrap" role="presentation">
            <div class="box-stat-bar" style="width: ${width}%"></div>
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
        const width = pct > 0 ? Math.max(6, pct) : 0;
        const completed = isStoryComplete(story, pos.furthest);
        const progressLabel = formatStoryProgressCount(story, pos.furthest);
        const hasProgress = storyHasReadProgress(story.id);
        return `
          <div class="read-stat-row-wrap${completed ? " read-stat-row-wrap--completed" : ""}">
            <button
              type="button"
              class="read-stat-row read-stat-row--link"
              data-open-story-id="${escapeAttr(story.id)}"
              title="Open ${escapeAttr(story.title)}"
            >
              <div class="read-stat-label">
                <span class="read-stat-title">${escapeHtml(story.title)}</span>
                ${story.subtitle ? `<span class="read-stat-trail">${escapeHtml(story.subtitle)}</span>` : ""}
              </div>
              <div class="box-stat-bar-wrap" role="presentation">
                <div class="box-stat-bar" style="width: ${width}%"></div>
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
                      title="Reset story"
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
  renderProgressSummary();
  renderProgressBoxStats();
  renderProgressReadStats();
}

function applyCategoryUI() {
  const category = getActiveCategory();
  document.querySelectorAll("[data-category-picker-label]").forEach((el) => {
    el.textContent = category.label;
  });

  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el && text) el.textContent = text;
  };

  const panelLeadEl = document.getElementById("panel-lead");
  if (panelLeadEl && category.panelLead) {
    panelLeadEl.textContent = category.panelLead;
  }

  applyAddCardFormUI();
  applyPracticeDirectionUI();

  document.title = `Leitner Learning · ${category.label.split(" · ")[0]}`;
}

function applyPracticeDirectionUI() {
  const category = getActiveCategory();
  const labels = getDirectionLabels(category);
  const directionBtn = document.getElementById("prompt-direction");
  const answerInput = document.getElementById("answer-input");
  const hearBtn = document.getElementById("hear-btn");
  const speakBtn = document.getElementById("speak-btn");

  if (directionBtn) {
    directionBtn.textContent = labels.promptLabel;
    directionBtn.setAttribute("aria-pressed", String(isReversePractice()));
    directionBtn.title = isReversePractice()
      ? "Tap to review Norwegian → English"
      : "Tap to review English → Norwegian";
  }

  if (answerInput) {
    updateAnswerInputPlaceholder();
    answerInput.lang = labels.answerLang.split("-")[0];
  }

  if (hearBtn) {
    hearBtn.textContent = category.hearLabel || "Hear";
    hearBtn.title = labels.hearTitle;
  }

  if (speakBtn) {
    speakBtn.title = speakModeActive ? "Speak mode on. Tap to turn off" : labels.speakTitle;
    speakBtn.setAttribute("aria-pressed", String(speakModeActive));
  }
}

function renderAvailableCategoryOption(category) {
  const isActive = category.id === activeCategoryId;
  return `
    <button
      type="button"
      class="category-option category-option--compact${isActive ? " active" : ""}"
      role="option"
      aria-selected="${isActive}"
      data-category-id="${category.id}"
    >
      <span class="category-option-label">${escapeHtml(category.label)}</span>
    </button>`;
}

function renderUpcomingCategoryOption(category) {
  return `
    <button
      type="button"
      class="category-option category-option--soon unavailable"
      role="option"
      aria-selected="false"
      data-category-id="${category.id}"
      disabled
    >
      <span class="category-option-label">${escapeHtml(category.label)}</span>
    </button>`;
}

function buildCategoryPickerMenuMarkup() {
  const available = LEARNING_CATEGORIES.filter((category) => category.available);
  const upcoming = LEARNING_CATEGORIES.filter((category) => !category.available);

  const sections = [];
  if (available.length) {
    sections.push(available.map(renderAvailableCategoryOption).join(""));
  }
  if (upcoming.length) {
    sections.push(`
      <p class="category-picker-group-label" role="presentation">Coming soon</p>
      ${upcoming.map(renderUpcomingCategoryOption).join("")}`);
  }

  return sections.join("");
}

function bindCategoryPickerMenu(menu) {
  if (!menu) return;
  menu.querySelectorAll("[data-category-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      switchCategory(btn.dataset.categoryId);
    });
  });
}

function renderCategoryPicker() {
  const markup = buildCategoryPickerMenuMarkup();
  document.querySelectorAll(".category-picker-menu").forEach((menu) => {
    menu.innerHTML = markup;
    bindCategoryPickerMenu(menu);
  });
}

function openCategoryMenu(btn) {
  const picker = btn?.closest(".category-picker");
  const menu = picker?.querySelector(".category-picker-menu");
  if (!btn || !menu) return;
  categoryMenuOpen = true;
  btn.setAttribute("aria-expanded", "true");
  menu.classList.remove("hidden");
}

function closeCategoryMenu() {
  categoryMenuOpen = false;
  document.querySelectorAll(".category-picker-btn").forEach((btn) => {
    btn.setAttribute("aria-expanded", "false");
  });
  document.querySelectorAll(".category-picker-menu").forEach((menu) => {
    menu.classList.add("hidden");
  });
}

function toggleCategoryMenu(btn) {
  if (!isCategoryPickerAvailable()) return;
  const picker = btn.closest(".category-picker");
  const menu = picker?.querySelector(".category-picker-menu");
  const isOpen = Boolean(menu && !menu.classList.contains("hidden"));
  closeCategoryMenu();
  if (!isOpen) openCategoryMenu(btn);
}

function switchCategory(nextCategoryId) {
  if (nextCategoryId === activeCategoryId) {
    closeCategoryMenu();
    return;
  }

  const nextCategory = getCategoryById(nextCategoryId);
  if (!nextCategory.available) return;

  saveDeck();
  activeCategoryId = nextCategoryId;
  setActiveCategoryId(nextCategoryId);
  practiceDirection = getPracticeDirection(nextCategoryId);
  setSpeakMode(false);
  recognition = null;

  deck = loadDeck(nextCategoryId);
  sessionQueue = [];
  currentCard = null;
  sessionReviewed = 0;
  sessionCorrect = 0;
  sessionJustCompleted = false;
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
    setAnswerReceivedState(true);
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
  setAnswerReceivedState(true);
  handleIncorrect();
  showFeedback(answerText, "incorrect");

  finishCardAndContinue(getAdvanceDelay(false, options.fromSpeech));
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
  if (tabName !== "cards") {
    document.getElementById("library-scroll-top")?.classList.add("hidden");
  } else {
    updateLibraryScrollTopVisibility();
  }
  updateCategoryPickerAvailability();
}

function initEventListeners() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });

  document.querySelectorAll("[data-tab-jump]").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tabJump));
  });

  document.getElementById("stats-summary")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-tab-jump]");
    if (!btn) return;
    switchTab(btn.dataset.tabJump);
  });

  document.getElementById("start-practice-btn")?.addEventListener("click", (e) => {
    if (e.currentTarget.disabled) return;
    const daily = ensureDailyPracticeState();
    if (daily.goalMet && !daily.extraMode) {
      enableExtraPractice();
    }
    sessionReviewed = 0;
    sessionCorrect = 0;
    beginPracticeSession();
  });

  document.getElementById("keep-practicing-btn")?.addEventListener("click", () => {
    enableExtraPractice();
    beginPracticeSession();
  });

  document.getElementById("answer-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    submitAnswer();
  });

  document.getElementById("prompt-direction")?.addEventListener("click", togglePracticeDirection);

  document.getElementById("reveal-btn")?.addEventListener("click", () => {
    if (!currentCard) return;
    const answerText = getAnswerTargetText(currentCard);
    showFeedback(answerText, "incorrect");
    handleIncorrect();
    finishCardAndContinue(speakModeActive ? SPEAK_ADVANCE_WRONG_MS : TYPING_ADVANCE_WRONG_MS);
  });

  document.getElementById("speak-btn")?.addEventListener("click", toggleSpeakMode);

  document.getElementById("hear-btn")?.addEventListener("click", () => {
    if (!currentCard) return;
    clearSpeakScheduling();
    stopActiveRecognition();
    setListeningUI(false);
    speakPromptForCard(currentCard);
    if (speakModeActive) {
      speakCardDelayTimer = window.setTimeout(() => scheduleSpeakForCurrentCard(), 2200);
    }
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
    const cardId = e.currentTarget.dataset.cardId;
    if (!cardId) return;
    closeAddCardReview();
    startEditCard(cardId);
  });

  document.getElementById("add-card-edit-review")?.addEventListener("click", () => {
    closeAddCardReview();
    document.getElementById("new-native")?.focus();
  });

  document.getElementById("add-card-review-context")?.addEventListener("click", (e) => {
    if (!e.target.closest('[data-action="apply-suggestion"]')) return;
    applyReviewSuggestion();
  });

  document.getElementById("add-card-review-context")?.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    if (!e.target.closest('[data-action="apply-suggestion"]')) return;
    e.preventDefault();
    applyReviewSuggestion();
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
    invalidateAddCardReviewIfStale();
    syncAddCardResetButton();
    queueNativeSuggestions();
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".add-card-field")) hideLibrarySuggestions();
  });

  document.getElementById("reset-deck-btn")?.addEventListener("click", resetToStarter);

  document.getElementById("library-search")?.addEventListener("input", (e) => {
    librarySearch = e.target.value;
    renderCardList();
  });

  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".filter-chip").forEach((el) => el.classList.remove("active"));
      chip.classList.add("active");
      libraryFilter = chip.dataset.band;
      renderCardList();
    });
  });

  document.getElementById("library-jump")?.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-jump-section]");
    if (!chip) return;
    scrollToLibrarySection(chip.dataset.jumpSection);
  });

  document.getElementById("library-scroll-top")?.addEventListener("click", () => {
    scrollLibraryToTop();
  });

  window.addEventListener("scroll", updateLibraryScrollTopVisibility, { passive: true });

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

  document.getElementById("welcome-start-btn")?.addEventListener("click", () => closeWelcomeModal());

  document.addEventListener("click", blockWelcomeBypass, true);
  document.addEventListener("touchend", blockWelcomeBypass, true);

  document.getElementById("about-open-btn")?.addEventListener("click", () => openAboutModal());
  document.getElementById("about-close-btn")?.addEventListener("click", () => closeAboutModal());
  document.getElementById("about-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "about-modal") closeAboutModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const welcome = document.getElementById("welcome-modal");
      if (welcome && !welcome.classList.contains("hidden")) return;
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

  document.getElementById("read-hear-sentence")?.addEventListener("click", () => {
    const story = getActiveReadStory();
    if (!story) return;
    speakForeign(story.sentences[readSentenceIndex]?.nb);
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

function openAboutModal() {
  if (isWelcomeOpen()) return;
  const modal = document.getElementById("about-modal");
  if (!modal) return;
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  document.getElementById("about-close-btn")?.focus({ preventScroll: true });
}

function closeAboutModal() {
  const modal = document.getElementById("about-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  if (!isWelcomeOpen()) {
    const confirmOpen = !document.getElementById("confirm-modal")?.classList.contains("hidden");
    if (!confirmOpen) document.body.classList.remove("modal-open");
  }
  document.getElementById("about-open-btn")?.focus({ preventScroll: true });
}

function showWelcomeModal() {
  const modal = document.getElementById("welcome-modal");
  if (!modal) return;
  renderCategoryPicker();
  modal.classList.remove("hidden");
  setWelcomeGateActive(true);
  updateCategoryPickerAvailability();
  document.getElementById("welcome-start-btn")?.focus({ preventScroll: true });
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
}

function maybeShowWelcome() {
  try {
    if (localStorage.getItem(WELCOME_SEEN_KEY)) return;
  } catch {
    return;
  }
  showWelcomeModal();
}

function bootApp() {
  try {
    if (typeof NORWEGIAN_FREQUENCY_DECK === "undefined") {
      throw new Error("Starter deck script did not load. Check your network connection and refresh.");
    }
    const starterEntries = getStarterDeckEntries();
    if (!starterEntries.length) {
      throw new Error("Starter deck is empty.");
    }

    deck = loadDeck();
    if (!deck.length) {
      deck = ensureDeckIsUsable(buildStarterDeck());
      saveDeck();
    }

    sanitizeReadProgress();
    initConfirmModal();
    initEventListeners();
    startPractice();
    renderAll();
    maybeShowWelcome();
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