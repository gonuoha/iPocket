import { describe, expect, it } from "vitest";

import { createCollectionSchema } from "./collections";

describe("createCollectionSchema", () => {
  it("accepts a valid collection payload", () => {
    const result = createCollectionSchema.safeParse({
      name: "My Collection",
      description: "A useful collection",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an empty name", () => {
    const result = createCollectionSchema.safeParse({
      name: "   ",
      description: "A useful collection",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Name is required");
  });

  it("converts an empty description to null", () => {
    const result = createCollectionSchema.safeParse({
      name: "My Collection",
      description: "   ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeNull();
    }
  });
});
