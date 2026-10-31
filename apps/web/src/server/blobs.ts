// Minimal Netlify Blobs client over plain fetch. The official @netlify/blobs client hangs inside
// the Next.js server handler on Netlify, while direct requests to the same endpoint answer fast.
// Context (edge URL, token, site id) is injected by Netlify in NETLIFY_BLOBS_CONTEXT.
const ctx = () => {
  const raw = process.env.NETLIFY_BLOBS_CONTEXT;
  if (!raw) throw new Error("Netlify Blobs is not available in this environment");
  return JSON.parse(Buffer.from(raw, "base64").toString()) as { uncachedEdgeURL: string; token: string; siteID: string };
};

const call = (store: string, key: string, init: RequestInit & { headers?: Record<string, string> } = {}) => {
  const c = ctx();
  return fetch(new URL(`/${c.siteID}/${store}/${key}`, c.uncachedEdgeURL), {
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
    ...init,
    headers: { authorization: `Bearer ${c.token}`, ...init.headers },
  });
};

/** null when the key does not exist. */
export async function getBlob(store: string, key: string) {
  const r = await call(store, key);
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`blobs get ${r.status}`);
  return { bytes: await r.arrayBuffer(), etag: r.headers.get("etag") };
}

/** Returns false when a precondition (if-match / only-if-new) failed. */
export async function putBlob(store: string, key: string, body: BodyInit, cond?: { ifMatch?: string | null }) {
  const headers: Record<string, string> = { "cache-control": "max-age=0, stale-while-revalidate=60" };
  if (cond) {
    if (cond.ifMatch) headers["if-match"] = cond.ifMatch;
    else headers["if-none-match"] = "*";
  }
  const r = await call(store, key, { method: "PUT", body, headers });
  if (r.status === 412) return false;
  if (!r.ok) throw new Error(`blobs put ${r.status}`);
  return true;
}

export async function deleteBlob(store: string, key: string) {
  const r = await call(store, key, { method: "DELETE" });
  if (!r.ok && r.status !== 404) throw new Error(`blobs delete ${r.status}`);
}
