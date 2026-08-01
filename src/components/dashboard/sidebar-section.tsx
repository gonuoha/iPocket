"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

type SidebarSectionProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
};

export function SidebarSection({
  title,
  children,
  defaultOpen = true,
  className,
}: SidebarSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={cn(className, "group-data-[collapsed]:hidden")}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between px-2 py-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase"
      >
        {title}
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform",
            open ? "rotate-0" : "-rotate-90",
          )}
        />
      </button>
      {open ? <div className="mt-1">{children}</div> : null}
    </section>
  );
}
