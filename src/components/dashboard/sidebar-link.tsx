"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

import { useSidebar } from "./sidebar-context";

type SidebarLinkProps = ComponentProps<typeof Link>;

export function SidebarLink({ onClick, className, ...props }: SidebarLinkProps) {
  const { isMobile, setMobileOpen } = useSidebar();

  return (
    <Link
      {...props}
      className={className}
      onClick={(event) => {
        onClick?.(event);

        if (isMobile) {
          setMobileOpen(false);
        }
      }}
    />
  );
}

type SidebarNavLinkProps = SidebarLinkProps & {
  active?: boolean;
};

export function SidebarNavLink({
  active = false,
  className,
  children,
  ...props
}: SidebarNavLinkProps) {
  return (
    <SidebarLink
      {...props}
      className={cn(
        "sidebar-nav-link flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        active &&
          "bg-sidebar-accent text-sidebar-accent-foreground",
        className,
      )}
    >
      {children}
    </SidebarLink>
  );
}
