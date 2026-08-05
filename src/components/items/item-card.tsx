import { createElement } from "react";
import Link from "next/link";
import { Pin, Star } from "lucide-react";

import type { DashboardItem } from "@/lib/db/items";
import { getItemTypeIcon, getItemTypeStyles } from "@/lib/item-type-styles";
import { cn } from "@/lib/utils";

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

type ItemCardProps = {
  item: DashboardItem;
};

export function ItemCard({ item }: ItemCardProps) {
  const typeStyles = getItemTypeStyles(item.type.color);
  const typeSlug = item.type.name.toLowerCase();

  return (
    <Link
      href={`/items/${typeSlug}/${item.id}`}
      className="flex h-full flex-col rounded-xl border border-border border-l-4 bg-card p-4 transition-colors hover:bg-muted/40"
      style={
        item.type.color?.startsWith("#")
          ? { borderLeftColor: item.type.color }
          : undefined
      }
    >
      <div className="flex items-start gap-3">
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
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-medium">{item.title}</h3>
                {item.isPinned ? (
                  <Pin className="size-3.5 shrink-0 text-muted-foreground" />
                ) : null}
                {item.isFavorite ? (
                  <Star className="size-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
                ) : null}
              </div>
            </div>
            <time
              dateTime={item.updatedAt.toISOString()}
              className="shrink-0 text-xs text-muted-foreground"
            >
              {formatDate(item.updatedAt)}
            </time>
          </div>
          {item.description ? (
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
              {item.description}
            </p>
          ) : null}
        </div>
      </div>
      {item.tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
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
    </Link>
  );
}

type ItemsGridProps = {
  items: DashboardItem[];
};

export function ItemsGrid({ items }: ItemsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
