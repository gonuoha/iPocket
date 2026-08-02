"use client";

import { Trash2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type DeleteAccountButtonProps = {
  className?: string;
};

export function DeleteAccountButton({ className }: DeleteAccountButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setError(null);
    setIsDeleting(true);

    try {
      const response = await fetch("/api/auth/account", { method: "DELETE" });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Unable to delete account.");
        setIsDeleting(false);
        return;
      }

      await signOut({ callbackUrl: "/sign-in" });
    } catch {
      setError("Unable to delete account. Please try again.");
      setIsDeleting(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        className={cn(className)}
        onClick={() => setIsOpen(true)}
      >
        <Trash2 className="size-4" />
        Delete Account
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete account</DialogTitle>
            <DialogDescription>
              This will permanently delete your account and all your items, collections,
              and tags. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                onClick={() => void handleDelete()}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Yes, delete my account"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsOpen(false);
                  setError(null);
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
