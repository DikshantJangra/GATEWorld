import { Caveat, Hind } from "next/font/google";
import Link from "next/link";
import { TimeBlock } from "@/components/LiveBits";
import { PillPlayer } from "@/components/PillPlayer";
import { Wallpaper } from "@/components/Wallpaper";
import { WallpaperDots } from "@/components/WallpaperDots";

const hind = Hind({ weight: "700", subsets: ["devanagari", "latin"] });
const hand = Caveat({ subsets: ["latin"], variable: "--font-hand" });

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/syllabus", label: "Syllabus" },
  { href: "/library", label: "Library" },
];

export default function Landing() {
  return (
    <div className={`${hand.variable} relative h-dvh w-full overflow-hidden bg-[#1a1411] text-white`}>
      <Wallpaper />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/45" />
      <header className="relative grid grid-cols-3 items-start p-5 text-sm">
        <Link href="/" className="flex items-center gap-2.5 opacity-90 transition-opacity hover:opacity-100">
          <img src="/logo.png" alt="GW" className="h-9 w-9 object-contain drop-shadow" />
          <span className="font-bold tracking-tight text-white text-base">GW</span>
        </Link>
        <div className="justify-self-center"><TimeBlock /></div>
        <nav className="flex justify-end gap-6">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="opacity-85 hover:opacity-100">
              {l.label} <span className="text-xs opacity-60">↗</span>
            </Link>
          ))}
        </nav>
      </header>
      <section className={`${hind.className} relative mt-[5vh] flex flex-col items-center px-4 text-center`}>
        <img
          src="/logo.png"
          alt="GW"
          className="mb-4 h-24 w-24 object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.55)] sm:h-32 sm:w-32 transition-transform duration-300 hover:scale-105"
        />
        <h1 className="whitespace-nowrap text-[clamp(4rem,14vw,12rem)] leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,.45)]">
          गेट वर्ल्ड
        </h1>
        <Link href="/dashboard" className="mt-4 rounded-full bg-white px-6 py-2 text-lg text-black">
          पढ़ाई शुरू करें →
        </Link>
      </section>
      <WallpaperDots />
      <PillPlayer />
    </div>
  );
}
