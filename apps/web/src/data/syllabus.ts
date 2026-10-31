import type { SyllabusVersion } from "@/domain/types";
import y2027 from "@data/2027/syllabus.json";

// Optional starting points. Never applied automatically; a student chooses one.
// Add a year: create data/<year>/syllabus.json and register it here.
const registry: Record<number, SyllabusVersion> = {
  2027: { year: 2027, sections: y2027.sections as SyllabusVersion["sections"] },
};

export const templateYears = Object.keys(registry).map(Number).sort((a, b) => b - a);
export const getSyllabus = (year: number) => registry[year];
