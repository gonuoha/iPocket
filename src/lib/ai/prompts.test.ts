import { describe, expect, it } from "vitest";

import { buildAutoTagPrompt, buildSummaryPrompt } from "./prompts";

describe("buildAutoTagPrompt", () => {
  it("includes title, type, content, and existing tags in user content", () => {
    const result = buildAutoTagPrompt({
      title: "React hooks",
      type: "snippet",
      content: "useEffect cleanup",
      existingTags: ["react", "hooks"],
    });

    expect(result.systemInstruction).toContain("tag suggester");
    expect(result.systemInstruction).toContain("JSON");
    expect(result.userContent).toContain("Title: React hooks");
    expect(result.userContent).toContain("Type: snippet");
    expect(result.userContent).toContain("Content: useEffect cleanup");
    expect(result.userContent).toContain("Existing tags: react, hooks");
  });

  it("uses none when there are no existing tags", () => {
    const result = buildAutoTagPrompt({
      title: "Note",
      type: "note",
      content: "Some content",
      existingTags: [],
    });

    expect(result.userContent).toContain("Existing tags: none");
  });
});

describe("buildSummaryPrompt", () => {
  it("includes title, type, and content in user content", () => {
    const result = buildSummaryPrompt({
      title: "React hooks",
      type: "snippet",
      content: "useEffect cleanup",
    });

    expect(result.systemInstruction).toContain("summarizer");
    expect(result.systemInstruction).toContain("JSON");
    expect(result.userContent).toContain("Title: React hooks");
    expect(result.userContent).toContain("Type: snippet");
    expect(result.userContent).toContain("Content: useEffect cleanup");
  });
});
