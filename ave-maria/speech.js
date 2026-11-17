/* Optional read-aloud for Ave María Quest, using the browser's own text-to-speech (speechSynthesis).
   Church Latin sounds close to Italian, so an it-* voice is preferred (text respelled with
   AveMariaData.speechText(text, "it")); an es-* voice is the fallback ("es" respelling).
   Nothing is sent anywhere and the microphone is never used. With no suitable voice canSpeak() is false and the
   app hides 🔊 and relies on the written pronunciation. Speech never blocks progress. */
(function () {
  "use strict";
  var synth = window.speechSynthesis || null;
  var hasApi = !!(synth && window.SpeechSynthesisUtterance);
  var voice = null, state = hasApi ? "loading" : "none", listeners = [], token = 0;
  var PREF_IT = ["it-it", "it-ch"], PREF_ES = ["es-mx", "es-us", "es-419", "es-es"];

  function norm(l) { return String(l || "").toLowerCase().replace("_", "-"); }
  function score(v, pref) {
    var l = norm(v.lang), s = 0, p = pref.indexOf(l);
    s += p >= 0 ? (pref.length - p) * 2 : 1;
    if (v.localService) { s += 6; }
    if (/google|siri|alice|luca|elsa|federica|paola|isabella|diego|paulina|monica|mónica|jorge|juan|sabina|dalia|elvira/i.test(v.name)) { s += 3; }
    if (/compact|eloquence/i.test(v.name)) { s -= 2; }
    return s;
  }
  function setState(s) {
    if (s === state) { return; }
    state = s;
    listeners.forEach(function (fn) { try { fn(state); } catch (e) { /* a listener must never break speech */ } });
  }
  function best(all, prefix, pref) {
    var list = all.filter(function (v) { return norm(v.lang).indexOf(prefix) === 0; });
    list.sort(function (a, b) { return score(b, pref) - score(a, pref); });
    return list[0] || null;
  }
  function pickVoice() {
    if (!hasApi) { return; }
    var all = [];
    try { all = synth.getVoices() || []; } catch (e) { all = []; }
    if (!all.length) { return; }
    voice = best(all, "it", PREF_IT) || best(all, "es", PREF_ES);
    if (!voice) { setState("none"); return; }
    setState("ready");
  }

  if (hasApi) {
    pickVoice();
    try {
      if (synth.addEventListener) { synth.addEventListener("voiceschanged", pickVoice); }
      else { synth.onvoiceschanged = pickVoice; }
    } catch (e) { /* ignore */ }
    /* Some browsers never fire voiceschanged: after a wait, allow a best-effort try with the Italian default. */
    setTimeout(function () { pickVoice(); if (state === "loading") { setState("maybe"); } }, 1800);
  }

  function canSpeak() { return hasApi && (state === "ready" || state === "maybe"); }
  function langOf() { return voice ? (norm(voice.lang).indexOf("es") === 0 ? "es" : "it") : "it"; }

  function stop() {
    token++;
    if (hasApi) { try { synth.cancel(); } catch (e) { /* ignore */ } }
  }

  /* Speak a Latin phrase. opts.slow = slower; opts.onend fires once (also on failure or when interrupted by a newer say). */
  function say(text, opts) {
    opts = opts || {};
    var my = ++token, done = false;
    function finish() { if (!done) { done = true; if (my === token && opts.onend) { try { opts.onend(); } catch (e) { /* ignore */ } } } }
    if (!canSpeak() || !text) { setTimeout(finish, 0); return false; }
    try {
      var D = window.AveMariaData, lang = langOf();
      var spoken = D && D.speechText ? D.speechText(String(text), lang) : String(text);
      if (synth.speaking || synth.pending) { synth.cancel(); }
      var u = new window.SpeechSynthesisUtterance(spoken);
      u.lang = voice ? norm(voice.lang) : "it-IT";
      if (voice) { u.voice = voice; }
      u.rate = opts.slow ? 0.55 : 0.8;
      u.pitch = 1;
      u.onend = finish;
      u.onerror = finish;
      synth.speak(u);
      setTimeout(finish, Math.max(1800, String(text).length * (opts.slow ? 210 : 140) + 1000));
      return true;
    } catch (e) { setTimeout(finish, 0); return false; }
  }

  window.AM_SPEECH = {
    say: say, stop: stop, canSpeak: canSpeak,
    voiceName: function () { return voice ? voice.name + " (" + voice.lang + ")" : ""; },
    state: function () { return state; },
    onChange: function (fn) { if (typeof fn === "function") { listeners.push(fn); } }
  };
})();
