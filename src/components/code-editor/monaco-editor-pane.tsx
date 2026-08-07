"use client";

import Editor, { type OnMount } from "@monaco-editor/react";
import { useMemo } from "react";

import { useEditorPreferences } from "@/components/code-editor/editor-preferences-context";
import {
  getCodeEditorHeight,
  toMonacoLanguage,
} from "@/lib/monaco-language";
import { registerMonacoThemes } from "@/lib/monaco-themes";

type MonacoEditorPaneProps = {
  id?: string;
  value: string;
  language?: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
};

export function MonacoEditorPane({
  id,
  value,
  language,
  readOnly = false,
  onChange,
}: MonacoEditorPaneProps) {
  const { preferences } = useEditorPreferences();
  const height = useMemo(() => getCodeEditorHeight(value), [value]);
  const monacoLanguage = toMonacoLanguage(language);

  const handleMount: OnMount = (editor, monaco) => {
    registerMonacoThemes(monaco);
    editor.layout();
  };

  return (
    <Editor
      {...(id ? { id } : {})}
      height={height}
      language={monacoLanguage}
      value={value}
      theme={preferences.theme}
      onChange={(nextValue) => onChange?.(nextValue ?? "")}
      onMount={handleMount}
      options={{
        readOnly,
        domReadOnly: readOnly,
        minimap: { enabled: preferences.minimap },
        scrollBeyondLastLine: false,
        fontSize: preferences.fontSize,
        tabSize: preferences.tabSize,
        lineNumbers: "on",
        wordWrap: preferences.wordWrap ? "on" : "off",
        padding: { top: 8, bottom: 8 },
        scrollbar: {
          vertical: "auto",
          horizontal: "auto",
          verticalScrollbarSize: 8,
          horizontalScrollbarSize: 8,
        },
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        overviewRulerBorder: false,
        renderLineHighlight: readOnly ? "none" : "line",
        folding: true,
        contextmenu: !readOnly,
      }}
    />
  );
}
