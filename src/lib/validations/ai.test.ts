import { describe, expect, it } from "vitest";

import {
  autoTagsResponseSchema,
  generateAutoTagsSchema,
  modelAutoTagsResponseSchema,
} from "./ai";

describe("generateAutoTagsSchema", () => {
  it("accepts valid input", () => {
    const result = generateAutoTagsSchema.safeParse({
      title: "React hooks",
      content: "useEffect example",
      type: "snippet",
      existingTags: ["react"],
    });

    expect(result.success).toBe(true);
  });

  it("rejects empty title", () => {
    const result = generateAutoTagsSchema.safeParse({
      title: "   ",
      content: "content",
      type: "note",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Title is required");
  });

  it("rejects empty content", () => {
    const result = generateAutoTagsSchema.safeParse({
      title: "Title",
      content: "",
      type: "note",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Content is required");
  });
});

describe("autoTagsResponseSchema", () => {
  it("accepts 3 to 5 tags", () => {
    const result = autoTagsResponseSchema.safeParse({
      tags: ["react", "hooks", "frontend"],
    });

    expect(result.success).toBe(true);
  });

  it("rejects fewer than 3 tags", () => {
    const result = autoTagsResponseSchema.safeParse({
      tags: ["react", "hooks"],
    });

    expect(result.success).toBe(false);
  });
});

describe("modelAutoTagsResponseSchema", () => {
  it("accepts 1 to 8 tags from model output", () => {
    const result = modelAutoTagsResponseSchema.safeParse({
      tags: ["a", "b", "c", "d", "e", "f", "g", "h"],
    });

    expect(result.success).toBe(true);
  });
});
