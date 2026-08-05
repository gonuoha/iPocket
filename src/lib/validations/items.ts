import { z } from "zod";

function emptyToNull(value: unknown) {
  return typeof value === "string" && value.trim() === "" ? null : value;
}

const nullableTrimmedString = z.preprocess(
  emptyToNull,
  z.string().trim().nullable(),
);

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

export type UpdateItemInput = z.infer<typeof updateItemSchema>;
