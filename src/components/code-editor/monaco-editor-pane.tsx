"use client";

import Editor, { type OnMount } from "@monaco-editor/react";
import { useMemo } from "react";

import {
  getCodeEditorHeight,
  toMonacoLanguage,
} from "@/lib/monaco-language";

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
  const height = useMemo(() => getCodeEditorHeight(value), [value]);
  const monacoLanguage = toMonacoLanguage(language);

  const handleMount: OnMount = (editor) => {
    editor.layout();
  };

  return (
    <Editor
      {...(id ? { id } : {})}
      height={height}
      language={monacoLanguage}
      value={value}
      theme="vs-dark"
      onChange={(nextValue) => onChange?.(nextValue ?? "")}
      onMount={handleMount}
      options={{
        readOnly,
        domReadOnly: readOnly,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 13,
        lineNumbers: "on",
        wordWrap: "on",
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
