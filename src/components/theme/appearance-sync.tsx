"use client";

import { useEffect } from "react";

import { useAppearance } from "@/components/theme/appearance-provider";
import type { Appearance } from "@/lib/user-preferences";

export function AppearanceSync({ appearance }: { appearance: Appearance }) {
  const { setAppearance } = useAppearance();

  useEffect(() => {
    setAppearance(appearance);
  }, [appearance, setAppearance]);

  return null;
}
