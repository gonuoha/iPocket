import type { ZodType } from "zod";

import type { ActionResult } from "@/types/actions";

type ParseSuccess<T> = { success: true; data: T };
type ParseFailure = ActionResult<never>;

export function parseActionInput<T>(
  schema: ZodType<T>,
  data: unknown,
): ParseSuccess<T> | ParseFailure {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  return { success: true, data: parsed.data };
}
