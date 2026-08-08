"use client";

import { useEffect } from "react";

export function MarketingScroll() {
  useEffect(() => {
    const { documentElement } = document;
    documentElement.setAttribute("data-scroll-behavior", "smooth");
    documentElement.classList.add("scroll-smooth", "scroll-pt-20");

    return () => {
      documentElement.removeAttribute("data-scroll-behavior");
      documentElement.classList.remove("scroll-smooth", "scroll-pt-20");
    };
  }, []);

  return null;
}
