const LANGUAGE_ALIASES: Record<string, string> = {
  bash: "shell",
  js: "javascript",
  py: "python",
  sh: "shell",
  ts: "typescript",
  yml: "yaml",
};

export const CODE_EDITOR_MIN_HEIGHT = 200;
export const CODE_EDITOR_MAX_HEIGHT = 400;
const CODE_EDITOR_LINE_HEIGHT = 19;
const CODE_EDITOR_PADDING = 16;

export const DEFAULT_CODE_LANGUAGE = "plaintext";

export type CodeLanguageOption = {
  value: string;
  label: string;
};

export const CODE_LANGUAGE_OPTIONS: CodeLanguageOption[] = [
  { value: "plaintext", label: "Plain text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "sql", label: "SQL" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "scss", label: "SCSS" },
  { value: "json", label: "JSON" },
  { value: "xml", label: "XML" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
  { value: "shell", label: "Shell" },
  { value: "powershell", label: "PowerShell" },
  { value: "dockerfile", label: "Dockerfile" },
  { value: "graphql", label: "GraphQL" },
  { value: "lua", label: "Lua" },
  { value: "r", label: "R" },
  { value: "dart", label: "Dart" },
];

const CODE_LANGUAGE_LABELS = new Map(
  CODE_LANGUAGE_OPTIONS.map((option) => [option.value, option.label]),
);

export function toMonacoLanguage(language?: string): string {
  if (!language?.trim()) {
    return DEFAULT_CODE_LANGUAGE;
  }

  const normalized = language.trim().toLowerCase();
  return LANGUAGE_ALIASES[normalized] ?? normalized;
}

export function normalizeCodeLanguage(language?: string): string {
  return toMonacoLanguage(language);
}

export function getCodeLanguageOptions(
  currentLanguage?: string,
): CodeLanguageOption[] {
  const normalized = normalizeCodeLanguage(currentLanguage);

  if (CODE_LANGUAGE_LABELS.has(normalized)) {
    return CODE_LANGUAGE_OPTIONS;
  }

  return [
    ...CODE_LANGUAGE_OPTIONS,
    { value: normalized, label: formatCodeLanguageLabel(normalized) },
  ];
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
  const knownLabel = CODE_LANGUAGE_LABELS.get(monacoLanguage);

  if (knownLabel) {
    return knownLabel;
  }

  if (monacoLanguage === DEFAULT_CODE_LANGUAGE) {
    return "Plain text";
  }

  return monacoLanguage;
}
