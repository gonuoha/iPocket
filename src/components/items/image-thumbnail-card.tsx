"use client";

import { Download, Pin, Star } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import type { DashboardItem } from "@/lib/db/items";
import { cn } from "@/lib/utils";

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
        <div className="px-3 py-2 pr-10">
          <h3 className="truncate text-sm font-medium">{item.title}</h3>
        </div>
      </button>
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
