"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Mood } from "./tracks";

interface MusicPrefs {
  mood: Mood;
  volume: number;
  ambienceId: string | null;
  ambienceVolume: number;
  set: (p: Partial<Omit<MusicPrefs, "set">>) => void;
}

export const useMusic = create<MusicPrefs>()(
  persist(
    (set) => ({
      mood: "josh",
      volume: 0.6,
      ambienceId: null,
      ambienceVolume: 0.4,
      set: (p) => set(p),
    }),
    { name: "gateworld-music", version: 2, migrate: () => ({}) as MusicPrefs, skipHydration: true },
  ),
);
