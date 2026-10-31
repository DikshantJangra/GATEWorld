"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getSyllabus } from "@/data/syllabus";
import type { Cycle, LogEntry, MockTest, PyqState, Status } from "@/domain/types";

interface State {
  cycles: Record<string, Cycle>;
  activeId: string | null;
  /** Start a cycle for `year`: blank, or a deep copy of a template year's syllabus. */
  createCycle: (year: number, templateYear?: number) => void;
  setActiveCycle: (id: string) => void;
  deleteCycle: (id: string) => void;
  setExamDate: (date: string | null) => void;
  addSection: (name: string) => void;
  removeSection: (sectionId: string) => void;
  addTopic: (sectionId: string, name: string) => void;
  removeTopic: (topicId: string) => void;
  setTopicStatus: (topicId: string, status: Status) => void;
  setTopicConfidence: (topicId: string, confidence: 1 | 2 | 3 | 4 | 5) => void;
  setTopicPyq: (topicId: string, pyq: PyqState) => void;
  setTopicNotes: (topicId: string, notes: string) => void;
  addTopicRevision: (topicId: string) => void;
  markSectionStatus: (sectionId: string, status: Status) => void;
  addLogEntry: (entry: Omit<LogEntry, "id">) => void;
  removeLogEntry: (id: string) => void;
  addMockTest: (mock: Omit<MockTest, "id">) => void;
  removeMockTest: (id: string) => void;
}

const blank = { pyq: "no", revisions: [], notes: "" } as const;

// ponytail: single localStorage blob. Sync layer (Postgres) replaces persist's storage when added.
export const useStore = create<State>()(
  persist(
    (set, get) => {
      const edit = (fn: (c: Cycle) => Cycle) => {
        const id = get().activeId;
        if (id && get().cycles[id]) {
          set((s) => ({ cycles: { ...s.cycles, [id]: fn(s.cycles[id]) } }));
        }
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
            id,
            year,
            examDate: null,
            syllabus: { year, sections },
            progress: {},
            log: [],
            mocks: [],
          };
          set((s) => ({ cycles: { ...s.cycles, [id]: cycle }, activeId: id }));
        },
        setActiveCycle: (id) => {
          if (get().cycles[id]) {
            set({ activeId: id });
          }
        },
        deleteCycle: (id) => {
          set((s) => {
            const nextCycles = { ...s.cycles };
            delete nextCycles[id];
            const remainingKeys = Object.keys(nextCycles);
            const nextActiveId = s.activeId === id ? (remainingKeys[0] ?? null) : s.activeId;
            return { cycles: nextCycles, activeId: nextActiveId };
          });
        },
        setExamDate: (examDate) => edit((c) => ({ ...c, examDate })),
        addSection: (name) =>
          edit((c) =>
            mapSections(c, (ss) => [...ss, { id: crypto.randomUUID(), order: ss.length + 1, name, topics: [] }]),
          ),
        removeSection: (sectionId) =>
          edit((c) => {
            const gone = new Set(c.syllabus.sections.find((s) => s.id === sectionId)?.topics.map((t) => t.id));
            const progress = Object.fromEntries(Object.entries(c.progress || {}).filter(([k]) => !gone.has(k)));
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
            const progress = Object.fromEntries(Object.entries(c.progress || {}).filter(([k]) => k !== topicId));
            return { ...mapSections(c, (ss) => ss.map((s) => ({ ...s, topics: s.topics.filter((t) => t.id !== topicId) }))), progress };
          }),
        setTopicStatus: (topicId, status) =>
          edit((c) => ({
            ...c,
            progress: { ...c.progress, [topicId]: { ...blank, ...c.progress?.[topicId], status } },
          })),
        setTopicConfidence: (topicId, confidence) =>
          edit((c) => ({
            ...c,
            progress: { ...c.progress, [topicId]: { ...blank, ...c.progress?.[topicId], confidence } },
          })),
        setTopicPyq: (topicId, pyq) =>
          edit((c) => ({
            ...c,
            progress: { ...c.progress, [topicId]: { ...blank, ...c.progress?.[topicId], pyq } },
          })),
        setTopicNotes: (topicId, notes) =>
          edit((c) => ({
            ...c,
            progress: { ...c.progress, [topicId]: { ...blank, ...c.progress?.[topicId], notes } },
          })),
        addTopicRevision: (topicId) =>
          edit((c) => {
            const current = c.progress?.[topicId] ?? { ...blank, status: "learning" };
            const revisions = [...(current.revisions || []), new Date().toISOString()];
            return {
              ...c,
              progress: { ...c.progress, [topicId]: { ...current, revisions } },
            };
          }),
        markSectionStatus: (sectionId, status) =>
          edit((c) => {
            const section = c.syllabus.sections.find((s) => s.id === sectionId);
            if (!section) return c;
            const updatedProgress = { ...(c.progress || {}) };
            for (const t of section.topics) {
              updatedProgress[t.id] = { ...blank, ...updatedProgress[t.id], status };
            }
            return { ...c, progress: updatedProgress };
          }),
        addLogEntry: (entry) =>
          edit((c) => ({
            ...c,
            log: [{ id: crypto.randomUUID(), ...entry }, ...(c.log || [])],
          })),
        removeLogEntry: (id) =>
          edit((c) => ({
            ...c,
            log: (c.log || []).filter((l) => l.id !== id),
          })),
        addMockTest: (mock) =>
          edit((c) => ({
            ...c,
            mocks: [{ id: crypto.randomUUID(), ...mock }, ...(c.mocks || [])],
          })),
        removeMockTest: (id) =>
          edit((c) => ({
            ...c,
            mocks: (c.mocks || []).filter((m) => m.id !== id),
          })),
      };
    },
    { name: "gateworld:v1", skipHydration: true },
  ),
);

export const useActiveCycle = () => useStore((s) => (s.activeId ? s.cycles[s.activeId] : null));
