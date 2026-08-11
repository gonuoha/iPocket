import { describe, expect, it } from "vitest";
import { z } from "zod";

import { parseActionInput } from "./parse-action-input";

const testSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

describe("parseActionInput", () => {
  it("returns parsed data for valid input", () => {
    const result = parseActionInput(testSchema, { name: "Test" });

    expect(result).toEqual({ success: true, data: { name: "Test" } });
  });

  it("returns first Zod issue message for invalid input", () => {
    const result = parseActionInput(testSchema, { name: "" });

    expect(result).toEqual({ success: false, error: "Name is required" });
  });

  it("returns generic message when Zod issue has no message", () => {
    const schema = z.string();
    const result = parseActionInput(schema, 123);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
  });
});
