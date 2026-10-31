import { IMG_FILE, MIME, type ImgExt } from "@/library/validate";
import { isAdmin, read, readImage } from "@/server/library";

// File names are content hashes. Only approved images are public; pending ones need the admin token.
export async function GET(req: Request, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params;
  if (!IMG_FILE.test(file)) return new Response("Not found", { status: 404 });
  const approved = (await read()).items.some((i) => i.file === file && i.status === "approved");
  if (!approved && !(await isAdmin(req))) return new Response("Not found", { status: 404 });
  const bytes = await readImage(file);
  if (!bytes) return new Response("Not found", { status: 404 });
  return new Response(bytes, {
    headers: {
      "Content-Type": MIME[file.split(".")[1] as ImgExt],
      "Cache-Control": approved ? "public, max-age=31536000, immutable" : "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
