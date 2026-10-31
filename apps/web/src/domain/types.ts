export type Priority = "High" | "Med" | "Low";
export type Status = "not_started" | "learning" | "done";
export type PyqState = "no" | "partial" | "done";

export interface Topic {
  id: string;
  name: string;
  priority?: Priority;
}

export interface Section {
  id: string;
  order: number;
  name: string;
  priority?: Priority;
  topics: Topic[];
}

/** Published, immutable syllabus for one exam year. */
export interface SyllabusVersion {
  year: number;
  sections: Section[];
}

export interface TopicProgress {
  status: Status;
  confidence?: 1 | 2 | 3 | 4 | 5;
  pyq: PyqState;
  revisions: string[]; // ISO dates
  notes: string;
}

export interface LogEntry {
  id: string;
  date: string; // ISO date
  hours: number;
  sectionId: string;
  covered: string;
  activity: string;
  notes: string;
}

export interface MockTest {
  id: string;
  date: string;
  source: string;
  score: number;
  max: number;
  minutes?: number;
  weakAreas: string;
  actionItems: string;
}

/**
 * A student's attempt at one exam year. Owns a private copy of the syllabus
 * (editable) plus all progress. Everything shown on the dashboard derives from this.
 */
export interface Cycle {
  id: string;
  year: number;
  examDate: string | null;
  syllabus: SyllabusVersion;
  progress: Record<string, TopicProgress>; // keyed by topic id
  log: LogEntry[];
  mocks: MockTest[];
}
