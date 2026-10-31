"use client";

import { useEffect, useState } from "react";
import {
  RiAddLine,
  RiCheckLine,
  RiDeleteBin6Line,
  RiFolderMusicLine,
  RiImageAddLine,
  RiImageLine,
  RiLink,
  RiMusic2Line,
  RiPlayFill,
  RiRestartLine,
  RiShareForwardLine,
  RiSparklingLine,
  RiUploadCloud2Line,
  RiVolumeUpLine,
} from "react-icons/ri";
import { contribute, useLibrary } from "@/library/client";
import { usePlayer } from "@/music/MusicProvider";
import { MOOD_LABEL, MOODS, type Mood } from "@/music/tracks";
import { deleteLocal, getBlob, listLocal, saveLocal, type LocalMeta } from "@/wallpapers/cache";
import { DEFAULT_WALLPAPERS } from "@/wallpapers/defaults";
import { prepare } from "@/wallpapers/process";
import { type Choice, useWallpaper } from "@/wallpapers/store";

const activeKey = (c: Choice | null) =>
  !c ? "default" : c.src === "scene" ? "scene" : c.src === "file" ? c.url : c.id;

export default function LibraryPage() {
  const [tab, setTab] = useState<"wallpaper" | "music">("wallpaper");

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-amber-400">
              <RiSparklingLine />
              <span>Study Atmosphere & Media</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Sanctuary Library
            </h1>
            <p className="text-sm text-zinc-400">
              Personalize your study atmosphere with scenic visual wallpapers and curated lo-fi audio beats.
            </p>
          </div>

          {/* Segmented Tab Switcher */}
          <div className="flex rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-md">
            <button
              onClick={() => setTab("wallpaper")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                tab === "wallpaper"
                  ? "bg-white text-zinc-950 shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <RiImageLine className="text-sm" />
              <span>Wallpapers</span>
            </button>
            <button
              onClick={() => setTab("music")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                tab === "music"
                  ? "bg-white text-zinc-950 shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <RiFolderMusicLine className="text-sm" />
              <span>Study Audio</span>
            </button>
          </div>
        </div>
      </section>

      {/* Tab View */}
      {tab === "wallpaper" ? <WallpapersTab /> : <MusicTab />}
    </div>
  );
}

function WallpapersTab() {
  const lib = useLibrary();
  const choice = useWallpaper((s) => s.choice);
  const set = useWallpaper((s) => s.set);
  const [local, setLocal] = useState<LocalMeta[]>([]);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [url, setUrl] = useState("");
  const [sharing, setSharing] = useState<LocalMeta | null>(null);
  const [title, setTitle] = useState("");
  const [credit, setCredit] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.resolve(useWallpaper.persist.rehydrate());
    listLocal().then(setLocal);
  }, []);

  const community = lib.items.filter((i) => i.kind === "wallpaper");
  const current = activeKey(choice);

  async function addBlob(src: Blob, name: string) {
    setLoading(true);
    try {
      const { blob, lqip } = await prepare(src);
      const id = await saveLocal(blob, name, lqip);
      setLocal(await listLocal());
      set({ src: "local", id, lqip });
      setMsg({ text: "Wallpaper successfully saved and activated on this device!", type: "success" });
    } catch (e) {
      setMsg({ text: e instanceof Error ? e.message : "Failed to process image.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function addUrl() {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error();
      await addBlob(await r.blob(), url.split("/").pop()?.split("?")[0] || "image");
      setUrl("");
    } catch {
      setMsg({
        text: "That image host prevents direct downloads. Download it to your device and use 'Upload Image' instead.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  async function submitShare() {
    if (!sharing) return;
    setLoading(true);
    try {
      const blob = await getBlob(sharing.id);
      if (!blob) throw new Error("Image not found on this device");
      const f = new FormData();
      f.set("kind", "wallpaper");
      f.set("title", title || sharing.name);
      f.set("credit", credit);
      f.set("lqip", sharing.lqip);
      f.set("file", blob, "wallpaper.webp");
      await contribute(f);
      setMsg({ text: "Thank you! Your wallpaper will appear in the library once reviewed.", type: "success" });
      setSharing(null);
    } catch (e) {
      setMsg({ text: e instanceof Error ? e.message : "Submission failed.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Upload and Control Bar */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 cursor-pointer rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-zinc-950 shadow-md transition-all hover:bg-zinc-200 active:scale-95">
              <RiUploadCloud2Line className="text-base" />
              <span>Upload Image</span>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => e.target.files?.[0] && addBlob(e.target.files[0], e.target.files[0].name)}
              />
            </label>

            <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 focus-within:border-white/30">
              <RiLink className="text-zinc-500 mr-2 text-xs" />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Or paste image URL..."
                className="w-48 bg-transparent text-xs text-white placeholder-zinc-500 outline-none sm:w-64"
              />
              <button
                onClick={addUrl}
                disabled={!url || loading}
                className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-white/20 disabled:opacity-30"
              >
                Add
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              set(null);
              setMsg({ text: "Reset to default site atmosphere.", type: "success" });
            }}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white"
          >
            <RiRestartLine />
            <span>{current === "default" ? "Using Site Default" : "Reset to Default"}</span>
          </button>
        </div>

        {/* Feedback Message Banner */}
        {msg && (
          <div
            className={`mt-3 flex items-center justify-between rounded-xl px-3 py-2 text-xs ${
              msg.type === "success"
                ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border border-red-500/30 bg-red-500/10 text-red-300"
            }`}
          >
            <span>{msg.text}</span>
            <button onClick={() => setMsg(null)} className="text-zinc-400 hover:text-white">
              <RiCheckLine className="text-sm" />
            </button>
          </div>
        )}
      </section>

      {/* Curated Official Wallpapers */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Curated Sanctuaries</h2>
          <p className="text-xs text-zinc-400">High definition scenic backdrops curated for deep study focus</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DEFAULT_WALLPAPERS.map((d) => {
            const key = d.choice.src === "file" ? d.choice.url : d.id;
            const isCurrent = current === key;
            const bg = d.choice.src === "file" ? d.choice.small ?? d.choice.url : undefined;

            return (
              <div
                key={d.id}
                className={`group relative overflow-hidden rounded-2xl border transition-all ${
                  isCurrent
                    ? "border-emerald-500/70 shadow-lg ring-1 ring-emerald-500/30"
                    : "border-white/10 hover:border-white/25 hover:shadow-md"
                }`}
              >
                <div
                  className="aspect-video w-full bg-zinc-900 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={bg ? { backgroundImage: `url(${bg})` } : undefined}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                <div className="absolute inset-x-0 bottom-0 p-3.5 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <h3 className="truncate text-xs font-semibold text-white">{d.title}</h3>
                    <span className="text-[10px] text-zinc-400">Official preset</span>
                  </div>

                  <button
                    onClick={() => set(d.choice)}
                    className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                      isCurrent
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-white text-zinc-950 shadow hover:bg-zinc-200"
                    }`}
                  >
                    {isCurrent ? "Active" : "Apply"}
                  </button>
                </div>

                {isCurrent && (
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 backdrop-blur-md">
                    <RiCheckLine />
                    <span>In Use</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* On This Device */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Saved on This Device</h2>
          <p className="text-xs text-zinc-400">Wallpapers stored locally in your browser storage</p>
        </div>

        {local.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-xs text-zinc-400">
            No local wallpapers uploaded yet. Upload an image above to customize your study view!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {local.map((m) => {
              const isCurrent = current === m.id;
              return (
                <div
                  key={m.id}
                  className={`group relative overflow-hidden rounded-2xl border transition-all ${
                    isCurrent
                      ? "border-emerald-500/70 shadow-lg ring-1 ring-emerald-500/30"
                      : "border-white/10 hover:border-white/25 hover:shadow-md"
                  }`}
                >
                  <div
                    className="aspect-video w-full bg-zinc-900 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${m.lqip})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  <div className="absolute inset-x-0 bottom-0 p-3.5 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <h3 className="truncate text-xs font-semibold text-white">{m.name}</h3>
                      <span className="text-[10px] text-zinc-400">Local upload</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => set({ src: "local", id: m.id, lqip: m.lqip })}
                        className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition-all ${
                          isCurrent
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-white text-zinc-950 shadow hover:bg-zinc-200"
                        }`}
                      >
                        {isCurrent ? "Active" : "Apply"}
                      </button>
                      <button
                        onClick={() => {
                          setSharing(m);
                          setTitle(m.name);
                        }}
                        className="rounded-xl border border-white/10 bg-white/5 p-1.5 text-zinc-400 hover:text-white hover:bg-white/10"
                        title="Contribute to Community"
                      >
                        <RiShareForwardLine />
                      </button>
                      <button
                        onClick={async () => {
                          await deleteLocal(m.id);
                          if (current === m.id) set(null);
                          setLocal(await listLocal());
                        }}
                        className="rounded-xl border border-white/10 bg-white/5 p-1.5 text-zinc-400 hover:text-red-400 hover:bg-white/10"
                        title="Delete from device"
                      >
                        <RiDeleteBin6Line />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Community Library */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Community Shared</h2>
          <p className="text-xs text-zinc-400">Wallpapers contributed and approved by other GATE aspirants</p>
        </div>

        {community.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-xs text-zinc-400">
            No community contributions available yet. Be the first to share one!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {community.map((i) => {
              const isCurrent = current === i.id;
              return (
                <div
                  key={i.id}
                  className={`group relative overflow-hidden rounded-2xl border transition-all ${
                    isCurrent
                      ? "border-emerald-500/70 shadow-lg ring-1 ring-emerald-500/30"
                      : "border-white/10 hover:border-white/25"
                  }`}
                >
                  <div
                    className="aspect-video w-full bg-zinc-900 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${i.lqip})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  <div className="absolute inset-x-0 bottom-0 p-3.5 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <h3 className="truncate text-xs font-semibold text-white">{i.title}</h3>
                      <span className="text-[10px] text-zinc-400">
                        by {i.credit || "Community member"}
                      </span>
                    </div>

                    <button
                      onClick={() => set({ src: "library", id: i.id, file: i.file!, lqip: i.lqip! })}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                        isCurrent
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-white text-zinc-950 shadow hover:bg-zinc-200"
                      }`}
                    >
                      {isCurrent ? "Active" : "Apply"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* MODAL: Community Contribution */}
      {sharing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md" onClick={() => setSharing(null)} />
          <div className="relative w-full max-w-md rounded-3xl border border-white/15 bg-[#171412] p-6 shadow-2xl backdrop-blur-2xl space-y-4">
            <h3 className="text-base font-semibold text-white">Contribute to Community</h3>
            <p className="text-xs text-zinc-400">
              Share &quot;{sharing.name}&quot; with other GATE students worldwide. Submissions are reviewed before becoming visible.
            </p>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-400">Wallpaper Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Late Night Library in Kyoto"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-white/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-400">Creator / Attribution Credit</label>
                <input
                  value={credit}
                  onChange={(e) => setCredit(e.target.value)}
                  placeholder="e.g. Studio Ghibli, or your name/handle"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-white/30"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSharing(null)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={submitShare}
                disabled={loading}
                className="rounded-xl bg-white px-5 py-2 text-xs font-semibold text-zinc-950 shadow-md hover:bg-zinc-200 disabled:opacity-40"
              >
                Submit for Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MusicTab() {
  const lib = useLibrary();
  const player = usePlayer();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [mood, setMood] = useState<Mood>("josh");
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const community = lib.items.filter((i) => i.kind === "music");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || !title.trim()) return;
    setSubmitting(true);
    try {
      const f = new FormData();
      f.set("kind", "music");
      f.set("url", url);
      f.set("title", title);
      f.set("artist", artist);
      f.set("mood", mood);
      await contribute(f);
      setMsg({ text: "Thank you! Your track suggestion has been sent for review.", type: "success" });
      setUrl("");
      setTitle("");
      setArtist("");
    } catch (e) {
      setMsg({ text: e instanceof Error ? e.message : "Failed to submit track.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Mood Selector Showcase */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(Object.keys(MOODS) as Mood[]).map((m) => {
          const isSelected = player.mood === m;
          return (
            <div
              key={m}
              onClick={() => player.pickMood(m)}
              className={`cursor-pointer rounded-2xl border p-4 transition-all backdrop-blur-md ${
                isSelected
                  ? "border-emerald-500/70 bg-white/[0.08] shadow-lg ring-1 ring-emerald-500/30"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  {MOOD_LABEL[m]}
                </span>
                {isSelected && (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                    <RiVolumeUpLine className="animate-pulse" />
                    <span>Active Mood</span>
                  </span>
                )}
              </div>
              <div className="mt-3 text-lg font-bold text-white capitalize">{m} Playlist</div>
              <p className="mt-1 text-xs text-zinc-400">
                {m === "josh"
                  ? "Energizing rhythms and motivational drive for tough problem-solving."
                  : "Gentle lo-fi and ambient peace for long reading sessions."}
              </p>
              <div className="mt-3 text-[11px] text-zinc-500 font-mono">
                {MOODS[m].length} curated tracks
              </div>
            </div>
          );
        })}
      </section>

      {/* Suggest a Track Form */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md space-y-4">
        <div>
          <h2 className="text-base font-semibold text-white">Suggest a Study Beat</h2>
          <p className="text-xs text-zinc-400">
            Know a fantastic instrumental or focus track on YouTube? Share it with fellow aspirants.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="YouTube Video URL (e.g. https://youtu.be/...)"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-white/30"
            />
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Track Title"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-white/30"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Artist / Channel (Optional)"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-white/30 sm:col-span-2"
            />
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value as Mood)}
              className="rounded-xl border border-white/10 bg-[#1e1a17] px-3 py-2 text-xs text-white outline-none focus:border-white/30"
            >
              {(Object.keys(MOODS) as Mood[]).map((m) => (
                <option key={m} value={m}>
                  {MOOD_LABEL[m]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-zinc-500">
              Only instrumental, lo-fi, or non-distracting tracks are accepted.
            </span>
            <button
              type="submit"
              disabled={submitting || !url || !title}
              className="rounded-xl bg-white px-5 py-2 text-xs font-semibold text-zinc-950 shadow-md hover:bg-zinc-200 active:scale-95 disabled:opacity-40"
            >
              Submit Track
            </button>
          </div>
        </form>

        {msg && (
          <div
            className={`mt-2 rounded-xl px-3 py-2 text-xs ${
              msg.type === "success"
                ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border border-red-500/30 bg-red-500/10 text-red-300"
            }`}
          >
            {msg.text}
          </div>
        )}
      </section>

      {/* Mood Playlists Breakdown */}
      <section className="space-y-6">
        {(Object.keys(MOODS) as Mood[]).map((m) => {
          const list = MOODS[m];
          const comm = community.filter((i) => i.mood === m);

          return (
            <div key={m} className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-white capitalize">{MOOD_LABEL[m]}</h3>
                  <span className="rounded-full bg-white/10 px-2 py-0.2 text-[10px] text-zinc-400">
                    {list.length + comm.length} tracks
                  </span>
                </div>
                <button
                  onClick={() => player.pickMood(m)}
                  className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
                >
                  Play All in {MOOD_LABEL[m]} →
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {list.map((track) => {
                  const isPlayingThis = player.track?.id === track.id && player.playing;
                  return (
                    <div
                      key={track.id}
                      className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs transition-colors hover:border-white/20 hover:bg-white/[0.05]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://img.youtube.com/vi/${track.id}/default.jpg`}
                          alt=""
                          className="h-10 w-14 shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0 space-y-0.5">
                          <div className="truncate font-semibold text-white group-hover:text-emerald-300 transition-colors">
                            {track.title}
                          </div>
                          <div className="truncate text-[11px] text-zinc-400">{track.artist}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (player.mood !== m) player.pickMood(m);
                          if (!player.playing) player.toggle();
                        }}
                        className="ml-2 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
                      >
                        {isPlayingThis ? (
                          <RiVolumeUpLine className="text-emerald-400 animate-pulse" />
                        ) : (
                          <RiPlayFill />
                        )}
                      </button>
                    </div>
                  );
                })}

                {comm.map((item) => (
                  <div
                    key={item.id}
                    className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs transition-colors hover:border-white/20 hover:bg-white/[0.05]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://img.youtube.com/vi/${item.ytId}/default.jpg`}
                        alt=""
                        className="h-10 w-14 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0 space-y-0.5">
                        <div className="truncate font-semibold text-white">{item.title}</div>
                        <div className="truncate text-[11px] text-zinc-400">
                          {item.artist} · <span className="text-amber-400">Community</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
