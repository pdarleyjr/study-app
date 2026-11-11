/* Today's Plan: rendering + behavior. Used by the 5th-grade dashboard (compact) and todays-plan/index.html (full).
   Mounts into #todays-plan. Ticks live in their own storage key and never touch quiz progress. */
(function () {
  "use strict";
  var P = window.TodaysPlan, QK = window.QuestKit;
  var mount = document.getElementById("todays-plan");
  if (!P || !QK || !mount) return;
  var h = QK.h, PLAN = P.PLAN, items = PLAN.items;
  var full = mount.getAttribute("data-mode") === "page";
  var base = "../";
  var st = QK.store(PLAN.storageKey);

  /* Clock: ?now=<ISO> is a test hook; time still moves forward from that instant. */
  var offset = 0;
  var m = /[?&]now=([^&]+)/.exec(location.search);
  if (m) { var f = Date.parse(decodeURIComponent(m[1])); if (!isNaN(f)) offset = f - Date.now(); }
  function now() { return Date.now() + offset; }

  var EMOJI = { Reading: "📖", Religion: "🕊️", Math: "➗", Science: "🔬" };
  var expired = false, timers = [];

  function doneMap() { var d = st.get().done; return d && typeof d === "object" ? d : {}; }
  function setDone(id, on) {
    st.update(function (s) {
      var d = Object.assign({}, s.done && typeof s.done === "object" ? s.done : {});
      if (on) d[id] = Date.now(); else delete d[id];
      s.done = d; return s;
    });
  }
  function range(it) { return P.formatTime(it.start) + " – " + P.formatTime(it.end); }

  var LABEL = {
    done: ["✓", "Done ✓"], now: ["▶", "Now"], next: ["➜", "Next"],
    upcoming: ["•", "Coming up"], later: ["↺", "Still to do"]
  };
  function badge(status) { return h("span", { class: "pl-status pl-" + status }, h("span", { "aria-hidden": "true" }, LABEL[status][0] + " "), LABEL[status][1]); }
  function chip(it) { return h("span", { class: "pl-chip pl-subj-" + it.subject.toLowerCase() }, h("span", { "aria-hidden": "true" }, EMOJI[it.subject] + " "), it.subject); }
  function bestOf(it) {
    var id = P.guideId(it), g = id && window.StudyQuest && window.StudyQuest.get(id);
    return g && g.plays ? h("span", { class: "pl-best" }, "🏆 Best quiz: " + g.best + "%") : null;
  }
  function minsLeft(it, t) {
    var left = Math.ceil((Date.parse(it.end) - t) / 60000);
    return left > 0 ? "about " + left + " min left in this session" : "";
  }

  function render() {
    var t = now(), done = doneMap(), focusId = document.activeElement && document.activeElement.id;
    var doneCount = items.filter(function (i) { return done[i.id]; }).length;
    var pagesRead = items.reduce(function (n, i) { return n + (done[i.id] ? P.pageCount(i) : 0); }, 0);
    var total = items.length, nxt = P.nextItem(t, done);
    var kids = [];

    kids.push(h("div", { class: "pl-head" },
      h("h2", { id: "pl-title" }, "Today’s Plan — Wednesday, Nov 11"),
      h("p", { class: "pl-sub" }, "Finish by " + PLAN.targetFinish + " (all done by " + PLAN.deadline + " at the latest)"),
      h("div", { class: "pl-prog" },
        h("div", { class: "qk-bar", role: "progressbar", "aria-label": "Plan progress", "aria-valuemin": "0", "aria-valuemax": String(total), "aria-valuenow": String(doneCount), "aria-valuetext": doneCount + " of " + total + " done" },
          h("span", { style: "width:" + Math.round(doneCount / total * 100) + "%" })),
        h("p", { class: "pl-count" }, h("strong", null, doneCount + " of " + total + " done"), " · 📖 ", pagesRead + " of " + P.totalPages() + " Misfits pages"))));

    if (nxt) kids.push(upNext(nxt, t, done));
    else kids.push(h("div", { class: "pl-finish", role: "status" },
      h("h3", null, "🎉 You finished today’s plan!"),
      h("p", null, "Every part is checked off. Great focus today. Time to rest!")));

    var list = h("ol", { class: "pl-list", "aria-label": "Today’s schedule" });
    items.forEach(function (it) { list.appendChild(row(it, t, done)); });
    kids.push(list);
    kids.push(h("p", { class: "pl-note" }, "Times are a guide. Nothing is locked: do things in any order and tick them off when you finish."));
    if (full) kids.push(h("p", { class: "pl-linkrow" }, h("a", { class: "qk-btn qk-btn-ghost", href: base + "fifth-grade/" }, "← Back to the 5th-grade page")));
    else kids.push(h("p", { class: "pl-linkrow" }, h("a", { class: "qk-btn qk-btn-ghost", href: base + "todays-plan/" }, "Open full-screen plan")));

    mount.textContent = "";
    kids.forEach(function (k) { mount.appendChild(k); });
    if (focusId) { var f = document.getElementById(focusId); if (f && f !== document.activeElement) f.focus(); }
  }

  function upNext(it, t, done) {
    var st2 = P.statusOf(it, t, done), left = st2 === "now" ? minsLeft(it, t) : "";
    var action = it.kind === "guide"
      ? h("a", { class: "qk-btn qk-btn-primary pl-launch", href: base + it.href }, "Start " + guideName(it) + " →")
      : h("button", { type: "button", class: "qk-btn qk-btn-primary pl-launch", onclick: function () { toggle(it.id, true); } }, "I finished reading ✓");
    return h("div", { class: "pl-up", "aria-labelledby": "pl-up-h" },
      h("p", { class: "pl-up-eyebrow", id: "pl-up-h" }, "Up next"),
      h("div", { class: "pl-up-meta" }, chip(it), badge(st2), h("span", { class: "pl-time" }, "🕒 " + range(it) + " · " + P.minutesOf(it) + " min")),
      h("h3", null, it.title),
      h("p", { class: "pl-task" }, it.task),
      left ? h("p", { class: "pl-left" }, "⏳ " + left) : null,
      h("div", { class: "qk-row" }, action, bestOf(it)));
  }
  function guideName(it) {
    return { religion: "Religion Quest", math: "Fractions Review", "wild-robot": "Wild Robot Quest", "science-lab": "the Matter Lab", "science-challenge": "the Science Challenge" }[it.id] || it.title;
  }

  function row(it, t, done) {
    var s = P.statusOf(it, t, done), id = "pl-cb-" + it.id, isDone = s === "done";
    var cb = h("input", { type: "checkbox", id: id, class: "pl-cb", checked: isDone ? "" : null, onchange: function (e) { toggle(it.id, e.target.checked); } });
    if (isDone) cb.checked = true;
    var label = h("label", { class: "pl-check", for: id },
      cb, h("span", { class: "pl-box", "aria-hidden": "true" }, "✓"),
      h("span", { class: "pl-check-text" }, isDone ? "Done ✓" : "Mark done"),
      h("span", { class: "qk-sr" }, " " + it.title + ", " + it.task));
    var link = it.href ? h("a", { class: "pl-open", href: base + it.href }, (isDone ? "Open again" : "Open") + " " + guideName(it) + " →") : null;
    var left = s === "now" ? minsLeft(it, t) : "";
    return h("li", { class: "pl-row pl-row-" + s + (it.kind === "guide" ? " is-guide" : "") + (s === "now" ? " is-now" : ""), "aria-current": s === "now" ? "step" : null },
      label,
      h("div", { class: "pl-body" },
        h("div", { class: "pl-meta" }, h("span", { class: "pl-time" }, range(it)), chip(it), badge(s)),
        h("p", { class: "pl-title" }, it.title),
        h("p", { class: "pl-req" }, it.task + " · " + P.minutesOf(it) + " min"),
        left ? h("p", { class: "pl-left" }, "⏳ " + left) : null,
        h("div", { class: "pl-actions" }, link, bestOf(it))));
  }

  function toggle(id, on) {
    var was = Object.keys(doneMap()).length;
    setDone(id, on);
    render();
    if (!on) { QK.announce("Unchecked."); return; }
    var it = items.filter(function (i) { return i.id === id; })[0], n = Object.keys(doneMap()).length;
    if (n === items.length && was < items.length) {
      QK.celebrate("You finished today’s plan!");
      var fin = mount.querySelector(".pl-finish"); if (fin && fin.scrollIntoView) fin.scrollIntoView({ block: "nearest" });
    } else if (it && it.kind === "guide") QK.celebrate("Nice work! " + it.title + " is done.");
    else QK.announce("Done. " + n + " of " + items.length + " finished.");
  }

  function expire() {
    if (expired) return; expired = true;
    timers.forEach(function (x) { clearInterval(x); clearTimeout(x); });
    if (full) {
      mount.textContent = "";
      mount.appendChild(h("div", { class: "qk-panel qk-center pl-gone" },
        h("h2", null, "That plan is finished."),
        h("p", null, "Your study guides are still on the 5th-grade page."),
        h("p", { class: "qk-row" }, h("a", { class: "qk-btn qk-btn-primary", href: base + "fifth-grade/" }, "Go to the 5th-grade page"))));
    } else if (mount.parentNode) mount.parentNode.removeChild(mount);
  }
  function tick() {
    if (expired) return;
    if (P.isExpired(now())) expire(); else render();
  }

  if (P.isExpired(now())) { expire(); return; }
  render();
  timers.push(setInterval(tick, 30000));
  var untilExpiry = Date.parse(PLAN.expiresAt) - now();
  if (untilExpiry > 0 && untilExpiry < 24 * 3600 * 1000) timers.push(setTimeout(tick, untilExpiry + 50));
  document.addEventListener("visibilitychange", function () { if (!document.hidden) tick(); });
  window.addEventListener("pageshow", tick);
  window.addEventListener("storage", function (e) { if (e.key === PLAN.storageKey) tick(); });
})();
