import { describe, expect, it } from "vitest";

import { cssColorToHex, withAlpha } from "./css-color";

describe("cssColorToHex", () => {
  it("parses legacy rgb output", () => {
    expect(cssColorToHex("rgb(18, 28, 36)")).toBe("#121c24");
    expect(cssColorToHex("rgba(18, 28, 36, 0.5)")).toBe("#121c24");
    expect(cssColorToHex("rgb(18 28 36)")).toBe("#121c24");
  });

  it("parses oklch, which browsers do not downgrade to rgb", () => {
    expect(cssColorToHex("oklch(0.22 0.022 245)")).toBe("#121c24");
    expect(cssColorToHex("oklch(0.96 0.01 240)")).toBe("#ecf3f8");
    expect(cssColorToHex("oklch(22% 0.022 245)")).toBe("#121c24");
  });

  it("parses hex shorthand and alpha forms", () => {
    expect(cssColorToHex("#abc")).toBe("#aabbcc");
    expect(cssColorToHex("#4DA3E8")).toBe("#4da3e8");
    expect(cssColorToHex("#4DA3E880")).toBe("#4da3e8");
  });

  it("returns null for unresolved or transparent values", () => {
    expect(cssColorToHex("rgba(0, 0, 0, 0)")).toBeNull();
    expect(cssColorToHex("transparent")).toBeNull();
    expect(cssColorToHex("")).toBeNull();
    expect(cssColorToHex(undefined)).toBeNull();
    expect(cssColorToHex("color(display-p3 1 0 0)")).toBeNull();
  });
});

describe("withAlpha", () => {
  it("appends an eight digit hex alpha channel", () => {
    expect(withAlpha("#121c24", 1)).toBe("#121c24ff");
    expect(withAlpha("#121c24", 0.32)).toBe("#121c2452");
    expect(withAlpha("#121c24", 0)).toBe("#121c2400");
  });
});
