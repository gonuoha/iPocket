"use client";

import { Download, Pin } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import type { DashboardItem } from "@/lib/db/items";
import { cn } from "@/lib/utils";

import { ItemFavoriteButton } from "./item-favorite-button";
import { useItemDrawer } from "./item-drawer-context";

type ImageThumbnailCardProps = {
  item: DashboardItem;
};

export function ImageThumbnailCard({ item }: ImageThumbnailCardProps) {
  const { openItem } = useItemDrawer();

  return (
    <div className="group relative w-full overflow-hidden rounded-xl border border-border bg-card transition-colors hover:bg-muted/40">
      <button
        type="button"
        onClick={() => openItem(item.id)}
        className="w-full text-left"
      >
        <div className="relative aspect-video overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/items/${item.id}/download`}
            alt={item.title}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {item.isPinned ? (
            <div className="absolute top-2 left-2 flex items-center gap-1">
              <span className="rounded-md bg-background/80 p-1 backdrop-blur-sm">
                <Pin className="size-3.5 text-muted-foreground" />
              </span>
            </div>
          ) : null}
        </div>
        <div className="px-3 py-2 pr-10">
          <h3 className="truncate text-sm font-medium">{item.title}</h3>
        </div>
      </button>
      <ItemFavoriteButton
        key={`${item.id}-${item.isFavorite}`}
        itemId={item.id}
        isFavorite={item.isFavorite}
        className="absolute top-2 right-2 rounded-md bg-background/80 backdrop-blur-sm"
      />
      <a
        href={`/api/items/${item.id}/download?download=1`}
        download
        onClick={(event) => event.stopPropagation()}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon-xs" }),
          "absolute right-2 bottom-2 text-muted-foreground hover:text-foreground",
        )}
      >
        <Download />
        <span className="sr-only">Download</span>
      </a>
    </div>
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
