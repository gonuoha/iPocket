"use client";

import { createElement, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  Download,
  FileIcon,
  Info,
  Pencil,
  Tag,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { deleteItem, updateItem } from "@/actions/items";
import { explainCode, generateAutoTags, generateSummary, optimizePrompt } from "@/actions/ai";
import {
  CollectionMultiSelect,
  type SelectableCollection,
} from "@/components/collections/collection-multi-select";
import { ItemFavoriteButton } from "@/components/items/item-favorite-button";
import { ItemPinButton } from "@/components/items/item-pin-button";
import { SuggestTagsButton } from "@/components/ai/suggest-tags-button";
import { SuggestedTags } from "@/components/ai/suggested-tags";
import { GenerateSummaryButton } from "@/components/ai/generate-summary-button";
import { SuggestedSummary } from "@/components/ai/suggested-summary";
import { UpgradePrompt } from "@/components/shared/upgrade-prompt";
import {
  buildSummaryContent,
  canGenerateSummary,
} from "@/lib/ai/build-summary-content";
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
  type CodeEditorView,
} from "@/components/code-editor/code-editor";
import { LanguageSelect } from "@/components/code-editor/language-select";
import {
  MARKDOWN_EDITOR_TYPE_NAMES,
  MarkdownEditor,
  type MarkdownEditorView,
} from "@/components/markdown-editor/markdown-editor";
import { Textarea } from "@/components/ui/textarea";
import type { ItemDetail } from "@/lib/db/items";
import { getItemCopyText } from "@/lib/item-copy";
import { formatFileSize } from "@/lib/file-upload";
import { getItemTypeIcon, getItemTypeStyles } from "@/lib/item-type-styles";
import { appendTagToTagsString, parseTagsString } from "@/lib/parse-tags";
import type { z } from "zod";

import { generateAutoTagsSchema } from "@/lib/validations/ai";
import { cn } from "@/lib/utils";

import { useItemDrawer } from "./item-drawer-context";

type AutoTagItemType = z.infer<typeof generateAutoTagsSchema>["type"];

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
  collectionIds: string[];
};

const CONTENT_TYPE_NAMES = new Set(["snippet", "prompt", "command", "note"]);
const LANGUAGE_TYPE_NAMES = new Set(["snippet", "command"]);
const URL_TYPE_NAMES = new Set(["link"]);
const DOWNLOADABLE_TYPE_NAMES = new Set(["file", "image"]);

function isDownloadableItem(item: ItemDetailResponse) {
  return (
    Boolean(item.fileName) &&
    DOWNLOADABLE_TYPE_NAMES.has(item.type.name.toLowerCase())
  );
}

function ItemDownloadLink({
  item,
  className,
}: {
  item: ItemDetailResponse;
  className?: string;
}) {
  if (!isDownloadableItem(item)) {
    return null;
  }

  return (
    <a
      href={`/api/items/${item.id}/download?download=1`}
      download={item.fileName ?? undefined}
      className={buttonVariants({
        variant: "outline",
        size: "sm",
        className: cn("shrink-0", className),
      })}
    >
      <Download />
      Download
    </a>
  );
}

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
    collectionIds: item.collections.map((collection) => collection.id),
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
  isPro,
  onEdit,
  onDelete,
  onFavoriteToggle,
  onPinToggle,
  onItemUpdate,
}: {
  item: ItemDetailResponse;
  isPro: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onFavoriteToggle: (isFavorite: boolean) => void;
  onPinToggle: (isPinned: boolean) => void;
  onItemUpdate: (item: ItemDetailResponse) => void;
}) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [codeView, setCodeView] = useState<CodeEditorView>("code");
  const [isExplaining, startExplain] = useTransition();
  const [optimizedPrompt, setOptimizedPrompt] = useState<string | null>(null);
  const [promptView, setPromptView] = useState<MarkdownEditorView>("original");
  const [isOptimizing, startOptimize] = useTransition();
  const [isAcceptingOptimized, startAcceptOptimized] = useTransition();
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const typeName = item.type.name.toLowerCase();
  const showExplainableCodeEditor = CODE_EDITOR_TYPE_NAMES.has(typeName);
  const showOptimizablePrompt = typeName === "prompt";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(getItemCopyText(item));
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  }

  function handleExplain() {
    if (!item.content?.trim()) {
      return;
    }

    startExplain(async () => {
      const result = await explainCode({
        title: item.title,
        content: item.content ?? "",
        language: item.language ?? undefined,
        type: typeName as "snippet" | "command",
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setExplanation(result.data.explanation);
      setCodeView("explain");
    });
  }

  function handleOptimize() {
    if (!item.content?.trim()) {
      return;
    }

    startOptimize(async () => {
      const result = await optimizePrompt({
        title: item.title,
        content: item.content ?? "",
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      if (!result.data.improved) {
        toast.success("This prompt already looks well-structured");
        return;
      }

      setOptimizedPrompt(result.data.prompt);
      setPromptView("optimized");
    });
  }

  function handleRejectOptimized() {
    setOptimizedPrompt(null);
    setPromptView("original");
  }

  function handleAcceptOptimized() {
    if (!optimizedPrompt) {
      return;
    }

    startAcceptOptimized(async () => {
      const result = await updateItem(item.id, {
        title: item.title,
        description: item.description ?? "",
        content: optimizedPrompt,
        tags: item.tags,
        collectionIds: item.collections.map((collection) => collection.id),
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      onItemUpdate({
        ...result.data,
        createdAt: result.data.createdAt.toISOString(),
        updatedAt: result.data.updatedAt.toISOString(),
      });
      setOptimizedPrompt(null);
      setPromptView("original");
      toast.success("Prompt updated");
    });
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-border py-2">
        <ItemFavoriteButton
          itemId={item.id}
          isFavorite={item.isFavorite}
          variant="button"
          onToggle={onFavoriteToggle}
        />
        <ItemPinButton
          itemId={item.id}
          isPinned={item.isPinned}
          variant="button"
          onToggle={onPinToggle}
        />
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
        <ItemDownloadLink item={item} />
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
              <h3 className="text-sm text-muted-foreground">Description</h3>
              <p className="text-sm">{item.description}</p>
            </section>
          ) : null}

          {item.content ? (
            <section className="space-y-2">
              <h3 className="text-sm font-medium">Content</h3>
              {showExplainableCodeEditor ? (
                <CodeEditor
                  value={item.content}
                  language={item.language ?? undefined}
                  readOnly
                  enableExplain
                  isPro={isPro}
                  explanation={explanation}
                  activeView={codeView}
                  onViewChange={setCodeView}
                  onExplain={handleExplain}
                  onUpgrade={() => setIsUpgradeOpen(true)}
                  isExplaining={isExplaining}
                />
              ) : MARKDOWN_EDITOR_TYPE_NAMES.has(typeName) ? (
                <MarkdownEditor
                  value={item.content}
                  readOnly
                  enableOptimize={showOptimizablePrompt}
                  isPro={isPro}
                  optimizedValue={optimizedPrompt}
                  activeView={promptView}
                  onViewChange={setPromptView}
                  onOptimize={handleOptimize}
                  onUpgrade={() => setIsUpgradeOpen(true)}
                  isOptimizing={isOptimizing}
                  onAcceptOptimized={handleAcceptOptimized}
                  onRejectOptimized={handleRejectOptimized}
                  isAcceptingOptimized={isAcceptingOptimized}
                />
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
              <h3 className="text-sm text-muted-foreground">Image</h3>
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
            <section className="space-y-2">
              <h3 className="text-sm text-muted-foreground">File</h3>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <FileIcon className="size-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.fileName}</p>
                  {item.fileSize ? (
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(item.fileSize)}
                    </p>
                  ) : null}
                </div>
                <ItemDownloadLink item={item} />
              </div>
            </section>
          ) : null}

          {item.tags.length > 0 ? (
            <section className="space-y-2">
              <h3 className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Tag className="size-3.5" />
                Tags
              </h3>
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

          {item.collections.length > 0 ? (
            <section className="space-y-2">
              <h3 className="text-sm font-medium">Collections</h3>
              <div className="flex flex-wrap gap-1.5">
                {item.collections.map((collection) => (
                  <span
                    key={collection.id}
                    className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {collection.name}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          <section className="space-y-2">
            <h3 className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Info className="size-3.5" />
              Details
            </h3>
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

      <UpgradePrompt
        open={isUpgradeOpen}
        onOpenChange={setIsUpgradeOpen}
        reason="general"
      />
    </>
  );
}

function ItemDrawerEditor({
  item,
  formState,
  collections,
  isPro,
  suggestedTags,
  isSuggesting,
  canSuggestTags,
  suggestedSummary,
  isSummarizing,
  canGenerateSummaryEnabled,
  onChange,
  onCancel,
  onSave,
  onSuggestTags,
  onAcceptSuggestedTag,
  onRejectSuggestedTag,
  onDismissSuggestedTags,
  onGenerateSummary,
  onAcceptSuggestedSummary,
  onRejectSuggestedSummary,
  isSaving,
}: {
  item: ItemDetailResponse;
  formState: EditFormState;
  collections: SelectableCollection[];
  isPro: boolean;
  suggestedTags: string[];
  isSuggesting: boolean;
  canSuggestTags: boolean;
  suggestedSummary: string | null;
  isSummarizing: boolean;
  canGenerateSummaryEnabled: boolean;
  onChange: (patch: Partial<EditFormState>) => void;
  onCancel: () => void;
  onSave: () => void;
  onSuggestTags: () => void;
  onAcceptSuggestedTag: (tag: string) => void;
  onRejectSuggestedTag: (tag: string) => void;
  onDismissSuggestedTags: () => void;
  onGenerateSummary: () => void;
  onAcceptSuggestedSummary: () => void;
  onRejectSuggestedSummary: () => void;
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
      <div className="flex items-center justify-end gap-2 border-b border-border py-4">
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
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="item-edit-description">Description</Label>
              <GenerateSummaryButton
                isPro={isPro}
                disabled={!canGenerateSummaryEnabled}
                onGenerate={onGenerateSummary}
                isLoading={isSummarizing}
              />
            </div>
            <Textarea
              id="item-edit-description"
              value={formState.description}
              onChange={(event) =>
                onChange({ description: event.target.value })
              }
              rows={3}
            />
            <SuggestedSummary
              summary={suggestedSummary}
              onAccept={onAcceptSuggestedSummary}
              onReject={onRejectSuggestedSummary}
            />
          </div>

          {showLanguage ? (
            <LanguageSelect
              id="item-edit-language"
              value={formState.language}
              onChange={(language) => onChange({ language })}
              disabled={isSaving}
            />
          ) : null}

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
            <div className="flex items-center gap-2">
              <Input
                id="item-edit-tags"
                value={formState.tags}
                onChange={(event) => onChange({ tags: event.target.value })}
                placeholder="Comma-separated tags"
                className="min-w-0 flex-1"
              />
              <SuggestTagsButton
                isPro={isPro}
                disabled={!canSuggestTags}
                onSuggest={onSuggestTags}
                isLoading={isSuggesting}
              />
            </div>
            <SuggestedTags
              tags={suggestedTags}
              onAccept={onAcceptSuggestedTag}
              onReject={onRejectSuggestedTag}
              onDismiss={onDismissSuggestedTags}
            />
          </div>

          <CollectionMultiSelect
            id="item-edit-collections"
            collections={collections}
            value={formState.collectionIds}
            onChange={(collectionIds) => onChange({ collectionIds })}
            disabled={isSaving}
          />

          <section className="space-y-2">
            <h3 className="text-sm font-medium">Type</h3>
            <Badge variant="secondary">{item.type.name}</Badge>
          </section>

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

function ItemDrawerPanel({
  itemId,
  collections,
  isPro,
}: {
  itemId: string;
  collections: SelectableCollection[];
  isPro: boolean;
}) {
  const router = useRouter();
  const { closeItem } = useItemDrawer();
  const [item, setItem] = useState<ItemDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [formState, setFormState] = useState<EditFormState | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [suggestedSummary, setSuggestedSummary] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();
  const [isSuggesting, startSuggesting] = useTransition();
  const [isSummarizing, startSummarizing] = useTransition();
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

    setSuggestedTags([]);
    setSuggestedSummary(null);
    setFormState(toFormState(item));
    setMode("edit");
  }

  function handleCancel() {
    setSuggestedTags([]);
    setSuggestedSummary(null);
    setFormState(null);
    setMode("view");
  }

  function handleFormChange(patch: Partial<EditFormState>) {
    setFormState((previous) => (previous ? { ...previous, ...patch } : previous));
  }

  function getSuggestContent(state: EditFormState, typeName: string): string {
    if (typeName === "link") {
      return state.content.trim() || state.url.trim();
    }

    return state.content.trim();
  }

  function getSummaryContentInput(
    state: EditFormState,
    typeName: string,
    fileName?: string | null,
  ) {
    return {
      type: typeName,
      content: state.content,
      url: state.url,
      fileName,
      language: state.language,
    };
  }

  function handleGenerateSummary() {
    if (!item || !formState) {
      return;
    }

    const typeName = item.type.name.toLowerCase();
    const summaryContentInput = getSummaryContentInput(
      formState,
      typeName,
      item.fileName,
    );

    startSummarizing(async () => {
      const result = await generateSummary({
        title: formState.title.trim(),
        content: buildSummaryContent(summaryContentInput),
        type: typeName as AutoTagItemType,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setSuggestedSummary(result.data.summary);
    });
  }

  function handleAcceptSuggestedSummary() {
    if (!formState || !suggestedSummary) {
      return;
    }

    handleFormChange({ description: suggestedSummary });
    setSuggestedSummary(null);
  }

  function handleRejectSuggestedSummary() {
    setSuggestedSummary(null);
  }

  function handleSuggestTags() {
    if (!item || !formState) {
      return;
    }

    const typeName = item.type.name.toLowerCase();
    const content = getSuggestContent(formState, typeName);

    startSuggesting(async () => {
      const result = await generateAutoTags({
        title: formState.title.trim(),
        content,
        type: typeName as AutoTagItemType,
        existingTags: parseTagsString(formState.tags),
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setSuggestedTags(result.data.tags);
    });
  }

  function handleAcceptSuggestedTag(tag: string) {
    if (!formState) {
      return;
    }

    handleFormChange({
      tags: appendTagToTagsString(formState.tags, tag),
    });
    setSuggestedTags((previous) => previous.filter((value) => value !== tag));
  }

  function handleRejectSuggestedTag(tag: string) {
    setSuggestedTags((previous) => previous.filter((value) => value !== tag));
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
        collectionIds: formState.collectionIds,
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

  function handleFavoriteToggle(isFavorite: boolean) {
    setItem((current) => (current ? { ...current, isFavorite } : current));
  }

  function handlePinToggle(isPinned: boolean) {
    setItem((current) => (current ? { ...current, isPinned } : current));
  }

  const typeStyles = item ? getItemTypeStyles(item.type.color) : null;
  const editTypeName = item?.type.name.toLowerCase() ?? "";
  const suggestContent =
    formState && item
      ? getSuggestContent(formState, editTypeName)
      : "";
  const canSuggestTags =
    formState !== null &&
    formState.title.trim().length > 0 &&
    suggestContent.length > 0;
  const summaryContentInput =
    formState && item
      ? getSummaryContentInput(formState, editTypeName, item.fileName)
      : { type: editTypeName };
  const canGenerateSummaryEnabled =
    formState !== null &&
    canGenerateSummary(formState.title, summaryContentInput);

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
            isPro={isPro}
            onEdit={handleEdit}
            onDelete={() => setIsDeleteOpen(true)}
            onFavoriteToggle={handleFavoriteToggle}
            onPinToggle={handlePinToggle}
            onItemUpdate={(updatedItem) => {
              setItem(updatedItem);
              router.refresh();
            }}
          />
        ) : null}
        {!isLoading && item && mode === "edit" && formState ? (
          <ItemDrawerEditor
            item={item}
            formState={formState}
            collections={collections}
            isPro={isPro}
            suggestedTags={suggestedTags}
            isSuggesting={isSuggesting}
            canSuggestTags={canSuggestTags}
            suggestedSummary={suggestedSummary}
            isSummarizing={isSummarizing}
            canGenerateSummaryEnabled={canGenerateSummaryEnabled}
            onChange={handleFormChange}
            onCancel={handleCancel}
            onSave={handleSave}
            onSuggestTags={handleSuggestTags}
            onAcceptSuggestedTag={handleAcceptSuggestedTag}
            onRejectSuggestedTag={handleRejectSuggestedTag}
            onDismissSuggestedTags={() => setSuggestedTags([])}
            onGenerateSummary={handleGenerateSummary}
            onAcceptSuggestedSummary={handleAcceptSuggestedSummary}
            onRejectSuggestedSummary={handleRejectSuggestedSummary}
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

export function ItemDrawer({
  collections,
  isPro,
}: {
  collections: SelectableCollection[];
  isPro: boolean;
}) {
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
        className="flex h-svh max-w-none flex-col gap-0 p-0 data-[side=right]:w-[min(54rem,92vw)] data-[side=right]:sm:max-w-none"
      >
        {selectedItemId ? (
          <ItemDrawerPanel
            key={selectedItemId}
            itemId={selectedItemId}
            collections={collections}
            isPro={isPro}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
