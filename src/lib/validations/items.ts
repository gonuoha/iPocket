import { z } from "zod";

function emptyToNull(value: unknown) {
  return typeof value === "string" && value.trim() === "" ? null : value;
}

const nullableTrimmedString = z.preprocess(
  emptyToNull,
  z.string().trim().nullable(),
);

export const creatableItemTypeSchema = z.enum([
  "snippet",
  "prompt",
  "command",
  "note",
  "link",
  "file",
  "image",
]);

export const updateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: nullableTrimmedString.optional(),
  content: nullableTrimmedString.optional(),
  language: nullableTrimmedString.optional(),
  url: z.preprocess(
    emptyToNull,
    z.string().trim().url("Enter a valid URL").nullable(),
  ).optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
});

export const createItemSchema = z
  .object({
    type: creatableItemTypeSchema,
    title: z.string().trim().min(1, "Title is required"),
    description: nullableTrimmedString.optional(),
    content: nullableTrimmedString.optional(),
    language: nullableTrimmedString.optional(),
    url: z.preprocess(
      emptyToNull,
      z.string().trim().url("Enter a valid URL").nullable(),
    ).optional(),
    fileUrl: z.string().trim().min(1).optional(),
    fileName: z.string().trim().min(1).optional(),
    fileSize: z.number().int().positive().optional(),
    tags: z.array(z.string().trim().min(1)).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.type === "link" && !data.url) {
      ctx.addIssue({
        code: "custom",
        message: "URL is required",
        path: ["url"],
      });
    }

    if (
      (data.type === "file" || data.type === "image") &&
      (!data.fileUrl || !data.fileName || !data.fileSize)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "File upload is required",
        path: ["fileUrl"],
      });
    }
  });

export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type CreateItemInput = z.infer<typeof createItemSchema>;
export type CreatableItemType = z.infer<typeof creatableItemTypeSchema>;

export function parseCreatableItemTypeFromPathname(
  pathname: string,
): CreatableItemType | undefined {
  const match = pathname.match(/^\/items\/([^/]+)$/);
  if (!match) {
    return undefined;
  }

  const parsed = creatableItemTypeSchema.safeParse(match[1]);
  return parsed.success ? parsed.data : undefined;
}

export function resolveDefaultCreateType(
  defaultType: CreatableItemType | undefined,
  isPro: boolean,
): CreatableItemType {
  if (!defaultType) {
    return "snippet";
  }

  if ((defaultType === "file" || defaultType === "image") && !isPro) {
    return "snippet";
  }

  return defaultType;
}
