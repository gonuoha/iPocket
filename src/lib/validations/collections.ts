import { z } from "zod";

function emptyToNull(value: unknown) {
  return typeof value === "string" && value.trim() === "" ? null : value;
}

const nullableTrimmedString = z.preprocess(
  emptyToNull,
  z.string().trim().nullable(),
);

export const createCollectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: nullableTrimmedString.optional(),
});
