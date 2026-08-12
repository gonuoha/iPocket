"use client";

import dynamic from "next/dynamic";
import { Check, Copy } from "lucide-react";
import { useMemo } from "react";

import { ExplainCodeButton } from "@/components/ai/explain-code-button";
import { EditorTabButton } from "@/components/code-editor/editor-tab-button";
import { MarkdownContent } from "@/components/shared/markdown-content";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { formatCodeLanguageLabel, getCodeEditorHeight } from "@/lib/monaco-language";
import { cn } from "@/lib/utils";

const MonacoEditorPane = dynamic(
  () => import("./monaco-editor-pane").then((mod) => mod.MonacoEditorPane),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[120px] items-center justify-center bg-[#1e1e1e] text-xs text-muted-foreground">
        Loading editor...
      </div>
    ),
  },
);

export const CODE_EDITOR_TYPE_NAMES = new Set(["snippet", "command"]);

export type CodeEditorView = "code" | "explain";

export type CodeEditorProps = {
  id?: string;
  value: string;
  language?: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  className?: string;
  enableExplain?: boolean;
  isPro?: boolean;
  explanation?: string | null;
  activeView?: CodeEditorView;
  onViewChange?: (view: CodeEditorView) => void;
  onExplain?: () => void;
  onUpgrade?: () => void;
  isExplaining?: boolean;
};

export function CodeEditor({
  id,
  value,
  language,
  readOnly = false,
  onChange,
  className,
  enableExplain = false,
  isPro = false,
  explanation = null,
  activeView = "code",
  onViewChange,
  onExplain,
  onUpgrade,
  isExplaining = false,
}: CodeEditorProps) {
  const { copied, copy } = useCopyToClipboard();
  const height = useMemo(() => getCodeEditorHeight(value), [value]);
  const showExplainTabs = enableExplain && (Boolean(explanation) || isExplaining);
  const currentView = showExplainTabs ? activeView : "code";

  function handleCopy() {
    const copyValue = currentView === "explain" && explanation ? explanation : value;
    void copy(copyValue);
  }

  return (
    <div
      className={cn(
        "code-editor overflow-hidden rounded-lg border border-border bg-[#1e1e1e]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#252526] px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="size-3 rounded-full bg-[#ff5f57]" />
            <span className="size-3 rounded-full bg-[#febc2e]" />
            <span className="size-3 rounded-full bg-[#28c804]" />
          </div>
          {showExplainTabs ? (
            <div className="flex items-center gap-1">
              <EditorTabButton
                active={currentView === "code"}
                onClick={() => onViewChange?.("code")}
              >
                Code
              </EditorTabButton>
              <EditorTabButton
                active={currentView === "explain"}
                onClick={() => onViewChange?.("explain")}
              >
                Explain
              </EditorTabButton>
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {currentView === "code" ? (
            <span className="text-xs font-medium text-zinc-400">
              {formatCodeLanguageLabel(language)}
            </span>
          ) : null}
          {enableExplain ? (
            <ExplainCodeButton
              isPro={isPro}
              onExplain={() => onExplain?.()}
              onUpgrade={onUpgrade}
              isLoading={isExplaining}
              disabled={!value.trim()}
            />
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="size-7 text-zinc-400 hover:bg-white/10 hover:text-zinc-100"
            onClick={handleCopy}
            aria-label={currentView === "explain" ? "Copy explanation" : "Copy code"}
          >
            {copied ? <Check /> : <Copy />}
          </Button>
        </div>
      </div>
      {currentView === "code" ? (
        <MonacoEditorPane
          id={id}
          value={value}
          language={language}
          readOnly={readOnly}
          onChange={onChange}
        />
      ) : (
        <div
          className="markdown-preview overflow-y-auto px-4 py-3"
          style={{ height }}
        >
          {explanation ? (
            <MarkdownContent content={explanation} />
          ) : (
            <p className="text-sm text-zinc-500">Generating explanation...</p>
          )}
        </div>
      )}
    </div>
  );
}
