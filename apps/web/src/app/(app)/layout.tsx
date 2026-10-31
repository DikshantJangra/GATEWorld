import { MiniPlayer } from "@/components/MiniPlayer";
import { Nav } from "@/components/Nav";
import { StoreProvider } from "@/components/StoreProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        <StoreProvider>{children}</StoreProvider>
      </main>
      <MiniPlayer />
    </>
  );
}
