"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateUserPreferences } from "@/actions/settings";
import { PageSection } from "@/components/layout/page-container";
import { PreferenceField } from "@/components/shared/preference-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  TYPE_COLOR_POSITION_LABELS,
  TYPE_COLOR_POSITIONS,
  type TypeColorPosition,
  type UserPreferences,
} from "@/lib/user-preferences";

type UserPreferencesCardProps = {
  initialPreferences: UserPreferences;
};

export function UserPreferencesCard({
  initialPreferences,
}: UserPreferencesCardProps) {
  const [preferences, setPreferences] =
    useState<UserPreferences>(initialPreferences);
  const [isSaving, startSaving] = useTransition();

  const updateField = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K],
  ) => {
    const previous = preferences;
    const next = { ...preferences, [key]: value };
    setPreferences(next);

    startSaving(async () => {
      const result = await updateUserPreferences(next);

      if (!result.success) {
        setPreferences(previous);
        toast.error(result.error);
        return;
      }

      setPreferences(result.data);
      toast.success("User preferences saved");
    });
  };

  return (
    <PageSection
      title="User Preferences"
      description={
        <>
          Customize your Memex experience.
          {isSaving ? " Saving..." : ""}
        </>
      }
      contentClassName="space-y-6"
    >
        <PreferenceField
          label="Overview section"
          description="Show item type stats at the top of the dashboard."
        >
          <Switch
            checked={preferences.showOverview}
            onCheckedChange={(checked) => updateField("showOverview", checked)}
          />
        </PreferenceField>

        <PreferenceField
          label="Type color position"
          description="Choose where the item type color appears on cards."
        >
          <Select
            value={preferences.typeColorPosition}
            onValueChange={(value) =>
              updateField("typeColorPosition", value as TypeColorPosition)
            }
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_COLOR_POSITIONS.map((position) => (
                <SelectItem key={position} value={position}>
                  {TYPE_COLOR_POSITION_LABELS[position]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </PreferenceField>
    </PageSection>
  );
}
