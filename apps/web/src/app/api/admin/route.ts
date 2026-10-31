import { isAdmin, mutate, read, removeImage } from "@/server/library";

const deny = (ok: boolean | null) =>
  ok === null ? Response.json({ error: "ADMIN_TOKEN is not set" }, { status: 503 }) : ok ? null : Response.json({ error: "Wrong token" }, { status: 401 });

export async function GET(req: Request) {
  return deny(await isAdmin(req)) ?? Response.json(await read());
}

/** { id, action: approve | reject | default | undefault } */
export async function POST(req: Request) {
  const bad = deny(await isAdmin(req));
  if (bad) return bad;
  const { id, action } = await req.json().catch(() => ({}));
  return mutate(async (db) => {
    const item = db.items.find((i) => i.id === id);
    if (!item) return Response.json({ error: "Not found" }, { status: 404 });
    if (action === "approve") item.status = "approved";
    else if (action === "default" && item.kind === "wallpaper" && item.status === "approved") db.defaultWallpaper = id;
    else if (action === "undefault") db.defaultWallpaper = null;
    else if (action === "reject") {
      db.items = db.items.filter((i) => i !== item);
      if (db.defaultWallpaper === id) db.defaultWallpaper = null;
      if (item.file) await removeImage(item.file);
    } else return Response.json({ error: "Bad action" }, { status: 400 });
    return Response.json({ ok: true });
  });
}
