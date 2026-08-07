"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ellipsis, Pencil, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { toggleCollectionFavorite } from "@/actions/collections";
import { CollectionDeleteDialog } from "@/components/collections/collection-delete-dialog";
import { CollectionEditDialog } from "@/components/collections/collection-edit-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type CollectionCardMenuProps = {
  collection: {
    id: string;
    name: string;
    description: string | null;
    isFavorite: boolean;
  };
};

export function CollectionCardMenu({ collection }: CollectionCardMenuProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(collection.isFavorite);
  const [isPending, startTransition] = useTransition();

  function handleFavoriteToggle() {
    const nextIsFavorite = !isFavorite;
    setIsFavorite(nextIsFavorite);

    startTransition(async () => {
      const result = await toggleCollectionFavorite(collection.id);

      if (!result.success) {
        setIsFavorite(!nextIsFavorite);
        toast.error(result.error);
        return;
      }

      setIsFavorite(result.data.isFavorite);
      router.refresh();
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors",
            "hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <Ellipsis className="size-4" />
          <span className="sr-only">Collection actions</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={isPending}
            onClick={handleFavoriteToggle}
          >
            <Star
              className={cn(
                isFavorite && "fill-yellow-400 text-yellow-400",
              )}
            />
            {isFavorite ? "Unfavorite" : "Favorite"}
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {isEditOpen ? (
        <CollectionEditDialog
          key={collection.id}
          collectionId={collection.id}
          initialName={collection.name}
          initialDescription={collection.description}
          open
          onOpenChange={setIsEditOpen}
        />
      ) : null}

      <CollectionDeleteDialog
        collectionId={collection.id}
        collectionName={collection.name}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      />
    </>
  );
}
