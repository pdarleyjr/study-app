/* Spanish Days: the grown-ups page (#parent) and the printable review card.
   Reads only this game's own saved progress. Reset clears only studyquest:spanish-days:v1. */
(function () {
  "use strict";
  var SD = window.SD = window.SD || {};
  var D = SD.data, ui = SD.ui, el = ui.el, btn = ui.btn, store = SD.store, speech = SD.speech;

  function pct(a, b) { return b ? Math.round(100 * a / b) + "%" : "—"; }
  function when(ts) {
    if (!ts) { return "never"; }
    try { return new Date(ts).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }); }
    catch (e) { return new Date(ts).toString(); }
  }
  function relLine(prefix) {
    var t = store.sumKeys(prefix);
    if (!t.seen) { return "Not practiced yet."; }
    return t.first + " of " + t.seen + " right on the first try (" + pct(t.first, t.seen) + ")" + (t.hint ? ", " + t.hint + " with a hint" : "") + (t.miss ? ", " + t.miss + " needed a second look" : "") + ".";
  }

  function suggestion(days) {
    var c = store.get(), after = store.sumKeys("after:"), before = store.sumKeys("before:"), oral = store.lastOral(true);
    var weak = days.filter(function (d) { return d.seen >= 2 && d.rate !== null && d.rate < 0.75; }).map(function (d) { return d.es; });
    if (!c.acts.meet && !c.acts.train) { return "Start with Meet the Days (listen and do the moves), then the Days Train."; }
    if (weak.length) { return "Review " + weak.slice(0, 3).join(", ") + ": open them in Meet the Days, then play Missing Day Mystery. Or tap 'Practice my tricky days' on the main screen."; }
    if (!after.seen || !before.seen) { return "Play " + (!after.seen ? "What Comes Next? (después)" : "Time Traveler (antes)") + " next."; }
    if (before.seen && before.first / before.seen < after.first / Math.max(1, after.seen) - 0.15) { return "'Before' (antes) is harder than 'after' right now. Play Time Traveler at Level 2."; }
    if (!oral || oral.said < 7 || oral.helped) { return "Listen while your child says all seven days with no list (Say It Like a Champion), and tap each card."; }
    if (!c.acts.challenge) { return "Try the Spanish Days Challenge as a practice test."; }
    return "Looking good. On Monday morning, do the Quick Review once (about 4 minutes). Then stop: no cramming needed.";
  }

  function render(app, backBar) {
    var c = store.get(), days = store.dayReport(), oral = store.lastOral(true), oralAny = store.lastOral(false);
    app.appendChild(backBar("Grown-ups"));
    var page = el("section", { class: "parent" });
    page.appendChild(el("h2", { class: "screen-title", text: "👪 Spanish Days: progress & tips" }));
    page.appendChild(el("p", { class: "lead small", text: "Last practice: " + when(c.lastAt) + ". Saved on this device only. No account, and nothing is sent anywhere." }));

    var qa = el("dl", { class: "qa" });
    function row(q, a) { qa.appendChild(el("dt", { text: q })); qa.appendChild(el("dd", null, Array.isArray(a) ? a : [a])); }
    row("1. Can your child say all seven days in order?", oral
      ? (oral.said === 7 && !oral.helped ? "✅ Yes: 7 of 7 with no peeking, checked by a grown-up on " + when(oral.at) + "." : "Getting there: " + oral.said + " of 7 on their own" + (oral.helped ? " (" + oral.helped + (oral.helped === 1 ? " peek)" : " peeks)") : "") + ", checked by a grown-up on " + when(oral.at) + ".")
      : (oralAny ? "Self-checked only (" + oralAny.said + " of 7 on " + when(oralAny.at) + "). Please listen once yourself: Say It Like a Champion → Champion time." : "Not checked yet. Open Say It Like a Champion and listen while your child says the week."));
    row("2. Can your child say what comes next (después)?", relLine("after:"));
    row("3. Can your child say what came before (antes)?", relLine("before:"));
    var weak = days.filter(function (d) { return d.seen && d.rate !== null; }).sort(function (a, b) { return a.rate - b.rate; });
    row("4. Which days still need practice?", weak.length
      ? (weak[0].rate >= 0.85 ? "None stand out. Every day is at 85% or better on the first try." : weak.filter(function (d) { return d.rate < 0.85; }).slice(0, 3).map(function (d) { return d.es + " (" + pct(d.first, d.seen) + ")"; }).join(", "))
      : "Not enough practice yet to tell.");
    row("5. What would help most next?", suggestion(days));
    page.appendChild(qa);

    /* per-day table */
    var tb = el("tbody");
    days.forEach(function (d, i) {
      var r = d.rate === null ? 0 : Math.round(d.rate * 100);
      tb.appendChild(el("tr", null, [
        el("th", { scope: "row", lang: "es", style: ui.dayStyle(i) }, [D.DAYS[i].emoji + " " + d.es]),
        el("td", { text: d.en }),
        el("td", { text: d.seen ? d.first + " / " + d.seen : "—" }),
        el("td", null, [d.seen ? el("span", { class: "meter", role: "img", "aria-label": r + "% first try" }, [el("span", { style: { width: r + "%" } })]) : "—"])
      ]));
    });
    page.appendChild(el("h3", { text: "Each day (all question types where that day is the answer)" }));
    page.appendChild(el("div", { class: "table-wrap" }, [el("table", { class: "days-table" }, [
      el("thead", null, [el("tr", null, [el("th", { scope: "col", text: "Día" }), el("th", { scope: "col", text: "English" }), el("th", { scope: "col", text: "First try" }), el("th", { scope: "col", text: "" })])]), tb])]));

    /* recent */
    if (c.recent.length) {
      var ul = el("ul", { class: "recent" });
      c.recent.slice(-6).reverse().forEach(function (r) {
        ul.appendChild(el("li", { text: when(r.at) + ": " + r.act + (r.total ? " · " + Math.round(r.first * 10) / 10 + " of " + r.total + " first try" : "") }));
      });
      page.appendChild(el("h3", { text: "Recent practice" })); page.appendChild(ul);
    }

    page.appendChild(el("h3", { text: "How to read these numbers" }));
    page.appendChild(el("ul", { class: "notes" }, [
      el("li", { text: "First try = right with no hint and no second look. That is the best sign of what your child can do alone." }),
      el("li", { text: "Tapping the right word is not the same as saying it. Speaking is only counted when a grown-up listens in Say It Like a Champion (there is no microphone)." }),
      el("li", { text: "Questions missed in a round come back a few questions later. That is a same-day re-check, not spaced practice. A short review on a different day (like Monday morning) is what spreads practice out." }),
      el("li", { text: "This is practice, not a prediction of a test score." })
    ]));

    page.appendChild(el("h3", { text: "Sound on this device" }));
    var st = speech.state();
    page.appendChild(el("p", { class: "lead small", text: st === "ready" ? "Spanish voice found: " + speech.voiceName() + ". Computer voices are good but not perfect; the sound-it-out spellings (like LOO-nehs) are on every day card." :
      st === "maybe" ? "The browser did not list its voices, so sound uses the device's own voice. If it doesn't sound Spanish, use the sound-it-out spellings and say the words yourself." :
      st === "loading" ? "Checking for a Spanish voice…" :
      "No Spanish voice was found. iPad/iPhone: Settings → Accessibility → Spoken Content → Voices → Spanish, download one, then reload. Android: Settings → Text-to-speech → install Spanish. Windows: Settings → Time & language → Speech → add Spanish. The game still works without sound." }));
    page.appendChild(el("p", { class: "lead small", text: "Offline: the game itself works without Wi-Fi after the first visit. Some voices (often the Google ones in Chrome) need the internet; built-in device voices usually work offline." }));

    var tools = el("div", { class: "btn-row" }, [
      btn("big-btn", "🖨️ Print a review card", function () { window.print(); }),
      btn("big-btn alt", "↺ Reset Spanish Days progress", function () {
        if (window.confirm("Erase Spanish Days progress on this device? 5th-grade scores are not touched.")) { store.reset(); app.textContent = ""; render(app, backBar); }
      })
    ]);
    page.appendChild(tools);
    page.appendChild(el("p", { class: "lead small", text: "Plan for tonight: Meet the Days → Days Train → What Comes Next? → Time Traveler (about 10–15 minutes), then say the week together once. Monday morning: the Quick Review only." }));
    app.appendChild(page);
    app.appendChild(printCard());
  }

  function printCard() {
    var tb = el("tbody");
    D.DAYS.forEach(function (d) { tb.appendChild(el("tr", null, [el("td", { text: d.emoji }), el("td", { lang: "es" }, [el("b", { text: d.es })]), el("td", { text: d.say }), el("td", { text: d.en }), el("td", { text: d.move })])); });
    var qs = [["¿Qué día viene después del martes?", "miércoles"], ["¿Qué día viene antes del viernes?", "jueves"], ["¿Qué día viene después del domingo?", "lunes"], ["¿Qué día viene antes del lunes?", "domingo"], ["¿Cuál es el día que falta? jueves → ___ → sábado", "viernes"]];
    return el("section", { class: "print-card", "aria-hidden": "true" }, [
      el("h2", { text: "Los días de la semana · Spanish Days review card" }),
      el("p", { lang: "es", class: "print-order", text: "lunes → martes → miércoles → jueves → viernes → sábado → domingo → (lunes)" }),
      el("table", null, [el("thead", null, [el("tr", null, ["", "Español", "Sounds like", "English", "Move"].map(function (h) { return el("th", { text: h }); }))]), tb]),
      el("h3", { text: "Ask these (answers on the right)" }),
      el("ol", null, qs.map(function (q) { return el("li", null, [el("span", { lang: "es", text: q[0] + " " }), el("b", { lang: "es", text: "→ " + q[1] })]); })),
      el("p", { text: "después = after · antes = before · Days are written with a small letter in Spanish." })
    ]);
  }

  SD.parent = render;
})();
