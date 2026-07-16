#!/usr/bin/env node
"use strict";

const Srs = require("../srs-core.js");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    failed += 1;
    console.error(`FAIL: ${message}`);
    return;
  }
  passed += 1;
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return function random() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry32(42);
const now = Date.parse("2026-01-01T10:00:00");

function testSchedulingIntervals() {
  assert(Srs.scheduleNextReview(1, now) === now, "box 1 schedules same day");
  assert(
    Srs.scheduleNextReview(2, now) === Srs.getLocalDayStartAfterDays(1, new Date(now)),
    "box 2 schedules tomorrow midnight"
  );
  assert(
    Srs.scheduleNextReview(6, now) === Srs.getLocalDayStartAfterDays(30, new Date(now)),
    "box 6 schedules 30 days out"
  );
}

function testFrequencyOrdering() {
  const cards = Srs.createStarterDeck(40, now);
  const queue = Srs.buildDailyQueue(Srs.getDueCards(cards, now), 10, cards, { randomFn: () => 1 });
  const ranks = queue
    .map((id) => cards.find((card) => card.id === id))
    .filter((card) => Srs.isNewCard(card))
    .map((card) => card.rank);

  for (let i = 1; i < ranks.length; i += 1) {
    assert(ranks[i] >= ranks[i - 1], "core new cards stay frequency-ordered");
  }
}

function testSpiceProgression() {
  const cards = Srs.createStarterDeck(300, now);
  for (let i = 0; i < 20; i += 1) {
    cards[i] = Srs.promote(cards[i], now);
  }

  const due = Srs.getDueCards(cards, now);
  const queue = Srs.buildDailyQueue(due, 20, cards, { randomFn: random });
  const threshold = Srs.getSpiceRankThreshold(cards);
  const spiceCount = queue.filter((id) => {
    const card = cards.find((entry) => entry.id === id);
    return card && Srs.isNewCard(card) && card.rank >= threshold;
  }).length;

  assert(spiceCount > 0, "spice appears after enough introductions");
  assert(spiceCount <= Srs.SPICE_MAX_PER_DAY, "spice respects daily cap");
}

function testNoEarlySpice() {
  const cards = Srs.createStarterDeck(120, now);
  for (let i = 0; i < 5; i += 1) {
    cards[i] = Srs.promote(cards[i], now);
  }

  const due = Srs.getDueCards(cards, now);
  const queue = Srs.buildDailyQueue(due, 20, cards, { randomFn: random });
  const threshold = Srs.getSpiceRankThreshold(cards);
  const spiceCount = queue.filter((id) => {
    const card = cards.find((entry) => entry.id === id);
    return card && Srs.isNewCard(card) && card.rank >= threshold;
  }).length;

  assert(spiceCount === 0, "no spice before introduction threshold");
}

function testLongRunSimulation() {
  const result = Srs.simulateSchedule({
    days: 120,
    deckSize: 200,
    startMs: now,
    skipEvery: 7,
    randomFn: random,
    accuracy: 0.88,
  });

  assert(result.introduced >= 80, "regular study introduces a solid chunk of the deck");
  assert(result.mastered >= 5, "some cards reach mastered over time");
  assert(
    result.spiceCounts.every((count) => count <= Srs.SPICE_MAX_PER_DAY),
    "simulation never exceeds spice cap"
  );
}

function testPromotionAndDemotion() {
  const card = Srs.createSimCard(1, 1, now);
  const promoted = Srs.promote(card, now);
  assert(promoted.box === 2, "promote advances a box");
  assert(promoted.nextReviewAt > now, "promoted card leaves same-day queue");

  const demoted = Srs.demote(promoted, now);
  assert(demoted.box === 1, "demote returns to box 1");
  assert(demoted.nextReviewAt === now, "demoted card is due immediately");
}

testSchedulingIntervals();
testFrequencyOrdering();
testNoEarlySpice();
testSpiceProgression();
testPromotionAndDemotion();
testLongRunSimulation();

console.log(`SRS simulation: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);