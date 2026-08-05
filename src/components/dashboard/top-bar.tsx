"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2, PanelLeft, Search } from "lucide-react";

import { ItemCreateDialog } from "@/components/items/item-create-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseCreatableItemTypeFromPathname } from "@/lib/validations/items";
import { cn } from "@/lib/utils";

import { useSidebar } from "./sidebar-context";

export function TopBar({ isPro }: { isPro: boolean }) {
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const defaultType = parseCreatableItemTypeFromPathname(pathname);

  return (
    <>
      <header className="grid h-14 shrink-0 grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-border px-4 md:grid-cols-[minmax(0,1fr)_minmax(0,20rem)_minmax(0,1fr)] md:gap-4 md:px-6">
      <div className="flex min-w-0 items-center gap-2 justify-self-start">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="shrink-0 md:hidden"
        >
          <PanelLeft />
        </Button>
        <Link
          href="/dashboard"
          className="flex min-w-0 items-center gap-2 font-semibold"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Code2 className="size-4" />
          </div>
          <span className="truncate">iPocket</span>
        </Link>
      </div>

      <div className="relative hidden min-w-0 max-w-xs justify-self-center md:block md:w-full">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search items..."
          className="h-9 w-full pr-14 pl-9"
          disabled
        />
        <kbd
          className={cn(
            "pointer-events-none absolute top-1/2 right-3 -translate-y-1/2",
            "rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground",
          )}
        >
          ⌘K
        </kbd>
      </div>

      <div className="flex shrink-0 items-center gap-2 justify-self-end">
        <Button variant="outline" size="sm" disabled className="hidden sm:inline-flex">
          New Collection
        </Button>
        <Button size="sm" onClick={() => setIsCreateOpen(true)}>
          New Item
        </Button>
      </div>
    </header>

      <ItemCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        isPro={isPro}
        defaultType={defaultType}
      />
    </>
  );
}
