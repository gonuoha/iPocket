"use client";

import { createElement, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createItem } from "@/actions/items";
import {
  CollectionMultiSelect,
  type SelectableCollection,
} from "@/components/collections/collection-multi-select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CODE_EDITOR_TYPE_NAMES,
  CodeEditor,
} from "@/components/code-editor/code-editor";
import { LanguageSelect } from "@/components/code-editor/language-select";
import {
  FileUpload,
  type UploadedFile,
} from "@/components/items/file-upload";
import {
  MARKDOWN_EDITOR_TYPE_NAMES,
  MarkdownEditor,
} from "@/components/markdown-editor/markdown-editor";
import { Textarea } from "@/components/ui/textarea";
import { getItemTypeIcon, getItemTypeLabel } from "@/lib/item-type-styles";
import { isAtItemLimit } from "@/lib/subscription-limits";
import {
  resolveDefaultCreateType,
  type CreatableItemType,
} from "@/lib/validations/items";
import { UpgradePrompt } from "@/components/shared/upgrade-prompt";

const CREATABLE_ITEM_TYPES: {
  type: CreatableItemType;
  icon: string;
}[] = [
  { type: "snippet", icon: "Code" },
  { type: "prompt", icon: "Sparkles" },
  { type: "command", icon: "Terminal" },
  { type: "note", icon: "StickyNote" },
  { type: "link", icon: "Link" },
  { type: "image", icon: "Image" },
  { type: "file", icon: "File" },
];

const CONTENT_TYPE_NAMES = new Set(["snippet", "prompt", "command", "note"]);
const LANGUAGE_TYPE_NAMES = new Set(["snippet", "command"]);
const URL_TYPE_NAMES = new Set(["link"]);
const FILE_TYPE_NAMES = new Set(["file", "image"]);

type CreateFormState = {
  type: CreatableItemType;
  title: string;
  description: string;
  content: string;
  url: string;
  language: string;
  tags: string;
  collectionIds: string[];
  uploadedFile: UploadedFile | null;
};

const initialFormState: CreateFormState = {
  type: "snippet",
  title: "",
  description: "",
  content: "",
  url: "",
  language: "",
  tags: "",
  collectionIds: [],
  uploadedFile: null,
};

type ItemCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPro: boolean;
  itemCount: number;
  defaultType?: CreatableItemType;
  collections: SelectableCollection[];
};

export function ItemCreateDialog({
  open,
  onOpenChange,
  isPro,
  itemCount,
  defaultType,
  collections,
}: ItemCreateDialogProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<CreateFormState>(initialFormState);
  const [isCreating, startCreating] = useTransition();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const showContent = CONTENT_TYPE_NAMES.has(formState.type);
  const showLanguage = LANGUAGE_TYPE_NAMES.has(formState.type);
  const showUrl = URL_TYPE_NAMES.has(formState.type);
  const showFileUpload = FILE_TYPE_NAMES.has(formState.type);
  const useCodeEditor = CODE_EDITOR_TYPE_NAMES.has(formState.type);
  const useMarkdownEditor = MARKDOWN_EDITOR_TYPE_NAMES.has(formState.type);
  const canCreate =
    formState.title.trim().length > 0 &&
    (!showUrl || formState.url.trim().length > 0) &&
    (!showFileUpload || formState.uploadedFile !== null) &&
    !isCreating;

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setFormState({
        ...initialFormState,
        type: resolveDefaultCreateType(defaultType, isPro),
      });
    } else {
      setFormState(initialFormState);
    }

    onOpenChange(nextOpen);
  }

  function handleFormChange(patch: Partial<CreateFormState>) {
    setFormState((previous) => ({ ...previous, ...patch }));
  }

  function handleTypeChange(type: CreatableItemType) {
    setFormState((previous) => ({
      ...previous,
      type,
      uploadedFile: null,
    }));
  }

  function handleCreate() {
    const title = formState.title.trim();

    if (!title) {
      return;
    }

    if (isAtItemLimit(itemCount, isPro)) {
      setUpgradeOpen(true);
      return;
    }

    startCreating(async () => {
      const result = await createItem({
        type: formState.type,
        title,
        description: formState.description,
        content: formState.content,
        url: formState.url,
        language: formState.language,
        fileUrl: formState.uploadedFile?.fileUrl,
        fileName: formState.uploadedFile?.fileName,
        fileSize: formState.uploadedFile?.fileSize,
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

      toast.success("Item created");
      setFormState(initialFormState);
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <>
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Item</DialogTitle>
          <DialogDescription>
            Choose a type and fill in the details for your new item.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="item-create-type">Type</Label>
            <Select
              value={formState.type}
              onValueChange={(value) =>
                handleTypeChange(value as CreatableItemType)
              }
            >
              <SelectTrigger id="item-create-type" className="w-fit min-w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CREATABLE_ITEM_TYPES.map(({ type, icon }) => (
                  <SelectItem
                    key={type}
                    value={type}
                    disabled={FILE_TYPE_NAMES.has(type) && !isPro}
                  >
                    {createElement(getItemTypeIcon(icon), {
                      className: "size-4 shrink-0",
                    })}
                    {getItemTypeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="item-create-title">Title</Label>
            <Input
              id="item-create-title"
              value={formState.title}
              onChange={(event) => handleFormChange({ title: event.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="item-create-description">Description</Label>
            <Textarea
              id="item-create-description"
              value={formState.description}
              onChange={(event) =>
                handleFormChange({ description: event.target.value })
              }
              rows={3}
            />
          </div>

          {showFileUpload ? (
            <div className="space-y-2">
              <Label>{formState.type === "image" ? "Image" : "File"}</Label>
              <FileUpload
                category={formState.type === "image" ? "image" : "file"}
                value={formState.uploadedFile}
                onChange={(uploadedFile) => handleFormChange({ uploadedFile })}
                disabled={isCreating}
              />
            </div>
          ) : null}

          {showLanguage ? (
            <LanguageSelect
              id="item-create-language"
              value={formState.language}
              onChange={(language) => handleFormChange({ language })}
              disabled={isCreating}
            />
          ) : null}

          {showContent ? (
            <div className="space-y-2">
              <Label htmlFor="item-create-content">Content</Label>
              {useCodeEditor ? (
                <CodeEditor
                  id="item-create-content"
                  value={formState.content}
                  language={formState.language}
                  onChange={(content) => handleFormChange({ content })}
                />
              ) : useMarkdownEditor ? (
                <MarkdownEditor
                  id="item-create-content"
                  value={formState.content}
                  onChange={(content) => handleFormChange({ content })}
                />
              ) : (
                <Textarea
                  id="item-create-content"
                  value={formState.content}
                  onChange={(event) =>
                    handleFormChange({ content: event.target.value })
                  }
                  className="min-h-32 font-mono text-sm"
                />
              )}
            </div>
          ) : null}

          {showUrl ? (
            <div className="space-y-2">
              <Label htmlFor="item-create-url">URL</Label>
              <Input
                id="item-create-url"
                type="url"
                value={formState.url}
                onChange={(event) => handleFormChange({ url: event.target.value })}
                required
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="item-create-tags">Tags</Label>
            <Input
              id="item-create-tags"
              value={formState.tags}
              onChange={(event) => handleFormChange({ tags: event.target.value })}
              placeholder="Comma-separated tags"
            />
          </div>

          <CollectionMultiSelect
            id="item-create-collections"
            collections={collections}
            value={formState.collectionIds}
            onChange={(collectionIds) => handleFormChange({ collectionIds })}
            disabled={isCreating}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleCreate} disabled={!canCreate}>
            {isCreating ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <UpgradePrompt
      open={upgradeOpen}
      onOpenChange={setUpgradeOpen}
      reason="item_limit"
    />
    </>
  );
}
