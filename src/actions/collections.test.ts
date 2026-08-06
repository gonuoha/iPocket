import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CreatedCollection } from "@/lib/db/collections";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/collections", () => ({
  createCollection: vi.fn(),
  updateCollection: vi.fn(),
  deleteCollection: vi.fn(),
}));

import { auth } from "@/auth";
import {
  createCollection as createCollectionInDb,
  deleteCollection as deleteCollectionInDb,
  updateCollection as updateCollectionInDb,
} from "@/lib/db/collections";

import {
  createCollection,
  deleteCollection,
  updateCollection,
} from "./collections";

const mockAuth = vi.mocked(auth);
const mockCreateCollectionInDb = vi.mocked(createCollectionInDb);
const mockUpdateCollectionInDb = vi.mocked(updateCollectionInDb);
const mockDeleteCollectionInDb = vi.mocked(deleteCollectionInDb);

const createdCollection: CreatedCollection = {
  id: "collection-1",
  name: "My Collection",
  description: "A useful collection",
  isFavorite: false,
};

describe("createCollection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized when there is no session", async () => {
    mockAuth.mockResolvedValue(null);

    const result = await createCollection({
      name: "My Collection",
      description: "A useful collection",
    });

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockCreateCollectionInDb).not.toHaveBeenCalled();
  });

  it("returns a validation error for invalid input", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);

    const result = await createCollection({
      name: "",
      description: "A useful collection",
    });

    expect(result).toEqual({ success: false, error: "Name is required" });
    expect(mockCreateCollectionInDb).not.toHaveBeenCalled();
  });

  it("creates a collection and returns the created record", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockCreateCollectionInDb.mockResolvedValue(createdCollection);

    const result = await createCollection({
      name: "My Collection",
      description: "A useful collection",
    });

    expect(result).toEqual({ success: true, data: createdCollection });
    expect(mockCreateCollectionInDb).toHaveBeenCalledWith("user-1", {
      name: "My Collection",
      description: "A useful collection",
    });
  });

  it("returns an error when the collection name already exists", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockCreateCollectionInDb.mockRejectedValue(
      Object.assign(new Error("Unique constraint failed"), { code: "P2002" }),
    );

    const result = await createCollection({
      name: "My Collection",
      description: "A useful collection",
    });

    expect(result).toEqual({
      success: false,
      error: "A collection with this name already exists",
    });
  });
});

describe("updateCollection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized when there is no session", async () => {
    mockAuth.mockResolvedValue(null);

    const result = await updateCollection("collection-1", {
      name: "Updated Collection",
      description: "Updated description",
    });

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockUpdateCollectionInDb).not.toHaveBeenCalled();
  });

  it("returns a validation error for invalid input", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);

    const result = await updateCollection("collection-1", {
      name: "",
      description: "Updated description",
    });

    expect(result).toEqual({ success: false, error: "Name is required" });
    expect(mockUpdateCollectionInDb).not.toHaveBeenCalled();
  });

  it("updates a collection and returns the updated record", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockUpdateCollectionInDb.mockResolvedValue({
      ...createdCollection,
      name: "Updated Collection",
    });

    const result = await updateCollection("collection-1", {
      name: "Updated Collection",
      description: "Updated description",
    });

    expect(result).toEqual({
      success: true,
      data: { ...createdCollection, name: "Updated Collection" },
    });
    expect(mockUpdateCollectionInDb).toHaveBeenCalledWith(
      "user-1",
      "collection-1",
      {
        name: "Updated Collection",
        description: "Updated description",
      },
    );
  });

  it("returns not found when the collection does not exist", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockUpdateCollectionInDb.mockResolvedValue(null);

    const result = await updateCollection("collection-1", {
      name: "Updated Collection",
      description: "Updated description",
    });

    expect(result).toEqual({ success: false, error: "Collection not found" });
  });

  it("returns an error when the collection name already exists", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockUpdateCollectionInDb.mockRejectedValue(
      Object.assign(new Error("Unique constraint failed"), { code: "P2002" }),
    );

    const result = await updateCollection("collection-1", {
      name: "Updated Collection",
      description: "Updated description",
    });

    expect(result).toEqual({
      success: false,
      error: "A collection with this name already exists",
    });
  });
});

describe("deleteCollection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized when there is no session", async () => {
    mockAuth.mockResolvedValue(null);

    const result = await deleteCollection("collection-1");

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockDeleteCollectionInDb).not.toHaveBeenCalled();
  });

  it("deletes a collection and returns the deleted record", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDeleteCollectionInDb.mockResolvedValue({
      id: "collection-1",
      name: "My Collection",
    });

    const result = await deleteCollection("collection-1");

    expect(result).toEqual({
      success: true,
      data: { id: "collection-1", name: "My Collection" },
    });
    expect(mockDeleteCollectionInDb).toHaveBeenCalledWith(
      "user-1",
      "collection-1",
    );
  });

  it("returns not found when the collection does not exist", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDeleteCollectionInDb.mockResolvedValue(null);

    const result = await deleteCollection("collection-1");

    expect(result).toEqual({ success: false, error: "Collection not found" });
  });
});
