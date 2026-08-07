"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { updateEditorPreferences as updateEditorPreferencesInDb } from "@/lib/db/settings";
import type { EditorPreferences } from "@/lib/editor-preferences";
import { editorPreferencesSchema } from "@/lib/validations/editor-preferences";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function updateEditorPreferences(
  data: unknown,
): Promise<ActionResult<EditorPreferences>> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = editorPreferencesSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    const updated = await updateEditorPreferencesInDb(
      session.user.id,
      parsed.data,
    );

    revalidatePath("/settings");

    return { success: true, data: updated };
  } catch {
    return { success: false, error: "Failed to save editor preferences" };
  }
}
