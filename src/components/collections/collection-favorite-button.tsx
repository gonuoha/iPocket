"use client";

import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { toggleCollectionFavorite } from "@/actions/collections";
import { Button } from "@/components/ui/button";
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
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isPending, startTransition] = useTransition();

  function handleClick(event: React.MouseEvent) {
    event.stopPropagation();

    const nextIsFavorite = !isFavorite;
    setIsFavorite(nextIsFavorite);

    startTransition(async () => {
      const result = await toggleCollectionFavorite(collectionId);

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
