import { prisma } from "@/lib/prisma";

export type CollectionItemType = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
};

export type DashboardCollection = {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  types: CollectionItemType[];
  dominantTypeColor: string | null;
};

export type DashboardStats = {
  itemCount: number;
  collectionCount: number;
  favoriteItemCount: number;
  favoriteCollectionCount: number;
};

export type SidebarCollection = {
  id: string;
  name: string;
  itemCount: number;
  dominantTypeColor: string | null;
};

export type CreatedCollection = {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
};

export type CollectionDetail = {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
};

export type SelectableCollection = {
  id: string;
  name: string;
};

export type SearchableCollection = {
  id: string;
  name: string;
  itemCount: number;
};

type CollectionTypeAggregation = {
  types: CollectionItemType[];
  dominantTypeColor: string | null;
};

async function getCollectionTypeAggregations(
  collectionIds: string[],
): Promise<Map<string, CollectionTypeAggregation>> {
  const result = new Map<string, CollectionTypeAggregation>();

  if (collectionIds.length === 0) {
    return result;
  }

  const typeCounts = await prisma.itemCollection.findMany({
    where: { collectionId: { in: collectionIds } },
    select: {
      collectionId: true,
      item: {
        select: {
          typeId: true,
        },
      },
    },
  });

  const groupedCounts = new Map<string, Map<string, number>>();

  for (const row of typeCounts) {
    const countsByType =
      groupedCounts.get(row.collectionId) ?? new Map<string, number>();
    const currentCount = countsByType.get(row.item.typeId) ?? 0;
    countsByType.set(row.item.typeId, currentCount + 1);
    groupedCounts.set(row.collectionId, countsByType);
  }

  if (groupedCounts.size === 0) {
    for (const collectionId of collectionIds) {
      result.set(collectionId, { types: [], dominantTypeColor: null });
    }
    return result;
  }

  const typeIds = [
    ...new Set(
      [...groupedCounts.values()].flatMap((countsByType) => [
        ...countsByType.keys(),
      ]),
    ),
  ];
  const types = await prisma.itemType.findMany({
    where: { id: { in: typeIds } },
    select: {
      id: true,
      name: true,
      icon: true,
      color: true,
    },
  });
  const typeById = new Map(types.map((type) => [type.id, type]));

  for (const collectionId of collectionIds) {
    const countsByType = groupedCounts.get(collectionId);
    const uniqueTypes: CollectionItemType[] = [];
    let dominantTypeColor: string | null = null;
    let maxCount = 0;

    if (countsByType) {
      for (const [typeId, count] of countsByType) {
        const type = typeById.get(typeId);
        if (!type) {
          continue;
        }

        uniqueTypes.push(type);

        if (count > maxCount) {
          maxCount = count;
          dominantTypeColor = type.color;
        }
      }
    }

    result.set(collectionId, { types: uniqueTypes, dominantTypeColor });
  }

  return result;
}

function mapToDashboardCollection(
  collection: {
    id: string;
    name: string;
    description: string | null;
    isFavorite: boolean;
    _count: { items: number };
  },
  aggregation: CollectionTypeAggregation,
): DashboardCollection {
  return {
    id: collection.id,
    name: collection.name,
    description: collection.description,
    isFavorite: collection.isFavorite,
    itemCount: collection._count.items,
    types: aggregation.types,
    dominantTypeColor: aggregation.dominantTypeColor,
  };
}

function mapToSidebarCollection(
  collection: {
    id: string;
    name: string;
    _count: { items: number };
  },
  aggregation: CollectionTypeAggregation,
): SidebarCollection {
  return {
    id: collection.id,
    name: collection.name,
    itemCount: collection._count.items,
    dominantTypeColor: aggregation.dominantTypeColor,
  };
}

const collectionCountInclude = {
  _count: {
    select: { items: true },
  },
} as const;

export async function getAllCollections(
  userId: string,
): Promise<DashboardCollection[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    include: collectionCountInclude,
  });

  const aggregations = await getCollectionTypeAggregations(
    collections.map((collection) => collection.id),
  );

  return collections.map((collection) =>
    mapToDashboardCollection(
      collection,
      aggregations.get(collection.id) ?? { types: [], dominantTypeColor: null },
    ),
  );
}

export async function getCollectionById(
  userId: string,
  collectionId: string,
): Promise<CollectionDetail | null> {
  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
    include: collectionCountInclude,
  });

  if (!collection) {
    return null;
  }

  return {
    id: collection.id,
    name: collection.name,
    description: collection.description,
    isFavorite: collection.isFavorite,
    itemCount: collection._count.items,
  };
}

export async function getRecentCollections(
  userId: string,
  limit = 6,
): Promise<DashboardCollection[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: collectionCountInclude,
  });

  const aggregations = await getCollectionTypeAggregations(
    collections.map((collection) => collection.id),
  );

  return collections.map((collection) =>
    mapToDashboardCollection(
      collection,
      aggregations.get(collection.id) ?? { types: [], dominantTypeColor: null },
    ),
  );
}

export async function getFavoriteCollections(
  userId: string,
  limit = 10,
): Promise<SidebarCollection[]> {
  const collections = await prisma.collection.findMany({
    where: { userId, isFavorite: true },
    orderBy: { name: "asc" },
    take: limit,
    include: collectionCountInclude,
  });

  return collections.map((collection) => ({
    id: collection.id,
    name: collection.name,
    itemCount: collection._count.items,
    dominantTypeColor: null,
  }));
}

export async function getSidebarRecentCollections(
  userId: string,
  limit = 10,
): Promise<SidebarCollection[]> {
  const collections = await prisma.collection.findMany({
    where: { userId, isFavorite: false },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: collectionCountInclude,
  });

  const aggregations = await getCollectionTypeAggregations(
    collections.map((collection) => collection.id),
  );

  return collections.map((collection) =>
    mapToSidebarCollection(
      collection,
      aggregations.get(collection.id) ?? { types: [], dominantTypeColor: null },
    ),
  );
}

export async function createCollection(
  userId: string,
  data: {
    name: string;
    description: string | null;
  },
): Promise<CreatedCollection> {
  return prisma.collection.create({
    data: {
      userId,
      name: data.name,
      description: data.description,
    },
    select: {
      id: true,
      name: true,
      description: true,
      isFavorite: true,
    },
  });
}

export async function updateCollection(
  userId: string,
  collectionId: string,
  data: {
    name: string;
    description: string | null;
  },
): Promise<CreatedCollection | null> {
  const existing = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
    select: { id: true },
  });

  if (!existing) {
    return null;
  }

  return prisma.collection.update({
    where: { id: collectionId },
    data: {
      name: data.name,
      description: data.description,
    },
    select: {
      id: true,
      name: true,
      description: true,
      isFavorite: true,
    },
  });
}

export type DeletedCollection = {
  id: string;
  name: string;
};

export async function deleteCollection(
  userId: string,
  collectionId: string,
): Promise<DeletedCollection | null> {
  const existing = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
    select: { id: true, name: true },
  });

  if (!existing) {
    return null;
  }

  await prisma.collection.delete({
    where: { id: collectionId },
  });

  return existing;
}

export async function getSelectableCollections(
  userId: string,
): Promise<SelectableCollection[]> {
  return prisma.collection.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
    },
  });
}

export async function getSearchableCollections(
  userId: string,
): Promise<SearchableCollection[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    include: collectionCountInclude,
  });

  return collections.map((collection) => ({
    id: collection.id,
    name: collection.name,
    itemCount: collection._count.items,
  }));
}

export async function validateUserCollectionIds(
  userId: string,
  collectionIds: string[],
): Promise<boolean> {
  if (collectionIds.length === 0) {
    return true;
  }

  const count = await prisma.collection.count({
    where: {
      userId,
      id: { in: collectionIds },
    },
  });

  return count === collectionIds.length;
}

export function toDashboardStats(stats: {
  itemCount: number;
  collectionCount: number;
  favoriteItemCount: number;
  favoriteCollectionCount: number;
}): DashboardStats {
  return {
    itemCount: stats.itemCount,
    collectionCount: stats.collectionCount,
    favoriteItemCount: stats.favoriteItemCount,
    favoriteCollectionCount: stats.favoriteCollectionCount,
  };
}
