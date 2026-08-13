"use client";

import { Check, Copy } from "lucide-react";
import { useMemo, useState } from "react";

import { OptimizePromptButton } from "@/components/ai/optimize-prompt-button";
import { EditorTabButton } from "@/components/code-editor/editor-tab-button";
import { MarkdownContent } from "@/components/shared/markdown-content";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";

export const MARKDOWN_EDITOR_TYPE_NAMES = new Set(["note", "prompt"]);

const MIN_HEIGHT = 200;
const MAX_HEIGHT = 400;
const LINE_HEIGHT = 20;
const PADDING = 16;

type MarkdownTab = "write" | "preview";

export type MarkdownEditorView = "original" | "optimized";

export type MarkdownEditorProps = {
  id?: string;
  value: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  className?: string;
  enableOptimize?: boolean;
  isPro?: boolean;
  optimizedValue?: string | null;
  activeView?: MarkdownEditorView;
  onViewChange?: (view: MarkdownEditorView) => void;
  onOptimize?: () => void;
  onUpgrade?: () => void;
  isOptimizing?: boolean;
  onAcceptOptimized?: () => void;
  onRejectOptimized?: () => void;
  isAcceptingOptimized?: boolean;
};

function getEditorHeight(value: string): number {
  const lineCount = Math.max(1, value.split("\n").length);

  return Math.min(
    Math.max(lineCount * LINE_HEIGHT + PADDING, MIN_HEIGHT),
    MAX_HEIGHT,
  );
}

export function MarkdownEditor({
  id,
  value,
  readOnly = false,
  onChange,
  className,
  enableOptimize = false,
  isPro = false,
  optimizedValue = null,
  activeView = "original",
  onViewChange,
  onOptimize,
  onUpgrade,
  isOptimizing = false,
  onAcceptOptimized,
  onRejectOptimized,
  isAcceptingOptimized = false,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<MarkdownTab>("write");
  const { copied, copy } = useCopyToClipboard();
  const showWriteTab = !readOnly;
  const showOptimizeTabs =
    enableOptimize && (Boolean(optimizedValue) || isOptimizing);
  const currentView = showOptimizeTabs ? activeView : "original";
  const displayValue =
    currentView === "optimized" && optimizedValue ? optimizedValue : value;
  const height = useMemo(() => getEditorHeight(displayValue), [displayValue]);
  const currentTab =
    readOnly && currentView === "optimized" ? "preview" : readOnly ? "preview" : activeTab;

  function handleCopy() {
    void copy(displayValue);
  }

  return (
    <div
      className={cn(
        "markdown-editor overflow-hidden rounded-lg border border-border bg-prose-pre-bg",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border bg-muted px-3 py-2">
        <div className="flex items-center gap-1">
          {showOptimizeTabs ? (
            <div className="flex items-center gap-1">
              <EditorTabButton
                active={currentView === "original"}
                onClick={() => onViewChange?.("original")}
              >
                Original
              </EditorTabButton>
              <EditorTabButton
                active={currentView === "optimized"}
                onClick={() => onViewChange?.("optimized")}
              >
                Optimized
              </EditorTabButton>
            </div>
          ) : showWriteTab ? (
            <>
              <EditorTabButton
                active={currentTab === "write"}
                onClick={() => setActiveTab("write")}
              >
                Write
              </EditorTabButton>
              <EditorTabButton
                active={currentTab === "preview"}
                onClick={() => setActiveTab("preview")}
              >
                Preview
              </EditorTabButton>
            </>
          ) : (
            <span className="px-2.5 py-1 text-xs font-medium text-muted-foreground">
              Preview
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {enableOptimize ? (
            <OptimizePromptButton
              isPro={isPro}
              onOptimize={() => onOptimize?.()}
              onUpgrade={onUpgrade}
              isLoading={isOptimizing}
              disabled={!value.trim()}
            />
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="size-7"
            onClick={handleCopy}
            aria-label="Copy markdown"
          >
            {copied ? <Check /> : <Copy />}
          </Button>
        </div>
      </div>

      {currentTab === "write" && currentView === "original" ? (
        <textarea
          {...(id ? { id } : {})}
          value={value}
          readOnly={readOnly}
          onChange={(event) => onChange?.(event.target.value)}
          className="w-full resize-none border-0 bg-prose-pre-bg px-4 py-3 font-mono text-sm leading-5 text-foreground outline-none placeholder:text-muted-foreground"
          style={{ height }}
          placeholder="Write markdown..."
        />
      ) : (
        <div
          className="markdown-preview overflow-y-auto px-4 py-3"
          style={{ maxHeight: MAX_HEIGHT, minHeight: MIN_HEIGHT }}
        >
          {displayValue.trim() ? (
            isOptimizing && currentView === "optimized" ? (
              <p className="text-sm text-muted-foreground">Optimizing prompt...</p>
            ) : (
              <MarkdownContent content={displayValue} />
            )
          ) : (
            <p className="text-sm text-muted-foreground">Nothing to preview</p>
          )}
        </div>
      )}

      {currentView === "optimized" && optimizedValue ? (
        <div className="flex items-center gap-2 border-t border-border bg-muted px-3 py-2">
          <Button
            type="button"
            size="sm"
            onClick={onAcceptOptimized}
            disabled={isAcceptingOptimized}
          >
            {isAcceptingOptimized ? "Saving..." : "Use optimized prompt"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onRejectOptimized}
            disabled={isAcceptingOptimized}
          >
            Keep original
          </Button>
        </div>
      ) : null}
    </div>
  );
}
