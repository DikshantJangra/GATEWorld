"use client";

import { DEFAULT_WALLPAPERS } from "@/wallpapers/defaults";
import { useWallpaper } from "@/wallpapers/store";

/** Left-center dots: hover zooms, click picks. The pick is persisted in localStorage. */
export function WallpaperDots() {
  const choice = useWallpaper((s) => s.choice);
  const set = useWallpaper((s) => s.set);
  const active = choice ?? DEFAULT_WALLPAPERS[0].choice;
  const same = (a: typeof active, b: typeof active) => a.src === b.src && (a.src === "file" ? a.url === (b as typeof a).url : a.src === "scene");

  return (
    <div className="absolute left-5 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2.5">
      {DEFAULT_WALLPAPERS.map((w) => {
        const on = same(active, w.choice);
        return (
          <button
            key={w.id}
            title={w.title}
            aria-label={`Wallpaper: ${w.title}`}
            aria-pressed={on}
            onClick={() => set(w.choice)}
            onPointerEnter={() => {
              // warm the cache so the swap is instant
              if (w.choice.src === "file") new Image().src = w.choice.small ?? w.choice.url;
            }}
            className={`group h-2 w-2 overflow-hidden rounded-full transition-all duration-150 hover:scale-[3] hover:ring-1 hover:ring-white/70 ${on ? "bg-white" : "bg-white/40"}`}
          >
            {w.choice.src === "file" && w.choice.thumb && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={w.choice.thumb} alt="" className="h-full w-full scale-100 object-cover opacity-0 transition-all duration-150 group-hover:scale-150 group-hover:opacity-100" />
            )}
          </button>
        );
      })}
    </div>
  );
}
