"use client";

import { useState } from "react";
import { Ellipsis, Pencil, Star, Trash2 } from "lucide-react";

import { CollectionDialogs } from "@/components/collections/collection-dialogs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCollectionFavorite } from "@/hooks/use-collection-favorite";
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
  const { isFavorite, isPending, toggleFavorite } = useCollectionFavorite(
    collection.id,
    collection.isFavorite,
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "inline-flex size-11 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors md:size-8",
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
            onClick={toggleFavorite}
          >
            <Star
              className={cn(
                isFavorite && "fill-favorite text-favorite",
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

      <CollectionDialogs
        collection={collection}
        isEditOpen={isEditOpen}
        onEditOpenChange={setIsEditOpen}
        isDeleteOpen={isDeleteOpen}
        onDeleteOpenChange={setIsDeleteOpen}
      />
    </>
  );
}
