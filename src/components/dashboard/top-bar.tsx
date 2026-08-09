"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderOpen, PanelLeft, Search, Star } from "lucide-react";

import { CollectionCreateDialog } from "@/components/collections/collection-create-dialog";
import { ItemCreateDialog } from "@/components/items/item-create-dialog";
import { useCommandPalette } from "@/components/search/command-palette-context";
import { UpgradePrompt } from "@/components/shared/upgrade-prompt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchShortcutLabel } from "@/hooks/use-search-shortcut-label";
import type { SelectableCollection } from "@/lib/db/collections";
import {
  isAtCollectionLimit,
  isAtItemLimit,
} from "@/lib/subscription-limits";
import { parseCreatableItemTypeFromPathname } from "@/lib/validations/items";
import { cn } from "@/lib/utils";

import { useSidebar } from "./sidebar-context";

export function TopBar({
  isPro,
  collections,
  itemCount,
  collectionCount,
}: {
  isPro: boolean;
  collections: SelectableCollection[];
  itemCount: number;
  collectionCount: number;
}) {
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const { openPalette } = useCommandPalette();
  const searchShortcutLabel = useSearchShortcutLabel();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCollectionCreateOpen, setIsCollectionCreateOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<
    "item_limit" | "collection_limit" | null
  >(null);
  const defaultType = parseCreatableItemTypeFromPathname(pathname);

  function handleNewItemClick() {
    if (isAtItemLimit(itemCount, isPro)) {
      setUpgradeReason("item_limit");
      return;
    }

    setIsCreateOpen(true);
  }

  function handleNewCollectionClick() {
    if (isAtCollectionLimit(collectionCount, isPro)) {
      setUpgradeReason("collection_limit");
      return;
    }

    setIsCollectionCreateOpen(true);
  }

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
          <FolderOpen className="size-6 shrink-0 text-primary" aria-hidden="true" />
          <span className="truncate">iPocket</span>
        </Link>
      </div>

      <div className="relative hidden min-w-0 max-w-xs justify-self-center md:block md:w-full">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          readOnly
          placeholder={`Search items, collections... (${searchShortcutLabel})`}
          className="h-9 w-full cursor-pointer pr-14 pl-9"
          onClick={openPalette}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openPalette();
            }
          }}
          aria-label="Open search"
        />
        <kbd
          className={cn(
            "pointer-events-none absolute top-1/2 right-3 -translate-y-1/2",
            "rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground",
          )}
        >
          {searchShortcutLabel}
        </kbd>
      </div>

      <div className="flex shrink-0 items-center gap-2 justify-self-end">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          nativeButton={false}
          render={<Link href="/favorites" aria-label="Favorites" />}
        >
          <Star
            className={cn(
              pathname === "/favorites" && "fill-yellow-400 text-yellow-400",
            )}
          />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:inline-flex"
          onClick={handleNewCollectionClick}
        >
          New Collection
        </Button>
        <Button size="sm" onClick={handleNewItemClick}>
          New Item
        </Button>
      </div>
    </header>

      <CollectionCreateDialog
        open={isCollectionCreateOpen}
        onOpenChange={setIsCollectionCreateOpen}
        collectionCount={collectionCount}
        isPro={isPro}
      />

      <ItemCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        isPro={isPro}
        itemCount={itemCount}
        defaultType={defaultType}
        collections={collections}
      />

      <UpgradePrompt
        open={upgradeReason !== null}
        onOpenChange={(open) => {
          if (!open) {
            setUpgradeReason(null);
          }
        }}
        reason={upgradeReason ?? "general"}
      />
    </>
  );
}
