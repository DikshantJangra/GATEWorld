import { createHash, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Db } from "@/library/types";

const DIR = process.env.DATA_DIR ?? path.join(process.cwd(), ".data");
const DB = path.join(DIR, "library.json");
const IMG = path.join(DIR, "img");

export async function read(): Promise<Db> {
  try {
    return JSON.parse(await readFile(DB, "utf8"));
  } catch {
    return { items: [], defaultWallpaper: null };
  }
}

// ponytail: JSON file plus an in-process queue, so one server instance only.
// Swap for Postgres when the sync layer lands; callers only use read/mutate.
let chain: Promise<unknown> = Promise.resolve();
export function mutate<T>(fn: (db: Db) => T | Promise<T>): Promise<T> {
  const run = chain.then(async () => {
    const db = await read();
    const out = await fn(db);
    await mkdir(DIR, { recursive: true });
    await writeFile(DB + ".tmp", JSON.stringify(db));
    await rename(DB + ".tmp", DB);
    return out;
  });
  chain = run.catch(() => {});
  return run;
}

export async function saveImage(name: string, bytes: Uint8Array) {
  await mkdir(IMG, { recursive: true });
  await writeFile(path.join(IMG, name), bytes);
}
export const readImage = (name: string) => readFile(path.join(IMG, name));
export const removeImage = (name: string) => unlink(path.join(IMG, name)).catch(() => {});
export const hashName = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex").slice(0, 32);

// ponytail: per-instance memory, 5 submissions per IP per hour.
const hits = new Map<string, number[]>();
export function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 3_600_000);
  const over = recent.length >= 5;
  if (!over) recent.push(now);
  hits.set(ip, recent);
  return over;
}

export function isAdmin(req: Request) {
  const want = process.env.ADMIN_TOKEN;
  if (!want) return null; // admin disabled
  const sha = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(sha(req.headers.get("x-admin-token") ?? ""), sha(want));
}
