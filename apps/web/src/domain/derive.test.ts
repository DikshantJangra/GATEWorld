import { expect, test } from "vitest";
import { getSyllabus } from "@/data/syllabus";
import { coverage, daysLeft, mockStats, pyqStats, studyStreak } from "./derive";
import type { Cycle } from "./types";

const cycle = (): Cycle => ({
  id: "c",
  year: 2027,
  examDate: null,
  syllabus: getSyllabus(2027),
  progress: {},
  log: [],
  mocks: [],
});

test("2027 syllabus has 11 sections and 107 topics", () => {
  const c = cycle();
  expect(c.syllabus.sections).toHaveLength(11);
  expect(coverage(c).total).toBe(107);
});

test("coverage counts done topics", () => {
  const c = cycle();
  c.progress[c.syllabus.sections[0].topics[0].id] = { status: "done", pyq: "no", revisions: [], notes: "" };
  expect(coverage(c).done).toBe(1);
});

test("daysLeft", () => {
  expect(daysLeft(null)).toBeNull();
  expect(daysLeft("2027-01-10", new Date(2027, 0, 1))).toBe(9);
  expect(daysLeft("2020-01-01", new Date(2027, 0, 1))).toBe(0);
});

test("pyqStats calculation", () => {
  const c = cycle();
  const t0 = c.syllabus.sections[0].topics[0].id;
  const t1 = c.syllabus.sections[0].topics[1].id;
  c.progress[t0] = { status: "done", pyq: "done", revisions: [], notes: "" };
  c.progress[t1] = { status: "learning", pyq: "partial", revisions: [], notes: "" };

  const stats = pyqStats(c);
  expect(stats.done).toBe(1);
  expect(stats.partial).toBe(1);
  expect(stats.total).toBe(107);
});

test("mockStats calculation", () => {
  const c = cycle();
  c.mocks = [
    { id: "m1", date: "2026-10-01", source: "Made Easy 1", score: 65, max: 100, weakAreas: "OS", actionItems: "Revise Paging" },
    { id: "m2", date: "2026-10-15", source: "Made Easy 2", score: 75, max: 100, weakAreas: "CN", actionItems: "Revise TCP" },
  ];
  const stats = mockStats(c);
  expect(stats.count).toBe(2);
  expect(stats.avgPercentage).toBe(70);
  expect(stats.highestScore).toBe(75);
  expect(stats.latest?.id).toBe("m2");
});
