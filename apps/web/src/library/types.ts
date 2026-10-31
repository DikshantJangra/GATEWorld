import type { Mood } from "@/music/tracks";

export interface Item {
  id: string;
  kind: "wallpaper" | "music";
  status: "pending" | "approved";
  createdAt: number;
  title: string;
  credit?: string;
  /** wallpaper: stored file name, served at /api/library/img/<file> */
  file?: string;
  /** wallpaper: tiny blurred JPEG data URL for instant first paint */
  lqip?: string;
  /** music */
  ytId?: string;
  artist?: string;
  mood?: Mood;
}

export interface Db {
  items: Item[];
  defaultWallpaper: string | null;
}
