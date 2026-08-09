"use server";

import { ThinkingLevel } from "@google/genai";

import { auth } from "@/auth";
import { AI_MODEL, getGeminiClient } from "@/lib/ai/gemini";
import { buildAutoTagPrompt } from "@/lib/ai/prompts";
import { truncateForAi } from "@/lib/ai/truncate-content";
import { getUserIsPro } from "@/lib/db/user";
import { checkAiRateLimit } from "@/lib/rate-limit";
import {
  AUTO_TAGS_JSON_SCHEMA,
  generateAutoTagsSchema,
  modelAutoTagsResponseSchema,
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
