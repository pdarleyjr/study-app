/* Spanish speech for the Days of the Week game.
   Uses the browser's own text-to-speech (speechSynthesis) with a Spanish (es-*) voice.
   Nothing is sent anywhere by this file; there is no microphone use at all.
   If the device has no Spanish voice we say so and the game shows sound-it-out spellings instead. */
(function () {
  "use strict";
  var SD = window.SD = window.SD || {};
  var synth = window.speechSynthesis || null;
  var hasApi = !!(synth && window.SpeechSynthesisUtterance);
  var voice = null, state = hasApi ? "loading" : "none", listeners = [], token = 0;
  var PREF = ["es-mx", "es-us", "es-419", "es-es"];

  function norm(l) { return String(l || "").toLowerCase().replace("_", "-"); }
  function pickVoice() {
    if (!hasApi) { return; }
    var all = [];
    try { all = synth.getVoices() || []; } catch (e) { all = []; }
    if (!all.length) { return; } /* not loaded yet (Chrome) */
    var es = all.filter(function (v) { return norm(v.lang).indexOf("es") === 0; });
    if (!es.length) { voice = null; setState("none"); return; }
    es.sort(function (a, b) { return score(b) - score(a); });
    voice = es[0];
    setState("ready");
  }
  function score(v) {
    var l = norm(v.lang), s = 0, p = PREF.indexOf(l);
    s += p >= 0 ? (PREF.length - p) * 2 : 1;
    if (v.localService) { s += 6; } /* works offline */
    if (/google|siri|paulina|monica|mónica|jorge|juan|sabina|helena|dalia|elvira/i.test(v.name)) { s += 3; }
    if (/compact|eloquence/i.test(v.name)) { s -= 2; }
    return s;
  }
  function setState(s) {
    if (s === state) { return; }
    state = s;
    listeners.forEach(function (fn) { try { fn(state); } catch (e) { /* listener errors must not break speech */ } });
  }

  if (hasApi) {
    pickVoice();
    if (synth.addEventListener) { synth.addEventListener("voiceschanged", pickVoice); }
    else { synth.onvoiceschanged = pickVoice; }
    /* Some browsers (older Safari, some Android) never fire voiceschanged and keep an empty list.
       After a short wait we allow a best-effort try with lang = es-MX and tell the grown-up. */
    setTimeout(function () { pickVoice(); if (state === "loading") { setState("maybe"); } }, 1800);
  }

  function stop() {
    token++;
    if (hasApi) { try { synth.cancel(); } catch (e) { /* ignore */ } }
  }

  /* Speak one Spanish phrase. opts.slow = slower; opts.onend called once (also on failure). */
  function say(text, opts) {
    opts = opts || {};
    var my = ++token, done = false;
    function finish() { if (!done) { done = true; if (my === token && opts.onend) { opts.onend(); } } }
    if (!canSpeak()) { setTimeout(finish, 0); return false; }
    try {
      if (synth.speaking || synth.pending) { synth.cancel(); }
      var u = new SpeechSynthesisUtterance(text);
      u.lang = voice ? norm(voice.lang) : "es-MX";
      if (voice) { u.voice = voice; }
      u.rate = opts.slow ? 0.55 : 0.85;
      u.pitch = 1.05;
      u.onend = finish;
      u.onerror = finish;
      if (opts.onstart) { u.onstart = opts.onstart; }
      synth.speak(u);
      /* Safety net: some engines never fire onend. */
      setTimeout(finish, Math.max(1600, String(text).length * (opts.slow ? 190 : 120) + 900));
      return true;
    } catch (e) { setTimeout(finish, 0); return false; }
  }

  /* Say a list one item at a time; onItem(i) fires as each starts (for highlighting). */
  function sayList(list, opts) {
    opts = opts || {};
    var i = 0, my;
    function step() {
      if (i >= list.length) { if (opts.onend) { opts.onend(); } return; }
      var k = i++;
      if (opts.onItem) { opts.onItem(k); }
      say(list[k], { slow: opts.slow, onend: function () { if (my === token) { setTimeout(function () { if (my === token) { step(); } }, opts.gap || 350); } } });
      my = token;
    }
    step();
  }

  function canSpeak() { return hasApi && (state === "ready" || state === "maybe"); }

  SD.speech = {
    say: say, sayList: sayList, stop: stop, canSpeak: canSpeak,
    state: function () { return state; },
    voiceName: function () { return voice ? voice.name + " (" + voice.lang + ")" : ""; },
    onChange: function (fn) { listeners.push(fn); }
  };
})();
