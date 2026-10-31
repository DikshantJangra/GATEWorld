import { MiniPlayer } from "@/components/MiniPlayer";
import { Nav } from "@/components/Nav";
import { StoreProvider } from "@/components/StoreProvider";
import { Wallpaper } from "@/components/Wallpaper";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full bg-[#0d0b0a] text-zinc-100 antialiased selection:bg-white/20 selection:text-white">
      {/* Immersive Scenic Backdrop */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <Wallpaper />
        <div className="absolute inset-0 bg-[#0d0b0a]/88 backdrop-blur-2xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
      </div>

      {/* Main Top Navigation */}
      <Nav />

      {/* Main App Content Viewport */}
      <main className="relative mx-auto w-full max-w-[1440px] flex-1 px-3 sm:px-4 md:px-6 py-5">
        <StoreProvider>{children}</StoreProvider>
      </main>

      {/* Modern Floating Audio & Study Pill */}
      <MiniPlayer />
    </div>
  );
}
