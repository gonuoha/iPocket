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

  const typeCounts = await prisma.item.groupBy({
    by: ["collectionId", "typeId"],
    where: { collectionId: { in: collectionIds } },
    _count: { typeId: true },
  });

  if (typeCounts.length === 0) {
    for (const collectionId of collectionIds) {
      result.set(collectionId, { types: [], dominantTypeColor: null });
    }
    return result;
  }

  const typeIds = [...new Set(typeCounts.map((row) => row.typeId))];
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
    const rows = typeCounts.filter((row) => row.collectionId === collectionId);
    const uniqueTypes: CollectionItemType[] = [];
    let dominantTypeColor: string | null = null;
    let maxCount = 0;

    for (const row of rows) {
      const type = typeById.get(row.typeId);
      if (!type) {
        continue;
      }

      uniqueTypes.push(type);

      if (row._count.typeId > maxCount) {
        maxCount = row._count.typeId;
        dominantTypeColor = type.color;
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
