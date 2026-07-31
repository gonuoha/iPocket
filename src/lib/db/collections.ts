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

function getDominantTypeColor(
  items: { typeId: string; type: CollectionItemType }[],
): string | null {
  if (items.length === 0) {
    return null;
  }

  const typeCounts = new Map<string, { count: number; color: string | null }>();

  for (const item of items) {
    const current = typeCounts.get(item.typeId);

    if (current) {
      current.count += 1;
      continue;
    }

    typeCounts.set(item.typeId, {
      count: 1,
      color: item.type.color,
    });
  }

  let dominantColor: string | null = null;
  let maxCount = 0;

  for (const { count, color } of typeCounts.values()) {
    if (count > maxCount) {
      maxCount = count;
      dominantColor = color;
    }
  }

  return dominantColor;
}

function getUniqueTypes(
  items: { type: CollectionItemType }[],
): CollectionItemType[] {
  const typesById = new Map<string, CollectionItemType>();

  for (const item of items) {
    typesById.set(item.type.id, item.type);
  }

  return [...typesById.values()];
}

export async function getRecentCollections(
  userId: string,
  limit = 6,
): Promise<DashboardCollection[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      _count: {
        select: { items: true },
      },
      items: {
        select: {
          typeId: true,
          type: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true,
            },
          },
        },
      },
    },
  });

  return collections.map((collection) => ({
    id: collection.id,
    name: collection.name,
    description: collection.description,
    isFavorite: collection.isFavorite,
    itemCount: collection._count.items,
    types: getUniqueTypes(collection.items),
    dominantTypeColor: getDominantTypeColor(collection.items),
  }));
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const [itemCount, collectionCount, favoriteItemCount, favoriteCollectionCount] =
    await Promise.all([
      prisma.item.count({ where: { userId } }),
      prisma.collection.count({ where: { userId } }),
      prisma.item.count({ where: { userId, isFavorite: true } }),
      prisma.collection.count({ where: { userId, isFavorite: true } }),
    ]);

  return {
    itemCount,
    collectionCount,
    favoriteItemCount,
    favoriteCollectionCount,
  };
}
