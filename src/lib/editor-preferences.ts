export const EDITOR_THEMES = ["vs-dark", "monokai", "github-dark"] as const;

export type EditorTheme = (typeof EDITOR_THEMES)[number];

export const EDITOR_FONT_SIZES = [12, 13, 14, 15, 16] as const;

export type EditorFontSize = (typeof EDITOR_FONT_SIZES)[number];

export const EDITOR_TAB_SIZES = [2, 4, 8] as const;

export type EditorTabSize = (typeof EDITOR_TAB_SIZES)[number];

export type EditorPreferences = {
  fontSize: EditorFontSize;
  tabSize: EditorTabSize;
  wordWrap: boolean;
  minimap: boolean;
  theme: EditorTheme;
};

export const DEFAULT_EDITOR_PREFERENCES: EditorPreferences = {
  fontSize: 13,
  tabSize: 4,
  wordWrap: true,
  minimap: false,
  theme: "vs-dark",
};

export const EDITOR_THEME_LABELS: Record<EditorTheme, string> = {
  "vs-dark": "VS Dark",
  monokai: "Monokai",
  "github-dark": "GitHub Dark",
};

function isEditorTheme(value: unknown): value is EditorTheme {
  return (
    typeof value === "string" &&
    EDITOR_THEMES.includes(value as EditorTheme)
  );
}

function isEditorFontSize(value: unknown): value is EditorFontSize {
  return (
    typeof value === "number" &&
    EDITOR_FONT_SIZES.includes(value as EditorFontSize)
  );
}

function isEditorTabSize(value: unknown): value is EditorTabSize {
  return (
    typeof value === "number" &&
    EDITOR_TAB_SIZES.includes(value as EditorTabSize)
  );
}

export function parseEditorPreferences(raw: unknown): EditorPreferences {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_EDITOR_PREFERENCES;
  }

  const value = raw as Record<string, unknown>;

  return {
    fontSize: isEditorFontSize(value.fontSize)
      ? value.fontSize
      : DEFAULT_EDITOR_PREFERENCES.fontSize,
    tabSize: isEditorTabSize(value.tabSize)
      ? value.tabSize
      : DEFAULT_EDITOR_PREFERENCES.tabSize,
    wordWrap:
      typeof value.wordWrap === "boolean"
        ? value.wordWrap
        : DEFAULT_EDITOR_PREFERENCES.wordWrap,
    minimap:
      typeof value.minimap === "boolean"
        ? value.minimap
        : DEFAULT_EDITOR_PREFERENCES.minimap,
    theme: isEditorTheme(value.theme)
      ? value.theme
      : DEFAULT_EDITOR_PREFERENCES.theme,
  };
}
