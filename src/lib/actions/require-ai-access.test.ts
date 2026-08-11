import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db/user", () => ({
  getUserIsPro: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkAiRateLimit: vi.fn(),
}));

import { getUserIsPro } from "@/lib/db/user";
import { checkAiRateLimit } from "@/lib/rate-limit";

import { requireAiAccess } from "./require-ai-access";

const mockGetUserIsPro = vi.mocked(getUserIsPro);
const mockCheckAiRateLimit = vi.mocked(checkAiRateLimit);

describe("requireAiAccess", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserIsPro.mockResolvedValue(true);
    mockCheckAiRateLimit.mockResolvedValue({
      success: true,
      remaining: 19,
      reset: Date.now() + 3600000,
    });
  });

  it("returns pro subscription error for free users", async () => {
    mockGetUserIsPro.mockResolvedValue(false);

    const result = await requireAiAccess("user-1");

    expect(result).toEqual({
      success: false,
      error: "AI features require a Pro subscription",
    });
    expect(mockCheckAiRateLimit).not.toHaveBeenCalled();
  });

  it("returns rate limit error when limited", async () => {
    mockCheckAiRateLimit.mockResolvedValue({
      success: false,
      remaining: 0,
      reset: Date.now() + 3600000,
    });

    const result = await requireAiAccess("user-1");

    expect(result).toEqual({
      success: false,
      error: "You've reached your AI limit. Try again later.",
    });
  });

  it("returns success for pro users within rate limit", async () => {
    const result = await requireAiAccess("user-1");

    expect(result).toEqual({ success: true });
    expect(mockGetUserIsPro).toHaveBeenCalledWith("user-1");
    expect(mockCheckAiRateLimit).toHaveBeenCalledWith("user-1");
  });
});
