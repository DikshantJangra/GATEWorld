"use client";

import { useEffect, useState } from "react";
import { contribute, useLibrary } from "@/library/client";
import { MOOD_LABEL, MOODS, type Mood } from "@/music/tracks";
import { deleteLocal, getBlob, listLocal, saveLocal, type LocalMeta } from "@/wallpapers/cache";
import { DEFAULT_WALLPAPERS } from "@/wallpapers/defaults";
import { prepare } from "@/wallpapers/process";
import { type Choice, useWallpaper } from "@/wallpapers/store";

const box = "rounded border border-zinc-300 bg-transparent px-2 py-1 text-sm dark:border-zinc-700";
const btn = "rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900";
const activeKey = (c: Choice | null) => (!c ? "default" : c.src === "scene" ? "scene" : c.src === "file" ? c.url : c.id);

export default function LibraryPage() {
  const [tab, setTab] = useState<"wallpaper" | "music">("wallpaper");
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Library</h1>
      <div className="flex gap-2 text-sm">
        {(["wallpaper", "music"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded px-3 py-1 capitalize ${t === tab ? "bg-foreground text-background" : "text-zinc-500"}`}>
            {t === "wallpaper" ? "Wallpapers" : "Music"}
          </button>
        ))}
      </div>
      {tab === "wallpaper" ? <Wallpapers /> : <MusicTab />}
    </div>
  );
}

function Wallpapers() {
  const lib = useLibrary();
  const choice = useWallpaper((s) => s.choice);
  const set = useWallpaper((s) => s.set);
  const [local, setLocal] = useState<LocalMeta[]>([]);
  const [msg, setMsg] = useState("");
  const [url, setUrl] = useState("");
  const [sharing, setSharing] = useState<LocalMeta | null>(null);
  const [title, setTitle] = useState("");
  const [credit, setCredit] = useState("");

  useEffect(() => {
    Promise.resolve(useWallpaper.persist.rehydrate());
    listLocal().then(setLocal);
  }, []);

  const community = lib.items.filter((i) => i.kind === "wallpaper");
  const current = activeKey(choice);

  async function addBlob(src: Blob, name: string) {
    try {
      const { blob, lqip } = await prepare(src);
      const id = await saveLocal(blob, name, lqip);
      setLocal(await listLocal());
      set({ src: "local", id, lqip });
      setMsg("Saved on this device and set as your wallpaper.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    }
  }

  async function addUrl() {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error();
      await addBlob(await r.blob(), url.split("/").pop()?.split("?")[0] || "image");
      setUrl("");
    } catch {
      setMsg("That site does not allow direct download. Save the image and upload it instead.");
    }
  }

  async function submitShare() {
    if (!sharing) return;
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
      setMsg("Thanks. It will appear in the library once approved.");
      setSharing(null);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    }
  }

  const Card = ({ k, label, sub, bg, onUse, extra }: { k: string; label: string; sub?: string; bg?: string; onUse: () => void; extra?: React.ReactNode }) => (
    <div className={`overflow-hidden rounded border ${current === k ? "border-emerald-500" : "border-zinc-300 dark:border-zinc-700"}`}>
      <div className="aspect-video bg-zinc-800 bg-cover bg-center" style={bg ? { backgroundImage: `url(${bg})` } : undefined} />
      <div className="space-y-2 p-2 text-sm">
        <div className="truncate font-medium">{label}</div>
        {sub && <div className="truncate text-xs text-zinc-500">{sub}</div>}
        <div className="flex flex-wrap gap-1">
          <button onClick={onUse} className={btn}>{current === k ? "In use" : "Use"}</button>
          {extra}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <label className={`${btn} cursor-pointer`}>
          Upload image
          <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && addBlob(e.target.files[0], e.target.files[0].name)} />
        </label>
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="or paste an image link" className={`${box} w-64`} />
        <button onClick={addUrl} disabled={!url} className={`${btn} disabled:opacity-40`}>Add</button>
        <button onClick={() => set(null)} className={btn}>{current === "default" ? "Following site default" : "Reset to site default"}</button>
      </div>
      {msg && <p className="text-sm text-zinc-500">{msg}</p>}

      {sharing && (
        <div className="space-y-2 rounded border border-zinc-300 p-3 text-sm dark:border-zinc-700">
          <div className="font-medium">Contribute &quot;{sharing.name}&quot; to the library</div>
          <div className="flex flex-wrap gap-2">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className={box} />
            <input value={credit} onChange={(e) => setCredit(e.target.value)} placeholder="Credit (optional)" className={box} />
            <button onClick={submitShare} className={btn}>Submit</button>
            <button onClick={() => setSharing(null)} className={btn}>Cancel</button>
          </div>
          <p className="text-xs text-zinc-500">Only share images you made or are free to share. Submissions are reviewed before anyone sees them.</p>
        </div>
      )}

      <Section title="Defaults">
        {DEFAULT_WALLPAPERS.map((d) => (
          <Card key={d.id} k={d.choice.src === "file" ? d.choice.url : d.id} label={d.title} bg={d.choice.src === "file" ? d.choice.small ?? d.choice.url : undefined} onUse={() => set(d.choice)} />
        ))}
      </Section>
      <Section title="On this device">
        {local.length === 0 && <p className="text-sm text-zinc-500">Nothing yet. Upload an image above.</p>}
        {local.map((m) => (
          <Card
            key={m.id}
            k={m.id}
            label={m.name}
            bg={m.lqip}
            onUse={() => set({ src: "local", id: m.id, lqip: m.lqip })}
            extra={
              <>
                <button onClick={() => { setSharing(m); setTitle(m.name); }} className={btn}>Contribute</button>
                <button onClick={async () => { await deleteLocal(m.id); if (current === m.id) set(null); setLocal(await listLocal()); }} className={btn}>Delete</button>
              </>
            }
          />
        ))}
      </Section>
      <Section title="Community library">
        {community.length === 0 && <p className="text-sm text-zinc-500">No approved contributions yet.</p>}
        {community.map((i) => (
          <Card
            key={i.id}
            k={i.id}
            label={i.title}
            sub={[i.credit, i.id === lib.defaultWallpaper ? "site default" : ""].filter(Boolean).join(" · ")}
            bg={i.lqip}
            onUse={() => set({ src: "library", id: i.id, file: i.file!, lqip: i.lqip! })}
          />
        ))}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-medium">{title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{children}</div>
    </section>
  );
}

function MusicTab() {
  const lib = useLibrary();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [mood, setMood] = useState<Mood>("josh");
  const [msg, setMsg] = useState("");
  const community = lib.items.filter((i) => i.kind === "music");

  async function submit() {
    try {
      const f = new FormData();
      f.set("kind", "music");
      f.set("url", url);
      f.set("title", title);
      f.set("artist", artist);
      f.set("mood", mood);
      await contribute(f);
      setMsg("Thanks. It will join the playlist once approved.");
      setUrl(""); setTitle(""); setArtist("");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 rounded border border-zinc-300 p-3 text-sm dark:border-zinc-700">
        <div className="font-medium">Suggest a track</div>
        <div className="flex flex-wrap gap-2">
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="YouTube link" className={`${box} w-64`} />
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className={box} />
          <input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Artist" className={box} />
          <select value={mood} onChange={(e) => setMood(e.target.value as Mood)} className={box}>
            {(Object.keys(MOODS) as Mood[]).map((m) => <option key={m} value={m}>{MOOD_LABEL[m]}</option>)}
          </select>
          <button onClick={submit} disabled={!url || !title} className={`${btn} disabled:opacity-40`}>Submit</button>
        </div>
        {msg && <p className="text-xs text-zinc-500">{msg}</p>}
      </div>
      {(Object.keys(MOODS) as Mood[]).map((m) => (
        <section key={m}>
          <h2 className="mb-2 font-medium">{MOOD_LABEL[m]}</h2>
          <ul className="space-y-1 text-sm">
            {MOODS[m].map((t) => <li key={t.id}>{t.title} <span className="text-zinc-500">· {t.artist}</span></li>)}
            {community.filter((i) => i.mood === m).map((i) => (
              <li key={i.id}>{i.title} <span className="text-zinc-500">· {i.artist} · community</span></li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
