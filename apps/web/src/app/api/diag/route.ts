import { connection } from "next/server";
import { getStore } from "@netlify/blobs";

// TEMPORARY diagnostic, removed once Blobs works.
export async function GET() {
  await connection();
  const info: Record<string, unknown> = {
    node: process.version,
    ctx: !!process.env.NETLIFY_BLOBS_CONTEXT,
    netlify: process.env.NETLIFY,
    site: !!process.env.SITE_ID,
  };
  const t = Date.now();
  try {
    const r = await Promise.race([
      getStore("library").get("db", { type: "json" }).then(() => "ok"),
      new Promise((_, rej) => setTimeout(() => rej(new Error("timeout 8s")), 8000)),
    ]);
    info.blobs = r;
  } catch (e) {
    info.blobs = String(e);
  }
  info.ms = Date.now() - t;
  return Response.json(info);
}
