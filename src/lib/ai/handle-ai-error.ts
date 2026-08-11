import type { ActionResult } from "@/types/actions";

export function handleAiActionError(
  actionName: string,
  error: unknown,
): ActionResult<never> {
  console.error(`${actionName} failed:`, error);
  return { success: false, error: "AI is temporarily unavailable" };
}
