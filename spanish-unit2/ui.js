/* Spanish Quest: ¿Cómo vivimos? — UI components (docs/spanish-unit2-contract.md section 5).
   Every function returns real DOM built with QuestKit.h. Text is escaped by default; `html` strings are trusted author
   content only (data.js / art.js), never user input. Class prefix su-. */
(function (root) {
  "use strict";
  var QK = root.QuestKit, h = QK.h;
  var ART = function () { return root.SU_ART; };
  var ICONS = { right: "✓", wrong: "✗", answer: "✓", selected: "●" };
  var MARK_TEXT = { right: "✓ Correct", wrong: "✗ Your pick", answer: "✓ Answer", selected: "● Selected" };
  var LEVELS = { "new": "○ Not started", learning: "◐ Learning", almost: "◕ Almost", mastered: "★ Mastered" };

  function frag(html) { var t = document.createElement("template"); t.innerHTML = html; return t.content; }
  function art(svg, cls) { return svg ? h("span", { class: cls || "su-art-wrap", html: svg }) : null; }
  /* "___" becomes a visible blank for sighted users and the word "blank" for screen readers. */
  function blankify(html) {
    return String(html == null ? "" : html).replace(/_{3,}/g, '<span class="su-blank"><span class="qk-sr">blank</span></span>');
  }
  function esc(s) { return QK.escapeHtml ? QK.escapeHtml(String(s == null ? "" : s)) : String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function btn(cls, label, onclick, attrs) {
    var a = { type: "button", class: cls, onclick: onclick }; if (attrs) Object.keys(attrs).forEach(function (k) { a[k] = attrs[k]; });
    return h("button", a, label);
  }

  /* 1 */
  function screenHead(o) {
    o = o || {};
    var back = o.onBack ? btn("qk-back su-back", o.backLabel || "← Spanish Quest home", o.onBack) : null;
    var title = h("h2", { class: "su-head-title", tabindex: "-1" }, o.title || "");
    return h("header", { class: "su-head" }, back, o.eyebrow ? h("span", { class: "qk-eyebrow su-eyebrow" }, o.eyebrow) : null, title, o.text ? h("p", { class: "su-head-text" }, o.text) : null);
  }

  /* 2 */
  function actionCard(o) {
    o = o || {};
    var meta = (o.meta || []).length ? h("span", { class: "su-action-meta" }, o.meta.map(function (m) { return h("span", { class: "qk-pill" }, m); })) : null;
    return h("button", { type: "button", class: "su-action su-tone-" + (o.tone || "mission"), onclick: o.onClick },
      h("span", { class: "su-action-icon", "aria-hidden": "true", html: o.icon || "" }),
      h("span", { class: "su-action-body" },
        h("span", { class: "su-action-title" }, o.title || ""),
        o.text ? h("span", { class: "su-action-text" }, o.text) : null,
        meta,
        o.cta ? h("span", { class: "su-action-cta" }, o.cta + " →") : null),
      o.badge ? h("span", { class: "su-badge" }, o.badge) : null);
  }

  /* 3 */
  function masteryChip(level) {
    var l = LEVELS[level] ? level : "new";
    return h("span", { class: "su-chip su-chip-" + l }, LEVELS[l]);
  }

  /* 4 */
  function tile(o) {
    o = o || {};
    return h("button", { type: "button", class: "su-tile", onclick: o.onClick },
      o.artSvg ? h("span", { class: "su-tile-art", "aria-hidden": "true", html: o.artSvg }) : null,
      h("span", { class: "su-tile-body" }, h("span", { class: "su-tile-title" }, o.title || ""), o.text ? h("span", { class: "su-tile-text" }, o.text) : null, o.level ? masteryChip(o.level) : null));
  }

  /* 5 */
  function questionCard(o) {
    o = o || {};
    var locked = false, disabled = {}, marks = {}, hintShown = false, enOpen = o.enMode === "show", nextBtn = null;
    var choiceEls = [], layout = o.layout === "picture" ? "picture" : "text";
    var pct = Math.max(0, Math.min(1, Number(o.progress) || 0));

    var top = h("div", { class: "su-q-top" },
      h("span", { class: "su-q-label" }, o.label || ""),
      o.progress != null ? h("span", { class: "su-q-bar qk-bar", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(Math.round(pct * 100)), "aria-label": "Progress" }, h("span", { style: "width:" + Math.round(pct * 100) + "%" })) : null);

    var visual = (o.visualSvg || o.visualEl) ? h("div", { class: "su-q-visual" }) : null;
    if (visual) { if (o.visualEl) visual.appendChild(o.visualEl); else visual.innerHTML = o.visualSvg; }

    var prompt = h("p", { class: "su-q-prompt", tabindex: "-1", html: blankify(o.promptHtml) });
    var en = o.promptEn && o.enMode !== "hide" ? h("p", { class: "su-q-en", html: blankify(esc(o.promptEn)) }) : null;
    if (en && !enOpen) en.hidden = true;

    var tools = h("div", { class: "su-q-tools" });
    if (o.onSpeak) tools.appendChild(btn("qk-btn qk-btn-ghost su-tool su-speak", "🔊 Listen", function () { o.onSpeak(); }, { "aria-label": "Listen to the question in Spanish" }));
    var enBtn = null;
    if (en && o.enMode === "toggle") {
      enBtn = btn("qk-btn qk-btn-ghost su-tool su-en-toggle", "EN  Show English", function () {
        enOpen = !enOpen; en.hidden = !enOpen; paintEn(); if (o.onEnToggle) o.onEnToggle(enOpen);
      }, { "aria-expanded": "false" });
      tools.appendChild(enBtn);
    }
    function paintEn() { if (!enBtn) return; enBtn.textContent = enOpen ? "EN  Hide English" : "EN  Show English"; enBtn.setAttribute("aria-expanded", String(enOpen)); }
    var hintEl = h("p", { class: "su-q-hint", role: "note" }); hintEl.hidden = true;
    var hintBtn = null;
    if (o.hint || o.onHintRequest) {
      hintBtn = btn("qk-btn qk-btn-ghost su-tool su-hint-btn", "💡 Hint", function () { if (o.onHintRequest) o.onHintRequest(); api.showHint(); });
      tools.appendChild(hintBtn);
    }

    var group = h("div", { class: "su-choices su-layout-" + layout, role: "group", "aria-label": "Answer choices" });
    (o.choices || []).forEach(function (c, i) {
      var b = h("button", { type: "button", class: "su-choice", "data-i": String(i) },
        h("span", { class: "su-choice-letter", "aria-hidden": "true" }, String.fromCharCode(65 + i)),
        h("span", { class: "su-choice-body" },
          c.artSvg ? h("span", { class: "su-choice-art", html: c.artSvg }) : null,
          c.html != null ? h("span", { class: "su-choice-text", html: c.html }) : (c.text != null ? h("span", { class: "su-choice-text" }, c.text) : null),
          c.caption ? h("span", { class: "su-choice-caption" }, c.caption) : null),
        h("span", { class: "su-choice-mark" }));
      b.addEventListener("click", function () {
        if (locked || disabled[i]) return;
        if (o.onChoose) o.onChoose(i);
      });
      choiceEls.push(b); group.appendChild(b);
    });

    var fb = h("div", { class: "su-feedback", role: "status", "aria-live": "polite" });
    var nextSlot = h("div", { class: "su-next-slot" });
    var el = h("section", { class: "su-q qk-q" }, top, visual, prompt, en, tools, hintEl, group, fb, nextSlot);

    function paintChoice(i) {
      var b = choiceEls[i]; if (!b) return;
      var m = marks[i] || null, mk = b.querySelector(".su-choice-mark");
      b.classList.remove("is-right", "is-wrong", "is-answer", "is-selected");
      if (m) b.classList.add("is-" + m);
      mk.textContent = m ? MARK_TEXT[m] : "";
      var off = locked || disabled[i];
      b.setAttribute("aria-disabled", off ? "true" : "false");
      b.classList.toggle("is-off", !!off);
      if (m === "selected") b.setAttribute("aria-pressed", "true"); else b.removeAttribute("aria-pressed");
    }
    function paintAll() { choiceEls.forEach(function (_, i) { paintChoice(i); }); }
    var api = {
      el: el,
      lock: function () { locked = true; paintAll(); },
      unlock: function () { locked = false; paintAll(); },
      disable: function (i) { disabled[i] = true; paintChoice(i); },
      mark: function (i, state) { marks[i] = state || null; paintChoice(i); },
      feedback: function (f) {
        f = f || {};
        var tone = ["right", "retry", "wrong", "info"].indexOf(f.tone) >= 0 ? f.tone : "info";
        var icon = { right: "✓", retry: "↻", wrong: "✗", info: "i" }[tone];
        var dflt = { right: "Correct!", retry: "Try once more", wrong: "Not quite", info: "Good to know" }[tone];
        fb.className = "su-feedback is-" + tone;
        fb.innerHTML = "";
        fb.appendChild(h("span", { class: "su-fb-icon", "aria-hidden": "true" }, icon));
        fb.appendChild(h("div", { class: "su-fb-body" }, h("strong", { class: "su-fb-title" }, f.title || dflt), f.html ? h("div", { class: "su-fb-text", html: f.html }) : null));
      },
      clearFeedback: function () { fb.className = "su-feedback"; fb.innerHTML = ""; },
      next: function (label, onClick) {
        if (nextBtn) nextBtn.remove();
        nextBtn = btn("qk-btn qk-btn-primary su-next", label || "Next →", function () { if (nextBtn.getAttribute("aria-disabled") === "true") return; nextBtn.setAttribute("aria-disabled", "true"); if (onClick) onClick(); });
        nextSlot.appendChild(nextBtn);
        nextBtn.focus();
        return nextBtn;
      },
      showHint: function () {
        if (!o.hint) return;
        hintShown = true; hintEl.innerHTML = "<strong>Hint:</strong> " + esc(o.hint); hintEl.hidden = false;
        if (hintBtn) hintBtn.setAttribute("aria-expanded", "true");
      },
      focusPrompt: function () { try { prompt.focus({ preventScroll: true }); } catch (e) { prompt.focus(); } }
    };
    paintAll(); paintEn();
    setTimeout(function () { if (el.isConnected && !el.contains(document.activeElement)) api.focusPrompt(); }, 30);
    return api;
  }

  /* 6 */
  function mapBoard(o) {
    o = o || {};
    var A = ART(), state = { interactive: !!o.interactive, marks: {} }, names = {};
    var wrap = h("div", { class: "su-map" });
    var holder = h("div", { class: "su-map-svg" });
    wrap.appendChild(holder);
    if (o.map && o.map.note) wrap.appendChild(h("p", { class: "su-map-note" }, "ⓘ " + o.map.note));
    function svgOf() { return holder.querySelector("svg"); }
    function bldgs() { return holder.querySelectorAll(".su-bldg"); }
    function render() {
      holder.innerHTML = A.map(o.map, o.places, { labels: o.labels !== false, highlight: o.highlight || [], markers: o.markers || [], interactive: state.interactive });
      Array.prototype.forEach.call(bldgs(), function (g) { names[g.getAttribute("data-place")] = g.getAttribute("aria-label") || ""; });
      Object.keys(state.marks).forEach(function (id) { apply(id, state.marks[id]); });
    }
    function placeOf(target) { var g = target.closest && target.closest(".su-bldg"); return g && holder.contains(g) ? g : null; }
    function pick(g) { if (state.interactive && o.onPick) o.onPick(g.getAttribute("data-place")); }
    holder.addEventListener("click", function (e) { var g = placeOf(e.target); if (g) pick(g); });
    holder.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " " && e.key !== "Spacebar") return;
      var g = placeOf(e.target); if (!g || e.target !== g) return;
      e.preventDefault(); pick(g);
    });
    function apply(id, m) {
      var g = holder.querySelector('.su-bldg[data-place="' + id + '"]'); if (!g) return;
      ["right", "wrong", "answer", "selected"].forEach(function (c) { g.classList.remove("is-" + c); });
      var old = g.querySelector(".su-mbadge"); if (old) old.remove();
      var base = g.getAttribute("data-base-label");
      if (base == null) { base = g.getAttribute("aria-label") || ""; g.setAttribute("data-base-label", base); }
      if (!m) { if (state.interactive) g.setAttribute("aria-label", base); return; }
      g.classList.add("is-" + m);
      var ns = "http://www.w3.org/2000/svg", tx = { right: "✓", wrong: "✗", answer: "✓", selected: "●" }[m], col = { right: "#12805a", wrong: "#b3412b", answer: "#12805a", selected: "#c2410c" }[m];
      var b = document.createElementNS(ns, "g"); b.setAttribute("class", "su-mbadge");
      var c = document.createElementNS(ns, "circle"); c.setAttribute("cx", "160"); c.setAttribute("cy", "30"); c.setAttribute("r", "24"); c.setAttribute("fill", col);
      c.setAttribute("stroke", "#fff"); c.setAttribute("stroke-width", "4");
      var t = document.createElementNS(ns, "text"); t.setAttribute("x", "160"); t.setAttribute("y", "40"); t.setAttribute("text-anchor", "middle"); t.setAttribute("font-size", "28"); t.setAttribute("font-weight", "900"); t.setAttribute("fill", "#fff"); t.textContent = tx;
      b.appendChild(c); b.appendChild(t);
      // position relative to the building's cell: use the hit rect as anchor
      var hit = g.querySelector(".su-hit"); if (hit) { b.setAttribute("transform", "translate(" + (parseFloat(hit.getAttribute("x")) - 2) + " " + (parseFloat(hit.getAttribute("y")) + 4) + ")"); }
      g.appendChild(b);
      var suffix = { right: " — correct", wrong: " — your pick, not correct", answer: " — the answer", selected: " — selected" }[m];
      if (state.interactive) g.setAttribute("aria-label", base + suffix);
    }
    var api = {
      el: wrap,
      mark: function (id, m) { if (m) state.marks[id] = m; else delete state.marks[id]; apply(id, m || null); },
      clear: function () { var ids = Object.keys(state.marks); state.marks = {}; ids.forEach(function (id) { apply(id, null); }); },
      setInteractive: function (b) { state.interactive = !!b; render(); }
    };
    render();
    return api;
  }

  /* 7 */
  function learnCard(o) {
    o = o || {};
    var arts = (o.artSvgs || []).filter(Boolean);
    return h("article", { class: "su-learn qk-panel" },
      h("div", { class: "su-learn-top" }, o.step != null ? h("span", { class: "su-step" }, typeof o.step === "number" ? "Step " + o.step : String(o.step)) : null,
        o.onSay ? btn("qk-btn qk-btn-ghost su-tool su-say", "🔊 Hear it", function () { o.onSay(o.say); }, { "aria-label": "Hear the Spanish" + (o.say ? ": " + o.say : "") }) : null),
      h("h3", { class: "su-learn-title" }, o.title || ""),
      arts.length ? h("div", { class: "su-learn-art su-count-" + Math.min(arts.length, 4) }, arts.map(function (s) { return h("span", { class: "su-learn-art-item", html: s }); })) : null,
      h("div", { class: "su-learn-body", html: o.html || "" }));
  }

  /* 8 */
  function estarChart(o) {
    o = o || {};
    var rows = o.rows || [];
    var tbl = h("table", { class: "su-estar" },
      h("caption", null, "ESTAR (to be) — who it is for"),
      h("thead", null, h("tr", null, h("th", { scope: "col" }, "Who"), h("th", { scope: "col" }, "Form"), h("th", { scope: "col" }, "Means"))),
      h("tbody", null, rows.map(function (r) {
        var hl = r.key === o.highlight;
        var tr = h("tr", { class: hl ? "is-hl" : "", "aria-current": hl ? "true" : null },
          h("th", { scope: "row" }, hl ? h("span", { class: "su-star", "aria-hidden": "true" }, "★ ") : null, r.pronouns, hl ? h("span", { class: "qk-sr" }, " (this one)") : null),
          h("td", null, h("div", { class: "su-estar-form" }, h("b", null, r.form), o.onSay ? btn("su-say-mini", "🔊", function () { o.onSay(r.pronouns.split(" / ")[0] + " " + r.form); }, { "aria-label": "Hear " + r.form }) : null)),
          h("td", null, r.en));
        return tr;
      })));
    return h("div", { class: "su-estar-wrap" }, tbl);
  }

  /* 9 */
  function vocabGrid(o) {
    o = o || {};
    return h("section", { class: "su-vocab" },
      o.title ? h("h3", { class: "su-vocab-title" }, o.title) : null,
      h("ul", { class: "su-vocab-grid" }, (o.items || []).map(function (it) {
        return h("li", { class: "su-vocab-item" },
          it.artSvg ? h("span", { class: "su-vocab-art", html: it.artSvg }) : null,
          h("span", { class: "su-vocab-es" }, it.es), h("span", { class: "su-vocab-en" }, it.en),
          it.onSay ? btn("su-say-mini", "🔊", function () { it.onSay(); }, { "aria-label": "Hear " + it.es }) : null);
      })));
  }

  /* 10 */
  function results(o) {
    o = o || {};
    var pct = Math.round(Number(o.pct) || 0);
    var ring = h("div", { class: "su-ring-score", style: "--p:" + Math.max(0, Math.min(100, pct)), role: "img", "aria-label": pct + " percent right on the first try" }, h("span", null, pct + "%"));
    var stats = h("div", { class: "su-res-stats" },
      h("p", { class: "su-res-main" }, h("b", null, (o.firstTry != null ? o.firstTry : 0) + " of " + (o.total != null ? o.total : 0)), " right on the first try"),
      o.corrected ? h("p", { class: "su-res-sub" }, "✓ " + o.corrected + " more fixed after feedback") : null);
    var areas = (o.areas || []).length ? h("ul", { class: "su-res-areas" }, o.areas.map(function (a) {
      var r = a.total ? a.right / a.total : 0, tag = r >= 0.8 ? "★ Strong" : r >= 0.5 ? "◐ Getting there" : "○ Practice more";
      return h("li", { class: "su-res-area" }, h("span", { class: "su-res-area-name" }, a.label), h("span", { class: "su-res-area-bar qk-bar", "aria-hidden": "true" }, h("span", { style: "width:" + Math.round(r * 100) + "%" })), h("span", { class: "su-res-area-num" }, a.right + "/" + a.total + " · " + tag));
    })) : null;
    var acts = (o.actions || []).length ? h("div", { class: "qk-row su-res-actions" }, o.actions.map(function (a) { return btn("qk-btn " + (a.primary ? "qk-btn-primary" : "qk-btn-ghost"), a.label, a.onClick); })) : null;
    var missed = (o.missed || []).length ? h("details", { class: "qk-review su-missed", open: "" }, h("summary", null, "Review your misses (" + o.missed.length + ")"),
      h("ol", { class: "su-missed-list" }, o.missed.map(function (m) {
        return h("li", null, h("div", { class: "su-missed-q", html: blankify(m.promptHtml) }), h("div", { class: "su-missed-a" }, h("span", { class: "su-missed-tag" }, "✓ Answer"), h("span", { html: m.answerHtml || "" })), m.explainHtml ? h("div", { class: "su-missed-e", html: m.explainHtml }) : null);
      }))) : null;
    return h("section", { class: "su-results qk-panel" },
      h("h2", { class: "su-res-title", tabindex: "-1" }, o.title || "Results"),
      h("div", { class: "su-res-top" }, ring, stats),
      o.note ? h("p", { class: "qk-callout su-res-note" }, o.note) : null, areas, acts, missed);
  }

  /* 11 */
  function masteryPanel(o) {
    o = o || {};
    return h("ul", { class: "su-mastery" }, (o.rows || []).map(function (r) {
      var sc = Math.max(0, Math.min(1, Number(r.score) || 0));
      return h("li", { class: "su-mrow" },
        h("div", { class: "su-mrow-main" }, h("span", { class: "su-mrow-label" }, r.label), r.week != null ? h("span", { class: "su-mrow-week" }, "Week " + r.week) : null),
        h("div", { class: "su-mrow-meter" }, masteryChip(r.level), h("span", { class: "su-mrow-bar qk-bar", role: "img", "aria-label": Math.round(sc * 100) + " percent" }, h("span", { style: "width:" + Math.round(sc * 100) + "%" }))),
        r.onPractice ? btn("qk-btn qk-btn-ghost su-mrow-btn", "Practice", r.onPractice, { "aria-label": "Practice " + r.label }) : null);
    }));
  }

  /* 12 */
  function notice(o) {
    o = o || {};
    var tone = ["info", "good", "warn"].indexOf(o.tone) >= 0 ? o.tone : "info";
    return h("div", { class: "su-notice su-notice-" + tone, role: tone === "warn" ? "alert" : "note" },
      h("span", { class: "su-notice-icon", "aria-hidden": "true" }, { info: "ⓘ", good: "✓", warn: "⚠" }[tone]), h("div", { class: "su-notice-body", html: o.html || "" }));
  }

  /* 13 */
  function celebrateSmall(text) {
    return h("span", { class: "su-celebrate", role: "status" }, h("span", { class: "su-celebrate-star", "aria-hidden": "true" }, "★"), " " + (text || "Nice work!"));
  }

  root.SU_UI = { screenHead: screenHead, actionCard: actionCard, masteryChip: masteryChip, tile: tile, questionCard: questionCard, mapBoard: mapBoard, learnCard: learnCard,
    estarChart: estarChart, vocabGrid: vocabGrid, results: results, masteryPanel: masteryPanel, notice: notice, celebrateSmall: celebrateSmall, blankify: blankify };
})(window);
