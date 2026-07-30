"use client";

import Link from "next/link";
import {
  ChevronsLeft,
  Clock,
  Code2,
  Folder,
  LayoutGrid,
  Pin,
  Plus,
  Search,
  Star,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  collections,
  currentUser,
  itemTypes,
  items,
} from "@/lib/mock-data";
import {
  itemTypeColors,
  itemTypeIcons,
} from "@/lib/item-type-styles";
import { cn } from "@/lib/utils";

import { SidebarSection } from "./sidebar-section";
import { useSidebar } from "./sidebar-context";

function getTypeSlug(name: string) {
  return name.toLowerCase();
}

function getTypeLabel(name: string) {
  if (name === "Links") return "URL";
  return name.replace(/s$/, "");
}

function getUserInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const favoriteCount = items.filter((item) => item.isFavorite).length;
const pinnedCount = items.filter((item) => item.isPinned).length;

type SidebarContentProps = {
  collapsed?: boolean;
  onNavigate?: () => void;
};

export function SidebarContent({
  collapsed = false,
  onNavigate,
}: SidebarContentProps) {
  const { toggleSidebar } = useSidebar();

  const navItems = [
    { href: "/dashboard", label: "All Items", icon: LayoutGrid, count: null },
    {
      href: "/dashboard/favorites",
      label: "Favorites",
      icon: Star,
      count: favoriteCount,
    },
    { href: "/dashboard/pinned", label: "Pinned", icon: Pin, count: pinnedCount },
    { href: "/dashboard/recents", label: "Recents", icon: Clock, count: null },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col bg-sidebar text-sidebar-foreground">
      <div
        className={cn(
          "flex shrink-0 items-center p-3",
          collapsed ? "flex-col gap-2 px-2" : "justify-between"
        )}
      >
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className={cn(
            "flex min-w-0 items-center gap-2 font-semibold",
            collapsed && "justify-center"
          )}
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Code2 className="size-4" />
          </div>
          {!collapsed && <span className="truncate">iPocket</span>}
        </Link>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden shrink-0 md:inline-flex"
        >
          <ChevronsLeft className={cn(collapsed && "rotate-180")} />
        </Button>
      </div>

      <ScrollArea className="min-h-0 flex-1 px-2">
        <div className="space-y-3 pb-4">
          {!collapsed ? (
            <>
              <Button
                disabled
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-500/90 hover:to-cyan-500/90"
              >
                <Plus />
                Add New
              </Button>

              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Quick search..."
                  className="pl-8"
                  disabled
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                disabled
                aria-label="Add New"
              >
                <Plus />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled
                aria-label="Search"
              >
                <Search />
              </Button>
            </div>
          )}

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
                const Icon = itemTypeIcons[type.icon];
                return (
                  <Link
                    key={type.id}
                    href={`/items/${getTypeSlug(type.name)}`}
                    onClick={onNavigate}
                    className="flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-center text-xs transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <Icon
                      className={cn("size-4 shrink-0", itemTypeColors[type.color])}
                    />
                    <span className="truncate">{getTypeLabel(type.name)}</span>
                  </Link>
                );
              })}
            </div>
          </SidebarSection>

          <SidebarSection title="Collections" collapsed={collapsed}>
            <nav className="space-y-0.5">
              {collections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.id}`}
                  onClick={onNavigate}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <Folder className="size-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate">{collection.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {collection.itemCount}
                  </span>
                </Link>
              ))}
            </nav>
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
            <AvatarFallback>{getUserInitials(currentUser.name)}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {currentUser.name}
                {currentUser.isPro ? (
                  <span className="text-muted-foreground"> (Pro)</span>
                ) : null}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {currentUser.email}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
