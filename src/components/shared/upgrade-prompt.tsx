"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type UpgradeReason =
  | "item_limit"
  | "collection_limit"
  | "file_upload"
  | "general";

type BillingPeriod = "monthly" | "yearly";

const MESSAGES: Record<UpgradeReason, { title: string; description: string }> = {
  item_limit: {
    title: "Item limit reached",
    description:
      "You've reached the free plan limit of 50 items. Upgrade to Pro for unlimited items.",
  },
  collection_limit: {
    title: "Collection limit reached",
    description:
      "You've reached the free plan limit of 3 collections. Upgrade to Pro for unlimited collections.",
  },
  file_upload: {
    title: "Pro feature",
    description: "File uploads are available on the Pro plan. Upgrade to unlock this feature.",
  },
  general: {
    title: "Upgrade to Pro",
    description:
      "Get unlimited items and collections, file uploads, AI features, and more with iPocket Pro.",
  },
};

type UpgradePromptProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: UpgradeReason;
};

export function UpgradePrompt({ open, onOpenChange, reason }: UpgradePromptProps) {
  const [loadingPeriod, setLoadingPeriod] = useState<BillingPeriod | null>(null);
  const message = MESSAGES[reason];
  const isLoading = loadingPeriod !== null;

  async function handleUpgrade(period: BillingPeriod) {
    setLoadingPeriod(period);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        toast.error(data.error ?? "Checkout failed");
        return;
      }

      window.location.href = data.url;
    } catch {
      toast.error("Checkout failed");
    } finally {
      setLoadingPeriod(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{message.title}</DialogTitle>
          <DialogDescription>{message.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row flex-wrap gap-2 sm:flex-row">
          <Button
            type="button"
            onClick={() => handleUpgrade("monthly")}
            disabled={isLoading}
          >
            {loadingPeriod === "monthly" ? "Redirecting..." : "Upgrade $8/mo"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleUpgrade("yearly")}
            disabled={isLoading}
          >
            {loadingPeriod === "yearly"
              ? "Redirecting..."
              : "Upgrade $72/yr (save 25%)"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
