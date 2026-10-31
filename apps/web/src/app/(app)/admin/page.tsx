"use client";

import { useEffect, useState } from "react";
import {
  RiCheckLine,
  RiCloseLine,
  RiDeleteBin6Line,
  RiFilter3Line,
  RiFolderMusicLine,
  RiImageLine,
  RiKey2Line,
  RiShieldCheckLine,
  RiStarLine,
} from "react-icons/ri";
import type { Db } from "@/library/types";

export default function Admin() {
  const [token, setToken] = useState("");
  const [db, setDb] = useState<Db | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "wallpaper" | "music">("all");

  async function load(t: string) {
    if (!t.trim()) return;
    setLoading(true);
    try {
      const r = await fetch("/api/admin", { headers: { "x-admin-token": t } });
      if (!r.ok) {
        setDb(null);
        const data = await r.json().catch(() => ({}));
        return setErr(data.error ?? "Authentication failed.");
      }
      sessionStorage.setItem("gateworld-admin", t);
      setErr("");
      setDb(await r.json());
    } catch {
      setErr("Failed to connect to review server.");
    } finally {
      setLoading(false);
    }
  }

  async function act(id: string, action: string) {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "x-admin-token": token, "content-type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
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

  function handleLogout() {
    sessionStorage.removeItem("gateworld-admin");
    setDb(null);
    setToken("");
    setErr("");
  }

  const items = db?.items ?? [];
  const filtered = items.filter((i) => {
    if (filter === "pending") return i.status === "pending";
    if (filter === "approved") return i.status === "approved";
    if (filter === "wallpaper") return i.kind === "wallpaper";
    if (filter === "music") return i.kind === "music";
    return true;
  });

  if (!db) {
    return (
      <div className="mx-auto max-w-md pt-12 pb-16">
        <div className="rounded-2xl border border-white/10 bg-[#141211]/80 p-6 backdrop-blur-xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 border border-white/10 text-white">
              <RiKey2Line className="text-xl" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-white">Admin Authentication</h1>
              <p className="text-xs text-zinc-400">Enter your admin key to access moderation.</p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              load(token);
            }}
            className="space-y-3"
          >
            <div>
              <label className="text-[11px] font-medium text-zinc-400">Admin Key</label>
              <input
                type="password"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter secret admin key..."
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-white/30 font-mono"
              />
            </div>

            {err && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !token.trim()}
              className="w-full rounded-xl bg-white py-2 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-40"
            >
              {loading ? "Verifying..." : "Access Admin Console"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-white">
              Contribution Review
            </h1>
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-mono text-emerald-400">
              Authenticated
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Review, approve, and curate community wallpapers and audio tracks.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition"
        >
          Sign Out
        </button>
      </section>

      {/* Moderation Content */}
      <section className="space-y-4">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: `All (${items.length})` },
              { id: "pending", label: `Pending (${items.filter((i) => i.status === "pending").length})` },
              { id: "approved", label: `Approved (${items.filter((i) => i.status === "approved").length})` },
              { id: "wallpaper", label: "Wallpapers Only" },
              { id: "music", label: "Audio Only" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as typeof filter)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  filter === f.id
                    ? "bg-white text-zinc-950 shadow-md"
                    : "border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Submissions List */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-xs text-zinc-400">
                No contributions match the selected filter.
              </div>
            ) : (
              filtered.map((i) => {
                const isDefault = i.id === db.defaultWallpaper;
                return (
                  <div
                    key={i.id}
                    className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          i.kind === "wallpaper"
                            ? (i.lqip ?? "")
                            : `https://img.youtube.com/vi/${i.ytId}/default.jpg`
                        }
                        alt=""
                        className="h-16 w-24 shrink-0 rounded-xl object-cover bg-zinc-900 border border-white/10"
                      />

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-white">{i.title}</h3>
                          {isDefault && (
                            <span className="rounded-full bg-emerald-500/20 px-2 py-0.2 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
                              Site Default
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                          <span className="capitalize flex items-center gap-1">
                            {i.kind === "wallpaper" ? <RiImageLine /> : <RiFolderMusicLine />}
                            {i.kind}
                          </span>
                          <span>·</span>
                          <span
                            className={`rounded-md px-1.5 py-0.2 text-[10px] font-semibold capitalize ${
                              i.status === "approved"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : i.status === "pending"
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {i.status}
                          </span>
                          <span>·</span>
                          <span className="truncate">
                            {i.kind === "music"
                              ? `${i.artist ?? "Unknown artist"} · ${i.mood}`
                              : `Credit: ${i.credit || "Anonymous"}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {i.status === "pending" && (
                        <button
                          onClick={() => act(i.id, "approve")}
                          className="flex items-center gap-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30"
                        >
                          <RiCheckLine />
                          <span>Approve</span>
                        </button>
                      )}

                      {i.kind === "wallpaper" && i.status === "approved" && (
                        <button
                          onClick={() => act(i.id, isDefault ? "undefault" : "default")}
                          className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white"
                        >
                          <RiStarLine />
                          <span>{isDefault ? "Unset Default" : "Set Site Default"}</span>
                        </button>
                      )}

                      <button
                        onClick={() => act(i.id, "reject")}
                        className="flex items-center gap-1 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20"
                      >
                        <RiCloseLine />
                        <span>{i.status === "pending" ? "Reject" : "Remove"}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
    </div>
  );
}
