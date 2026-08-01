import {
  getFavoriteCollections,
  getSidebarRecentCollections,
  type SidebarCollection,
} from "@/lib/db/collections";
import {
  getSystemItemTypes,
  getUserItemStats,
  toSidebarItemCounts,
  type SidebarItemCounts,
  type SystemItemType,
} from "@/lib/db/items";
import type { DashboardUser } from "@/lib/db/user";

export type SidebarData = {
  user: DashboardUser;
  itemTypes: SystemItemType[];
  favoriteCollections: SidebarCollection[];
  recentCollections: SidebarCollection[];
  itemCounts: SidebarItemCounts;
};

export async function getSidebarData(user: DashboardUser): Promise<SidebarData> {
  const [itemTypes, favoriteCollections, recentCollections, stats] =
    await Promise.all([
      getSystemItemTypes(),
      getFavoriteCollections(user.id),
      getSidebarRecentCollections(user.id),
      getUserItemStats(user.id),
    ]);

  return {
    user,
    itemTypes,
    favoriteCollections,
    recentCollections,
    itemCounts: toSidebarItemCounts(stats),
  };
}
