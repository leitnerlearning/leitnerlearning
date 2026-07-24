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
 * 3. Prefer short everyday words so both chips stay on one row.
 * 4. Renderer hard-caps at 2 even if data has more (safety net).
 * 5. MED tray, not a course:
 *    MUST  = breaks English transfer in the first week of reading
 *    SHOULD = high-frequency digraphs / lookalikes in the core 1k
 *    COULD  = rare diphthongs, tone, typing tricks, listening quirks → omit from Basics
 *    Prefer ≤ ~14 rows; if more, something is course not tray.
 * 6. No instructional chrome (no “tap to hear” copy).
 */
(function () {
  window.LANGUAGE_BASICS = window.LANGUAGE_BASICS || {};

  /**
   * Norwegian (Bokmål) — excellence bar (MED tray, not a course).
   * MUST + SHOULD only: what breaks English transfer in early reading.
   * Dropped COULD: au, ai, stress, tone, typing (ae/oe/aa), det.
   * Exactly 2 examples per row. Glyph label only; words hear.
   */
  window.LANGUAGE_BASICS["nb-bokmal"] = {
    previewGlyphs: ["æ", "ø", "å"],
    sections: [
      {
        title: "Special",
        items: [
          {
            glyph: "æ",
            speak: "ære",
            approxHtml: "<strong>a</strong> in <em>cat</em>",
            examples: [
              { speak: "ære", text: "ære", gloss: "honor" },
              { speak: "være", text: "være", gloss: "be" },
            ],
          },
          {
            glyph: "ø",
            speak: "øl",
            approxHtml: "<strong>u</strong> in <em>burn</em> · rounded",
            examples: [
              { speak: "øl", text: "øl", gloss: "beer" },
              { speak: "søster", text: "søster", gloss: "sister" },
            ],
          },
          {
            glyph: "å",
            speak: "år",
            approxHtml: "<strong>o</strong> in <em>or</em>",
            examples: [
              { speak: "år", text: "år", gloss: "year" },
              { speak: "gå", text: "gå", gloss: "go" },
            ],
          },
        ],
      },
      {
        title: "Surprises",
        compact: true,
        items: [
          {
            glyph: "j",
            speak: "ja",
            glyphSize: "sm",
            approxHtml: "<strong>y</strong> in <em>yes</em>",
            examples: [
              { speak: "ja", text: "ja", gloss: "yes" },
              { speak: "jeg", text: "jeg", gloss: "I" },
            ],
          },
          {
            glyph: "y",
            speak: "by",
            glyphSize: "sm",
            approxHtml: "<strong>ee</strong> · rounded lips",
            examples: [
              { speak: "by", text: "by", gloss: "town" },
              { speak: "syk", text: "syk", gloss: "sick" },
            ],
          },
          {
            glyph: "r",
            speak: "rød",
            glyphSize: "sm",
            approxHtml: "Tapped · not English <span class=\"basics-letter\">r</span>",
            examples: [
              { speak: "rød", text: "rød", gloss: "red" },
              { speak: "bra", text: "bra", gloss: "good" },
            ],
          },
        ],
      },
      {
        title: "Pairs",
        compact: true,
        items: [
          {
            glyph: "kj",
            speak: "kjøpe",
            glyphSize: "pair",
            approxHtml: "Soft <strong>h</strong> · <em>huge</em>",
            examples: [
              { speak: "kjøpe", text: "kjøpe", gloss: "buy" },
              { speak: "kjøkken", text: "kjøkken", gloss: "kitchen" },
            ],
          },
          {
            glyph: "skj",
            speak: "skje",
            glyphSize: "pair",
            approxHtml: "<strong>sh</strong>",
            examples: [
              { speak: "skje", text: "skje", gloss: "spoon" },
              { speak: "ski", text: "ski", gloss: "ski" },
            ],
          },
          {
            glyph: "sk",
            speak: "skole",
            glyphSize: "pair",
            approxHtml: "Hard <strong>sk</strong> before a o u å",
            examples: [
              { speak: "skole", text: "skole", gloss: "school" },
              { speak: "skatt", text: "skatt", gloss: "tax" },
            ],
          },
          {
            glyph: "hj",
            speak: "hjem",
            glyphSize: "pair",
            approxHtml: "Silent <strong>h</strong> · <strong>y</strong>",
            examples: [
              { speak: "hjem", text: "hjem", gloss: "home" },
              { speak: "hjelp", text: "hjelp", gloss: "help" },
            ],
          },
          {
            glyph: "hv",
            speak: "hva",
            glyphSize: "pair",
            approxHtml: "Silent <strong>h</strong> · <strong>v</strong>",
            examples: [
              { speak: "hva", text: "hva", gloss: "what" },
              { speak: "hvor", text: "hvor", gloss: "where" },
            ],
          },
          {
            glyph: "gj",
            speak: "gjøre",
            glyphSize: "pair",
            approxHtml: "Soft · often <strong>y</strong>",
            examples: [
              { speak: "gjøre", text: "gjøre", gloss: "do" },
              { speak: "gjennom", text: "gjennom", gloss: "through" },
            ],
          },
          {
            glyph: "ei",
            speak: "nei",
            glyphSize: "pair",
            approxHtml: "<strong>ay</strong> in <em>say</em>",
            examples: [
              { speak: "nei", text: "nei", gloss: "no" },
              { speak: "vei", text: "vei", gloss: "road" },
            ],
          },
          {
            glyph: "øy",
            speak: "høy",
            glyphSize: "pair",
            approxHtml: "<strong>ø</strong> + <strong>y</strong>",
            examples: [
              { speak: "høy", text: "høy", gloss: "high" },
              { speak: "øy", text: "øy", gloss: "island" },
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
