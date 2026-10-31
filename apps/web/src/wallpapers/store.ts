"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Choice =
  | { src: "scene" }
  | { src: "file"; url: string; small?: string; thumb?: string; lqip?: string }
  | { src: "local"; id: string; lqip: string }
  | { src: "library"; id: string; file: string; lqip: string };

interface Wallpaper {
  /** null = follow the site default */
  choice: Choice | null;
  set: (choice: Choice | null) => void;
}

export const useWallpaper = create<Wallpaper>()(
  persist((set) => ({ choice: null, set: (choice) => set({ choice }) }), { name: "gateworld-wallpaper", version: 1, skipHydration: true }),
);
