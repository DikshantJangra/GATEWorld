"use client";

import Link from "next/link";
import { useState } from "react";
import {
  RiAddLine,
  RiArrowRightLine,
  RiBookOpenLine,
  RiCalendarEventLine,
  RiCheckboxCircleLine,
  RiCloseLine,
  RiDeleteBin6Line,
  RiEditLine,
  RiFireLine,
  RiLineChartLine,
  RiTimeLine,
  RiTrophyLine,
} from "react-icons/ri";
import { NewCycle } from "@/components/NewCycle";
import {
  coverage,
  daysLeft,
  hoursLogged,
  mockStats,
  pyqStats,
  sectionStats,
  studyStreak,
} from "@/domain/derive";
import { useActiveCycle, useStore } from "@/store";

export default function Dashboard() {
  const cycle = useActiveCycle();
  const setExamDate = useStore((s) => s.setExamDate);
  const addLogEntry = useStore((s) => s.addLogEntry);
  const removeLogEntry = useStore((s) => s.removeLogEntry);
  const addMockTest = useStore((s) => s.addMockTest);
  const removeMockTest = useStore((s) => s.removeMockTest);

  // Modals state
  const [showLogModal, setShowLogModal] = useState(false);
  const [showMockModal, setShowMockModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);

  // Study log form state
  const [logDate, setLogDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [logHours, setLogHours] = useState("2");
  const [logSectionId, setLogSectionId] = useState("");
  const [logCovered, setLogCovered] = useState("");
  const [logActivity, setLogActivity] = useState("Concept Theory");
  const [logNotes, setLogNotes] = useState("");

  // Mock test form state
  const [mockDate, setMockDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [mockSource, setMockSource] = useState("");
  const [mockScore, setMockScore] = useState("");
  const [mockMax, setMockMax] = useState("100");
  const [mockWeak, setMockWeak] = useState("");
  const [mockAction, setMockAction] = useState("");

  if (!cycle) return <NewCycle />;

  const cov = coverage(cycle);
  const left = daysLeft(cycle.examDate);
  const sections = sectionStats(cycle);
  const pyq = pyqStats(cycle);
  const mocks = mockStats(cycle);
  const streak = studyStreak(cycle);
  const totalHours = hoursLogged(cycle);

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(logHours);
    if (!h || h <= 0) return;
    addLogEntry({
      date: logDate,
      hours: h,
      sectionId: logSectionId || (cycle.syllabus.sections[0]?.id ?? ""),
      covered: logCovered || "General Study",
      activity: logActivity,
      notes: logNotes,
    });
    setShowLogModal(false);
    setLogCovered("");
    setLogNotes("");
  };

  const handleSaveMock = (e: React.FormEvent) => {
    e.preventDefault();
    const sc = parseFloat(mockScore);
    const mx = parseFloat(mockMax) || 100;
    if (isNaN(sc)) return;
    addMockTest({
      date: mockDate,
      source: mockSource || "Mock Test",
      score: sc,
      max: mx,
      weakAreas: mockWeak,
      actionItems: mockAction,
    });
    setShowMockModal(false);
    setMockSource("");
    setMockScore("");
    setMockWeak("");
    setMockAction("");
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Status Bar */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">
              GATE {cycle.year}
            </h1>
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-mono text-zinc-300">
              {cov.done}/{cov.total} topics ({Math.round(cov.ratio * 100)}%)
            </span>
          </div>

          <button
            onClick={() => setShowDateModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-zinc-400 transition-colors hover:border-white/20 hover:text-white"
            title="Edit target exam date"
          >
            <RiCalendarEventLine className="text-amber-400 text-xs" />
            <span>{cycle.examDate ? `${cycle.examDate}${left !== null ? ` (${left}d left)` : ""}` : "Set Exam Date"}</span>
            <RiEditLine className="text-[10px] opacity-60" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/15 active:scale-95"
          >
            <RiAddLine className="text-sm" />
            <span>Log Study</span>
          </button>
          <button
            onClick={() => setShowMockModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200 active:scale-95"
          >
            <RiTrophyLine className="text-sm" />
            <span>Log Mock</span>
          </button>
        </div>
      </section>

      {/* Top 4 KPI Metric Cards */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Metric 1: Timeline */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Countdown</span>
            <RiCalendarEventLine className="text-amber-400 text-sm" />
          </div>
          <div className="mt-1.5 text-2xl font-bold font-mono tracking-tight text-white">
            {left !== null ? `${left}d` : "--"}
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">
            {left !== null ? `~${Math.floor(left / 7)} weeks remaining` : "Target date unset"}
          </div>
        </div>

        {/* Metric 2: Syllabus Coverage */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Syllabus Covered</span>
            <RiBookOpenLine className="text-emerald-400 text-sm" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              {Math.round(cov.ratio * 100)}%
            </span>
            <span className="text-xs font-mono text-zinc-500">
              ({cov.done}/{cov.total})
            </span>
          </div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-emerald-400"
              style={{ width: `${Math.round(cov.ratio * 100)}%` }}
            />
          </div>
        </div>

        {/* Metric 3: PYQ Practice */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>PYQs Solved</span>
            <RiCheckboxCircleLine className="text-cyan-400 text-sm" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              {pyq.done}
            </span>
            <span className="text-xs font-mono text-zinc-500">/ {pyq.total}</span>
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">
            {pyq.partial} partial · {Math.round(pyq.ratio * 100)}% done
          </div>
        </div>

        {/* Metric 4: Discipline & Streak */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Study Hours</span>
            <RiFireLine className="text-orange-400 text-sm" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              {totalHours}h
            </span>
            <span className="text-xs text-orange-400/90 font-medium">
              {streak}d streak
            </span>
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">
            {cycle.log?.length ?? 0} sessions logged
          </div>
        </div>
      </section>

      {/* Subject Section Mastery Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Subjects & Progress
            </h2>
            <span className="text-xs text-zinc-500 font-mono">({sections.length})</span>
          </div>
          <Link
            href="/syllabus"
            className="flex items-center gap-1 text-xs text-zinc-400 transition hover:text-white"
          >
            <span>Open Full Syllabus</span>
            <RiArrowRightLine className="text-xs" />
          </Link>
        </div>

        {sections.length === 0 ? (
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 text-center text-xs text-zinc-400">
            No subjects configured yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sections.map((s) => {
              const ratio = s.total ? (s.done / s.total) * 100 : 0;
              const isHigh = s.priority === "High";
              return (
                <Link
                  key={s.id}
                  href={`/syllabus?section=${s.id}`}
                  className="group relative flex flex-col justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5 transition-all hover:border-white/20 hover:bg-white/[0.05]"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors line-clamp-1">
                        {s.name}
                      </span>
                      {s.priority && (
                        <span
                          className={`shrink-0 rounded px-1.5 py-0.2 text-[9px] font-semibold uppercase ${
                            isHigh
                              ? "bg-red-500/15 text-red-300 border border-red-500/30"
                              : "bg-white/10 text-zinc-400"
                          }`}
                        >
                          {s.priority}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
                      <span>{s.done} of {s.total} done</span>
                      <span className="font-mono text-zinc-300">{Math.round(ratio)}%</span>
                    </div>
                  </div>

                  <div className="mt-2.5">
                    <div className="flex h-1 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="bg-emerald-400 transition-all duration-300"
                        style={{ width: `${s.total ? (s.done / s.total) * 100 : 0}%` }}
                      />
                      <div
                        className="bg-amber-400/80 transition-all duration-300"
                        style={{ width: `${s.total ? (s.learning / s.total) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-zinc-500">
                      <span>{s.learning} learning</span>
                      <span>{s.notStarted} unstarted</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Two-Column Section: Recent Study Logs & Mock Tests */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Column 1: Recent Study Sessions */}
        <div className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
            <div className="flex items-center gap-2">
              <RiTimeLine className="text-amber-400 text-sm" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Recent Study Sessions
              </h3>
            </div>
            <button
              onClick={() => setShowLogModal(true)}
              className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <RiAddLine /> Log
            </button>
          </div>

          <div className="space-y-2">
            {!cycle.log || cycle.log.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500">
                No study sessions logged yet. Hit &quot;Log&quot; to add one.
              </div>
            ) : (
              cycle.log.slice(0, 6).map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.015] px-3 py-2 text-xs transition-colors hover:bg-white/[0.04]"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white font-mono">{l.hours}h</span>
                      <span className="rounded bg-white/10 px-1.5 py-0.2 text-[10px] text-zinc-300">
                        {l.activity}
                      </span>
                      <span className="truncate text-zinc-300">{l.covered}</span>
                    </div>
                    {l.notes && (
                      <p className="mt-0.5 truncate text-[11px] text-zinc-500">{l.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[11px] text-zinc-500">{l.date}</span>
                    <button
                      onClick={() => removeLogEntry(l.id)}
                      className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                      title="Delete log"
                    >
                      <RiDeleteBin6Line className="text-xs" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Mock Tests & Scorecard */}
        <div className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
            <div className="flex items-center gap-2">
              <RiLineChartLine className="text-emerald-400 text-sm" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Mock Tests ({mocks.count})
              </h3>
            </div>
            <button
              onClick={() => setShowMockModal(true)}
              className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <RiAddLine /> Record
            </button>
          </div>

          <div className="space-y-2">
            {!cycle.mocks || cycle.mocks.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500">
                No mock tests recorded yet. Hit &quot;Record&quot; to add one.
              </div>
            ) : (
              cycle.mocks.slice(0, 6).map((m) => {
                const pct = m.max ? Math.round((m.score / m.max) * 100) : 0;
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.015] px-3 py-2 text-xs transition-colors hover:bg-white/[0.04]"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white truncate">{m.source}</span>
                        <span className="font-mono text-emerald-400 font-semibold">
                          {m.score}/{m.max}
                        </span>
                        <span className="font-mono text-zinc-500 text-[11px]">({pct}%)</span>
                      </div>
                      {(m.weakAreas || m.actionItems) && (
                        <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                          {m.weakAreas && <span>Weak: {m.weakAreas} </span>}
                          {m.actionItems && <span>· Action: {m.actionItems}</span>}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-[11px] text-zinc-500">{m.date}</span>
                      <button
                        onClick={() => removeMockTest(m.id)}
                        className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                        title="Delete mock test"
                      >
                        <RiDeleteBin6Line className="text-xs" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* MODAL: Exam Date Picker */}
      {showDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md" onClick={() => setShowDateModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-white/15 bg-[#141211] p-5 shadow-2xl backdrop-blur-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Set Target Exam Date</h3>
              <button onClick={() => setShowDateModal(false)} className="text-zinc-400 hover:text-white">
                <RiCloseLine className="text-xl" />
              </button>
            </div>
            <p className="text-xs text-zinc-400">
              GATE is traditionally held during the first two weekends of February.
            </p>
            <input
              type="date"
              value={cycle.examDate ?? ""}
              onChange={(e) => setExamDate(e.target.value || null)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDateModal(false)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Log Study Session */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md" onClick={() => setShowLogModal(false)} />
          <form
            onSubmit={handleSaveLog}
            className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-[#141211] p-5 shadow-2xl backdrop-blur-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Log Study Session</h3>
              <button type="button" onClick={() => setShowLogModal(false)} className="text-zinc-400 hover:text-white">
                <RiCloseLine className="text-xl" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-400">Date</label>
                <input
                  type="date"
                  required
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-white/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-400">Hours Studied</label>
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  max="24"
                  required
                  value={logHours}
                  onChange={(e) => setLogHours(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-white/30 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-400">Subject / Section</label>
              <select
                value={logSectionId}
                onChange={(e) => setLogSectionId(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#221e1a] px-3 py-2 text-xs text-white outline-none focus:border-white/30"
              >
                {cycle.syllabus.sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-400">Activity Type</label>
                <select
                  value={logActivity}
                  onChange={(e) => setLogActivity(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#221e1a] px-3 py-2 text-xs text-white outline-none focus:border-white/30"
                >
                  <option value="Concept Theory">Concept Theory</option>
                  <option value="PYQ Solving">PYQ Solving</option>
                  <option value="Short Notes Revision">Short Notes Revision</option>
                  <option value="Subject Test">Subject Test</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-400">Topics Covered</label>
                <input
                  value={logCovered}
                  onChange={(e) => setLogCovered(e.target.value)}
                  placeholder="e.g. Virtual Memory & Page Faults"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-white/30"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-400">Notes & Takeaways</label>
              <textarea
                rows={2}
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
                placeholder="Key formula insights or doubts to review..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-white/30 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-white px-5 py-2 text-xs font-semibold text-zinc-950 shadow-md hover:bg-zinc-200"
              >
                Save Session
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Record Mock Test */}
      {showMockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md" onClick={() => setShowMockModal(false)} />
          <form
            onSubmit={handleSaveMock}
            className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-[#141211] p-5 shadow-2xl backdrop-blur-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Record Mock Test</h3>
              <button type="button" onClick={() => setShowMockModal(false)} className="text-zinc-400 hover:text-white">
                <RiCloseLine className="text-xl" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-400">Date</label>
                <input
                  type="date"
                  required
                  value={mockDate}
                  onChange={(e) => setMockDate(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-white/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-400">Test Series / Source</label>
                <input
                  required
                  placeholder="e.g. Made Easy CBT 1"
                  value={mockSource}
                  onChange={(e) => setMockSource(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-white/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-400">Your Score</label>
                <input
                  type="number"
                  step="0.33"
                  required
                  placeholder="e.g. 68.67"
                  value={mockScore}
                  onChange={(e) => setMockScore(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-white/30 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-400">Max Marks</label>
                <input
                  type="number"
                  required
                  value={mockMax}
                  onChange={(e) => setMockMax(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-white/30 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-400">Identified Weak Areas</label>
              <input
                value={mockWeak}
                onChange={(e) => setMockWeak(e.target.value)}
                placeholder="e.g. Pipeline hazards, Graph algorithms negative cycles"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-white/30"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-400">Action Items</label>
              <input
                value={mockAction}
                onChange={(e) => setMockAction(e.target.value)}
                placeholder="e.g. Revise multi-level paging numericals by Wednesday"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-white/30"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowMockModal(false)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-white px-5 py-2 text-xs font-semibold text-zinc-950 shadow-md hover:bg-zinc-200"
              >
                Record Test
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
