"use client";

import { createElement, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  Download,
  Pencil,
  Pin,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { deleteItem, updateItem } from "@/actions/items";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  CODE_EDITOR_TYPE_NAMES,
  CodeEditor,
} from "@/components/code-editor/code-editor";
import {
  MARKDOWN_EDITOR_TYPE_NAMES,
  MarkdownEditor,
} from "@/components/markdown-editor/markdown-editor";
import { Textarea } from "@/components/ui/textarea";
import type { ItemDetail } from "@/lib/db/items";
import { formatFileSize } from "@/lib/file-upload";
import { getItemTypeIcon, getItemTypeStyles } from "@/lib/item-type-styles";
import { cn } from "@/lib/utils";

import { useItemDrawer } from "./item-drawer-context";

type ItemDetailResponse = Omit<ItemDetail, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

type EditFormState = {
  title: string;
  description: string;
  content: string;
  url: string;
  language: string;
  tags: string;
};

const CONTENT_TYPE_NAMES = new Set(["snippet", "prompt", "command", "note"]);
const LANGUAGE_TYPE_NAMES = new Set(["snippet", "command"]);
const URL_TYPE_NAMES = new Set(["link"]);

function formatLongDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function toFormState(item: ItemDetailResponse): EditFormState {
  return {
    title: item.title,
    description: item.description ?? "",
    content: item.content ?? "",
    url: item.url ?? "",
    language: item.language ?? "",
    tags: item.tags.join(", "),
  };
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

function ItemDrawerContent({
  item,
  onEdit,
  onDelete,
}: {
  item: ItemDetailResponse;
  onEdit: () => void;
  onDelete: () => void;
}) {
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
          <Button type="button" variant="outline" size="sm" onClick={onEdit}>
            <Pencil />
            Edit
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="icon-sm"
            aria-label="Delete"
            onClick={onDelete}
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
              {CODE_EDITOR_TYPE_NAMES.has(item.type.name.toLowerCase()) ? (
                <CodeEditor
                  value={item.content}
                  language={item.language ?? undefined}
                  readOnly
                />
              ) : MARKDOWN_EDITOR_TYPE_NAMES.has(item.type.name.toLowerCase()) ? (
                <MarkdownEditor value={item.content} readOnly />
              ) : (
                <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                  {item.content}
                </pre>
              )}
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

          {item.fileName && item.type.name.toLowerCase() === "image" ? (
            <section className="space-y-2">
              <h3 className="text-sm font-medium">Image</h3>
              <div className="overflow-hidden rounded-lg border border-border bg-muted/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/items/${item.id}/download`}
                  alt={item.fileName}
                  className="max-h-80 w-full object-contain"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {item.fileName}
                {item.fileSize ? ` · ${formatFileSize(item.fileSize)}` : ""}
              </p>
            </section>
          ) : null}

          {item.fileName && item.type.name.toLowerCase() === "file" ? (
            <section className="space-y-3">
              <h3 className="text-sm font-medium">File</h3>
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <p className="text-sm font-medium">{item.fileName}</p>
                {item.fileSize ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatFileSize(item.fileSize)}
                  </p>
                ) : null}
              </div>
              <a
                href={`/api/items/${item.id}/download?download=1`}
                download={item.fileName}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <Download />
                Download
              </a>
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

function ItemDrawerEditor({
  item,
  formState,
  onChange,
  onCancel,
  onSave,
  isSaving,
}: {
  item: ItemDetailResponse;
  formState: EditFormState;
  onChange: (patch: Partial<EditFormState>) => void;
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
}) {
  const typeName = item.type.name.toLowerCase();
  const showContent = CONTENT_TYPE_NAMES.has(typeName);
  const showLanguage = LANGUAGE_TYPE_NAMES.has(typeName);
  const showUrl = URL_TYPE_NAMES.has(typeName);
  const useCodeEditor = CODE_EDITOR_TYPE_NAMES.has(typeName);
  const useMarkdownEditor = MARKDOWN_EDITOR_TYPE_NAMES.has(typeName);
  const canSave = formState.title.trim().length > 0 && !isSaving;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-end gap-2 border-b border-border pb-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button type="button" size="sm" onClick={onSave} disabled={!canSave}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>

      <ScrollArea className="min-h-0 flex-1 pr-4">
        <div className="space-y-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="item-edit-title">Title</Label>
            <Input
              id="item-edit-title"
              value={formState.title}
              onChange={(event) => onChange({ title: event.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="item-edit-description">Description</Label>
            <Textarea
              id="item-edit-description"
              value={formState.description}
              onChange={(event) =>
                onChange({ description: event.target.value })
              }
              rows={3}
            />
          </div>

          {showContent ? (
            <div className="space-y-2">
              <Label htmlFor="item-edit-content">Content</Label>
              {useCodeEditor ? (
                <CodeEditor
                  id="item-edit-content"
                  value={formState.content}
                  language={formState.language}
                  onChange={(content) => onChange({ content })}
                />
              ) : useMarkdownEditor ? (
                <MarkdownEditor
                  id="item-edit-content"
                  value={formState.content}
                  onChange={(content) => onChange({ content })}
                />
              ) : (
                <Textarea
                  id="item-edit-content"
                  value={formState.content}
                  onChange={(event) =>
                    onChange({ content: event.target.value })
                  }
                  className="min-h-40 font-mono text-sm"
                />
              )}
            </div>
          ) : null}

          {showLanguage ? (
            <div className="space-y-2">
              <Label htmlFor="item-edit-language">Language</Label>
              <Input
                id="item-edit-language"
                value={formState.language}
                onChange={(event) =>
                  onChange({ language: event.target.value })
                }
              />
            </div>
          ) : null}

          {showUrl ? (
            <div className="space-y-2">
              <Label htmlFor="item-edit-url">URL</Label>
              <Input
                id="item-edit-url"
                value={formState.url}
                onChange={(event) => onChange({ url: event.target.value })}
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="item-edit-tags">Tags</Label>
            <Input
              id="item-edit-tags"
              value={formState.tags}
              onChange={(event) => onChange({ tags: event.target.value })}
              placeholder="Comma-separated tags"
            />
          </div>

          <section className="space-y-2">
            <h3 className="text-sm font-medium">Type</h3>
            <Badge variant="secondary">{item.type.name}</Badge>
          </section>

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
  const router = useRouter();
  const { closeItem } = useItemDrawer();
  const [item, setItem] = useState<ItemDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [formState, setFormState] = useState<EditFormState | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSaving, startSaving] = useTransition();
  const [isDeleting, startDeleting] = useTransition();

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

  function handleEdit() {
    if (!item) {
      return;
    }

    setFormState(toFormState(item));
    setMode("edit");
  }

  function handleCancel() {
    setFormState(null);
    setMode("view");
  }

  function handleFormChange(patch: Partial<EditFormState>) {
    setFormState((previous) => (previous ? { ...previous, ...patch } : previous));
  }

  function handleDeleteConfirm() {
    if (!item) {
      return;
    }

    startDeleting(async () => {
      const result = await deleteItem(item.id);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setIsDeleteOpen(false);
      toast.success("Item deleted");
      closeItem();
      router.refresh();
    });
  }

  function handleSave() {
    if (!item || !formState) {
      return;
    }

    const title = formState.title.trim();

    if (!title) {
      return;
    }

    startSaving(async () => {
      const result = await updateItem(item.id, {
        title,
        description: formState.description,
        content: formState.content,
        url: formState.url,
        language: formState.language,
        tags: formState.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setItem({
        ...result.data,
        createdAt: result.data.createdAt.toISOString(),
        updatedAt: result.data.updatedAt.toISOString(),
      });
      setFormState(null);
      setMode("view");
      toast.success("Item updated");
      router.refresh();
    });
  }

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
        {!isLoading && item && mode === "view" ? (
          <ItemDrawerContent
            item={item}
            onEdit={handleEdit}
            onDelete={() => setIsDeleteOpen(true)}
          />
        ) : null}
        {!isLoading && item && mode === "edit" && formState ? (
          <ItemDrawerEditor
            item={item}
            formState={formState}
            onChange={handleFormChange}
            onCancel={handleCancel}
            onSave={handleSave}
            isSaving={isSaving}
          />
        ) : null}
      </div>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &ldquo;{item?.title}&rdquo;. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
