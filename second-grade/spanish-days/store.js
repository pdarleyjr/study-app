/* Saved progress for Spanish Days (this device only, never throws).
   Own key, separate from every 5th-grade game: studyquest:spanish-days:v1.
   The shared best score still goes through StudyQuest.record("spanish-days", pct). */
(function () {
  "use strict";
  var SD = window.SD = window.SD || {};
  var KEY = "studyquest:spanish-days:v1", GAME_ID = "spanish-days";
  var D = SD.data, ACTS = ["meet", "train", "next", "before", "missing", "listen", "say"];

  function obj(v) { return v && typeof v === "object" && !Array.isArray(v) ? v : {}; }
  function num(v) { return Number(v) || 0; }
  function stat(o) { o = obj(o); return { seen: num(o.seen), first: num(o.first), fixed: num(o.fixed), hint: num(o.hint), miss: num(o.miss) }; }

  function load() {
    var d;
    try { d = JSON.parse(localStorage.getItem(KEY)); } catch (e) { d = null; }
    d = obj(d);
    var out = { stats: {}, acts: {}, levels: {}, oral: [], recent: [], best: obj(d.best), lastAt: num(d.lastAt), meetSeen: [] };
    Object.keys(obj(d.stats)).forEach(function (k) { if (/^(after|before|day|missing):[a-záéíóú]+$/.test(k)) { out.stats[k] = stat(d.stats[k]); } });
    ACTS.concat(["challenge", "quick"]).forEach(function (a) { out.acts[a] = num(obj(d.acts)[a]); });
    Object.keys(obj(d.levels)).forEach(function (k) { out.levels[k] = Math.min(3, Math.max(1, num(d.levels[k]) || 1)); });
    out.oral = (Array.isArray(d.oral) ? d.oral : []).filter(function (r) { return r && typeof r === "object"; }).slice(-12);
    out.recent = (Array.isArray(d.recent) ? d.recent : []).filter(function (r) { return r && typeof r === "object"; }).slice(-20);
    out.meetSeen = (Array.isArray(d.meetSeen) ? d.meetSeen : []).filter(function (s) { return D.idxOf(s) >= 0; });
    return out;
  }
  var cache = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch (e) { /* storage full or private mode */ } }

  /* outcome: "first" (right on first try, no hint), "hint" (right but used a hint/visible help),
     "fixed" (right after feedback), "miss" (gave up / skipped after feedback). */
  function mark(key, outcome) {
    var s = cache.stats[key] = stat(cache.stats[key]);
    s.seen++;
    if (outcome === "first") { s.first++; }
    else if (outcome === "hint") { s.hint++; }
    else if (outcome === "fixed") { s.fixed++; s.miss++; }
    else { s.miss++; }
    cache.lastAt = Date.now();
    save();
  }

  /* How much a key should come back: 1 = normal; more after misses, less once solid. */
  function weightOf(key) {
    var s = cache.stats[key];
    if (!s || !s.seen) { return 1.5; }
    return 1 + 4 * (s.miss + 0.5 * s.hint) / s.seen;
  }

  function finishActivity(act, summary) {
    if (cache.acts[act] === undefined) { cache.acts[act] = 0; }
    cache.acts[act]++;
    if (summary) {
      cache.recent.push({ at: Date.now(), act: act, first: num(summary.first), total: num(summary.total), fixed: num(summary.fixed), hint: num(summary.hint) });
      cache.recent = cache.recent.slice(-20);
      if (summary.total && (act === "challenge" || act === "quick")) {
        var pct = Math.round(100 * summary.first / summary.total);
        cache.best[act] = Math.max(num(cache.best[act]), pct);
        if (act === "challenge" && window.StudyQuest) { window.StudyQuest.record(GAME_ID, pct); }
      }
    }
    cache.lastAt = Date.now();
    save();
  }

  function setLevel(act, lvl) { cache.levels[act] = lvl; save(); }
  function level(act) { return cache.levels[act] || 1; }
  function meetSeen(es) { if (cache.meetSeen.indexOf(es) < 0) { cache.meetSeen.push(es); save(); } return cache.meetSeen.length; }

  /* r = { said: n of 7 said right in order, helped: n peeked, by: "grown-up" | "self", where } */
  function addOral(r) {
    cache.oral.push({ at: Date.now(), said: num(r.said), helped: num(r.helped), by: r.by === "grown-up" ? "grown-up" : "self", where: String(r.where || "") });
    cache.oral = cache.oral.slice(-12);
    cache.lastAt = Date.now();
    save();
  }

  /* ---------- summaries for the parent page ---------- */
  function sumKeys(prefix) {
    var t = { seen: 0, first: 0, fixed: 0, hint: 0, miss: 0 };
    Object.keys(cache.stats).forEach(function (k) {
      if (k.indexOf(prefix) === 0) { var s = cache.stats[k]; t.seen += s.seen; t.first += s.first; t.fixed += s.fixed; t.hint += s.hint; t.miss += s.miss; }
    });
    return t;
  }
  /* Per day: every question whose answer is that day (translation, after, before, missing). */
  function dayReport() {
    return D.DAYS.map(function (d, i) {
      var keys = ["day:" + d.es, "missing:" + d.es, "after:" + D.DAYS[D.before(i)].es, "before:" + D.DAYS[D.after(i)].es];
      var t = { es: d.es, en: d.en, seen: 0, first: 0, miss: 0, hint: 0 };
      keys.forEach(function (k) { var s = cache.stats[k]; if (s) { t.seen += s.seen; t.first += s.first; t.miss += s.miss; t.hint += s.hint; } });
      t.rate = t.seen ? t.first / t.seen : null;
      return t;
    });
  }
  function lastOral(byGrownUp) {
    for (var i = cache.oral.length - 1; i >= 0; i--) { if (!byGrownUp || cache.oral[i].by === "grown-up") { return cache.oral[i]; } }
    return null;
  }
  function reset() { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } cache = load(); }

  SD.store = {
    get: function () { return cache; }, mark: mark, weightOf: weightOf, finishActivity: finishActivity,
    setLevel: setLevel, level: level, meetSeen: meetSeen, addOral: addOral,
    sumKeys: sumKeys, dayReport: dayReport, lastOral: lastOral, reset: reset, ACTS: ACTS, KEY: KEY
  };
})();
