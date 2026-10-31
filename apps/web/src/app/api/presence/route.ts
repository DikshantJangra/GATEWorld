const TTL = 45_000;
const seen = new Map<string, number>();

// ponytail: in-memory, per server instance. Move to Redis if running more than one instance.
export async function POST(req: Request) {
  const { id } = await req.json().catch(() => ({}));
  const now = Date.now();
  if (typeof id === "string" && id.length <= 64) seen.set(id, now);
  for (const [k, t] of seen) if (now - t > TTL) seen.delete(k);
  return Response.json({ online: seen.size });
}
