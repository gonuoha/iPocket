"use client";

import { Menu } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { MarketingLogo } from "@/components/marketing/marketing-logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleAnchorClick() {
    setMobileOpen(false);
  }

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
              className="inline-flex min-h-11 items-center px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">{actions}</div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="min-h-11 min-w-11 md:hidden"
            aria-label="Open navigation menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu />
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetContent
              side="right"
              className="flex w-[min(18rem,85vw)] flex-col gap-0 p-0"
            >
              <SheetHeader className="border-b border-border px-6 py-4">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-1 flex-col px-4 py-4">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={handleAnchorClick}
                    className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              <div className="flex flex-col gap-2 border-t border-border p-4 [&_a]:min-h-11 [&_button]:min-h-11">
                {actions}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
