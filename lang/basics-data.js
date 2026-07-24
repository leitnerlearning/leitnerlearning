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
  /** Swedish — same MED excellence as sv-pack (pack overwrites on load). sj/tj are the signature. */
  window.LANGUAGE_BASICS.sv = {
    previewGlyphs: ["å", "ä", "ö"],
    sections: [
      {
        title: "Special",
        items: [
          {
            glyph: "å",
            speak: "år",
            approxHtml: "<strong>o</strong> in <em>or</em>",
            examples: [
              { speak: "år", text: "år", gloss: "year" },
              { speak: "gå", text: "gå", gloss: "go" },
            ],
          },
          {
            glyph: "ä",
            speak: "är",
            approxHtml: "<strong>a</strong> in <em>cat</em>",
            examples: [
              { speak: "är", text: "är", gloss: "is" },
              { speak: "nära", text: "nära", gloss: "near" },
            ],
          },
          {
            glyph: "ö",
            speak: "öl",
            approxHtml: "<strong>u</strong> in <em>burn</em> · rounded",
            examples: [
              { speak: "öl", text: "öl", gloss: "beer" },
              { speak: "öra", text: "öra", gloss: "ear" },
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
              { speak: "jag", text: "jag", gloss: "I" },
            ],
          },
          {
            glyph: "y",
            speak: "ny",
            glyphSize: "sm",
            approxHtml: "<strong>ee</strong> · rounded lips",
            examples: [
              { speak: "ny", text: "ny", gloss: "new" },
              { speak: "fyra", text: "fyra", gloss: "four" },
            ],
          },
          {
            glyph: "g",
            speak: "göra",
            glyphSize: "sm",
            approxHtml: "Soft before e i y ä ö · like <strong>y</strong>",
            examples: [
              { speak: "göra", text: "göra", gloss: "do" },
              { speak: "god", text: "god", gloss: "good" },
            ],
          },
          {
            glyph: "r",
            speak: "röd",
            glyphSize: "sm",
            approxHtml: "Tapped · not English <span class=\"basics-letter\">r</span>",
            examples: [
              { speak: "röd", text: "röd", gloss: "red" },
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
            glyph: "sj",
            speak: "sjö",
            glyphSize: "pair",
            approxHtml: "Soft <strong>sh</strong>-like",
            examples: [
              { speak: "sjö", text: "sjö", gloss: "lake" },
              { speak: "sju", text: "sju", gloss: "seven" },
            ],
          },
          {
            glyph: "tj",
            speak: "tjej",
            glyphSize: "pair",
            approxHtml: "Soft · <strong>sh</strong> in <em>she</em>",
            examples: [
              { speak: "tjej", text: "tjej", gloss: "girl" },
              { speak: "tjänst", text: "tjänst", gloss: "service" },
            ],
          },
          {
            glyph: "hj",
            speak: "hjälp",
            glyphSize: "pair",
            approxHtml: "Silent <strong>h</strong> · <strong>y</strong>",
            examples: [
              { speak: "hjälp", text: "hjälp", gloss: "help" },
              { speak: "hjärta", text: "hjärta", gloss: "heart" },
            ],
          },
          {
            glyph: "rs",
            speak: "fors",
            glyphSize: "pair",
            approxHtml: "Often like <strong>sh</strong>",
            examples: [
              { speak: "fors", text: "fors", gloss: "rapids" },
              { speak: "mars", text: "mars", gloss: "March" },
            ],
          },
        ],
      },
    ],
  };

  /** Danish — same MED excellence as da-pack (pack overwrites on load). Soft d/g are the signature. */
  window.LANGUAGE_BASICS.da = {
    previewGlyphs: ["æ", "ø", "å"],
    sections: [
      {
        title: "Special",
        items: [
          {
            glyph: "æ",
            speak: "ærlig",
            approxHtml: "<strong>a</strong> in <em>cat</em>",
            examples: [
              { speak: "ærlig", text: "ærlig", gloss: "honest" },
              { speak: "læse", text: "læse", gloss: "read" },
            ],
          },
          {
            glyph: "ø",
            speak: "øl",
            approxHtml: "<strong>u</strong> in <em>burn</em> · rounded",
            examples: [
              { speak: "øl", text: "øl", gloss: "beer" },
              { speak: "øje", text: "øje", gloss: "eye" },
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
            glyph: "d",
            speak: "mad",
            glyphSize: "sm",
            approxHtml: "Soft or silent at the end",
            examples: [
              { speak: "mad", text: "mad", gloss: "food" },
              { speak: "gade", text: "gade", gloss: "street" },
            ],
          },
          {
            glyph: "g",
            speak: "jeg",
            glyphSize: "sm",
            approxHtml: "Soft or almost silent",
            examples: [
              { speak: "jeg", text: "jeg", gloss: "I" },
              { speak: "dag", text: "dag", gloss: "day" },
            ],
          },
          {
            glyph: "j",
            speak: "ja",
            glyphSize: "sm",
            approxHtml: "<strong>y</strong> in <em>yes</em>",
            examples: [
              { speak: "ja", text: "ja", gloss: "yes" },
              { speak: "jul", text: "jul", gloss: "Christmas" },
            ],
          },
          {
            glyph: "y",
            speak: "by",
            glyphSize: "sm",
            approxHtml: "<strong>ee</strong> · rounded lips",
            examples: [
              { speak: "by", text: "by", gloss: "town" },
              { speak: "ny", text: "ny", gloss: "new" },
            ],
          },
          {
            glyph: "r",
            speak: "rød",
            glyphSize: "sm",
            approxHtml: "Guttural · not English <span class=\"basics-letter\">r</span>",
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
            glyph: "hj",
            speak: "hjem",
            glyphSize: "pair",
            approxHtml: "Silent <strong>h</strong> · <strong>y</strong>",
            examples: [
              { speak: "hjem", text: "hjem", gloss: "home" },
              { speak: "hjælp", text: "hjælp", gloss: "help" },
            ],
          },
          {
            glyph: "hv",
            speak: "hvad",
            glyphSize: "pair",
            approxHtml: "Silent <strong>h</strong> · <strong>v</strong>",
            examples: [
              { speak: "hvad", text: "hvad", gloss: "what" },
              { speak: "hvor", text: "hvor", gloss: "where" },
            ],
          },
          {
            glyph: "ej",
            speak: "vej",
            glyphSize: "pair",
            approxHtml: "<strong>eye</strong> · also in <em>jeg</em>",
            examples: [
              { speak: "vej", text: "vej", gloss: "road" },
              { speak: "jeg", text: "jeg", gloss: "I" },
            ],
          },
          {
            glyph: "nd",
            speak: "mand",
            glyphSize: "pair",
            approxHtml: "Often soft <strong>n</strong>",
            examples: [
              { speak: "mand", text: "mand", gloss: "man" },
              { speak: "vende", text: "vende", gloss: "turn" },
            ],
          },
        ],
      },
    ],
  };

  /**
   * Dutch — excellence bar (MED tray). MUST + SHOULD for English speakers.
   * ij/ui/oe/eu; throaty g/ch; sch ≠ sh; r; long aa / ie / ou.
   * Dropped COULD: stress, -je diminutive, dt spelling, v/w meta, aa/ee/oo bundle.
   * Exactly 2 examples. Glyph label only.
   */
  window.LANGUAGE_BASICS.nl = {
    previewGlyphs: ["ij", "ui", "oe"],
    sections: [
      {
        title: "Special",
        items: [
          {
            glyph: "ij",
            speak: "ijs",
            glyphSize: "pair",
            approxHtml: "<strong>eye</strong>",
            examples: [
              { speak: "ijs", text: "ijs", gloss: "ice" },
              { speak: "tijd", text: "tijd", gloss: "time" },
            ],
          },
          {
            glyph: "ui",
            speak: "huis",
            glyphSize: "pair",
            approxHtml: "Rounded · unique to Dutch",
            examples: [
              { speak: "huis", text: "huis", gloss: "house" },
              { speak: "uit", text: "uit", gloss: "out" },
            ],
          },
          {
            glyph: "oe",
            speak: "boek",
            glyphSize: "pair",
            approxHtml: "<strong>oo</strong> in <em>boot</em>",
            examples: [
              { speak: "boek", text: "boek", gloss: "book" },
              { speak: "goed", text: "goed", gloss: "good" },
            ],
          },
          {
            glyph: "eu",
            speak: "leuk",
            glyphSize: "pair",
            approxHtml: "Rounded · a bit like French <em>eu</em>",
            examples: [
              { speak: "leuk", text: "leuk", gloss: "nice" },
              { speak: "deur", text: "deur", gloss: "door" },
            ],
          },
        ],
      },
      {
        title: "Surprises",
        compact: true,
        items: [
          {
            glyph: "g",
            speak: "goed",
            glyphSize: "sm",
            approxHtml: "Throaty · not English <span class=\"basics-letter\">g</span>",
            examples: [
              { speak: "goed", text: "goed", gloss: "good" },
              { speak: "dag", text: "dag", gloss: "day" },
            ],
          },
          {
            glyph: "ch",
            speak: "acht",
            glyphSize: "pair",
            approxHtml: "Same throaty family as <strong>g</strong>",
            examples: [
              { speak: "acht", text: "acht", gloss: "eight" },
              { speak: "licht", text: "licht", gloss: "light" },
            ],
          },
          {
            glyph: "r",
            speak: "rood",
            glyphSize: "sm",
            approxHtml: "Tapped · not English <span class=\"basics-letter\">r</span>",
            examples: [
              { speak: "rood", text: "rood", gloss: "red" },
              { speak: "brood", text: "brood", gloss: "bread" },
            ],
          },
        ],
      },
      {
        title: "Pairs",
        compact: true,
        items: [
          {
            glyph: "sch",
            speak: "school",
            glyphSize: "pair",
            approxHtml: "<strong>s</strong> + throaty · not English <em>sh</em>",
            examples: [
              { speak: "school", text: "school", gloss: "school" },
              { speak: "schip", text: "schip", gloss: "ship" },
            ],
          },
          {
            glyph: "aa",
            speak: "gaan",
            glyphSize: "pair",
            approxHtml: "Long clear <strong>ah</strong>",
            examples: [
              { speak: "gaan", text: "gaan", gloss: "go" },
              { speak: "maan", text: "maan", gloss: "moon" },
            ],
          },
          {
            glyph: "ie",
            speak: "niet",
            glyphSize: "pair",
            approxHtml: "Long <strong>ee</strong>",
            examples: [
              { speak: "niet", text: "niet", gloss: "not" },
              { speak: "hier", text: "hier", gloss: "here" },
            ],
          },
          {
            glyph: "ou",
            speak: "koud",
            glyphSize: "pair",
            approxHtml: "Like <strong>ou</strong> in <em>out</em>",
            examples: [
              { speak: "koud", text: "koud", gloss: "cold" },
              { speak: "jou", text: "jou", gloss: "you" },
            ],
          },
        ],
      },
    ],
  };

  /**
   * German — excellence bar (MED tray). MUST + SHOULD for English speakers.
   * ä/ö/ü/ß; j/v/w lookalikes; ch/sch; ei vs ie.
   * Dropped COULD: capital-noun rule, ß/ss meta row, ie/ei contrast row.
   * Exactly 2 examples. Glyph label only.
   */
  window.LANGUAGE_BASICS.de = {
    previewGlyphs: ["ä", "ö", "ü"],
    sections: [
      {
        title: "Special",
        items: [
          {
            glyph: "ä",
            speak: "spät",
            approxHtml: "<strong>e</strong> in <em>bed</em>",
            examples: [
              { speak: "spät", text: "spät", gloss: "late" },
              { speak: "Männer", text: "Männer", gloss: "men" },
            ],
          },
          {
            glyph: "ö",
            speak: "schön",
            approxHtml: "<strong>u</strong> in <em>burn</em> · rounded",
            examples: [
              { speak: "schön", text: "schön", gloss: "beautiful" },
              { speak: "hören", text: "hören", gloss: "hear" },
            ],
          },
          {
            glyph: "ü",
            speak: "über",
            approxHtml: "<strong>ee</strong> · rounded lips",
            examples: [
              { speak: "über", text: "über", gloss: "over" },
              { speak: "für", text: "für", gloss: "for" },
            ],
          },
          {
            glyph: "ß",
            speak: "groß",
            approxHtml: "Sharp <strong>s</strong> · same as <strong>ss</strong>",
            examples: [
              { speak: "groß", text: "groß", gloss: "big" },
              { speak: "weiß", text: "weiß", gloss: "white" },
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
              { speak: "jetzt", text: "jetzt", gloss: "now" },
            ],
          },
          {
            glyph: "v",
            speak: "von",
            glyphSize: "sm",
            approxHtml: "Often like English <strong>f</strong>",
            examples: [
              { speak: "von", text: "von", gloss: "from" },
              { speak: "Vater", text: "Vater", gloss: "father" },
            ],
          },
          {
            glyph: "w",
            speak: "was",
            glyphSize: "sm",
            approxHtml: "Like English <strong>v</strong>",
            examples: [
              { speak: "was", text: "was", gloss: "what" },
              { speak: "wer", text: "wer", gloss: "who" },
            ],
          },
        ],
      },
      {
        title: "Pairs",
        compact: true,
        items: [
          {
            glyph: "ch",
            speak: "ich",
            glyphSize: "pair",
            approxHtml: "Soft after i/e · rough after a/o/u",
            examples: [
              { speak: "ich", text: "ich", gloss: "I" },
              { speak: "Nacht", text: "Nacht", gloss: "night" },
            ],
          },
          {
            glyph: "sch",
            speak: "schon",
            glyphSize: "pair",
            approxHtml: "<strong>sh</strong> in <em>ship</em>",
            examples: [
              { speak: "schon", text: "schon", gloss: "already" },
              { speak: "Schule", text: "Schule", gloss: "school" },
            ],
          },
          {
            glyph: "ei",
            speak: "nein",
            glyphSize: "pair",
            approxHtml: "<strong>eye</strong>",
            examples: [
              { speak: "nein", text: "nein", gloss: "no" },
              { speak: "eins", text: "eins", gloss: "one" },
            ],
          },
          {
            glyph: "ie",
            speak: "sie",
            glyphSize: "pair",
            approxHtml: "Long <strong>ee</strong>",
            examples: [
              { speak: "sie", text: "sie", gloss: "she / they" },
              { speak: "die", text: "die", gloss: "the" },
            ],
          },
        ],
      },
    ],
  };

  /**
   * French — excellence bar (MED tray). MUST + SHOULD for English speakers.
   * é/è/ç/œ; French u; silent h & finals; ou; nasals on/an; oi.
   * Dropped COULD: ê as own row (folded into è), à vs a spelling tip.
   * Exactly 2 examples. Glyph label only.
   */
  window.LANGUAGE_BASICS.fr = {
    previewGlyphs: ["é", "è", "ç"],
    sections: [
      {
        title: "Special",
        items: [
          {
            glyph: "é",
            speak: "café",
            approxHtml: "<strong>ay</strong> in <em>café</em>",
            examples: [
              { speak: "café", text: "café", gloss: "coffee" },
              { speak: "été", text: "été", gloss: "summer" },
            ],
          },
          {
            glyph: "è",
            speak: "très",
            approxHtml: "<strong>e</strong> in <em>bed</em> · also <strong>ê</strong>",
            examples: [
              { speak: "très", text: "très", gloss: "very" },
              { speak: "père", text: "père", gloss: "father" },
            ],
          },
          {
            glyph: "ç",
            speak: "ça",
            approxHtml: "Soft <strong>s</strong> before a/o/u",
            examples: [
              { speak: "ça", text: "ça", gloss: "that" },
              { speak: "français", text: "français", gloss: "French" },
            ],
          },
          {
            glyph: "œ",
            speak: "cœur",
            approxHtml: "Like <strong>u</strong> in <em>blur</em> · rounded",
            examples: [
              { speak: "cœur", text: "cœur", gloss: "heart" },
              { speak: "sœur", text: "sœur", gloss: "sister" },
            ],
          },
        ],
      },
      {
        title: "Surprises",
        compact: true,
        items: [
          {
            glyph: "u",
            speak: "tu",
            glyphSize: "sm",
            approxHtml: "<strong>ee</strong> · round lips · not English <em>oo</em>",
            examples: [
              { speak: "tu", text: "tu", gloss: "you" },
              { speak: "rue", text: "rue", gloss: "street" },
            ],
          },
          {
            glyph: "h",
            speak: "hôtel",
            glyphSize: "sm",
            approxHtml: "Usually silent",
            examples: [
              { speak: "hôtel", text: "hôtel", gloss: "hotel" },
              { speak: "homme", text: "homme", gloss: "man" },
            ],
          },
          {
            glyph: "·",
            speak: "petit",
            glyphSize: "sm",
            approxHtml: "Final consonants often silent",
            examples: [
              { speak: "petit", text: "petit", gloss: "small" },
              { speak: "grand", text: "grand", gloss: "big" },
            ],
          },
        ],
      },
      {
        title: "Pairs",
        compact: true,
        items: [
          {
            glyph: "ou",
            speak: "vous",
            glyphSize: "pair",
            approxHtml: "<strong>oo</strong> in <em>food</em>",
            examples: [
              { speak: "vous", text: "vous", gloss: "you" },
              { speak: "où", text: "où", gloss: "where" },
            ],
          },
          {
            glyph: "on",
            speak: "bon",
            glyphSize: "pair",
            approxHtml: "Nasal · through the nose",
            examples: [
              { speak: "bon", text: "bon", gloss: "good" },
              { speak: "mon", text: "mon", gloss: "my" },
            ],
          },
          {
            glyph: "an",
            speak: "dans",
            glyphSize: "pair",
            approxHtml: "Nasal · also <strong>en</strong>",
            examples: [
              { speak: "dans", text: "dans", gloss: "in" },
              { speak: "grand", text: "grand", gloss: "big" },
            ],
          },
          {
            glyph: "oi",
            speak: "moi",
            glyphSize: "pair",
            approxHtml: "Like <strong>wa</strong> in <em>watt</em>",
            examples: [
              { speak: "moi", text: "moi", gloss: "me" },
              { speak: "soir", text: "soir", gloss: "evening" },
            ],
          },
        ],
      },
    ],
  };

  /**
   * Spanish — excellence bar (MED tray). MUST + SHOULD for English speakers.
   * ñ; j/g harsh h; rr; ll/y; ¿ ¡; ü in güe.
   * Dropped COULD: multi-accent stress row (not a letter sound).
   * Exactly 2 examples. Glyph label only.
   */
  window.LANGUAGE_BASICS.es = {
    previewGlyphs: ["ñ", "¿", "¡"],
    sections: [
      {
        title: "Special",
        items: [
          {
            glyph: "ñ",
            speak: "año",
            approxHtml: "<strong>ny</strong> in <em>canyon</em>",
            examples: [
              { speak: "año", text: "año", gloss: "year" },
              { speak: "español", text: "español", gloss: "Spanish" },
            ],
          },
          {
            glyph: "ü",
            speak: "vergüenza",
            approxHtml: "Sounds in <strong>güe</strong> / <strong>güi</strong>",
            examples: [
              { speak: "vergüenza", text: "vergüenza", gloss: "shame" },
              { speak: "pingüino", text: "pingüino", gloss: "penguin" },
            ],
          },
          {
            glyph: "¿ ¡",
            speak: "hola",
            glyphSize: "pair",
            approxHtml: "Opening question / exclamation",
            examples: [
              { speak: "¿Cómo?", text: "¿Cómo?", gloss: "How?" },
              { speak: "¡Hola!", text: "¡Hola!", gloss: "Hello!" },
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
            speak: "hijo",
            glyphSize: "sm",
            approxHtml: "Harsh <strong>h</strong>",
            examples: [
              { speak: "hijo", text: "hijo", gloss: "son" },
              { speak: "jugar", text: "jugar", gloss: "play" },
            ],
          },
          {
            glyph: "g",
            speak: "gente",
            glyphSize: "sm",
            approxHtml: "Harsh <strong>h</strong> before e/i · hard before a/o/u",
            examples: [
              { speak: "gente", text: "gente", gloss: "people" },
              { speak: "gato", text: "gato", gloss: "cat" },
            ],
          },
          {
            glyph: "v",
            speak: "vivo",
            glyphSize: "sm",
            approxHtml: "Like <strong>b</strong> for most speakers",
            examples: [
              { speak: "vivo", text: "vivo", gloss: "alive" },
              { speak: "voy", text: "voy", gloss: "I go" },
            ],
          },
        ],
      },
      {
        title: "Pairs",
        compact: true,
        items: [
          {
            glyph: "rr",
            speak: "perro",
            glyphSize: "pair",
            approxHtml: "Trilled · single <strong>r</strong> is a tap",
            examples: [
              { speak: "perro", text: "perro", gloss: "dog" },
              { speak: "carro", text: "carro", gloss: "car" },
            ],
          },
          {
            glyph: "ll",
            speak: "llamar",
            glyphSize: "pair",
            approxHtml: "Often like <strong>y</strong> in <em>yes</em>",
            examples: [
              { speak: "llamar", text: "llamar", gloss: "call" },
              { speak: "lleno", text: "lleno", gloss: "full" },
            ],
          },
          {
            glyph: "qu",
            speak: "qué",
            glyphSize: "pair",
            approxHtml: "Hard <strong>k</strong> before e/i",
            examples: [
              { speak: "qué", text: "qué", gloss: "what" },
              { speak: "aquí", text: "aquí", gloss: "here" },
            ],
          },
          {
            glyph: "ch",
            speak: "mucho",
            glyphSize: "pair",
            approxHtml: "<strong>ch</strong> in <em>church</em>",
            examples: [
              { speak: "mucho", text: "mucho", gloss: "a lot" },
              { speak: "noche", text: "noche", gloss: "night" },
            ],
          },
        ],
      },
    ],
  };

  /**
   * Italian — excellence bar (MED tray). MUST + SHOULD for English speakers.
   * gli/gn; soft c/g vs ch/gh; double consonants; stress accents.
   * Dropped COULD: multi-example dump rows (cap at 2).
   * Exactly 2 examples. Glyph label only.
   */
  window.LANGUAGE_BASICS.it = {
    previewGlyphs: ["gli", "gn", "à"],
    sections: [
      {
        title: "Special",
        items: [
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
            speak: "ogni",
            glyphSize: "pair",
            approxHtml: "<strong>ny</strong> in <em>canyon</em>",
            examples: [
              { speak: "ogni", text: "ogni", gloss: "every" },
              { speak: "bagno", text: "bagno", gloss: "bathroom" },
            ],
          },
          {
            glyph: "à è",
            speak: "città",
            glyphSize: "pair",
            approxHtml: "Accent marks stress",
            examples: [
              { speak: "città", text: "città", gloss: "city" },
              { speak: "caffè", text: "caffè", gloss: "coffee" },
            ],
          },
        ],
      },
      {
        title: "Surprises",
        compact: true,
        items: [
          {
            glyph: "c",
            speak: "ciao",
            glyphSize: "sm",
            approxHtml: "<strong>ch</strong> before e/i · hard <strong>k</strong> before a/o/u",
            examples: [
              { speak: "ciao", text: "ciao", gloss: "hi" },
              { speak: "casa", text: "casa", gloss: "house" },
            ],
          },
          {
            glyph: "g",
            speak: "gelato",
            glyphSize: "sm",
            approxHtml: "<strong>j</strong> before e/i · hard before a/o/u",
            examples: [
              { speak: "gelato", text: "gelato", gloss: "ice cream" },
              { speak: "gatto", text: "gatto", gloss: "cat" },
            ],
          },
          {
            glyph: "sc",
            speak: "pesce",
            glyphSize: "pair",
            approxHtml: "<strong>sh</strong> before e/i · <strong>sk</strong> before a/o/u",
            examples: [
              { speak: "pesce", text: "pesce", gloss: "fish" },
              { speak: "scuola", text: "scuola", gloss: "school" },
            ],
          },
        ],
      },
      {
        title: "Pairs",
        compact: true,
        items: [
          {
            glyph: "ch",
            speak: "chi",
            glyphSize: "pair",
            approxHtml: "Hard <strong>k</strong> before e/i",
            examples: [
              { speak: "chi", text: "chi", gloss: "who" },
              { speak: "che", text: "che", gloss: "what" },
            ],
          },
          {
            glyph: "gh",
            speak: "laghi",
            glyphSize: "pair",
            approxHtml: "Hard <strong>g</strong> before e/i",
            examples: [
              { speak: "laghi", text: "laghi", gloss: "lakes" },
              { speak: "spaghetti", text: "spaghetti", gloss: "spaghetti" },
            ],
          },
          {
            glyph: "tt",
            speak: "gatto",
            glyphSize: "pair",
            approxHtml: "Hold longer · doubles change meaning",
            examples: [
              { speak: "gatto", text: "gatto", gloss: "cat" },
              { speak: "notte", text: "notte", gloss: "night" },
            ],
          },
          {
            glyph: "zz",
            speak: "pizza",
            glyphSize: "pair",
            approxHtml: "Sharp double <strong>ts</strong> / <strong>dz</strong>",
            examples: [
              { speak: "pizza", text: "pizza", gloss: "pizza" },
              { speak: "mezzo", text: "mezzo", gloss: "half" },
            ],
          },
        ],
      },
    ],
  };

  /**
   * Portuguese (Brazil) — excellence bar (MED tray). MUST + SHOULD.
   * ã/õ/ç; ão; lh/nh; r/rr; soft d/t before i; x.
   * Dropped COULD: você tip, open e/o lecture, multi-accent dumps.
   * Exactly 2 examples. Glyph label only.
   */
  window.LANGUAGE_BASICS.pt = {
    previewGlyphs: ["ã", "õ", "ç"],
    sections: [
      {
        title: "Special",
        items: [
          {
            glyph: "ã",
            speak: "irmã",
            approxHtml: "Nasal <strong>a</strong>",
            examples: [
              { speak: "irmã", text: "irmã", gloss: "sister" },
              { speak: "manhã", text: "manhã", gloss: "morning" },
            ],
          },
          {
            glyph: "õ",
            speak: "limões",
            approxHtml: "Nasal <strong>o</strong>",
            examples: [
              { speak: "limões", text: "limões", gloss: "lemons" },
              { speak: "botões", text: "botões", gloss: "buttons" },
            ],
          },
          {
            glyph: "ç",
            speak: "açúcar",
            approxHtml: "Soft <strong>s</strong> before a/o/u",
            examples: [
              { speak: "açúcar", text: "açúcar", gloss: "sugar" },
              { speak: "coração", text: "coração", gloss: "heart" },
            ],
          },
          {
            glyph: "ão",
            speak: "não",
            glyphSize: "pair",
            approxHtml: "Very common nasal ending",
            examples: [
              { speak: "não", text: "não", gloss: "no" },
              { speak: "mão", text: "mão", gloss: "hand" },
            ],
          },
        ],
      },
      {
        title: "Surprises",
        compact: true,
        items: [
          {
            glyph: "r",
            speak: "rio",
            glyphSize: "sm",
            approxHtml: "Strong at word start · soft between vowels",
            examples: [
              { speak: "rio", text: "rio", gloss: "river" },
              { speak: "caro", text: "caro", gloss: "expensive" },
            ],
          },
          {
            glyph: "d",
            speak: "dia",
            glyphSize: "sm",
            approxHtml: "Before <strong>i</strong> often like English <em>j</em>",
            examples: [
              { speak: "dia", text: "dia", gloss: "day" },
              { speak: "cidade", text: "cidade", gloss: "city" },
            ],
          },
          {
            glyph: "x",
            speak: "peixe",
            glyphSize: "sm",
            approxHtml: "Often <strong>sh</strong> · sometimes <strong>ks</strong>",
            examples: [
              { speak: "peixe", text: "peixe", gloss: "fish" },
              { speak: "táxi", text: "táxi", gloss: "taxi" },
            ],
          },
        ],
      },
      {
        title: "Pairs",
        compact: true,
        items: [
          {
            glyph: "lh",
            speak: "filho",
            glyphSize: "pair",
            approxHtml: "Like <strong>lli</strong> in <em>million</em>",
            examples: [
              { speak: "filho", text: "filho", gloss: "son" },
              { speak: "olho", text: "olho", gloss: "eye" },
            ],
          },
          {
            glyph: "nh",
            speak: "vinho",
            glyphSize: "pair",
            approxHtml: "<strong>ny</strong> in <em>canyon</em>",
            examples: [
              { speak: "vinho", text: "vinho", gloss: "wine" },
              { speak: "banho", text: "banho", gloss: "bath" },
            ],
          },
          {
            glyph: "rr",
            speak: "carro",
            glyphSize: "pair",
            approxHtml: "Strong guttural / trilled <strong>r</strong>",
            examples: [
              { speak: "carro", text: "carro", gloss: "car" },
              { speak: "terra", text: "terra", gloss: "earth" },
            ],
          },
          {
            glyph: "ch",
            speak: "chave",
            glyphSize: "pair",
            approxHtml: "<strong>sh</strong> in <em>ship</em>",
            examples: [
              { speak: "chave", text: "chave", gloss: "key" },
              { speak: "chuva", text: "chuva", gloss: "rain" },
            ],
          },
        ],
      },
    ],
  };

  /**
   * Polish — excellence bar (MED tray). MUST + SHOULD for English speakers.
   * ą/ę/ł/ó; soft ćńśź; sz/cz; ż/rz; ch; w = v.
   * Dropped COULD: stress tip, triple dz row, w/ł meta duplicate of ł.
   * Exactly 2 examples. Glyph label only.
   */
  window.LANGUAGE_BASICS.pl = {
    previewGlyphs: ["ą", "ę", "ł"],
    sections: [
      {
        title: "Special",
        items: [
          {
            glyph: "ą",
            speak: "są",
            approxHtml: "Nasal · like French <em>on</em>",
            examples: [
              { speak: "są", text: "są", gloss: "are" },
              { speak: "ząb", text: "ząb", gloss: "tooth" },
            ],
          },
          {
            glyph: "ę",
            speak: "ręka",
            approxHtml: "Nasal · like French <em>in</em>",
            examples: [
              { speak: "ręka", text: "ręka", gloss: "hand" },
              { speak: "imię", text: "imię", gloss: "name" },
            ],
          },
          {
            glyph: "ł",
            speak: "mały",
            approxHtml: "Like English <strong>w</strong>",
            examples: [
              { speak: "mały", text: "mały", gloss: "small" },
              { speak: "łóżko", text: "łóżko", gloss: "bed" },
            ],
          },
          {
            glyph: "ó",
            speak: "góra",
            approxHtml: "Sounds like Polish <strong>u</strong>",
            examples: [
              { speak: "góra", text: "góra", gloss: "mountain" },
              { speak: "mózg", text: "mózg", gloss: "brain" },
            ],
          },
        ],
      },
      {
        title: "Surprises",
        compact: true,
        items: [
          {
            glyph: "w",
            speak: "woda",
            glyphSize: "sm",
            approxHtml: "Like English <strong>v</strong>",
            examples: [
              { speak: "woda", text: "woda", gloss: "water" },
              { speak: "wiem", text: "wiem", gloss: "I know" },
            ],
          },
          {
            glyph: "y",
            speak: "ty",
            glyphSize: "sm",
            approxHtml: "Tight short <strong>i</strong> · not English <em>y</em>",
            examples: [
              { speak: "ty", text: "ty", gloss: "you" },
              { speak: "my", text: "my", gloss: "we" },
            ],
          },
          {
            glyph: "ć",
            speak: "być",
            glyphSize: "sm",
            approxHtml: "Soft · family with <strong>ń ś ź</strong>",
            examples: [
              { speak: "być", text: "być", gloss: "to be" },
              { speak: "cześć", text: "cześć", gloss: "hi" },
            ],
          },
        ],
      },
      {
        title: "Pairs",
        compact: true,
        items: [
          {
            glyph: "sz",
            speak: "szkoła",
            glyphSize: "pair",
            approxHtml: "<strong>sh</strong> in <em>ship</em>",
            examples: [
              { speak: "szkoła", text: "szkoła", gloss: "school" },
              { speak: "proszę", text: "proszę", gloss: "please" },
            ],
          },
          {
            glyph: "cz",
            speak: "czas",
            glyphSize: "pair",
            approxHtml: "<strong>ch</strong> in <em>church</em>",
            examples: [
              { speak: "czas", text: "czas", gloss: "time" },
              { speak: "czemu", text: "czemu", gloss: "why" },
            ],
          },
          {
            glyph: "rz",
            speak: "rzeka",
            glyphSize: "pair",
            approxHtml: "Like <strong>zh</strong> in <em>measure</em> · also <strong>ż</strong>",
            examples: [
              { speak: "rzeka", text: "rzeka", gloss: "river" },
              { speak: "może", text: "może", gloss: "maybe" },
            ],
          },
          {
            glyph: "ch",
            speak: "chleb",
            glyphSize: "pair",
            approxHtml: "Breathy <strong>h</strong> · same as <strong>h</strong>",
            examples: [
              { speak: "chleb", text: "chleb", gloss: "bread" },
              { speak: "ucho", text: "ucho", gloss: "ear" },
            ],
          },
        ],
      },
    ],
  };
})();
