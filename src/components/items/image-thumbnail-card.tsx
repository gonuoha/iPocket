"use client";

import { Pin, Star } from "lucide-react";

import type { DashboardItem } from "@/lib/db/items";

import { useItemDrawer } from "./item-drawer-context";

type ImageThumbnailCardProps = {
  item: DashboardItem;
};

export function ImageThumbnailCard({ item }: ImageThumbnailCardProps) {
  const { openItem } = useItemDrawer();

  return (
    <button
      type="button"
      onClick={() => openItem(item.id)}
      className="group w-full overflow-hidden rounded-xl border border-border bg-card text-left transition-colors hover:bg-muted/40"
    >
      <div className="relative aspect-video overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/items/${item.id}/download`}
          alt={item.title}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {item.isPinned || item.isFavorite ? (
          <div className="absolute top-2 right-2 flex items-center gap-1">
            {item.isPinned ? (
              <span className="rounded-md bg-background/80 p-1 backdrop-blur-sm">
                <Pin className="size-3.5 text-muted-foreground" />
              </span>
            ) : null}
            {item.isFavorite ? (
              <span className="rounded-md bg-background/80 p-1 backdrop-blur-sm">
                <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="px-3 py-2">
        <h3 className="truncate text-sm font-medium">{item.title}</h3>
      </div>
    </button>
  );
}

type ImageGalleryGridProps = {
  items: DashboardItem[];
};

export function ImageGalleryGrid({ items }: ImageGalleryGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ImageThumbnailCard key={item.id} item={item} />
      ))}
    </div>
  );
}
