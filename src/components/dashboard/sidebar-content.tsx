"use client";

import Link from "next/link";
import {
  ChevronsLeft,
  Clock,
  LayoutGrid,
  PanelLeftClose,
  Pin,
  Star,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SidebarData } from "@/lib/db/sidebar";
import { getItemTypeIcon, getItemTypeStyles } from "@/lib/item-type-styles";
import { cn } from "@/lib/utils";

import { SidebarSection } from "./sidebar-section";
import { useSidebar } from "./sidebar-context";

function getTypeSlug(name: string) {
  return name.toLowerCase();
}

function getTypeLabel(name: string) {
  if (name === "link") {
    return "URL";
  }

  return name.charAt(0).toUpperCase() + name.slice(1);
}

const PRO_ITEM_TYPES = new Set(["file", "image"]);

function isProItemType(name: string) {
  return PRO_ITEM_TYPES.has(name.toLowerCase());
}

function getUserInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type SidebarContentProps = {
  sidebarData: SidebarData;
  collapsed?: boolean;
  onNavigate?: () => void;
};

export function SidebarContent({
  sidebarData,
  collapsed = false,
  onNavigate,
}: SidebarContentProps) {
  const { toggleSidebar } = useSidebar();
  const { user, itemTypes, favoriteCollections, recentCollections, itemCounts } =
    sidebarData;

  const navItems = [
    { href: "/dashboard", label: "All Items", icon: LayoutGrid, count: null },
    {
      href: "/dashboard/favorites",
      label: "Favorites",
      icon: Star,
      count: itemCounts.favoriteCount,
    },
    {
      href: "/dashboard/pinned",
      label: "Pinned",
      icon: Pin,
      count: itemCounts.pinnedCount,
    },
    { href: "/dashboard/recents", label: "Recents", icon: Clock, count: null },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col bg-sidebar text-sidebar-foreground">
      <div
        className={cn(
          "flex shrink-0 items-center p-3",
          collapsed ? "justify-center px-2" : "justify-between"
        )}
      >
        {!collapsed ? (
          <span className="px-2 text-sm font-medium">Navigation</span>
        ) : null}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden shrink-0 md:inline-flex"
        >
          {collapsed ? (
            <ChevronsLeft className="rotate-180" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="min-h-0 flex-1 px-2">
        <div className="space-y-3 pb-4">
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    item.href === "/dashboard" &&
                      "bg-sidebar-accent text-sidebar-accent-foreground",
                    collapsed && "justify-center px-0"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.count !== null ? (
                        <span className="text-xs text-muted-foreground">
                          {item.count}
                        </span>
                      ) : null}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          <SidebarSection title="Item Types" collapsed={collapsed}>
            <div className="grid grid-cols-2 gap-1 px-1">
              {itemTypes.map((type) => {
                const Icon = getItemTypeIcon(type.icon);
                const styles = getItemTypeStyles(type.color);

                return (
                  <Link
                    key={type.id}
                    href={`/items/${getTypeSlug(type.name)}`}
                    onClick={onNavigate}
                    className="flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-center text-xs transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <Icon
                      className={cn("size-4 shrink-0", styles.textClassName)}
                      style={styles.textStyle}
                    />
                    <span className="truncate">{getTypeLabel(type.name)}</span>
                    {isProItemType(type.name) ? (
                      <Badge
                        variant="outline"
                        className="h-4 border-border/60 px-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
                      >
                        PRO
                      </Badge>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </SidebarSection>

          <SidebarSection title="Collections" collapsed={collapsed}>
            <div className="space-y-2">
              {favoriteCollections.length > 0 ? (
                <div className="space-y-0.5">
                  <p className="px-2 text-xs font-medium text-muted-foreground">
                    Favorites
                  </p>
                  <nav className="space-y-0.5">
                    {favoriteCollections.map((collection) => (
                      <Link
                        key={collection.id}
                        href={`/collections/${collection.id}`}
                        onClick={onNavigate}
                        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      >
                        <Star className="size-4 shrink-0 fill-yellow-400 text-yellow-400" />
                        <span className="flex-1 truncate">{collection.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {collection.itemCount}
                        </span>
                      </Link>
                    ))}
                  </nav>
                </div>
              ) : null}

              {recentCollections.length > 0 ? (
                <div className="space-y-0.5">
                  <p className="px-2 text-xs font-medium text-muted-foreground">
                    Recent
                  </p>
                  <nav className="space-y-0.5">
                    {recentCollections.map((collection) => (
                      <Link
                        key={collection.id}
                        href={`/collections/${collection.id}`}
                        onClick={onNavigate}
                        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      >
                        <span
                          className="size-2.5 shrink-0 rounded-full bg-muted-foreground"
                          style={
                            collection.dominantTypeColor
                              ? { backgroundColor: collection.dominantTypeColor }
                              : undefined
                          }
                        />
                        <span className="flex-1 truncate">{collection.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {collection.itemCount}
                        </span>
                      </Link>
                    ))}
                  </nav>
                </div>
              ) : null}

              <Link
                href="/collections"
                onClick={onNavigate}
                className="block px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:text-sidebar-accent-foreground"
              >
                View all collections
              </Link>
            </div>
          </SidebarSection>
        </div>
      </ScrollArea>

      <div
        className={cn(
          "shrink-0 border-t border-sidebar-border p-3",
          collapsed && "flex justify-center px-2"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3",
            collapsed && "justify-center"
          )}
        >
          <Avatar size="sm">
            <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {user.name}
                {user.isPro ? (
                  <span className="text-muted-foreground"> (Pro)</span>
                ) : null}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
