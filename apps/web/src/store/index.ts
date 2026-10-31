"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getSyllabus } from "@/data/syllabus";
import type { Cycle, Status } from "@/domain/types";

interface State {
  cycles: Record<string, Cycle>;
  activeId: string | null;
  /** Start a cycle for `year`: blank, or a deep copy of a template year's syllabus. */
  createCycle: (year: number, templateYear?: number) => void;
  setExamDate: (date: string | null) => void;
  addSection: (name: string) => void;
  removeSection: (sectionId: string) => void;
  addTopic: (sectionId: string, name: string) => void;
  removeTopic: (topicId: string) => void;
  setTopicStatus: (topicId: string, status: Status) => void;
}

const blank = { pyq: "no", revisions: [], notes: "" } as const;

// ponytail: single localStorage blob. Sync layer (Postgres) replaces persist's storage when added.
export const useStore = create<State>()(
  persist(
    (set, get) => {
      const edit = (fn: (c: Cycle) => Cycle) => {
        const id = get().activeId;
        if (id) set((s) => ({ cycles: { ...s.cycles, [id]: fn(s.cycles[id]) } }));
      };
      const mapSections = (c: Cycle, fn: (s: Cycle["syllabus"]["sections"]) => Cycle["syllabus"]["sections"]): Cycle => ({
        ...c,
        syllabus: { ...c.syllabus, sections: fn(c.syllabus.sections) },
      });

      return {
        cycles: {},
        activeId: null,
        createCycle: (year, templateYear) => {
          const id = crypto.randomUUID();
          const sections = templateYear ? structuredClone(getSyllabus(templateYear).sections) : [];
          const cycle: Cycle = {
            id, year, examDate: null, syllabus: { year, sections }, progress: {}, log: [], mocks: [],
          };
          set((s) => ({ cycles: { ...s.cycles, [id]: cycle }, activeId: id }));
        },
        setExamDate: (examDate) => edit((c) => ({ ...c, examDate })),
        addSection: (name) =>
          edit((c) =>
            mapSections(c, (ss) => [...ss, { id: crypto.randomUUID(), order: ss.length + 1, name, topics: [] }]),
          ),
        removeSection: (sectionId) =>
          edit((c) => {
            const gone = new Set(c.syllabus.sections.find((s) => s.id === sectionId)?.topics.map((t) => t.id));
            const progress = Object.fromEntries(Object.entries(c.progress).filter(([k]) => !gone.has(k)));
            return { ...mapSections(c, (ss) => ss.filter((s) => s.id !== sectionId)), progress };
          }),
        addTopic: (sectionId, name) =>
          edit((c) =>
            mapSections(c, (ss) =>
              ss.map((s) => (s.id === sectionId ? { ...s, topics: [...s.topics, { id: crypto.randomUUID(), name }] } : s)),
            ),
          ),
        removeTopic: (topicId) =>
          edit((c) => {
            const progress = Object.fromEntries(Object.entries(c.progress).filter(([k]) => k !== topicId));
            return { ...mapSections(c, (ss) => ss.map((s) => ({ ...s, topics: s.topics.filter((t) => t.id !== topicId) }))), progress };
          }),
        setTopicStatus: (topicId, status) =>
          edit((c) => ({
            ...c,
            progress: { ...c.progress, [topicId]: { ...blank, ...c.progress[topicId], status } },
          })),
      };
    },
    { name: "gateworld:v1", skipHydration: true },
  ),
);

export const useActiveCycle = () => useStore((s) => (s.activeId ? s.cycles[s.activeId] : null));
