"use client";

import { useEffect, useState } from "react";
import type { Db } from "./types";

const KEY = "gateworld-library";
const empty: Db = { items: [], defaultWallpaper: null };

const cached = (): Db => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "") ?? empty;
  } catch {
    return empty;
  }
};

/** Approved library: last-known copy from localStorage first, then refreshed from the server. */
export function useLibrary(): Db {
  const [db, setDb] = useState<Db>(empty);
  useEffect(() => {
    queueMicrotask(() => setDb(cached()));
    fetch("/api/library")
      .then((r) => r.json())
      .then((d: Db) => {
        setDb(d);
        try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {}
      })
      .catch(() => {});
  }, []);
  return db;
}

export async function contribute(form: FormData) {
  const r = await fetch("/api/library/contribute", { method: "POST", body: form });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error ?? "Submission failed");
}
