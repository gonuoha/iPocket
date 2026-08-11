import { describe, expect, it } from "vitest";

import { userPreferencesSchema } from "./user-preferences";

describe("userPreferencesSchema", () => {
  it("accepts valid preferences", () => {
    const result = userPreferencesSchema.safeParse({
      showOverview: true,
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid showOverview values", () => {
    const result = userPreferencesSchema.safeParse({
      showOverview: "yes",
    });

    expect(result.success).toBe(false);
  });
});
