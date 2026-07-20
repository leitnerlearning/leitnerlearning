/**
 * Language basics (letters & sounds) for the Progress Basics modal.
 * Rendered by renderLanguageBasics() into #basics-body.
 *
 * Shape:
 *   LANGUAGE_BASICS[categoryId] = {
 *     sections: [{
 *       title, compact?,
 *       items: [{
 *         glyph, speak?, glyphSize?: "sm"|"pair",
 *         approxHtml,
 *         examples: [{ speak, text?, gloss }]
 *       }]
 *     }]
 *   }
 */
(function () {
  window.LANGUAGE_BASICS = window.LANGUAGE_BASICS || {};

  window.LANGUAGE_BASICS["nb-bokmal"] = {
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
      {
        title: "Same shape, different sound",
        compact: true,
        items: [
          {
            glyph: "j",
            speak: "j",
            glyphSize: "sm",
            approxHtml: "<strong>y</strong> in <em>yes</em>",
            examples: [
              { speak: "ja", text: "ja", gloss: "yes" },
              { speak: "jeg", text: "jeg", gloss: "I" },
            ],
          },
          {
            glyph: "y",
            speak: "y",
            glyphSize: "sm",
            approxHtml: "<strong>ee</strong> in <em>see</em>, lips rounded",
            examples: [
              { speak: "by", text: "by", gloss: "town" },
              { speak: "syk", text: "syk", gloss: "sick" },
            ],
          },
          {
            glyph: "r",
            speak: "r",
            glyphSize: "sm",
            approxHtml:
              'Tapped or rolled · not English <span class="basics-letter">r</span>',
            examples: [
              { speak: "rød", text: "rød", gloss: "red" },
              { speak: "bra", text: "bra", gloss: "good" },
            ],
          },
        ],
      },
      {
        title: "Letter pairs",
        compact: true,
        items: [
          {
            glyph: "kj",
            speak: "kj",
            glyphSize: "pair",
            approxHtml: "Soft <strong>h</strong> in <em>huge</em> (<em>hyuge</em>)",
            examples: [
              { speak: "kjøpe", text: "kjøpe", gloss: "buy" },
              { speak: "kjøkken", text: "kjøkken", gloss: "kitchen" },
            ],
          },
          {
            glyph: "skj",
            speak: "skje",
            glyphSize: "pair",
            approxHtml: "<strong>sh</strong> · same for <em>ski</em>, <em>sky</em>",
            examples: [
              { speak: "skje", text: "skje", gloss: "spoon" },
              { speak: "ski", text: "ski", gloss: "" },
              { speak: "sky", text: "sky", gloss: "cloud" },
            ],
          },
          {
            glyph: "sk",
            speak: "skole",
            glyphSize: "pair",
            approxHtml: "Hard <strong>sk</strong> before a/o/u",
            examples: [
              { speak: "skole", text: "skole", gloss: "school" },
              { speak: "skatt", text: "skatt", gloss: "tax" },
            ],
          },
        ],
      },
      {
        title: "Two-letter vowels",
        compact: true,
        items: [
          {
            glyph: "ei",
            speak: "ei",
            glyphSize: "pair",
            approxHtml: "Like <strong>ay</strong> in <em>say</em>",
            examples: [
              { speak: "nei", text: "nei", gloss: "no" },
              { speak: "vei", text: "vei", gloss: "road" },
            ],
          },
          {
            glyph: "øy",
            speak: "øy",
            glyphSize: "pair",
            approxHtml: "<strong>ø</strong> then a quick <strong>y</strong> (yes-sound)",
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
