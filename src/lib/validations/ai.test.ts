import { describe, expect, it } from "vitest";

import {
  autoTagsResponseSchema,
  explainCodeResponseSchema,
  explainCodeSchema,
  generateAutoTagsSchema,
  generateSummarySchema,
  modelAutoTagsResponseSchema,
  modelExplainCodeResponseSchema,
  modelOptimizePromptResponseSchema,
  modelSummaryResponseSchema,
  optimizePromptResponseSchema,
  optimizePromptSchema,
  summaryResponseSchema,
} from "./ai";

describe("generateAutoTagsSchema", () => {
  it("accepts valid input", () => {
    const result = generateAutoTagsSchema.safeParse({
      title: "React hooks",
      content: "useEffect example",
      type: "snippet",
      existingTags: ["react"],
    });

    expect(result.success).toBe(true);
  });

  it("rejects empty title", () => {
    const result = generateAutoTagsSchema.safeParse({
      title: "   ",
      content: "content",
      type: "note",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Title is required");
  });

  it("rejects empty content", () => {
    const result = generateAutoTagsSchema.safeParse({
      title: "Title",
      content: "",
      type: "note",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Content is required");
  });
});

describe("autoTagsResponseSchema", () => {
  it("accepts 3 to 5 tags", () => {
    const result = autoTagsResponseSchema.safeParse({
      tags: ["react", "hooks", "frontend"],
    });

    expect(result.success).toBe(true);
  });

  it("rejects fewer than 3 tags", () => {
    const result = autoTagsResponseSchema.safeParse({
      tags: ["react", "hooks"],
    });

    expect(result.success).toBe(false);
  });
});

describe("modelAutoTagsResponseSchema", () => {
  it("accepts 1 to 8 tags from model output", () => {
    const result = modelAutoTagsResponseSchema.safeParse({
      tags: ["a", "b", "c", "d", "e", "f", "g", "h"],
    });

    expect(result.success).toBe(true);
  });
});

describe("generateSummarySchema", () => {
  it("accepts valid input", () => {
    const result = generateSummarySchema.safeParse({
      title: "React hooks",
      content: "useEffect example",
      type: "snippet",
    });

    expect(result.success).toBe(true);
  });

  it("rejects empty title", () => {
    const result = generateSummarySchema.safeParse({
      title: "   ",
      content: "content",
      type: "note",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Title is required");
  });

  it("rejects empty content", () => {
    const result = generateSummarySchema.safeParse({
      title: "Title",
      content: "",
      type: "note",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Content is required");
  });
});

describe("summaryResponseSchema", () => {
  it("accepts summaries up to 300 characters", () => {
    const result = summaryResponseSchema.safeParse({
      summary: "A".repeat(300),
    });

    expect(result.success).toBe(true);
  });

  it("rejects summaries longer than 300 characters", () => {
    const result = summaryResponseSchema.safeParse({
      summary: "A".repeat(301),
    });

    expect(result.success).toBe(false);
  });
});

describe("modelSummaryResponseSchema", () => {
  it("accepts longer summaries from model output", () => {
    const result = modelSummaryResponseSchema.safeParse({
      summary: "A".repeat(500),
    });

    expect(result.success).toBe(true);
  });
});

describe("explainCodeSchema", () => {
  it("accepts valid input", () => {
    const result = explainCodeSchema.safeParse({
      title: "Docker cleanup",
      content: "docker system prune -af",
      language: "bash",
      type: "command",
    });

    expect(result.success).toBe(true);
  });

  it("rejects unsupported item types", () => {
    const result = explainCodeSchema.safeParse({
      title: "Note",
      content: "content",
      type: "note",
    });

    expect(result.success).toBe(false);
  });
});

describe("explainCodeResponseSchema", () => {
  it("accepts explanations up to 2500 characters", () => {
    const result = explainCodeResponseSchema.safeParse({
      explanation: "A".repeat(2_500),
    });

    expect(result.success).toBe(true);
  });

  it("rejects explanations longer than 2500 characters", () => {
    const result = explainCodeResponseSchema.safeParse({
      explanation: "A".repeat(2_501),
    });

    expect(result.success).toBe(false);
  });
});

describe("modelExplainCodeResponseSchema", () => {
  it("accepts longer explanations from model output", () => {
    const result = modelExplainCodeResponseSchema.safeParse({
      explanation: "A".repeat(4_000),
    });

    expect(result.success).toBe(true);
  });
});

describe("optimizePromptSchema", () => {
  it("accepts valid input", () => {
    const result = optimizePromptSchema.safeParse({
      title: "Code review",
      content: "Review this pull request for bugs.",
    });

    expect(result.success).toBe(true);
  });

  it("rejects empty content", () => {
    const result = optimizePromptSchema.safeParse({
      title: "Code review",
      content: "",
    });

    expect(result.success).toBe(false);
  });
});

describe("optimizePromptResponseSchema", () => {
  it("accepts optimized prompts up to 100000 characters", () => {
    const result = optimizePromptResponseSchema.safeParse({
      prompt: "A".repeat(100_000),
      improved: true,
    });

    expect(result.success).toBe(true);
  });

  it("rejects prompts longer than 100000 characters", () => {
    const result = optimizePromptResponseSchema.safeParse({
      prompt: "A".repeat(100_001),
      improved: true,
    });

    expect(result.success).toBe(false);
  });
});

describe("modelOptimizePromptResponseSchema", () => {
  it("accepts model output with improved flag", () => {
    const result = modelOptimizePromptResponseSchema.safeParse({
      prompt: "Optimized prompt text",
      improved: false,
    });

    expect(result.success).toBe(true);
  });
});
