"use client";

import { useState } from "react";
import {
  RiCollapseDiagonalLine,
  RiExpandDiagonalLine,
  RiPauseFill,
  RiPlayFill,
  RiSkipBackFill,
  RiSkipForwardFill,
} from "react-icons/ri";
import { Online } from "@/components/LiveBits";
import { StudyTimer, type View } from "@/components/StudyTimer";
import { usePlayer } from "@/music/MusicProvider";
import { MOOD_LABEL, MOODS, type Mood } from "@/music/tracks";

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

type Focus = "split" | "music" | "study";
// column sizing per focus: the zoomed section takes the rest, the other shrinks to an 11rem strip (grid columns animate smoothly)
const COLS: Record<Focus, string> = {
  split: "sm:grid-cols-[3fr_2fr]",
  music: "sm:grid-cols-[1fr_11rem]",
  study: "sm:grid-cols-[11rem_1fr]",
};

/** Landing-page player: music + pomodoro in one pill; either can take over the whole pill. */
export function PillPlayer() {
  const p = usePlayer();
  const { track } = p;
  const [focus, setFocus] = useState<Focus>("split");
  if (!p.hydrated) return null;

  const mv: View | "mini" = focus === "split" ? "split" : focus === "music" ? "full" : "mini";
  const sv: View | "mini" = focus === "split" ? "split" : focus === "study" ? "full" : "mini";
  const cover = track ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`https://img.youtube.com/vi/${track.id}/hqdefault.jpg`} alt="" className="h-16 w-16 shrink-0 rounded-full object-cover" />
  ) : (
    <div className="h-16 w-16 shrink-0 rounded-full bg-white/20" />
  );

  return (
    <div className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-3 px-4">
      <Online />
      <div className={`flex gap-1 text-xs transition-opacity ${focus === "study" ? "pointer-events-none opacity-0" : ""}`}>
        {(Object.keys(MOODS) as Mood[]).map((m) => (
          <button
            key={m}
            onClick={() => p.pickMood(m)}
            className={`rounded-full px-3 py-1 backdrop-blur transition-all ${
              m === p.mood ? "bg-white text-black shadow-sm" : "bg-black/25 text-white/80 hover:bg-black/40"
            }`}
          >
            {MOOD_LABEL[m]}
          </button>
        ))}
      </div>
      <div
        className={`relative grid w-full grid-cols-1 overflow-hidden rounded-[2rem] border border-white/25 bg-white/10 text-white shadow-xl backdrop-blur-xl transition-[max-width,grid-template-columns] duration-500 ease-in-out sm:rounded-full ${
          COLS[focus]
        } ${focus === "split" ? "max-w-4xl" : "max-w-xl"}`}
      >
        <section className="relative min-w-0 overflow-hidden">
          {mv === "mini" ? (
            <div
              key="mini"
              className="group relative flex h-full min-h-20 flex-col items-center justify-center gap-2 overflow-hidden px-4 py-3 animate-[pillfade_450ms_ease-out]"
            >
              {track && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`https://img.youtube.com/vi/${track.id}/hqdefault.jpg`}
                  alt=""
                  className="absolute inset-0 h-full w-full scale-[1.4] object-cover"
                />
              )}
              <button
                onClick={() => setFocus("music")}
                aria-label="Focus on music player"
                className="absolute right-4 top-3 text-white/70 hover:text-white z-10 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100"
              >
                <RiExpandDiagonalLine className="text-sm" />
              </button>
              <button onClick={() => setFocus("split")} aria-label="Show music player" className="absolute inset-0 bg-black/55" />
              <div className="relative flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
                <button
                  onClick={() => p.next(-1)}
                  disabled={!p.canPlay}
                  aria-label="Previous"
                  className="grid h-8 w-8 place-items-center disabled:opacity-40 text-white"
                >
                  <RiSkipBackFill className="text-base" />
                </button>
                <button
                  onClick={p.toggle}
                  disabled={!p.canPlay}
                  aria-label={p.playing ? "Pause" : "Play"}
                  className="grid h-11 w-11 place-items-center rounded-full bg-white text-black disabled:opacity-40"
                >
                  {p.playing ? <RiPauseFill className="text-lg" /> : <RiPlayFill className="text-lg ml-0.5" />}
                </button>
                <button
                  onClick={() => p.next(1)}
                  disabled={!p.canPlay}
                  aria-label="Next"
                  className="grid h-8 w-8 place-items-center disabled:opacity-40 text-white"
                >
                  <RiSkipForwardFill className="text-base" />
                </button>
              </div>
              <input
                type="range"
                aria-label="Seek"
                min={0}
                max={p.duration || 1}
                step={1}
                value={Math.min(p.time, p.duration || 1)}
                onChange={(e) => p.seek(+e.target.value)}
                disabled={!p.canPlay}
                className="relative h-1 w-full accent-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100"
              />
              <div className="relative text-xs tabular-nums text-white/80 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
                {mmss(p.time)} / {mmss(p.duration)}
              </div>
            </div>
          ) : (
            <div key={mv} className="flex h-full items-center gap-4 p-3 pr-6 animate-[pillfade_450ms_ease-out]">
              <button
                onClick={() => setFocus(mv === "full" ? "split" : "music")}
                aria-label={mv === "full" ? "Show study timer" : "Focus on music player"}
                className="absolute right-7 top-4 text-white/50 hover:text-white"
              >
                {mv === "full" ? <RiCollapseDiagonalLine className="text-sm" /> : <RiExpandDiagonalLine className="text-sm" />}
              </button>
              {cover}
              <div className="min-w-0 flex-1">
                <div className="truncate pr-5 font-medium">{track?.title ?? "No tracks"}</div>
                <div className="truncate text-sm text-white/70">{track?.artist}</div>
                <input
                  type="range"
                  aria-label="Seek"
                  min={0}
                  max={p.duration || 1}
                  step={1}
                  value={Math.min(p.time, p.duration || 1)}
                  onChange={(e) => p.seek(+e.target.value)}
                  disabled={!p.canPlay}
                  className="mt-1 h-1 w-full accent-white"
                />
                <div className="text-xs text-white/60 tabular-nums">
                  {mmss(p.time)} / {mmss(p.duration)}
                </div>
              </div>
              <button
                onClick={() => p.next(-1)}
                disabled={!p.canPlay}
                aria-label="Previous"
                className="text-white/80 hover:text-white disabled:opacity-40"
              >
                <RiSkipBackFill className="text-lg" />
              </button>
              <button
                onClick={p.toggle}
                disabled={!p.canPlay}
                aria-label={p.playing ? "Pause" : "Play"}
                className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white text-black transition hover:bg-zinc-200 active:scale-95 disabled:opacity-40"
              >
                {p.playing ? <RiPauseFill className="text-2xl" /> : <RiPlayFill className="text-2xl ml-0.5" />}
              </button>
              <button
                onClick={() => p.next(1)}
                disabled={!p.canPlay}
                aria-label="Next"
                className="text-white/80 hover:text-white disabled:opacity-40"
              >
                <RiSkipForwardFill className="text-lg" />
              </button>
            </div>
          )}
        </section>
        <section className="min-w-0 overflow-hidden border-t border-white/20 sm:border-l sm:border-t-0">
          <StudyTimer view={sv} onExpand={() => setFocus("study")} onRestore={() => setFocus("split")} />
        </section>
      </div>
    </div>
  );
}
