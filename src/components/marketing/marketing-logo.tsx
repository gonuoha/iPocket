import Link from "next/link";
import { FolderOpen } from "lucide-react";

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
      <FolderOpen className="size-6 text-primary" aria-hidden="true" />
      iPocket
    </Link>
  );
}
