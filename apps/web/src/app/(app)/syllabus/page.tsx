"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import {
  RiAddLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiBookOpenLine,
  RiCheckboxBlankCircleLine,
  RiCheckboxCircleFill,
  RiCloseLine,
  RiDeleteBin6Line,
  RiFileTextLine,
  RiFireLine,
  RiHistoryLine,
  RiSearchLine,
  RiStarFill,
  RiStarLine,
  RiTimeLine,
} from "react-icons/ri";
import { AddForm } from "@/components/AddForm";
import { NewCycle } from "@/components/NewCycle";
import { coverage, sectionStats } from "@/domain/derive";
import type { Priority, PyqState, Status } from "@/domain/types";
import { useActiveCycle, useStore } from "@/store";

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string }> = {
  not_started: { label: "Not Started", color: "text-zinc-400", bg: "bg-white/5 border-white/10" },
  learning: { label: "Learning", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" },
  done: { label: "Mastered", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
};

const PYQ_CONFIG: Record<PyqState, { label: string; color: string }> = {
  no: { label: "No PYQs", color: "text-zinc-500 bg-white/5 border-white/10" },
  partial: { label: "PYQs Partial", color: "text-amber-300 bg-amber-500/10 border-amber-500/30" },
  done: { label: "PYQs Solved", color: "text-cyan-300 bg-cyan-500/10 border-cyan-500/30" },
};

export default function Syllabus() {
  return (
    <Suspense fallback={<div className="text-zinc-500 text-xs">Loading syllabus...</div>}>
      <SyllabusContent />
    </Suspense>
  );
}

function SyllabusContent() {
  const searchParams = useSearchParams();
  const focusedSection = searchParams.get("section");

  const cycle = useActiveCycle();
  const {
    addSection,
    removeSection,
    addTopic,
    removeTopic,
    setTopicStatus,
    setTopicConfidence,
    setTopicPyq,
    setTopicNotes,
    addTopicRevision,
    markSectionStatus,
  } = useStore();

  // Search & Filtering State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [pyqFilter, setPyqFilter] = useState<PyqState | "all">("all");

  // Collapsed sections tracking (default: all expanded, or focus specific one)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // Active note editor modal state
  const [editingNoteTopic, setEditingNoteTopic] = useState<{ id: string; name: string; notes: string } | null>(null);

  if (!cycle) return <NewCycle />;

  const cov = coverage(cycle);
  const sections = cycle.syllabus.sections;

  const toggleSection = (id: string) => {
    setCollapsed((c) => ({ ...c, [id]: !c[id] }));
  };

  const expandAll = () => setCollapsed({});
  const collapseAll = () => {
    const next: Record<string, boolean> = {};
    for (const s of sections) next[s.id] = true;
    setCollapsed(next);
  };

  // Filtered topics calculation
  const searchLower = search.trim().toLowerCase();

  return (
    <div className="space-y-8">
      {/* Header & Overall Mastery Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-emerald-400">
              <RiBookOpenLine />
              <span>GATE {cycle.year} Curriculum Tracker</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Syllabus & Topics
            </h1>
            <p className="text-sm text-zinc-400">
              Track your progress topic-by-topic with PYQs, self-assessed confidence, and revision timestamps.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={expandAll}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-zinc-400">Overall Coverage</div>
            <div className="text-2xl font-bold font-mono text-white">
              {Math.round(cov.ratio * 100)}%
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-zinc-400">Topics Mastered</div>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {cov.done} <span className="text-xs text-zinc-500 font-sans">/ {cov.total}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-zinc-400">Currently Learning</div>
            <div className="text-2xl font-bold font-mono text-amber-400">
              {cov.learning}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-zinc-400">Not Started</div>
            <div className="text-2xl font-bold font-mono text-zinc-400">
              {cov.total - cov.done - cov.learning}
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Search Toolbar */}
      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Live Search Input */}
          <div className="relative flex-1">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search topics (e.g. Paging, Dijkstra, Eigenvalues, Turing Machine)..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-8 text-xs text-white placeholder-zinc-500 outline-none focus:border-white/25 focus:bg-white/[0.08]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <RiCloseLine className="text-sm" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Status | "all")}
              className="rounded-xl border border-white/10 bg-[#1b1714] px-3 py-2 text-xs text-zinc-300 outline-none focus:border-white/30"
            >
              <option value="all">All Statuses</option>
              <option value="done">Mastered</option>
              <option value="learning">Learning</option>
              <option value="not_started">Not Started</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as Priority | "all")}
              className="rounded-xl border border-white/10 bg-[#1b1714] px-3 py-2 text-xs text-zinc-300 outline-none focus:border-white/30"
            >
              <option value="all">All Priorities</option>
              <option value="High">High Priority 🔥</option>
              <option value="Med">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            {/* PYQ Filter */}
            <select
              value={pyqFilter}
              onChange={(e) => setPyqFilter(e.target.value as PyqState | "all")}
              className="rounded-xl border border-white/10 bg-[#1b1714] px-3 py-2 text-xs text-zinc-300 outline-none focus:border-white/30"
            >
              <option value="all">All PYQs</option>
              <option value="done">PYQs Solved</option>
              <option value="partial">PYQs Partial</option>
              <option value="no">PYQs Pending</option>
            </select>
          </div>
        </div>
      </section>

      {/* Subject Sections */}
      <div className="space-y-4">
        {sections.map((section) => {
          const isCollapsed = collapsed[section.id];
          const isTargeted = focusedSection === section.id;

          // Filter topics within this section
          const matchingTopics = section.topics.filter((t) => {
            const p = cycle.progress[t.id] ?? { status: "not_started", pyq: "no" };
            if (statusFilter !== "all" && p.status !== statusFilter) return false;
            if (priorityFilter !== "all" && (t.priority ?? section.priority) !== priorityFilter) return false;
            if (pyqFilter !== "all" && (p.pyq ?? "no") !== pyqFilter) return false;
            if (searchLower) {
              const inTopic = t.name.toLowerCase().includes(searchLower);
              const inSection = section.name.toLowerCase().includes(searchLower);
              return inTopic || inSection;
            }
            return true;
          });

          // If filters are active and no topics match in this section, skip section
          if (matchingTopics.length === 0 && (searchLower || statusFilter !== "all" || priorityFilter !== "all" || pyqFilter !== "all")) {
            return null;
          }

          const sectionDone = section.topics.filter((t) => cycle.progress[t.id]?.status === "done").length;
          const sectionPct = section.topics.length ? Math.round((sectionDone / section.topics.length) * 100) : 0;

          return (
            <div
              key={section.id}
              className={`overflow-hidden rounded-2xl border transition-all backdrop-blur-md ${
                isTargeted
                  ? "border-emerald-500/50 bg-white/[0.06] shadow-lg ring-1 ring-emerald-500/20"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20"
              }`}
            >
              {/* Section Header */}
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between bg-white/[0.02]">
                <div
                  onClick={() => toggleSection(section.id)}
                  className="flex flex-1 cursor-pointer items-center gap-3 select-none"
                >
                  <button
                    type="button"
                    className="grid h-7 w-7 place-items-center rounded-lg bg-white/5 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                  >
                    {isCollapsed ? <RiArrowDownSLine className="text-base" /> : <RiArrowUpSLine className="text-base" />}
                  </button>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-white">{section.name}</h2>
                      {section.priority && (
                        <span
                          className={`rounded-full px-2 py-0.2 text-[10px] font-semibold ${
                            section.priority === "High"
                              ? "bg-red-500/20 text-red-300 border border-red-500/30"
                              : "bg-white/10 text-zinc-400"
                          }`}
                        >
                          {section.priority}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span>{sectionDone} / {section.topics.length} topics done</span>
                      <span>·</span>
                      <span className="font-mono text-zinc-300">{sectionPct}%</span>
                    </div>
                  </div>
                </div>

                {/* Section Quick Controls */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    onClick={() => markSectionStatus(section.id, "done")}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-emerald-300 hover:bg-white/10"
                    title="Mark all topics in section as done"
                  >
                    Mark All Done
                  </button>
                  <button
                    onClick={() => removeSection(section.id)}
                    className="rounded-lg p-1.5 text-zinc-500 hover:text-red-400 hover:bg-white/5 transition-colors"
                    title="Remove Section"
                  >
                    <RiDeleteBin6Line className="text-sm" />
                  </button>
                </div>
              </div>

              {/* Section Progress Bar */}
              <div className="h-1 w-full bg-white/5">
                <div
                  className="h-full bg-emerald-400 transition-all duration-300"
                  style={{ width: `${sectionPct}%` }}
                />
              </div>

              {/* Section Topics List (when expanded) */}
              {!isCollapsed && (
                <div className="p-4 space-y-2 border-t border-white/5">
                  <div className="divide-y divide-white/5">
                    {matchingTopics.map((topic) => {
                      const prog = cycle.progress[topic.id] ?? {
                        status: "not_started",
                        pyq: "no",
                        revisions: [],
                        notes: "",
                      };
                      const statusCfg = STATUS_CONFIG[prog.status];
                      const pyqCfg = PYQ_CONFIG[prog.pyq ?? "no"];
                      const revCount = prog.revisions?.length ?? 0;
                      const confidence = prog.confidence ?? 0;

                      // Cycle status: not_started -> learning -> done -> not_started
                      const nextStatus = (): Status =>
                        prog.status === "not_started"
                          ? "learning"
                          : prog.status === "learning"
                          ? "done"
                          : "not_started";

                      // Cycle pyq: no -> partial -> done -> no
                      const nextPyq = (): PyqState =>
                        prog.pyq === "no"
                          ? "partial"
                          : prog.pyq === "partial"
                          ? "done"
                          : "no";

                      return (
                        <div
                          key={topic.id}
                          className="group flex flex-col gap-2.5 py-3 sm:flex-row sm:items-center sm:justify-between text-xs transition-colors hover:bg-white/[0.02] px-2 rounded-xl"
                        >
                          {/* Left: Status Toggle & Topic Name */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <button
                              onClick={() => setTopicStatus(topic.id, nextStatus())}
                              className="grid h-6 w-6 shrink-0 place-items-center text-zinc-400 hover:scale-110 transition-transform"
                              title={`Current: ${statusCfg.label}. Click to cycle.`}
                            >
                              {prog.status === "done" ? (
                                <RiCheckboxCircleFill className="text-lg text-emerald-400" />
                              ) : prog.status === "learning" ? (
                                <RiTimeLine className="text-lg text-amber-400" />
                              ) : (
                                <RiCheckboxBlankCircleLine className="text-lg text-zinc-600 group-hover:text-zinc-400" />
                              )}
                            </button>

                            <div className="min-w-0 flex-1 space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`font-medium ${
                                    prog.status === "done"
                                      ? "text-zinc-400 line-through decoration-zinc-600"
                                      : "text-zinc-200"
                                  }`}
                                >
                                  {topic.name}
                                </span>
                                {topic.priority && (
                                  <span className="text-[10px] text-zinc-500 font-mono">
                                    {topic.priority}
                                  </span>
                                )}
                              </div>
                              {prog.notes && (
                                <div className="truncate text-[11px] text-zinc-500 flex items-center gap-1">
                                  <RiFileTextLine className="text-[10px] shrink-0" />
                                  <span>{prog.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right: Badges, Controls, Confidence, Actions */}
                          <div className="flex flex-wrap items-center gap-2 pl-9 sm:pl-0">
                            {/* PYQ Toggle Button */}
                            <button
                              onClick={() => setTopicPyq(topic.id, nextPyq())}
                              className={`rounded-lg border px-2 py-0.5 text-[11px] font-medium transition-colors ${pyqCfg.color}`}
                              title="Toggle PYQ solved state"
                            >
                              {pyqCfg.label}
                            </button>

                            {/* Confidence 5 Stars */}
                            <div className="flex items-center gap-0.5" title="Confidence rating (1-5)">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() =>
                                    setTopicConfidence(
                                      topic.id,
                                      (star === confidence ? (star - 1 || 1) : star) as 1 | 2 | 3 | 4 | 5
                                    )
                                  }
                                  className="text-zinc-600 hover:text-amber-400 transition-colors p-0.5"
                                >
                                  {star <= confidence ? (
                                    <RiStarFill className="text-amber-400 text-xs" />
                                  ) : (
                                    <RiStarLine className="text-xs" />
                                  )}
                                </button>
                              ))}
                            </div>

                            {/* Revision Tracker Button */}
                            <button
                              onClick={() => addTopicRevision(topic.id)}
                              className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-zinc-400 hover:bg-white/10 hover:text-white"
                              title="Record a revision timestamp"
                            >
                              <RiHistoryLine className="text-[10px]" />
                              <span>{revCount} revs</span>
                              <span className="text-emerald-400 font-bold">+1</span>
                            </button>

                            {/* Notes Button */}
                            <button
                              onClick={() =>
                                setEditingNoteTopic({
                                  id: topic.id,
                                  name: topic.name,
                                  notes: prog.notes || "",
                                })
                              }
                              className={`rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors ${
                                prog.notes ? "text-amber-300" : ""
                              }`}
                              title="Add/Edit Topic Notes"
                            >
                              <RiFileTextLine className="text-sm" />
                            </button>

                            {/* Delete Topic Button */}
                            <button
                              onClick={() => removeTopic(topic.id)}
                              className="rounded-lg p-1.5 text-zinc-600 hover:text-red-400 hover:bg-white/5 transition-colors"
                              title="Delete Topic"
                            >
                              <RiDeleteBin6Line className="text-sm" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Topic Inline Form */}
                  <div className="pt-2">
                    <AddForm
                      placeholder={`Add new topic to ${section.name}...`}
                      label="Add Topic"
                      onAdd={(n) => addTopic(section.id, n)}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Add Section at Bottom */}
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-6 space-y-3">
          <div className="flex items-center gap-2">
            <RiFireLine className="text-amber-400 text-lg" />
            <h3 className="text-sm font-semibold text-white">Add Custom Subject / Module</h3>
          </div>
          <p className="text-xs text-zinc-400">
            Extend your syllabus with custom sections (e.g. Linear Algebra, Machine Learning, Compiler Optimization).
          </p>
          <AddForm placeholder="New Section Name (e.g. Theory of Computation)" label="Add Section" onAdd={addSection} />
        </div>
      </div>

      {/* MODAL: Topic Notes Editor */}
      {editingNoteTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md" onClick={() => setEditingNoteTopic(null)} />
          <div className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-[#171412] p-6 shadow-2xl backdrop-blur-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">Topic Study Notes</h3>
                <p className="text-xs text-zinc-400 truncate max-w-xs">{editingNoteTopic.name}</p>
              </div>
              <button onClick={() => setEditingNoteTopic(null)} className="text-zinc-400 hover:text-white">
                <RiCloseLine className="text-xl" />
              </button>
            </div>

            <textarea
              rows={5}
              value={editingNoteTopic.notes}
              onChange={(e) => setEditingNoteTopic({ ...editingNoteTopic, notes: e.target.value })}
              placeholder="Record key formulas, tricks, references, or concepts to remember..."
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-white/30 resize-none font-mono"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingNoteTopic(null)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setTopicNotes(editingNoteTopic.id, editingNoteTopic.notes);
                  setEditingNoteTopic(null);
                }}
                className="rounded-xl bg-white px-5 py-2 text-xs font-semibold text-zinc-950 shadow-md hover:bg-zinc-200"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
