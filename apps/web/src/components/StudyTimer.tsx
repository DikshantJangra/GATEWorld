"use client";

import { useEffect, useState } from "react";
import {
  RiCollapseDiagonalLine,
  RiExpandDiagonalLine,
  RiPauseFill,
  RiPlayFill,
  RiRestartLine,
} from "react-icons/ri";

const DEFAULT = { focus: 25 * 60, break: 5 * 60 };
type Phase = keyof typeof DEFAULT;
export type View = "split" | "full" | "mini";
const R = 26;
const C = 2 * Math.PI * R;
const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/** Pomodoro: 25 focus / 5 break, auto-rolls into the next phase. Stays mounted in every view so the clock keeps running. */
export function StudyTimer({
  view,
  onExpand,
  onRestore,
}: {
  view: View;
  onExpand: () => void;
  onRestore: () => void;
}) {
  const [s, setS] = useState<{
    phase: Phase;
    left: number;
    endAt: number | null;
    done: number;
    len: Record<Phase, number>;
  }>({
    phase: "focus",
    left: DEFAULT.focus,
    endAt: null,
    done: 0,
    len: DEFAULT,
  });

  useEffect(() => {
    if (!s.endAt) return;
    const id = setInterval(
      () =>
        setS((c) => {
          if (!c.endAt) return c;
          const left = Math.ceil((c.endAt - Date.now()) / 1000); // wall-clock, so background-tab throttling doesn't drift
          if (left > 0) return left === c.left ? c : { ...c, left };
          const phase: Phase = c.phase === "focus" ? "break" : "focus";
          return {
            ...c,
            phase,
            left: c.len[phase],
            endAt: Date.now() + c.len[phase] * 1000,
            done: c.done + (c.phase === "focus" ? 1 : 0),
          };
        }),
      250,
    );
    return () => clearInterval(id);
  }, [s.endAt]);

  const running = s.endAt !== null;
  const toggle = () =>
    setS((c) => ({ ...c, endAt: c.endAt ? null : Date.now() + c.left * 1000 }));
  const reset = () =>
    setS((c) => ({ ...c, phase: "focus", left: c.len.focus, endAt: null }));
  const fresh = !running && s.left === s.len[s.phase]; // untouched clock: only then are lengths editable
  const setMins = (phase: Phase, m: number) => {
    if (!(m >= 1 && m <= 180)) return;
    setS((c) => ({
      ...c,
      len: { ...c.len, [phase]: Math.round(m) * 60 },
      ...(c.phase === phase && !c.endAt ? { left: Math.round(m) * 60 } : {}),
    }));
  };

  if (view === "mini")
    return (
      <div
        key="mini"
        className="group relative flex h-full min-h-16 items-center justify-center gap-3 px-4 py-3 sm:flex-col sm:px-6 animate-[pillfade_450ms_ease-out]"
      >
        <button
          onClick={onExpand}
          aria-label="Focus on study timer"
          className="absolute right-8 top-4 text-white/70 hover:text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100"
        >
          <RiExpandDiagonalLine className="text-sm" />
        </button>
        <button onClick={onRestore} aria-label="Show study timer" className="text-xl font-medium tabular-nums text-white">
          {mmss(s.left)}
        </button>
        <button
          onClick={toggle}
          aria-label={running ? "Pause timer" : "Start timer"}
          className="grid h-11 w-11 place-items-center rounded-full bg-white text-black transition hover:bg-zinc-200 active:scale-95"
        >
          {running ? <RiPauseFill className="text-lg" /> : <RiPlayFill className="text-lg ml-0.5" />}
        </button>
      </div>
    );

  const full = view === "full";
  return (
    <div
      key={view}
      className={`relative flex h-full items-center gap-4 p-3 pr-5 animate-[pillfade_450ms_ease-out] ${
        full ? "justify-center gap-8 py-6" : ""
      }`}
    >
      <button
        onClick={full ? onRestore : onExpand}
        aria-label={full ? "Show music player" : "Focus on study timer"}
        className="absolute right-7 top-4 text-white/50 hover:text-white"
      >
        {full ? <RiCollapseDiagonalLine className="text-sm" /> : <RiExpandDiagonalLine className="text-sm" />}
      </button>

      {/* Circular Progress Gauge */}
      <div className={`relative shrink-0 ${full ? "h-28 w-28" : "h-16 w-16"}`}>
        <svg viewBox="0 0 64 64" className="-rotate-90">
          <circle cx="32" cy="32" r={R} fill="none" stroke="currentColor" strokeOpacity={0.2} strokeWidth={4} />
          <circle
            cx="32"
            cy="32"
            r={R}
            fill="none"
            stroke="currentColor"
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - s.left / s.len[s.phase])}
            className="transition-[stroke-dashoffset] duration-300 text-white"
          />
        </svg>
        <span className={`absolute inset-0 grid place-items-center text-white/80 font-mono ${full ? "text-base font-bold" : "text-xs font-semibold"}`}>
          {s.done}
        </span>
      </div>

      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wider text-white/70 font-semibold">
          {s.phase === "focus" ? "Study Session" : "Break Time"}
        </div>
        <div className={`font-bold leading-tight tabular-nums font-mono text-white ${full ? "text-5xl my-1" : "text-3xl"}`}>
          {mmss(s.left)}
        </div>
        <div className="flex items-center gap-2 text-xs text-white/60">
          {!fresh && (
            <button onClick={reset} className="flex items-center gap-1 hover:text-white transition-colors">
              <RiRestartLine className="text-xs" />
              <span>Reset</span>
            </button>
          )}
          {fresh &&
            (["focus", "break"] as const).map((ph) => (
              <label key={ph} className="flex items-center gap-1">
                <span>{ph === "focus" ? "Study" : "Break"}:</span>
                <input
                  type="number"
                  min={1}
                  max={180}
                  defaultValue={s.len[ph] / 60}
                  onChange={(e) => setMins(ph, e.target.valueAsNumber)}
                  aria-label={`${ph} minutes`}
                  className="w-10 rounded-lg bg-white/10 px-1 text-center text-white tabular-nums outline-none font-mono"
                />
                <span className="text-[10px]">m</span>
              </label>
            ))}
        </div>
      </div>

      <button
        onClick={toggle}
        aria-label={running ? "Pause timer" : "Start timer"}
        className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white text-black transition hover:bg-zinc-200 active:scale-95 shadow-md"
      >
        {running ? <RiPauseFill className="text-2xl" /> : <RiPlayFill className="text-2xl ml-0.5" />}
      </button>
    </div>
  );
}
