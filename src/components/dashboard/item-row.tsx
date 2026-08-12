"use client";

import { createElement } from "react";
import { Pin } from "lucide-react";

import type { DashboardItem } from "@/lib/db/items";
import { formatShortDate } from "@/lib/format-date";
import { getItemTypeIcon, getItemTypeStyles } from "@/lib/item-type-styles";
import { getTypeColorBorderProps } from "@/lib/type-color-border";
import { cn } from "@/lib/utils";

import { ItemFavoriteButton } from "@/components/items/item-favorite-button";
import { useTypeColorPosition } from "@/components/user-preferences/user-preferences-context";
import { useItemDrawer } from "@/components/items/item-drawer-context";

type ItemRowProps = {
  item: DashboardItem;
};

export function ItemRow({ item }: ItemRowProps) {
  const { openItem } = useItemDrawer();
  const typeColorPosition = useTypeColorPosition();
  const typeStyles = getItemTypeStyles(item.type.color);
  const typeColorBorder = getTypeColorBorderProps(
    item.type.color,
    typeColorPosition,
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => openItem(item.id)}
        className={cn(
          "flex w-full items-start gap-3 rounded-xl border border-border bg-card p-4 pr-12 text-left transition-colors hover:bg-muted/40",
          typeColorBorder.className,
        )}
        style={typeColorBorder.style}
      >
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            typeStyles.textClassName,
            typeStyles.bgClassName,
            !item.type.color && "bg-muted text-muted-foreground",
          )}
          style={{ ...typeStyles.textStyle, ...typeStyles.bgStyle }}
        >
          {createElement(getItemTypeIcon(item.type.icon), { className: "size-4" })}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-medium">{item.title}</h3>
                {item.isPinned ? (
                  <Pin className="size-3.5 shrink-0 text-muted-foreground" />
                ) : null}
              </div>
              {item.description ? (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
              ) : null}
            </div>
            <time
              dateTime={item.updatedAt.toISOString()}
              className="shrink-0 text-xs text-muted-foreground"
            >
              {formatShortDate(item.updatedAt)}
            </time>
          </div>
          {item.tags.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </button>
      <ItemFavoriteButton
        key={`${item.id}-${item.isFavorite}`}
        itemId={item.id}
        isFavorite={item.isFavorite}
        className="absolute top-4 right-4"
      />
    </div>
  );
}
