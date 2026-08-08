"use client";

import type { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useEffect, useMemo, useRef, useState } from "react";

import { useEditorPreferences } from "@/components/code-editor/editor-preferences-context";
import type { EditorPreferences } from "@/lib/editor-preferences";
import {
  getCodeEditorHeight,
  toMonacoLanguage,
} from "@/lib/monaco-language";
import { preloadMonaco } from "@/lib/monaco-preload";
import { registerMonacoThemes } from "@/lib/monaco-themes";

type MonacoEditorPaneProps = {
  id?: string;
  value: string;
  language?: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
};

function buildEditorOptions(
  preferences: EditorPreferences,
  readOnly: boolean,
): editor.IStandaloneEditorConstructionOptions {
  return {
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
    occurrencesHighlight: "off",
    contextmenu: !readOnly,
    automaticLayout: true,
  };
}

export function MonacoEditorPane({
  id,
  value,
  language,
  readOnly = false,
  onChange,
}: MonacoEditorPaneProps) {
  const { preferences } = useEditorPreferences();
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const onChangeRef = useRef(onChange);
  const isApplyingExternalValueRef = useRef(false);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const height = useMemo(() => getCodeEditorHeight(value), [value]);
  const monacoLanguage = toMonacoLanguage(language);
  const latestEditorStateRef = useRef({
    value,
    monacoLanguage,
    preferences,
    readOnly,
  });

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    latestEditorStateRef.current = {
      value,
      monacoLanguage,
      preferences,
      readOnly,
    };
  }, [monacoLanguage, preferences, readOnly, value]);

  useEffect(() => {
    let disposed = false;
    const container = containerRef.current;

    if (!container) {
      return;
    }

    preloadMonaco()
      .then((monaco) => {
        if (disposed || !containerRef.current) {
          return;
        }

        monacoRef.current = monaco;
        registerMonacoThemes(monaco);

        const latestEditorState = latestEditorStateRef.current;
        const instance = monaco.editor.create(containerRef.current, {
          ...buildEditorOptions(
            latestEditorState.preferences,
            latestEditorState.readOnly,
          ),
          value: latestEditorState.value,
          language: latestEditorState.monacoLanguage,
          theme: latestEditorState.preferences.theme,
        });

        editorRef.current = instance;

        instance.onDidChangeModelContent(() => {
          if (isApplyingExternalValueRef.current) {
            return;
          }

          onChangeRef.current?.(instance.getValue());
        });

        setIsEditorReady(true);
      })
      .catch(() => {
        if (!disposed) {
          setIsEditorReady(false);
        }
      });

    return () => {
      disposed = true;
      editorRef.current?.dispose();
      editorRef.current = null;
      monacoRef.current = null;
      setIsEditorReady(false);
    };
  }, []);

  useEffect(() => {
    const instance = editorRef.current;
    const monaco = monacoRef.current;

    if (!instance || !monaco) {
      return;
    }

    const currentValue = instance.getValue();

    if (value === currentValue) {
      return;
    }

    isApplyingExternalValueRef.current = true;

    if (instance.getOption(monaco.editor.EditorOption.readOnly)) {
      instance.setValue(value);
    } else {
      const model = instance.getModel();

      if (model) {
        instance.executeEdits("", [
          {
            range: model.getFullModelRange(),
            text: value,
            forceMoveMarkers: true,
          },
        ]);
        instance.pushUndoStop();
      }
    }

    isApplyingExternalValueRef.current = false;
  }, [value]);

  useEffect(() => {
    const instance = editorRef.current;
    const monaco = monacoRef.current;
    const model = instance?.getModel();

    if (!instance || !monaco || !model) {
      return;
    }

    monaco.editor.setModelLanguage(model, monacoLanguage);
  }, [monacoLanguage]);

  useEffect(() => {
    const monaco = monacoRef.current;

    if (!monaco) {
      return;
    }

    registerMonacoThemes(monaco);
    monaco.editor.setTheme(preferences.theme);
  }, [preferences.theme]);

  useEffect(() => {
    editorRef.current?.updateOptions({
      fontSize: preferences.fontSize,
      tabSize: preferences.tabSize,
      wordWrap: preferences.wordWrap ? "on" : "off",
      minimap: { enabled: preferences.minimap },
    });
  }, [
    preferences.fontSize,
    preferences.minimap,
    preferences.tabSize,
    preferences.wordWrap,
  ]);

  useEffect(() => {
    editorRef.current?.updateOptions({
      readOnly,
      domReadOnly: readOnly,
      renderLineHighlight: readOnly ? "none" : "line",
      contextmenu: !readOnly,
    });
  }, [readOnly]);

  useEffect(() => {
    editorRef.current?.layout();
  }, [height]);

  return (
    <div className="relative" style={{ height }}>
      {!isEditorReady ? (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e1e] text-xs text-muted-foreground">
          Loading editor...
        </div>
      ) : null}
      <div ref={containerRef} id={id} className="h-full w-full" />
    </div>
  );
}
