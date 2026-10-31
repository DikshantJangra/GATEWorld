"use client";

import { useEffect, useState } from "react";
import { daysLeft } from "@/domain/derive";
import { useActiveCycle, useStore } from "@/store";

/** Local time plus today's date. Click cycles: date + days left, date only, days only (days need an exam date on the dashboard). */
export function TimeBlock() {
  const [now, setNow] = useState<Date | null>(null);
  const [view, setView] = useState(0); // 0 full, 1 date only, 2 days only
  const cycle = useActiveCycle();
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const t = setInterval(tick, 10_000);
    Promise.resolve(useStore.persist.rehydrate());
    return () => clearInterval(t);
  }, []);
  if (!now) return <div className="invisible text-2xl">0:00<div className="text-sm">0</div></div>;
  const [time, ampm] = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).split(" ");
  const left = daysLeft(cycle?.examDate ?? null, now);
  const date = now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const days = `${left} days to go`;
  return (
    <div className="flex flex-col items-center tabular-nums">
      <div className="text-2xl font-medium leading-none">
        {time}
        <span className="ml-1 text-xs opacity-80">{ampm.toLowerCase()}</span>
      </div>
      <button onClick={() => setView((v) => (v + 1) % 3)} className="mt-1 text-sm font-bold" aria-label="Cycle date view">
        {view !== 2 && date}
        {view === 0 && left !== null && " "}
        {view === 0 && left !== null && <span className="text-red-500">({days})</span>}
        {view === 2 && <span className="text-red-500">{left === null ? "Set exam date in Dashboard" : days}</span>}
      </button>
    </div>
  );
}

/** Heartbeats /api/presence and shows how many are online right now. */
export function Online() {
  const [n, setN] = useState<number | null>(null);
  useEffect(() => {
    let id = "";
    try {
      id = localStorage.getItem("gateworld-pid") ?? crypto.randomUUID();
      localStorage.setItem("gateworld-pid", id);
    } catch {
      id = crypto.randomUUID();
    }
    const beat = () =>
      fetch("/api/presence", { method: "POST", body: JSON.stringify({ id }) })
        .then((r) => r.json())
        .then((d) => setN(d.online))
        .catch(() => {});
    beat();
    const t = setInterval(beat, 20_000);
    return () => clearInterval(t);
  }, []);
  if (n === null) return null;
  return (
    <span className="flex items-center gap-2 text-xs text-white/80 drop-shadow">
      <span className="h-2.5 w-2.5 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]" />
      {n} online
    </span>
  );
}
