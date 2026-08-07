"use client";

import { useEditorPreferences } from "@/components/code-editor/editor-preferences-context";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  EDITOR_FONT_SIZES,
  EDITOR_TAB_SIZES,
  EDITOR_THEME_LABELS,
  EDITOR_THEMES,
  type EditorFontSize,
  type EditorPreferences,
  type EditorTabSize,
  type EditorTheme,
} from "@/lib/editor-preferences";

function PreferenceField({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <Label className="text-sm font-medium">{label}</Label>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="sm:w-48">{children}</div>
    </div>
  );
}

export function EditorPreferencesCard() {
  const { preferences, updatePreferences, isSaving } = useEditorPreferences();

  const updateField = <K extends keyof EditorPreferences>(
    key: K,
    value: EditorPreferences[K],
  ) => {
    updatePreferences({ ...preferences, [key]: value });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold">Editor Preferences</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Customize how code appears in snippet and command editors.
        {isSaving ? " Saving..." : ""}
      </p>

      <div className="mt-6 space-y-6">
        <PreferenceField label="Font size">
          <Select
            value={String(preferences.fontSize)}
            onValueChange={(value) =>
              updateField("fontSize", Number(value) as EditorFontSize)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EDITOR_FONT_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}px
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </PreferenceField>

        <PreferenceField label="Tab size">
          <Select
            value={String(preferences.tabSize)}
            onValueChange={(value) =>
              updateField("tabSize", Number(value) as EditorTabSize)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EDITOR_TAB_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} spaces
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </PreferenceField>

        <PreferenceField label="Theme">
          <Select
            value={preferences.theme}
            onValueChange={(value) => updateField("theme", value as EditorTheme)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EDITOR_THEMES.map((theme) => (
                <SelectItem key={theme} value={theme}>
                  {EDITOR_THEME_LABELS[theme]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </PreferenceField>

        <PreferenceField
          label="Word wrap"
          description="Wrap long lines instead of horizontal scrolling."
        >
          <Switch
            checked={preferences.wordWrap}
            onCheckedChange={(checked) => updateField("wordWrap", checked)}
          />
        </PreferenceField>

        <PreferenceField
          label="Minimap"
          description="Show a code overview on the right side of the editor."
        >
          <Switch
            checked={preferences.minimap}
            onCheckedChange={(checked) => updateField("minimap", checked)}
          />
        </PreferenceField>
      </div>
    </div>
  );
}
