import type { Db } from "@/library/types";

// Cloudflare bindings (see wrangler.jsonc): DB = D1, LIBRARY_IMG = R2, ADMIN_TOKEN = secret.
async function bindings() {
  return (await import("cloudflare:workers")).env;
}

const EMPTY: Db = { items: [], defaultWallpaper: null };

export async function read(): Promise<Db> {
  const { DB } = await bindings();
  const row = await DB.prepare("SELECT data FROM library WHERE id = 1").first<{ data: string }>();
  return row ? JSON.parse(row.data) : { ...EMPTY, items: [] };
}

// ponytail: whole library is one JSON row in D1 with an optimistic version check.
// Fine for a small moderated library; split into an items table if it outgrows that.
export async function mutate<T>(fn: (db: Db) => T | Promise<T>): Promise<T> {
  const { DB } = await bindings();
  for (let attempt = 0; attempt < 5; attempt++) {
    const row = await DB.prepare("SELECT data, version FROM library WHERE id = 1").first<{ data: string; version: number }>();
    const db: Db = row ? JSON.parse(row.data) : { ...EMPTY, items: [] };
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
  await (await bindings()).LIBRARY_IMG.put(name, bytes);
}
export async function readImage(name: string) {
  const obj = await (await bindings()).LIBRARY_IMG.get(name);
  return obj ? obj.arrayBuffer() : null;
}
export async function removeImage(name: string) {
  await (await bindings()).LIBRARY_IMG.delete(name).catch(() => {});
}
export async function hashName(bytes: Uint8Array) {
  const d = await crypto.subtle.digest("SHA-256", bytes as Uint8Array<ArrayBuffer>);
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

// ponytail: per-isolate memory, 5 submissions per IP per hour; isolates reset it, so this is
// best-effort. Move to a D1 table if abuse shows up.
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
  const want = (await bindings()).ADMIN_TOKEN;
  if (!want) return null;
  const sha = async (s: string) => new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));
  const [a, b] = await Promise.all([sha(req.headers.get("x-admin-token") ?? ""), sha(want)]);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}
