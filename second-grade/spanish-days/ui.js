/* Spanish Days: small shared UI pieces (DOM helpers, week strip, sound buttons,
   the put-in-order board, praise lines, results). Screens live in quiz.js and game.js. */
(function () {
  "use strict";
  var SD = window.SD = window.SD || {};
  var D = SD.data, speech = SD.speech;

  function el(tag, attrs, kids) {
    var n = document.createElement(tag), k;
    for (k in (attrs || {})) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) { continue; }
      if (k === "class") { n.className = v; }
      else if (k === "text") { n.textContent = v; }
      else if (k === "style" && typeof v === "object") { Object.keys(v).forEach(function (p) { n.style.setProperty(p, v[p]); }); }
      else if (k.slice(0, 2) === "on") { n.addEventListener(k.slice(2), v); }
      else { n.setAttribute(k, v === true ? "" : v); }
    }
    (kids || []).forEach(function (c) { if (c !== null && c !== undefined && c !== false) { n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); } });
    return n;
  }
  function btn(cls, label, onclick, attrs) {
    var a = attrs || {};
    a.type = "button"; a.class = cls; a.onclick = onclick;
    return el("button", a, Array.isArray(label) ? label : [label]);
  }
  function dayStyle(i) { return { "--day-bg": D.DAYS[i].bg, "--day-ink": D.DAYS[i].ink }; }
  function reduceMotion() { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }

  /* Stressed syllable in bold: miér·co·les */
  function syllables(i) {
    var d = D.DAYS[i];
    var kids = [];
    d.syl.forEach(function (s, k) {
      if (k) { kids.push(el("span", { class: "dot", "aria-hidden": "true", text: "·" })); }
      kids.push(el(k === d.stress ? "b" : "span", { text: s }));
    });
    return el("span", { class: "syl", "aria-label": d.es + ", said " + d.say }, kids);
  }

  /* 🔊 and 🐢 buttons. If the device cannot speak Spanish they show the sound-it-out spelling instead. */
  function soundButtons(text, sayHint, opts) {
    opts = opts || {};
    var wrap = el("span", { class: "sound" });
    function draw() {
      wrap.textContent = "";
      if (speech.canSpeak()) {
        wrap.appendChild(btn("snd", [el("span", { "aria-hidden": "true", text: "🔊" }), opts.big ? " Escuchar" : ""], function () { speech.say(text); }, { "aria-label": "Hear it: " + text }));
        if (!opts.noSlow) { wrap.appendChild(btn("snd slow", [el("span", { "aria-hidden": "true", text: "🐢" }), opts.big ? " Despacio" : ""], function () { speech.say(text, { slow: true }); }, { "aria-label": "Hear it slowly: " + text })); }
      } else if (sayHint) {
        wrap.appendChild(el("span", { class: "say-hint", text: "Say: " + sayHint }));
      }
    }
    draw();
    speech.onChange(function () { if (wrap.isConnected) { draw(); } });
    return wrap;
  }

  /* The week in order. opts.mark = index to highlight, opts.hide = index to show as "?",
     opts.dir = "after"|"before" draws a pointer from the mark. */
  function strip(opts) {
    opts = opts || {};
    var list = el("ol", { class: "strip" + (opts.small ? " small" : ""), "aria-label": "The week: lunes to domingo" });
    D.DAYS.forEach(function (d, i) {
      var hidden = opts.hide === i, cls = "chip" + (opts.mark === i ? " mark" : "") + (hidden ? " hide" : "");
      list.appendChild(el("li", { class: cls, style: dayStyle(i) }, [
        el("span", { class: "em", "aria-hidden": "true", text: d.emoji }), hidden ? el("span", { text: "?" , "aria-label": "hidden day" }) : el("span", { text: d.es })
      ]));
    });
    var box = el("div", { class: "strip-box" }, [list]);
    if (opts.mark === 6 && opts.dir === "after") { box.appendChild(el("p", { class: "loop", text: "🔁 After domingo, the week starts again with lunes!" })); }
    if (opts.mark === 0 && opts.dir === "before") { box.appendChild(el("p", { class: "loop", text: "🔁 Before lunes comes domingo, the last day of the week before." })); }
    return box;
  }

  var PRAISE = ["¡Muy bien!", "¡Excelente!", "¡Sí, señor!", "¡Fantástico!", "¡Bravo!", "¡Perfecto!", "¡Qué bien!"];
  var CASI = ["¡Casi!", "Almost!", "Good try!", "Not yet!"];
  function praise() { return pick(PRAISE); }
  function casi() { return pick(CASI); }

  /* Tiny celebration. Respects reduced motion. */
  function confetti(host) {
    if (reduceMotion() || !host) { return; }
    var box = el("div", { class: "confetti", "aria-hidden": "true" });
    for (var i = 0; i < 18; i++) {
      box.appendChild(el("i", { style: { left: (5 + Math.random() * 90) + "%", "animation-delay": (Math.random() * 0.25) + "s", background: D.DAYS[i % 7].ink } }));
    }
    host.appendChild(box);
    setTimeout(function () { if (box.parentNode) { box.parentNode.removeChild(box); } }, 1400);
  }

  /* Put-the-week-in-order board (train cars). Tap a word to place it in the next car.
     opts: start (first day; if pre=true it is already placed), hints ("ghost" | "color" | "none"),
     test (no colors on word tiles), onPlace(ok, slotDay), onDone({first, slots, wrongs}) */
  function orderBoard(opts) {
    var start = opts.start || 0, pre = !!opts.pre, cars = D.range(7).map(function (k) { return (start + k) % 7; });
    var pos = pre ? 1 : 0, wrongs = 0, firstOk = 0, slotWrong = 0, slots = 7 - (pre ? 1 : 0);
    var root = el("div", { class: "order" });
    var train = el("ol", { class: "train", "aria-label": "Train cars" });
    var msg = el("p", { class: "order-msg", role: "status", "aria-live": "polite" });
    var bank = el("div", { class: "bank", role: "group", "aria-label": "Day words to place" });
    root.appendChild(el("div", { class: "train-wrap" }, [el("span", { class: "engine", "aria-hidden": "true", text: "🚂" }), train]));
    root.appendChild(msg);
    root.appendChild(bank);

    var carEls = cars.map(function (d, k) {
      var li = el("li", { class: "car" + (opts.hints !== "none" ? " tinted" : ""), style: opts.hints !== "none" ? dayStyle(d) : null }, [
        el("span", { class: "num", text: String(k + 1) }), el("span", { class: "word" })
      ]);
      if (opts.hints === "ghost") { li.querySelector(".word").appendChild(el("span", { class: "ghost", text: D.DAYS[d].es })); }
      train.appendChild(li);
      return li;
    });
    function fill(k) {
      var li = carEls[k], d = cars[k];
      li.classList.add("filled"); li.classList.add("tinted");
      li.style.setProperty("--day-bg", D.DAYS[d].bg); li.style.setProperty("--day-ink", D.DAYS[d].ink);
      var w = li.querySelector(".word"); w.textContent = "";
      w.appendChild(el("span", { class: "em", "aria-hidden": "true", text: D.DAYS[d].emoji }));
      w.appendChild(el("span", { text: D.DAYS[d].es }));
      li.setAttribute("aria-label", "Car " + (k + 1) + ": " + D.DAYS[d].es);
    }
    if (pre) { fill(0); }
    function current() { carEls.forEach(function (c, k) { c.classList.toggle("now", k === pos); }); }
    current();

    var words = D.shuffle(Math.random, pre ? cars.slice(1) : cars.slice());
    words.forEach(function (d) {
      var b = btn("tile" + (opts.test ? "" : " tinted"), [el("span", { text: D.DAYS[d].es })], function () { tap(b, d); }, { style: opts.test ? null : dayStyle(d), "data-day": D.DAYS[d].es });
      bank.appendChild(b);
    });
    msg.textContent = pre ? "Start: " + D.DAYS[cars[0]].es + ". What comes next? Tap it!" : "Tap the first day of the week!";

    function tap(b, d) {
      if (pos >= 7) { return; }
      if (d === cars[pos]) {
        if (!slotWrong) { firstOk++; }
        if (opts.onPlace) { opts.onPlace(true, cars[pos], slotWrong > 0); }
        speech.say(D.DAYS[d].es);
        fill(pos); b.disabled = true; b.classList.add("used"); b.setAttribute("aria-hidden", "true");
        pos++; slotWrong = 0;
        bank.querySelectorAll(".tile.show").forEach(function (t) { t.classList.remove("show"); });
        current();
        if (pos >= 7) {
          msg.textContent = praise() + " The whole week!";
          if (opts.onDone) { opts.onDone({ first: firstOk, slots: slots, wrongs: wrongs }); }
        } else {
          msg.textContent = praise() + " What comes after " + D.DAYS[cars[pos - 1]].es + "?";
          var nb = bank.querySelector(".tile:not(.used)"); if (nb && opts.focusNext !== false) { nb.focus({ preventScroll: true }); }
        }
      } else {
        wrongs++; slotWrong++;
        if (opts.onPlace) { opts.onPlace(false, cars[pos], true); }
        b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake");
        msg.textContent = pos === 0 ? casi() + " The week starts with the Moon day 🌙." : casi() + " What comes after " + D.DAYS[cars[pos - 1]].es + "?";
        if (slotWrong >= 2) {
          var right = bank.querySelector('[data-day="' + D.DAYS[cars[pos]].es + '"]');
          if (right) { right.classList.add("show"); }
          msg.textContent = "Look for the glowing one: " + D.DAYS[cars[pos]].es + "!";
        }
      }
    }
    return root;
  }

  /* Stars for a share right on the first try. Not a grade; just a friendly picture. */
  function stars(rate) {
    var n = rate >= 0.9 ? 3 : rate >= 0.6 ? 2 : 1;
    return el("p", { class: "stars", "aria-label": n + " of 3 stars" }, [el("span", { "aria-hidden": "true", text: new Array(n + 1).join("⭐") + new Array(4 - n).join("☆") })]);
  }

  SD.ui = { el: el, btn: btn, dayStyle: dayStyle, syllables: syllables, soundButtons: soundButtons, strip: strip,
    praise: praise, casi: casi, confetti: confetti, orderBoard: orderBoard, stars: stars, reduceMotion: reduceMotion, pick: pick };
})();
