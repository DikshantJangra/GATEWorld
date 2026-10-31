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
      total: st.length,
      done: st.filter((x) => x === "done").length,
      learning: st.filter((x) => x === "learning").length,
    };
  });
}

export function coverage(c: Cycle) {
  const rows = sectionStats(c);
  const total = rows.reduce((n, r) => n + r.total, 0);
  const done = rows.reduce((n, r) => n + r.done, 0);
  return { done, total, ratio: total ? done / total : 0 };
}

export const hoursLogged = (c: Cycle) => c.log.reduce((n, e) => n + e.hours, 0);
