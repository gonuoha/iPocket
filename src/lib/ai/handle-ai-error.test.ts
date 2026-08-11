import { afterEach, describe, expect, it, vi } from "vitest";

import { handleAiActionError } from "./handle-ai-error";

describe("handleAiActionError", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs the action name and error", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("API error");

    handleAiActionError("generateSummary", error);

    expect(consoleError).toHaveBeenCalledWith("generateSummary failed:", error);
  });

  it("returns a service unavailable result", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const result = handleAiActionError("generateAutoTags", new Error("timeout"));

    expect(result).toEqual({
      success: false,
      error: "AI is temporarily unavailable",
    });
  });
});
