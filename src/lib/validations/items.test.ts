import { describe, expect, it } from "vitest";

import { createItemSchema } from "./items";

describe("createItemSchema", () => {
  it("accepts a valid snippet payload", () => {
    const result = createItemSchema.safeParse({
      type: "snippet",
      title: "My snippet",
      content: "console.log('hi')",
      language: "javascript",
      tags: ["js"],
    });

    expect(result.success).toBe(true);
  });

  it("rejects an empty title", () => {
    const result = createItemSchema.safeParse({
      type: "snippet",
      title: "   ",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Title is required");
  });

  it("requires a file upload for image items", () => {
    const result = createItemSchema.safeParse({
      type: "image",
      title: "Screenshot",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("File upload is required");
  });

  it("accepts an image item with upload metadata", () => {
    const result = createItemSchema.safeParse({
      type: "image",
      title: "Screenshot",
      fileUrl: "users/user-1/key/photo.png",
      fileName: "photo.png",
      fileSize: 1024,
    });

    expect(result.success).toBe(true);
  });

  it("accepts a file item with upload metadata", () => {
    const result = createItemSchema.safeParse({
      type: "file",
      title: "Notes",
      fileUrl: "users/user-1/key/notes.pdf",
      fileName: "notes.pdf",
      fileSize: 2048,
    });

    expect(result.success).toBe(true);
  });

  it("requires a URL for link items", () => {
    const result = createItemSchema.safeParse({
      type: "link",
      title: "My link",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("URL is required");
  });

  it("accepts a link item with a valid URL", () => {
    const result = createItemSchema.safeParse({
      type: "link",
      title: "My link",
      url: "https://example.com",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid URL", () => {
    const result = createItemSchema.safeParse({
      type: "link",
      title: "My link",
      url: "not-a-url",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Enter a valid URL");
  });

  it("converts blank optional strings to null", () => {
    const result = createItemSchema.safeParse({
      type: "note",
      title: "Note",
      description: "  ",
      content: "",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.description).toBeNull();
      expect(result.data.content).toBeNull();
    }
  });

  it("defaults tags to an empty array", () => {
    const result = createItemSchema.safeParse({
      type: "prompt",
      title: "Prompt",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.tags).toEqual([]);
    }
  });
});
