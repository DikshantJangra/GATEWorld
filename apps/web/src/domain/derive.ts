import type { Cycle } from "./types";

const DAY = 86_400_000;

export function daysLeft(examDate: string | null, now = new Date()): number | null {
  if (!examDate) return null;
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.round((Date.parse(examDate) - today) / DAY));
}

export function sectionStats(c: Cycle) {
  return c.syllabus.sections.map((s) => {
    const st = s.topics.map((t) => c.progress[t.id]?.status ?? "not_started");
    return {
      id: s.id,
      name: s.name,
      priority: s.priority,
      total: st.length,
      done: st.filter((x) => x === "done").length,
      learning: st.filter((x) => x === "learning").length,
      notStarted: st.filter((x) => x === "not_started").length,
    };
  });
}

export function coverage(c: Cycle) {
  const rows = sectionStats(c);
  const total = rows.reduce((n, r) => n + r.total, 0);
  const done = rows.reduce((n, r) => n + r.done, 0);
  const learning = rows.reduce((n, r) => n + r.learning, 0);
  return { done, learning, total, ratio: total ? done / total : 0 };
}

export const hoursLogged = (c: Cycle) => (c.log || []).reduce((n, e) => n + (e.hours || 0), 0);

export function pyqStats(c: Cycle) {
  let done = 0;
  let partial = 0;
  let no = 0;
  let total = 0;
  for (const s of c.syllabus.sections) {
    for (const t of s.topics) {
      total++;
      const p = c.progress[t.id]?.pyq ?? "no";
      if (p === "done") done++;
      else if (p === "partial") partial++;
      else no++;
    }
  }
  return { done, partial, no, total, ratio: total ? (done + partial * 0.5) / total : 0 };
}

export function mockStats(c: Cycle) {
  const mocks = c.mocks || [];
  if (mocks.length === 0) return { count: 0, avgPercentage: 0, highestScore: 0, latest: null };
  const sorted = [...mocks].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  const percentages = mocks.map((m) => (m.max ? (m.score / m.max) * 100 : 0));
  const avgPercentage = Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length);
  const highestScore = Math.max(...mocks.map((m) => m.score));
  return { count: mocks.length, avgPercentage, highestScore, latest: sorted[0] };
}

export function studyStreak(c: Cycle): number {
  if (!c.log || c.log.length === 0) return 0;
  const dates = Array.from(new Set(c.log.map((l) => l.date))).sort().reverse();
  if (dates.length === 0) return 0;

  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().slice(0, 10);

  if (dates[0] !== todayStr && dates[0] !== yesterdayStr) return 0;

  let streak = 0;
  let curr = new Date(dates[0]);
  for (const d of dates) {
    const logD = new Date(d);
    const diff = Math.round((curr.getTime() - logD.getTime()) / DAY);
    if (diff === 0 || diff === 1) {
      streak++;
      curr = logD;
    } else {
      break;
    }
  }
  return streak;
}
