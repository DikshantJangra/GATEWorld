export interface Track {
  /** YouTube video id: the v= part of the URL. */
  id: string;
  title: string;
  artist?: string;
  /** Seconds to skip at start. */
  start?: number;
}

export interface Ambience {
  id: string;
  label: string;
  src: string;
}

export const MOODS: Record<"josh" | "shant", Track[]> = {
  /** Anthems. */
  josh: [
    { id: "sSsw7QPrUk0", title: "Lakshya", artist: "Shankar-Ehsaan-Loy" },
    { id: "9iIX4PBplAY", title: "Kar Har Maidaan Fateh", artist: "Sanju" },
    { id: "Ax0G_P2dSBw", title: "Zinda", artist: "Bhaag Milkha Bhaag" },
    { id: "x5fYTPvrz4g", title: "Manzar Hai Yeh Naya", artist: "Uri" },
    { id: "DmsOinqrPvQ", title: "Badal Pe Paon Hain", artist: "Chak De! India" },
    { id: "Q3JMD4oaXlI", title: "Shaabaashiyaan", artist: "Mission Mangal" },
    { id: "V0ejQDKE4w8", title: "Let's Crack It", artist: "Naezy, Dub Sharma" },
    { id: "gg1tN-gkcwk", title: "Aarambh", artist: "Piyush Mishra, Gulaal" },
    { id: "50q8wD6MXgI", title: "Bismil", artist: "Sukhwinder Singh, Haider" },
    { id: "tqJyVIA8GVE", title: "Zor Se Zor Laga", artist: "Khido Khundi" },
    { id: "cF2yqyiJACk", title: "Soorma Anthem", artist: "Shankar Mahadevan" },
    { id: "M7ub-Fg92Zk", title: "Thaan Liya", artist: "Dasvi, Sachin-Jigar" },
    { id: "VNdRK4YC4QA", title: "Kholo Kholo", artist: "Taare Zameen Par" },
    { id: "7_et2uhWWFM", title: "Triumph", artist: "Tusshar Mallek" },
    { id: "tcKTcEE7FXA", title: "King vs EPR", artist: "Hustle 2.0", start: 215 },
  ],
  /** Calm. */
  shant: [
    { id: "LMfrk9E_oiU", title: "De Mauka Zindagi", artist: "TVF Aspirants" },
    { id: "CaI0xNLpurM", title: "Aashayein", artist: "Iqbal, KK" },
    { id: "-LWbeZUyQe8", title: "Kachha Ghada", artist: "Rahgir" },
    { id: "0Rm2cajspwY", title: "Sapne Re", artist: "Secret Superstar" },
    { id: "BKx_B1VZ2kw", title: "Ae Watan", artist: "Raazi" },
    { id: "pxcRWdGKSko", title: "Kyun Main Jaagoon", artist: "Patiala House, unplugged" },
    { id: "wpx8xCC7ETM", title: "See You Again", artist: "Swarnim Maharjan, flute" },
    { id: "T94PHkuydcw", title: "Kun Faya Kun", artist: "Rockstar, A.R. Rahman" },
    { id: "3TndEMf6zws", title: "Ye Honsla", artist: "Dor" },
    { id: "k-UQz3f7ZPI", title: "Dhaaga", artist: "TVF Aspirants" },
    { id: "EJf1x51LvMY", title: "Aspirants Theme", artist: "TVF, background score" },
  ],
};
export type Mood = keyof typeof MOODS;

// Self-owned loops under the music: drop files in public/audio/ambience/ and list them here.
export const AMBIENCE: Ambience[] = [];

export const MOOD_LABEL: Record<Mood, string> = { josh: "Joe", shant: "Shant" };
