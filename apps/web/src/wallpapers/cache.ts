"use client";

// IndexedDB: image blobs (user uploads + cached library images) and small metadata.
// Blobs and metadata are separate stores so listing never loads image bytes.
const BLOBS = "blobs";
const META = "meta";
const MAX_LIBRARY_CACHED = 20;

export interface LocalMeta { id: string; name: string; lqip: string; at: number }

let opened: Promise<IDBDatabase> | null = null;
const db = () =>
  (opened ??= new Promise((resolve, reject) => {
    const req = indexedDB.open("gateworld-images", 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(BLOBS);
      req.result.createObjectStore(META, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }));

async function run<T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const d = await db();
  return new Promise((resolve, reject) => {
    const req = fn(d.transaction(store, mode).objectStore(store));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export const getBlob = (id: string) => run<Blob | undefined>(BLOBS, "readonly", (s) => s.get(id)).catch(() => undefined);

export async function saveLocal(blob: Blob, name: string, lqip: string) {
  const id = `local-${crypto.randomUUID()}`;
  await run(BLOBS, "readwrite", (s) => s.put(blob, id));
  await run(META, "readwrite", (s) => s.put({ id, name, lqip, at: Date.now() } satisfies LocalMeta));
  return id;
}

export const listLocal = () =>
  run<LocalMeta[]>(META, "readonly", (s) => s.getAll())
    .then((all) => all.filter((m) => m.id.startsWith("local-")).sort((a, b) => b.at - a.at))
    .catch(() => []);

export async function deleteLocal(id: string) {
  await run(BLOBS, "readwrite", (s) => s.delete(id));
  await run(META, "readwrite", (s) => s.delete(id));
}

/** Keep a library image on this device so later loads skip the network. Oldest are pruned past 20. */
export async function cacheLibraryImage(file: string) {
  const id = `lib-${file}`;
  try {
    if (await getBlob(id)) return;
    const r = await fetch(`/api/library/img/${file}`);
    if (!r.ok) return;
    const blob = await r.blob();
    await run(BLOBS, "readwrite", (s) => s.put(blob, id));
    await run(META, "readwrite", (s) => s.put({ id, name: file, lqip: "", at: Date.now() } satisfies LocalMeta));
    const cached = (await run<LocalMeta[]>(META, "readonly", (s) => s.getAll()))
      .filter((m) => m.id.startsWith("lib-"))
      .sort((a, b) => b.at - a.at);
    for (const old of cached.slice(MAX_LIBRARY_CACHED)) await deleteLocal(old.id);
  } catch {}
}
