import { describe, expect, it } from "vitest";

import {
  isAppearance,
  isDarkTheme,
  parseAppearance,
  resolveTheme,
} from "./appearance";

describe("appearance utilities", () => {
  it("validates appearance values", () => {
    expect(isAppearance("light")).toBe(true);
    expect(isAppearance("dark")).toBe(true);
    expect(isAppearance("dark-blue")).toBe(true);
    expect(isAppearance("system")).toBe(true);
    expect(isAppearance("obsidian")).toBe(false);
  });

  it("parses appearance with dark fallback", () => {
    expect(parseAppearance("light")).toBe("light");
    expect(parseAppearance("dark-blue")).toBe("dark-blue");
    expect(parseAppearance("invalid")).toBe("dark");
    expect(parseAppearance(undefined)).toBe("dark");
  });

  it("resolves explicit theme preferences", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
    expect(resolveTheme("dark-blue", true)).toBe("dark-blue");
  });

  it("resolves system to light or neutral dark", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });

  it("identifies dark themes", () => {
    expect(isDarkTheme("light")).toBe(false);
    expect(isDarkTheme("dark")).toBe(true);
    expect(isDarkTheme("dark-blue")).toBe(true);
  });
});
