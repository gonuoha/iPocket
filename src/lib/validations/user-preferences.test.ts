import { describe, expect, it } from "vitest";

import { userPreferencesSchema } from "./user-preferences";

describe("userPreferencesSchema", () => {
  it("accepts valid preferences", () => {
    const result = userPreferencesSchema.safeParse({
      showOverview: true,
      typeColorPosition: "right",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid showOverview values", () => {
    const result = userPreferencesSchema.safeParse({
      showOverview: "yes",
      typeColorPosition: "left",
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid typeColorPosition values", () => {
    const result = userPreferencesSchema.safeParse({
      showOverview: true,
      typeColorPosition: "center",
    });

    expect(result.success).toBe(false);
  });
});
