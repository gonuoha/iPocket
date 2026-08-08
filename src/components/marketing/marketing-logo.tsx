import Link from "next/link";

import { cn } from "@/lib/utils";

type MarketingLogoProps = {
  className?: string;
};

export function MarketingLogo({ className }: MarketingLogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex min-h-11 items-center gap-2 text-lg font-semibold",
        className,
      )}
    >
      <span className="flex size-7 text-primary" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 7h16M4 12h16M4 17h10" />
          <rect x="2" y="3" width="20" height="18" rx="2" />
        </svg>
      </span>
      iPocket
    </Link>
  );
}
