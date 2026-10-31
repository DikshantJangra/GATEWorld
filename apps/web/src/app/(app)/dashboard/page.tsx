"use client";

import { coverage, daysLeft, hoursLogged, sectionStats } from "@/domain/derive";
import { NewCycle } from "@/components/NewCycle";
import { useActiveCycle, useStore } from "@/store";

export default function Dashboard() {
  const cycle = useActiveCycle();
  const setExamDate = useStore((s) => s.setExamDate);
  if (!cycle) return <NewCycle />;
  const cov = coverage(cycle);
  const left = daysLeft(cycle.examDate);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">GATE {cycle.year}</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Days left" value={left ?? "-"} />
        <Stat label="Covered" value={`${Math.round(cov.ratio * 100)}%`} />
        <Stat label="Topics done" value={`${cov.done}/${cov.total}`} />
        <Stat label="Hours logged" value={hoursLogged(cycle)} />
      </div>
      <label className="flex items-center gap-3 text-sm">
        Exam date
        <input
          type="date"
          value={cycle.examDate ?? ""}
          onChange={(e) => setExamDate(e.target.value || null)}
          className="rounded border border-zinc-300 bg-transparent px-2 py-1 dark:border-zinc-700"
        />
      </label>
      <section>
        <h2 className="mb-3 font-medium">By section</h2>
        {cycle.syllabus.sections.length === 0 && <p className="text-sm text-zinc-500">No sections yet. Add them under Syllabus.</p>}
        <ul className="space-y-2">
          {sectionStats(cycle).map((s) => (
            <li key={s.id} className="text-sm">
              <div className="flex justify-between">
                <span>{s.name}</span>
                <span className="text-zinc-500">{s.done}/{s.total}</span>
              </div>
              <div className="mt-1 h-1.5 rounded bg-zinc-200 dark:bg-zinc-800">
                <div className="h-full rounded bg-emerald-500" style={{ width: `${s.total ? (s.done / s.total) * 100 : 0}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded border border-zinc-200 p-3 dark:border-zinc-800">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}
