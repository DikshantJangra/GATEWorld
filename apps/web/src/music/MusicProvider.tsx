"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLibrary } from "@/library/client";
import { step } from "./nav";
import { useMusic } from "./store";
import { AMBIENCE, MOODS, type Mood, type Track } from "./tracks";
import { loadYT } from "./youtube";

interface Player {
  hydrated: boolean;
  mood: Mood;
  pickMood: (m: Mood) => void;
  track: Track | undefined;
  playing: boolean;
  canPlay: boolean;
  toggle: () => void;
  next: (dir?: 1 | -1) => void;
  time: number;
  duration: number;
  seek: (sec: number) => void;
}

const Ctx = createContext<Player | null>(null);
export const usePlayer = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("MusicProvider missing");
  return c;
};

/** One YouTube player + ambience loop for the whole app; UIs read it via usePlayer(). */
export function MusicProvider({ children }: { children: React.ReactNode }) {
  const { mood, volume, ambienceId, ambienceVolume, set } = useMusic();
  const [hydrated, setHydrated] = useState(false);
  const [ytReady, setYtReady] = useState(false);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const host = useRef<HTMLDivElement>(null);
  const yt = useRef<any>(null);
  const amb = useRef<HTMLAudioElement>(null);
  const fails = useRef(0);
  const playingRef = useRef(false);
  const onEnded = useRef<() => void>(() => {});
  const onError = useRef<() => void>(() => {});

  const lib = useLibrary();
  // Defaults first, always. Approved community tracks follow.
  const tracks = useMemo(() => {
    const base = MOODS[mood] ?? MOODS.josh;
    const extra: Track[] = lib.items
      .filter((i) => i.kind === "music" && i.ytId && i.mood === mood && !base.some((t) => t.id === i.ytId))
      .map((i) => ({ id: i.ytId!, title: i.title, artist: i.artist }));
    return extra.length ? [...base, ...extra] : base;
  }, [mood, lib.items]);
  const track = tracks[idx];
  const ambience = AMBIENCE.find((a) => a.id === ambienceId);

  useEffect(() => {
    Promise.resolve(useMusic.persist.rehydrate()).then(() => setHydrated(true));
  }, []);

  // ponytail: loops through the list once if every video fails, then stops.
  const next = (dir: 1 | -1 = 1) => { setTime(0); setIdx((i) => step(i, tracks.length, dir)); };
  useEffect(() => {
    playingRef.current = playing;
    onEnded.current = () => {
      if (tracks.length === 1 && track) yt.current?.loadVideoById({ videoId: track.id, startSeconds: track.start ?? 0 });
      else next(1);
    };
    onError.current = () => {
      if (++fails.current >= tracks.length) { fails.current = 0; setPlaying(false); }
      else next(1);
    };
  });

  useEffect(() => {
    if (!hydrated) return;
    let dead = false;
    loadYT().then((YT) => {
      if (dead || !host.current) return;
      const el = document.createElement("div");
      host.current.appendChild(el);
      yt.current = new YT.Player(el, {
        width: "1",
        height: "1",
        playerVars: { playsinline: 1 },
        events: {
          onReady: () => setYtReady(true),
          onStateChange: (e: { data: number }) => {
            setDuration(yt.current?.getDuration?.() ?? 0);
            if (e.data === 1) { fails.current = 0; setPlaying(true); }
            else if (e.data === 2) setPlaying(false);
            else if (e.data === 0) onEnded.current();
          },
          onError: () => onError.current(),
        },
      });
    });
    return () => { dead = true; yt.current?.destroy?.(); yt.current = null; setYtReady(false); };
  }, [hydrated]);

  useEffect(() => {
    if (!ytReady || !playing) return;
    const t = setInterval(() => setTime(yt.current?.getCurrentTime?.() ?? 0), 500);
    return () => clearInterval(t);
  }, [ytReady, playing]);

  useEffect(() => { if (ytReady) yt.current.setVolume(volume * 100); }, [volume, ytReady]);
  useEffect(() => { if (amb.current) amb.current.volume = ambienceVolume; }, [ambienceVolume, ambience, hydrated]);

  useEffect(() => {
    if (!ytReady || !track) return;
    const arg = { videoId: track.id, startSeconds: track.start ?? 0 };
    if (playingRef.current) yt.current.loadVideoById(arg);
    else yt.current.cueVideoById(arg);
    // Keyed on id/start, not the object: a library refresh must not restart the current song.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ytReady, track?.id, track?.start]);

  useEffect(() => {
    const a = amb.current;
    if (!a) return;
    if (ambience) a.play().catch(() => set({ ambienceId: null }));
    else a.pause();
  }, [ambience, set]);

  useEffect(() => {
    if (!("mediaSession" in navigator) || !track) return;
    navigator.mediaSession.metadata = new MediaMetadata({ title: track.title, artist: track.artist ?? "GATEWorld" });
    navigator.mediaSession.setActionHandler("previoustrack", () => next(-1));
    navigator.mediaSession.setActionHandler("nexttrack", () => next(1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track, tracks.length]);

  const value: Player = {
    hydrated,
    mood,
    pickMood: (m) => { set({ mood: m }); setTime(0); setIdx(0); },
    track,
    playing,
    canPlay: ytReady && !!track,
    toggle: () => {
      if (!ytReady || !track) return;
      if (playing) yt.current.pauseVideo();
      else yt.current.playVideo();
    },
    next,
    time,
    duration,
    seek: (sec) => { yt.current?.seekTo(sec, true); setTime(sec); },
  };

  return (
    <Ctx.Provider value={value}>
      <div ref={host} aria-hidden className="pointer-events-none fixed -left-[9999px] h-px w-px overflow-hidden" />
      <audio ref={amb} src={ambience?.src} loop />
      {children}
    </Ctx.Provider>
  );
}
