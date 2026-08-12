"use client";

import { useCallback, useEffect, useState } from "react";

import { useIsMobile } from "@/hooks/use-mobile";

const STORAGE_KEY = "memex-item-drawer-width";
const MIN_WIDTH = 494;
const MAX_WIDTH_RATIO = 0.92;
const DEFAULT_WIDTH = 640;

function getMaxWidth() {
  if (typeof window === "undefined") {
    return 864;
  }

  return Math.floor(window.innerWidth * MAX_WIDTH_RATIO);
}

function getDefaultWidth() {
  return Math.min(864, getMaxWidth());
}

export function clampDrawerWidth(width: number) {
  return Math.min(getMaxWidth(), Math.max(MIN_WIDTH, width));
}

function readStoredWidth(): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return null;
  }

  const parsed = Number.parseInt(stored, 10);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return clampDrawerWidth(parsed);
}

export function useResizableDrawerWidth() {
  const isMobile = useIsMobile();
  const [width, setWidth] = useState(() => {
    if (typeof window === "undefined") {
      return DEFAULT_WIDTH;
    }

    return readStoredWidth() ?? getDefaultWidth();
  });
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (isMobile) {
      return;
    }

    const handleResize = () => {
      setWidth((current) => clampDrawerWidth(current));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile]);

  const startResize = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (isMobile) {
        return;
      }

      event.preventDefault();

      const handlePointerMove = (moveEvent: PointerEvent) => {
        setWidth(clampDrawerWidth(window.innerWidth - moveEvent.clientX));
      };

      const handlePointerEnd = () => {
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerEnd);
        document.removeEventListener("pointercancel", handlePointerEnd);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        setIsResizing(false);
        setWidth((current) => {
          const clamped = clampDrawerWidth(current);
          window.localStorage.setItem(STORAGE_KEY, String(clamped));
          return clamped;
        });
      };

      setIsResizing(true);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerEnd);
      document.addEventListener("pointercancel", handlePointerEnd);
    },
    [isMobile],
  );

  return {
    width,
    isMobile,
    isResizing,
    startResize,
    minWidth: MIN_WIDTH,
  };
}
