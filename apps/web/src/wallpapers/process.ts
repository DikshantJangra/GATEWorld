"use client";

const MAX_EDGE = 2560;

/** Downscale to <=2560px WebP (JPEG if WebP is unsupported) plus a ~24px blurred preview. */
export async function prepare(file: Blob): Promise<{ blob: Blob; lqip: string }> {
  if (!file.type.startsWith("image/")) throw new Error("That file is not an image");
  if (file.size > 20_000_000) throw new Error("Image is over 20 MB");
  const bmp = await createImageBitmap(file).catch(() => {
    throw new Error("Could not read that image");
  });
  const draw = (scale: number) => {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(bmp.width * scale));
    c.height = Math.max(1, Math.round(bmp.height * scale));
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    return c;
  };
  const big = draw(Math.min(1, MAX_EDGE / Math.max(bmp.width, bmp.height)));
  const toBlob = (type: string) => new Promise<Blob | null>((r) => big.toBlob(r, type, 0.85));
  let blob = await toBlob("image/webp");
  if (blob?.type !== "image/webp") blob = await toBlob("image/jpeg");
  const lqip = draw(24 / bmp.width).toDataURL("image/jpeg", 0.5);
  bmp.close();
  if (!blob) throw new Error("Could not process that image");
  return { blob, lqip };
}
