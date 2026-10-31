import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { MusicProvider } from "@/music/MusicProvider";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GATEWorld",
  description: "GATE preparation tracker, organized by exam year.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <MusicProvider>{children}</MusicProvider>
      </body>
    </html>
  );
}
