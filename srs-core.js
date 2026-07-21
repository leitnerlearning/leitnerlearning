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
  /** After the hook phase: sprinkle slightly-ahead words into the day. */
  const SPICE_MAX_PER_DAY = 3;
  const SPICE_MIN_INTRODUCED = 25;
  const SPICE_RANK_BUFFER = 25;
  const SPICE_RANK_FLOOR = 45;
  /**
   * Early sessions: interleave memorable "hooks" (phrases + mid-rank content)
   * with high-frequency glue (pronouns, articles, particles). Pure rank-1-only
   * order is coverage-optimal but demotivating and hard for isolated connectors.
   * Research-aligned: formulaic sequences + usage-based chunks alongside frequency.
   */
  const HOOK_INTRO_THRESHOLD = 40;
  const HOOK_RANK_MIN = 36;
  const HOOK_RANK_MAX = 260;
  /** Share of *new* slots that prefer hooks during the early phase (~half). */
  const HOOK_NEW_RATIO = 0.5;

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

  /** Phrases + mid-rank content: easier to care about and remember in isolation. */
  function isHookCard(card) {
    if (!card) return false;
    if (card.band === "phrase") return true;
    const foreign = String(card.foreign || "").trim();
    if (/\s/.test(foreign)) return true;
    const rank = Number(card.rank);
    if (!Number.isFinite(rank)) return false;
    return rank >= HOOK_RANK_MIN && rank <= HOOK_RANK_MAX;
  }

  /** Ultra-high-frequency connectors / pronouns / articles (hard in isolation). */
  function isGlueCard(card) {
    if (!card || isHookCard(card)) return false;
    const rank = Number(card.rank);
    return Number.isFinite(rank) && rank < HOOK_RANK_MIN;
  }

  function sortByRank(cards) {
    return cards.slice().sort((a, b) => {
      const rankA = Number(a.rank);
      const rankB = Number(b.rank);
      if (Number.isFinite(rankA) && Number.isFinite(rankB) && rankA !== rankB) {
        return rankA - rankB;
      }
      if (Number.isFinite(rankA) && !Number.isFinite(rankB)) return -1;
      if (!Number.isFinite(rankA) && Number.isFinite(rankB)) return 1;
      return String(a.foreign || "").localeCompare(String(b.foreign || ""));
    });
  }

  /**
   * Build new-card IDs for early sessions: ~half hooks, ~half glue, interleaved
   * so day 1 is not ten particles then ten phrases (or the reverse).
   */
  function buildHookMixedNewIds(newCards, slots) {
    if (slots <= 0 || !newCards.length) return [];

    const hooks = sortByRank(newCards.filter(isHookCard));
    const glue = sortByRank(newCards.filter(isGlueCard));
    const rest = sortByRank(
      newCards.filter((card) => !isHookCard(card) && !isGlueCard(card))
    );

    const hookTarget = Math.max(1, Math.round(slots * HOOK_NEW_RATIO));
    const glueTarget = Math.max(0, slots - hookTarget);
    const ids = [];
    let hi = 0;
    let gi = 0;
    let ri = 0;
    let hooksTaken = 0;
    let glueTaken = 0;
    // Start with a hook when possible - first impression should be memorable.
    let nextHook = true;

    while (ids.length < slots) {
      const canHook = hooksTaken < hookTarget && hi < hooks.length;
      const canGlue = glueTaken < glueTarget && gi < glue.length;

      if (canHook && (nextHook || !canGlue)) {
        ids.push(hooks[hi].id);
        hi += 1;
        hooksTaken += 1;
        nextHook = false;
        continue;
      }
      if (canGlue) {
        ids.push(glue[gi].id);
        gi += 1;
        glueTaken += 1;
        nextHook = true;
        continue;
      }
      // Targets filled or one side exhausted - drain remaining pools.
      if (hi < hooks.length) {
        ids.push(hooks[hi].id);
        hi += 1;
        continue;
      }
      if (gi < glue.length) {
        ids.push(glue[gi].id);
        gi += 1;
        continue;
      }
      if (ri < rest.length) {
        ids.push(rest[ri].id);
        ri += 1;
        continue;
      }
      break;
    }

    return ids;
  }

  function buildDailyQueue(dueCards, goal, allCards = dueCards, options = {}) {
    if (!goal) return [];

    const randomFn = options.randomFn || Math.random;
    const excludedIds = options.excludedIds || new Set();
    const introducedCount = getIntroducedCount(allCards);

    const eligible = dueCards
      .filter((card) => !excludedIds.has(card.id))
      .slice()
      .sort(compareCardsForPractice);

    // Due reviews first (true Leitner pressure), then new introductions.
    const dueReviews = eligible.filter((card) => !isNewCard(card));
    const dueNew = eligible.filter((card) => isNewCard(card));
    const reviewIds = dueReviews.slice(0, goal).map((card) => card.id);
    const newSlots = Math.max(0, goal - reviewIds.length);

    if (newSlots <= 0) return reviewIds;

    // - - Early "hook mix": memorable content + necessary glue - - 
    if (introducedCount < HOOK_INTRO_THRESHOLD) {
      // Interleave already avoids particle walls; tiny local swaps keep it human.
      const hookIds = buildHookMixedNewIds(dueNew, newSlots);
      const mixed = hookIds.slice();
      for (let i = 1; i < mixed.length; i += 2) {
        if (randomFn() < 0.25) {
          const tmp = mixed[i - 1];
          mixed[i - 1] = mixed[i];
          mixed[i] = tmp;
        }
      }
      return reviewIds.concat(mixed);
    }

    // - - Mature path: frequency core + small spice - - 
    const spiceSlots = getSpiceSlotCount(introducedCount, newSlots, randomFn);
    const coreSlots = Math.max(0, newSlots - spiceSlots);
    const coreNew = sortByRank(dueNew).slice(0, coreSlots);
    const coreIds = coreNew.map((card) => card.id);
    const usedIds = new Set(coreIds.concat(reviewIds));

    if (!spiceSlots) return reviewIds.concat(coreIds);

    const spiceRankMin = getSpiceRankThreshold(allCards);
    const spiceCandidates = dueNew.filter(
      (card) =>
        !usedIds.has(card.id) &&
        (Number(card.rank) || 99999) >= spiceRankMin
    );

    const spiceIds = pickSpiceCardIds(spiceCandidates, spiceSlots, randomFn);
    const newIds = interleaveQueueIds(coreIds, spiceIds, randomFn);
    return reviewIds.concat(newIds);
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
    HOOK_INTRO_THRESHOLD,
    HOOK_RANK_MIN,
    HOOK_RANK_MAX,
    daysToMs,
    getLocalDayStartAfterDays,
    getLocalDayKey,
    scheduleNextReview,
    isNewCard,
    isDue,
    isHookCard,
    isGlueCard,
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