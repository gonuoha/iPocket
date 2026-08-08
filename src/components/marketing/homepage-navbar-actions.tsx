import Link from "next/link";

import { auth } from "@/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function HomepageNavbarActions() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  if (isLoggedIn) {
    return (
      <Button render={<Link href="/dashboard" />} nativeButton={false} size="sm">
        Dashboard
      </Button>
    );
  }

  return (
    <>
      <Link
        href="/sign-in"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
      >
        Sign In
      </Link>
      <Link
        href="/register"
        className={cn(buttonVariants({ size: "sm" }))}
      >
        Get Started
      </Link>
    </>
  );
}
