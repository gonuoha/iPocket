import { describe, expect, it } from "vitest";

import { getTypeColorBorderProps } from "./type-color-border";

describe("getTypeColorBorderProps", () => {
  it("returns the border class for each position", () => {
    expect(getTypeColorBorderProps("#ff0000", "left").className).toBe(
      "border-l-4",
    );
    expect(getTypeColorBorderProps("#ff0000", "right").className).toBe(
      "border-r-4",
    );
    expect(getTypeColorBorderProps("#ff0000", "top").className).toBe(
      "border-t-4",
    );
    expect(getTypeColorBorderProps("#ff0000", "bottom").className).toBe(
      "border-b-4",
    );
  });

  it("applies the color to the matching border side", () => {
    expect(getTypeColorBorderProps("#ff0000", "left").style).toEqual({
      borderLeftColor: "#ff0000",
    });
    expect(getTypeColorBorderProps("#ff0000", "top").style).toEqual({
      borderTopColor: "#ff0000",
    });
  });

  it("omits style when color is missing or not a hex value", () => {
    expect(getTypeColorBorderProps(null, "left").style).toBeUndefined();
    expect(getTypeColorBorderProps("red", "left").style).toBeUndefined();
  });

  it("returns no border when position is none", () => {
    expect(getTypeColorBorderProps("#ff0000", "none")).toEqual({ className: "" });
    expect(getTypeColorBorderProps(null, "none")).toEqual({ className: "" });
  });
});
