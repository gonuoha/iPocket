"use client";

import { useEffect, useState, type ReactNode } from "react";

import { MarketingLogo } from "@/components/marketing/marketing-logo";
import { cn } from "@/lib/utils";

type HomepageNavbarProps = {
  actions: ReactNode;
};

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
] as const;

export function HomepageNavbar({ actions }: HomepageNavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-16 border-b border-transparent backdrop-blur-md transition-colors",
        scrolled
          ? "border-border bg-background/95"
          : "bg-background/60",
      )}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-6">
        <MarketingLogo />
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
    </nav>
  );
}
