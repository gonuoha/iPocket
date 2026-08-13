"use client";

import type { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useEffect, useMemo, useRef, useState } from "react";

import { useAppearance } from "@/components/theme/appearance-provider";
import { useEditorPreferences } from "@/components/code-editor/editor-preferences-context";
import type { EditorPreferences } from "@/lib/editor-preferences";
import {
  getCodeEditorHeight,
  toMonacoLanguage,
} from "@/lib/monaco-language";
import {
  resolveMonacoThemeId,
  syncMonacoThemesWithApp,
} from "@/lib/monaco-app-theme";
import { preloadMonaco } from "@/lib/monaco-preload";

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
  const { resolvedTheme } = useAppearance();
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const onChangeRef = useRef(onChange);
  const isApplyingExternalValueRef = useRef(false);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const height = useMemo(() => getCodeEditorHeight(value), [value]);
  const monacoLanguage = toMonacoLanguage(language);
  const latestEditorStateRef = useRef({
    value,
    monacoLanguage,
    preferences,
    readOnly,
    resolvedTheme,
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
      resolvedTheme,
    };
  }, [monacoLanguage, preferences, readOnly, resolvedTheme, value]);

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

        try {
          monacoRef.current = monaco;

          const latestEditorState = latestEditorStateRef.current;
          syncMonacoThemesWithApp(monaco, latestEditorState.resolvedTheme);

          const monacoThemeId = resolveMonacoThemeId(
            latestEditorState.preferences.theme,
            latestEditorState.resolvedTheme,
          );
          const instance = monaco.editor.create(containerRef.current, {
            ...buildEditorOptions(
              latestEditorState.preferences,
              latestEditorState.readOnly,
            ),
            value: latestEditorState.value,
            language: latestEditorState.monacoLanguage,
            theme: monacoThemeId,
          });

          editorRef.current = instance;

          instance.onDidChangeModelContent(() => {
            if (isApplyingExternalValueRef.current) {
              return;
            }

            onChangeRef.current?.(instance.getValue());
          });

          setLoadError(null);
          setIsEditorReady(true);
        } catch (error) {
          if (!disposed) {
            setLoadError(
              error instanceof Error ? error.message : "Failed to load editor",
            );
            setIsEditorReady(false);
          }
        }
      })
      .catch((error: unknown) => {
        if (!disposed) {
          setLoadError(
            error instanceof Error ? error.message : "Failed to load editor",
          );
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

    syncMonacoThemesWithApp(monaco, resolvedTheme);
    monaco.editor.setTheme(
      resolveMonacoThemeId(preferences.theme, resolvedTheme),
    );
  }, [preferences.theme, resolvedTheme]);

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
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-prose-pre-bg px-4 text-center text-xs text-muted-foreground">
          {loadError ?? "Loading editor..."}
        </div>
      ) : null}
      <div ref={containerRef} id={id} className="h-full w-full" />
    </div>
  );
}
