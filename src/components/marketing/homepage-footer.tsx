import Link from "next/link";

import { MarketingLogo } from "@/components/marketing/marketing-logo";
import { FOOTER_LINKS } from "@/lib/marketing/homepage-content";

export function HomepageFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border px-6 pt-12 pb-6">
      <div className="mx-auto min-w-0 max-w-6xl">
        <div className="mb-8 grid min-w-0 gap-8 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            <MarketingLogo />
            <p className="mt-3 max-w-64 text-sm text-muted-foreground">
              One hub for all your developer knowledge.
            </p>
          </div>

          <div className="min-w-0">
            <h4 className="mb-3 text-sm font-semibold">Product</h4>
            <div className="flex flex-col gap-1">
              {FOOTER_LINKS.product.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="min-w-0">
            <h4 className="mb-3 text-sm font-semibold">Company</h4>
            <div className="flex flex-col gap-1">
              {FOOTER_LINKS.company.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="min-w-0">
            <h4 className="mb-3 text-sm font-semibold">Legal</h4>
            <div className="flex flex-col gap-1">
              {FOOTER_LINKS.legal.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">
            &copy; {year} Memex. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
