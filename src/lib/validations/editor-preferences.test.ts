import { describe, expect, it } from "vitest";

import { editorPreferencesSchema } from "./editor-preferences";

describe("editorPreferencesSchema", () => {
  it("accepts a valid preferences payload", () => {
    const result = editorPreferencesSchema.safeParse({
      fontSize: 13,
      tabSize: 4,
      wordWrap: true,
      minimap: false,
      theme: "vs-dark",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an unsupported font size", () => {
    const result = editorPreferencesSchema.safeParse({
      fontSize: 20,
      tabSize: 4,
      wordWrap: true,
      minimap: false,
      theme: "vs-dark",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an unsupported theme", () => {
    const result = editorPreferencesSchema.safeParse({
      fontSize: 13,
      tabSize: 4,
      wordWrap: true,
      minimap: false,
      theme: "solarized",
    });

    expect(result.success).toBe(false);
  });
});
