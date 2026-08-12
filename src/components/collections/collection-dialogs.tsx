"use client";

import { CollectionDeleteDialog } from "@/components/collections/collection-delete-dialog";
import { CollectionEditDialog } from "@/components/collections/collection-edit-dialog";

type CollectionDialogsProps = {
  collection: {
    id: string;
    name: string;
    description: string | null;
  };
  isEditOpen: boolean;
  onEditOpenChange: (open: boolean) => void;
  isDeleteOpen: boolean;
  onDeleteOpenChange: (open: boolean) => void;
  redirectTo?: string;
};

export function CollectionDialogs({
  collection,
  isEditOpen,
  onEditOpenChange,
  isDeleteOpen,
  onDeleteOpenChange,
  redirectTo,
}: CollectionDialogsProps) {
  return (
    <>
      {isEditOpen ? (
        <CollectionEditDialog
          key={collection.id}
          collectionId={collection.id}
          initialName={collection.name}
          initialDescription={collection.description}
          open
          onOpenChange={onEditOpenChange}
        />
      ) : null}

      <CollectionDeleteDialog
        collectionId={collection.id}
        collectionName={collection.name}
        open={isDeleteOpen}
        onOpenChange={onDeleteOpenChange}
        redirectTo={redirectTo}
      />
    </>
  );
}
