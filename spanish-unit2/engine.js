/* Spanish Quest: ¿Cómo vivimos? — learning engine.
   Pure and deterministic: no DOM, no storage, no clock. All randomness comes from a seeded rng
   (mulberry32), so a given seed reproduces the same set and different seeds vary.
   Loads in Node with require() and in the browser as window.SU_ENGINE. */
(function () {
  "use strict";

  var LOG_MAX = 300, RECENT_MAX = 6;

  /* ---------- rng and small helpers ---------- */
  function hashSeed(s) {
    var h = 2166136261, i;
    s = String(s);
    for (i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function createRng(seed) {
    var a = (typeof seed === "number" && isFinite(seed) ? Math.floor(seed) : hashSeed(seed == null ? 1 : seed)) >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffled(list, rng) {
    var a = list.slice(), i, j, t;
    for (i = a.length - 1; i > 0; i--) { j = Math.floor(rng() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function arr(x) { return Array.isArray(x) ? x : []; }
  function obj(x) { return x && typeof x === "object" ? x : {}; }
  function mean(list) { if (!list.length) { return 0; } var s = 0; list.forEach(function (n) { s += n; }); return s / list.length; }

  /* ---------- data lookups ---------- */
  function questions(DATA) { return arr(DATA && DATA.QUESTIONS); }
  function getQ(DATA, id) {
    var q = null;
    if (DATA && typeof DATA.byId === "function") { try { q = DATA.byId(id); } catch (e) { q = null; } }
    if (q) { return q; }
    return questions(DATA).filter(function (x) { return x.id === id; })[0] || null;
  }
  function skillRow(DATA, id) { return arr(DATA && DATA.SKILLS).filter(function (s) { return s.id === id; })[0] || null; }
  function areaOf(DATA, skillId) {
    var s = skillRow(DATA, skillId), found = null;
    if (s && s.area) { return s.area; }
    arr(DATA && DATA.AREAS).forEach(function (a) { if (arr(a.skills).indexOf(skillId) >= 0) { found = a.id; } });
    return found;
  }
  function areaRow(DATA, id) { return arr(DATA && DATA.AREAS).filter(function (a) { return a.id === id; })[0] || null; }
  function areaWeight(DATA, skillId) { var a = areaRow(DATA, areaOf(DATA, skillId)); return a && a.examCount ? a.examCount : 0; }
  function isExamOk(q) { return !!q && q.exam === true && q.type !== "tap"; }
  function diffOf(q) { return typeof q.difficulty === "number" ? q.difficulty : 1; }
  function famOf(q) { return q.family || q.id; }
  function seenOf(progress, id) { var it = obj(obj(progress).items)[id]; return it && it.seen ? it.seen : 0; }

  /* order a list so that no two neighbours share a key when avoidable (take from the biggest remaining group) */
  function arrange(list, keyOf) {
    var rest = list.slice(), out = [], last = null, counts = {};
    rest.forEach(function (x) { var k = keyOf(x); counts[k] = (counts[k] || 0) + 1; });
    while (rest.length) {
      var best = -1, bestCount = -1, i, k;
      for (i = 0; i < rest.length; i++) {
        k = keyOf(rest[i]);
        if (k !== last && counts[k] > bestCount) { best = i; bestCount = counts[k]; }
      }
      if (best < 0) { best = 0; }
      k = keyOf(rest[best]);
      counts[k]--; last = k;
      out.push(rest.splice(best, 1)[0]);
    }
    return out;
  }

  /* ---------- progress ---------- */
  function newProgress() { return { v: 1, items: {}, skills: {}, log: [] }; }

  function recordAnswer(progress, ev) {
    var p = obj(progress), score, last, it, sk, items = {}, skills = {}, k;
    ev = obj(ev);
    for (k in obj(p.items)) { items[k] = p.items[k]; }
    for (k in obj(p.skills)) { skills[k] = p.skills[k]; }
    score = ev.firstCorrect ? (ev.hintUsed ? 0.5 : 1) : 0;
    last = ev.firstCorrect ? (ev.hintUsed ? "hint" : "right") : "wrong";
    it = obj(items[ev.qid]);
    items[ev.qid] = {
      seen: (it.seen || 0) + 1,
      firstRight: (it.firstRight || 0) + (ev.firstCorrect ? 1 : 0),
      firstWrong: (it.firstWrong || 0) + (ev.firstCorrect ? 0 : 1),
      hints: (it.hints || 0) + (ev.hintUsed ? 1 : 0),
      corrected: (it.corrected || 0) + (ev.correctedAfter ? 1 : 0),
      last: last,
      at: ev.at || 0
    };
    sk = obj(skills[ev.skill]);
    skills[ev.skill] = {
      n: (sk.n || 0) + 1,
      right: (sk.right || 0) + (score === 1 ? 1 : 0),
      hinted: (sk.hinted || 0) + (score === 0.5 ? 1 : 0),
      wrong: (sk.wrong || 0) + (score === 0 ? 1 : 0),
      corrected: (sk.corrected || 0) + (ev.correctedAfter ? 1 : 0),
      recent: arr(sk.recent).concat([score]).slice(-RECENT_MAX)
    };
    return {
      v: 1, items: items, skills: skills,
      log: arr(p.log).concat([{ qid: ev.qid, skill: ev.skill, mode: ev.mode, score: score, corrected: !!ev.correctedAfter, at: ev.at || 0 }]).slice(-LOG_MAX)
    };
  }

  function skillMastery(progress, skillId) {
    var sk = obj(obj(obj(progress).skills)[skillId]), n = sk.n || 0, recent = arr(sk.recent), score = mean(recent), level, tail;
    if (n === 0) { return { level: "new", score: 0, n: 0 }; }
    tail = recent.slice(-3);
    if (recent.length >= 3 && tail.every(function (s) { return s === 1; }) && score >= 0.8) { level = "mastered"; }
    else if (score >= 0.6) { level = "almost"; }
    else { level = "learning"; }
    return { level: level, score: score, n: n };
  }

  function weakestSkills(progress, DATA, count) {
    var rank = { learning: 0, "new": 1, almost: 2, mastered: 3 };
    var rows = arr(DATA && DATA.SKILLS).map(function (s, i) {
      var m = skillMastery(progress, s.id);
      return { id: s.id, level: m.level, score: m.score, ex: areaWeight(DATA, s.id), i: i };
    });
    rows.sort(function (a, b) {
      if (rank[a.level] !== rank[b.level]) { return rank[a.level] - rank[b.level]; }
      if (a.level !== "new" && a.score !== b.score) { return a.score - b.score; }
      if (a.ex !== b.ex) { return b.ex - a.ex; }
      return a.i - b.i;
    });
    var ids = rows.map(function (r) { return r.id; });
    return count == null ? ids : ids.slice(0, Math.max(0, count));
  }

  /* ---------- test builders ---------- */
  function buildDiagnostic(DATA, rng) {
    rng = rng || createRng(1);
    var all = questions(DATA), picks = [];
    arr(DATA && DATA.SKILLS).forEach(function (s) {
      var of = all.filter(function (q) { return q.skill === s.id; });
      var pool = of.filter(function (q) { return isExamOk(q) && diffOf(q) <= 2; });
      if (!pool.length) { pool = of.filter(isExamOk); }
      if (!pool.length) { pool = of.filter(function (q) { return q.type !== "tap"; }); }
      if (!pool.length) { pool = of; }
      if (pool.length) { picks.push({ id: pool[Math.floor(rng() * pool.length)].id, area: areaOf(DATA, s.id) || s.id }); }
    });
    return arrange(shuffled(picks, rng), function (x) { return x.area; }).map(function (x) { return x.id; });
  }

  function buildExam(DATA, rng) {
    rng = rng || createRng(1);
    var all = questions(DATA).filter(isExamOk), areas = arr(DATA && DATA.AREAS);
    var total = DATA && DATA.EXAM && DATA.EXAM.total ? DATA.EXAM.total : areas.reduce(function (s, a) { return s + (a.examCount || 0); }, 0);
    var usedId = {}, usedFam = {}, picks = [];

    function take(q, areaId) { usedId[q.id] = true; usedFam[famOf(q)] = true; picks.push({ q: q, area: areaId }); }
    function firstFree(pool, strict) {
      var i;
      for (i = 0; i < pool.length; i++) {
        if (!usedId[pool[i].id] && (!strict || !usedFam[famOf(pool[i])])) { return pool[i]; }
      }
      return null;
    }

    areas.forEach(function (area) {
      var skills = arr(area.skills), want = area.examCount || 0, mine = 0, pool, c;
      pool = shuffled(all.filter(function (q) { return skills.indexOf(q.skill) >= 0; }), rng);
      if (want >= skills.length) {
        skills.forEach(function (sid) {
          c = firstFree(pool.filter(function (q) { return q.skill === sid; }), true);
          if (c && mine < want) { take(c, area.id); mine++; }
        });
      }
      while (mine < want && (c = firstFree(pool, true))) { take(c, area.id); mine++; }
      while (mine < want && (c = firstFree(pool, false))) { take(c, area.id); mine++; }
    });

    /* small banks: fill from any exam item, then any item at all */
    var rest = shuffled(all, rng), c2;
    while (picks.length < total && (c2 = firstFree(rest, true))) { take(c2, areaOf(DATA, c2.skill) || "x"); }
    while (picks.length < total && (c2 = firstFree(rest, false))) { take(c2, areaOf(DATA, c2.skill) || "x"); }
    if (picks.length < total) {
      var any = shuffled(questions(DATA).filter(function (q) { return q.type !== "tap"; }), rng);
      while (picks.length < total && (c2 = firstFree(any, false))) { take(c2, areaOf(DATA, c2.skill) || "x"); }
    }
    picks = picks.slice(0, total);

    /* every week present: swap a duplicated-week pick in the same area for an unused item of the missing week */
    var weeks = arr(DATA && DATA.WEEKS).map(function (w) { return w.week; });
    if (!weeks.length) { weeks = [1, 2, 3, 4]; }
    weeks.forEach(function (w) {
      var have = picks.filter(function (p) { return p.q.week === w; }).length, cands, i, ci, victim;
      if (have > 0) { return; }
      cands = shuffled(all.filter(function (q) { return q.week === w && !usedId[q.id]; }), rng);
      for (ci = 0; ci < cands.length; ci++) {
        var cand = cands[ci], area = areaOf(DATA, cand.skill);
        victim = null;
        for (i = 0; i < picks.length; i++) {
          var pk = picks[i];
          if (pk.area !== area) { continue; }
          var sameSkill = picks.filter(function (p) { return p.q.skill === pk.q.skill; }).length;
          var sameWeek = picks.filter(function (p) { return p.q.week === pk.q.week; }).length;
          if (sameSkill >= 2 && sameWeek >= 2) { victim = i; break; }
        }
        if (victim != null) {
          delete usedId[picks[victim].q.id];
          picks[victim] = { q: cand, area: area };
          usedId[cand.id] = true;
          break;
        }
      }
    });

    return arrange(shuffled(picks, rng), function (p) { return p.area; }).map(function (p) { return p.q.id; });
  }

  function skillWeight(progress, skillId) {
    var m = skillMastery(progress, skillId);
    return m.level === "new" ? 1.5 : 1 + (1 - m.score) * 2;
  }

  function buildPractice(DATA, progress, opts) {
    opts = opts || {};
    var rng = opts.rng || createRng(1), count = opts.count == null ? 10 : opts.count;
    var skills = arr(opts.skills).length ? opts.skills : arr(DATA && DATA.SKILLS).map(function (s) { return s.id; });
    var pool = questions(DATA).filter(function (q) { return skills.indexOf(q.skill) >= 0; });
    var out = [], used = {}, lastSkill = null, cands, min, tier, total, r, i;
    while (out.length < count) {
      cands = pool.filter(function (q) { return !used[q.id]; });
      if (!cands.length) { break; }
      var other = cands.filter(function (q) { return q.skill !== lastSkill; });
      if (other.length) { cands = other; }
      min = Infinity;
      cands.forEach(function (q) { min = Math.min(min, seenOf(progress, q.id)); });
      tier = cands.filter(function (q) { return seenOf(progress, q.id) === min; });
      total = 0;
      tier.forEach(function (q) { total += skillWeight(progress, q.skill); });
      r = rng() * total;
      for (i = 0; i < tier.length; i++) {
        r -= skillWeight(progress, tier[i].skill);
        if (r < 0 || i === tier.length - 1) { break; }
      }
      out.push(tier[i].id); used[tier[i].id] = true; lastSkill = tier[i].skill;
    }
    return out;
  }

  function buildFix(DATA, progress, rng, max) {
    rng = rng || createRng(1);
    max = max == null ? 12 : max;
    var items = obj(obj(progress).items), all = questions(DATA);
    var missed = Object.keys(items).filter(function (id) {
      return (items[id].last === "wrong" || items[id].last === "hint") && getQ(DATA, id);
    });
    missed.sort(function (a, b) {
      var wa = items[a].last === "wrong" ? 0 : 1, wb = items[b].last === "wrong" ? 0 : 1;
      if (wa !== wb) { return wa - wb; }
      return (items[b].at || 0) - (items[a].at || 0);
    });
    missed = missed.slice(0, Math.max(0, Math.floor(max / 2)));
    var missedSet = {}, used = {};
    missed.forEach(function (id) { missedSet[id] = true; used[id] = true; });

    var first = [], later = [];
    shuffled(missed, rng).forEach(function (id) {
      var q = getQ(DATA, id), c = [], sib;
      function ok(x) { return !used[x.id] && !missedSet[x.id] && x.id !== id; }
      function pickFrom(list) {
        var unseen = list.filter(function (x) { return !seenOf(progress, x.id); });
        var pool = unseen.length ? unseen : list;
        return pool.length ? pool[Math.floor(rng() * pool.length)] : null;
      }
      c = all.filter(function (x) { return ok(x) && x.family && x.family === q.family && x.prompt !== q.prompt; });
      sib = pickFrom(c.filter(function (x) { return x.type === q.type; })) || pickFrom(c);
      if (!sib) {
        c = all.filter(function (x) { return ok(x) && x.skill === q.skill && x.prompt !== q.prompt; });
        sib = pickFrom(c.filter(function (x) { return x.type === q.type; })) || pickFrom(c);
      }
      if (sib) { used[sib.id] = true; first.push(sib.id); later.push(id); } else { first.push(id); }
    });
    first = arrange(first, function (id) { var q = getQ(DATA, id); return q ? q.skill : id; });
    return first.concat(shuffled(later, rng)).slice(0, max);
  }

  function buildWarmup(DATA, progress, rng) {
    rng = rng || createRng(1);
    var easy = questions(DATA).filter(function (q) { return isExamOk(q) && diffOf(q) <= 2; });
    var used = {}, out = [];
    function ranked(list) {
      var s = shuffled(list, rng), seenFirst = s.filter(function (q) { return seenOf(progress, q.id) > 0; });
      return seenFirst.concat(s.filter(function (q) { return seenOf(progress, q.id) === 0; }));
    }
    function grab(skillId, n) {
      var got = 0;
      ranked(easy.filter(function (q) { return q.skill === skillId && !used[q.id]; })).forEach(function (q) {
        if (got < n) { used[q.id] = true; out.push(q); got++; }
      });
      return got;
    }
    grab("s4-estar", 3); grab("s1-directions", 2); grab("s2-colors", 2);
    var weak = weakestSkills(progress, DATA, 20), w = 0, k;
    for (k = 0; k < weak.length && w < 3; k++) { w += grab(weak[k], 1); }
    ranked(easy.filter(function (q) { return !used[q.id]; })).forEach(function (q) {
      if (out.length < 10) { used[q.id] = true; out.push(q); }
    });
    return arrange(out.slice(0, 10), function (q) { return q.skill; }).map(function (q) { return q.id; });
  }

  function estarRound(DATA, round) {
    var r = obj(round);
    if (!DATA || typeof DATA.makeEstarQuestion !== "function") { return []; }
    return arr(r.subjects).map(function (s) { return DATA.makeEstarQuestion(s, r.place); });
  }

  function shuffleChoices(question, rng) {
    rng = rng || createRng(1);
    var q = obj(question), choices = arr(q.choices), n = choices.length, order = [], i;
    for (i = 0; i < n; i++) { order.push(i); }
    order = shuffled(order, rng);
    var art = arr(q.choiceArt);
    return {
      choices: order.map(function (o) { return choices[o]; }),
      choiceArt: art.length ? order.map(function (o) { return art[o]; }) : null,
      answer: n ? order.indexOf(q.answer) : -1,
      order: order
    };
  }

  function scoreRun(answers, DATA) {
    var list = arr(answers).filter(function (a) { return a && a.qid; });
    var res = { total: list.length, firstTry: 0, pct: 0, corrected: 0, hinted: 0, byArea: {}, bySkill: {}, missed: [] };
    list.forEach(function (a) {
      var q = getQ(DATA, a.qid), skill = a.skill || (q && q.skill), area = areaOf(DATA, skill) || "other";
      var good = !!a.firstCorrect && !a.hintUsed;
      if (good) { res.firstTry++; } else { res.missed.push(a.qid); }
      if (a.hintUsed) { res.hinted++; }
      if (!a.firstCorrect && a.correctedAfter) { res.corrected++; }
      res.byArea[area] = res.byArea[area] || { right: 0, total: 0 };
      res.byArea[area].total++; if (good) { res.byArea[area].right++; }
      res.bySkill[skill] = res.bySkill[skill] || { right: 0, total: 0 };
      res.bySkill[skill].total++; if (good) { res.bySkill[skill].right++; }
    });
    res.pct = res.total ? Math.round(res.firstTry / res.total * 100) : 0;
    return res;
  }

  var API = {
    createRng: createRng, newProgress: newProgress, recordAnswer: recordAnswer, skillMastery: skillMastery,
    weakestSkills: weakestSkills, buildDiagnostic: buildDiagnostic, buildExam: buildExam, buildPractice: buildPractice,
    buildFix: buildFix, buildWarmup: buildWarmup, estarRound: estarRound, shuffleChoices: shuffleChoices, scoreRun: scoreRun,
    shuffled: shuffled, areaOf: areaOf, getQuestion: getQ
  };
  if (typeof module !== "undefined" && module.exports) { module.exports = API; }
  if (typeof window !== "undefined") { window.SU_ENGINE = API; }
})();
