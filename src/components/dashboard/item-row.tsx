import Link from "next/link";
import { FileText, Pin, Star } from "lucide-react";

import {
  itemTypeBgColors,
  itemTypeColors,
  itemTypeIcons,
} from "@/lib/item-type-styles";
import { itemTypes, type Item } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

type ItemRowProps = {
  item: Item;
};

export function ItemRow({ item }: ItemRowProps) {
  const type = itemTypes.find((entry) => entry.id === item.typeId);
  const Icon = type ? itemTypeIcons[type.icon] : FileText;

  return (
    <Link
      href={`/items/${item.id}`}
      className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/40"
    >
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg",
          type
            ? [itemTypeBgColors[type.color], itemTypeColors[type.color]]
            : ["bg-muted", "text-muted-foreground"]
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
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
            {item.description ? (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {item.description}
              </p>
            ) : null}
          </div>
          <time
            dateTime={item.updatedAt}
            className="shrink-0 text-xs text-muted-foreground"
          >
            {formatDate(item.updatedAt)}
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
    </Link>
  );
}
