"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store";

/** Rehydrates the persisted store on the client, then renders children. */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    Promise.resolve(useStore.persist.rehydrate()).then(() => {
      setHydrated(true);
    });
  }, []);

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <span className="text-xs text-zinc-400 font-medium">Loading your study portal...</span>
        </div>
      </div>
    );
  }

  return children;
}
