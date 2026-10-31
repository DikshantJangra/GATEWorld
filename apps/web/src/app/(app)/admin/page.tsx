"use client";

import { useEffect, useState } from "react";
import type { Db } from "@/library/types";

const btn = "rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900";

export default function Admin() {
  const [token, setToken] = useState("");
  const [db, setDb] = useState<Db | null>(null);
  const [err, setErr] = useState("");

  async function load(t: string) {
    const r = await fetch("/api/admin", { headers: { "x-admin-token": t } });
    if (!r.ok) {
      setDb(null);
      return setErr((await r.json().catch(() => ({}))).error ?? "Failed");
    }
    sessionStorage.setItem("gateworld-admin", t);
    setErr("");
    setDb(await r.json());
  }
  async function act(id: string, action: string) {
    await fetch("/api/admin", { method: "POST", headers: { "x-admin-token": token, "content-type": "application/json" }, body: JSON.stringify({ id, action }) });
    load(token);
  }
  useEffect(() => {
    const t = sessionStorage.getItem("gateworld-admin");
    if (t) {
      queueMicrotask(() => {
        setToken(t);
        load(t);
      });
    }
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Review contributions</h1>
      <div className="flex gap-2">
        <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Admin token" className="rounded border border-zinc-300 bg-transparent px-2 py-1 text-sm dark:border-zinc-700" />
        <button onClick={() => load(token)} className={btn}>Load</button>
      </div>
      {err && <p className="text-sm text-red-500">{err}</p>}
      {db && (
        <ul className="space-y-3">
          {db.items.length === 0 && <li className="text-sm text-zinc-500">Nothing submitted yet.</li>}
          {[...db.items].sort((a, b) => (a.status === b.status ? b.createdAt - a.createdAt : a.status === "pending" ? -1 : 1)).map((i) => (
            <li key={i.id} className="flex items-center gap-3 rounded border border-zinc-300 p-2 text-sm dark:border-zinc-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={i.kind === "wallpaper" ? (i.lqip ?? "") : `https://img.youtube.com/vi/${i.ytId}/default.jpg`} alt="" className="h-14 w-24 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{i.title} {i.id === db.defaultWallpaper && <span className="text-emerald-500">(site default)</span>}</div>
                <div className="truncate text-xs text-zinc-500">
                  {i.kind} · {i.status} · {i.kind === "music" ? `${i.artist ?? ""} · ${i.mood} · ${i.ytId}` : i.credit}
                </div>
              </div>
              <div className="flex gap-1">
                {i.status === "pending" && <button onClick={() => act(i.id, "approve")} className={btn}>Approve</button>}
                {i.kind === "wallpaper" && i.status === "approved" && (
                  <button onClick={() => act(i.id, i.id === db.defaultWallpaper ? "undefault" : "default")} className={btn}>
                    {i.id === db.defaultWallpaper ? "Unset default" : "Set as default"}
                  </button>
                )}
                <button onClick={() => act(i.id, "reject")} className={btn}>{i.status === "pending" ? "Reject" : "Remove"}</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
