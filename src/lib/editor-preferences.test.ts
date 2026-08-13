import { describe, expect, it } from "vitest";

import {
  DEFAULT_EDITOR_PREFERENCES,
  parseEditorPreferences,
} from "./editor-preferences";

describe("parseEditorPreferences", () => {
  it("returns defaults for nullish and non-object values", () => {
    expect(parseEditorPreferences(null)).toEqual(DEFAULT_EDITOR_PREFERENCES);
    expect(parseEditorPreferences(undefined)).toEqual(DEFAULT_EDITOR_PREFERENCES);
    expect(parseEditorPreferences("invalid")).toEqual(DEFAULT_EDITOR_PREFERENCES);
  });

  it("returns a valid preferences object unchanged", () => {
    const preferences = {
      fontSize: 14,
      tabSize: 2,
      wordWrap: false,
      minimap: true,
      theme: "monokai",
    } as const;

    expect(parseEditorPreferences(preferences)).toEqual(preferences);
  });

  it("defaults to the app-matched theme", () => {
    expect(DEFAULT_EDITOR_PREFERENCES.theme).toBe("app");
    expect(parseEditorPreferences({ theme: "app" }).theme).toBe("app");
  });

  it("merges partial objects with defaults", () => {
    expect(
      parseEditorPreferences({
        fontSize: 16,
        theme: "github-dark",
      }),
    ).toEqual({
      fontSize: 16,
      tabSize: 4,
      wordWrap: true,
      minimap: false,
      theme: "github-dark",
    });
  });

  it("falls back to defaults for invalid field values", () => {
    expect(
      parseEditorPreferences({
        fontSize: 20,
        tabSize: 3,
        wordWrap: "yes",
        minimap: 1,
        theme: "solarized",
      }),
    ).toEqual(DEFAULT_EDITOR_PREFERENCES);
  });
});
