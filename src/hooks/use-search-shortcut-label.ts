"use client";

import { useSyncExternalStore } from "react";

function getSearchShortcutLabel() {
  const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
  return isMac ? "⌘K" : "Ctrl+K";
}

function subscribe() {
  return () => {};
}

export function useSearchShortcutLabel() {
  return useSyncExternalStore(
    subscribe,
    getSearchShortcutLabel,
    () => "⌘K",
  );
}
