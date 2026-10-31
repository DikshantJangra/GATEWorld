"use client";

import { useState } from "react";
import {
  RiCloseLine,
  RiCompass3Line,
  RiHeadphoneLine,
  RiMusic2Fill,
  RiPauseFill,
  RiPlayFill,
  RiSkipBackFill,
  RiSkipForwardFill,
  RiTimerLine,
  RiVolumeMuteLine,
  RiVolumeUpLine,
} from "react-icons/ri";
import { StudyTimer } from "@/components/StudyTimer";
import { usePlayer } from "@/music/MusicProvider";
import { useMusic } from "@/music/store";
import { AMBIENCE, MOOD_LABEL, MOODS, type Mood } from "@/music/tracks";

const mmss = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** Floating Island Audio & Pomodoro companion for all app pages. */
export function MiniPlayer() {
  const p = usePlayer();
  const { volume, ambienceId, ambienceVolume, set } = useMusic();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"music" | "pomodoro">("music");

  const ambience = AMBIENCE.find((a) => a.id === ambienceId);
  if (!p.hydrated) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <div className="w-80 sm:w-96 overflow-hidden rounded-3xl border border-white/15 bg-[#14100e]/95 p-5 shadow-2xl backdrop-blur-2xl transition-all animate-[pillfade_200ms_ease-out]">
          {/* Top Bar: Tabs & Close */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex rounded-xl bg-white/5 p-0.5">
              <button
                onClick={() => setTab("music")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                  tab === "music"
                    ? "bg-white text-zinc-950 shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <RiHeadphoneLine />
                <span>Audio</span>
              </button>
              <button
                onClick={() => setTab("pomodoro")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                  tab === "pomodoro"
                    ? "bg-white text-zinc-950 shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <RiTimerLine />
                <span>Pomodoro</span>
              </button>
            </div>

            <button
              onClick={() => setOpen(false)}
              aria-label="Collapse companion"
              className="grid h-7 w-7 place-items-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <RiCloseLine className="text-lg" />
            </button>
          </div>

          {/* TAB 1: MUSIC & AMBIENCE */}
          {tab === "music" && (
            <div className="mt-4 space-y-4">
              {/* Mood Pills */}
              <div className="flex items-center justify-between gap-1">
                {(Object.keys(MOODS) as Mood[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => p.pickMood(m)}
                    className={`flex-1 rounded-xl py-1 text-center text-xs font-medium transition-all ${
                      m === p.mood
                        ? "border border-white/20 bg-white/15 text-white font-semibold"
                        : "text-zinc-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {MOOD_LABEL[m]}
                  </button>
                ))}
              </div>

              {/* Track Info & Artwork */}
              <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3">
                {p.track ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`https://img.youtube.com/vi/${p.track.id}/default.jpg`}
                    alt=""
                    className="h-12 w-16 shrink-0 rounded-xl object-cover border border-white/10"
                  />
                ) : (
                  <div className="grid h-12 w-16 shrink-0 place-items-center rounded-xl bg-white/5 text-zinc-500">
                    <RiMusic2Fill className="text-xl" />
                  </div>
                )}
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="truncate text-xs font-semibold text-white">
                    {p.track?.title ?? `No tracks in ${p.mood}`}
                  </div>
                  <div className="truncate text-[11px] text-zinc-400">
                    {p.track?.artist ?? "Select another mood playlist"}
                  </div>
                </div>
              </div>

              {/* Seek Slider */}
              <div className="space-y-1">
                <input
                  type="range"
                  min={0}
                  max={p.duration || 1}
                  step={1}
                  value={Math.min(p.time, p.duration || 1)}
                  onChange={(e) => p.seek(+e.target.value)}
                  disabled={!p.canPlay}
                  className="h-1 w-full accent-white cursor-pointer"
                />
                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                  <span>{mmss(p.time)}</span>
                  <span>{mmss(p.duration)}</span>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center justify-center gap-4 py-1">
                <button
                  onClick={() => p.next(-1)}
                  disabled={!p.canPlay}
                  aria-label="Previous track"
                  className="grid h-9 w-9 place-items-center rounded-full text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
                >
                  <RiSkipBackFill className="text-base" />
                </button>
                <button
                  onClick={p.toggle}
                  disabled={!p.canPlay}
                  aria-label={p.playing ? "Pause" : "Play"}
                  className="grid h-12 w-12 place-items-center rounded-full bg-white text-zinc-950 shadow-md transition hover:bg-zinc-200 active:scale-95 disabled:opacity-40"
                >
                  {p.playing ? (
                    <RiPauseFill className="text-xl" />
                  ) : (
                    <RiPlayFill className="text-xl ml-0.5" />
                  )}
                </button>
                <button
                  onClick={() => p.next(1)}
                  disabled={!p.canPlay}
                  aria-label="Next track"
                  className="grid h-9 w-9 place-items-center rounded-full text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
                >
                  <RiSkipForwardFill className="text-base" />
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <RiVolumeUpLine className="text-sm shrink-0" />
                <span className="w-12 text-[11px]">Music</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(e) => set({ volume: +e.target.value })}
                  className="flex-1 h-1 accent-white"
                />
              </div>

              {/* Ambience Generator */}
              {AMBIENCE.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="text-[11px] font-medium">Background Ambience</span>
                    <select
                      value={ambienceId ?? ""}
                      onChange={(e) => set({ ambienceId: e.target.value || null })}
                      className="rounded-lg border border-white/10 bg-[#1e1916] px-2 py-1 text-[11px] text-white outline-none"
                    >
                      <option value="">None (Off)</option>
                      {AMBIENCE.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {ambience && (
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span className="w-16 text-[11px]">Ambience</span>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={ambienceVolume}
                        onChange={(e) => set({ ambienceVolume: +e.target.value })}
                        className="flex-1 h-1 accent-white"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: POMODORO CLOCK */}
          {tab === "pomodoro" && (
            <div className="mt-4">
              <StudyTimer view="full" onExpand={() => {}} onRestore={() => {}} />
            </div>
          )}
        </div>
      ) : (
        /* Collapsed Floating Island Pill */
        <button
          onClick={() => setOpen(true)}
          className="group flex items-center gap-2.5 rounded-full border border-white/15 bg-[#14100e]/90 px-3.5 py-2 shadow-2xl backdrop-blur-2xl transition-all hover:border-white/30 hover:scale-[1.02] text-xs"
        >
          {p.playing && p.track ? (
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <RiVolumeUpLine className="text-emerald-400 text-sm animate-pulse" />
              <span className="max-w-[120px] sm:max-w-[180px] truncate font-medium text-white">
                {p.track.title}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-zinc-300">
              <RiHeadphoneLine className="text-base text-zinc-400 group-hover:text-white" />
              <span className="font-medium text-white">Study Beats & Pomodoro</span>
            </div>
          )}

          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-300">
            {p.mood}
          </span>
        </button>
      )}
    </div>
  );
}
