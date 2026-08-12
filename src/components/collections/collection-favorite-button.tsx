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
          "border-yellow-400/40 bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/15 hover:text-yellow-400",
        className,
      )}
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={isFavorite}
    >
      <Star
        className={cn(isFavorite && "fill-yellow-400 text-yellow-400")}
      />
      Favorite
    </Button>
  );
}
