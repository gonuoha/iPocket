"use client";

import { createElement, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowDownUp,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Pin,
  Star,
} from "lucide-react";

import { CollectionFavoriteButton } from "@/components/collections/collection-favorite-button";
import { ItemFavoriteButton } from "@/components/items/item-favorite-button";
import { useItemDrawer } from "@/components/items/item-drawer-context";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FavoriteCollection } from "@/lib/db/collections";
import type { DashboardItem } from "@/lib/db/items";
import { formatShortDateWithYear } from "@/lib/format-date";
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

const FAVORITES_ROW_GRID =
  "sm:grid sm:grid-cols-[minmax(0,1fr)_7rem_7rem_4.5rem] sm:items-center sm:gap-4";

function TypeBadge({
  label,
  color,
}: {
  label: string;
  color?: string | null;
}) {
  const styles = getItemTypeStyles(color ?? null);

  return (
    <Badge
      variant="outline"
      className={cn(
        "w-fit border-transparent px-2 py-0.5 text-[11px] font-medium",
        styles.bgClassName,
        styles.textClassName,
      )}
      style={{ ...styles.bgStyle, ...styles.textStyle }}
    >
      {label}
    </Badge>
  );
}

function FavoritesTableBody({
  children,
  columns,
}: {
  children: React.ReactNode;
  columns: string[];
}) {
  return (
    <>
      <div
        className={cn(
          "hidden border-t border-border/60 bg-muted/30 px-4 py-2.5 text-xs font-medium tracking-wide text-muted-foreground uppercase",
          FAVORITES_ROW_GRID,
        )}
      >
        {columns.map((column) => (
          <span
            key={column}
            className={cn(
              column === "Updated" && "text-right",
              column === "Actions" && "sr-only",
            )}
          >
            {column}
          </span>
        ))}
      </div>
      <div className="divide-y divide-border/60 border-t border-border/60">
        {children}
      </div>
    </>
  );
}

function FavoritesCollapsibleSection({
  id,
  icon,
  title,
  count,
  subtitle,
  sortControl,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  count: number;
  subtitle: string;
  sortControl: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const contentId = `${id}-content`;

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={contentId}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold leading-none">{title}</h2>
              <Badge variant="secondary" className="rounded-full px-2 py-0 text-xs">
                {count}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              open ? "rotate-0" : "-rotate-90",
            )}
          />
        </button>
        {open ? (
          <div
            className="shrink-0"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            {sortControl}
          </div>
        ) : null}
      </div>
      {open ? <div id={contentId}>{children}</div> : null}
    </section>
  );
}

type FavoriteItemRowProps = {
  item: DashboardItem;
};

function FavoriteItemRow({ item }: FavoriteItemRowProps) {
  const { openItem } = useItemDrawer();
  const typeStyles = getItemTypeStyles(item.type.color);
  const TypeIcon = getItemTypeIcon(item.type.icon);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => openItem(item.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openItem(item.id);
        }
      }}
      className={cn(
        "group grid w-full cursor-pointer grid-cols-1 gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/40",
        FAVORITES_ROW_GRID,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            typeStyles.bgClassName,
            typeStyles.textClassName,
            !item.type.color && "bg-muted text-muted-foreground",
          )}
          style={{ ...typeStyles.bgStyle, ...typeStyles.textStyle }}
        >
          {createElement(TypeIcon, { className: "size-4" })}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium">{item.title}</span>
            {item.isPinned ? (
              <Pin
                className="size-3.5 shrink-0 text-muted-foreground"
                aria-label="Pinned"
              />
            ) : null}
          </div>
          {item.description ? (
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {item.description}
            </p>
          ) : null}
          <div className="mt-2 flex items-center gap-2 sm:hidden">
            <TypeBadge label={getItemTypeLabel(item.type.name)} color={item.type.color} />
            <time
              dateTime={item.updatedAt.toISOString()}
              className="text-xs text-muted-foreground tabular-nums"
            >
              {formatShortDateWithYear(item.updatedAt)}
            </time>
          </div>
        </div>
      </div>

      <div className="hidden sm:block">
        <TypeBadge label={getItemTypeLabel(item.type.name)} color={item.type.color} />
      </div>

      <time
        dateTime={item.updatedAt.toISOString()}
        className="hidden text-right text-sm text-muted-foreground tabular-nums sm:block"
      >
        {formatShortDateWithYear(item.updatedAt)}
      </time>

      <div className="flex items-center justify-end gap-1">
        <ItemFavoriteButton
          key={`${item.id}-${item.isFavorite}`}
          itemId={item.id}
          isFavorite={item.isFavorite}
        />
        <ChevronRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </div>
  );
}

type FavoriteCollectionRowProps = {
  collection: FavoriteCollection;
};

function FavoriteCollectionRow({ collection }: FavoriteCollectionRowProps) {
  const router = useRouter();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/collections/${collection.id}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(`/collections/${collection.id}`);
        }
      }}
      className={cn(
        "group grid w-full cursor-pointer grid-cols-1 gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40",
        FAVORITES_ROW_GRID,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FolderOpen className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="block truncate font-medium">{collection.name}</span>
          <div className="mt-2 flex items-center gap-2 sm:hidden">
            <TypeBadge label="Collection" />
            <time
              dateTime={collection.updatedAt.toISOString()}
              className="text-xs text-muted-foreground tabular-nums"
            >
              {formatShortDateWithYear(collection.updatedAt)}
            </time>
          </div>
        </div>
      </div>

      <div className="hidden sm:block">
        <TypeBadge label="Collection" />
      </div>

      <time
        dateTime={collection.updatedAt.toISOString()}
        className="hidden text-right text-sm text-muted-foreground tabular-nums sm:block"
      >
        {formatShortDateWithYear(collection.updatedAt)}
      </time>

      <div className="flex items-center justify-end gap-1">
        <CollectionFavoriteButton
          collectionId={collection.id}
          isFavorite
          variant="icon"
        />
        <ChevronRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </div>
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
        className="flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <ArrowDownUp className="size-3.5" />
        Sort by
      </Label>
      <Select value={sort} onValueChange={(value) => onSortChange(value as T)}>
        <SelectTrigger id={id} size="sm" className="min-w-36 bg-card">
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
      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
        <Star className="mx-auto size-8 text-muted-foreground/50" />
        <p className="mt-3 font-medium">No favorites yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Star items or collections to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {hasItems ? (
        <FavoritesCollapsibleSection
          id="favorites-items"
          icon={<Star className="size-4 fill-favorite text-favorite" />}
          title="Items"
          count={sortedItems.length}
          subtitle="Starred knowledge across your workspace"
          sortControl={
            <FavoritesSortControl
              id="favorites-item-sort"
              sort={itemSort}
              options={FAVORITE_ITEM_SORT_OPTIONS}
              labels={ITEM_SORT_LABELS}
              onSortChange={(nextSort) => updateSortParam("itemSort", nextSort)}
            />
          }
        >
          <FavoritesTableBody columns={["Name", "Type", "Updated", "Actions"]}>
            {sortedItems.map((item) => (
              <FavoriteItemRow key={item.id} item={item} />
            ))}
          </FavoritesTableBody>
        </FavoritesCollapsibleSection>
      ) : null}

      {hasCollections ? (
        <FavoritesCollapsibleSection
          id="favorites-collections"
          icon={<FolderOpen className="size-4 text-primary" />}
          title="Collections"
          count={sortedCollections.length}
          subtitle="Organized groups you return to often"
          sortControl={
            <FavoritesSortControl
              id="favorites-collection-sort"
              sort={collectionSort}
              options={FAVORITE_COLLECTION_SORT_OPTIONS}
              labels={COLLECTION_SORT_LABELS}
              onSortChange={(nextSort) =>
                updateSortParam("collectionSort", nextSort)
              }
            />
          }
        >
          <FavoritesTableBody columns={["Name", "Type", "Updated", "Actions"]}>
            {sortedCollections.map((collection) => (
              <FavoriteCollectionRow key={collection.id} collection={collection} />
            ))}
          </FavoritesTableBody>
        </FavoritesCollapsibleSection>
      ) : null}
    </div>
  );
}
