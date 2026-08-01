import {
  Clock,
  LayoutGrid,
  Pin,
  Star,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SidebarData } from "@/lib/db/sidebar";
import { getItemTypeIcon, getItemTypeStyles } from "@/lib/item-type-styles";
import { cn } from "@/lib/utils";

import { SidebarCollapseButton } from "./sidebar-collapse-button";
import { SidebarLink, SidebarNavLink } from "./sidebar-link";
import { SidebarSection } from "./sidebar-section";
import { SidebarUserMenu } from "./sidebar-user-menu";

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

type SidebarContentProps = {
  sidebarData: SidebarData;
};

export function SidebarContent({ sidebarData }: SidebarContentProps) {
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
      <div className="sidebar-header group-data-[collapsed]:justify-center group-data-[collapsed]:px-2 flex shrink-0 items-center justify-between p-3">
        <span className="sidebar-text group-data-[collapsed]:hidden px-2 text-sm font-medium">
          Navigation
        </span>
        <SidebarCollapseButton />
      </div>

      <ScrollArea className="min-h-0 flex-1 px-2">
        <div className="space-y-3 pb-4">
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <SidebarNavLink
                  key={item.href}
                  href={item.href}
                  active={item.href === "/dashboard"}
                  title={item.label}
                  className="group-data-[collapsed]:justify-center group-data-[collapsed]:px-0"
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="sidebar-text group-data-[collapsed]:hidden flex-1 truncate">{item.label}</span>
                  {item.count !== null ? (
                    <span className="sidebar-text group-data-[collapsed]:hidden text-xs text-muted-foreground">
                      {item.count}
                    </span>
                  ) : null}
                </SidebarNavLink>
              );
            })}
          </nav>

          <SidebarSection title="Item Types" className="sidebar-section">
            <div className="grid grid-cols-2 gap-1 px-1">
              {itemTypes.map((type) => {
                const Icon = getItemTypeIcon(type.icon);
                const styles = getItemTypeStyles(type.color);

                return (
                  <SidebarLink
                    key={type.id}
                    href={`/items/${getTypeSlug(type.name)}`}
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
                  </SidebarLink>
                );
              })}
            </div>
          </SidebarSection>

          <SidebarSection title="Collections" className="sidebar-section">
            <div className="space-y-2">
              {favoriteCollections.length > 0 ? (
                <div className="space-y-0.5">
                  <p className="px-2 text-xs font-medium text-muted-foreground">
                    Favorites
                  </p>
                  <nav className="space-y-0.5">
                    {favoriteCollections.map((collection) => (
                      <SidebarLink
                        key={collection.id}
                        href={`/collections/${collection.id}`}
                        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      >
                        <Star className="size-4 shrink-0 fill-yellow-400 text-yellow-400" />
                        <span className="flex-1 truncate">{collection.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {collection.itemCount}
                        </span>
                      </SidebarLink>
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
                      <SidebarLink
                        key={collection.id}
                        href={`/collections/${collection.id}`}
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
                      </SidebarLink>
                    ))}
                  </nav>
                </div>
              ) : null}

              <SidebarLink
                href="/collections"
                className="block px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:text-sidebar-accent-foreground"
              >
                View all collections
              </SidebarLink>
            </div>
          </SidebarSection>
        </div>
      </ScrollArea>

      <div className="sidebar-footer group-data-[collapsed]:flex group-data-[collapsed]:justify-center group-data-[collapsed]:px-2 shrink-0 border-t border-sidebar-border p-3">
        <SidebarUserMenu user={user} />
      </div>
    </div>
  );
}
