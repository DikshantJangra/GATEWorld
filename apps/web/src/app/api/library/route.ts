import { connection } from "next/server";
import { read } from "@/server/library";

/** Public: approved items plus the site default wallpaper. */
export async function GET() {
  await connection(); // read per request, never at build time
  const db = await read();
  return Response.json(
    { items: db.items.filter((i) => i.status === "approved"), defaultWallpaper: db.defaultWallpaper },
    { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=600" } },
  );
}
