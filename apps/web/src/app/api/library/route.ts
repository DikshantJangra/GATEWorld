import { read } from "@/server/library";

/** Public: approved items plus the site default wallpaper. */
export async function GET() {
  const db = await read();
  return Response.json(
    { items: db.items.filter((i) => i.status === "approved"), defaultWallpaper: db.defaultWallpaper },
    { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=600" } },
  );
}
