import { describe, expect, it } from "vitest";

import { userPreferencesSchema } from "./user-preferences";

describe("userPreferencesSchema", () => {
  it("accepts valid preferences", () => {
    const result = userPreferencesSchema.safeParse({
      showOverview: true,
      typeColorPosition: "right",
      appearance: "dark-blue",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid showOverview values", () => {
    const result = userPreferencesSchema.safeParse({
      showOverview: "yes",
      typeColorPosition: "left",
      appearance: "dark",
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid typeColorPosition values", () => {
    const result = userPreferencesSchema.safeParse({
      showOverview: true,
      typeColorPosition: "center",
      appearance: "dark",
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid appearance values", () => {
    const result = userPreferencesSchema.safeParse({
      showOverview: true,
      typeColorPosition: "left",
      appearance: "obsidian",
    });

    expect(result.success).toBe(false);
  });
});
