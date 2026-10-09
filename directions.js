/* ============================================================
   MOODBOARD — predefined design systems.
   Every direction below is authored in advance. Jev only
   SELECTS one of these four options; it never generates
   colours, fonts, copy or categories.
   ============================================================ */
(function () {
  "use strict";

  var DIRECTIONS = [
    {
      id: "minimal",
      index: "01",
      name: "Minimal",
      tag: "Quiet confidence",
      description:
        "A restrained visual language built around clarity, intentional spacing and quiet confidence.",
      palette: [
        { name: "Porcelain", hex: "#F5F2EB" },
        { name: "Ink", hex: "#20211F" },
        { name: "Stone", hex: "#C8C3B8" },
        { name: "Mist", hex: "#E4E1DA" },
        { name: "Olive", hex: "#747A60" }
      ],
      fonts: { display: "Instrument Serif", body: "Manrope" },
      theme: {
        bg: "#F5F2EB",
        surface: "#FBFAF6",
        ink: "#20211F",
        muted: "#6E6A5E",
        accent: "#747A60",
        accentInk: "#F5F2EB",
        border: "#D8D3C6",
        faint: "#E4E1DA"
      },
      card: { radius: "2px", border: "1px solid", shadow: "none" },
      specimen: {
        headline: "Less, but better.",
        paragraph:
          "A single idea, given room to breathe. Minimal interfaces earn attention through restraint — precise alignment, generous negative space and typography that never raises its voice.",
        label: "Editorial · Set in Instrument Serif"
      },
      cards: {
        feature: {
          kicker: "Featured story",
          title: "The gallery that removed everything",
          body: "How one exhibition identity survived on a single typeface, two colours and the courage to leave space empty.",
          cta: "Read the case study"
        },
        content: {
          category: "Essay",
          title: "In praise of negative space",
          body: "Whitespace is not the absence of design. It is the frame that lets content hold its posture.",
          meta: "6 min read · Typography"
        },
        action: {
          title: "Refine your layout",
          body: "Remove one element from the page you are designing today.",
          actionLabel: "Mark as done",
          doneLabel: "Refined — nicely restrained.",
          note: "Recommendation 01 of 03"
        }
      }
    },
    {
      id: "vibrant",
      index: "02",
      name: "Vibrant",
      tag: "Loud on purpose",
      description:
        "A high-energy visual language built around expressive colour, bold typography and playful contrast.",
      palette: [
        { name: "Electric Coral", hex: "#FF5A4E" },
        { name: "Lemon", hex: "#F5E94D" },
        { name: "Cobalt", hex: "#3155E7" },
        { name: "Paper", hex: "#FFF9ED" },
        { name: "Near Black", hex: "#171717" }
      ],
      fonts: { display: "Space Grotesk", body: "Space Grotesk" },
      theme: {
        bg: "#FFF9ED",
        surface: "#FFFFFF",
        ink: "#171717",
        muted: "#5C574A",
        accent: "#FF5A4E",
        accentInk: "#171717",
        accent2: "#3155E7",
        accent3: "#F5E94D",
        border: "#171717",
        faint: "#F3E7C9"
      },
      card: { radius: "14px", border: "2px solid", shadow: "6px 6px 0" },
      specimen: {
        headline: "TURN IT ALL THE WAY UP.",
        paragraph:
          "Vibrant design refuses to whisper. Colour blocks collide, type goes big and asymmetry keeps the eye moving. Contrast is the whole point — be brave with it.",
        label: "Poster · Set in Space Grotesk"
      },
      cards: {
        feature: {
          kicker: "★ Featured drop",
          title: "Neon Noise Festival identity",
          body: "Three clashing colours, one fearless grid and a poster system that can be read from across the street.",
          cta: "See the mayhem"
        },
        content: {
          category: "Mixtape",
          title: "12 palettes that start arguments",
          body: "Coral vs cobalt. Lemon vs everything. A playlist of colour combos with zero chill.",
          meta: "34 min · Colour theory"
        },
        action: {
          title: "Ship something loud",
          body: "Pick your boldest colour and use it at 10× the size you planned.",
          actionLabel: "Count me in",
          doneLabel: "Locked in. Make it louder.",
          note: "Mission 02 of 05"
        }
      }
    },
    {
      id: "futuristic",
      index: "03",
      name: "Futuristic",
      tag: "Future-facing",
      description:
        "A future-facing visual language combining dark surfaces, luminous accents and precise digital details.",
      palette: [
        { name: "Midnight", hex: "#10131C" },
        { name: "Graphite", hex: "#222837" },
        { name: "Electric Cyan", hex: "#79F2E6" },
        { name: "Ultraviolet", hex: "#8D83FF" },
        { name: "Cloud", hex: "#E8ECF5" }
      ],
      fonts: { display: "Space Grotesk", body: "Space Grotesk" },
      theme: {
        bg: "#10131C",
        surface: "#161B27",
        ink: "#E8ECF5",
        muted: "#9AA3B8",
        accent: "#79F2E6",
        accentInk: "#10131C",
        accent2: "#8D83FF",
        border: "#2E3750",
        faint: "#222837"
      },
      card: { radius: "6px", border: "1px solid", shadow: "none" },
      specimen: {
        headline: "Signal from tomorrow.",
        paragraph:
          "Dark surfaces, luminous accents, data-like precision. Futuristic interfaces feel cinematic because every line, label and glow is placed with machine intent.",
        label: "SYS.04 // SET IN SPACE GROTESK"
      },
      cards: {
        feature: {
          kicker: "SYS.FEATURE // 001",
          title: "Orbital dashboard, redesigned",
          body: "A mission-control interface rebuilt on a 12-column grid with cyan wayfinding and zero visual noise.",
          cta: "Open the prototype"
        },
        content: {
          category: "TRANSMISSION",
          title: "Designing for the dark",
          body: "Contrast ratios, glow discipline and why ultraviolet is a spice, not a meal.",
          meta: "8 min · 4.2K views"
        },
        action: {
          title: "Calibrate your grid",
          body: "Snap every element to an 8px base unit. Precision is the aesthetic.",
          actionLabel: "Run calibration",
          doneLabel: "Calibrated. All systems nominal.",
          note: "TASK 03 // QUEUED"
        }
      }
    },
    {
      id: "organic",
      index: "04",
      name: "Organic",
      tag: "Grounded & warm",
      description:
        "A grounded visual language inspired by natural materials, soft forms and warm, human-centred design.",
      palette: [
        { name: "Oat", hex: "#F1E8D7" },
        { name: "Forest", hex: "#294A3A" },
        { name: "Terracotta", hex: "#C87554" },
        { name: "Sage", hex: "#A5B59A" },
        { name: "Bark", hex: "#433B32" }
      ],
      fonts: { display: "Instrument Serif", body: "DM Sans" },
      theme: {
        bg: "#F1E8D7",
        surface: "#F8F2E5",
        ink: "#433B32",
        muted: "#7A6E5F",
        accent: "#294A3A",
        accentInk: "#F1E8D7",
        accent2: "#C87554",
        border: "#D9CBB2",
        faint: "#E4D7BE"
      },
      card: { radius: "22px", border: "1px solid", shadow: "none" },
      specimen: {
        headline: "Grown, not built.",
        paragraph:
          "Organic design takes its cues from soil, fibre and sunlight. Soft forms, earth pigments and calm typography make interfaces that feel handmade and human.",
        label: "Field notes · Set in Instrument Serif"
      },
      cards: {
        feature: {
          kicker: "From the studio garden",
          title: "A skincare brand rooted in soil",
          body: "Terracotta, oat and forest — packaging and web grown from the same seed of an idea.",
          cta: "Wander the garden"
        },
        content: {
          category: "Field guide",
          title: "Five earth pigments to know",
          body: "From raw sienna to deep forest: mixing warmth into digital surfaces without muddying them.",
          meta: "Hand-illustrated · 12 pages"
        },
        action: {
          title: "Plant one idea",
          body: "Sketch a single rounded shape and build today’s layout around its curve.",
          actionLabel: "Planted it",
          doneLabel: "Planted. Watch it grow.",
          note: "Seed 04 · Water weekly"
        }
      }
    }
  ];

  var EXAMPLE_PROMPTS = {
    quiet: "A quiet luxury fashion house — restrained, elegant, premium, with room to breathe.",
    electric: "Electric and experimental — loud colours, bold type, playful high-contrast energy.",
    soft: "Soft and natural — warm, earthy, botanical materials with a calm human touch.",
    dark: "The future after dark — cinematic, technological, neon-lit and precise."
  };

  function getDirection(id) {
    for (var i = 0; i < DIRECTIONS.length; i++) {
      if (DIRECTIONS[i].id === id) return DIRECTIONS[i];
    }
    return null;
  }

  window.MOODBOARD = {
    DIRECTIONS: DIRECTIONS,
    IDS: DIRECTIONS.map(function (d) { return d.id; }),
    EXAMPLE_PROMPTS: EXAMPLE_PROMPTS,
    getDirection: getDirection,
    CONFIDENCE_THRESHOLD: 0.70
  };
})();
