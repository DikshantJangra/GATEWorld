"use client";

import { useState } from "react";
import { templateYears } from "@/data/syllabus";
import { useStore } from "@/store";

/** Empty state: the student picks their exam year and starts blank (or from a template). */
export function NewCycle() {
  const createCycle = useStore((s) => s.createCycle);
  const [year, setYear] = useState("");
  const y = Number(year);
  const valid = Number.isInteger(y) && y >= 2000 && y <= 2100;

  return (
    <div className="mx-auto max-w-sm space-y-4 py-10">
      <h1 className="text-2xl font-semibold">Start your plan</h1>
      <p className="text-sm text-zinc-500">Pick your exam year, then build your syllabus yourself.</p>
      <input
        type="number"
        value={year}
        onChange={(e) => setYear(e.target.value)}
        placeholder="Exam year"
        className="w-full rounded border border-zinc-300 bg-transparent px-2 py-1 dark:border-zinc-700"
      />
      <div className="flex flex-col gap-2">
        <button disabled={!valid} onClick={() => createCycle(y)} className="rounded bg-foreground px-3 py-1.5 text-sm text-background disabled:opacity-40">
          Start blank
        </button>
        {templateYears.map((t) => (
          <button key={t} disabled={!valid} onClick={() => createCycle(y, t)} className="rounded border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-zinc-700">
            Start from GATE CS {t} syllabus
          </button>
        ))}
      </div>
    </div>
  );
}
