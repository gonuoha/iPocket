import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/user", () => ({
  getUserIsPro: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkAiRateLimit: vi.fn(),
}));

vi.mock("@/lib/ai/gemini", () => ({
  AI_MODEL: "gemini-3.5-flash-lite",
  getGeminiClient: vi.fn(),
}));

import { auth } from "@/auth";
import { getGeminiClient } from "@/lib/ai/gemini";
import { getUserIsPro } from "@/lib/db/user";
import { checkAiRateLimit } from "@/lib/rate-limit";

import { generateAutoTags, generateSummary } from "./ai";

const mockAuth = vi.mocked(auth);
const mockGetUserIsPro = vi.mocked(getUserIsPro);
const mockCheckAiRateLimit = vi.mocked(checkAiRateLimit);
const mockGetGeminiClient = vi.mocked(getGeminiClient);

const validInput = {
  title: "React hooks",
  content: "useEffect cleanup example",
  type: "snippet" as const,
  existingTags: ["react"],
};

const mockGenerateContent = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  mockGetUserIsPro.mockResolvedValue(true);
  mockCheckAiRateLimit.mockResolvedValue({
    success: true,
    remaining: 19,
    reset: Date.now() + 3600000,
  });
  mockGetGeminiClient.mockReturnValue({
    models: { generateContent: mockGenerateContent },
  } as never);
  mockGenerateContent.mockResolvedValue({
    text: JSON.stringify({
      tags: ["use-effect", "hooks", "frontend"],
    }),
  });
});

describe("generateAutoTags", () => {
  it("returns unauthorized when there is no session", async () => {
    mockAuth.mockResolvedValue(null);

    const result = await generateAutoTags(validInput);

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it("returns a validation error for invalid payload", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);

    const result = await generateAutoTags({ ...validInput, title: "" });

    expect(result).toEqual({ success: false, error: "Title is required" });
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it("returns pro subscription error for free users", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockGetUserIsPro.mockResolvedValue(false);

    const result = await generateAutoTags(validInput);

    expect(result).toEqual({
      success: false,
      error: "AI features require a Pro subscription",
    });
    expect(mockCheckAiRateLimit).not.toHaveBeenCalled();
  });

  it("returns rate limit error when limited", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockCheckAiRateLimit.mockResolvedValue({
      success: false,
      remaining: 0,
      reset: Date.now() + 3600000,
    });

    const result = await generateAutoTags(validInput);

    expect(result).toEqual({
      success: false,
      error: "You've reached your AI limit. Try again later.",
    });
  });

  it("returns tags for pro users with valid input", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);

    const result = await generateAutoTags(validInput);

    expect(result).toEqual({
      success: true,
      data: { tags: ["use-effect", "hooks", "frontend"] },
    });
    expect(mockGenerateContent).toHaveBeenCalledOnce();
  });

  it("returns service unavailable when Gemini throws", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockGenerateContent.mockRejectedValue(new Error("API error"));

    const result = await generateAutoTags(validInput);

    expect(result).toEqual({
      success: false,
      error: "AI is temporarily unavailable",
    });
  });

  it("filters tags that match existing tags", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        tags: ["react", "hooks", "frontend", "use-effect"],
      }),
    });

    const result = await generateAutoTags(validInput);

    expect(result).toEqual({
      success: true,
      data: { tags: ["hooks", "frontend", "use-effect"] },
    });
  });

  it("returns error when all suggested tags already exist", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        tags: ["react", "hooks", "frontend"],
      }),
    });

    const result = await generateAutoTags({
      ...validInput,
      existingTags: ["react", "hooks", "frontend"],
    });

    expect(result).toEqual({
      success: false,
      error: "No new tags could be suggested. Try adding more content.",
    });
  });

  it("returns service unavailable for invalid model JSON", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({ tags: [] }),
    });

    const result = await generateAutoTags(validInput);

    expect(result).toEqual({
      success: false,
      error: "AI is temporarily unavailable",
    });
  });

  it("returns service unavailable for empty model response", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockGenerateContent.mockResolvedValue({ text: "" });

    const result = await generateAutoTags(validInput);

    expect(result).toEqual({
      success: false,
      error: "AI is temporarily unavailable",
    });
  });

  it("normalizes and caps tags at five suggestions", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        tags: [
          "React",
          "HOOKS",
          "hooks",
          "frontend",
          "backend",
          "testing",
          "vitest",
        ],
      }),
    });

    const result = await generateAutoTags({
      ...validInput,
      existingTags: [],
    });

    expect(result).toEqual({
      success: true,
      data: { tags: ["react", "hooks", "frontend", "backend", "testing"] },
    });
  });
});

const summaryInput = {
  title: "React hooks",
  content: "useEffect cleanup example",
  type: "snippet" as const,
};

describe("generateSummary", () => {
  it("returns unauthorized when there is no session", async () => {
    mockAuth.mockResolvedValue(null);

    const result = await generateSummary(summaryInput);

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it("returns a validation error for invalid payload", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);

    const result = await generateSummary({ ...summaryInput, title: "" });

    expect(result).toEqual({ success: false, error: "Title is required" });
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it("returns pro subscription error for free users", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockGetUserIsPro.mockResolvedValue(false);

    const result = await generateSummary(summaryInput);

    expect(result).toEqual({
      success: false,
      error: "AI features require a Pro subscription",
    });
    expect(mockCheckAiRateLimit).not.toHaveBeenCalled();
  });

  it("returns rate limit error when limited", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockCheckAiRateLimit.mockResolvedValue({
      success: false,
      remaining: 0,
      reset: Date.now() + 3600000,
    });

    const result = await generateSummary(summaryInput);

    expect(result).toEqual({
      success: false,
      error: "You've reached your AI limit. Try again later.",
    });
  });

  it("returns summary for pro users with valid input", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        summary: "A concise summary of the React hooks example.",
      }),
    });

    const result = await generateSummary(summaryInput);

    expect(result).toEqual({
      success: true,
      data: { summary: "A concise summary of the React hooks example." },
    });
    expect(mockGenerateContent).toHaveBeenCalledOnce();
  });

  it("normalizes summaries longer than 300 characters", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        summary: "A".repeat(350),
      }),
    });

    const result = await generateSummary(summaryInput);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.summary.length).toBeLessThanOrEqual(300);
      expect(result.data.summary.endsWith("…")).toBe(true);
    }
  });

  it("returns service unavailable when Gemini throws", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockGenerateContent.mockRejectedValue(new Error("API error"));

    const result = await generateSummary(summaryInput);

    expect(result).toEqual({
      success: false,
      error: "AI is temporarily unavailable",
    });
  });

  it("returns service unavailable for invalid model JSON", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({ summary: "" }),
    });

    const result = await generateSummary(summaryInput);

    expect(result).toEqual({
      success: false,
      error: "AI is temporarily unavailable",
    });
  });
});
