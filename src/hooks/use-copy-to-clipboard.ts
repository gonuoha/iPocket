"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

export function useCopyToClipboard(resetMs = 2000) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Copied to clipboard");
        window.setTimeout(() => setCopied(false), resetMs);
        return true;
      } catch {
        toast.error("Failed to copy");
        return false;
      }
    },
    [resetMs],
  );

  return { copied, copy };
}
