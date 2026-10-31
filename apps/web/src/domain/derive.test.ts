import { expect, test } from "vitest";
import { getSyllabus } from "@/data/syllabus";
import { coverage, daysLeft } from "./derive";
import type { Cycle } from "./types";

const cycle = (): Cycle => ({
  id: "c", year: 2027, examDate: null, syllabus: getSyllabus(2027), progress: {}, log: [], mocks: [],
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
