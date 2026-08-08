import Link from "next/link";

import { auth } from "@/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function HomepageNavbarActions() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  if (isLoggedIn) {
    return (
      <Button
        render={<Link href="/dashboard" />}
        nativeButton={false}
        size="sm"
        className="min-h-11 w-full sm:w-auto"
      >
        Dashboard
      </Button>
    );
  }

  return (
    <>
      <Link
        href="/sign-in"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "min-h-11 w-full sm:w-auto",
        )}
      >
        Sign In
      </Link>
      <Link
        href="/register"
        className={cn(buttonVariants({ size: "sm" }), "min-h-11 w-full sm:w-auto")}
      >
        Get Started
      </Link>
    </>
  );
}
