"use client";

import { AddForm } from "@/components/AddForm";
import { NewCycle } from "@/components/NewCycle";
import type { Status } from "@/domain/types";
import { useActiveCycle, useStore } from "@/store";

const options: { value: Status; label: string }[] = [
  { value: "not_started", label: "Not started" },
  { value: "learning", label: "Learning" },
  { value: "done", label: "Done" },
];

export default function Syllabus() {
  const cycle = useActiveCycle();
  const { addSection, removeSection, addTopic, removeTopic, setTopicStatus } = useStore();
  if (!cycle) return <NewCycle />;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Syllabus {cycle.year}</h1>
      {cycle.syllabus.sections.map((s) => (
        <section key={s.id} className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">
              {s.name} {s.priority && <span className="text-xs text-zinc-500">{s.priority}</span>}
            </h2>
            <button onClick={() => removeSection(s.id)} className="text-xs text-zinc-500 hover:text-red-500">Remove section</button>
          </div>
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {s.topics.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-2 py-1.5 text-sm">
                <span className="flex-1">{t.name}</span>
                <select
                  value={cycle.progress[t.id]?.status ?? "not_started"}
                  onChange={(e) => setTopicStatus(t.id, e.target.value as Status)}
                  className="rounded border border-zinc-300 bg-transparent px-1 py-0.5 dark:border-zinc-700"
                >
                  {options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <button onClick={() => removeTopic(t.id)} aria-label={`Remove ${t.name}`} className="text-zinc-400 hover:text-red-500">x</button>
              </li>
            ))}
          </ul>
          <AddForm placeholder="Add a topic" label="Add" onAdd={(n) => addTopic(s.id, n)} />
        </section>
      ))}
      <AddForm placeholder="New section (e.g. Algorithms)" label="Add section" onAdd={addSection} />
    </div>
  );
}
