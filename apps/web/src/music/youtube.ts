/* eslint-disable @typescript-eslint/no-explicit-any */
let loading: Promise<any> | null = null;

/** Loads the YouTube IFrame API once and resolves with the global YT. */
export function loadYT(): Promise<any> {
  const w = window as any;
  if (w.YT?.Player) return Promise.resolve(w.YT);
  return (loading ??= new Promise((resolve) => {
    w.onYouTubeIframeAPIReady = () => resolve(w.YT);
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(s);
  }));
}
