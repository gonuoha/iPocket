"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";

type SidebarUserMenuProps = {
  user: {
    name: string;
    email: string;
    image: string | null;
    isPro: boolean;
  };
};

export function SidebarUserMenu({ user }: SidebarUserMenuProps) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "group-data-[collapsed]:justify-center flex w-full items-center gap-3 rounded-lg p-1 text-left outline-none",
          "hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        <UserAvatar name={user.name} image={user.image} size="sm" />
        <div className="sidebar-text group-data-[collapsed]:hidden min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {user.name}
            {user.isPro ? (
              <span className="text-muted-foreground"> (Pro)</span>
            ) : null}
          </p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="w-48">
        <DropdownMenuItem onClick={() => router.push("/profile")}>
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={() => signOut({ callbackUrl: "/sign-in" })}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
