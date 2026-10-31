"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  RiBookOpenLine,
  RiCalendarLine,
  RiCloseLine,
  RiDashboard3Line,
  RiFolderMusicLine,
  RiHome4Line,
  RiMenu3Line,
  RiPauseFill,
  RiPlayFill,
  RiShieldCheckLine,
  RiSparklingLine,
  RiVolumeUpLine,
} from "react-icons/ri";
import { daysLeft } from "@/domain/derive";
import { usePlayer } from "@/music/MusicProvider";
import { useActiveCycle, useStore } from "@/store";

const links = [
  { href: "/", label: "Home", icon: RiHome4Line },
  { href: "/dashboard", label: "Dashboard", icon: RiDashboard3Line },
  { href: "/syllabus", label: "Syllabus", icon: RiBookOpenLine },
  { href: "/library", label: "Library", icon: RiFolderMusicLine },
];

export function Nav() {
  const pathname = usePathname();
  const cycle = useActiveCycle();
  const cycles = useStore((s) => s.cycles);
  const setActiveCycle = useStore((s) => s.setActiveCycle);
  const player = usePlayer();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cycleDropdown, setCycleDropdown] = useState(false);

  const left = cycle ? daysLeft(cycle.examDate) : null;
  const cycleList = Object.values(cycles);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0e0c0b]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-3 sm:px-4 md:px-6 py-2.5">
        {/* Brand & Cycle Info */}
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white/5 shadow-sm transition-transform group-hover:scale-105">
              <img
                src="/logo.png"
                alt="GATEWorld Logo"
                className="h-full w-full object-contain p-1"
              />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-white transition-colors group-hover:text-zinc-200">
                GATEWorld
              </span>
              <span className="text-[10px] text-zinc-400 font-medium">गेट वर्ल्ड</span>
            </div>
          </Link>

          {/* Active Cycle Badge with Switcher */}
          {cycle && (
            <div className="relative">
              <button
                onClick={() => setCycleDropdown((o) => !o)}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                title="Switch Target Exam Cycle"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="font-medium">GATE {cycle.year}</span>
                {left !== null && (
                  <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] text-zinc-300 font-mono">
                    {left}d left
                  </span>
                )}
              </button>

              {cycleDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setCycleDropdown(false)}
                  />
                  <div className="absolute left-0 mt-2 z-20 w-48 rounded-xl border border-white/15 bg-[#171412] p-1.5 shadow-xl backdrop-blur-2xl">
                    <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Target Cycles
                    </div>
                    {cycleList.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setActiveCycle(c.id);
                          setCycleDropdown(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                          c.id === cycle.id
                            ? "bg-white/15 text-white font-medium"
                            : "text-zinc-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span>GATE {c.year}</span>
                        {c.id === cycle.id && (
                          <span className="text-[10px] text-emerald-400">Active</span>
                        )}
                      </button>
                    ))}
                    <div className="my-1 border-t border-white/10" />
                    <Link
                      href="/dashboard"
                      onClick={() => setCycleDropdown(false)}
                      className="flex w-full items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-400 hover:bg-white/5 hover:text-white"
                    >
                      <RiSparklingLine className="text-zinc-400" />
                      <span>Manage cycles</span>
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const Icon = l.icon;
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? "border border-white/20 bg-white/10 text-white shadow-sm"
                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                }`}
              >
                <Icon className={`text-sm ${active ? "text-white" : "text-zinc-400"}`} />
                <span>{l.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Mini Ambient Audio Status & Mobile Hamburger */}
        <div className="flex items-center gap-2">
          {player.track && (
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
              <RiVolumeUpLine
                className={`text-sm ${player.playing ? "text-emerald-400 animate-pulse" : "text-zinc-500"}`}
              />
              <span className="max-w-[120px] truncate text-[11px]">
                {player.track.title}
              </span>
              <button
                onClick={player.toggle}
                className="grid h-5 w-5 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                aria-label={player.playing ? "Pause audio" : "Play audio"}
              >
                {player.playing ? (
                  <RiPauseFill className="text-[10px]" />
                ) : (
                  <RiPlayFill className="text-[10px]" />
                )}
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <RiCloseLine className="text-xl" /> : <RiMenu3Line className="text-xl" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#0e0c0b]/95 px-4 py-4 backdrop-blur-2xl md:hidden">
          <div className="flex flex-col gap-1.5">
            {links.map((l) => {
              const Icon = l.icon;
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? "border border-white/20 bg-white/10 text-white"
                      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                  }`}
                >
                  <Icon className="text-lg" />
                  <span>{l.label}</span>
                </Link>
              );
            })}
          </div>

          {cycle && (
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <RiCalendarLine />
                GATE {cycle.year}
              </span>
              <span>{left !== null ? `${left} days to exam` : "No exam date set"}</span>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
