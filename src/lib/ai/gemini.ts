import { GoogleGenAI } from "@google/genai";

export const AI_MODEL =
  process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash-lite";

let client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Gemini API key is not configured");
    }

    client = new GoogleGenAI({ apiKey });
  }

  return client;
}
