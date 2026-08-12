"use client";

import { useRouter } from "next/navigation";

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
      "Get unlimited items and collections, file uploads, AI features, and more with Memex Pro.",
  },
};

type UpgradePromptProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: UpgradeReason;
};

export function UpgradePrompt({ open, onOpenChange, reason }: UpgradePromptProps) {
  const router = useRouter();
  const message = MESSAGES[reason];

  function handleViewPlans() {
    onOpenChange(false);
    router.push("/upgrade");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{message.title}</DialogTitle>
          <DialogDescription>{message.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" onClick={handleViewPlans}>
            View upgrade options
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
