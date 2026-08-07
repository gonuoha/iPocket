"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";

import { updateEditorPreferences } from "@/actions/settings";
import type { EditorPreferences } from "@/lib/editor-preferences";

type EditorPreferencesContextValue = {
  preferences: EditorPreferences;
  updatePreferences: (next: EditorPreferences) => void;
  isSaving: boolean;
};

const EditorPreferencesContext =
  createContext<EditorPreferencesContextValue | null>(null);

export function EditorPreferencesProvider({
  children,
  initialPreferences,
}: {
  children: React.ReactNode;
  initialPreferences: EditorPreferences;
}) {
  const [preferences, setPreferences] =
    useState<EditorPreferences>(initialPreferences);
  const [isSaving, startSaving] = useTransition();
  const preferencesRef = useRef(preferences);

  useEffect(() => {
    preferencesRef.current = preferences;
  }, [preferences]);

  const updatePreferences = useCallback((next: EditorPreferences) => {
    const previous = preferencesRef.current;
    setPreferences(next);

    startSaving(async () => {
      const result = await updateEditorPreferences(next);

      if (!result.success) {
        setPreferences(previous);
        toast.error(result.error);
        return;
      }

      setPreferences(result.data);
      toast.success("Editor preferences saved");
    });
  }, []);

  const value = useMemo(
    () => ({
      preferences,
      updatePreferences,
      isSaving,
    }),
    [preferences, updatePreferences, isSaving],
  );

  return (
    <EditorPreferencesContext.Provider value={value}>
      {children}
    </EditorPreferencesContext.Provider>
  );
}

export function useEditorPreferences() {
  const context = useContext(EditorPreferencesContext);

  if (!context) {
    throw new Error(
      "useEditorPreferences must be used within EditorPreferencesProvider",
    );
  }

  return context;
}
