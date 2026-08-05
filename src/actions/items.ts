"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import {
  deleteItem as deleteItemInDb,
  updateItem as updateItemInDb,
} from "@/lib/db/items";
import type { DeleteItemResult, ItemDetail } from "@/lib/db/items";
import { updateItemSchema } from "@/lib/validations/items";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

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

  const updated = await updateItemInDb(session.user.id, itemId, {
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    content: parsed.data.content ?? null,
    url: parsed.data.url ?? null,
    language: parsed.data.language ?? null,
    tags: parsed.data.tags,
  });

  if (!updated) {
    return { success: false, error: "Item not found" };
  }

  revalidatePath(`/items/${updated.type.name.toLowerCase()}`);

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

  revalidatePath(`/items/${deleted.typeName.toLowerCase()}`);
  revalidatePath("/dashboard");

  return { success: true, data: deleted };
}
