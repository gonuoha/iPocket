"use client";

import { CalendarDays, Mail } from "lucide-react";

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
    </div>
  );
}
