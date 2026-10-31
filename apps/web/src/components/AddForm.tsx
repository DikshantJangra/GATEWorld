"use client";

import { useState } from "react";
import { RiAddLine } from "react-icons/ri";

export function AddForm({
  placeholder,
  label,
  onAdd,
}: {
  placeholder: string;
  label: string;
  onAdd: (v: string) => void;
}) {
  const [v, setV] = useState("");

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (v.trim()) {
          onAdd(v.trim());
          setV("");
        }
      }}
    >
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-white/25 focus:bg-white/[0.08]"
      />
      <button
        type="submit"
        disabled={!v.trim()}
        className="flex items-center gap-1 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition-all hover:bg-white/20 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
      >
        <RiAddLine className="text-sm" />
        <span>{label}</span>
      </button>
    </form>
  );
}
