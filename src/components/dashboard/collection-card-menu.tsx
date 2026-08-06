"use client";

import { useState } from "react";
import { Ellipsis, Pencil, Star, Trash2 } from "lucide-react";

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
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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
          <DropdownMenuItem>
            <Star
              className={cn(
                collection.isFavorite && "fill-yellow-400 text-yellow-400",
              )}
            />
            Favorite
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
