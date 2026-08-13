import { z } from "zod";

import { APPEARANCES, TYPE_COLOR_POSITIONS } from "@/lib/user-preferences";

export const userPreferencesSchema = z.object({
  showOverview: z.boolean(),
  typeColorPosition: z.enum(TYPE_COLOR_POSITIONS),
  appearance: z.enum(APPEARANCES),
});
