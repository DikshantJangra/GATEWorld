"use client";

import { useState } from "react";
import {
  RiArrowRightLine,
  RiBookReadLine,
  RiCalendarLine,
  RiCheckboxCircleFill,
  RiCompass3Line,
  RiSparklingLine,
} from "react-icons/ri";
import { templateYears } from "@/data/syllabus";
import { useStore } from "@/store";

export function NewCycle() {
  const createCycle = useStore((s) => s.createCycle);
  const setExamDate = useStore((s) => s.setExamDate);
  const [year, setYear] = useState("2027");
  const [selectedTemplate, setSelectedTemplate] = useState<number | "blank">(2027);

  const y = Number(year);
  const valid = Number.isInteger(y) && y >= 2020 && y <= 2100;

  const handleStart = () => {
    if (!valid) return;
    const tpl = selectedTemplate === "blank" ? undefined : selectedTemplate;
    createCycle(y, tpl);
    // Suggest default GATE exam date (typically early February)
    setExamDate(`${y}-02-07`);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl sm:p-10">
        {/* Decorative background glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative space-y-8">
          {/* Header */}
          <div className="space-y-3 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-amber-300">
              <RiSparklingLine />
              <span>Initialize Preparation Plan</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Begin Your GATE Journey
            </h1>
            <p className="text-sm leading-relaxed text-zinc-400">
              Select your target exam cycle and choose a curated curriculum template to track
              syllabus completion, PYQ practice, and mock test scores.
            </p>
          </div>

          {/* Exam Year Selection */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <RiCalendarLine className="text-sm text-zinc-300" />
              <span>Target Exam Year</span>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {[2026, 2027, 2028].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => {
                    setYear(String(yr));
                    if (templateYears.includes(yr)) setSelectedTemplate(yr);
                  }}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    year === String(yr)
                      ? "border border-white/20 bg-white text-zinc-950 shadow-md"
                      : "border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  GATE {yr}
                </button>
              ))}
              <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 focus-within:border-white/30">
                <span className="text-xs text-zinc-500 font-mono mr-1">Other:</span>
                <input
                  type="number"
                  min="2020"
                  max="2035"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="e.g. 2029"
                  className="w-20 bg-transparent text-sm font-medium text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Curriculum Templates */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <RiBookReadLine className="text-sm text-zinc-300" />
              <span>Choose Curriculum Template</span>
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {templateYears.map((t) => (
                <div
                  key={t}
                  onClick={() => setSelectedTemplate(t)}
                  className={`group relative cursor-pointer rounded-2xl border p-4 transition-all ${
                    selectedTemplate === t
                      ? "border-emerald-500/50 bg-white/[0.08] shadow-lg"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/10 text-emerald-400">
                        <RiCheckboxCircleFill className="text-lg" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">GATE CS & IT {t}</h3>
                        <p className="text-xs text-emerald-400/90 font-medium">Standard Curriculum</p>
                      </div>
                    </div>
                    {selectedTemplate === t && (
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                        Selected
                      </span>
                    )}
                  </div>
                  <ul className="mt-3 space-y-1 text-[11px] text-zinc-400">
                    <li>• 11 Comprehensive Subjects</li>
                    <li>• 107 Official Topics mapped with Priorities</li>
                    <li>• Built-in PYQ & Revision Tracker</li>
                  </ul>
                </div>
              ))}

              <div
                onClick={() => setSelectedTemplate("blank")}
                className={`group relative cursor-pointer rounded-2xl border p-4 transition-all ${
                  selectedTemplate === "blank"
                    ? "border-amber-500/50 bg-white/[0.08] shadow-lg"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500/10 text-amber-400">
                      <RiCompass3Line className="text-lg" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">Blank Custom Plan</h3>
                      <p className="text-xs text-amber-400/90 font-medium">Build from scratch</p>
                    </div>
                  </div>
                  {selectedTemplate === "blank" && (
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                      Selected
                    </span>
                  )}
                </div>
                <p className="mt-3 text-[11px] text-zinc-400 leading-relaxed">
                  Ideal for other branches (DA, ECE, EE, ME) or students creating custom modular subject
                  lists.
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={!valid}
              onClick={handleStart}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-zinc-950 shadow-md transition-all hover:bg-zinc-200 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none"
            >
              <span>Initialize GATE {y} Workspace</span>
              <RiArrowRightLine className="text-base" />
            </button>
            <p className="mt-2 text-center text-[11px] text-zinc-500">
              All progress is securely stored locally on this device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
