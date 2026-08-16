"use client";

import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCollectionFavorite } from "@/hooks/use-collection-favorite";
import { cn } from "@/lib/utils";

type CollectionFavoriteButtonProps = {
  collectionId: string;
  isFavorite: boolean;
  variant?: "button" | "icon";
  className?: string;
  onToggle?: (isFavorite: boolean) => void;
};

export function CollectionFavoriteButton({
  collectionId,
  isFavorite: initialIsFavorite,
  variant = "button",
  className,
  onToggle,
}: CollectionFavoriteButtonProps) {
  const { isFavorite, isPending, toggleFavorite } = useCollectionFavorite(
    collectionId,
    initialIsFavorite,
    onToggle,
  );

  function handleClick(event: React.MouseEvent) {
    event.stopPropagation();
    toggleFavorite();
  }

  const favoriteButtonClassName = cn(
    isFavorite &&
      "border-favorite/40 bg-favorite/10 text-favorite hover:bg-favorite/15 hover:text-favorite",
  );
  const starClassName = cn(isFavorite && "fill-favorite text-favorite");

  if (variant === "icon") {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className={cn(
          "text-muted-foreground hover:text-foreground",
          isFavorite && "text-favorite hover:text-favorite",
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
