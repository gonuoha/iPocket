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

export type SearchableItem = {
  id: string;
  title: string;
  type: CollectionItemType;
  contentPreview: string | null;
};

export type FileListItem = {
  id: string;
  title: string;
  fileName: string | null;
  fileSize: number | null;
  createdAt: Date;
  isPinned: boolean;
  isFavorite: boolean;
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
  collections: { id: string; name: string }[];
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
  collections: {
    select: {
      collection: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      collection: {
        name: "asc",
      },
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

const fileItemSelect = {
  id: true,
  title: true,
  fileName: true,
  fileSize: true,
  createdAt: true,
  isPinned: true,
  isFavorite: true,
} as const;

function mapFileItem(item: {
  id: string;
  title: string;
  fileName: string | null;
  fileSize: number | null;
  createdAt: Date;
  isPinned: boolean;
  isFavorite: boolean;
}): FileListItem {
  return {
    id: item.id,
    title: item.title,
    fileName: item.fileName,
    fileSize: item.fileSize,
    createdAt: item.createdAt,
    isPinned: item.isPinned,
    isFavorite: item.isFavorite,
  };
}

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
  collections: { collection: { id: string; name: string } }[];
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
    collections: item.collections.map((entry) => entry.collection),
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

export type UpdateItemData = {
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  tags: string[];
  collectionIds: string[];
};

export type CreateItemData = {
  typeId: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  tags: string[];
  collectionIds: string[];
  contentType: "text" | "file";
};

export async function createItem(
  userId: string,
  data: CreateItemData,
): Promise<ItemDetail> {
  const item = await prisma.item.create({
    data: {
      userId,
      typeId: data.typeId,
      title: data.title,
      description: data.description,
      content: data.content,
      url: data.url,
      language: data.language,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      contentType: data.contentType,
      tags: {
        create: data.tags.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { userId_name: { userId, name } },
              create: { userId, name },
            },
          },
        })),
      },
      collections: {
        create: data.collectionIds.map((collectionId) => ({
          collection: {
            connect: { id: collectionId },
          },
        })),
      },
    },
    select: itemDetailSelect,
  });

  return mapItemDetail(item);
}

export async function updateItem(
  userId: string,
  itemId: string,
  data: UpdateItemData,
): Promise<ItemDetail | null> {
  const existing = await prisma.item.findFirst({
    where: { id: itemId, userId },
    select: { id: true },
  });

  if (!existing) {
    return null;
  }

  const item = await prisma.item.update({
    where: { id: itemId },
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      url: data.url,
      language: data.language,
      tags: {
        deleteMany: {},
        create: data.tags.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { userId_name: { userId, name } },
              create: { userId, name },
            },
          },
        })),
      },
      collections: {
        deleteMany: {},
        create: data.collectionIds.map((collectionId) => ({
          collection: {
            connect: { id: collectionId },
          },
        })),
      },
    },
    select: itemDetailSelect,
  });

  return mapItemDetail(item);
}

export type DeleteItemResult = {
  typeName: string;
  fileUrl: string | null;
};

export async function deleteItem(
  userId: string,
  itemId: string,
): Promise<DeleteItemResult | null> {
  const existing = await prisma.item.findFirst({
    where: { id: itemId, userId },
    select: {
      id: true,
      fileUrl: true,
      type: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!existing) {
    return null;
  }

  await prisma.item.delete({
    where: { id: itemId },
  });

  return {
    typeName: existing.type.name,
    fileUrl: existing.fileUrl,
  };
}

const CONTENT_PREVIEW_MAX_LENGTH = 120;

function truncateContentPreview(value: string): string {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= CONTENT_PREVIEW_MAX_LENGTH) {
    return normalized;
  }

  return `${normalized.slice(0, CONTENT_PREVIEW_MAX_LENGTH).trimEnd()}...`;
}

function buildItemContentPreview(item: {
  content: string | null;
  url: string | null;
  fileName: string | null;
  description: string | null;
}): string | null {
  if (item.content) {
    return truncateContentPreview(item.content);
  }

  if (item.url) {
    return item.url;
  }

  if (item.fileName) {
    return item.fileName;
  }

  if (item.description) {
    return truncateContentPreview(item.description);
  }

  return null;
}

export async function getSearchableItems(
  userId: string,
): Promise<SearchableItem[]> {
  const items = await prisma.item.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      content: true,
      url: true,
      fileName: true,
      description: true,
      type: {
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
        },
      },
    },
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    type: item.type,
    contentPreview: buildItemContentPreview(item),
  }));
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

export async function getItemsByCollection(
  userId: string,
  collectionId: string,
): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: {
      userId,
      collections: {
        some: { collectionId },
      },
    },
    orderBy: { updatedAt: "desc" },
    select: itemSelect,
  });

  return items.map(mapItem);
}

const collectionItemsWhere = (userId: string, collectionId: string) => ({
  userId,
  collections: {
    some: { collectionId },
  },
});

export async function getFileItemsByCollection(
  userId: string,
  collectionId: string,
): Promise<FileListItem[]> {
  const items = await prisma.item.findMany({
    where: {
      ...collectionItemsWhere(userId, collectionId),
      type: {
        name: { equals: "file", mode: "insensitive" },
      },
    },
    orderBy: { createdAt: "desc" },
    select: fileItemSelect,
  });

  return items.map(mapFileItem);
}

export async function getFileItemsByType(
  userId: string,
  typeId: string,
): Promise<FileListItem[]> {
  const items = await prisma.item.findMany({
    where: { userId, typeId },
    orderBy: { createdAt: "desc" },
    select: fileItemSelect,
  });

  return items.map(mapFileItem);
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
