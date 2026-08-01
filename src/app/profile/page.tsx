import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { UserAvatar } from "@/components/user-avatar";
import { getCurrentUser } from "@/lib/db/user";

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect("/sign-in");
  }

  const user = await getCurrentUser();

  return (
    <div className="mx-auto flex min-h-svh max-w-lg flex-col justify-center gap-6 p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Your account details
        </p>
      </div>

      <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-6">
        <UserAvatar name={user.name} image={user.image} size="lg" />
        <div className="min-w-0">
          <p className="truncate font-medium">{user.name}</p>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          {user.isPro ? (
            <p className="mt-1 text-xs text-muted-foreground">Pro member</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
