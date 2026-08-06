"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateCollection } from "@/actions/collections";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type EditFormState = {
  name: string;
  description: string;
};

type CollectionEditDialogProps = {
  collectionId: string;
  initialName: string;
  initialDescription: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function toFormState(
  name: string,
  description: string | null,
): EditFormState {
  return {
    name,
    description: description ?? "",
  };
}

export function CollectionEditDialog({
  collectionId,
  initialName,
  initialDescription,
  open,
  onOpenChange,
}: CollectionEditDialogProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<EditFormState>(() =>
    toFormState(initialName, initialDescription),
  );
  const [isSaving, startSaving] = useTransition();

  const canSave = formState.name.trim().length > 0 && !isSaving;

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
  }

  function handleFormChange(patch: Partial<EditFormState>) {
    setFormState((previous) => ({ ...previous, ...patch }));
  }

  function handleSave() {
    const name = formState.name.trim();

    if (!name) {
      return;
    }

    startSaving(async () => {
      const result = await updateCollection(collectionId, {
        name,
        description: formState.description,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Collection updated");
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Collection</DialogTitle>
          <DialogDescription>
            Update the name and description for this collection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="collection-edit-name">Name</Label>
            <Input
              id="collection-edit-name"
              value={formState.name}
              onChange={(event) => handleFormChange({ name: event.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="collection-edit-description">Description</Label>
            <Textarea
              id="collection-edit-description"
              value={formState.description}
              onChange={(event) =>
                handleFormChange({ description: event.target.value })
              }
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={!canSave}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
