import { getStore } from "@netlify/blobs";
import type { Db } from "@/library/types";

const fresh = (): Db => ({ items: [], defaultWallpaper: null });
const lib = () => getStore("library");
const imgs = () => getStore("images");

export async function read(): Promise<Db> {
  return ((await lib().get("db", { type: "json" })) as Db | null) ?? fresh();
}

// ponytail: whole library is one JSON blob with an etag check on write.
// Fine for a small moderated library; split into per-item blobs if it outgrows that.
export async function mutate<T>(fn: (db: Db) => T | Promise<T>): Promise<T> {
  const store = lib();
  for (let attempt = 0; attempt < 5; attempt++) {
    const cur = await store.getWithMetadata("db", { type: "json" });
    const db = (cur?.data as Db | undefined) ?? fresh();
    const out = await fn(db);
    const w = await store.setJSON("db", db, cur ? { onlyIfMatch: cur.etag } : { onlyIfNew: true });
    if (w.modified) return out;
  }
  throw new Error("library busy, retry");
}

export async function saveImage(name: string, bytes: Uint8Array) {
  await imgs().set(name, bytes.slice().buffer as ArrayBuffer);
}
export async function readImage(name: string): Promise<ArrayBuffer | null> {
  return (await imgs().get(name, { type: "arrayBuffer" })) ?? null;
}
export const removeImage = (name: string) => imgs().delete(name).catch(() => {});

export async function hashName(bytes: Uint8Array) {
  const d = await crypto.subtle.digest("SHA-256", bytes as Uint8Array<ArrayBuffer>);
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

/** Set by Netlify itself; the client cannot spoof it. */
export const clientIp = (req: Request) => req.headers.get("x-nf-client-connection-ip") || "local";

// ponytail: per-instance memory, 5 submissions per IP per hour; instances reset it, so this is
// best-effort. Move to a shared store if abuse shows up.
const hits = new Map<string, number[]>();
export function limited(ip: string) {
  const now = Date.now();
  for (const [k, v] of hits) if (!v.some((t) => now - t < 3_600_000)) hits.delete(k);
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 3_600_000);
  const over = recent.length >= 5;
  if (!over) recent.push(now);
  hits.set(ip, recent);
  return over;
}

/** null = admin disabled, otherwise whether the token matched. */
export async function isAdmin(req: Request) {
  const want = process.env.ADMIN_TOKEN;
  if (!want) return null;
  const sha = async (s: string) => new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));
  const [a, b] = await Promise.all([sha(req.headers.get("x-admin-token") ?? ""), sha(want)]);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}
