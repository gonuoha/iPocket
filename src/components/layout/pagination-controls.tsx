import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { getVisiblePageNumbers } from "@/lib/pagination";
import { cn } from "@/lib/utils";

type PaginationControlsProps = {
  page: number;
  totalPages: number;
  getHref: (page: number) => string;
};

function PaginationButton({
  href,
  disabled,
  active,
  children,
  ariaLabel,
}: {
  href?: string;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  const className = cn(
    buttonVariants({
      variant: active ? "default" : "outline",
      size: "sm",
    }),
    "min-w-8 px-2",
    disabled && "pointer-events-none opacity-50",
  );

  if (disabled || !href) {
    return (
      <span aria-label={ariaLabel} className={className}>
        {children}
      </span>
    );
  }

  return (
    <Link aria-label={ariaLabel} href={href} className={className}>
      {children}
    </Link>
  );
}

export function PaginationControls({
  page,
  totalPages,
  getHref,
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePageNumbers(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-center gap-1"
    >
      <PaginationButton
        href={getHref(page - 1)}
        disabled={page <= 1}
        ariaLabel="Previous page"
      >
        <ChevronLeft className="size-4" />
        Previous
      </PaginationButton>

      {visiblePages.map((pageNumber, index) =>
        pageNumber === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="px-2 text-sm text-muted-foreground"
          >
            ...
          </span>
        ) : (
          <PaginationButton
            key={pageNumber}
            href={getHref(pageNumber)}
            active={pageNumber === page}
            ariaLabel={`Page ${pageNumber}`}
          >
            {pageNumber}
          </PaginationButton>
        ),
      )}

      <PaginationButton
        href={getHref(page + 1)}
        disabled={page >= totalPages}
        ariaLabel="Next page"
      >
        Next
        <ChevronRight className="size-4" />
      </PaginationButton>
    </nav>
  );
}
