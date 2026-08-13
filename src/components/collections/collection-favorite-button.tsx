"use client";

import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCollectionFavorite } from "@/hooks/use-collection-favorite";
import { cn } from "@/lib/utils";

type CollectionFavoriteButtonProps = {
  collectionId: string;
  isFavorite: boolean;
  className?: string;
  onToggle?: (isFavorite: boolean) => void;
};

export function CollectionFavoriteButton({
  collectionId,
  isFavorite: initialIsFavorite,
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

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(
        "shrink-0",
        isFavorite &&
          "border-favorite/40 bg-favorite/10 text-favorite hover:bg-favorite/15 hover:text-favorite",
        className,
      )}
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={isFavorite}
    >
      <Star
        className={cn(isFavorite && "fill-favorite text-favorite")}
      />
      Favorite
    </Button>
  );
}
