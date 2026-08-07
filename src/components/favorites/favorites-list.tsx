"use client";

import { createElement } from "react";
import Link from "next/link";
import { FolderOpen } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useItemDrawer } from "@/components/items/item-drawer-context";
import type { FavoriteCollection } from "@/lib/db/collections";
import type { DashboardItem } from "@/lib/db/items";
import {
  getItemTypeIcon,
  getItemTypeLabel,
  getItemTypeStyles,
} from "@/lib/item-type-styles";
import { cn } from "@/lib/utils";

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

type FavoritesListProps = {
  items: DashboardItem[];
  collections: FavoriteCollection[];
};

export function FavoritesList({ items, collections }: FavoritesListProps) {
  const hasItems = items.length > 0;
  const hasCollections = collections.length > 0;

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
          <h2 className="mb-1 px-2 font-mono text-xs text-muted-foreground uppercase tracking-wide">
            Items ({items.length})
          </h2>
          <div className="border border-border">
            {items.map((item) => (
              <FavoriteItemRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      {hasCollections ? (
        <section>
          <h2 className="mb-1 px-2 font-mono text-xs text-muted-foreground uppercase tracking-wide">
            Collections ({collections.length})
          </h2>
          <div className="border border-border">
            {collections.map((collection) => (
              <FavoriteCollectionRow key={collection.id} collection={collection} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
