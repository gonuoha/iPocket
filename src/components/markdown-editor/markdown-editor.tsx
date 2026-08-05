"use client";

import { Check, Copy } from "lucide-react";
import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const MARKDOWN_EDITOR_TYPE_NAMES = new Set(["note", "prompt"]);

const MIN_HEIGHT = 200;
const MAX_HEIGHT = 400;
const LINE_HEIGHT = 20;
const PADDING = 16;

type MarkdownTab = "write" | "preview";

export type MarkdownEditorProps = {
  id?: string;
  value: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  className?: string;
};

function getEditorHeight(value: string): number {
  const lineCount = Math.max(1, value.split("\n").length);

  return Math.min(
    Math.max(lineCount * LINE_HEIGHT + PADDING, MIN_HEIGHT),
    MAX_HEIGHT,
  );
}

function MarkdownPreview({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noreferrer">
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export function MarkdownEditor({
  id,
  value,
  readOnly = false,
  onChange,
  className,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<MarkdownTab>("write");
  const [copied, setCopied] = useState(false);
  const height = useMemo(() => getEditorHeight(value), [value]);
  const showWriteTab = !readOnly;
  const currentTab = readOnly ? "preview" : activeTab;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied to clipboard");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }

  return (
    <div
      className={cn(
        "markdown-editor overflow-hidden rounded-lg border border-border bg-[#1e1e1e]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#2d2d2d] px-3 py-2">
        <div className="flex items-center gap-1">
          {showWriteTab ? (
            <>
              <button
                type="button"
                className={cn(
                  "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                  currentTab === "write"
                    ? "bg-white/10 text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-200",
                )}
                onClick={() => setActiveTab("write")}
              >
                Write
              </button>
              <button
                type="button"
                className={cn(
                  "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                  currentTab === "preview"
                    ? "bg-white/10 text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-200",
                )}
                onClick={() => setActiveTab("preview")}
              >
                Preview
              </button>
            </>
          ) : (
            <span className="px-2.5 py-1 text-xs font-medium text-zinc-300">
              Preview
            </span>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="size-7 text-zinc-400 hover:bg-white/10 hover:text-zinc-100"
          onClick={handleCopy}
          aria-label="Copy markdown"
        >
          {copied ? <Check /> : <Copy />}
        </Button>
      </div>

      {currentTab === "write" ? (
        <textarea
          {...(id ? { id } : {})}
          value={value}
          readOnly={readOnly}
          onChange={(event) => onChange?.(event.target.value)}
          className="w-full resize-none border-0 bg-[#1e1e1e] px-4 py-3 font-mono text-sm leading-5 text-zinc-100 outline-none placeholder:text-zinc-500"
          style={{ height }}
          placeholder="Write markdown..."
        />
      ) : (
        <div
          className="markdown-preview overflow-y-auto px-4 py-3"
          style={{ maxHeight: MAX_HEIGHT, minHeight: MIN_HEIGHT }}
        >
          {value.trim() ? (
            <MarkdownPreview content={value} />
          ) : (
            <p className="text-sm text-zinc-500">Nothing to preview</p>
          )}
        </div>
      )}
    </div>
  );
}
