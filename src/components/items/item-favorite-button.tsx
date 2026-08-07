"use client";

import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { toggleItemFavorite } from "@/actions/items";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ItemFavoriteButtonProps = {
  itemId: string;
  isFavorite: boolean;
  variant?: "button" | "icon";
  className?: string;
  onToggle?: (isFavorite: boolean) => void;
};

export function ItemFavoriteButton({
  itemId,
  isFavorite: initialIsFavorite,
  variant = "icon",
  className,
  onToggle,
}: ItemFavoriteButtonProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isPending, startTransition] = useTransition();

  function handleClick(event: React.MouseEvent) {
    event.stopPropagation();
    event.preventDefault();

    const nextIsFavorite = !isFavorite;
    setIsFavorite(nextIsFavorite);

    startTransition(async () => {
      const result = await toggleItemFavorite(itemId);

      if (!result.success) {
        setIsFavorite(!nextIsFavorite);
        toast.error(result.error);
        return;
      }

      setIsFavorite(result.data.isFavorite);
      onToggle?.(result.data.isFavorite);
      router.refresh();
    });
  }

  const favoriteButtonClassName = cn(
    isFavorite &&
      "border-yellow-400/40 bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/15 hover:text-yellow-400",
  );
  const starClassName = cn(isFavorite && "fill-yellow-400 text-yellow-400");

  if (variant === "button") {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn("shrink-0", favoriteButtonClassName, className)}
        onClick={handleClick}
        disabled={isPending}
        aria-pressed={isFavorite}
      >
        <Star className={starClassName} />
        Favorite
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
        isFavorite && "text-yellow-400 hover:text-yellow-400",
        className,
      )}
      onClick={handleClick}
      disabled={isPending}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={isFavorite}
    >
      <Star className={starClassName} />
    </Button>
  );
}
