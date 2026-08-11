import { expect, it, type Mock } from "vitest";

import type { ActionResult } from "@/types/actions";

type AiGuardMocks = {
  mockAuth: Mock;
  mockGetUserIsPro: Mock;
  mockCheckAiRateLimit: Mock;
  mockGenerateContent: Mock;
};

export function describeAiActionGuards(
  mocks: AiGuardMocks,
  invoke: (input: unknown) => Promise<ActionResult<unknown>>,
  validInput: unknown,
  validationInput: unknown,
  validationError: string,
) {
  const {
    mockAuth,
    mockGetUserIsPro,
    mockCheckAiRateLimit,
    mockGenerateContent,
  } = mocks;

  it("returns unauthorized when there is no session", async () => {
    mockAuth.mockResolvedValue(null);

    const result = await invoke(validInput);

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it("returns a validation error for invalid payload", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);

    const result = await invoke(validationInput);

    expect(result).toEqual({ success: false, error: validationError });
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it("returns pro subscription error for free users", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockGetUserIsPro.mockResolvedValue(false);

    const result = await invoke(validInput);

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

    const result = await invoke(validInput);

    expect(result).toEqual({
      success: false,
      error: "You've reached your AI limit. Try again later.",
    });
  });
}
