const LANGUAGE_ALIASES: Record<string, string> = {
  bash: "shell",
  js: "javascript",
  py: "python",
  sh: "shell",
  ts: "typescript",
  yml: "yaml",
};

export const CODE_EDITOR_MIN_HEIGHT = 120;
export const CODE_EDITOR_MAX_HEIGHT = 400;
const CODE_EDITOR_LINE_HEIGHT = 19;
const CODE_EDITOR_PADDING = 16;

export function toMonacoLanguage(language?: string): string {
  if (!language?.trim()) {
    return "plaintext";
  }

  const normalized = language.trim().toLowerCase();
  return LANGUAGE_ALIASES[normalized] ?? normalized;
}

export function getCodeEditorHeight(value: string): number {
  const lineCount = Math.max(1, value.split("\n").length);

  return Math.min(
    Math.max(lineCount * CODE_EDITOR_LINE_HEIGHT + CODE_EDITOR_PADDING, CODE_EDITOR_MIN_HEIGHT),
    CODE_EDITOR_MAX_HEIGHT,
  );
}

export function formatCodeLanguageLabel(language?: string): string {
  const monacoLanguage = toMonacoLanguage(language);

  if (monacoLanguage === "plaintext") {
    return "Plain text";
  }

  return monacoLanguage;
}
