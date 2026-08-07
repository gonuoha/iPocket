import { cache } from "react";

import {
  DASHBOARD_COLLECTIONS_LIMIT,
  DASHBOARD_RECENT_ITEMS_LIMIT,
} from "@/lib/pagination";

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
import { getEditorPreferences } from "@/lib/db/settings";
import { getCurrentUser, type DashboardUser } from "@/lib/db/user";
import type { EditorPreferences } from "@/lib/editor-preferences";

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
  editorPreferences: EditorPreferences;
};

export const getDashboardPageData = cache(
  async (): Promise<DashboardPageData> => {
    const user = await getCurrentUser();
    const [stats, collections, pinnedItems, recentItems] = await Promise.all([
      getUserItemStats(user.id),
      getRecentCollections(user.id, DASHBOARD_COLLECTIONS_LIMIT),
      getPinnedItems(user.id),
      getRecentItems(user.id, DASHBOARD_RECENT_ITEMS_LIMIT),
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
    const [sidebarData, collections, items, searchableCollections, editorPreferences] =
      await Promise.all([
        getSidebarData(user),
        getSelectableCollections(user.id),
        getSearchableItems(user.id),
        getSearchableCollections(user.id),
        getEditorPreferences(user.id),
      ]);

    return {
      user,
      sidebarData,
      collections,
      searchData: {
        items,
        collections: searchableCollections,
      },
      editorPreferences,
    };
  },
);
