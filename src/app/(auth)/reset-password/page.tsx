import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { buttonVariants } from "@/components/ui/button";
import { validatePasswordResetToken } from "@/lib/email/password-reset";
import { cn } from "@/lib/utils";

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthCard
        title="Invalid link"
        description="This password reset link is missing a token"
      >
        <p className="text-sm text-muted-foreground">
          Request a new password reset link from the sign-in page.
        </p>
        <Link href="/forgot-password" className={cn(buttonVariants(), "mt-4 w-full")}>
          Request reset link
        </Link>
      </AuthCard>
    );
  }

  const result = await validatePasswordResetToken(token);

  if (result.status === "expired") {
    return (
      <AuthCard
        title="Link expired"
        description="This password reset link has expired"
      >
        <p className="text-sm text-muted-foreground">
          Password reset links expire after 1 hour. Request a new link to continue.
        </p>
        <Link href="/forgot-password" className={cn(buttonVariants(), "mt-4 w-full")}>
          Request new link
        </Link>
      </AuthCard>
    );
  }

  if (result.status === "invalid") {
    return (
      <AuthCard
        title="Invalid link"
        description="This password reset link is not valid"
      >
        <p className="text-sm text-muted-foreground">
          The link may have already been used or is incorrect. Request a new password reset link.
        </p>
        <Link href="/forgot-password" className={cn(buttonVariants(), "mt-4 w-full")}>
          Request new link
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Reset password" description="Choose a new password for your account">
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}
