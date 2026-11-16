/* Optional Spanish read-aloud for Spanish Quest: ¿Cómo vivimos?
   Uses the browser's own text-to-speech (speechSynthesis) with an es-* voice. Nothing is sent anywhere and the
   microphone is never used. If the device has no Spanish voice, canSpeak() is false and callers hide 🔊.
   Speech is an extra: it never blocks progress. */
(function () {
  "use strict";
  var synth = window.speechSynthesis || null;
  var hasApi = !!(synth && window.SpeechSynthesisUtterance);
  var voice = null, state = hasApi ? "loading" : "none", listeners = [], token = 0;
  var PREF = ["es-mx", "es-us", "es-419", "es-es"];

  function norm(l) { return String(l || "").toLowerCase().replace("_", "-"); }
  function score(v) {
    var l = norm(v.lang), s = 0, p = PREF.indexOf(l);
    s += p >= 0 ? (PREF.length - p) * 2 : 1;
    if (v.localService) { s += 6; }
    if (/google|siri|paulina|monica|mónica|jorge|juan|sabina|helena|dalia|elvira/i.test(v.name)) { s += 3; }
    if (/compact|eloquence/i.test(v.name)) { s -= 2; }
    return s;
  }
  function setState(s) {
    if (s === state) { return; }
    state = s;
    listeners.forEach(function (fn) { try { fn(state); } catch (e) { /* a listener must never break speech */ } });
  }
  function pickVoice() {
    if (!hasApi) { return; }
    var all = [], es;
    try { all = synth.getVoices() || []; } catch (e) { all = []; }
    if (!all.length) { return; }
    es = all.filter(function (v) { return norm(v.lang).indexOf("es") === 0; });
    if (!es.length) { voice = null; setState("none"); return; }
    es.sort(function (a, b) { return score(b) - score(a); });
    voice = es[0];
    setState("ready");
  }

  if (hasApi) {
    pickVoice();
    try {
      if (synth.addEventListener) { synth.addEventListener("voiceschanged", pickVoice); }
      else { synth.onvoiceschanged = pickVoice; }
    } catch (e) { /* ignore */ }
    /* Some browsers never fire voiceschanged; after a wait we allow a best-effort es-MX try. */
    setTimeout(function () { pickVoice(); if (state === "loading") { setState("maybe"); } }, 1800);
  }

  function canSpeak() { return hasApi && (state === "ready" || state === "maybe"); }

  function stop() {
    token++;
    if (hasApi) { try { synth.cancel(); } catch (e) { /* ignore */ } }
  }

  /* Speak one Spanish phrase. opts.slow = slower; opts.onend fires once (also on failure). */
  function say(text, opts) {
    opts = opts || {};
    var my = ++token, done = false;
    function finish() { if (!done) { done = true; if (my === token && opts.onend) { try { opts.onend(); } catch (e) { /* ignore */ } } } }
    if (!canSpeak() || !text) { setTimeout(finish, 0); return false; }
    try {
      if (synth.speaking || synth.pending) { synth.cancel(); }
      var u = new window.SpeechSynthesisUtterance(String(text));
      u.lang = voice ? norm(voice.lang) : "es-MX";
      if (voice) { u.voice = voice; }
      u.rate = opts.slow ? 0.55 : 0.85;
      u.pitch = 1.05;
      u.onend = finish;
      u.onerror = finish;
      synth.speak(u);
      setTimeout(finish, Math.max(1600, String(text).length * (opts.slow ? 190 : 120) + 900));
      return true;
    } catch (e) { setTimeout(finish, 0); return false; }
  }

  window.SU_SPEECH = {
    say: say, stop: stop, canSpeak: canSpeak,
    state: function () { return state; },
    onChange: function (fn) { if (typeof fn === "function") { listeners.push(fn); } }
  };
})();
