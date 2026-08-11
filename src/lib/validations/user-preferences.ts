import { z } from "zod";

export const userPreferencesSchema = z.object({
  showOverview: z.boolean(),
});
