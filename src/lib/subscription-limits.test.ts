import { describe, expect, it } from "vitest";

import {
  FREE_COLLECTION_LIMIT,
  FREE_ITEM_LIMIT,
  isAtCollectionLimit,
  isAtItemLimit,
} from "./subscription-limits";

describe("subscription-limits", () => {
  it("exports free tier constants", () => {
    expect(FREE_ITEM_LIMIT).toBe(50);
    expect(FREE_COLLECTION_LIMIT).toBe(3);
  });

  describe("isAtItemLimit", () => {
    it("returns false below the item limit for free users", () => {
      expect(isAtItemLimit(49, false)).toBe(false);
    });

    it("returns true at the item limit for free users", () => {
      expect(isAtItemLimit(50, false)).toBe(true);
    });

    it("returns true above the item limit for free users", () => {
      expect(isAtItemLimit(51, false)).toBe(true);
    });

    it("returns false for pro users regardless of count", () => {
      expect(isAtItemLimit(50, true)).toBe(false);
    });
  });

  describe("isAtCollectionLimit", () => {
    it("returns false below the collection limit for free users", () => {
      expect(isAtCollectionLimit(2, false)).toBe(false);
    });

    it("returns true at the collection limit for free users", () => {
      expect(isAtCollectionLimit(3, false)).toBe(true);
    });

    it("returns true above the collection limit for free users", () => {
      expect(isAtCollectionLimit(4, false)).toBe(true);
    });

    it("returns false for pro users regardless of count", () => {
      expect(isAtCollectionLimit(3, true)).toBe(false);
    });
  });
});
