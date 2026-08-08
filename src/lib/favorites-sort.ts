import type { FavoriteCollection } from "@/lib/db/collections";
import type { DashboardItem } from "@/lib/db/items";
import { SYSTEM_ITEM_TYPE_ORDER } from "@/lib/item-type-styles";

export const FAVORITE_ITEM_SORT_OPTIONS = [
  "newest",
  "oldest",
  "name-asc",
  "name-desc",
  "type",
] as const;

export const FAVORITE_COLLECTION_SORT_OPTIONS = [
  "newest",
  "oldest",
  "name-asc",
  "name-desc",
] as const;

export type FavoriteItemSortField = (typeof FAVORITE_ITEM_SORT_OPTIONS)[number];
export type FavoriteCollectionSortField =
  (typeof FAVORITE_COLLECTION_SORT_OPTIONS)[number];

const DEFAULT_ITEM_SORT: FavoriteItemSortField = "newest";
const DEFAULT_COLLECTION_SORT: FavoriteCollectionSortField = "newest";

const LEGACY_ITEM_SORT_MAP: Record<string, FavoriteItemSortField> = {
  date: "newest",
  name: "name-asc",
};

const LEGACY_COLLECTION_SORT_MAP: Record<string, FavoriteCollectionSortField> = {
  date: "newest",
  name: "name-asc",
};

const typeOrderIndex = new Map<string, number>(
  SYSTEM_ITEM_TYPE_ORDER.map((name, index) => [name, index]),
);

export function parseFavoriteItemSortParam(
  value?: string | null,
): FavoriteItemSortField {
  if (!value) {
    return DEFAULT_ITEM_SORT;
  }

  const normalized = LEGACY_ITEM_SORT_MAP[value] ?? value;

  if (FAVORITE_ITEM_SORT_OPTIONS.includes(normalized as FavoriteItemSortField)) {
    return normalized as FavoriteItemSortField;
  }

  return DEFAULT_ITEM_SORT;
}

export function parseFavoriteCollectionSortParam(
  value?: string | null,
): FavoriteCollectionSortField {
  if (!value) {
    return DEFAULT_COLLECTION_SORT;
  }

  const normalized = LEGACY_COLLECTION_SORT_MAP[value] ?? value;

  if (
    FAVORITE_COLLECTION_SORT_OPTIONS.includes(
      normalized as FavoriteCollectionSortField,
    )
  ) {
    return normalized as FavoriteCollectionSortField;
  }

  return DEFAULT_COLLECTION_SORT;
}

function compareByName(left: string, right: string): number {
  return left.localeCompare(right, undefined, { sensitivity: "base" });
}

function compareByDateDescending(
  left: Date | string,
  right: Date | string,
): number {
  return new Date(right).getTime() - new Date(left).getTime();
}

function compareByDateAscending(
  left: Date | string,
  right: Date | string,
): number {
  return new Date(left).getTime() - new Date(right).getTime();
}

function getItemTypeOrderIndex(typeName: string): number {
  return typeOrderIndex.get(typeName.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
}

export function sortFavoriteItems(
  items: DashboardItem[],
  sort: FavoriteItemSortField,
): DashboardItem[] {
  const sorted = [...items];

  switch (sort) {
    case "oldest":
      return sorted.sort((left, right) =>
        compareByDateAscending(left.updatedAt, right.updatedAt),
      );
    case "name-asc":
      return sorted.sort((left, right) => compareByName(left.title, right.title));
    case "name-desc":
      return sorted.sort((left, right) => compareByName(right.title, left.title));
    case "type":
      return sorted.sort((left, right) => {
        const typeCompare =
          getItemTypeOrderIndex(left.type.name) -
          getItemTypeOrderIndex(right.type.name);

        return typeCompare !== 0
          ? typeCompare
          : compareByName(left.title, right.title);
      });
    case "newest":
    default:
      return sorted.sort((left, right) =>
        compareByDateDescending(left.updatedAt, right.updatedAt),
      );
  }
}

export function sortFavoriteCollections(
  collections: FavoriteCollection[],
  sort: FavoriteCollectionSortField,
): FavoriteCollection[] {
  const sorted = [...collections];

  switch (sort) {
    case "oldest":
      return sorted.sort((left, right) =>
        compareByDateAscending(left.updatedAt, right.updatedAt),
      );
    case "name-asc":
      return sorted.sort((left, right) => compareByName(left.name, right.name));
    case "name-desc":
      return sorted.sort((left, right) => compareByName(right.name, left.name));
    case "newest":
    default:
      return sorted.sort((left, right) =>
        compareByDateDescending(left.updatedAt, right.updatedAt),
      );
  }
}
