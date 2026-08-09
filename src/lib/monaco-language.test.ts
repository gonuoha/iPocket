import { describe, expect, it } from "vitest";

import {
  DEFAULT_CODE_LANGUAGE,
  formatCodeLanguageLabel,
  getCodeLanguageOptions,
  normalizeCodeLanguage,
  toMonacoLanguage,
} from "./monaco-language";

describe("monaco-language", () => {
  it("normalizes empty and aliased languages for Monaco", () => {
    expect(toMonacoLanguage()).toBe(DEFAULT_CODE_LANGUAGE);
    expect(toMonacoLanguage("")).toBe(DEFAULT_CODE_LANGUAGE);
    expect(toMonacoLanguage("js")).toBe("javascript");
    expect(toMonacoLanguage("TS")).toBe("typescript");
    expect(toMonacoLanguage("bash")).toBe("shell");
  });

  it("formats known language labels", () => {
    expect(formatCodeLanguageLabel("javascript")).toBe("JavaScript");
    expect(formatCodeLanguageLabel("")).toBe("Plain text");
    expect(formatCodeLanguageLabel("cobol")).toBe("cobol");
  });

  it("includes unknown current languages in select options", () => {
    const options = getCodeLanguageOptions("cobol");
    expect(normalizeCodeLanguage("cobol")).toBe("cobol");
    expect(options.some((option) => option.value === "cobol")).toBe(true);
    expect(options[0]?.value).toBe(DEFAULT_CODE_LANGUAGE);
  });
});
