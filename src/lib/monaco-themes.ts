import type { Monaco } from "@monaco-editor/react";

let themesRegistered = false;

export function registerMonacoThemes(monaco: Monaco) {
  if (themesRegistered) {
    return;
  }

  themesRegistered = true;

  monaco.editor.defineTheme("monokai", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "75715E", fontStyle: "italic" },
      { token: "keyword", foreground: "F92672" },
      { token: "string", foreground: "E6DB74" },
      { token: "number", foreground: "AE81FF" },
      { token: "type", foreground: "66D9EF", fontStyle: "italic" },
      { token: "function", foreground: "A6E22E" },
      { token: "variable", foreground: "F8F8F2" },
    ],
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
    rules: [
      { token: "comment", foreground: "8B949E", fontStyle: "italic" },
      { token: "keyword", foreground: "FF7B72" },
      { token: "string", foreground: "A5D6FF" },
      { token: "number", foreground: "79C0FF" },
      { token: "type", foreground: "FFA657" },
      { token: "function", foreground: "D2A8FF" },
      { token: "variable", foreground: "C9D1D9" },
    ],
    colors: {
      "editor.background": "#0D1117",
      "editor.foreground": "#C9D1D9",
      "editor.lineHighlightBackground": "#161B22",
      "editor.selectionBackground": "#264F78",
      "editorCursor.foreground": "#C9D1D9",
    },
  });
}
