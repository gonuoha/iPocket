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

export type ItemDetail = {
  id: string;
  title: string;
  description: string | null;
  contentType: string;
  content: string | null;
  url: string | null;
  language: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  isFavorite: boolean;
  isPinned: boolean;
  type: CollectionItemType;
  tags: string[];
  collection: { id: string; name: string } | null;
  createdAt: Date;
  updatedAt: Date;
};

export type UserItemStats = {
  itemCount: number;
  collectionCount: number;
  favoriteItemCount: number;
  favoriteCollectionCount: number;
  pinnedCount: number;
};

const itemDetailSelect = {
  id: true,
  title: true,
  description: true,
  contentType: true,
  content: true,
  url: true,
  language: true,
  fileUrl: true,
  fileName: true,
  fileSize: true,
  isFavorite: true,
  isPinned: true,
  createdAt: true,
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
  collection: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

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

function mapItemDetail(item: {
  id: string;
  title: string;
  description: string | null;
  contentType: string;
  content: string | null;
  url: string | null;
  language: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  type: CollectionItemType;
  tags: { tag: { name: string } }[];
  collection: { id: string; name: string } | null;
}): ItemDetail {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    contentType: item.contentType,
    content: item.content,
    url: item.url,
    language: item.language,
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    type: item.type,
    tags: item.tags.map((entry) => entry.tag.name),
    collection: item.collection,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

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

export async function getItemById(
  userId: string,
  itemId: string,
): Promise<ItemDetail | null> {
  const item = await prisma.item.findFirst({
    where: { id: itemId, userId },
    select: itemDetailSelect,
  });

  if (!item) {
    return null;
  }

  return mapItemDetail(item);
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

export async function getItemTypeBySlug(userId: string, slug: string) {
  const normalizedSlug = slug.toLowerCase();

  return prisma.itemType.findFirst({
    where: {
      name: { equals: normalizedSlug, mode: "insensitive" },
      OR: [{ isSystem: true }, { userId }],
    },
    select: {
      id: true,
      name: true,
      icon: true,
      color: true,
    },
  });
}

export async function getItemsByType(
  userId: string,
  typeId: string,
): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: { userId, typeId },
    orderBy: { updatedAt: "desc" },
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

export type SidebarItemType = SystemItemType & {
  itemCount: number;
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

export async function getSidebarItemTypes(
  userId: string,
): Promise<SidebarItemType[]> {
  const [itemTypes, typeCounts] = await Promise.all([
    getSystemItemTypes(),
    prisma.item.groupBy({
      by: ["typeId"],
      where: { userId },
      _count: { _all: true },
    }),
  ]);

  const countByTypeId = new Map(
    typeCounts.map((entry) => [entry.typeId, entry._count._all]),
  );

  return itemTypes.map((type) => ({
    ...type,
    itemCount: countByTypeId.get(type.id) ?? 0,
  }));
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
