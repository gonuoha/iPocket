export const FREE_ITEM_LIMIT = 50;
export const FREE_COLLECTION_LIMIT = 3;

export function isAtItemLimit(count: number, isPro: boolean): boolean {
  return !isPro && count >= FREE_ITEM_LIMIT;
}

export function isAtCollectionLimit(count: number, isPro: boolean): boolean {
  return !isPro && count >= FREE_COLLECTION_LIMIT;
}
