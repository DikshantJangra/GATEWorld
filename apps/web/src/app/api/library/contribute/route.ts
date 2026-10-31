import type { Item } from "@/library/types";
import { isLqip, parseYouTubeId, sniffImage } from "@/library/validate";
import { MOODS } from "@/music/tracks";
import { clientIp, hashName, limited, mutate, saveImage } from "@/server/library";

const MAX_PENDING = 200;

const err = (error: string, status: number) => Response.json({ error }, { status });
const str = (v: FormDataEntryValue | null, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");

/** Anyone can submit; everything lands as "pending" until an admin approves it. */
export async function POST(req: Request) {
  const ip = clientIp(req);
  if (limited(ip)) return err("Too many submissions. Try again in an hour.", 429);
  if (Number(req.headers.get("content-length") ?? 0) > 3_200_000) return err("Image missing or over 3 MB", 413);
  const f = await req.formData().catch(() => null);
  if (!f) return err("Bad form", 400);
  const kind = f.get("kind");
  const title = str(f.get("title"), 80);
  if (!title) return err("Add a title", 400);
  const base = { status: "pending" as const, createdAt: Date.now(), title };

  if (kind === "music") {
    const ytId = parseYouTubeId(str(f.get("url"), 300));
    const mood = f.get("mood") as keyof typeof MOODS;
    if (!ytId) return err("That is not a YouTube link", 400);
    if (!(mood in MOODS)) return err("Pick Joe or Shant", 400);
    if (Object.values(MOODS).flat().some((t) => t.id === ytId)) return err("Already in the default playlist", 409);
    return mutate((db) => {
      if (db.items.some((i) => i.ytId === ytId)) return err("Already suggested", 409);
      if (db.items.filter((i) => i.status === "pending").length >= MAX_PENDING) return err("Queue is full, try later", 503);
      const item: Item = { ...base, id: ytId, kind: "music", ytId, mood, artist: str(f.get("artist"), 80) };
      db.items.push(item);
      return Response.json({ ok: true, status: "pending" }, { status: 201 });
    });
  }

  if (kind === "wallpaper") {
    const file = f.get("file");
    if (!(file instanceof File) || file.size > 3_000_000) return err("Image missing or over 3 MB", 400);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const ext = sniffImage(bytes);
    const lqip = str(f.get("lqip"), 4100);
    if (!ext) return err("Use a JPG, PNG or WebP image", 415);
    if (!isLqip(lqip)) return err("Bad preview", 400);
    const name = `${await hashName(bytes)}.${ext}`;
    return mutate(async (db) => {
      if (db.items.some((i) => i.file === name)) return err("Already in the library", 409);
      if (db.items.filter((i) => i.status === "pending").length >= MAX_PENDING) return err("Queue is full, try later", 503);
      await saveImage(name, bytes);
      db.items.push({ ...base, id: name.split(".")[0], kind: "wallpaper", file: name, lqip, credit: str(f.get("credit"), 80) });
      return Response.json({ ok: true, status: "pending" }, { status: 201 });
    });
  }
  return err("Unknown kind", 400);
}
