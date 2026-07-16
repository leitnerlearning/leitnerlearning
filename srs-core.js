/**
 * Pure SRS scheduling, daily queue, and spice-word selection.
 * Loaded in the browser (window.SrsCore) and in Node tests.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.SrsCore = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const BOX_COUNT = 6;
  const BOX_INTERVALS_DAYS = [0, 1, 3, 7, 14, 30];
  const DAILY_PRACTICE_CAP = 20;
  const SPICE_MAX_PER_DAY = 2;
  const SPICE_MIN_INTRODUCED = 12;
  const SPICE_RANK_BUFFER = 30;
  const SPICE_RANK_FLOOR = 60;

  function daysToMs(days) {
    return days * 24 * 60 * 60 * 1000;
  }

  function getLocalDayStartAfterDays(days, fromDate = new Date()) {
    const start = new Date(fromDate);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() + days);
    return start.getTime();
  }

  function getLocalDayKey(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function scheduleNextReview(box, now = Date.now()) {
    const days = BOX_INTERVALS_DAYS[Math.min(box - 1, BOX_COUNT - 1)];
    if (days <= 0) return now;
    return getLocalDayStartAfterDays(days, new Date(now));
  }

  function isNewCard(card) {
    return card.lastReviewedAt == null;
  }

  function isDue(card, now = Date.now()) {
    return card.nextReviewAt <= now;
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
      return String(a.foreign).localeCompare(String(b.foreign));
    }
    return (Number(a.nextReviewAt) || 0) - (Number(b.nextReviewAt) || 0);
  }

  function compareCardsForPractice(a, b) {
    const boxA = Math.min(Math.max(Number(a.box) || 1, 1), BOX_COUNT);
    const boxB = Math.min(Math.max(Number(b.box) || 1, 1), BOX_COUNT);
    if (boxA !== boxB) return boxA - boxB;
    return compareCardsWithinBox(a, b);
  }

  function getDueCards(cards, now = Date.now()) {
    if (!Array.isArray(cards)) return [];
    return cards.filter((card) => isDue(card, now)).sort(compareCardsForPractice);
  }

  function getIntroducedCount(cards) {
    return cards.filter((card) => !isNewCard(card)).length;
  }

  function computeDailyGoal(dueCount) {
    if (dueCount <= 0) return 0;
    return Math.min(dueCount, DAILY_PRACTICE_CAP);
  }

  function getSpiceSlotCount(introducedCount, goal, randomFn = Math.random) {
    if (goal <= 0 || introducedCount < SPICE_MIN_INTRODUCED) return 0;

    const progress = Math.min(1, (introducedCount - SPICE_MIN_INTRODUCED) / 120);
    const expected = progress * SPICE_MAX_PER_DAY;
    let slots = Math.floor(expected);
    if (randomFn() < expected - slots) slots += 1;

    return Math.min(slots, SPICE_MAX_PER_DAY, Math.max(0, goal - 1));
  }

  function getSpiceRankThreshold(cards) {
    const introduced = cards.filter((card) => !isNewCard(card) && Number.isFinite(card.rank));
    const frontier = introduced.reduce((max, card) => Math.max(max, card.rank), 0);
    return Math.max(SPICE_RANK_FLOOR, frontier + SPICE_RANK_BUFFER);
  }

  function pickSpiceCardIds(candidates, count, randomFn = Math.random) {
    if (!candidates.length || count <= 0) return [];

    const pool = candidates
      .slice()
      .sort((a, b) => (Number(a.rank) || 99999) - (Number(b.rank) || 99999));

    const windowSize = Math.min(pool.length, Math.max(count * 4, 12));
    const window = pool.slice(0, windowSize);
    const picked = [];

    while (picked.length < count && window.length) {
      const index = Math.floor(randomFn() * window.length);
      const [card] = window.splice(index, 1);
      picked.push(card.id);
    }

    return picked;
  }

  function interleaveQueueIds(coreIds, spiceIds, randomFn = Math.random) {
    if (!spiceIds.length) return coreIds.slice();

    const queue = coreIds.slice();
    spiceIds.forEach((id) => {
      const insertAt = Math.floor(randomFn() * (queue.length + 1));
      queue.splice(insertAt, 0, id);
    });
    return queue;
  }

  function buildDailyQueue(dueCards, goal, allCards = dueCards, options = {}) {
    if (!goal) return [];

    const randomFn = options.randomFn || Math.random;
    const excludedIds = options.excludedIds || new Set();
    const introducedCount = getIntroducedCount(allCards);
    const spiceSlots = getSpiceSlotCount(introducedCount, goal, randomFn);
    const coreSlots = Math.max(0, goal - spiceSlots);

    const eligible = dueCards
      .filter((card) => !excludedIds.has(card.id))
      .slice()
      .sort(compareCardsForPractice);

    const coreCards = eligible.slice(0, coreSlots);
    const coreIds = coreCards.map((card) => card.id);
    const usedIds = new Set(coreIds);

    if (!spiceSlots) return coreIds;

    const spiceRankMin = getSpiceRankThreshold(allCards);
    const spiceCandidates = eligible.filter(
      (card) =>
        !usedIds.has(card.id) &&
        isNewCard(card) &&
        (Number(card.rank) || 99999) >= spiceRankMin
    );

    const spiceIds = pickSpiceCardIds(spiceCandidates, spiceSlots, randomFn);
    return interleaveQueueIds(coreIds, spiceIds, randomFn);
  }

  function promote(card, now = Date.now()) {
    const newBox = Math.min(card.box + 1, BOX_COUNT);
    return {
      ...card,
      box: newBox,
      nextReviewAt: scheduleNextReview(newBox, now),
      lastReviewedAt: now,
      correctCount: (card.correctCount || 0) + 1,
    };
  }

  function demote(card, now = Date.now()) {
    return {
      ...card,
      box: 1,
      nextReviewAt: now,
      lastReviewedAt: now,
      incorrectCount: (card.incorrectCount || 0) + 1,
    };
  }

  function createSimCard(id, rank, now = Date.now()) {
    return {
      id: `card-${id}`,
      foreign: `word-${rank}`,
      native: `meaning-${rank}`,
      box: 1,
      rank,
      nextReviewAt: now,
      lastReviewedAt: null,
      correctCount: 0,
      incorrectCount: 0,
    };
  }

  function createStarterDeck(size = 200, now = Date.now()) {
    return Array.from({ length: size }, (_, index) => createSimCard(index + 1, index + 1, now));
  }

  function simulateStudyDay(cards, state, options = {}) {
    const now = options.now ?? Date.now();
    const randomFn = options.randomFn || Math.random;
    const accuracy = options.accuracy ?? 0.86;
    const due = getDueCards(cards, now);

    if (!state || state.day !== getLocalDayKey(new Date(now))) {
      const goal = computeDailyGoal(due.length);
      state = {
        day: getLocalDayKey(new Date(now)),
        reviewed: 0,
        goal,
        goalMet: goal === 0,
        dailyQueue: buildDailyQueue(due, goal, cards, { randomFn }),
        completedIds: [],
        extraMode: false,
      };
    }

    const completed = new Set(state.completedIds);
    const pendingIds = state.dailyQueue.filter((id) => !completed.has(id));
    const byId = new Map(cards.map((card) => [card.id, card]));

    for (const id of pendingIds) {
      if (state.goal > 0 && state.reviewed >= state.goal) break;

      const card = byId.get(id);
      if (!card || !isDue(card, now)) continue;

      const correct = randomFn() < accuracy;
      const updated = correct ? promote(card, now) : demote(card, now);
      const index = cards.findIndex((entry) => entry.id === id);
      if (index !== -1) cards[index] = updated;
      byId.set(id, updated);

      if (!completed.has(id)) {
        completed.add(id);
        state.completedIds.push(id);
        state.reviewed = state.completedIds.length;
        if (state.goal > 0 && state.reviewed >= state.goal) state.goalMet = true;
      }
    }

    return state;
  }

  function simulateSchedule(options = {}) {
    const days = options.days ?? 90;
    const cards = options.cards || createStarterDeck(options.deckSize ?? 200, options.startMs ?? 0);
    let now = options.startMs ?? Date.now();
    let state = null;
    const skipDayPattern = options.skipEvery ?? 0;
    const randomFn = options.randomFn || Math.random;
    const spiceCounts = [];

    for (let day = 0; day < days; day += 1) {
      if (skipDayPattern && day > 0 && day % skipDayPattern === 0) {
        now += daysToMs(1);
        state = null;
        continue;
      }

      if (!state || state.day !== getLocalDayKey(new Date(now))) {
        const due = getDueCards(cards, now);
        const goal = computeDailyGoal(due.length);
        state = {
          day: getLocalDayKey(new Date(now)),
          reviewed: 0,
          goal,
          goalMet: false,
          dailyQueue: buildDailyQueue(due, goal, cards, { randomFn }),
          completedIds: [],
          extraMode: false,
        };
        const threshold = getSpiceRankThreshold(cards);
        const spiceInQueue = state.dailyQueue.filter((id) => {
          const card = cards.find((entry) => entry.id === id);
          return card && isNewCard(card) && (Number(card.rank) || 0) >= threshold;
        }).length;
        spiceCounts.push(spiceInQueue);
      }

      state = simulateStudyDay(cards, state, { now, randomFn, accuracy: options.accuracy });
      now += daysToMs(1);
      state = null;
    }

    return {
      cards,
      spiceCounts,
      introduced: getIntroducedCount(cards),
      mastered: cards.filter((card) => card.box === BOX_COUNT).length,
    };
  }

  return {
    BOX_COUNT,
    BOX_INTERVALS_DAYS,
    DAILY_PRACTICE_CAP,
    SPICE_MAX_PER_DAY,
    SPICE_MIN_INTRODUCED,
    daysToMs,
    getLocalDayStartAfterDays,
    getLocalDayKey,
    scheduleNextReview,
    isNewCard,
    isDue,
    compareCardsForPractice,
    getDueCards,
    getIntroducedCount,
    computeDailyGoal,
    getSpiceSlotCount,
    getSpiceRankThreshold,
    buildDailyQueue,
    promote,
    demote,
    createStarterDeck,
    simulateStudyDay,
    simulateSchedule,
  };
});