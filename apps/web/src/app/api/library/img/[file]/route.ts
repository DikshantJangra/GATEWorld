import { IMG_FILE, MIME, type ImgExt } from "@/library/validate";
import { readImage } from "@/server/library";

// File names are content hashes, so the response can be cached forever.
export async function GET(_req: Request, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params;
  if (!IMG_FILE.test(file)) return new Response("Not found", { status: 404 });
  try {
    const bytes = await readImage(file);
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": MIME[file.split(".")[1] as ImgExt],
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
