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
  const tryIt = async (label: string, fn: () => Promise<unknown>) => {
    const t = Date.now();
    try {
      info[label] = await Promise.race([fn().then(() => "ok"), new Promise((_, rej) => setTimeout(() => rej(new Error("timeout 6s")), 6000))]);
    } catch (e) {
      info[label] = String(e);
    }
    info[label + "_ms"] = Date.now() - t;
  };
  await tryIt("default", () => getStore("library").get("db", { type: "json" }));
  await tryIt("strong", () => getStore({ name: "library", consistency: "strong" }).get("db", { type: "json" }));
  await tryIt("rawfetch", () => fetch("https://api.netlify.com/api/v1/", { cache: "no-store" }));
  return Response.json(info);
}
