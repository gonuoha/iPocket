"use server";

import { ThinkingLevel } from "@google/genai";

import { auth } from "@/auth";
import { getGeminiClient, AI_MODEL } from "@/lib/ai/gemini";
import {
  buildAutoTagPrompt,
  buildExplainPrompt,
  buildSummaryPrompt,
} from "@/lib/ai/prompts";
import { truncateForAi } from "@/lib/ai/truncate-content";
import { getUserIsPro } from "@/lib/db/user";
import { checkAiRateLimit } from "@/lib/rate-limit";
import {
  AUTO_TAGS_JSON_SCHEMA,
  explainCodeResponseSchema,
  explainCodeSchema,
  generateAutoTagsSchema,
  generateSummarySchema,
  modelAutoTagsResponseSchema,
  modelExplainCodeResponseSchema,
  modelSummaryResponseSchema,
  SUMMARY_JSON_SCHEMA,
  summaryResponseSchema,
} from "@/lib/validations/ai";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function normalizeSuggestedTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const tag of tags) {
    const trimmed = tag.trim().toLowerCase();

    if (!trimmed || seen.has(trimmed)) {
      continue;
    }

    seen.add(trimmed);
    normalized.push(trimmed);
  }

  return normalized.slice(0, 5);
}

function filterExistingTags(tags: string[], existingTags: string[]): string[] {
  const existing = new Set(existingTags.map((tag) => tag.trim().toLowerCase()));

  return tags.filter((tag) => !existing.has(tag));
}

function normalizeSummary(summary: string): string {
  const trimmed = summary.trim();

  if (trimmed.length <= 300) {
    return trimmed;
  }

  return `${trimmed.slice(0, 297).trimEnd()}…`;
}

function normalizeExplanation(explanation: string): string {
  const trimmed = explanation.trim();

  if (trimmed.length <= 2_500) {
    return trimmed;
  }

  return `${trimmed.slice(0, 2_497).trimEnd()}…`;
}

export async function generateSummary(
  data: unknown,
): Promise<ActionResult<{ summary: string }>> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = generateSummarySchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const isPro = await getUserIsPro(session.user.id);

  if (!isPro) {
    return {
      success: false,
      error: "AI features require a Pro subscription",
    };
  }

  const rateLimit = await checkAiRateLimit(session.user.id);

  if (!rateLimit.success) {
    return {
      success: false,
      error: "You've reached your AI limit. Try again later.",
    };
  }

  const truncatedContent = truncateForAi(parsed.data.content);
  const { systemInstruction, userContent } = buildSummaryPrompt({
    title: parsed.data.title,
    type: parsed.data.type,
    content: truncatedContent,
  });

  try {
    const client = getGeminiClient();
    const response = await client.models.generateContent({
      model: AI_MODEL,
      contents: userContent,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseJsonSchema: SUMMARY_JSON_SCHEMA,
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        maxOutputTokens: 150,
      },
    });

    const rawText = response.text;

    if (!rawText) {
      throw new Error("Empty response from Gemini");
    }

    const modelParsed = modelSummaryResponseSchema.safeParse(
      JSON.parse(rawText),
    );

    if (!modelParsed.success) {
      throw new Error("Invalid JSON from Gemini");
    }

    const normalized = normalizeSummary(modelParsed.data.summary);
    const validated = summaryResponseSchema.safeParse({ summary: normalized });

    if (!validated.success) {
      throw new Error("Invalid summary from Gemini");
    }

    return { success: true, data: { summary: validated.data.summary } };
  } catch (error) {
    console.error("generateSummary failed:", error);
    return { success: false, error: "AI is temporarily unavailable" };
  }
}

export async function generateAutoTags(
  data: unknown,
): Promise<ActionResult<{ tags: string[] }>> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = generateAutoTagsSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const isPro = await getUserIsPro(session.user.id);

  if (!isPro) {
    return {
      success: false,
      error: "AI features require a Pro subscription",
    };
  }

  const rateLimit = await checkAiRateLimit(session.user.id);

  if (!rateLimit.success) {
    return {
      success: false,
      error: "You've reached your AI limit. Try again later.",
    };
  }

  const truncatedContent = truncateForAi(parsed.data.content);
  const { systemInstruction, userContent } = buildAutoTagPrompt({
    title: parsed.data.title,
    type: parsed.data.type,
    content: truncatedContent,
    existingTags: parsed.data.existingTags,
  });

  try {
    const client = getGeminiClient();
    const response = await client.models.generateContent({
      model: AI_MODEL,
      contents: userContent,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseJsonSchema: AUTO_TAGS_JSON_SCHEMA,
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
      },
    });

    const rawText = response.text;

    if (!rawText) {
      throw new Error("Empty response from Gemini");
    }

    const modelParsed = modelAutoTagsResponseSchema.safeParse(
      JSON.parse(rawText),
    );

    if (!modelParsed.success) {
      throw new Error("Invalid JSON from Gemini");
    }

    const filtered = filterExistingTags(
      normalizeSuggestedTags(modelParsed.data.tags),
      parsed.data.existingTags,
    );

    if (filtered.length === 0) {
      return {
        success: false,
        error: "No new tags could be suggested. Try adding more content.",
      };
    }

    return { success: true, data: { tags: filtered } };
  } catch (error) {
    console.error("generateAutoTags failed:", error);
    return { success: false, error: "AI is temporarily unavailable" };
  }
}

export async function explainCode(
  data: unknown,
): Promise<ActionResult<{ explanation: string }>> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = explainCodeSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const isPro = await getUserIsPro(session.user.id);

  if (!isPro) {
    return {
      success: false,
      error: "AI features require a Pro subscription",
    };
  }

  const rateLimit = await checkAiRateLimit(session.user.id);

  if (!rateLimit.success) {
    return {
      success: false,
      error: "You've reached your AI limit. Try again later.",
    };
  }

  const truncatedContent = truncateForAi(parsed.data.content, 16_000);
  const { systemInstruction, userContent } = buildExplainPrompt({
    title: parsed.data.title,
    type: parsed.data.type,
    content: truncatedContent,
    language: parsed.data.language,
  });

  try {
    const client = getGeminiClient();
    const response = await client.models.generateContent({
      model: AI_MODEL,
      contents: userContent,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        maxOutputTokens: 2_048,
      },
    });

    const rawText = response.text?.trim();

    if (!rawText) {
      throw new Error("Empty response from Gemini");
    }

    const modelParsed = modelExplainCodeResponseSchema.safeParse({
      explanation: rawText,
    });

    if (!modelParsed.success) {
      throw new Error("Invalid explanation from Gemini");
    }

    const normalized = normalizeExplanation(modelParsed.data.explanation);
    const validated = explainCodeResponseSchema.safeParse({
      explanation: normalized,
    });

    if (!validated.success) {
      throw new Error("Invalid explanation from Gemini");
    }

    return {
      success: true,
      data: { explanation: validated.data.explanation },
    };
  } catch (error) {
    console.error("explainCode failed:", error);
    return { success: false, error: "AI is temporarily unavailable" };
  }
}
