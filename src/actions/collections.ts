"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import {
  createCollection as createCollectionInDb,
  deleteCollection as deleteCollectionInDb,
  toggleCollectionFavorite as toggleCollectionFavoriteInDb,
  updateCollection as updateCollectionInDb,
  type CreatedCollection,
  type DeletedCollection,
  type ToggleCollectionFavoriteResult,
} from "@/lib/db/collections";
import {
  createCollectionSchema,
  updateCollectionSchema,
} from "@/lib/validations/collections";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function createCollection(
  data: unknown,
): Promise<ActionResult<CreatedCollection>> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = createCollectionSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    const created = await createCollectionInDb(session.user.id, {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
    });

    revalidateCollectionPaths();

    return { success: true, data: created };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        success: false,
        error: "A collection with this name already exists",
      };
    }

    throw error;
  }
}

function revalidateCollectionPaths(collectionId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath("/favorites");
  revalidatePath("/collections");

  if (collectionId) {
    revalidatePath(`/collections/${collectionId}`);
  }
}

export async function updateCollection(
  collectionId: string,
  data: unknown,
): Promise<ActionResult<CreatedCollection>> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = updateCollectionSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    const updated = await updateCollectionInDb(session.user.id, collectionId, {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
    });

    if (!updated) {
      return { success: false, error: "Collection not found" };
    }

    revalidateCollectionPaths(collectionId);

    return { success: true, data: updated };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        success: false,
        error: "A collection with this name already exists",
      };
    }

    throw error;
  }
}

export async function deleteCollection(
  collectionId: string,
): Promise<ActionResult<DeletedCollection>> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const deleted = await deleteCollectionInDb(session.user.id, collectionId);

  if (!deleted) {
    return { success: false, error: "Collection not found" };
  }

  revalidateCollectionPaths(collectionId);

  return { success: true, data: deleted };
}

export async function toggleCollectionFavorite(
  collectionId: string,
): Promise<ActionResult<ToggleCollectionFavoriteResult>> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const result = await toggleCollectionFavoriteInDb(
    session.user.id,
    collectionId,
  );

  if (!result) {
    return { success: false, error: "Collection not found" };
  }

  revalidateCollectionPaths(collectionId);

  return { success: true, data: result };
}
