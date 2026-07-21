/**
 * Lightweight checks for Hear/Speak routing helpers.
 * Run: node tests/tts-routing.js
 * (No browser - pure logic only.)
 */

function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exitCode = 1;
  } else {
    console.log("ok:", msg);
  }
}

// Mirror neuralPlaybackProfile from app.js (keep in sync when changing rates)
function neuralPlaybackProfile(gender) {
  if (gender === "male") {
    return { playbackRate: 0.84, volume: 1 };
  }
  return { playbackRate: 1.06, volume: 1 };
}

function googleTtsUrl(text, langTag) {
  const isNb = /^(nb|nn|no)([-_]|$)/i.test(String(langTag || ""));
  const tl = isNb ? "nb" : String(langTag || "en").split(/[-_]/)[0] || "en";
  return (
    "https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=" +
    encodeURIComponent(tl) +
    "&q=" +
    encodeURIComponent(text)
  );
}

const male = neuralPlaybackProfile("male");
const female = neuralPlaybackProfile("female");

assert(male.volume === 1 && female.volume === 1, "both genders full volume");
assert(male.playbackRate < female.playbackRate, "male rate slower than female (audible cue)");
assert(female.playbackRate - male.playbackRate >= 0.15, "gender rate gap is clearly audible");

const url = googleTtsUrl("Hei", "nb-NO");
assert(url.includes("tl=nb"), "Norwegian TTS uses tl=nb");
assert(url.includes("q=Hei"), "query encodes text");

const enUrl = googleTtsUrl("Hello", "en-US");
assert(enUrl.includes("tl=en"), "English TTS uses tl=en");

console.log(process.exitCode ? "\nSome checks failed." : "\nAll tts-routing checks passed.");
