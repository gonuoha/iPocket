import { describe, expect, it } from "vitest";

import { appendTagToTagsString, parseTagsString } from "./parse-tags";

describe("parseTagsString", () => {
  it("parses comma-separated tags with trimming", () => {
    expect(parseTagsString("react, hooks ,typescript")).toEqual([
      "react",
      "hooks",
      "typescript",
    ]);
  });

  it("returns empty array for blank input", () => {
    expect(parseTagsString("  ,  , ")).toEqual([]);
  });
});

describe("appendTagToTagsString", () => {
  it("appends a new tag to existing tags", () => {
    expect(appendTagToTagsString("react, hooks", "frontend")).toBe(
      "react, hooks, frontend",
    );
  });

  it("does not duplicate tags case-insensitively", () => {
    expect(appendTagToTagsString("react, Hooks", "hooks")).toBe(
      "react, Hooks",
    );
  });

  it("adds the first tag to an empty string", () => {
    expect(appendTagToTagsString("", "react")).toBe("react");
  });
});
