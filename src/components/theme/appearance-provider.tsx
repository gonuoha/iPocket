"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  applyTheme,
  getSystemIsDark,
  isDarkTheme,
  resolveTheme,
  setAppearanceCookie,
  type Theme,
} from "@/lib/appearance";
import type { Appearance } from "@/lib/user-preferences";

type AppearanceContextValue = {
  appearance: Appearance;
  resolvedTheme: Theme;
  isDarkMode: boolean;
  setAppearance: (appearance: Appearance) => void;
};

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

export function AppearanceProvider({
  children,
  initialAppearance,
}: {
  children: React.ReactNode;
  initialAppearance: Appearance;
}) {
  const [appearance, setAppearanceState] = useState(initialAppearance);
  const [systemIsDark, setSystemIsDark] = useState(getSystemIsDark);

  const resolvedTheme = useMemo(
    () => resolveTheme(appearance, systemIsDark),
    [appearance, systemIsDark],
  );

  const isDarkMode = isDarkTheme(resolvedTheme);

  const setAppearance = useCallback((next: Appearance) => {
    setAppearanceState(next);
    setAppearanceCookie(next);
  }, []);

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    if (appearance !== "system") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setSystemIsDark(media.matches);

    media.addEventListener("change", handleChange);

    return () => media.removeEventListener("change", handleChange);
  }, [appearance]);

  const value = useMemo(
    () => ({ appearance, resolvedTheme, isDarkMode, setAppearance }),
    [appearance, resolvedTheme, isDarkMode, setAppearance],
  );

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance(): AppearanceContextValue {
  const context = useContext(AppearanceContext);

  if (!context) {
    throw new Error("useAppearance must be used within AppearanceProvider");
  }

  return context;
}
