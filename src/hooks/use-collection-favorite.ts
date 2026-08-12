"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { toggleCollectionFavorite } from "@/actions/collections";

export function useCollectionFavorite(
  collectionId: string,
  initialIsFavorite: boolean,
  onToggle?: (isFavorite: boolean) => void,
) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isPending, startTransition] = useTransition();

  function toggleFavorite() {
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

  return { isFavorite, isPending, toggleFavorite, setIsFavorite };
}
