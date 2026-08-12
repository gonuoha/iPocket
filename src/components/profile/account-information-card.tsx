"use client";

import { CalendarDays, Mail } from "lucide-react";

import { PageSection } from "@/components/layout/page-container";
import { UserAvatar } from "@/components/user-avatar";
import { formatLongDate } from "@/lib/format-date";

type AccountInformationCardProps = {
  name: string;
  email: string;
  image: string | null;
  createdAt: string;
  hasPassword: boolean;
};

export function AccountInformationCard({
  name,
  email,
  image,
  createdAt,
  hasPassword,
}: AccountInformationCardProps) {
  const accountType = hasPassword ? "Email account" : "GitHub account";

  return (
    <PageSection title="Account Information">
      <div className="flex items-start gap-4">
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
          <span>Member since: {formatLongDate(createdAt)}</span>
        </div>
      </div>
    </PageSection>
  );
}
