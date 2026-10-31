"use client";

import { useEffect, useState } from "react";
import { preload } from "react-dom";
import { Scene } from "@/components/Scene";
import { useLibrary } from "@/library/client";
import { cacheLibraryImage, getBlob } from "@/wallpapers/cache";
import { DEFAULT_WALLPAPERS } from "@/wallpapers/defaults";
import { type Choice, useWallpaper } from "@/wallpapers/store";

const keyOf = (c: Choice) => (c.src === "file" ? c.url : c.src === "scene" ? "scene" : c.id);

/** Resolves a choice to a URL, preferring the on-device copy so there is no network wait. */
function useSrc(c: Choice) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let dead = false;
    let obj: string | null = null;
    (async () => {
      if (c.src === "file") return setUrl(c.url);
      if (c.src !== "local" && c.src !== "library") return;
      const blob = await getBlob(c.src === "local" ? c.id : `lib-${c.file}`);
      if (dead) return;
      if (blob) setUrl((obj = URL.createObjectURL(blob)));
      else if (c.src === "library") {
        setUrl(`/api/library/img/${c.file}`);
        cacheLibraryImage(c.file);
      }
    })();
    return () => {
      dead = true;
      if (obj) URL.revokeObjectURL(obj);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyOf(c)]);
  return url;
}

/** Order: the user's pick, then the site default from the library, then the fixed first default image. */
export function Wallpaper() {
  const [ready, setReady] = useState(false);
  const choice = useWallpaper((s) => s.choice);
  const lib = useLibrary();
  useEffect(() => {
    Promise.resolve(useWallpaper.persist.rehydrate()).then(() => setReady(true));
  }, []);

  const site = lib.items.find((i) => i.id === lib.defaultWallpaper);
  const eff: Choice =
    choice ?? (site?.file && site.lqip ? { src: "library", id: site.id, file: site.file, lqip: site.lqip } : DEFAULT_WALLPAPERS[0].choice);

  if (!ready) return <div className="absolute inset-0 bg-[#1a1411]" />;
  return eff.src === "scene" ? <Scene /> : <Photo key={keyOf(eff)} choice={eff} />;
}

function Photo({ choice }: { choice: Choice }) {
  const url = useSrc(choice);
  if (choice.src === "file") preload(choice.small ?? choice.url, { as: "image", fetchPriority: "high" });
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const lqip = "lqip" in choice ? choice.lqip : undefined;
  if (failed) return <Scene />;
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#1a1411]">
      {lqip && <div className="absolute inset-0 scale-110 bg-cover bg-center blur-2xl" style={{ backgroundImage: `url(${lqip})` }} />}
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          srcSet={choice.src === "file" && choice.small ? `${choice.small} 1280w, ${choice.url} 2560w` : undefined}
          sizes="100vw"
          alt=""
          decoding="async"
          fetchPriority="high"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}
