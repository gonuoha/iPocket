export const FREE_ITEM_LIMIT = 50;
export const FREE_COLLECTION_LIMIT = 3;

export function isAtItemLimit(count: number, isPro: boolean): boolean {
  return !isPro && count >= FREE_ITEM_LIMIT;
}

export function isAtCollectionLimit(count: number, isPro: boolean): boolean {
  return !isPro && count >= FREE_COLLECTION_LIMIT;
}

export function itemLimitErrorMessage(): string {
  return `Free plan is limited to ${FREE_ITEM_LIMIT} items. Upgrade to Pro for unlimited items.`;
}

export function collectionLimitErrorMessage(): string {
  return `Free plan is limited to ${FREE_COLLECTION_LIMIT} collections. Upgrade to Pro for unlimited collections.`;
}
