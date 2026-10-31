"use client";

import { useEffect, useState } from "react";

const DEFAULT = { focus: 25 * 60, break: 5 * 60 };
type Phase = keyof typeof DEFAULT;
export type View = "split" | "full" | "mini";
const R = 26;
const C = 2 * Math.PI * R;
const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/** Pomodoro: 25 focus / 5 break, auto-rolls into the next phase. Stays mounted in every view so the clock keeps running. */
export function StudyTimer({ view, onExpand, onRestore }: { view: View; onExpand: () => void; onRestore: () => void }) {
  const [s, setS] = useState<{ phase: Phase; left: number; endAt: number | null; done: number; len: Record<Phase, number> }>({ phase: "focus", left: DEFAULT.focus, endAt: null, done: 0, len: DEFAULT });

  useEffect(() => {
    if (!s.endAt) return;
    const id = setInterval(() => setS((c) => {
      if (!c.endAt) return c;
      const left = Math.ceil((c.endAt - Date.now()) / 1000); // wall-clock, so background-tab throttling doesn't drift
      if (left > 0) return left === c.left ? c : { ...c, left };
      const phase: Phase = c.phase === "focus" ? "break" : "focus";
      return { ...c, phase, left: c.len[phase], endAt: Date.now() + c.len[phase] * 1000, done: c.done + (c.phase === "focus" ? 1 : 0) };
    }), 250);
    return () => clearInterval(id);
  }, [s.endAt]);

  const running = s.endAt !== null;
  const toggle = () => setS((c) => ({ ...c, endAt: c.endAt ? null : Date.now() + c.left * 1000 }));
  const reset = () => setS((c) => ({ ...c, phase: "focus", left: c.len.focus, endAt: null }));
  const fresh = !running && s.left === s.len[s.phase]; // untouched clock: only then are lengths editable
  const setMins = (phase: Phase, m: number) => {
    if (!(m >= 1 && m <= 180)) return;
    setS((c) => ({ ...c, len: { ...c.len, [phase]: Math.round(m) * 60 }, ...(c.phase === phase && !c.endAt ? { left: Math.round(m) * 60 } : {}) }));
  };

  if (view === "mini")
    return (
      <div key="mini" className="group relative flex h-full min-h-16 items-center justify-center gap-3 px-4 py-3 sm:flex-col sm:px-6 animate-[pillfade_450ms_ease-out]">
        <button onClick={onExpand} aria-label="Focus on study timer" className="absolute right-8 top-4 text-white/70 hover:text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg></button>
        <button onClick={onRestore} aria-label="Show study timer" className="text-xl font-medium tabular-nums">{mmss(s.left)}</button>
        <button onClick={toggle} aria-label={running ? "Pause timer" : "Start timer"} className="grid h-11 w-11 place-items-center rounded-full bg-white text-black">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">{running ? <path d="M6 5h4v14H6zM14 5h4v14h-4z" /> : <path d="M8 5v14l11-7z" />}</svg>
        </button>
      </div>
    );

  const full = view === "full";
  return (
    <div key={view} className={`relative flex h-full items-center gap-4 p-3 pr-5 animate-[pillfade_450ms_ease-out] ${full ? "justify-center gap-8 py-6" : ""}`}>
      <button onClick={full ? onRestore : onExpand} aria-label={full ? "Show music player" : "Focus on study timer"} className="absolute right-7 top-4 text-white/50 hover:text-white">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {full ? <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" /> : <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />}
        </svg>
      </button>
      <div className={`relative shrink-0 ${full ? "h-28 w-28" : "h-16 w-16"}`}>
        <svg viewBox="0 0 64 64" className="-rotate-90">
          <circle cx="32" cy="32" r={R} fill="none" stroke="currentColor" strokeOpacity={0.2} strokeWidth={4} />
          <circle cx="32" cy="32" r={R} fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - s.left / s.len[s.phase])} className="transition-[stroke-dashoffset] duration-300" />
        </svg>
        <span className={`absolute inset-0 grid place-items-center text-white/70 tabular-nums ${full ? "text-base" : "text-xs"}`}>{s.done}</span>
      </div>
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wider text-white/70">{s.phase === "focus" ? "Study session" : "Break"}</div>
        <div className={`font-medium leading-tight tabular-nums ${full ? "text-6xl" : "text-3xl"}`}>{mmss(s.left)}</div>
        <div className="flex items-center gap-2 text-xs text-white/60">
          {fresh ? null : <button onClick={reset} className="hover:text-white">Reset</button>}
          {fresh && (["focus", "break"] as const).map((ph) => (
            <label key={ph} className="flex items-center gap-1">
              {ph === "focus" ? "Study" : "Break"}
              <input type="number" min={1} max={180} defaultValue={s.len[ph] / 60} onChange={(e) => setMins(ph, e.target.valueAsNumber)} aria-label={`${ph} minutes`} className="w-10 rounded bg-white/10 px-1 text-center text-white tabular-nums" />
            </label>
          ))}
        </div>
      </div>
      <button onClick={toggle} aria-label={running ? "Pause timer" : "Start timer"} className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white text-black">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">{running ? <path d="M6 5h4v14H6zM14 5h4v14h-4z" /> : <path d="M8 5v14l11-7z" />}</svg>
      </button>
    </div>
  );
}
