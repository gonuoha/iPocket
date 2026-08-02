"use client";

import { CalendarDays, KeyRound, Mail } from "lucide-react";
import { useState } from "react";

import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { DeleteAccountButton } from "@/components/profile/delete-account-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserAvatar } from "@/components/user-avatar";

type AccountInformationCardProps = {
  name: string;
  email: string;
  image: string | null;
  createdAt: string;
  hasPassword: boolean;
};

function formatMemberSince(isoDate: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(isoDate));
}

export function AccountInformationCard({
  name,
  email,
  image,
  createdAt,
  hasPassword,
}: AccountInformationCardProps) {
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const accountType = hasPassword ? "Email account" : "GitHub account";

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold">Account Information</h2>

      <div className="mt-6 flex items-start gap-4">
        <UserAvatar name={name} image={image} size="lg" />
        <div className="min-w-0">
          <p className="truncate text-xl font-semibold">{name}</p>
          <p className="text-sm text-muted-foreground">{accountType}</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="size-4 shrink-0" />
          <span className="truncate">Email: {email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="size-4 shrink-0" />
          <span>Member since: {formatMemberSince(createdAt)}</span>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {hasPassword ? (
          <>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setChangePasswordOpen(true)}
            >
              <KeyRound className="size-4" />
              Change Password
            </Button>
            <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Change password</DialogTitle>
                </DialogHeader>
                <ChangePasswordForm
                  onSuccess={() => setChangePasswordOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </>
        ) : null}
        <DeleteAccountButton className={hasPassword ? "flex-1" : "sm:w-auto"} />
      </div>
    </div>
  );
}
