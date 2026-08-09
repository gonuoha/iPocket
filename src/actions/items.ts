"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import {
  createItem as createItemInDb,
  deleteItem as deleteItemInDb,
  getItemTypeBySlug,
  getUserItemStats,
  toggleItemFavorite as toggleItemFavoriteInDb,
  toggleItemPin as toggleItemPinInDb,
  updateItem as updateItemInDb,
} from "@/lib/db/items";
import type {
  DeleteItemResult,
  ItemDetail,
  ToggleItemFavoriteResult,
  ToggleItemPinResult,
} from "@/lib/db/items";
import { validateUserCollectionIds } from "@/lib/db/collections";
import { getUserIsPro } from "@/lib/db/user";
import { isOwnedFileUrl } from "@/lib/file-upload";
import { deleteObject } from "@/lib/r2/storage";
import { FREE_ITEM_LIMIT } from "@/lib/subscription-limits";
import { createItemSchema, updateItemSchema } from "@/lib/validations/items";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function isFileItemType(typeName: string) {
  return typeName === "file" || typeName === "image";
}

export async function createItem(
  data: unknown,
): Promise<ActionResult<ItemDetail>> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = createItemSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const itemType = await getItemTypeBySlug(session.user.id, parsed.data.type);

  if (!itemType) {
    return { success: false, error: "Invalid item type" };
  }

  const isPro = await getUserIsPro(session.user.id);

  if (!isPro) {
    const stats = await getUserItemStats(session.user.id);

    if (stats.itemCount >= FREE_ITEM_LIMIT) {
      return {
        success: false,
        error: `Free plan is limited to ${FREE_ITEM_LIMIT} items. Upgrade to Pro for unlimited items.`,
      };
    }
  }

  if (parsed.data.type === "file") {
    if (!isPro) {
      return {
        success: false,
        error: "File uploads require a Pro subscription",
      };
    }
  }

  const usesFileContent = isFileItemType(parsed.data.type);

  if (
    usesFileContent &&
    parsed.data.fileUrl &&
    !isOwnedFileUrl(parsed.data.fileUrl, session.user.id)
  ) {
    return { success: false, error: "Invalid file reference" };
  }

  const hasValidCollections = await validateUserCollectionIds(
    session.user.id,
    parsed.data.collectionIds,
  );

  if (!hasValidCollections) {
    return { success: false, error: "Invalid collection selection" };
  }

  const created = await createItemInDb(session.user.id, {
    typeId: itemType.id,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    content: parsed.data.content ?? null,
    url: parsed.data.url ?? null,
    language: parsed.data.language ?? null,
    fileUrl: usesFileContent ? (parsed.data.fileUrl ?? null) : null,
    fileName: usesFileContent ? (parsed.data.fileName ?? null) : null,
    fileSize: usesFileContent ? (parsed.data.fileSize ?? null) : null,
    tags: parsed.data.tags,
    collectionIds: parsed.data.collectionIds,
    contentType: usesFileContent ? "file" : "text",
  });

  revalidatePath(`/items/${parsed.data.type}`);
  revalidatePath("/dashboard");

  return { success: true, data: created };
}

export async function updateItem(
  itemId: string,
  data: unknown,
): Promise<ActionResult<ItemDetail>> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = updateItemSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const hasValidCollections = await validateUserCollectionIds(
    session.user.id,
    parsed.data.collectionIds,
  );

  if (!hasValidCollections) {
    return { success: false, error: "Invalid collection selection" };
  }

  const updated = await updateItemInDb(session.user.id, itemId, {
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    content: parsed.data.content ?? null,
    url: parsed.data.url ?? null,
    language: parsed.data.language ?? null,
    tags: parsed.data.tags,
    collectionIds: parsed.data.collectionIds,
  });

  if (!updated) {
    return { success: false, error: "Item not found" };
  }

  revalidatePath(`/items/${updated.type.name.toLowerCase()}`);
  revalidatePath("/dashboard");

  return { success: true, data: updated };
}

export async function deleteItem(
  itemId: string,
): Promise<ActionResult<DeleteItemResult>> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const deleted = await deleteItemInDb(session.user.id, itemId);

  if (!deleted) {
    return { success: false, error: "Item not found" };
  }

  if (deleted.fileUrl) {
    try {
      await deleteObject(deleted.fileUrl);
    } catch {
      // Item is already removed from the database.
    }
  }

  revalidatePath(`/items/${deleted.typeName.toLowerCase()}`);
  revalidatePath("/dashboard");

  return { success: true, data: deleted };
}

function revalidateItemFavoritePaths(typeName: string) {
  revalidatePath(`/items/${typeName.toLowerCase()}`);
  revalidatePath("/dashboard");
  revalidatePath("/favorites");
  revalidatePath("/profile");
  revalidatePath("/collections", "layout");
}

export async function toggleItemFavorite(
  itemId: string,
): Promise<ActionResult<ToggleItemFavoriteResult>> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const result = await toggleItemFavoriteInDb(session.user.id, itemId);

  if (!result) {
    return { success: false, error: "Item not found" };
  }

  revalidateItemFavoritePaths(result.typeName);

  return { success: true, data: result };
}

function revalidateItemPinPaths(typeName: string) {
  revalidatePath(`/items/${typeName.toLowerCase()}`);
  revalidatePath("/dashboard");
  revalidatePath("/collections", "layout");
}

export async function toggleItemPin(
  itemId: string,
): Promise<ActionResult<ToggleItemPinResult>> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const result = await toggleItemPinInDb(session.user.id, itemId);

  if (!result) {
    return { success: false, error: "Item not found" };
  }

  revalidateItemPinPaths(result.typeName);

  return { success: true, data: result };
}
