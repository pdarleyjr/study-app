/* Today's Plan: pure data + pure functions (testable in Node, used by the browser as window.TodaysPlan).
   All times live in the ONE items array below. Nothing else derives times. */
(function (root) {
  "use strict";

  function item(id, start, end, subject, title, task, pages, href, kind) {
    return {
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
    targetFinish: "7:15 PM",
    deadline: "9:00 PM",
    items: [
      item("misfits-213", "12:45", "13:10", "Reading", "The Misfits", "Read pages 213–222", { from: 213, to: 222 }, null, "reading"),
      item("misfits-223", "13:20", "13:45", "Reading", "The Misfits", "Read pages 223–232", { from: 223, to: 232 }, null, "reading"),
      item("religion", "13:55", "14:20", "Religion", "Religion Quest: Sacraments", GUIDE, null, "sacraments-quest/", "guide"),
      item("misfits-233", "14:35", "15:00", "Reading", "The Misfits", "Read pages 233–242", { from: 233, to: 242 }, null, "reading"),
      item("misfits-243", "15:10", "15:35", "Reading", "The Misfits", "Read pages 243–252", { from: 243, to: 252 }, null, "reading"),
      item("math", "15:50", "16:15", "Math", "Fractions: Quick Review", GUIDE, null, "fractions-review/", "guide"),
      item("misfits-253", "16:30", "16:55", "Reading", "The Misfits", "Read pages 253–261", { from: 253, to: 261 }, null, "reading"),
      item("misfits-262", "17:10", "17:35", "Reading", "The Misfits", "Read pages 262–269", { from: 262, to: 269 }, null, "reading"),
      item("wild-robot", "18:00", "18:10", "Reading", "Wild Robot Quest", "Interactive summary + quiz", null, "wild-robot-quest/", "guide"),
      item("science-lab", "18:50", "19:00", "Science", "Science Matter Lab", "10-minute interactive lesson", null, "matter-lab/#lesson", "guide"),
      item("science-challenge", "19:00", "19:15", "Science", "Science Challenge", "Quiz + missed-question corrections", null, "matter-lab/#challenge", "guide")
    ]
  };

  function ms(iso) { return new Date(iso).getTime(); }
  function isExpired(nowMs) { return nowMs >= ms(PLAN.expiresAt); }
  function minutesOf(it) { return Math.round((ms(it.end) - ms(it.start)) / 60000); }
  function pageCount(it) { return it.pages ? it.pages.to - it.pages.from + 1 : 0; }
  function totalPages() { return PLAN.items.reduce(function (n, it) { return n + pageCount(it); }, 0); }
  function isDone(it, doneMap) { return !!(doneMap && doneMap[it.id]); }
  function nextItem(nowMs, doneMap) {
    for (var i = 0; i < PLAN.items.length; i++) if (!isDone(PLAN.items[i], doneMap)) return PLAN.items[i];
    return null;
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
    statusOf: statusOf, nextItem: nextItem, formatTime: formatTime, guideId: guideId
  };
  if (typeof module !== "undefined" && module.exports) module.exports = API; else root.TodaysPlan = API;
})(typeof window !== "undefined" ? window : this);
