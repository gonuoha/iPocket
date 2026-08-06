"use client";

import { createElement, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderOpen } from "lucide-react";

import { useItemDrawer } from "@/components/items/item-drawer-context";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { getItemTypeIcon, getItemTypeLabel } from "@/lib/item-type-styles";
import { commandPaletteFilter } from "@/lib/command-palette-filter";
import { cn } from "@/lib/utils";

import { useCommandPalette } from "./command-palette-context";

function getItemKeywords(item: {
  type: { name: string };
  contentPreview: string | null;
}) {
  return [item.type.name, item.contentPreview].filter(
    (keyword): keyword is string => Boolean(keyword),
  );
}

function formatCollectionItemCount(itemCount: number) {
  return `${itemCount} ${itemCount === 1 ? "item" : "items"}`;
}

function CommandListWithScrollHint({
  children,
  className,
  onContentChange,
}: {
  children: React.ReactNode;
  className?: string;
  onContentChange?: unknown;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const [showBottomFade, setShowBottomFade] = useState(false);

  const updateScrollHint = useCallback(() => {
    const list = listRef.current;

    if (!list) {
      return;
    }

    const hasOverflow = list.scrollHeight > list.clientHeight + 1;
    const isScrolledToBottom =
      list.scrollTop + list.clientHeight >= list.scrollHeight - 1;

    setShowBottomFade(hasOverflow && !isScrolledToBottom);
  }, []);

  useEffect(() => {
    updateScrollHint();

    const list = listRef.current;

    if (!list) {
      return;
    }

    const resizeObserver = new ResizeObserver(updateScrollHint);
    resizeObserver.observe(list);

    return () => {
      resizeObserver.disconnect();
    };
  }, [onContentChange, updateScrollHint]);

  return (
    <div className="relative">
      <CommandList
        ref={listRef}
        className={className}
        onScroll={updateScrollHint}
      >
        {children}
      </CommandList>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-1 bottom-0 h-8 rounded-b-xl bg-gradient-to-t from-popover to-transparent transition-opacity",
          showBottomFade ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}

export function CommandPalette() {
  const router = useRouter();
  const { open, closePalette, openPalette, searchData } = useCommandPalette();
  const { openItem } = useItemDrawer();

  function handleItemSelect(itemId: string) {
    closePalette();
    openItem(itemId);
  }

  function handleCollectionSelect(collectionId: string) {
    closePalette();
    router.push(`/collections/${collectionId}`);
  }

  return (
    <CommandDialog
      title="Search"
      description="Search items and collections"
      filter={commandPaletteFilter}
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          openPalette();
          return;
        }

        closePalette();
      }}
    >
      <CommandInput placeholder="Search items and collections..." />
      <CommandListWithScrollHint
        onContentChange={[searchData.items.length, searchData.collections.length, open]}
      >
        <CommandEmpty>No results found.</CommandEmpty>

        {searchData.items.length > 0 ? (
          <CommandGroup heading="Items">
            {searchData.items.map((item) => {
              const Icon = getItemTypeIcon(item.type.icon);

              return (
                <CommandItem
                  key={item.id}
                  value={item.title}
                  keywords={getItemKeywords(item)}
                  onSelect={() => handleItemSelect(item.id)}
                >
                  {createElement(Icon, { className: "size-4 shrink-0" })}
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate">{item.title}</span>
                    {item.contentPreview ? (
                      <span className="truncate text-xs text-muted-foreground">
                        {item.contentPreview}
                      </span>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {getItemTypeLabel(item.type.name)}
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        ) : null}

        {searchData.collections.length > 0 ? (
          <CommandGroup heading="Collections">
            {searchData.collections.map((collection) => (
              <CommandItem
                key={collection.id}
                value={collection.name}
                onSelect={() => handleCollectionSelect(collection.id)}
              >
                <FolderOpen className="size-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{collection.name}</span>
                <span className="w-[4.75rem] shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                  {formatCollectionItemCount(collection.itemCount)}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}
      </CommandListWithScrollHint>
    </CommandDialog>
  );
}
