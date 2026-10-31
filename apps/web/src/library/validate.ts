export type ImgExt = "jpg" | "png" | "webp";
export const MIME: Record<ImgExt, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

/** Identify an image by its magic bytes, never by the client-claimed type. */
export function sniffImage(b: Uint8Array): ImgExt | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "png";
  const riff = [0x52, 0x49, 0x46, 0x46].every((v, i) => b[i] === v);
  const webp = [0x57, 0x45, 0x42, 0x50].every((v, i) => b[8 + i] === v);
  return riff && webp ? "webp" : null;
}

const YT = /^[\w-]{11}$/;

/** Accepts a bare id or a youtube.com / youtu.be / music.youtube.com link. */
export function parseYouTubeId(input: string): string | null {
  const s = input.trim();
  if (YT.test(s)) return s;
  try {
    const u = new URL(s);
    const host = u.hostname.replace(/^(www|m)\./, "");
    let id = "";
    if (host === "youtu.be") id = u.pathname.slice(1);
    else if (host === "youtube.com" || host === "music.youtube.com")
      id = u.searchParams.get("v") ?? u.pathname.match(/^\/(?:shorts|embed)\/([\w-]{11})/)?.[1] ?? "";
    return YT.test(id) ? id : null;
  } catch {
    return null;
  }
}

export const isLqip = (s: string) => /^data:image\/jpeg;base64,[A-Za-z0-9+/=]{20,4000}$/.test(s);
export const IMG_FILE = /^[a-f0-9]{32}\.(jpg|png|webp)$/;
