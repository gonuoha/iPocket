import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { buttonVariants } from "@/components/ui/button";
import { verifyEmailToken } from "@/lib/email/verification";
import { cn } from "@/lib/utils";

type VerifyEmailPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthCard
        title="Invalid link"
        description="This verification link is missing a token."
      >
        <p className="text-sm text-muted-foreground">
          Check your email for the latest verification link, or register again if needed.
        </p>
        <Link href="/register" className={cn(buttonVariants(), "mt-4 w-full")}>
          Back to register
        </Link>
      </AuthCard>
    );
  }

  const result = await verifyEmailToken(token);

  if (result.status === "success") {
    return (
      <AuthCard
        title="Email verified"
        description="Your account is ready to use"
      >
        <p className="text-sm text-muted-foreground">
          Thanks for confirming your email address. You can now sign in to Memex.
        </p>
        <Link href="/sign-in?verified=1" className={cn(buttonVariants(), "mt-4 w-full")}>
          Sign in
        </Link>
      </AuthCard>
    );
  }

  if (result.status === "expired") {
    return (
      <AuthCard
        title="Link expired"
        description="This verification link has expired"
      >
        <p className="text-sm text-muted-foreground">
          Verification links expire after 24 hours. Register again to receive a new email.
        </p>
        <Link href="/register" className={cn(buttonVariants(), "mt-4 w-full")}>
          Register
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Invalid link"
      description="This verification link is not valid"
    >
      <p className="text-sm text-muted-foreground">
        The link may have already been used or is incorrect. Check your email for the latest
        verification link.
      </p>
      <Link href="/sign-in" className={cn(buttonVariants(), "mt-4 w-full")}>
        Back to sign in
      </Link>
    </AuthCard>
  );
}
