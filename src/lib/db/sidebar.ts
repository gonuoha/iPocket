import {
  getFavoriteCollections,
  getSidebarRecentCollections,
  type SidebarCollection,
} from "@/lib/db/collections";
import {
  getSidebarItemCounts,
  getSystemItemTypes,
  type SidebarItemCounts,
  type SystemItemType,
} from "@/lib/db/items";
import { getDashboardUser, type DashboardUser } from "@/lib/db/user";

export type SidebarData = {
  user: DashboardUser;
  itemTypes: SystemItemType[];
  favoriteCollections: SidebarCollection[];
  recentCollections: SidebarCollection[];
  itemCounts: SidebarItemCounts;
};

export async function getSidebarData(userId: string): Promise<SidebarData> {
  const [user, itemTypes, favoriteCollections, recentCollections, itemCounts] =
    await Promise.all([
      getDashboardUser(),
      getSystemItemTypes(),
      getFavoriteCollections(userId),
      getSidebarRecentCollections(userId),
      getSidebarItemCounts(userId),
    ]);

  return {
    user,
    itemTypes,
    favoriteCollections,
    recentCollections,
    itemCounts,
  };
};
