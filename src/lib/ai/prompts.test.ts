import { describe, expect, it } from "vitest";

import { buildAutoTagPrompt, buildExplainPrompt, buildOptimizePrompt, buildSummaryPrompt } from "./prompts";

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

describe("buildExplainPrompt", () => {
  it("includes title, type, language, and content in user content", () => {
    const result = buildExplainPrompt({
      title: "React hooks",
      type: "snippet",
      content: "useEffect cleanup",
      language: "javascript",
    });

    expect(result.systemInstruction).toContain("code explainer");
    expect(result.userContent).toContain("Title: React hooks");
    expect(result.userContent).toContain("Type: snippet");
    expect(result.userContent).toContain("Language: javascript");
    expect(result.userContent).toContain("Content:\nuseEffect cleanup");
  });

  it("uses unknown when language is missing", () => {
    const result = buildExplainPrompt({
      title: "Shell cleanup",
      type: "command",
      content: "rm -rf node_modules",
    });

    expect(result.userContent).toContain("Language: unknown");
  });
});

describe("buildOptimizePrompt", () => {
  it("includes title and prompt content in user content", () => {
    const result = buildOptimizePrompt({
      title: "Code review",
      content: "Review this pull request for bugs.",
    });

    expect(result.systemInstruction).toContain("prompt optimizer");
    expect(result.systemInstruction).toContain("JSON");
    expect(result.userContent).toContain("Title: Code review");
    expect(result.userContent).toContain("Prompt:\nReview this pull request for bugs.");
  });
});
