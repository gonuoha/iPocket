"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createCollection } from "@/actions/collections";
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

type CreateFormState = {
  name: string;
  description: string;
};

const initialFormState: CreateFormState = {
  name: "",
  description: "",
};

type CollectionCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CollectionCreateDialog({
  open,
  onOpenChange,
}: CollectionCreateDialogProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<CreateFormState>(initialFormState);
  const [isCreating, startCreating] = useTransition();

  const canCreate = formState.name.trim().length > 0 && !isCreating;

  function handleOpenChange(nextOpen: boolean) {
    setFormState(initialFormState);
    onOpenChange(nextOpen);
  }

  function handleFormChange(patch: Partial<CreateFormState>) {
    setFormState((previous) => ({ ...previous, ...patch }));
  }

  function handleCreate() {
    const name = formState.name.trim();

    if (!name) {
      return;
    }

    startCreating(async () => {
      const result = await createCollection({
        name,
        description: formState.description,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Collection created");
      setFormState(initialFormState);
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Collection</DialogTitle>
          <DialogDescription>
            Create a collection to organize related items.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="collection-create-name">Name</Label>
            <Input
              id="collection-create-name"
              value={formState.name}
              onChange={(event) => handleFormChange({ name: event.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="collection-create-description">Description</Label>
            <Textarea
              id="collection-create-description"
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
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleCreate} disabled={!canCreate}>
            {isCreating ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
