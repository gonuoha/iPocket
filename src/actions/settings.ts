"use server";

import { revalidatePath } from "next/cache";

import { parseActionInput } from "@/lib/actions/parse-action-input";
import { requireSession } from "@/lib/actions/require-session";
import { updateEditorPreferences as updateEditorPreferencesInDb } from "@/lib/db/settings";
import type { EditorPreferences } from "@/lib/editor-preferences";
import type { ActionResult } from "@/types/actions";
import { editorPreferencesSchema } from "@/lib/validations/editor-preferences";

export async function updateEditorPreferences(
  data: unknown,
): Promise<ActionResult<EditorPreferences>> {
  const sessionResult = await requireSession();
  if (!sessionResult.success) {
    return sessionResult;
  }
  const { userId } = sessionResult;

  const parsed = parseActionInput(editorPreferencesSchema, data);
  if (!parsed.success) {
    return parsed;
  }

  try {
    const updated = await updateEditorPreferencesInDb(userId, parsed.data);

    revalidatePath("/settings");

    return { success: true, data: updated };
  } catch {
    return { success: false, error: "Failed to save editor preferences" };
  }
}
