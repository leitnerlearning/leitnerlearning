/**
 * Language basics (letters & sounds) for the Progress Basics modal.
 * Rendered by renderLanguageBasics() into #basics-body.
 *
 * Shape:
 *   LANGUAGE_BASICS[categoryId] = {
 *     previewGlyphs?: string[],
 *     sections: [{
 *       title, compact?,
 *       items: [{
 *         glyph, speak?, glyphSize?: "sm"|"pair",
 *         approxHtml,
 *         examples: [{ speak, text?, gloss }]  // EXACTLY 2 (see law below)
 *       }]
 *     }]
 *   }
 *
 * ── Excellence law (all 10 languages) ──
 * 1. Glyph = visual label only (not tappable). Hearing = example words only.
 * 2. Exactly TWO examples per item (primary + secondary). Never 3+.
 *    - Prevents orphan wrap (3+1 or 3 alone on line two) on phone and desktop.
 *    - Enough to teach; more belongs on a second glyph row (e.g. hj and hv separate).
 * 3. Prefer short everyday words so both chips stay on one row.
 * 4. Renderer hard-caps at 2 even if data has more (safety net).
 */
(function () {
  window.LANGUAGE_BASICS = window.LANGUAGE_BASICS || {};

  /**
   * Norwegian (Bokmål) — excellence bar for all languages.
   * Exactly 2 examples per row (see file header law). hj and hv are separate rows.
   */
  window.LANGUAGE_BASICS["nb-bokmal"] = {
    previewGlyphs: ["æ", "ø", "å"],
    sections: [
      {
        title: "Special letters",
        items: [
          {
            glyph: "æ",
            speak: "ære",
            approxHtml: "Like <strong>a</strong> in <em>cat</em> · lips flatter than <span class=\"basics-letter\">e</span>",
            examples: [
              { speak: "ære", text: "ære", gloss: "honor" },
              { speak: "være", text: "være", gloss: "to be" },
            ],
          },
          {
            glyph: "ø",
            speak: "øl",
            approxHtml: "Like <strong>u</strong> in <em>burn</em> · lips rounded",
            examples: [
              { speak: "øl", text: "øl", gloss: "beer" },
              { speak: "søster", text: "søster", gloss: "sister" },
            ],
          },
          {
            glyph: "å",
            speak: "år",
            approxHtml: "Like <strong>o</strong> in <em>or</em> / British <em>law</em>",
            examples: [
              { speak: "år", text: "år", gloss: "year" },
              { speak: "gå", text: "gå", gloss: "to go" },
            ],
          },
        ],
      },
      {
        title: "Letters that surprise English ears",
        compact: true,
        items: [
          {
            glyph: "j",
            speak: "ja",
            glyphSize: "sm",
            approxHtml: "Always <strong>y</strong> in <em>yes</em> · never English <span class=\"basics-letter\">j</span>",
            examples: [
              { speak: "ja", text: "ja", gloss: "yes" },
              { speak: "jeg", text: "jeg", gloss: "I" },
            ],
          },
          {
            glyph: "y",
            speak: "by",
            glyphSize: "sm",
            approxHtml: "Like <strong>ee</strong> in <em>see</em> · lips rounded (French <em>u</em>)",
            examples: [
              { speak: "by", text: "by", gloss: "town" },
              { speak: "syk", text: "syk", gloss: "sick" },
            ],
          },
          {
            glyph: "r",
            speak: "rød",
            glyphSize: "sm",
            approxHtml:
              "Tapped or rolled · not English <span class=\"basics-letter\">r</span>",
            examples: [
              { speak: "rød", text: "rød", gloss: "red" },
              { speak: "bra", text: "bra", gloss: "good" },
            ],
          },
        ],
      },
      {
        title: "Soft and hard pairs",
        compact: true,
        items: [
          {
            glyph: "kj",
            speak: "kjøpe",
            glyphSize: "pair",
            approxHtml: "Soft <strong>h</strong> · like the start of <em>huge</em> (<em>hyuge</em>)",
            examples: [
              { speak: "kjøpe", text: "kjøpe", gloss: "to buy" },
              { speak: "kjøkken", text: "kjøkken", gloss: "kitchen" },
            ],
          },
          {
            glyph: "skj",
            speak: "skje",
            glyphSize: "pair",
            approxHtml: "<strong>sh</strong> · also <em>ski</em>, <em>sky</em> before front vowels",
            examples: [
              { speak: "skje", text: "skje", gloss: "spoon" },
              { speak: "ski", text: "ski", gloss: "ski" },
            ],
          },
          {
            glyph: "sk",
            speak: "skole",
            glyphSize: "pair",
            approxHtml: "Hard <strong>sk</strong> before <em>a o u å</em>",
            examples: [
              { speak: "skole", text: "skole", gloss: "school" },
              { speak: "skatt", text: "skatt", gloss: "tax" },
            ],
          },
          {
            glyph: "hj",
            speak: "hjem",
            glyphSize: "pair",
            approxHtml: "<strong>h</strong> silent · sounds like <strong>y</strong> in <em>yes</em>",
            examples: [
              { speak: "hjem", text: "hjem", gloss: "home" },
              { speak: "hjelp", text: "hjelp", gloss: "help" },
            ],
          },
          {
            glyph: "hv",
            speak: "hva",
            glyphSize: "pair",
            approxHtml: "<strong>h</strong> silent · sounds like <strong>v</strong>",
            examples: [
              { speak: "hva", text: "hva", gloss: "what" },
              { speak: "hvor", text: "hvor", gloss: "where" },
            ],
          },
          {
            glyph: "gj",
            speak: "gjøre",
            glyphSize: "pair",
            approxHtml: "Soft · often like <strong>y</strong> before front vowels",
            examples: [
              { speak: "gjøre", text: "gjøre", gloss: "to do" },
              { speak: "gjennom", text: "gjennom", gloss: "through" },
            ],
          },
        ],
      },
      {
        title: "Vowel pairs",
        compact: true,
        items: [
          {
            glyph: "ei",
            speak: "nei",
            glyphSize: "pair",
            approxHtml: "Like <strong>ay</strong> in <em>say</em>",
            examples: [
              { speak: "nei", text: "nei", gloss: "no" },
              { speak: "vei", text: "vei", gloss: "road" },
            ],
          },
          {
            glyph: "øy",
            speak: "høy",
            glyphSize: "pair",
            approxHtml: "<strong>ø</strong> then a quick <strong>y</strong> (yes-sound)",
            examples: [
              { speak: "høy", text: "høy", gloss: "high" },
              { speak: "øy", text: "øy", gloss: "island" },
            ],
          },
          {
            glyph: "au",
            speak: "sau",
            glyphSize: "pair",
            approxHtml: "Like <strong>ow</strong> in <em>how</em>",
            examples: [
              { speak: "sau", text: "sau", gloss: "sheep" },
              { speak: "august", text: "august", gloss: "August" },
            ],
          },
          {
            glyph: "ai",
            speak: "mai",
            glyphSize: "pair",
            approxHtml: "Like <strong>eye</strong> · less common than <em>ei</em>",
            examples: [
              { speak: "mai", text: "mai", gloss: "May" },
              { speak: "hai", text: "hai", gloss: "shark" },
            ],
          },
        ],
      },
      {
        title: "Rhythm & typing",
        compact: true,
        items: [
          {
            glyph: "stress",
            speak: "norsk",
            glyphSize: "pair",
            approxHtml: "Usually on the <strong>first</strong> syllable of the root",
            examples: [
              { speak: "norsk", text: "norsk", gloss: "Norwegian" },
              { speak: "skole", text: "skole", gloss: "school" },
            ],
          },
          {
            glyph: "tone",
            speak: "bønder",
            glyphSize: "pair",
            approxHtml: "Light pitch accent · listen more than you analyse",
            examples: [
              { speak: "bønder", text: "bønder", gloss: "farmers" },
              { speak: "bønner", text: "bønner", gloss: "beans" },
            ],
          },
          {
            glyph: "ae oe aa",
            speak: "være",
            glyphSize: "pair",
            approxHtml: "When you can’t type æ/ø/å · still the same letters",
            examples: [
              { speak: "være", text: "være", gloss: "to be" },
              { speak: "år", text: "år", gloss: "year" },
            ],
          },
          {
            glyph: "det / de",
            speak: "det",
            glyphSize: "pair",
            approxHtml: "<em>det</em> often sounds like <strong>de</strong> · spelling keeps the <span class=\"basics-letter\">t</span>",
            examples: [
              { speak: "det", text: "det", gloss: "it / that" },
              { speak: "de", text: "de", gloss: "they" },
            ],
          },
        ],
      },
    ],
  };

  /** Minimal stubs so Basics is available for every selectable language. */
  window.LANGUAGE_BASICS.sv = {
    sections: [
      {
        title: "Special letters",
        items: [
          {
            glyph: "å",
            speak: "å",
            approxHtml: "<strong>o</strong> in <em>or</em>",
            examples: [
              { speak: "år", text: "år", gloss: "year" },
              { speak: "gå", text: "gå", gloss: "go" },
            ],
          },
          {
            glyph: "ä",
            speak: "ä",
            approxHtml: "<strong>a</strong> in <em>cat</em>",
            examples: [
              { speak: "är", text: "är", gloss: "is / are" },
              { speak: "här", text: "här", gloss: "here" },
            ],
          },
          {
            glyph: "ö",
            speak: "ö",
            approxHtml: "<strong>uh</strong>, lips rounded",
            examples: [
              { speak: "öga", text: "öga", gloss: "eye" },
              { speak: "hör", text: "hör", gloss: "hear" },
            ],
          },
        ],
      },
    ],
  };

  window.LANGUAGE_BASICS.da = {
    sections: [
      {
        title: "Special letters",
        items: [
          {
            glyph: "æ",
            speak: "æ",
            approxHtml: "<strong>a</strong> in <em>cat</em>",
            examples: [
              { speak: "ære", text: "ære", gloss: "honor" },
              { speak: "være", text: "være", gloss: "be" },
            ],
          },
          {
            glyph: "ø",
            speak: "ø",
            approxHtml: "<strong>uh</strong>, lips rounded",
            examples: [
              { speak: "øl", text: "øl", gloss: "beer" },
              { speak: "søster", text: "søster", gloss: "sister" },
            ],
          },
          {
            glyph: "å",
            speak: "å",
            approxHtml: "<strong>o</strong> in <em>or</em>",
            examples: [
              { speak: "år", text: "år", gloss: "year" },
              { speak: "gå", text: "gå", gloss: "go" },
            ],
          },
        ],
      },
    ],
  };

  window.LANGUAGE_BASICS.de = {
    sections: [
      {
        title: "Special letters",
        items: [
          {
            glyph: "ä",
            speak: "ä",
            approxHtml: "<strong>e</strong> in <em>bed</em>",
            examples: [
              { speak: "Männer", text: "Männer", gloss: "men" },
              { speak: "spät", text: "spät", gloss: "late" },
            ],
          },
          {
            glyph: "ö",
            speak: "ö",
            approxHtml: "<strong>uh</strong>, lips rounded",
            examples: [
              { speak: "schön", text: "schön", gloss: "beautiful" },
              { speak: "hören", text: "hören", gloss: "hear" },
            ],
          },
          {
            glyph: "ü",
            speak: "ü",
            approxHtml: "<strong>ee</strong>, lips rounded",
            examples: [
              { speak: "über", text: "über", gloss: "over" },
              { speak: "müde", text: "müde", gloss: "tired" },
            ],
          },
          {
            glyph: "ß",
            speak: "ss",
            approxHtml: "Sharp <strong>s</strong> (ess-tsett)",
            examples: [
              { speak: "Straße", text: "Straße", gloss: "street" },
              { speak: "groß", text: "groß", gloss: "big" },
            ],
          },
        ],
      },
    ],
  };

  window.LANGUAGE_BASICS.fr = {
    sections: [
      {
        title: "Special letters",
        items: [
          {
            glyph: "é",
            speak: "é",
            approxHtml: "<strong>ay</strong> in <em>day</em>",
            examples: [
              { speak: "café", text: "café", gloss: "coffee" },
              { speak: "été", text: "été", gloss: "summer" },
            ],
          },
          {
            glyph: "è",
            speak: "è",
            approxHtml: "<strong>e</strong> in <em>bed</em>",
            examples: [
              { speak: "père", text: "père", gloss: "father" },
              { speak: "très", text: "très", gloss: "very" },
            ],
          },
          {
            glyph: "ç",
            speak: "ç",
            approxHtml: "Soft <strong>s</strong> before a/o/u",
            examples: [
              { speak: "français", text: "français", gloss: "French" },
              { speak: "garçon", text: "garçon", gloss: "boy" },
            ],
          },
        ],
      },
    ],
  };

  window.LANGUAGE_BASICS.es = {
    sections: [
      {
        title: "Special letters",
        items: [
          {
            glyph: "ñ",
            speak: "ñ",
            approxHtml: "<strong>ny</strong> in <em>canyon</em>",
            examples: [
              { speak: "año", text: "año", gloss: "year" },
              { speak: "español", text: "español", gloss: "Spanish" },
            ],
          },
          {
            glyph: "¿ ¡",
            speak: "hola",
            glyphSize: "pair",
            approxHtml: "Opening question / exclamation marks",
            examples: [
              { speak: "¿Cómo?", text: "¿Cómo?", gloss: "How?" },
              { speak: "¡Hola!", text: "¡Hola!", gloss: "Hello!" },
            ],
          },
        ],
      },
    ],
  };

  window.LANGUAGE_BASICS.it = {
    sections: [
      {
        title: "Special letters",
        items: [
          {
            glyph: "à è ì",
            speak: "città",
            glyphSize: "pair",
            approxHtml: "Accent marks the stressed vowel",
            examples: [
              { speak: "città", text: "città", gloss: "city" },
              { speak: "caffè", text: "caffè", gloss: "coffee" },
            ],
          },
          {
            glyph: "gli",
            speak: "figlio",
            glyphSize: "pair",
            approxHtml: "Like <strong>lli</strong> in <em>million</em>",
            examples: [
              { speak: "figlio", text: "figlio", gloss: "son" },
              { speak: "famiglia", text: "famiglia", gloss: "family" },
            ],
          },
          {
            glyph: "gn",
            speak: "bagno",
            glyphSize: "pair",
            approxHtml: "<strong>ny</strong> in <em>canyon</em>",
            examples: [
              { speak: "bagno", text: "bagno", gloss: "bathroom" },
              { speak: "ogni", text: "ogni", gloss: "every" },
            ],
          },
        ],
      },
    ],
  };
})();
