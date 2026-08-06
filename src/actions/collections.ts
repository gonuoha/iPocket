"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import {
  createCollection as createCollectionInDb,
  type CreatedCollection,
} from "@/lib/db/collections";
import { createCollectionSchema } from "@/lib/validations/collections";

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

    revalidatePath("/dashboard");
    revalidatePath("/profile");

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
