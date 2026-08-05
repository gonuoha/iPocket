"use client";

import dynamic from "next/dynamic";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { formatCodeLanguageLabel } from "@/lib/monaco-language";
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

export type CodeEditorProps = {
  id?: string;
  value: string;
  language?: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  className?: string;
};

export function CodeEditor({
  id,
  value,
  language,
  readOnly = false,
  onChange,
  className,
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);

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
        "code-editor overflow-hidden rounded-lg border border-border bg-[#1e1e1e]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#252526] px-3 py-2">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c804]" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium capitalize text-zinc-400">
            {formatCodeLanguageLabel(language)}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="size-7 text-zinc-400 hover:bg-white/10 hover:text-zinc-100"
            onClick={handleCopy}
            aria-label="Copy code"
          >
            {copied ? <Check /> : <Copy />}
          </Button>
        </div>
      </div>
      <MonacoEditorPane
        id={id}
        value={value}
        language={language}
        readOnly={readOnly}
        onChange={onChange}
      />
    </div>
  );
}
