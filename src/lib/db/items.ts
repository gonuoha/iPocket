import { cache } from "react";

import { sortItemTypesBySystemOrder } from "@/lib/item-type-styles";
import { prisma } from "@/lib/prisma";

import type { CollectionItemType } from "./collections";

export type DashboardItem = {
  id: string;
  title: string;
  description: string | null;
  isPinned: boolean;
  isFavorite: boolean;
  updatedAt: Date;
  type: CollectionItemType;
  tags: string[];
};

export type UserItemStats = {
  itemCount: number;
  collectionCount: number;
  favoriteItemCount: number;
  favoriteCollectionCount: number;
  pinnedCount: number;
};

const itemSelect = {
  id: true,
  title: true,
  description: true,
  isPinned: true,
  isFavorite: true,
  updatedAt: true,
  type: {
    select: {
      id: true,
      name: true,
      icon: true,
      color: true,
    },
  },
  tags: {
    select: {
      tag: {
        select: {
          name: true,
        },
      },
    },
  },
} as const;

function mapItem(item: {
  id: string;
  title: string;
  description: string | null;
  isPinned: boolean;
  isFavorite: boolean;
  updatedAt: Date;
  type: CollectionItemType;
  tags: { tag: { name: string } }[];
}): DashboardItem {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    isPinned: item.isPinned,
    isFavorite: item.isFavorite,
    updatedAt: item.updatedAt,
    type: item.type,
    tags: item.tags.map((entry) => entry.tag.name),
  };
}

export async function getPinnedItems(
  userId: string,
  limit = 20,
): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: { userId, isPinned: true },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: itemSelect,
  });

  return items.map(mapItem);
}

export async function getRecentItems(
  userId: string,
  limit = 10,
): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: itemSelect,
  });

  return items.map(mapItem);
}

export type SystemItemType = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
};

export type SidebarItemCounts = {
  favoriteCount: number;
  pinnedCount: number;
};

export async function getSystemItemTypes(): Promise<SystemItemType[]> {
  const itemTypes = await prisma.itemType.findMany({
    where: { isSystem: true },
    select: {
      id: true,
      name: true,
      icon: true,
      color: true,
    },
  });

  return sortItemTypesBySystemOrder(itemTypes);
}

export const getUserItemStats = cache(
  async (userId: string): Promise<UserItemStats> => {
  const [
    itemCount,
    collectionCount,
    favoriteItemCount,
    favoriteCollectionCount,
    pinnedCount,
  ] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.item.count({ where: { userId, isFavorite: true } }),
    prisma.collection.count({ where: { userId, isFavorite: true } }),
    prisma.item.count({ where: { userId, isPinned: true } }),
  ]);

  return {
    itemCount,
    collectionCount,
    favoriteItemCount,
    favoriteCollectionCount,
    pinnedCount,
  };
  },
);

export function toSidebarItemCounts(
  stats: UserItemStats,
): SidebarItemCounts {
  return {
    favoriteCount: stats.favoriteItemCount,
    pinnedCount: stats.pinnedCount,
  };
}
