import { describe, expect, it } from "vitest";

import { commandPaletteFilter } from "./command-palette-filter";

describe("commandPaletteFilter", () => {
  it("returns all items when search is empty", () => {
    expect(commandPaletteFilter("Any title", "")).toBe(1);
  });

  it("matches title substrings", () => {
    expect(commandPaletteFilter("My test item", "test")).toBe(1);
    expect(commandPaletteFilter("Latest notes", "test")).toBe(0);
  });

  it("matches word prefixes in the title", () => {
    expect(commandPaletteFilter("Testing utilities", "test")).toBe(0.9);
  });

  it("matches keywords with a lower score than title matches", () => {
    expect(
      commandPaletteFilter("Deployment notes", "test", ["Run test suite"]),
    ).toBe(0.8);
  });

  it("does not fuzzy-match scattered characters in unrelated text", () => {
    expect(
      commandPaletteFilter("TypeScript snippet", "test", [
        "export const latest = true",
      ]),
    ).toBe(0);
  });

  it("is case insensitive", () => {
    expect(commandPaletteFilter("TEST Item", "test")).toBe(1);
  });

  it("returns no match for empty searchable fields", () => {
    expect(commandPaletteFilter("", "test")).toBe(0);
    expect(commandPaletteFilter("   ", "test")).toBe(0);
  });
});
