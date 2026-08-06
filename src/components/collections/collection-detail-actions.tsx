"use client";

import { useState } from "react";
import { Pencil, Star, Trash2 } from "lucide-react";

import { CollectionDeleteDialog } from "@/components/collections/collection-delete-dialog";
import { CollectionEditDialog } from "@/components/collections/collection-edit-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CollectionDetailActionsProps = {
  collection: {
    id: string;
    name: string;
    description: string | null;
    isFavorite: boolean;
  };
};

export function CollectionDetailActions({
  collection,
}: CollectionDetailActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            collection.isFavorite &&
              "border-yellow-400/40 bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/15 hover:text-yellow-400",
          )}
          aria-label="Favorite"
        >
          <Star
            className={cn(
              collection.isFavorite && "fill-yellow-400 text-yellow-400",
            )}
          />
          Favorite
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsEditOpen(true)}
        >
          <Pencil />
          Edit
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="icon-sm"
          aria-label="Delete"
          onClick={() => setIsDeleteOpen(true)}
        >
          <Trash2 />
        </Button>
      </div>

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
        redirectTo="/collections"
      />
    </>
  );
}
