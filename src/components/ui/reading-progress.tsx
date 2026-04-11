"use client";

import { useSyncExternalStore, useCallback } from "react";

function getScrollProgress(): number {
  if (typeof window === "undefined") return 0;
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (docHeight <= 0) return 0;
  return Math.min(Math.round((scrollTop / docHeight) * 100), 100);
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("scroll", onStoreChange, { passive: true });
  return () => window.removeEventListener("scroll", onStoreChange);
}

export function ReadingProgress() {
  const getSnapshot = useCallback(() => getScrollProgress(), []);
  const getServerSnapshot = useCallback(() => 0, []);

  const progress = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  if (progress === 0) return null;

  return (
    <div
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Reading progress: ${progress}%`}
      className="fixed top-0 left-0 right-0 z-[60] h-0.5"
    >
      <div
        className="h-full bg-accent transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
