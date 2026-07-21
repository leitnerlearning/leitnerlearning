/**
 * Smoke test for add-card spelling review helpers.
 * Run: node tests/spelling-review-smoke.js
 */

function normalizeAnswer(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:'"“”‘’]/g, "")
    .replace(/\s+/g, " ");
}

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

function foldNorwegianDigraphs(t) {
  return normalizeAnswer(t).replace(/æ/g, "ae").replace(/ø/g, "oe").replace(/å/g, "aa");
}
function foldNorwegianLoose(t) {
  return foldNorwegianDigraphs(t).replace(/aa/g, "a").replace(/ae/g, "a").replace(/oe/g, "o");
}
function norwegianTypingMatches(a, b) {
  return foldNorwegianLoose(a) === foldNorwegianLoose(b);
}
function englishDialectSpellingMatches() {
  return false;
}
function particleAnswerMatches(a, b) {
  return normalizeAnswer(a) === normalizeAnswer(b);
}
function glossPartsMatch(a, b) {
  return normalizeAnswer(a) === normalizeAnswer(b);
}
function englishInflectionMatch(a, b) {
  const x = normalizeAnswer(a);
  const y = normalizeAnswer(b);
  if (!x || !y || x.includes(" ") || y.includes(" ")) return false;
  if (x === y) return true;
  if (x + "s" === y || y + "s" === x) return true;
  return false;
}

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

function reviewTokens(text) {
  return normalizeAnswer(String(text || ""))
    .split(" ")
    .filter(Boolean);
}

function softTokenMatch(a, b, minEditLen = 5) {
  if (!a || !b) return false;
  const x = normalizeAnswer(a);
  const y = normalizeAnswer(b);
  if (!x || !y) return false;
  if (x === y) return true;
  if (norwegianTypingMatches(x, y)) return true;
  if (englishInflectionMatch(x, y)) return true;
  if (withinOneEdit(x, y, minEditLen)) return true;
  return false;
}

function softGlossMatch(a, b) {
  if (!a || !b) return false;
  if (glossPartsMatch(a, b)) return true;
  const partsA = String(a)
    .split("/")
    .map((p) => p.trim())
    .filter(Boolean);
  const partsB = String(b)
    .split("/")
    .map((p) => p.trim())
    .filter(Boolean);
  for (const left of partsA) {
    for (const right of partsB) {
      if (englishInflectionMatch(left, right)) return true;
      if (withinOneEdit(left, right)) return true;
      const wl = reviewTokens(left);
      const wr = reviewTokens(right);
      if (wl.length >= 2 && wl.length === wr.length && wl.every((w, i) => softTokenMatch(w, wr[i], 4))) {
        return true;
      }
    }
  }
  return false;
}

function reviewGlossCompare(user, suggested) {
  if (!user || !suggested) return { exact: false, soft: false, spellingOnly: false };
  const u = stripFlashcardPunctuation(user);
  const s = stripFlashcardPunctuation(suggested);
  if (!u || !s) return { exact: false, soft: false, spellingOnly: false };
  if (normalizeAnswer(u) === normalizeAnswer(s)) return { exact: true, soft: true, spellingOnly: false };
  if (glossPartsMatch(u, s)) return { exact: true, soft: true, spellingOnly: false };
  const wu = reviewTokens(u);
  const ws = reviewTokens(s);
  if (wu.length >= 2 && wu.length === ws.length) {
    let allExact = true;
    for (let i = 0; i < wu.length; i += 1) {
      if (wu[i] === ws[i]) continue;
      allExact = false;
      if (!softTokenMatch(wu[i], ws[i], 4)) {
        return { exact: false, soft: false, spellingOnly: false };
      }
    }
    return { exact: allExact, soft: true, spellingOnly: !allExact };
  }
  if (wu.length === 1 && ws.length === 1) {
    if (softTokenMatch(wu[0], ws[0], 5) || softTokenMatch(wu[0], ws[0], 4)) {
      return { exact: false, soft: true, spellingOnly: true };
    }
  }
  if (softGlossMatch(u, s)) return { exact: false, soft: true, spellingOnly: true };
  return { exact: false, soft: false, spellingOnly: false };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const feal = reviewGlossCompare(
  "do you feel the way i feal",
  "Do you feel the way I feel?"
);
assert(feal.soft === true, "feal phrase should soft-match");
assert(feal.spellingOnly === true, "feal phrase should be spellingOnly");
assert(feal.exact === false, "feal phrase should not be exact");

const good = reviewGlossCompare("hello", "Hello");
assert(good.exact === true, "hello should be exact");
assert(good.spellingOnly === false, "hello should not be spellingOnly");

const feel = reviewGlossCompare("feal", "feel");
assert(feel.soft === true, "feal/feel single should soft-match");
assert(feel.spellingOnly === true, "feal/feel should be spellingOnly");

const diff = reviewGlossCompare(
  "completely different phrase here",
  "Do you feel the way I feel?"
);
assert(diff.soft === false, "unrelated phrases should not soft-match");

assert(
  softGlossMatch("do you feel the way i feal", "do you feel the way i feel") === true,
  "softGlossMatch multi-word typo"
);

console.log("spelling-review-smoke: all passed");
