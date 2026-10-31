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
  const c = JSON.parse(Buffer.from(process.env.NETLIFY_BLOBS_CONTEXT ?? "e30=", "base64").toString());
  info.keys = Object.keys(c);
  info.hasEdge = !!c.edgeURL;
  info.api = c.apiURL;
  for (const [label, base, path] of [
    ["edge", c.edgeURL, `/${c.siteID}/library/db`],
    ["api", c.apiURL ?? "https://api.netlify.com", `/api/v1/blobs/${c.siteID}/library/db`],
  ] as const) {
    const t = Date.now();
    try {
      const r = await fetch(new URL(path, base), { headers: { authorization: `Bearer ${c.token}` }, signal: AbortSignal.timeout(6000), cache: "no-store" });
      info[label] = `${r.status} ${(await r.text()).slice(0, 120)}`;
    } catch (e) {
      info[label] = String(e);
    }
    info[label + "_ms"] = Date.now() - t;
  }
  return Response.json(info);
}
