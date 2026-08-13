import type { Monaco } from "@monaco-editor/react";

import type { Theme } from "@/lib/appearance";
import { cssColorToHex, withAlpha } from "@/lib/css-color";
import type { EditorTheme } from "@/lib/editor-preferences";

type MonacoThemeData = Parameters<Monaco["editor"]["defineTheme"]>[1];

export const APP_MONACO_THEME_IDS = {
  light: "memex-light",
  dark: "memex-dark",
  "dark-blue": "memex-dark-blue",
} as const satisfies Record<Theme, string>;

const SURFACE_TOKENS = {
  background: "--prose-pre-bg",
  foreground: "--foreground",
  lineHighlight: "--prose-code-bg",
  panel: "--muted",
  subtle: "--muted-foreground",
  accent: "--primary",
} as const;

const SYNTAX_TOKENS = {
  comment: "--syntax-comment",
  keyword: "--syntax-keyword",
  string: "--syntax-string",
  number: "--syntax-number",
  type: "--syntax-type",
  function: "--syntax-function",
  variable: "--syntax-variable",
} as const;

type SurfaceKey = keyof typeof SURFACE_TOKENS;
type SyntaxKey = keyof typeof SYNTAX_TOKENS;

type EditorSurface = Record<SurfaceKey, string> & {
  syntax: Record<SyntaxKey, string>;
};

/**
 * Mirrors the token values per theme so server rendering and browsers that fail
 * to resolve a token still get an on-brand editor instead of a black pane.
 */
const FALLBACK_SURFACES: Record<Theme, EditorSurface> = {
  light: {
    background: "#e3edf4",
    foreground: "#0c1721",
    lineHighlight: "#d8e7f0",
    panel: "#dfeaf1",
    subtle: "#5a656e",
    accent: "#0080ae",
    syntax: {
      comment: "#55677a",
      keyword: "#5a3fd0",
      string: "#0e7357",
      number: "#9a5316",
      type: "#7a5c10",
      function: "#0e6795",
      variable: "#0c1721",
    },
  },
  dark: {
    background: "#1b1b1b",
    foreground: "#fafafa",
    lineHighlight: "#2e2e2e",
    panel: "#262626",
    subtle: "#a1a1a1",
    accent: "#e5e5e5",
    syntax: {
      comment: "#7b8a9a",
      keyword: "#9b8afb",
      string: "#3db88a",
      number: "#e8944a",
      type: "#d4b84a",
      function: "#4da3e8",
      variable: "#fafafa",
    },
  },
  "dark-blue": {
    background: "#121c24",
    foreground: "#edf3f7",
    lineHighlight: "#1c252d",
    panel: "#162029",
    subtle: "#8e9aa4",
    accent: "#22b5e1",
    syntax: {
      comment: "#7b8a9a",
      keyword: "#9b8afb",
      string: "#3db88a",
      number: "#e8944a",
      type: "#d4b84a",
      function: "#4da3e8",
      variable: "#edf3f7",
    },
  },
};

const MONOKAI_RULES = [
  { token: "comment", foreground: "75715E", fontStyle: "italic" },
  { token: "keyword", foreground: "F92672" },
  { token: "string", foreground: "E6DB74" },
  { token: "number", foreground: "AE81FF" },
  { token: "type", foreground: "66D9EF", fontStyle: "italic" },
  { token: "function", foreground: "A6E22E" },
  { token: "variable", foreground: "F8F8F2" },
] as const;

const GITHUB_DARK_RULES = [
  { token: "comment", foreground: "8B949E", fontStyle: "italic" },
  { token: "keyword", foreground: "FF7B72" },
  { token: "string", foreground: "A5D6FF" },
  { token: "number", foreground: "79C0FF" },
  { token: "type", foreground: "FFA657" },
  { token: "function", foreground: "D2A8FF" },
  { token: "variable", foreground: "C9D1D9" },
] as const;

/**
 * Resolves tokens for `theme` regardless of which theme is currently applied to
 * `<html>`, so a theme switch cannot read the outgoing palette.
 */
function readEditorSurface(theme: Theme): EditorSurface {
  const fallback = FALLBACK_SURFACES[theme];

  if (typeof document === "undefined") {
    return fallback;
  }

  const probe = document.createElement("div");
  probe.dataset.theme = theme;
  probe.style.cssText =
    "position:absolute;left:-9999px;top:-9999px;width:0;height:0;visibility:hidden;pointer-events:none";
  document.body.appendChild(probe);

  const computed = getComputedStyle(probe);
  const read = (variable: string, fallbackColor: string) => {
    probe.style.backgroundColor = `var(${variable})`;

    return cssColorToHex(computed.backgroundColor) ?? fallbackColor;
  };

  try {
    return {
      ...(Object.fromEntries(
        Object.entries(SURFACE_TOKENS).map(([key, variable]) => [
          key,
          read(variable, fallback[key as SurfaceKey]),
        ]),
      ) as Record<SurfaceKey, string>),
      syntax: Object.fromEntries(
        Object.entries(SYNTAX_TOKENS).map(([key, variable]) => [
          key,
          read(variable, fallback.syntax[key as SyntaxKey]),
        ]),
      ) as Record<SyntaxKey, string>,
    };
  } finally {
    probe.remove();
  }
}

function bare(hexColor: string): string {
  return hexColor.replace("#", "");
}

function buildAppTheme(theme: Theme): MonacoThemeData {
  const surface = readEditorSurface(theme);
  const { syntax } = surface;

  return {
    base: theme === "light" ? "vs" : "vs-dark",
    inherit: true,
    rules: [
      { token: "", foreground: bare(syntax.variable) },
      { token: "comment", foreground: bare(syntax.comment), fontStyle: "italic" },
      { token: "keyword", foreground: bare(syntax.keyword) },
      { token: "operator", foreground: bare(syntax.keyword) },
      { token: "tag", foreground: bare(syntax.keyword) },
      { token: "string", foreground: bare(syntax.string) },
      { token: "string.value", foreground: bare(syntax.string) },
      { token: "attribute.value", foreground: bare(syntax.string) },
      { token: "regexp", foreground: bare(syntax.string) },
      { token: "number", foreground: bare(syntax.number) },
      { token: "constant", foreground: bare(syntax.number) },
      { token: "type", foreground: bare(syntax.type) },
      { token: "type.identifier", foreground: bare(syntax.type) },
      { token: "function", foreground: bare(syntax.function) },
      { token: "attribute.name", foreground: bare(syntax.function) },
      { token: "variable", foreground: bare(syntax.variable) },
      { token: "delimiter", foreground: bare(surface.subtle) },
    ],
    colors: {
      "editor.background": surface.background,
      "editor.foreground": surface.foreground,
      "editor.lineHighlightBackground": surface.lineHighlight,
      "editor.lineHighlightBorder": surface.lineHighlight,
      "editor.selectionBackground": withAlpha(surface.accent, 0.32),
      "editor.inactiveSelectionBackground": withAlpha(surface.accent, 0.18),
      "editor.selectionHighlightBackground": withAlpha(surface.accent, 0.18),
      "editor.wordHighlightBackground": withAlpha(surface.accent, 0.14),
      "editor.findMatchBackground": withAlpha(surface.accent, 0.4),
      "editor.findMatchHighlightBackground": withAlpha(surface.accent, 0.22),
      "editorCursor.foreground": surface.accent,
      "editorLineNumber.foreground": surface.subtle,
      "editorLineNumber.activeForeground": surface.foreground,
      "editorGutter.background": surface.background,
      "editorIndentGuide.background1": withAlpha(surface.subtle, 0.2),
      "editorIndentGuide.activeBackground1": withAlpha(surface.subtle, 0.45),
      "editorWhitespace.foreground": withAlpha(surface.subtle, 0.35),
      "editorBracketMatch.background": withAlpha(surface.accent, 0.2),
      "editorBracketMatch.border": surface.accent,
      "editorWidget.background": surface.panel,
      "editorWidget.foreground": surface.foreground,
      "editorWidget.border": withAlpha(surface.subtle, 0.3),
      "editorSuggestWidget.background": surface.panel,
      "editorSuggestWidget.foreground": surface.foreground,
      "editorSuggestWidget.border": withAlpha(surface.subtle, 0.3),
      "editorSuggestWidget.selectedBackground": withAlpha(surface.accent, 0.22),
      "editorSuggestWidget.highlightForeground": surface.accent,
      "editorHoverWidget.background": surface.panel,
      "editorHoverWidget.foreground": surface.foreground,
      "editorHoverWidget.border": withAlpha(surface.subtle, 0.3),
      "input.background": surface.background,
      "input.foreground": surface.foreground,
      "input.border": withAlpha(surface.subtle, 0.4),
      "focusBorder": surface.accent,
      "minimap.background": surface.background,
      "scrollbarSlider.background": withAlpha(surface.subtle, 0.4),
      "scrollbarSlider.hoverBackground": withAlpha(surface.subtle, 0.6),
      "scrollbarSlider.activeBackground": withAlpha(surface.subtle, 0.7),
    },
  };
}

export function resolveMonacoThemeId(
  editorTheme: EditorTheme,
  appTheme: Theme,
): string {
  if (editorTheme === "app") {
    return APP_MONACO_THEME_IDS[appTheme];
  }

  return editorTheme;
}

export function syncMonacoThemesWithApp(monaco: Monaco, appTheme: Theme): void {
  monaco.editor.defineTheme(
    APP_MONACO_THEME_IDS[appTheme],
    buildAppTheme(appTheme),
  );

  monaco.editor.defineTheme("monokai", {
    base: "vs-dark",
    inherit: true,
    rules: [...MONOKAI_RULES],
    colors: {
      "editor.background": "#272822",
      "editor.foreground": "#F8F8F2",
      "editor.lineHighlightBackground": "#3E3D32",
      "editor.selectionBackground": "#49483E",
      "editorCursor.foreground": "#F8F8F0",
    },
  });

  monaco.editor.defineTheme("github-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [...GITHUB_DARK_RULES],
    colors: {
      "editor.background": "#0D1117",
      "editor.foreground": "#C9D1D9",
      "editor.lineHighlightBackground": "#161B22",
      "editor.selectionBackground": "#264F78",
      "editorCursor.foreground": "#C9D1D9",
    },
  });
}
