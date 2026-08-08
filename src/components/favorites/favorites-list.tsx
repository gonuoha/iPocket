"use client";

import { createElement, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowDownUp, FolderOpen } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useItemDrawer } from "@/components/items/item-drawer-context";
import type { FavoriteCollection } from "@/lib/db/collections";
import type { DashboardItem } from "@/lib/db/items";
import {
  type FavoriteCollectionSortField,
  FAVORITE_COLLECTION_SORT_OPTIONS,
  type FavoriteItemSortField,
  FAVORITE_ITEM_SORT_OPTIONS,
  parseFavoriteCollectionSortParam,
  parseFavoriteItemSortParam,
  sortFavoriteCollections,
  sortFavoriteItems,
} from "@/lib/favorites-sort";
import {
  getItemTypeIcon,
  getItemTypeLabel,
  getItemTypeStyles,
} from "@/lib/item-type-styles";
import { cn } from "@/lib/utils";

const ITEM_SORT_LABELS: Record<FavoriteItemSortField, string> = {
  newest: "Newest",
  oldest: "Oldest",
  "name-asc": "Name A-Z",
  "name-desc": "Name Z-A",
  type: "Type",
};

const COLLECTION_SORT_LABELS: Record<FavoriteCollectionSortField, string> = {
  newest: "Newest",
  oldest: "Oldest",
  "name-asc": "Name A-Z",
  "name-desc": "Name Z-A",
};

function formatFavoriteDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

type FavoriteItemRowProps = {
  item: DashboardItem;
};

function FavoriteItemRow({ item }: FavoriteItemRowProps) {
  const { openItem } = useItemDrawer();
  const typeStyles = getItemTypeStyles(item.type.color);
  const TypeIcon = getItemTypeIcon(item.type.icon);

  return (
    <button
      type="button"
      onClick={() => openItem(item.id)}
      className="flex w-full items-center gap-3 border-b border-border px-2 py-1.5 text-left font-mono text-sm transition-colors hover:bg-muted/50"
    >
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center",
          typeStyles.textClassName,
          !item.type.color && "text-muted-foreground",
        )}
        style={typeStyles.textStyle}
      >
        {createElement(TypeIcon, { className: "size-3.5" })}
      </span>
      <span className="min-w-0 flex-1 truncate">{item.title}</span>
      <Badge variant="outline" className="shrink-0 font-mono text-[10px] uppercase">
        {getItemTypeLabel(item.type.name)}
      </Badge>
      <time
        dateTime={item.updatedAt.toISOString()}
        className="shrink-0 text-xs text-muted-foreground tabular-nums"
      >
        {formatFavoriteDate(item.updatedAt)}
      </time>
    </button>
  );
}

type FavoriteCollectionRowProps = {
  collection: FavoriteCollection;
};

function FavoriteCollectionRow({ collection }: FavoriteCollectionRowProps) {
  return (
    <Link
      href={`/collections/${collection.id}`}
      className="flex w-full items-center gap-3 border-b border-border px-2 py-1.5 font-mono text-sm transition-colors hover:bg-muted/50"
    >
      <span className="flex size-6 shrink-0 items-center justify-center text-muted-foreground">
        <FolderOpen className="size-3.5" />
      </span>
      <span className="min-w-0 flex-1 truncate">{collection.name}</span>
      <Badge variant="outline" className="shrink-0 font-mono text-[10px] uppercase">
        Collection
      </Badge>
      <time
        dateTime={collection.updatedAt.toISOString()}
        className="shrink-0 text-xs text-muted-foreground tabular-nums"
      >
        {formatFavoriteDate(collection.updatedAt)}
      </time>
    </Link>
  );
}

type FavoritesSortControlProps<T extends string> = {
  id: string;
  sort: T;
  options: readonly T[];
  labels: Record<T, string>;
  onSortChange: (sort: T) => void;
};

function FavoritesSortControl<T extends string>({
  id,
  sort,
  options,
  labels,
  onSortChange,
}: FavoritesSortControlProps<T>) {
  return (
    <div className="flex items-center gap-2">
      <Label
        htmlFor={id}
        className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground uppercase tracking-wide"
      >
        <ArrowDownUp className="size-3.5" />
        Sort by
      </Label>
      <Select value={sort} onValueChange={(value) => onSortChange(value as T)}>
        <SelectTrigger id={id} size="sm" className="min-w-32 font-mono">
          <SelectValue>{labels[sort]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {labels[option]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

type FavoritesListProps = {
  items: DashboardItem[];
  collections: FavoriteCollection[];
};

export function FavoritesList({ items, collections }: FavoritesListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const legacySort = searchParams.get("sort");
  const itemSort = parseFavoriteItemSortParam(
    searchParams.get("itemSort") ?? legacySort,
  );
  const collectionSort = parseFavoriteCollectionSortParam(
    searchParams.get("collectionSort") ?? legacySort,
  );

  const sortedItems = useMemo(
    () => sortFavoriteItems(items, itemSort),
    [items, itemSort],
  );
  const sortedCollections = useMemo(
    () => sortFavoriteCollections(collections, collectionSort),
    [collections, collectionSort],
  );

  const hasItems = items.length > 0;
  const hasCollections = collections.length > 0;

  function updateSortParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "newest") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    params.delete("sort");

    const query = params.toString();
    router.replace(query ? `/favorites?${query}` : "/favorites", { scroll: false });
  }

  if (!hasItems && !hasCollections) {
    return (
      <p className="font-mono text-sm text-muted-foreground">
        No favorites yet. Star items or collections to see them here.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {hasItems ? (
        <section>
          <div className="mb-1 flex items-center justify-between gap-3 px-2">
            <h2 className="font-mono text-xs text-muted-foreground uppercase tracking-wide">
              Items ({sortedItems.length})
            </h2>
            <FavoritesSortControl
              id="favorites-item-sort"
              sort={itemSort}
              options={FAVORITE_ITEM_SORT_OPTIONS}
              labels={ITEM_SORT_LABELS}
              onSortChange={(nextSort) => updateSortParam("itemSort", nextSort)}
            />
          </div>
          <div className="border border-border">
            {sortedItems.map((item) => (
              <FavoriteItemRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      {hasCollections ? (
        <section>
          <div className="mb-1 flex items-center justify-between gap-3 px-2">
            <h2 className="font-mono text-xs text-muted-foreground uppercase tracking-wide">
              Collections ({sortedCollections.length})
            </h2>
            <FavoritesSortControl
              id="favorites-collection-sort"
              sort={collectionSort}
              options={FAVORITE_COLLECTION_SORT_OPTIONS}
              labels={COLLECTION_SORT_LABELS}
              onSortChange={(nextSort) =>
                updateSortParam("collectionSort", nextSort)
              }
            />
          </div>
          <div className="border border-border">
            {sortedCollections.map((collection) => (
              <FavoriteCollectionRow key={collection.id} collection={collection} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
