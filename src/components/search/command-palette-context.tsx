"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { DashboardSearchData } from "@/lib/db/dashboard";

type CommandPaletteContextValue = {
  open: boolean;
  openPalette: () => void;
  closePalette: () => void;
  togglePalette: () => void;
  searchData: DashboardSearchData;
};

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(
  null,
);

export function CommandPaletteProvider({
  children,
  searchData,
}: {
  children: React.ReactNode;
  searchData: DashboardSearchData;
}) {
  const [open, setOpen] = useState(false);

  const openPalette = useCallback(() => {
    setOpen(true);
  }, []);

  const closePalette = useCallback(() => {
    setOpen(false);
  }, []);

  const togglePalette = useCallback(() => {
    setOpen((current) => !current);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "k") {
        return;
      }

      const modifierPressed = event.metaKey || event.ctrlKey;

      if (!modifierPressed) {
        return;
      }

      event.preventDefault();
      togglePalette();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [togglePalette]);

  const value = useMemo(
    () => ({
      open,
      openPalette,
      closePalette,
      togglePalette,
      searchData,
    }),
    [open, openPalette, closePalette, togglePalette, searchData],
  );

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
    </CommandPaletteContext.Provider>
  );
}

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext);

  if (!context) {
    throw new Error(
      "useCommandPalette must be used within CommandPaletteProvider",
    );
  }

  return context;
}
