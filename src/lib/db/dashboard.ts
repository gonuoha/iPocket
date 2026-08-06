import { cache } from "react";

import {
  getRecentCollections,
  getSearchableCollections,
  getSelectableCollections,
  toDashboardStats,
  type DashboardCollection,
  type DashboardStats,
  type SearchableCollection,
  type SelectableCollection,
} from "@/lib/db/collections";
import {
  getPinnedItems,
  getRecentItems,
  getSearchableItems,
  getUserItemStats,
  type DashboardItem,
  type SearchableItem,
} from "@/lib/db/items";
import { getSidebarData, type SidebarData } from "@/lib/db/sidebar";
import { getCurrentUser, type DashboardUser } from "@/lib/db/user";

export type DashboardPageData = {
  collections: DashboardCollection[];
  stats: DashboardStats;
  pinnedItems: DashboardItem[];
  recentItems: DashboardItem[];
};

export type DashboardSearchData = {
  items: SearchableItem[];
  collections: SearchableCollection[];
};

export type DashboardLayoutData = {
  user: DashboardUser;
  sidebarData: SidebarData;
  collections: SelectableCollection[];
  searchData: DashboardSearchData;
};

export const getDashboardPageData = cache(
  async (): Promise<DashboardPageData> => {
    const user = await getCurrentUser();
    const [stats, collections, pinnedItems, recentItems] = await Promise.all([
      getUserItemStats(user.id),
      getRecentCollections(user.id),
      getPinnedItems(user.id),
      getRecentItems(user.id),
    ]);

    return {
      collections,
      stats: toDashboardStats(stats),
      pinnedItems,
      recentItems,
    };
  },
);

export const getDashboardLayoutData = cache(
  async (): Promise<DashboardLayoutData> => {
    const user = await getCurrentUser();
    const [sidebarData, collections, items, searchableCollections] =
      await Promise.all([
        getSidebarData(user),
        getSelectableCollections(user.id),
        getSearchableItems(user.id),
        getSearchableCollections(user.id),
      ]);

    return {
      user,
      sidebarData,
      collections,
      searchData: {
        items,
        collections: searchableCollections,
      },
    };
  },
);
