/**
 * Learning tracks available in Leitner Learning.
 * Only categories with `available: true` can be selected today.
 * Order: closest to Norwegian first, then other Western European languages.
 */
const LEARNING_CATEGORIES = [
  {
    id: "nb-bokmal",
    label: "Norwegian · Bokmål",
    available: true,
    foreignLang: "nb",
    speechLang: "nb-NO",
    answerLang: "en-US",
    promptLabel: "Norwegian → English",
    reversePromptLabel: "English → Norwegian",
    panelLead:
      "1,000 common Norwegian words\nThe first 500 cover most of what shows up in our stories\nLearn them all and the stories get much easier",
    deckTitle: "Norwegian essentials",
    deckBlurb: "from everyday Bokmål, based on",
    starterPreviewLead: "The fifty words you hear most often.",
    foreignFieldLabel: "Norwegian word or phrase",
    nativeFieldLabel: "English meaning",
    answerLanguageName: "English",
    learningLanguageName: "Norwegian",
    reverseAnswerLang: "nb-NO",
    nativeSpeechLang: "en-US",
    hearLabel: "Hear",
    hearTitle: "Hear the Norwegian word",
    reverseHearTitle: "Hear the English prompt",
    speakTitle: "Speak your answer in English",
    reverseSpeakTitle: "Speak your answer in Norwegian",
    resetConfirm: {
      verb: "Reset",
      storyTitle: "Deck",
      note: "Your progress and any words you added will be cleared.",
    },
    bandExamples: {
      A: "jeg, det, er, du, ikke…",
      E: "universitet, student, nordlys, økologi…",
      F: "sjøen, prinsessen, biblioteket, snakkes…",
      phrase: "god morgen, jeg studerer, på Nord universitet…",
    },
  },
  { id: "sv", label: "Swedish", available: false },
  { id: "da", label: "Danish", available: false },
  { id: "de", label: "German", available: false },
  { id: "fr", label: "French", available: false },
  { id: "es", label: "Spanish", available: false },
  { id: "it", label: "Italian", available: false },
];

const ACTIVE_CATEGORY_KEY = "leitner-learning-active-category";

function getCategoryById(id) {
  return LEARNING_CATEGORIES.find((cat) => cat.id === id) || LEARNING_CATEGORIES[0];
}

function getActiveCategoryId() {
  try {
    const saved = localStorage.getItem(ACTIVE_CATEGORY_KEY);
    const match = getCategoryById(saved);
    return match.available ? match.id : LEARNING_CATEGORIES[0].id;
  } catch {
    return LEARNING_CATEGORIES[0].id;
  }
}

function setActiveCategoryId(id) {
  try {
    localStorage.setItem(ACTIVE_CATEGORY_KEY, id);
  } catch {
    // Private browsing or storage blocked — session still works in memory.
  }
}