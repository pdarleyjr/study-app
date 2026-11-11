/* Today's Plan: pure data + pure functions (testable in Node, used by the browser as window.TodaysPlan).
   All times live in the ONE items array below. Nothing else derives times. */
(function (root) {
  "use strict";

  function item(id, start, end, subject, title, task, pages, href, kind, presetDone) {
    return {
      presetDone: !!presetDone,
      id: id,
      start: "2026-11-11T" + start + ":00-05:00",
      end: "2026-11-11T" + end + ":00-05:00",
      subject: subject, title: title, task: task, pages: pages, href: href, kind: kind
    };
  }
  var GUIDE = "Homework check + review + quiz";

  var PLAN = {
    id: "2026-11-11",
    storageKey: "studyquest:plan:2026-11-11:v1",
    timeZone: "America/New_York",
    expiresAt: "2026-11-13T00:00:00-05:00",
    targetFinish: "2:40 PM",
    deadline: "9:00 PM",
    /* Updated 11:20 AM: he reads about 20 pages per 25-minute session, so the 57 Misfits pages are 3 sessions.
       Math and the first reading session (pp. 213–232) were finished this morning (presetDone). */
    items: [
      item("misfits-213", "10:00", "10:25", "Reading", "The Misfits", "Read pages 213–232", { from: 213, to: 232 }, null, "reading", true),
      item("math", "10:35", "11:00", "Math", "Fractions: Quick Review", GUIDE, null, "fractions-review/", "guide", true),
      item("religion", "11:15", "11:40", "Religion", "Religion Quest: Sacraments", GUIDE, null, "sacraments-quest/", "guide"),
      item("misfits-233", "12:30", "12:55", "Reading", "The Misfits", "Read pages 233–252", { from: 233, to: 252 }, null, "reading"),
      item("wild-robot", "13:10", "13:20", "Reading", "Wild Robot Quest", "Interactive summary + quiz", null, "wild-robot-quest/", "guide"),
      item("misfits-253", "13:35", "14:00", "Reading", "The Misfits", "Read pages 253–269", { from: 253, to: 269 }, null, "reading"),
      item("science-lab", "14:15", "14:25", "Science", "Science Matter Lab", "10-minute interactive lesson", null, "matter-lab/#lesson", "guide"),
      item("science-challenge", "14:25", "14:40", "Science", "Science Challenge", "Quiz + missed-question corrections", null, "matter-lab/#challenge", "guide")
    ]
  };

  function ms(iso) { return new Date(iso).getTime(); }
  function isExpired(nowMs) { return nowMs >= ms(PLAN.expiresAt); }
  function minutesOf(it) { return Math.round((ms(it.end) - ms(it.start)) / 60000); }
  function pageCount(it) { return it.pages ? it.pages.to - it.pages.from + 1 : 0; }
  function totalPages() { return PLAN.items.reduce(function (n, it) { return n + pageCount(it); }, 0); }
  function isDone(it, doneMap) { return !!(doneMap && doneMap[it.id]); }
  /* Items can be done in any order. Up next = the not-done item happening now, else the next not-done
     item still to start, else the earliest not-done item. */
  function nextItem(nowMs, doneMap) {
    var open = PLAN.items.filter(function (it) { return !isDone(it, doneMap); });
    if (!open.length) return null;
    return open.filter(function (it) { return nowMs >= ms(it.start) && nowMs < ms(it.end); })[0] ||
      open.filter(function (it) { return ms(it.start) > nowMs; })[0] || open[0];
  }
  /* Effective ticks: items finished before the plan was published start ticked (presetDone) unless the child
     unticked them on this device; plus everything ticked on this device. Only current item ids count. */
  function effectiveDone(stored) {
    stored = stored && typeof stored === "object" ? stored : {};
    var done = stored.done && typeof stored.done === "object" ? stored.done : {};
    var undone = stored.undone && typeof stored.undone === "object" ? stored.undone : {};
    var out = {};
    PLAN.items.forEach(function (it) {
      if (done[it.id]) out[it.id] = done[it.id];
      else if (it.presetDone && !undone[it.id]) out[it.id] = "preset";
    });
    return out;
  }
  /* Next stored state after ticking (on=true) or unticking an item. */
  function withTick(stored, id, on, nowMs) {
    stored = stored && typeof stored === "object" ? stored : {};
    var done = Object.assign({}, stored.done || {}), undone = Object.assign({}, stored.undone || {});
    if (on) { done[id] = nowMs; delete undone[id]; } else { delete done[id]; undone[id] = nowMs; }
    return Object.assign({}, stored, { done: done, undone: undone });
  }
  /* "later" = its time passed and it is not done. Show it kindly as "Still to do". */
  function statusOf(it, nowMs, doneMap) {
    if (isDone(it, doneMap)) return "done";
    if (nowMs >= ms(it.end)) return "later";
    if (nowMs >= ms(it.start)) return "now";
    for (var i = 0; i < PLAN.items.length; i++) {
      var o = PLAN.items[i];
      if (isDone(o, doneMap) || ms(o.end) <= nowMs || ms(o.start) <= nowMs) continue;
      return o.id === it.id ? "next" : "upcoming";
    }
    return "upcoming";
  }
  function formatTime(iso) {
    return new Intl.DateTimeFormat("en-US", { timeZone: PLAN.timeZone, hour: "numeric", minute: "2-digit", hour12: true })
      .format(new Date(iso)).replace(/ /g, " ");
  }
  /* Progress id of a guide item, e.g. "matter-lab/#lesson" -> "matter-lab". */
  function guideId(it) { return it.href ? it.href.split("#")[0].replace(/\/$/, "") : null; }

  var API = {
    PLAN: PLAN, isExpired: isExpired, minutesOf: minutesOf, pageCount: pageCount, totalPages: totalPages,
    statusOf: statusOf, nextItem: nextItem, effectiveDone: effectiveDone, withTick: withTick, formatTime: formatTime, guideId: guideId
  };
  if (typeof module !== "undefined" && module.exports) module.exports = API; else root.TodaysPlan = API;
})(typeof window !== "undefined" ? window : this);
