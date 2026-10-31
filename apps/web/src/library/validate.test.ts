import { expect, test } from "vitest";
import { isLqip, parseYouTubeId, sniffImage } from "./validate";

test("sniffImage reads magic bytes", () => {
  expect(sniffImage(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0]))).toBe("jpg");
  expect(sniffImage(Uint8Array.from([0x89, 0x50, 0x4e, 0x47]))).toBe("png");
  expect(sniffImage(Uint8Array.from([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]))).toBe("webp");
  expect(sniffImage(Uint8Array.from([0x3c, 0x73, 0x76, 0x67]))).toBeNull();
});

test("parseYouTubeId handles ids and links, rejects others", () => {
  expect(parseYouTubeId("sSsw7QPrUk0")).toBe("sSsw7QPrUk0");
  expect(parseYouTubeId("https://www.youtube.com/watch?v=sSsw7QPrUk0&t=5")).toBe("sSsw7QPrUk0");
  expect(parseYouTubeId("https://youtu.be/sSsw7QPrUk0?si=x")).toBe("sSsw7QPrUk0");
  expect(parseYouTubeId("https://music.youtube.com/watch?v=sSsw7QPrUk0")).toBe("sSsw7QPrUk0");
  expect(parseYouTubeId("https://evil.com/watch?v=sSsw7QPrUk0")).toBeNull();
  expect(parseYouTubeId("nope")).toBeNull();
});

test("isLqip only accepts small jpeg data urls", () => {
  expect(isLqip("data:image/jpeg;base64," + "A".repeat(100))).toBe(true);
  expect(isLqip("data:text/html;base64,AAAA")).toBe(false);
});
