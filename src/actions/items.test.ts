import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ItemDetail } from "@/lib/db/items";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/collections", () => ({
  validateUserCollectionIds: vi.fn(),
}));

vi.mock("@/lib/db/items", () => ({
  createItem: vi.fn(),
  getItemTypeBySlug: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
  toggleItemFavorite: vi.fn(),
}));

vi.mock("@/lib/db/user", () => ({
  getUserIsPro: vi.fn(),
}));

vi.mock("@/lib/r2/storage", () => ({
  deleteObject: vi.fn(),
}));

import { auth } from "@/auth";
import { validateUserCollectionIds } from "@/lib/db/collections";
import {
  createItem as createItemInDb,
  deleteItem as deleteItemInDb,
  getItemTypeBySlug,
  toggleItemFavorite as toggleItemFavoriteInDb,
} from "@/lib/db/items";
import { getUserIsPro } from "@/lib/db/user";
import { deleteObject } from "@/lib/r2/storage";

import { createItem, deleteItem, toggleItemFavorite } from "./items";

const mockAuth = vi.mocked(auth);
const mockValidateUserCollectionIds = vi.mocked(validateUserCollectionIds);
const mockGetItemTypeBySlug = vi.mocked(getItemTypeBySlug);
const mockCreateItemInDb = vi.mocked(createItemInDb);
const mockDeleteItemInDb = vi.mocked(deleteItemInDb);
const mockToggleItemFavoriteInDb = vi.mocked(toggleItemFavoriteInDb);
const mockGetUserIsPro = vi.mocked(getUserIsPro);
const mockDeleteObject = vi.mocked(deleteObject);

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
  collections: [],
  createdAt: new Date("2026-08-05T00:00:00.000Z"),
  updatedAt: new Date("2026-08-05T00:00:00.000Z"),
};

describe("createItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockValidateUserCollectionIds.mockResolvedValue(true);
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
      fileUrl: null,
      fileName: null,
      fileSize: null,
      tags: ["js"],
      collectionIds: [],
      contentType: "text",
    });
  });

  it("rejects invalid collection selections", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockGetItemTypeBySlug.mockResolvedValue({
      id: "type-snippet",
      name: "snippet",
      icon: "Code",
      color: "#3b82f6",
    });
    mockValidateUserCollectionIds.mockResolvedValue(false);

    const result = await createItem({
      type: "snippet",
      title: "Test",
      collectionIds: ["collection-1"],
    });

    expect(result).toEqual({
      success: false,
      error: "Invalid collection selection",
    });
    expect(mockCreateItemInDb).not.toHaveBeenCalled();
  });

  it("creates an item with collection assignments", async () => {
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
      collectionIds: ["collection-1", "collection-2"],
    });

    expect(result).toEqual({ success: true, data: createdItem });
    expect(mockValidateUserCollectionIds).toHaveBeenCalledWith("user-1", [
      "collection-1",
      "collection-2",
    ]);
    expect(mockCreateItemInDb).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        collectionIds: ["collection-1", "collection-2"],
      }),
    );
  });

  it("rejects file references that do not belong to the user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockGetItemTypeBySlug.mockResolvedValue({
      id: "type-image",
      name: "image",
      icon: "Image",
      color: "#ec4899",
    });

    const result = await createItem({
      type: "image",
      title: "Screenshot",
      fileUrl: "users/user-2/abc123/photo.png",
      fileName: "photo.png",
      fileSize: 1024,
    });

    expect(result).toEqual({
      success: false,
      error: "Invalid file reference",
    });
    expect(mockCreateItemInDb).not.toHaveBeenCalled();
  });

  it("rejects file item creation for non-Pro users", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockGetItemTypeBySlug.mockResolvedValue({
      id: "type-file",
      name: "file",
      icon: "File",
      color: "#64748b",
    });
    mockGetUserIsPro.mockResolvedValue(false);

    const result = await createItem({
      type: "file",
      title: "Notes",
      fileUrl: "users/user-1/abc123/notes.pdf",
      fileName: "notes.pdf",
      fileSize: 1024,
    });

    expect(result).toEqual({
      success: false,
      error: "File uploads require a Pro subscription",
    });
    expect(mockCreateItemInDb).not.toHaveBeenCalled();
  });

  it("creates a file item for Pro users", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockGetItemTypeBySlug.mockResolvedValue({
      id: "type-file",
      name: "file",
      icon: "File",
      color: "#64748b",
    });
    mockGetUserIsPro.mockResolvedValue(true);
    mockCreateItemInDb.mockResolvedValue(createdItem);

    const result = await createItem({
      type: "file",
      title: "Notes",
      fileUrl: "users/user-1/abc123/notes.pdf",
      fileName: "notes.pdf",
      fileSize: 1024,
    });

    expect(result).toEqual({ success: true, data: createdItem });
    expect(mockCreateItemInDb).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        fileUrl: "users/user-1/abc123/notes.pdf",
        fileName: "notes.pdf",
        fileSize: 1024,
        contentType: "file",
      }),
    );
  });
});

describe("deleteItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized when there is no session", async () => {
    mockAuth.mockResolvedValue(null);

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockDeleteItemInDb).not.toHaveBeenCalled();
  });

  it("returns an error when the item is not found", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDeleteItemInDb.mockResolvedValue(null);

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: false, error: "Item not found" });
    expect(mockDeleteObject).not.toHaveBeenCalled();
  });

  it("deletes an item without touching R2 when there is no file", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDeleteItemInDb.mockResolvedValue({
      typeName: "snippet",
      fileUrl: null,
    });

    const result = await deleteItem("item-1");

    expect(result.success).toBe(true);
    expect(mockDeleteObject).not.toHaveBeenCalled();
  });

  it("deletes the R2 object when the item had a file", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDeleteItemInDb.mockResolvedValue({
      typeName: "file",
      fileUrl: "users/user-1/abc123/notes.pdf",
    });

    const result = await deleteItem("item-1");

    expect(result.success).toBe(true);
    expect(mockDeleteObject).toHaveBeenCalledWith(
      "users/user-1/abc123/notes.pdf",
    );
  });

  it("still succeeds when deleting the R2 object fails", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDeleteItemInDb.mockResolvedValue({
      typeName: "file",
      fileUrl: "users/user-1/abc123/notes.pdf",
    });
    mockDeleteObject.mockRejectedValue(new Error("R2 unavailable"));

    const result = await deleteItem("item-1");

    expect(result.success).toBe(true);
  });
});

describe("toggleItemFavorite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized when there is no session", async () => {
    mockAuth.mockResolvedValue(null);

    const result = await toggleItemFavorite("item-1");

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockToggleItemFavoriteInDb).not.toHaveBeenCalled();
  });

  it("returns not found when the item does not exist", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockToggleItemFavoriteInDb.mockResolvedValue(null);

    const result = await toggleItemFavorite("item-1");

    expect(result).toEqual({ success: false, error: "Item not found" });
  });

  it("toggles favorite state and returns the updated record", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockToggleItemFavoriteInDb.mockResolvedValue({
      id: "item-1",
      isFavorite: true,
      typeName: "snippet",
    });

    const result = await toggleItemFavorite("item-1");

    expect(result).toEqual({
      success: true,
      data: { id: "item-1", isFavorite: true, typeName: "snippet" },
    });
    expect(mockToggleItemFavoriteInDb).toHaveBeenCalledWith(
      "user-1",
      "item-1",
    );
  });
});
