"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { CollectionDeleteDialog } from "@/components/collections/collection-delete-dialog";
import { CollectionEditDialog } from "@/components/collections/collection-edit-dialog";
import { CollectionFavoriteButton } from "@/components/collections/collection-favorite-button";
import { Button } from "@/components/ui/button";

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
        <CollectionFavoriteButton
          key={`${collection.id}-${collection.isFavorite}`}
          collectionId={collection.id}
          isFavorite={collection.isFavorite}
        />
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
