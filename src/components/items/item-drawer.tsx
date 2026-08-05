"use client";

import { createElement, useEffect, useState } from "react";
import {
  Copy,
  Pencil,
  Pin,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ItemDetail } from "@/lib/db/items";
import { getItemTypeIcon, getItemTypeStyles } from "@/lib/item-type-styles";
import { cn } from "@/lib/utils";

import { useItemDrawer } from "./item-drawer-context";

type ItemDetailResponse = Omit<ItemDetail, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

function formatLongDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function ItemDrawerSkeleton() {
  return (
    <div className="space-y-6 px-1">
      <div className="space-y-3">
        <div className="h-6 w-2/3 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-1/3 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="h-10 animate-pulse rounded-lg bg-muted" />
      <div className="space-y-2">
        <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
        <div className="h-20 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-20 animate-pulse rounded-md bg-muted" />
        <div className="h-40 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}

function ItemDrawerContent({ item }: { item: ItemDetailResponse }) {
  async function handleCopy() {
    const textToCopy =
      item.content ??
      item.url ??
      item.fileName ??
      item.description ??
      item.title;

    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "shrink-0",
            item.isFavorite &&
              "border-yellow-400/40 bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/15 hover:text-yellow-400",
          )}
        >
          <Star
            className={cn(
              item.isFavorite && "fill-yellow-400 text-yellow-400",
            )}
          />
          Favorite
        </Button>
        <Button type="button" variant="outline" size="sm" className="shrink-0">
          <Pin />
          Pin
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={handleCopy}
        >
          <Copy />
          Copy
        </Button>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Button type="button" variant="outline" size="sm">
            <Pencil />
            Edit
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="icon-sm"
            aria-label="Delete"
          >
            <Trash2 />
          </Button>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1 pr-4">
        <div className="space-y-6 py-6">
          {item.description ? (
            <section className="space-y-2">
              <h3 className="text-sm font-medium">Description</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </section>
          ) : null}

          {item.content ? (
            <section className="space-y-2">
              <h3 className="text-sm font-medium">Content</h3>
              <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                {item.content}
              </pre>
            </section>
          ) : null}

          {item.url ? (
            <section className="space-y-2">
              <h3 className="text-sm font-medium">URL</h3>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                {item.url}
              </a>
            </section>
          ) : null}

          {item.fileName ? (
            <section className="space-y-2">
              <h3 className="text-sm font-medium">File</h3>
              <p className="text-sm text-muted-foreground">{item.fileName}</p>
            </section>
          ) : null}

          {item.tags.length > 0 ? (
            <section className="space-y-2">
              <h3 className="text-sm font-medium">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {item.collection ? (
            <section className="space-y-2">
              <h3 className="text-sm font-medium">Collections</h3>
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {item.collection.name}
                </span>
              </div>
            </section>
          ) : null}

          <section className="space-y-2">
            <h3 className="text-sm font-medium">Details</h3>
            <dl className="grid gap-2 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Created</dt>
                <dd>{formatLongDate(item.createdAt)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Updated</dt>
                <dd>{formatLongDate(item.updatedAt)}</dd>
              </div>
            </dl>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}

function ItemDrawerPanel({ itemId }: { itemId: string }) {
  const [item, setItem] = useState<ItemDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchItem() {
      try {
        const response = await fetch(`/api/items/${itemId}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            response.status === 404 ? "Item not found" : "Failed to load item",
          );
        }

        const data = (await response.json()) as ItemDetailResponse;
        setItem(data);
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }

        setError(
          fetchError instanceof Error ? fetchError.message : "Failed to load item",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void fetchItem();

    return () => {
      controller.abort();
    };
  }, [itemId]);

  const typeStyles = item ? getItemTypeStyles(item.type.color) : null;

  return (
    <>
      <SheetHeader className="border-b border-border px-6 py-5">
        <div className="flex items-start gap-3 pr-8">
          {item && typeStyles ? (
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-lg",
                typeStyles.textClassName,
                typeStyles.bgClassName,
                !item.type.color && "bg-muted text-muted-foreground",
              )}
              style={{ ...typeStyles.textStyle, ...typeStyles.bgStyle }}
            >
              {createElement(getItemTypeIcon(item.type.icon), {
                className: "size-4",
              })}
            </div>
          ) : (
            <div className="size-10 shrink-0 animate-pulse rounded-lg bg-muted" />
          )}
          <div className="min-w-0 flex-1 space-y-2">
            <SheetTitle className="truncate text-xl">
              {item?.title ?? (isLoading ? "Loading item..." : "Item")}
            </SheetTitle>
            {item ? (
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{item.type.name}</Badge>
                {item.language ? (
                  <Badge variant="outline">{item.language}</Badge>
                ) : null}
              </div>
            ) : (
              <SheetDescription className="sr-only">
                Item details drawer
              </SheetDescription>
            )}
          </div>
        </div>
      </SheetHeader>

      <div className="flex min-h-0 flex-1 flex-col px-6 pb-6">
        {isLoading ? <ItemDrawerSkeleton /> : null}
        {!isLoading && error ? (
          <p className="py-6 text-sm text-destructive">{error}</p>
        ) : null}
        {!isLoading && item ? <ItemDrawerContent item={item} /> : null}
      </div>
    </>
  );
}

export function ItemDrawer() {
  const { selectedItemId, closeItem } = useItemDrawer();

  return (
    <Sheet
      open={selectedItemId !== null}
      onOpenChange={(open) => {
        if (!open) {
          closeItem();
        }
      }}
    >
      <SheetContent
        side="right"
        className="flex w-full max-w-none flex-col gap-0 p-0 sm:max-w-2xl"
      >
        {selectedItemId ? (
          <ItemDrawerPanel key={selectedItemId} itemId={selectedItemId} />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
