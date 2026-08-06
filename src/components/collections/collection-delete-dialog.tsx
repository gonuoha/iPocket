"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteCollection } from "@/actions/collections";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete collection?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete &ldquo;{collectionName}&rdquo;. Items in
            this collection will not be deleted, but they will no longer be
            associated with it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
