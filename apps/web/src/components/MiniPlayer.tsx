"use client";

import { useState } from "react";
import { usePlayer } from "@/music/MusicProvider";
import { useMusic } from "@/music/store";
import { AMBIENCE, MOOD_LABEL, MOODS, type Mood } from "@/music/tracks";

/** Compact floating player for the app pages. */
export function MiniPlayer() {
  const p = usePlayer();
  const { volume, ambienceId, ambienceVolume, set } = useMusic();
  const [open, setOpen] = useState(false);
  const ambience = AMBIENCE.find((a) => a.id === ambienceId);
  if (!p.hydrated) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 text-sm">
      {open ? (
        <div className="w-72 space-y-3 rounded-lg border border-zinc-200 bg-background p-3 shadow-lg dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {(Object.keys(MOODS) as Mood[]).map((m) => (
                <button key={m} onClick={() => p.pickMood(m)} className={`rounded px-2 py-0.5 ${m === p.mood ? "bg-foreground text-background" : "text-zinc-500"}`}>
                  {MOOD_LABEL[m]}
                </button>
              ))}
            </div>
            <button onClick={() => setOpen(false)} aria-label="Collapse player" className="text-zinc-500">x</button>
          </div>
          <div className="min-h-9">
            {p.track ? (
              <>
                <div className="truncate font-medium">{p.track.title}</div>
                <div className="truncate text-xs text-zinc-500">{p.track.artist}</div>
              </>
            ) : (
              <p className="text-xs text-zinc-500">No tracks in {p.mood}.</p>
            )}
          </div>
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => p.next(-1)} disabled={!p.canPlay} aria-label="Previous">Prev</button>
            <button onClick={p.toggle} disabled={!p.canPlay} className="rounded bg-foreground px-3 py-1 text-background disabled:opacity-40">
              {p.playing ? "Pause" : "Play"}
            </button>
            <button onClick={() => p.next(1)} disabled={!p.canPlay} aria-label="Next">Next</button>
          </div>
          <Slider label="Music" value={volume} onChange={(v) => set({ volume: v })} />
          {AMBIENCE.length > 0 && (
            <>
              <select value={ambienceId ?? ""} onChange={(e) => set({ ambienceId: e.target.value || null })} className="w-full rounded border border-zinc-300 bg-transparent px-2 py-1 dark:border-zinc-700">
                <option value="">No ambience</option>
                {AMBIENCE.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
              </select>
              {ambience && <Slider label="Ambience" value={ambienceVolume} onChange={(v) => set({ ambienceVolume: v })} />}
            </>
          )}
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="rounded-full border border-zinc-200 bg-background px-3 py-1.5 shadow dark:border-zinc-800">
          {p.playing && p.track ? p.track.title : "Music"}
        </button>
      )}
    </div>
  );
}

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex items-center gap-2 text-xs text-zinc-500">
      <span className="w-14">{label}</span>
      <input type="range" min={0} max={1} step={0.05} value={value} onChange={(e) => onChange(+e.target.value)} className="flex-1" />
    </label>
  );
}
