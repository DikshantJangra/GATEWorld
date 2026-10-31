import { deleteBlob, getBlob, putBlob } from "./blobs";
import type { Db } from "@/library/types";

const fresh = (): Db => ({ items: [], defaultWallpaper: null });
const dec = new TextDecoder();

async function load() {
  const b = await getBlob("library", "db");
  return { db: b ? (JSON.parse(dec.decode(b.bytes)) as Db) : fresh(), etag: b?.etag ?? null };
}

export const read = async () => (await load()).db;

// ponytail: whole library is one JSON blob with an etag check on write.
// Fine for a small moderated library; split into per-item blobs if it outgrows that.
export async function mutate<T>(fn: (db: Db) => T | Promise<T>): Promise<T> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const { db, etag } = await load();
    const out = await fn(db);
    if (await putBlob("library", "db", JSON.stringify(db), { ifMatch: etag })) return out;
  }
  throw new Error("library busy, retry");
}

export const saveImage = (name: string, bytes: Uint8Array) => putBlob("images", name, bytes.slice().buffer as ArrayBuffer).then(() => {});
export async function readImage(name: string): Promise<ArrayBuffer | null> {
  return (await getBlob("images", name))?.bytes ?? null;
}
export const removeImage = (name: string) => deleteBlob("images", name).catch(() => {});

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
