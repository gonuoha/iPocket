import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ItemDetail } from "@/lib/db/items";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/items", () => ({
  createItem: vi.fn(),
  getItemTypeBySlug: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
}));

import { auth } from "@/auth";
import {
  createItem as createItemInDb,
  getItemTypeBySlug,
} from "@/lib/db/items";

import { createItem } from "./items";

const mockAuth = vi.mocked(auth);
const mockGetItemTypeBySlug = vi.mocked(getItemTypeBySlug);
const mockCreateItemInDb = vi.mocked(createItemInDb);

const createdItem: ItemDetail = {
  id: "item-1",
  title: "Test",
  description: null,
  contentType: "text",
  content: null,
  url: null,
  language: null,
  fileUrl: null,
  fileName: null,
  fileSize: null,
  isFavorite: false,
  isPinned: false,
  type: {
    id: "type-snippet",
    name: "snippet",
    icon: "Code",
    color: "#3b82f6",
  },
  tags: [],
  collection: null,
  createdAt: new Date("2026-08-05T00:00:00.000Z"),
  updatedAt: new Date("2026-08-05T00:00:00.000Z"),
};

describe("createItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized when there is no session", async () => {
    mockAuth.mockResolvedValue(null);

    const result = await createItem({ type: "snippet", title: "Test" });

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockCreateItemInDb).not.toHaveBeenCalled();
  });

  it("returns a validation error for invalid input", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);

    const result = await createItem({ type: "snippet", title: "" });

    expect(result).toEqual({ success: false, error: "Title is required" });
    expect(mockCreateItemInDb).not.toHaveBeenCalled();
  });

  it("returns an error when the item type cannot be resolved", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockGetItemTypeBySlug.mockResolvedValue(null);

    const result = await createItem({ type: "snippet", title: "Test" });

    expect(result).toEqual({ success: false, error: "Invalid item type" });
    expect(mockCreateItemInDb).not.toHaveBeenCalled();
  });

  it("creates an item and returns the created record", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockGetItemTypeBySlug.mockResolvedValue({
      id: "type-snippet",
      name: "snippet",
      icon: "Code",
      color: "#3b82f6",
    });
    mockCreateItemInDb.mockResolvedValue(createdItem);

    const result = await createItem({
      type: "snippet",
      title: "Test",
      tags: ["js"],
    });

    expect(result).toEqual({ success: true, data: createdItem });
    expect(mockGetItemTypeBySlug).toHaveBeenCalledWith("user-1", "snippet");
    expect(mockCreateItemInDb).toHaveBeenCalledWith("user-1", {
      typeId: "type-snippet",
      title: "Test",
      description: null,
      content: null,
      url: null,
      language: null,
      tags: ["js"],
      contentType: "text",
    });
  });
});
