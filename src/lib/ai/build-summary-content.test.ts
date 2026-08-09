import { describe, expect, it } from "vitest";

import { buildSummaryContent, canGenerateSummary } from "./build-summary-content";

describe("buildSummaryContent", () => {
  it("combines content, url, file name, and language", () => {
    const result = buildSummaryContent({
      type: "snippet",
      content: "useEffect cleanup",
      url: "https://example.com",
      fileName: "notes.md",
      language: "typescript",
    });

    expect(result).toContain("useEffect cleanup");
    expect(result).toContain("URL: https://example.com");
    expect(result).toContain("File: notes.md");
    expect(result).toContain("Language: typescript");
  });

  it("uses file name for file and image types", () => {
    const result = buildSummaryContent({
      type: "file",
      fileName: "diagram.pdf",
    });

    expect(result).toBe("File: diagram.pdf");
  });

  it("falls back to type when no other fields are available", () => {
    const result = buildSummaryContent({ type: "note" });

    expect(result).toBe("Type: note");
  });
});

describe("canGenerateSummary", () => {
  it("requires a title and summary content", () => {
    expect(
      canGenerateSummary("Title", { type: "note", content: "Body" }),
    ).toBe(true);
    expect(canGenerateSummary("", { type: "note", content: "Body" })).toBe(
      false,
    );
    expect(canGenerateSummary("Title", { type: "note" })).toBe(true);
  });
});
