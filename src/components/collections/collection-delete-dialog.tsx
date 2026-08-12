"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteCollection } from "@/actions/collections";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";

type CollectionDeleteDialogProps = {
  collectionId: string;
  collectionName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectTo?: string;
};

export function CollectionDeleteDialog({
  collectionId,
  collectionName,
  open,
  onOpenChange,
  redirectTo,
}: CollectionDeleteDialogProps) {
  const router = useRouter();
  const [isDeleting, startDeleting] = useTransition();

  function handleDeleteConfirm() {
    startDeleting(async () => {
      const result = await deleteCollection(collectionId);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      onOpenChange(false);
      toast.success("Collection deleted");

      if (redirectTo) {
        router.push(redirectTo);
      }

      router.refresh();
    });
  }

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete collection?"
      description={
        <>
          This will permanently delete &ldquo;{collectionName}&rdquo;. Items in
          this collection will not be deleted, but they will no longer be
          associated with it.
        </>
      }
      isDeleting={isDeleting}
      onConfirm={handleDeleteConfirm}
    />
  );
}
