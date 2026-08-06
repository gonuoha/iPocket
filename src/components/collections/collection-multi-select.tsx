"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronsUpDownIcon, SearchIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SelectableCollection } from "@/lib/db/collections";
import { cn } from "@/lib/utils";

export type { SelectableCollection };

type CollectionMultiSelectProps = {
  id?: string;
  collections: SelectableCollection[];
  value: string[];
  onChange: (collectionIds: string[]) => void;
  disabled?: boolean;
};

function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function CollectionMultiSelect({
  id,
  collections,
  value,
  onChange,
  disabled = false,
}: CollectionMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCollections = useMemo(
    () => collections.filter((collection) => value.includes(collection.id)),
    [collections, value],
  );

  const filteredCollections = useMemo(() => {
    const normalizedQuery = normalizeSearchQuery(searchQuery);

    if (!normalizedQuery) {
      return collections;
    }

    return collections.filter((collection) =>
      collection.name.toLowerCase().includes(normalizedQuery),
    );
  }, [collections, searchQuery]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      setSearchQuery("");
    }
  }

  function toggleCollection(collectionId: string, checked: boolean) {
    if (disabled) {
      return;
    }

    if (checked) {
      onChange([...value, collectionId]);
      return;
    }

    onChange(value.filter((id) => id !== collectionId));
  }

  if (collections.length === 0) {
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>Collections</Label>
        <p className="text-sm text-muted-foreground">
          No collections yet. Create one from the top bar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Collections</Label>
      <DropdownMenu open={open} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger
          id={id}
          disabled={disabled}
          className={cn(
            "flex h-auto min-h-8 w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent py-1.5 pr-2 pl-2 text-sm transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:hover:bg-input/50",
          )}
        >
          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {selectedCollections.length === 0 ? (
              <span className="text-muted-foreground">Select collections</span>
            ) : (
              selectedCollections.map((collection) => (
                <span
                  key={collection.id}
                  className="inline-flex max-w-full items-center rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs font-medium text-foreground"
                >
                  <span className="truncate">{collection.name}</span>
                </span>
              ))
            )}
          </span>
          <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-(--anchor-width) p-0">
          <div
            className="border-b border-border p-2"
            onPointerDown={(event) => event.preventDefault()}
          >
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => event.stopPropagation()}
                placeholder="Search collections..."
                className="h-8 pl-8"
                aria-label="Search collections"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredCollections.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                No collections found.
              </p>
            ) : (
              filteredCollections.map((collection) => (
                <DropdownMenuCheckboxItem
                  key={collection.id}
                  checked={value.includes(collection.id)}
                  onCheckedChange={(checked) =>
                    toggleCollection(collection.id, checked)
                  }
                  className="pr-2 pl-7 [&>span]:right-auto [&>span]:left-2"
                >
                  {collection.name}
                </DropdownMenuCheckboxItem>
              ))
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
