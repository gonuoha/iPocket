import { z } from "zod";

import {
  EDITOR_FONT_SIZES,
  EDITOR_TAB_SIZES,
  EDITOR_THEMES,
} from "@/lib/editor-preferences";

export const editorPreferencesSchema = z.object({
  fontSize: z.union([
    z.literal(EDITOR_FONT_SIZES[0]),
    z.literal(EDITOR_FONT_SIZES[1]),
    z.literal(EDITOR_FONT_SIZES[2]),
    z.literal(EDITOR_FONT_SIZES[3]),
    z.literal(EDITOR_FONT_SIZES[4]),
  ]),
  tabSize: z.union([
    z.literal(EDITOR_TAB_SIZES[0]),
    z.literal(EDITOR_TAB_SIZES[1]),
    z.literal(EDITOR_TAB_SIZES[2]),
  ]),
  wordWrap: z.boolean(),
  minimap: z.boolean(),
  theme: z.enum(EDITOR_THEMES),
});
