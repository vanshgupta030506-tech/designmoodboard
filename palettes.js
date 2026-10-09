/* ============================================================
   MOODBOARD — curated palette library.
   80 authored palettes, 20 per direction. Each palette holds
   exactly five colours in fixed role order:

     [0] Background — page and preview backdrop
     [1] Surface    — cards, panels and inputs
     [2] Ink        — headings and body copy
     [3] Accent     — buttons, links and highlights
     [4] Accent 2   — secondary highlights and charts

   The first palette of each direction is that direction's
   signature palette (the original five colours, role-ordered).
   Curated entries are NEVER mutated by the studio: editing
   works on a copy, and Reset restores these originals.
   ============================================================ */
(function () {
  "use strict";

  var ROLES = [
    { key: "bg", label: "Background", hint: "Page and preview backdrop" },
    { key: "surface", label: "Surface", hint: "Cards, panels and inputs" },
    { key: "ink", label: "Text", hint: "Headings and body copy" },
    { key: "accent", label: "Accent", hint: "Buttons, links and highlights" },
    { key: "accent2", label: "Accent 2", hint: "Secondary highlights and charts" }
  ];

  // C = colour shorthand: [name, hex]
  var PALETTES = [
    /* ---------------- MINIMAL (01–20) ---------------- */
    { id: "minimal-01", direction: "minimal", name: "Porcelain Study", colors: [["Porcelain", "#F5F2EB"], ["Mist", "#E4E1DA"], ["Ink", "#20211F"], ["Olive", "#747A60"], ["Stone", "#C8C3B8"]] },
    { id: "minimal-02", direction: "minimal", name: "Alabaster", colors: [["Alabaster", "#FAF8F3"], ["Oat Silk", "#ECE7DB"], ["Espresso", "#23211D"], ["Clay", "#9A7B5F"], ["Bone", "#D8D2C4"]] },
    { id: "minimal-03", direction: "minimal", name: "Fog Line", colors: [["Fog", "#F2F3F1"], ["Pale Smoke", "#E2E4E0"], ["Charcoal", "#1F2422"], ["Slate Green", "#5B6B66"], ["Ash", "#C9CDC8"]] },
    { id: "minimal-04", direction: "minimal", name: "Bone Structure", colors: [["Bone", "#F4EFE6"], ["Sand Veil", "#E7DFD0"], ["Truffle", "#2A2620"], ["Umber", "#7D6A53"], ["Dune Mist", "#CFC4B0"]] },
    { id: "minimal-05", direction: "minimal", name: "Chalk Room", colors: [["Chalk", "#FBFBF9"], ["Plaster Line", "#E9E9E6"], ["Soft Black", "#1E1E1E"], ["Moss Grey", "#6B7256"], ["Pebble", "#D4D4CE"]] },
    { id: "minimal-06", direction: "minimal", name: "Linen Press", colors: [["Linen", "#F6F1E7"], ["Flax", "#E9E2D2"], ["Bark Ink", "#26221B"], ["Bronze", "#8A7154"], ["Hessian", "#D3C8B2"]] },
    { id: "minimal-07", direction: "minimal", name: "Gallery White", colors: [["Gallery", "#F7F5F0"], ["Exhibit", "#E5E0D3"], ["Catalogue", "#201D19"], ["Graphite", "#4A4A48"], ["Mountboard", "#CFC9BA"]] },
    { id: "minimal-08", direction: "minimal", name: "Salt and Stone", colors: [["Salt", "#F3F1EC"], ["Quarry", "#E0DCD2"], ["Basalt", "#232620"], ["Sea Mist", "#74827C"], ["Limestone", "#C6C2B6"]] },
    { id: "minimal-09", direction: "minimal", name: "Paper Trail", colors: [["Cotton Paper", "#F8F4EA"], ["Vellum", "#EAE3D3"], ["Walnut Ink", "#2B2721"], ["Ochre", "#A08A5B"], ["Deckled Edge", "#D5CBAF"]] },
    { id: "minimal-10", direction: "minimal", name: "Quiet Slate", colors: [["Still Water", "#EFF0EE"], ["Shale", "#DEE1DD"], ["Harbour", "#20262B"], ["Petrol", "#43616B"], ["Drift", "#C4CAC9"]] },
    { id: "minimal-11", direction: "minimal", name: "Oat Milk", colors: [["Oat Milk", "#F5EFE3"], ["Porridge", "#E6DBC6"], ["Roast", "#29241C"], ["Bark", "#6B5B45"], ["Biscuit", "#D2C5A9"]] },
    { id: "minimal-12", direction: "minimal", name: "Cloud Archive", colors: [["Archive", "#F4F4F2"], ["Filing", "#E3E4E2"], ["Cabinet", "#22252A"], ["Denim Grey", "#5A6B7A"], ["Folder", "#CBCFD2"]] },
    { id: "minimal-13", direction: "minimal", name: "Plaster", colors: [["Plaster", "#F2EDE4"], ["Stucco", "#E2DACA"], ["Beam", "#2E2A24"], ["Fired Dust", "#A97C5F"], ["Tadelakt", "#CDBFA8"]] },
    { id: "minimal-14", direction: "minimal", name: "Mistral", colors: [["Mistral", "#F0F2F0"], ["Grove Floor", "#DDE2DC"], ["Cypress", "#1F2723"], ["Eucalyptus", "#64766B"], ["Lichen", "#C2CBC2"]] },
    { id: "minimal-15", direction: "minimal", name: "Ivory Tower", colors: [["Ivory", "#FAF6EC"], ["Napkin", "#EAE0CB"], ["Letterpress", "#26221A"], ["Brass", "#8C7A4D"], ["Gilt Edge", "#D6C8A4"]] },
    { id: "minimal-16", direction: "minimal", name: "Concrete Poem", colors: [["Cast", "#F1F0EC"], ["Aggregate", "#DFDCD4"], ["Rebar", "#232323"], ["Ash", "#6E6E6A"], ["Formwork", "#C8C4B8"]] },
    { id: "minimal-17", direction: "minimal", name: "Dune", colors: [["Dune", "#F6F0E4"], ["Sifted", "#E8DDC7"], ["Night Desert", "#2C2619"], ["Sandstone", "#96754E"], ["Ripple", "#D5C6A3"]] },
    { id: "minimal-18", direction: "minimal", name: "Frosted Glass", colors: [["Frost", "#F2F4F5"], ["Glazing", "#E0E6E8"], ["Deep Fjord", "#1F2A30"], ["Teal Grey", "#4E6E7A"], ["Condensation", "#C3D0D4"]] },
    { id: "minimal-19", direction: "minimal", name: "Parchment", colors: [["Parchment", "#F4EEDF"], ["Scroll", "#E5D8BC"], ["Sepia Ink", "#2A2318"], ["Sienna", "#8A5A3B"], ["Aged Edge", "#D3C19E"]] },
    { id: "minimal-20", direction: "minimal", name: "Still Life", colors: [["Studio Wall", "#F5F3EE"], ["Drop Cloth", "#E4E0D4"], ["Easel", "#21201D"], ["Sage Grey", "#7C8471"], ["Turpentine", "#CBC5B4"]] },

    /* ---------------- VIBRANT (01–20) ---------------- */
    { id: "vibrant-01", direction: "vibrant", name: "Festival", colors: [["Paper", "#FFF9ED"], ["Lemon", "#F5E94D"], ["Near Black", "#171717"], ["Electric Coral", "#FF5A4E"], ["Cobalt", "#3155E7"]] },
    { id: "vibrant-02", direction: "vibrant", name: "Pool Party", colors: [["Pool Water", "#D8F4FF"], ["White Towel", "#FFFFFF"], ["Deep End", "#10233B"], ["Flamingo", "#FF4D8D"], ["Chlorine Blue", "#2D6CFF"]] },
    { id: "vibrant-03", direction: "vibrant", name: "Cherry Bomb", colors: [["Cherry Ice", "#FFE9E2"], ["Cherry Red", "#FF5147"], ["Cherry Pit", "#241111"], ["Grape Fizz", "#7B2FF7"], ["Mint Fuse", "#00C2A8"]] },
    { id: "vibrant-04", direction: "vibrant", name: "Ultraviolet Youth", colors: [["Basement Club", "#191736"], ["Stage Wash", "#26235C"], ["Strobe White", "#FFFFFF"], ["Laser Coral", "#FF5A4E"], ["Glow Stick", "#38E1C6"]] },
    { id: "vibrant-05", direction: "vibrant", name: "Citrus Punch", colors: [["Pith", "#FFF8E1"], ["Yuzu", "#FFD23F"], ["Burnt Peel", "#1F1B00"], ["Blood Orange", "#EE2C24"], ["Lime Leaf", "#0FA3A3"]] },
    { id: "vibrant-06", direction: "vibrant", name: "Bubblegum Grid", colors: [["Bubblegum Ice", "#FFE4F1"], ["Sticker White", "#FFFFFF"], ["Liquorice", "#3A0E2E"], ["Hot Gum", "#FF3EA5"], ["Ink Violet", "#5B2EE5"]] },
    { id: "vibrant-07", direction: "vibrant", name: "Blueprint Riot", colors: [["Drafting Paper", "#E8ECFF"], ["Fresh Print", "#FFFFFF"], ["Ink Line", "#141A3D"], ["Marker Blue", "#2B4BFF"], ["Hi-Vis Orange", "#FF5C00"]] },
    { id: "vibrant-08", direction: "vibrant", name: "Tropicarnival", colors: [["Coconut", "#FFF6E8"], ["Parrot Green", "#37D67A"], ["Toucan", "#152018"], ["Hibiscus", "#FF2E88"], ["Macaw Blue", "#1E90FF"]] },
    { id: "vibrant-09", direction: "vibrant", name: "Roller Rink", colors: [["Rink Floor", "#EDE4FF"], ["Disco Ball", "#FFFFFF"], ["Velvet Rope", "#241335"], ["Neon Berry", "#B14DFF"], ["Lime Lace", "#8FE000"]] },
    { id: "vibrant-10", direction: "vibrant", name: "Saffron Street", colors: [["Marigold Milk", "#FFF3D6"], ["Saffron", "#FFB800"], ["Charred Wood", "#26180A"], ["Chilli", "#E23A22"], ["Peacock", "#0E7C7B"]] },
    { id: "vibrant-11", direction: "vibrant", name: "Pixel Parade", colors: [["CRT Glow", "#0E1A2B"], ["HUD Panel", "#1B2F4B"], ["High Score", "#FFFFFF"], ["Player One", "#FFD400"], ["Player Two", "#00E5FF"]] },
    { id: "vibrant-12", direction: "vibrant", name: "Sorbet Stand", colors: [["Wafer", "#FFF1E6"], ["Raspberry Sorbet", "#FF5D8F"], ["Cacao Nib", "#2B1414"], ["Pistachio", "#7BC950"], ["Blue Curacao", "#2E9BFF"]] },
    { id: "vibrant-13", direction: "vibrant", name: "Sticker Shock", colors: [["Laptop Lid", "#101014"], ["Sticker Back", "#23232B"], ["Peel White", "#FFFFFF"], ["Volt", "#D4F000"], ["Hot Coral", "#FF5964"]] },
    { id: "vibrant-14", direction: "vibrant", name: "Marigold Mosh", colors: [["Pit Dust", "#1C1508"], ["Barrier", "#33270F"], ["Crowd Surf", "#FFF6DE"], ["Stage Dive", "#FFC400"], ["Encore Teal", "#00C2A8"]] },
    { id: "vibrant-15", direction: "vibrant", name: "Candy Console", colors: [["Cotton Candy", "#FFE3F2"], ["Arcade White", "#FFFFFF"], ["Joystick", "#33102A"], ["Insert Coin", "#FF2E88"], ["Power Up", "#00B39B"]] },
    { id: "vibrant-16", direction: "vibrant", name: "Graffiti Wall", colors: [["Fresh Concrete", "#E9E9EC"], ["Primer", "#FFFFFF"], ["Outline Black", "#131316"], ["Spray Magenta", "#E500A4"], ["Tag Cyan", "#00C2FF"]] },
    { id: "vibrant-17", direction: "vibrant", name: "Samba", colors: [["Sand Stage", "#FFF0D9"], ["Feather Gold", "#FFB300"], ["Drum Skin", "#2A1608"], ["Carnival Red", "#F0322B"], ["Palm Teal", "#007A78"]] },
    { id: "vibrant-18", direction: "vibrant", name: "Midnight Diner", colors: [["Neon Night", "#141021"], ["Booth Vinyl", "#241A3D"], ["Milkshake", "#FFF4F8"], ["Cherry Neon", "#FF2E63"], ["Mint Neon", "#08D9D6"]] },
    { id: "vibrant-19", direction: "vibrant", name: "Kite Festival", colors: [["Sky Wash", "#DFF3FF"], ["Kite Paper", "#FFFFFF"], ["String Black", "#14202E"], ["Kite Red", "#FF3B30"], ["Tail Teal", "#00A8B5"]] },
    { id: "vibrant-20", direction: "vibrant", name: "Fruit Market", colors: [["Melon Flesh", "#FFE8C7"], ["Banana Leaf", "#4CAF50"], ["Mangosteen", "#231318"], ["Dragonfruit", "#E93CAC"], ["Orange Stall", "#FF8A00"]] },

    /* ---------------- FUTURISTIC (01–20) ---------------- */
    { id: "futuristic-01", direction: "futuristic", name: "Midnight Run", colors: [["Midnight", "#10131C"], ["Graphite", "#222837"], ["Cloud", "#E8ECF5"], ["Electric Cyan", "#79F2E6"], ["Ultraviolet", "#8D83FF"]] },
    { id: "futuristic-02", direction: "futuristic", name: "Matrix Rain", colors: [["Terminal Black", "#0A120C"], ["Code Panel", "#14231A"], ["Phosphor", "#D9F5E3"], ["Signal Green", "#4DFF88"], ["Trace Blue", "#00C2FF"]] },
    { id: "futuristic-03", direction: "futuristic", name: "Neon Dusk", colors: [["Violet Night", "#160F24"], ["Club Panel", "#241841"], ["Haze White", "#EDE6FF"], ["Hot Signal", "#FF5AD2"], ["Deep Violet", "#7C5CFF"]] },
    { id: "futuristic-04", direction: "futuristic", name: "Solar Flare", colors: [["Eclipse", "#170F08"], ["Heat Shield", "#2A1A0E"], ["Sun Paper", "#F7E9D4"], ["Flare Amber", "#FFB020"], ["Re-entry Red", "#FF5A3C"]] },
    { id: "futuristic-05", direction: "futuristic", name: "Deep Signal", colors: [["Abyss", "#081018"], ["Sonar Room", "#0F2233"], ["Foam", "#D8EDFF"], ["Ping Cyan", "#41C7FF"], ["Trench Blue", "#3D6BFF"]] },
    { id: "futuristic-06", direction: "futuristic", name: "Plasma", colors: [["Containment", "#12060F"], ["Reactor Wall", "#260D20"], ["Lab Coat", "#F6DFF2"], ["Plasma Pink", "#FF3D8A"], ["Ion Purple", "#B14DFF"]] },
    { id: "futuristic-07", direction: "futuristic", name: "Ion Storm", colors: [["Storm Cellar", "#0B1520"], ["Radar Deck", "#16293D"], ["Static White", "#E2F4FF"], ["Charge Mint", "#5CFFB1"], ["Bolt Blue", "#38B6FF"]] },
    { id: "futuristic-08", direction: "futuristic", name: "Black Hole", colors: [["Event Horizon", "#050507"], ["Accretion", "#141419"], ["Starlight", "#F2F2F5"], ["Quasar Lime", "#C6F52E"], ["Lens Violet", "#8D83FF"]] },
    { id: "futuristic-09", direction: "futuristic", name: "Chrome Dusk", colors: [["Hangar", "#101418"], ["Hull Plate", "#1D262E"], ["Fog Light", "#E8EFF3"], ["Afterburner", "#7DE3FF"], ["Rust Alert", "#FF8A5C"]] },
    { id: "futuristic-10", direction: "futuristic", name: "Void Violet", colors: [["Null Space", "#0E0A1A"], ["Dark Module", "#1C1433"], ["Ghost Text", "#E9E4FF"], ["Wormhole", "#A78BFA"], ["Escape Mint", "#34F5C5"]] },
    { id: "futuristic-11", direction: "futuristic", name: "Reactor", colors: [["Coolant Dark", "#0D1410"], ["Core Room", "#1A2B22"], ["Safety White", "#E4F3EA"], ["Warning Gold", "#FFD23F"], ["Go Green", "#2DFF88"]] },
    { id: "futuristic-12", direction: "futuristic", name: "Ghost Protocol", colors: [["Stealth", "#0C0F14"], ["Ops Deck", "#1A212C"], ["Redacted", "#E8ECF5"], ["Cipher Mint", "#9DF2E4"], ["Alarm Rose", "#FF6B9D"]] },
    { id: "futuristic-13", direction: "futuristic", name: "Night Circuit", colors: [["Breadboard", "#0A0F1E"], ["Solder Mask", "#17203A"], ["Silkscreen", "#DCE6FF"], ["Trace Cyan", "#6EE7FF"], ["Flux Lilac", "#C792EA"]] },
    { id: "futuristic-14", direction: "futuristic", name: "Dark Matter", colors: [["Observatory", "#0F0C12"], ["Lens Hood", "#221A2A"], ["Star Chart", "#F0E8F5"], ["Nebula Pink", "#FF7AD9"], ["Gravity Violet", "#7A5CFF"]] },
    { id: "futuristic-15", direction: "futuristic", name: "Cryo Bay", colors: [["Freeze Chamber", "#07141A"], ["Ice Core", "#0F2A33"], ["Frost Breath", "#D9F6FF"], ["Thaw Cyan", "#3FF2FF"], ["Deep Freeze", "#2E7CF6"]] },
    { id: "futuristic-16", direction: "futuristic", name: "Ember Core", colors: [["Ash Fall", "#130B06"], ["Furnace", "#291711"], ["Spark Paper", "#F5E3CE"], ["Ignition", "#FF7A1A"], ["Forge Gold", "#FFD23F"]] },
    { id: "futuristic-17", direction: "futuristic", name: "Synthwave", colors: [["Grid Horizon", "#14091F"], ["Chrome Deck", "#2A1238"], ["Palm Silhouette", "#F3DFFF"], ["Sunset Pink", "#FF2EA6"], ["Laser Cyan", "#00E5FF"]] },
    { id: "futuristic-18", direction: "futuristic", name: "Orbital", colors: [["Airlock", "#0A0E14"], ["Command Mod", "#182130"], ["Telemetry", "#E6EDF7"], ["Oxygen Mint", "#88FFD1"], ["Thruster Blue", "#5C8CFF"]] },
    { id: "futuristic-19", direction: "futuristic", name: "Null Pointer", colors: [["Zero Dark", "#0A0A0B"], ["Heap Panel", "#1C1C1F"], ["Stack Trace", "#F5F5F4"], ["Heap Green", "#00E065"], ["Segfault Pink", "#FF4DFF"]] },
    { id: "futuristic-20", direction: "futuristic", name: "Starfield", colors: [["Deep Field", "#060B18"], ["Telescope", "#101A30"], ["Parallax", "#E3EBFF"], ["Blue Giant", "#8FB8FF"], ["Dwarf Orange", "#FF9E6B"]] },

    /* ---------------- ORGANIC (01–20) ---------------- */
    { id: "organic-01", direction: "organic", name: "Garden Bed", colors: [["Oat", "#F1E8D7"], ["Sage", "#A5B59A"], ["Bark", "#433B32"], ["Forest", "#294A3A"], ["Terracotta", "#C87554"]] },
    { id: "organic-02", direction: "organic", name: "Terracotta Sun", colors: [["Sun Cream", "#F6E7D3"], ["Baked Sand", "#EFD9BE"], ["Dark Loam", "#4A3226"], ["Kiln Red", "#B4552D"], ["Olive Leaf", "#6B7F4E"]] },
    { id: "organic-03", direction: "organic", name: "Moss and Stone", colors: [["River Mist", "#ECE7D8"], ["Moss Bed", "#DDE0CB"], ["Wet Slate", "#33382B"], ["Canopy", "#4A5D3A"], ["Gravel", "#8C8570"]] },
    { id: "organic-04", direction: "organic", name: "Clay Workshop", colors: [["Wet Clay", "#F3E2CF"], ["Leather Hard", "#E7C9A8"], ["Iron Soil", "#503527"], ["Glaze Rust", "#A34A24"], ["Studio Fern", "#7A8450"]] },
    { id: "organic-05", direction: "organic", name: "Forest Floor", colors: [["Night Canopy", "#232B21"], ["Underbrush", "#33402E"], ["Moon Milk", "#EFE6D2"], ["Fox Orange", "#C87554"], ["Pale Lichen", "#A5B59A"]] },
    { id: "organic-06", direction: "organic", name: "Harvest", colors: [["Wheat Field", "#F7ECD4"], ["Straw Bale", "#F0DDAE"], ["Barn Wood", "#4D3A22"], ["Grain Gold", "#8A5A1E"], ["Apple Skin", "#B4552D"]] },
    { id: "organic-07", direction: "organic", name: "River Rock", colors: [["Shallow Water", "#E9E7DF"], ["Smooth Stone", "#D8D5C7"], ["Deep Pool", "#3C3A33"], ["Algae", "#5F6F5A"], ["Copper Vein", "#A9713F"]] },
    { id: "organic-08", direction: "organic", name: "Botanical", colors: [["Glasshouse", "#EDF0E2"], ["Seedling", "#DCE3CB"], ["Potting Soil", "#2F3A2A"], ["Monstera", "#3E6B34"], ["Marigold", "#C98A2D"]] },
    { id: "organic-09", direction: "organic", name: "Desert Rose", colors: [["Dune Bloom", "#F5E3D8"], ["Petal Sand", "#EBCDBB"], ["Canyon Shade", "#552F28"], ["Bloom Red", "#B4503C"], ["Sagebrush", "#7C8A5A"]] },
    { id: "organic-10", direction: "organic", name: "Olive Grove", colors: [["Grove Light", "#F0EBD8"], ["Pressed Oil", "#E0D8BC"], ["Old Trunk", "#3A3A24"], ["Grove Green", "#5C6B2F"], ["Harvest Rust", "#A9713F"]] },
    { id: "organic-11", direction: "organic", name: "Mushroom", colors: [["Cap Cream", "#EFE8DE"], ["Gills", "#DFD2C2"], ["Forest Litter", "#463C33"], ["Porcini", "#7A5C48"], ["Moss Spore", "#9AA38B"]] },
    { id: "organic-12", direction: "organic", name: "Eucalyptus", colors: [["Morning Gum", "#E8ECE3"], ["Leaf Wash", "#D3DCCB"], ["Koala", "#37402F"], ["Blue Gum", "#5A7A5C"], ["Honey Bark", "#B98A4B"]] },
    { id: "organic-13", direction: "organic", name: "Campfire", colors: [["Ember Glow", "#F2E4CE"], ["Toasted Marsh", "#E4C9A2"], ["Charred Log", "#4B2E1E"], ["Flame", "#C25E2E"], ["Smoke Bark", "#6B4A2A"]] },
    { id: "organic-14", direction: "organic", name: "Tidal Pool", colors: [["Sea Mist", "#E7ECE8"], ["Wet Rock", "#CFD9D2"], ["Kelp Bed", "#2F3B38"], ["Seaweed", "#3E6E62"], ["Shell Gold", "#B08945"]] },
    { id: "organic-15", direction: "organic", name: "Walnut", colors: [["Orchard Night", "#2C241C"], ["Husk", "#453729"], ["Kernel Cream", "#EFE3CE"], ["Shellac", "#C98A4B"], ["Leaf Mould", "#8AA382"]] },
    { id: "organic-16", direction: "organic", name: "Meadow", colors: [["Morning Meadow", "#F1F2DF"], ["Cut Grass", "#E2E4C4"], ["Hedge", "#3B4226"], ["Pasture", "#6B8E3B"], ["Poppy", "#C26B32"]] },
    { id: "organic-17", direction: "organic", name: "Canyon", colors: [["Sandstone Light", "#F4DFC8"], ["Slickrock", "#E7BE97"], ["Slot Shade", "#5A2E1C"], ["Iron Red", "#A63F1F"], ["Dry Grass", "#7A6A3A"]] },
    { id: "organic-18", direction: "organic", name: "Fern and Fog", colors: [["Valley Fog", "#E6EAE2"], ["Frond", "#CBD4C2"], ["Redwood Shade", "#2E3830"], ["Fern", "#43624A"], ["Fallen Pine", "#A98B4F"]] },
    { id: "organic-19", direction: "organic", name: "Honeycomb", colors: [["Beeswax", "#F8EDCF"], ["Honey", "#F2DCA0"], ["Hive Wood", "#54401A"], ["Amber", "#B07A1F"], ["Propolis", "#7C5A2E"]] },
    { id: "organic-20", direction: "organic", name: "Peat and Pine", colors: [["Bog Night", "#1F241D"], ["Pine Stand", "#2E362A"], ["Birch Paper", "#E7DCC3"], ["Needle Pale", "#9DB38A"], ["Resin", "#C47B4A"]] }
  ];

  function byDirection(directionId) {
    return PALETTES.filter(function (p) { return p.direction === directionId; });
  }

  function get(id) {
    for (var i = 0; i < PALETTES.length; i++) {
      if (PALETTES[i].id === id) return PALETTES[i];
    }
    return null;
  }

  function signature(directionId) {
    return get(directionId + "-01");
  }

  function cloneColors(entry) {
    // Curated entries store colours as [name, hex] pairs; custom
    // entries store { name, hex } objects. Accept both shapes.
    return entry.colors.map(function (c) {
      return Array.isArray(c) ? { name: c[0], hex: c[1] } : { name: c.name, hex: c.hex };
    });
  }

  window.MOODBOARD_LIB = {
    ROLES: ROLES,
    PALETTES: PALETTES,
    byDirection: byDirection,
    get: get,
    signature: signature,
    cloneColors: cloneColors
  };
})();
