import { describe, expect, it } from "vitest";

import { truncateForAi } from "./truncate-content";

describe("truncateForAi", () => {
  it("returns trimmed content when under max length", () => {
    expect(truncateForAi("  hello world  ")).toBe("hello world");
  });

  it("truncates long content with ellipsis", () => {
    const content = "a".repeat(2100);
    const result = truncateForAi(content, 2000);

    expect(result.length).toBeLessThanOrEqual(2001);
    expect(result.endsWith("…")).toBe(true);
  });

  it("truncates at word boundary when possible", () => {
    const content = `${"word ".repeat(500)}end`;
    const result = truncateForAi(content, 100);

    expect(result.endsWith("…")).toBe(true);
    expect(result).not.toContain("end");
  });
});
