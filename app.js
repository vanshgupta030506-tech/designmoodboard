/* ============================================================
   MOODBOARD — frontend application.
   Sections: data access · theme · api client · form handling ·
   result rendering · uncertainty flow · probability display.
   The browser talks ONLY to this app's own /api/decide endpoint.
   ============================================================ */
(function () {
  "use strict";

  var MAX_LEN = 500;
  var THRESHOLD = window.MOODBOARD.CONFIDENCE_THRESHOLD; // 0.70, documented

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
    var t = el("div", "toast", message);
    region.appendChild(t);
    window.setTimeout(function () { t.remove(); }, 2200);
  }

  function pct(value) {
    return (Math.round(value * 1000) / 10).toString().replace(/\.0$/, "") + "%";
  }

  /* ---------- direction data access ---------- */
  var DIRECTIONS = window.MOODBOARD.DIRECTIONS;
  var IDS = window.MOODBOARD.IDS;
  function getDirection(id) { return window.MOODBOARD.getDirection(id); }

  /* ---------- theme application ---------- */
  function applyTheme(id) {
    document.documentElement.setAttribute("data-theme", id || "default");
  }

  /* ---------- API communication (own backend only) ---------- */
  function decide(mood) {
    return fetch("/api/decide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood: mood })
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) {
          var err = new Error((data && data.error) || "Something went wrong. Please try again.");
          err.status = res.status;
          throw err;
        }
        return data;
      });
    }).catch(function (err) {
      if (err && typeof err.status === "number") throw err;
      var net = new Error("Could not reach the studio. Check your connection and try again.");
      net.status = 0;
      throw net;
    });
  }

  function checkGatewayStatus() {
    var pill = $("jev-status");
    var label = $("jev-status-text");
    fetch("/api/decide", { method: "GET" }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (res.ok && data && data.status === "ready") {
          pill.dataset.state = "ready";
          label.textContent = "JEV CLASSIFIER · READY";
        } else if (data && data.configured === false) {
          pill.dataset.state = "setup";
          label.textContent = "JEV CLASSIFIER · SETUP NEEDED";
        } else {
          pill.dataset.state = "error";
          label.textContent = "JEV CLASSIFIER · OFFLINE";
        }
      });
    }).catch(function () {
      pill.dataset.state = "error";
      label.textContent = "JEV CLASSIFIER · OFFLINE";
    });
  }

  /* ---------- validation ---------- */
  function validateInput(raw) {
    if (typeof raw !== "string" || raw.trim().length === 0) {
      return "Describe the mood first — a few words are enough to begin.";
    }
    if (raw.trim().length > MAX_LEN) {
      return "Keep it under " + MAX_LEN + " characters so Jev can read it in one glance.";
    }
    return null;
  }

  /* ---------- form handling ---------- */
  var form = $("mood-form");
  var input = $("mood-input");
  var counter = $("char-count");
  var submitBtn = $("submit-btn");
  var btnLabel = submitBtn.querySelector(".btn-label");
  var formError = $("form-error");
  var loadingBar = $("loading-bar");
  var busy = false;

  function showError(msg) {
    formError.textContent = msg;
    formError.hidden = !msg;
  }

  function setBusy(on) {
    busy = on;
    submitBtn.disabled = on;
    input.setAttribute("aria-busy", on ? "true" : "false");
    loadingBar.hidden = !on;
    if (on) {
      btnLabel.textContent = "Reading…";
      var s = el("span", "spinner");
      s.setAttribute("aria-hidden", "true");
      submitBtn.prepend(s);
    } else {
      btnLabel.textContent = "Find my direction";
      var old = submitBtn.querySelector(".spinner");
      if (old) old.remove();
    }
  }

  function updateCounter() {
    var len = input.value.length;
    counter.textContent = len + " / " + MAX_LEN;
    counter.classList.toggle("near", len > MAX_LEN - 50);
  }

  input.addEventListener("input", function () {
    updateCounter();
    if (!formError.hidden && input.value.trim().length > 0) showError(null);
  });

  // Enter submits; Shift+Enter adds a new line.
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (busy) return;
    var raw = input.value;
    var problem = validateInput(raw);
    if (problem) {
      showError(problem);
      input.focus();
      return;
    }
    showError(null);
    setBusy(true);
    decide(raw.trim()).then(function (data) {
      setBusy(false);
      handleDecision(data, raw.trim());
    }).catch(function (err) {
      setBusy(false);
      showError(err.message);
      input.focus();
    });
  });

  /* ---------- example prompts (populate only, never request) ---------- */
  Array.prototype.forEach.call(document.querySelectorAll(".example-chip"), function (chip) {
    chip.addEventListener("click", function () {
      input.value = chip.getAttribute("data-example") || "";
      updateCounter();
      showError(null);
      input.focus();
    });
  });

  /* ---------- copy HEX ---------- */
  function copyHex(hex, button) {
    function done() {
      if (button) button.setAttribute("data-copied", "true");
      toast("Copied " + hex);
      window.setTimeout(function () {
        if (button) button.setAttribute("data-copied", "false");
      }, 1600);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(hex).then(done, function () { fallback(); });
    } else {
      fallback();
    }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = hex;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); done(); }
      catch (e) { toast(hex); }
      ta.remove();
    }
  }

  function swatchButton(colour) {
    var b = el("button", "swatch");
    b.type = "button";
    b.setAttribute("aria-label", "Copy " + colour.hex + " (" + colour.name + ")");
    b.setAttribute("data-copied", "false");
    var chip = el("span", "swatch-colour");
    chip.style.background = colour.hex;
    var tag = el("span", "swatch-copied", "COPIED");
    chip.appendChild(tag);
    var meta = el("div", "swatch-meta");
    meta.appendChild(el("strong", null, colour.name));
    meta.appendChild(el("code", null, colour.hex));
    b.appendChild(chip);
    b.appendChild(meta);
    b.addEventListener("click", function () { copyHex(colour.hex, b); });
    return b;
  }

  /* ---------- decision handling ---------- */
  function topTwo(probabilities) {
    return IDS.slice().sort(function (a, b) {
      return probabilities[b] - probabilities[a];
    }).slice(0, 2);
  }

  function handleDecision(data, moodText) {
    var problem = validateDecision(data);
    if (problem) {
      showError(problem);
      return;
    }
    var choice = data.choice;
    var probs = data.probabilities;
    var top = probs[choice];

    var section = $("result-section");
    section.hidden = false;

    if (top >= THRESHOLD) {
      renderBoard(choice, probs, {
        origin: "ai",
        label: "Clear match",
        note: "Jev classified this input as <strong>" + escapeHtml(getDirection(choice).name) + "</strong> with " + pct(top) + " probability — a clear match."
      });
    } else {
      var pair = topTwo(probs);
      renderChooser(pair, probs, choice, moodText);
      // Show Jev's own pick dimmed until the user decides? No —
      // never invent: wait for the user's manual choice first.
      section.scrollIntoView({ behavior: smoothScroll(), block: "start" });
    }
  }

  function validateDecision(data) {
    if (!data || typeof data !== "object") return "The classifier returned an unreadable answer. Please try again.";
    if (IDS.indexOf(data.choice) === -1) return "The classifier returned an unknown direction. Please try again.";
    var p = data.probabilities;
    if (!p || typeof p !== "object") return "The classifier returned no probabilities. Please try again.";
    for (var i = 0; i < IDS.length; i++) {
      var v = p[IDS[i]];
      if (typeof v !== "number" || !isFinite(v) || v < 0 || v > 1) {
        return "The classifier returned invalid probabilities. Please try again.";
      }
    }
    return null;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function smoothScroll() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  }

  /* ---------- board rendering ---------- */
  function renderBoard(id, probs, origin) {
    var d = getDirection(id);
    applyTheme(id);

    $("origin-note").innerHTML = origin.note;
    $("chooser").hidden = true;
    $("chooser").innerHTML = "";
    // Reveal every board section (the chooser flow hides them).
    $("direction-head").hidden = false;
    ["swatches", "type-grid", "preview-cards"].forEach(function (sid) {
      $(sid).closest("section").hidden = false;
    });

    // A. Selected direction
    var head = $("direction-head");
    head.innerHTML = "";
    var idx = el("div", "big-index", d.index);
    idx.setAttribute("aria-hidden", "true");
    var main = el("div");
    main.appendChild(el("p", "eyebrow", origin.origin === "ai" ? "Jev's decision" : "Exploring"));
    main.appendChild(el("h3", "dir-name", d.name));
    main.appendChild(el("p", "dir-tag", d.tag));
    main.appendChild(el("p", "dir-desc", d.description));
    var badges = el("div", "badges");
    badges.appendChild(el("span", "badge solid", origin.label));
    if (origin.origin === "manual") {
      badges.appendChild(el("span", "badge ghost", "Your selection — not an AI result"));
    } else {
      badges.appendChild(el("span", "badge ghost", pct(probs[id]) + " probability"));
    }
    main.appendChild(badges);
    head.appendChild(idx);
    head.appendChild(main);

    // B. Palette
    var sw = $("swatches");
    sw.innerHTML = "";
    d.palette.forEach(function (c) {
      var li = document.createElement("li");
      li.appendChild(swatchButton(c));
      sw.appendChild(li);
    });

    // C. Typography
    renderType(d);

    // D. UI cards
    renderPreviewCards(d);

    // E. Probabilities
    renderProbs(probs, id);

    $("result-section").scrollIntoView({ behavior: smoothScroll(), block: "start" });
  }

  function renderType(d) {
    var grid = $("type-grid");
    grid.innerHTML = "";
    var displayStack = "'" + d.fonts.display + "', Georgia, serif";
    var bodyStack = "'" + d.fonts.body + "', -apple-system, sans-serif";

    var p1 = el("div", "type-panel");
    p1.appendChild(el("p", "type-name", "Display — " + d.fonts.display));
    var h = el("p", "type-display", d.specimen.headline);
    h.style.fontFamily = displayStack;
    p1.appendChild(h);
    var lab = el("p", "type-label", d.specimen.label);
    lab.style.fontFamily = bodyStack;
    p1.appendChild(lab);

    var p2 = el("div", "type-panel");
    p2.appendChild(el("p", "type-name", "Body — " + d.fonts.body));
    var para = el("p", "type-body", d.specimen.paragraph);
    para.style.fontFamily = bodyStack;
    p2.appendChild(para);
    p2.appendChild(el("p", "type-label", "Aa · 0123456789"));

    grid.appendChild(p1);
    grid.appendChild(p2);
  }

  function cardVars(d) {
    return {
      "--pv-radius": d.card.radius,
      "--pv-border-w": d.card.border === "none" ? "0px" : (d.id === "vibrant" ? "2px" : "1px"),
      "--pv-border": d.theme.border,
      "--pv-bg": d.theme.surface,
      "--pv-ink": d.theme.ink,
      "--pv-muted": d.theme.muted,
      "--pv-accent": d.theme.accent === d.theme.ink && d.id === "vibrant" ? "#FF5A4E" : d.theme.accent,
      "--pv-accent-ink": d.theme.accentInk,
      "--pv-display": "'" + d.fonts.display + "', sans-serif",
      "--pv-display-w": d.id === "minimal" || d.id === "organic" ? "400" : "700",
      "--pv-body": "'" + d.fonts.body + "', sans-serif",
      "--pv-shadow": d.card.shadow === "none" ? "none" : d.card.shadow + " " + d.theme.ink
    };
  }

  function renderPreviewCards(d) {
    var wrap = $("preview-cards");
    wrap.innerHTML = "";
    var vars = cardVars(d);
    function styleCard(n) {
      for (var k in vars) n.style.setProperty(k, vars[k]);
    }

    // 1. Feature card — large editorial
    var f = el("article", "pv-card");
    styleCard(f);
    f.appendChild(el("p", "pv-kicker", d.cards.feature.kicker));
    f.appendChild(el("h4", null, d.cards.feature.title));
    f.appendChild(el("p", null, d.cards.feature.body));
    var cta = el("button", "pv-cta", d.cards.feature.cta);
    cta.type = "button";
    cta.addEventListener("click", function () { toast(d.name + " feature saved to your board"); });
    f.appendChild(cta);

    // 2. Content card — compact
    var c = el("article", "pv-card");
    styleCard(c);
    c.appendChild(el("p", "pv-kicker", d.cards.content.category));
    c.appendChild(el("h4", null, d.cards.content.title));
    c.appendChild(el("p", null, d.cards.content.body));
    c.appendChild(el("p", "pv-meta", d.cards.content.meta));

    // 3. Action card — interactive
    var a = el("article", "pv-card");
    styleCard(a);
    a.appendChild(el("p", "pv-note", d.cards.action.note));
    a.appendChild(el("h4", null, d.cards.action.title));
    a.appendChild(el("p", null, d.cards.action.body));
    var btn = el("button", "pv-cta", d.cards.action.actionLabel);
    btn.type = "button";
    var done = el("p", "pv-action-done", "");
    btn.addEventListener("click", function () {
      btn.remove();
      done.textContent = "✓ " + d.cards.action.doneLabel;
      a.appendChild(done);
    });
    a.appendChild(btn);

    wrap.appendChild(f);
    wrap.appendChild(c);
    wrap.appendChild(a);
  }

  function renderProbs(probs, winnerId) {
    var list = $("prob-list");
    list.innerHTML = "";
    var order = IDS.slice().sort(function (a, b) { return probs[b] - probs[a]; });
    order.forEach(function (id) {
      var d = getDirection(id);
      var li = el("li", "prob-row" + (id === winnerId ? " is-winner" : ""));
      li.appendChild(el("span", "prob-name", d.name));
      var track = el("div", "prob-track");
      var fill = el("div", "prob-fill");
      track.appendChild(fill);
      li.appendChild(track);
      li.appendChild(el("span", "prob-pct", pct(probs[id])));
      list.appendChild(li);
      // Animate after paint so the transition runs.
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          fill.style.width = (probs[id] * 100).toFixed(1) + "%";
        });
      });
    });
  }

  /* ---------- uncertainty flow ---------- */
  function renderChooser(pair, probs, jevChoice, moodText) {
    applyTheme("default");
    $("origin-note").innerHTML =
      "Jev read this input as <strong>" + escapeHtml(getDirection(jevChoice).name) +
      "</strong> (" + pct(probs[jevChoice]) + ") — below the 70% threshold, so the choice is yours.";
    $("direction-head").innerHTML = "";
    $("direction-head").hidden = true;
    $("swatches").innerHTML = "";
    $("swatches").closest("section").hidden = true;
    $("type-grid").innerHTML = "";
    $("type-grid").closest("section").hidden = true;
    $("preview-cards").innerHTML = "";
    $("preview-cards").closest("section").hidden = true;
    $("prob-list").innerHTML = "";

    var box = $("chooser");
    box.hidden = false;
    box.innerHTML = "";
    box.appendChild(el("p", "eyebrow", "Too close to call"));
    box.appendChild(el("h3", null, "Your description sits between two creative directions."));
    var sub = el("p", null,
      "Jev's classification was " + getDirection(jevChoice).name + " at " + pct(probs[jevChoice]) +
      " — under the 70% threshold for a clear match. Explore either preview, then pick the one you want. " +
      "Your pick will be labelled as yours, not as the model's.");
    box.appendChild(sub);

    var grid = el("div", "chooser-grid");
    pair.forEach(function (id) {
      var d = getDirection(id);
      var card = el("button", "chooser-card");
      card.type = "button";
      card.setAttribute("aria-label", "Explore the " + d.name + " direction");
      var strip = el("span", "mini-strip");
      strip.setAttribute("aria-hidden", "true");
      d.palette.forEach(function (c) {
        var i = document.createElement("i");
        i.style.background = c.hex;
        strip.appendChild(i);
      });
      card.appendChild(strip);
      card.appendChild(el("strong", null, d.index + " — " + d.name));
      var small = el("small", null, d.description);
      card.appendChild(small);
      var tag = el("span", "jev-tag", id === jevChoice
        ? "Jev's classification · " + pct(probs[id])
        : pct(probs[id]) + " · runner-up");
      card.appendChild(tag);
      card.addEventListener("click", function () {
        renderBoard(id, probs, {
          origin: "manual",
          label: "Your selection",
          note: "You chose <strong>" + escapeHtml(d.name) + "</strong>. Jev's own classification was " +
            "<strong>" + escapeHtml(getDirection(jevChoice).name) + "</strong> at " + pct(probs[jevChoice]) +
            " — this board reflects your manual selection, not a new AI result."
        });
      });
      grid.appendChild(card);
    });
    box.appendChild(grid);

    // Still show the honest probabilities, winner highlighted as Jev's pick.
    renderProbs(probs, jevChoice);
  }

  /* ---------- library + colour system sections ---------- */
  function miniStrip(d) {
    var strip = el("span", "mini-strip");
    strip.setAttribute("aria-hidden", "true");
    d.palette.forEach(function (c) {
      var i = document.createElement("i");
      i.style.background = c.hex;
      strip.appendChild(i);
    });
    return strip;
  }

  function renderLibrary() {
    var grid = $("library-grid");
    DIRECTIONS.forEach(function (d) {
      var card = el("article", "lib-card");
      card.appendChild(el("span", "lib-index", d.index));
      card.appendChild(miniStrip(d));
      card.appendChild(el("strong", null, d.name));
      card.appendChild(el("p", null, d.description));
      var btn = el("button", "lib-preview", "Preview this board");
      btn.type = "button";
      btn.addEventListener("click", function () {
        var probs = {};
        IDS.forEach(function (id) { probs[id] = id === d.id ? 1 : 0; });
        $("result-section").hidden = false;
        renderBoard(d.id, probs, {
          origin: "manual",
          label: "Library preview",
          note: "Previewing the predefined <strong>" + escapeHtml(d.name) + "</strong> system. This board was designed in advance — it is not a Jev result."
        });
      });
      card.appendChild(btn);
      grid.appendChild(card);
    });
  }

  function renderColourSystem() {
    var grid = $("colours-grid");
    DIRECTIONS.forEach(function (d) {
      var fam = el("article", "colour-family");
      fam.appendChild(el("h3", null, d.index + " — " + d.name));
      var fonts = el("p", "fam-font", d.fonts.display + " · " + d.fonts.body);
      fam.appendChild(fonts);
      var strip = el("div", "fam-strip");
      d.palette.forEach(function (c) {
        var b = el("button", "fam-swatch");
        b.type = "button";
        b.setAttribute("aria-label", "Copy " + c.hex + " (" + c.name + ", " + d.name + ")");
        var i = document.createElement("i");
        i.style.background = c.hex;
        b.appendChild(i);
        b.appendChild(el("span", null, c.hex));
        b.title = c.name + " · " + c.hex;
        b.addEventListener("click", function () { copyHex(c.hex, null); });
        strip.appendChild(b);
      });
      fam.appendChild(strip);
      grid.appendChild(fam);
    });
  }

  /* ---------- reveal on scroll ---------- */
  function initReveal() {
    var targets = document.querySelectorAll(".board-block, .lib-card, .colour-family");
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.08 });
    targets.forEach(function (t) {
      t.classList.add("reveal");
      io.observe(t);
    });
  }

  /* ---------- init ---------- */
  updateCounter();
  renderLibrary();
  renderColourSystem();
  initReveal();
  checkGatewayStatus();
})();
