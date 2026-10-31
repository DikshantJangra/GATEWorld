"use client";

import { useEffect } from "react";
import { useStore } from "@/store";

/** Rehydrates the persisted store on the client, then renders children. */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useStore.persist.rehydrate();
  }, []);
  return children;
}
