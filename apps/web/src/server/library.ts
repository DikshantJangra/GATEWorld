import type { Db } from "@/library/types";

// Two backends, picked at runtime: Netlify Blobs when NETLIFY is set, otherwise Cloudflare
// D1 + R2 (bindings DB, LIBRARY_IMG, ADMIN_TOKEN in cloudflare.config.ts).
const onNetlify = () => process.env.NETLIFY === "true";

const cf = async () => (await import("cloudflare:workers")).env;
const blobs = async (name: string) => (await import("@netlify/blobs")).getStore(name);

const fresh = (): Db => ({ items: [], defaultWallpaper: null });

export async function read(): Promise<Db> {
  if (onNetlify()) return ((await (await blobs("library")).get("db", { type: "json" })) as Db | null) ?? fresh();
  const row = await (await cf()).DB.prepare("SELECT data FROM library WHERE id = 1").first<{ data: string }>();
  return row ? JSON.parse(row.data) : fresh();
}

// ponytail: whole library is one JSON value with an optimistic version/etag check.
// Fine for a small moderated library; split into per-item records if it outgrows that.
export async function mutate<T>(fn: (db: Db) => T | Promise<T>): Promise<T> {
  for (let attempt = 0; attempt < 5; attempt++) {
    if (onNetlify()) {
      const store = await blobs("library");
      const cur = await store.getWithMetadata("db", { type: "json" });
      const db = (cur?.data as Db | undefined) ?? fresh();
      const out = await fn(db);
      const w = await store.setJSON("db", db, cur ? { onlyIfMatch: cur.etag } : { onlyIfNew: true });
      if (w.modified) return out;
      continue;
    }
    const { DB } = await cf();
    const row = await DB.prepare("SELECT data, version FROM library WHERE id = 1").first<{ data: string; version: number }>();
    const db: Db = row ? JSON.parse(row.data) : fresh();
    const out = await fn(db);
    const data = JSON.stringify(db);
    const res = row
      ? await DB.prepare("UPDATE library SET data = ?, version = version + 1 WHERE id = 1 AND version = ?").bind(data, row.version).run()
      : await DB.prepare("INSERT OR IGNORE INTO library (id, data, version) VALUES (1, ?, 1)").bind(data).run();
    if (res.meta.changes > 0) return out;
  }
  throw new Error("library busy, retry");
}

export async function saveImage(name: string, bytes: Uint8Array) {
  if (onNetlify()) await (await blobs("images")).set(name, bytes.slice().buffer as ArrayBuffer);
  else await (await cf()).LIBRARY_IMG.put(name, bytes);
}
export async function readImage(name: string): Promise<ArrayBuffer | null> {
  if (onNetlify()) return (await (await blobs("images")).get(name, { type: "arrayBuffer" })) ?? null;
  const obj = await (await cf()).LIBRARY_IMG.get(name);
  return obj ? obj.arrayBuffer() : null;
}
export async function removeImage(name: string) {
  if (onNetlify()) await (await blobs("images")).delete(name).catch(() => {});
  else await (await cf()).LIBRARY_IMG.delete(name).catch(() => {});
}
export async function hashName(bytes: Uint8Array) {
  const d = await crypto.subtle.digest("SHA-256", bytes as Uint8Array<ArrayBuffer>);
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

/** Client IP from the header the platform itself sets (the other one is client-spoofable there). */
export const clientIp = (req: Request) =>
  (onNetlify() ? req.headers.get("x-nf-client-connection-ip") : req.headers.get("cf-connecting-ip")) || "local";

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
  const want = onNetlify() ? process.env.ADMIN_TOKEN : (await cf()).ADMIN_TOKEN;
  if (!want) return null;
  const sha = async (s: string) => new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));
  const [a, b] = await Promise.all([sha(req.headers.get("x-admin-token") ?? ""), sha(want)]);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}
