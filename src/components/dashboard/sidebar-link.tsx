"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  active,
  className,
  children,
  href,
  ...props
}: SidebarNavLinkProps) {
  const pathname = usePathname();
  const isActive =
    active ?? (typeof href === "string" && pathname === href);

  return (
    <SidebarLink
      {...props}
      href={href}
      className={cn(
        "sidebar-nav-link flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive &&
          "bg-sidebar-accent text-sidebar-accent-foreground",
        className,
      )}
    >
      {children}
    </SidebarLink>
  );
}
