"use client";

import { Pin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { toggleItemPin } from "@/actions/items";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ItemPinButtonProps = {
  itemId: string;
  isPinned: boolean;
  variant?: "button" | "icon";
  className?: string;
  onToggle?: (isPinned: boolean) => void;
};

export function ItemPinButton({
  itemId,
  isPinned: initialIsPinned,
  variant = "icon",
  className,
  onToggle,
}: ItemPinButtonProps) {
  const router = useRouter();
  const [isPinned, setIsPinned] = useState(initialIsPinned);
  const [isPending, startTransition] = useTransition();

  function handleClick(event: React.MouseEvent) {
    event.stopPropagation();
    event.preventDefault();

    const nextIsPinned = !isPinned;
    setIsPinned(nextIsPinned);

    startTransition(async () => {
      const result = await toggleItemPin(itemId);

      if (!result.success) {
        setIsPinned(!nextIsPinned);
        toast.error(result.error);
        return;
      }

      setIsPinned(result.data.isPinned);
      onToggle?.(result.data.isPinned);
      toast.success(
        result.data.isPinned ? "Item pinned" : "Item unpinned",
      );
      router.refresh();
    });
  }

  const pinButtonClassName = cn(
    isPinned &&
      "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
  );
  const pinIconClassName = cn(isPinned && "fill-primary text-primary");

  if (variant === "button") {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn("shrink-0", pinButtonClassName, className)}
        onClick={handleClick}
        disabled={isPending}
        aria-pressed={isPinned}
      >
        <Pin className={pinIconClassName} />
        Pin
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      className={cn(
        "text-muted-foreground hover:text-foreground",
        isPinned && "text-primary hover:text-primary",
        className,
      )}
      onClick={handleClick}
      disabled={isPending}
      aria-label={isPinned ? "Unpin item" : "Pin item"}
      aria-pressed={isPinned}
    >
      <Pin className={pinIconClassName} />
    </Button>
  );
}
