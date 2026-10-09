/* ============================================================
   MOODBOARD — palette studio.
   A real working colour editor with a live product preview.

   - Every edit works on a working copy; curated originals are
     never mutated. Reset restores the loaded palette's originals.
   - The preview (#studio-preview) reads ALL of its colours from
     CSS variables set from the working copy. Nothing is hardcoded.
   - This module makes zero network requests. Editing colours
     never touches /api/decide and never involves Jev.
   - Custom palettes + favourites persist in localStorage.
     No keys or sensitive data are ever stored there.
   ============================================================ */
(function () {
  "use strict";

  var LIB = window.MOODBOARD_LIB;
  var BOARD = window.MOODBOARD;

  /* ---------- tiny helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function el(tag, className, text) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (text != null) n.textContent = text;
    return n;
  }
  function toast(message) {
    var region = $("toast-region");
    if (!region) return;
    var t = el("div", "toast", message);
    region.appendChild(t);
    window.setTimeout(function () { t.remove(); }, 2200);
  }
  function directionName(id) {
    var d = BOARD.getDirection(id);
    return d ? d.name : id;
  }

  /* ---------- colour utils ---------- */
  function normalizeHex(raw) {
    if (typeof raw !== "string") return null;
    var s = raw.trim().replace(/^#/, "");
    if (/^[0-9a-fA-F]{3}$/.test(s)) {
      s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    }
    if (!/^[0-9a-fA-F]{6}$/.test(s)) return null;
    return "#" + s.toUpperCase();
  }

  function hexToRgb(hex) {
    var n = normalizeHex(hex);
    if (!n) return null;
    return {
      r: parseInt(n.slice(1, 3), 16),
      g: parseInt(n.slice(3, 5), 16),
      b: parseInt(n.slice(5, 7), 16)
    };
  }

  function luminance(hex) {
    var c = hexToRgb(hex);
    function lin(v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    }
    return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
  }

  function contrast(a, b) {
    var l1 = luminance(a), l2 = luminance(b);
    var hi = Math.max(l1, l2), lo = Math.min(l1, l2);
    return (hi + 0.05) / (lo + 0.05);
  }

  function mix(a, b, t) {
    var ca = hexToRgb(a), cb = hexToRgb(b);
    function ch(k) { return Math.round(ca[k] + (cb[k] - ca[k]) * t); }
    function hx(v) { var s = v.toString(16).toUpperCase(); return s.length < 2 ? "0" + s : s; }
    return "#" + hx(ch("r")) + hx(ch("g")) + hx(ch("b"));
  }

  // Recommend black or white for text on the given background.
  function bestTextOn(bg) {
    var white = contrast("#FFFFFF", bg);
    var black = contrast("#101010", bg);
    return white >= black ? "#FFFFFF" : "#101010";
  }

  function fmtRatio(r) {
    return (Math.round(r * 100) / 100).toFixed(2) + " : 1";
  }

  /* ---------- persistence (custom palettes + favourites only) ---------- */
  var LS_CUSTOM = "moodboard.customPalettes.v1";
  var LS_FAVS = "moodboard.favouritePalettes.v1";
  var memoryCustom = [];
  var memoryFavs = [];
  var lsAvailable = true;
  try {
    window.localStorage.setItem("__mb_probe", "1");
    window.localStorage.removeItem("__mb_probe");
  } catch (e) { lsAvailable = false; }

  function loadCustom() {
    if (!lsAvailable) return memoryCustom.slice();
    try {
      var raw = window.localStorage.getItem(LS_CUSTOM);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }
  function saveCustom(list) {
    if (!lsAvailable) { memoryCustom = list.slice(); return; }
    try { window.localStorage.setItem(LS_CUSTOM, JSON.stringify(list)); }
    catch (e) { memoryCustom = list.slice(); }
  }
  function loadFavs() {
    if (!lsAvailable) return memoryFavs.slice();
    try {
      var raw = window.localStorage.getItem(LS_FAVS);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.filter(function (x) { return typeof x === "string"; }) : [];
    } catch (e) { return []; }
  }
  function saveFavs(list) {
    if (!lsAvailable) { memoryFavs = list.slice(); return; }
    try { window.localStorage.setItem(LS_FAVS, JSON.stringify(list)); }
    catch (e) { memoryFavs = list.slice(); }
  }
  function getCustom(id) {
    var list = loadCustom();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  /* ---------- state ---------- */
  var state = {
    kind: "curated",          // 'curated' | 'custom'
    id: "futuristic-01",
    direction: "futuristic",
    working: [],              // [{name, hex} × 5], the live editable copy
    selected: -1,             // which row's advanced controls are open
    dirty: false,             // unsaved edits in the working copy
    filter: "all",            // all | direction id | 'favs'
    query: ""
  };

  function sourceLabel() {
    if (state.kind === "custom") {
      var c = getCustom(state.id);
      return c ? c.name : "Custom palette";
    }
    var p = LIB.get(state.id);
    return p ? p.name : "Palette";
  }

  function originalColors() {
    if (state.kind === "custom") {
      var c = getCustom(state.id);
      return c ? c.colors.map(function (x) { return { name: x.name, hex: x.hex }; }) : [];
    }
    var p = LIB.get(state.id);
    return p ? LIB.cloneColors(p) : [];
  }

  /* ---------- derived live theme (single source of truth) ---------- */
  function liveTheme() {
    var w = state.working;
    var bg = w[0].hex, surface = w[1].hex, ink = w[2].hex;
    var accent = w[3].hex, accent2 = w[4].hex;
    return {
      bg: bg,
      surface: surface,
      ink: ink,
      muted: mix(ink, bg, 0.38),
      accent: accent,
      accent2: accent2,
      onAccent: bestTextOn(accent),
      border: mix(ink, bg, 0.16),
      faint: mix(ink, bg, 0.07)
    };
  }

  function applyToPreview() {
    var frame = $("studio-preview");
    if (!frame || state.working.length !== 5) return;
    var t = liveTheme();
    var vars = {
      "--st-bg": t.bg, "--st-surface": t.surface, "--st-ink": t.ink,
      "--st-muted": t.muted, "--st-accent": t.accent, "--st-accent2": t.accent2,
      "--st-on-accent": t.onAccent, "--st-border": t.border, "--st-faint": t.faint
    };
    for (var k in vars) frame.style.setProperty(k, vars[k]);
    var d = BOARD.getDirection(state.direction);
    if (d) {
      frame.style.setProperty("--st-display", "'" + d.fonts.display + "', Georgia, serif");
      frame.style.setProperty("--st-body", "'" + d.fonts.body + "', -apple-system, sans-serif");
    }
    renderContrast(t);
  }

  /* ---------- loading palettes ---------- */
  function guardDirty() {
    if (!state.dirty) return true;
    return window.confirm(
      "You have unsaved colour edits. Load a different palette and discard them?"
    );
  }

  function loadPalette(kind, id, opts) {
    opts = opts || {};
    if (!opts.force && !guardDirty()) return false;
    var entry = kind === "custom" ? getCustom(id) : LIB.get(id);
    if (!entry) return false;
    state.kind = kind;
    state.id = id;
    state.direction = entry.direction;
    state.working = LIB.cloneColors(entry);
    state.selected = -1;
    state.dirty = false;
    renderAll();
    return true;
  }

  function openSignature(directionId) {
    var sig = LIB.signature(directionId);
    if (!sig) return;
    loadPalette("curated", sig.id, { force: false });
    var s = $("studio");
    if (s) s.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---------- editing ---------- */
  function setColor(i, hex, opts) {
    opts = opts || {};
    var clean = normalizeHex(hex);
    if (!clean) return false;
    if (state.working[i].hex === clean) return true;
    state.working[i].hex = clean;
    if (!opts.silent) state.dirty = true;
    renderSource();
    paintRow(i);
    applyToPreview();
    return true;
  }

  /* ---------- editor rendering ---------- */
  function renderSource() {
    var box = $("st-source");
    box.innerHTML = "";
    var eyebrow = el("p", "eyebrow", state.kind === "custom" ? "Custom palette" : "Curated palette");
    box.appendChild(eyebrow);
    var title = el("p", "st-source-name", sourceLabel());
    box.appendChild(title);
    var meta = el("p", "st-source-meta",
      directionName(state.direction) + " direction · " +
      (state.dirty ? "Unsaved edits — the original is untouched." : "Matches the saved original."));
    box.appendChild(meta);
  }

  function paintRow(i) {
    var li = $("st-rows").children[i];
    if (!li) return;
    var c = state.working[i];
    var dot = li.querySelector(".st-dot");
    dot.style.background = c.hex;
    dot.setAttribute("aria-label", "Edit " + LIB.ROLES[i].label + " colour " + c.name);
    li.querySelector(".st-rowhex").textContent = c.name + " · " + c.hex;
    var picker = li.querySelector('input[type="color"]');
    if (picker && document.activeElement !== picker) picker.value = c.hex.toLowerCase();
    var hexField = li.querySelector(".st-hexfield");
    if (hexField && document.activeElement !== hexField) hexField.value = c.hex;
  }

  function renderRows() {
    var list = $("st-rows");
    list.innerHTML = "";
    state.working.forEach(function (c, i) {
      var role = LIB.ROLES[i];
      var li = el("li", "st-row");
      if (i === state.selected) li.classList.add("open");

      var dot = el("button", "st-dot");
      dot.type = "button";
      dot.style.background = c.hex;
      dot.setAttribute("aria-label", "Edit " + role.label + " colour " + c.name);
      dot.addEventListener("click", function () {
        state.selected = (state.selected === i) ? -1 : i;
        renderRows();
        if (state.selected === i) {
          var f = list.children[i].querySelector(".st-hexfield");
          if (f) f.focus();
        }
      });

      var meta = el("div", "st-rowmeta");
      meta.appendChild(el("strong", null, role.label));
      meta.appendChild(el("span", "st-rowhex", c.name + " · " + c.hex));
      meta.appendChild(el("span", "st-rowhint", role.hint));

      var editBtn = el("button", "st-editbtn", state.selected === i ? "Done" : "Edit");
      editBtn.type = "button";
      editBtn.setAttribute("aria-expanded", state.selected === i ? "true" : "false");
      editBtn.addEventListener("click", function () {
        state.selected = (state.selected === i) ? -1 : i;
        renderRows();
      });

      li.appendChild(dot);
      li.appendChild(meta);
      li.appendChild(editBtn);

      if (state.selected === i) {
        var adv = el("div", "st-advanced");
        var pickLabel = el("label", "st-picklabel", "Colour picker ");
        var picker = document.createElement("input");
        picker.type = "color";
        picker.value = c.hex.toLowerCase();
        picker.setAttribute("aria-label", role.label + " colour picker");
        picker.addEventListener("input", function () { setColor(i, picker.value); });
        pickLabel.appendChild(picker);
        adv.appendChild(pickLabel);

        var hexLabel = el("label", "st-hexlabel", "HEX ");
        var hexField = document.createElement("input");
        hexField.type = "text";
        hexField.className = "st-hexfield";
        hexField.value = c.hex;
        hexField.setAttribute("spellcheck", "false");
        hexField.setAttribute("aria-label", role.label + " HEX value");
        hexField.setAttribute("placeholder", "#RRGGBB");
        hexLabel.appendChild(hexField);
        adv.appendChild(hexLabel);

        var err = el("p", "st-hexerr", "");
        err.id = "st-hexerr-" + i;
        err.setAttribute("role", "alert");
        err.hidden = true;
        adv.appendChild(err);

        hexField.addEventListener("change", function () {
          var ok = setColor(i, hexField.value);
          if (!ok) {
            err.textContent = "“" + hexField.value.trim() + "” is not a valid HEX colour. Use 3 or 6 hex digits, e.g. #7A5CFF.";
            err.hidden = false;
            hexField.value = state.working[i].hex;
            hexField.setAttribute("aria-invalid", "true");
          } else {
            err.hidden = true;
            hexField.removeAttribute("aria-invalid");
          }
        });

        var copyBtn = el("button", "st-minibtn", "Copy HEX");
        copyBtn.type = "button";
        copyBtn.addEventListener("click", function () {
          var hx = state.working[i].hex;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(hx).then(function () { toast("Copied " + hx); });
          } else { toast(hx); }
        });
        adv.appendChild(copyBtn);
        li.appendChild(adv);
      }
      list.appendChild(li);
    });
  }

  /* ---------- contrast / accessibility ---------- */
  function contrastRow(label, fg, bg, largeOnly) {
    var r = contrast(fg, bg);
    var row = el("div", "st-contrast-row");
    var left = el("div");
    left.appendChild(el("strong", null, label));
    left.appendChild(el("span", null, fmtRatio(r)));
    row.appendChild(left);
    var badges = el("div", "st-badges");
    var aa = el("span", "st-pass " + (r >= 4.5 ? "ok" : "fail"), "AA " + (r >= 4.5 ? "pass" : "fail"));
    var aal = el("span", "st-pass " + (r >= 3 ? "ok" : "fail"), "Large " + (r >= 3 ? "pass" : "fail"));
    badges.appendChild(aa);
    badges.appendChild(aal);
    row.appendChild(badges);
    row.dataset.ok = (largeOnly ? r >= 3 : r >= 4.5) ? "1" : "0";
    return row;
  }

  function renderContrast(t) {
    t = t || liveTheme();
    var box = $("st-contrast");
    box.innerHTML = "";
    box.appendChild(el("h3", null, "Readability"));
    box.appendChild(contrastRow("Text on background", t.ink, t.bg));
    box.appendChild(contrastRow("Secondary on background", t.muted, t.bg));
    box.appendChild(contrastRow("Button text on accent", t.onAccent, t.accent));
    if (contrast(t.ink, t.bg) < 4.5) {
      var warn = el("div", "st-warn");
      warn.setAttribute("role", "alert");
      warn.appendChild(el("p", null, "Text on this background is below WCAG AA for normal text. Your colour stays exactly as you set it."));
      var sug = el("button", "st-minibtn", "Suggest readable text colour");
      sug.type = "button";
      sug.addEventListener("click", function () {
        var pick = bestTextOn(state.working[0].hex);
        setColor(2, pick);
        renderRows();
        toast("Text set to " + pick + " — everything else untouched.");
      });
      warn.appendChild(sug);
      box.appendChild(warn);
    }
  }

  /* ---------- actions: reset / duplicate / save ---------- */
  function saveErr(msg) {
    var p = $("st-save-err");
    p.textContent = msg || "";
    p.hidden = !msg;
  }

  function wireActions() {
    $("st-reset").addEventListener("click", function () {
      if (state.dirty && !window.confirm("Discard your edits and restore the original colours?")) return;
      state.working = originalColors();
      state.dirty = false;
      state.selected = -1;
      renderAll();
      toast("Restored “" + sourceLabel() + "”.");
    });

    $("st-duplicate").addEventListener("click", function () {
      var list = loadCustom();
      var copy = {
        id: "custom-" + Date.now().toString(36),
        name: sourceLabel() + " copy",
        direction: state.direction,
        colors: state.working.map(function (c) { return { name: c.name, hex: c.hex }; }),
        createdAt: Date.now()
      };
      list.unshift(copy);
      saveCustom(list);
      state.kind = "custom";
      state.id = copy.id;
      state.dirty = false;
      $("st-save-name").value = copy.name;
      renderAll();
      toast("Duplicated as “" + copy.name + "”.");
    });

    $("st-save").addEventListener("click", function () {
      var name = $("st-save-name").value.trim();
      if (!name) { saveErr("Give your palette a name first."); $("st-save-name").focus(); return; }
      saveErr(null);
      var list = loadCustom();
      var entry = {
        id: "custom-" + Date.now().toString(36),
        name: name,
        direction: state.direction,
        colors: state.working.map(function (c) { return { name: c.name, hex: c.hex }; }),
        createdAt: Date.now()
      };
      list.unshift(entry);
      saveCustom(list);
      // Saving never modifies the curated original; the saved copy becomes the source.
      state.kind = "custom";
      state.id = entry.id;
      state.dirty = false;
      renderAll();
      toast("Saved “" + name + "” to My palettes.");
    });
  }

  /* ---------- my palettes ---------- */
  function strip(colors) {
    var s = el("span", "mini-strip");
    s.setAttribute("aria-hidden", "true");
    colors.forEach(function (c) {
      var i = document.createElement("i");
      i.style.background = c.hex;
      s.appendChild(i);
    });
    return s;
  }

  function renderMine() {
    var list = loadCustom();
    var ul = $("st-mine-list");
    ul.innerHTML = "";
    $("st-mine-empty").hidden = list.length > 0;
    list.forEach(function (entry) {
      var li = el("li", "st-mine-row");
      li.appendChild(strip(entry.colors));
      var meta = el("div", "st-mine-meta");
      meta.appendChild(el("strong", null, entry.name));
      meta.appendChild(el("span", null, directionName(entry.direction) + (state.kind === "custom" && state.id === entry.id ? " · open now" : "")));
      li.appendChild(meta);
      var load = el("button", "st-minibtn", "Open");
      load.type = "button";
      load.setAttribute("aria-label", "Open " + entry.name + " in the editor");
      load.addEventListener("click", function () { loadPalette("custom", entry.id); });
      var del = el("button", "st-minibtn danger", "Delete");
      del.type = "button";
      del.setAttribute("aria-label", "Delete " + entry.name);
      del.addEventListener("click", function () {
        if (!window.confirm("Delete “" + entry.name + "” permanently?")) return;
        var rest = loadCustom().filter(function (x) { return x.id !== entry.id; });
        saveCustom(rest);
        saveFavs(loadFavs().filter(function (x) { return x !== entry.id; }));
        if (state.kind === "custom" && state.id === entry.id) {
          var sig = LIB.signature(entry.direction);
          state.kind = "curated"; state.id = sig.id; state.direction = sig.direction;
          state.working = LIB.cloneColors(sig); state.dirty = false; state.selected = -1;
        }
        renderAll();
        toast("Deleted “" + entry.name + "”.");
      });
      li.appendChild(load);
      li.appendChild(del);
      ul.appendChild(li);
    });
  }

  /* ---------- curated library browser ---------- */
  var FILTERS = [
    { id: "all", label: "All" },
    { id: "minimal", label: "Minimal" },
    { id: "vibrant", label: "Vibrant" },
    { id: "futuristic", label: "Futuristic" },
    { id: "organic", label: "Organic" },
    { id: "favs", label: "Favourites" }
  ];

  function filteredPalettes() {
    var favs = loadFavs();
    var q = state.query.trim().toLowerCase();
    return LIB.PALETTES.filter(function (p) {
      if (state.filter === "favs") { if (favs.indexOf(p.id) === -1) return false; }
      else if (state.filter !== "all" && p.direction !== state.filter) return false;
      if (!q) return true;
      if (p.name.toLowerCase().indexOf(q) !== -1) return true;
      for (var i = 0; i < p.colors.length; i++) {
        if (p.colors[i][0].toLowerCase().indexOf(q) !== -1) return true;
      }
      return false;
    });
  }

  function renderChips() {
    var box = $("st-chips");
    box.innerHTML = "";
    FILTERS.forEach(function (f) {
      var b = el("button", "st-chip" + (state.filter === f.id ? " on" : ""), f.label);
      b.type = "button";
      b.setAttribute("aria-pressed", state.filter === f.id ? "true" : "false");
      b.addEventListener("click", function () { state.filter = f.id; renderChips(); renderLibrary(); });
      box.appendChild(b);
    });
  }

  function renderLibrary() {
    var grid = $("st-lib-grid");
    grid.innerHTML = "";
    var items = filteredPalettes();
    $("st-lib-count").textContent = items.length === 1
      ? "Showing 1 palette."
      : "Showing " + items.length + " palettes.";
    var favs = loadFavs();
    if (!items.length) {
      grid.appendChild(el("p", "microcopy", "No palettes match. Try a different filter or search."));
      return;
    }
    items.forEach(function (p) {
      var card = el("article", "st-lib-card");
      if (state.kind === "curated" && state.id === p.id) card.classList.add("open");
      card.appendChild(strip(p.colors.map(function (c) { return { hex: c[1] }; })));
      var head = el("div", "st-lib-head");
      head.appendChild(el("strong", null, p.name));
      var fav = el("button", "st-fav" + (favs.indexOf(p.id) !== -1 ? " on" : ""));
      fav.type = "button";
      fav.textContent = favs.indexOf(p.id) !== -1 ? "★" : "☆";
      fav.setAttribute("aria-label", (favs.indexOf(p.id) !== -1 ? "Remove " : "Favourite ") + p.name);
      fav.setAttribute("aria-pressed", favs.indexOf(p.id) !== -1 ? "true" : "false");
      fav.addEventListener("click", function () {
        var f = loadFavs();
        var at = f.indexOf(p.id);
        if (at === -1) { f.push(p.id); toast("Favourited “" + p.name + "”."); }
        else { f.splice(at, 1); }
        saveFavs(f);
        renderLibrary();
      });
      head.appendChild(fav);
      card.appendChild(head);
      card.appendChild(el("p", "st-lib-dir", directionName(p.direction)));
      var open = el("button", "lib-preview", state.kind === "curated" && state.id === p.id ? "Open now" : "Open in editor");
      open.type = "button";
      if (state.kind === "curated" && state.id === p.id) open.disabled = true;
      open.addEventListener("click", function () {
        if (loadPalette("curated", p.id)) {
          toast("Loaded “" + p.name + "” into the editor.");
          $("studio").scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
      card.appendChild(open);
      grid.appendChild(card);
    });
  }

  /* ---------- preview micro-interactions (all local, no network) ---------- */
  function wirePreview() {
    var note = $("stv-plan-note");
    $("stv-primary").addEventListener("click", function () {
      note.textContent = "✓ Free plan selected — welcome aboard.";
    });
    $("stv-secondary").addEventListener("click", function () {
      note.textContent = "Plans: Starter (free), Studio ($12), Atelier ($29).";
    });
    var pct = 68;
    var fill = $("stv-progress-fill");
    var bar = $("stv-progress");
    function paint() {
      fill.style.width = pct + "%";
      bar.setAttribute("aria-valuenow", String(pct));
      bar.parentElement.querySelector(".stv-cardtitle").textContent =
        "Your workspace is " + pct + "% ready";
    }
    paint();
    $("stv-advance").addEventListener("click", function () {
      pct = pct >= 100 ? 68 : Math.min(100, pct + 8);
      paint();
    });
    $("stv-subscribe").addEventListener("click", function () {
      var v = $("stv-email").value.trim();
      var msg = $("stv-formmsg");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        msg.textContent = "That email doesn’t look complete — try name@studio.com.";
        msg.dataset.ok = "0";
        $("stv-email").focus();
        return;
      }
      msg.textContent = "✓ You’re on the list. First drop lands Friday.";
      msg.dataset.ok = "1";
    });
  }

  /* ---------- boot ---------- */
  function renderAll() {
    renderSource();
    renderRows();
    applyToPreview();
    renderMine();
    renderLibrary();
  }

  function init() {
    if (!window.MOODBOARD_LIB || !$("studio")) return;
    var sig = LIB.signature("futuristic");
    state.id = sig.id;
    state.direction = sig.direction;
    state.working = LIB.cloneColors(sig);
    renderChips();
    renderAll();
    wireActions();
    wirePreview();
    $("st-search").addEventListener("input", function (e) {
      state.query = e.target.value;
      renderLibrary();
    });
  }

  window.MOODBOARD_STUDIO = {
    openPalette: function (kind, id) { loadPalette(kind, id); },
    openSignature: openSignature,
    // Exposed for automated tests only.
    _state: state,
    _normalizeHex: normalizeHex,
    _contrast: contrast
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();
