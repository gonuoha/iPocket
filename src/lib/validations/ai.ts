import { z } from "zod";

export const generateAutoTagsSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  content: z.string().trim().min(1, "Content is required").max(100_000),
  type: z.enum([
    "snippet",
    "prompt",
    "command",
    "note",
    "link",
    "file",
    "image",
  ]),
  existingTags: z
    .array(z.string().trim().min(1).max(40))
    .max(50)
    .default([]),
});

export const autoTagsResponseSchema = z.object({
  tags: z.array(z.string().trim().min(1).max(40)).min(3).max(5),
});

export const modelAutoTagsResponseSchema = z.object({
  tags: z.array(z.string().trim().min(1).max(40)).min(1).max(8),
});

export const AUTO_TAGS_JSON_SCHEMA = {
  type: "object",
  properties: {
    tags: {
      type: "array",
      items: { type: "string" },
      minItems: 3,
      maxItems: 8,
    },
  },
  required: ["tags"],
} as const;

const itemTypeEnum = z.enum([
  "snippet",
  "prompt",
  "command",
  "note",
  "link",
  "file",
  "image",
]);

export const generateSummarySchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  content: z.string().trim().min(1, "Content is required").max(100_000),
  type: itemTypeEnum,
});

export const summaryResponseSchema = z.object({
  summary: z.string().trim().min(1).max(300),
});

export const modelSummaryResponseSchema = z.object({
  summary: z.string().trim().min(1).max(500),
});

export const SUMMARY_JSON_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
  },
  required: ["summary"],
} as const;

export const explainCodeSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  content: z.string().trim().min(1, "Content is required").max(100_000),
  language: z.string().trim().max(50).optional(),
  type: z.enum(["snippet", "command"]),
});

export const explainCodeResponseSchema = z.object({
  explanation: z.string().trim().min(1).max(2_500),
});

export const modelExplainCodeResponseSchema = z.object({
  explanation: z.string().trim().min(1).max(4_000),
});

export const optimizePromptSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  content: z.string().trim().min(1, "Content is required").max(100_000),
});

export const optimizePromptResponseSchema = z.object({
  prompt: z.string().trim().min(1).max(100_000),
  improved: z.boolean(),
});

export const modelOptimizePromptResponseSchema = z.object({
  prompt: z.string().trim().min(1).max(100_000),
  improved: z.boolean(),
});

export const OPTIMIZE_PROMPT_JSON_SCHEMA = {
  type: "object",
  properties: {
    prompt: { type: "string" },
    improved: { type: "boolean" },
  },
  required: ["prompt", "improved"],
} as const;
