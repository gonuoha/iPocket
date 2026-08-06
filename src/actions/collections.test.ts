import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CreatedCollection } from "@/lib/db/collections";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/collections", () => ({
  createCollection: vi.fn(),
}));

import { auth } from "@/auth";
import { createCollection as createCollectionInDb } from "@/lib/db/collections";

import { createCollection } from "./collections";

const mockAuth = vi.mocked(auth);
const mockCreateCollectionInDb = vi.mocked(createCollectionInDb);

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
