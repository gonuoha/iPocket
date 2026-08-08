"use client";

import { useEffect } from "react";

export function MarketingScroll() {
  useEffect(() => {
    const { documentElement } = document;
    documentElement.classList.add("scroll-smooth", "scroll-pt-16");

    return () => {
      documentElement.classList.remove("scroll-smooth", "scroll-pt-16");
    };
  }, []);

  return null;
}
