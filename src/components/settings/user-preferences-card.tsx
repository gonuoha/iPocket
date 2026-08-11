"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateUserPreferences } from "@/actions/settings";
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
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold">User Preferences</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Customize your iPocket experience.
        {isSaving ? " Saving..." : ""}
      </p>

      <div className="mt-6 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Overview section</Label>
            <p className="text-sm text-muted-foreground">
              Show item type stats at the top of the dashboard.
            </p>
          </div>
          <Switch
            checked={preferences.showOverview}
            onCheckedChange={(checked) => updateField("showOverview", checked)}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Type color position</Label>
            <p className="text-sm text-muted-foreground">
              Choose where the item type color appears on cards.
            </p>
          </div>
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
        </div>
      </div>
    </div>
  );
}
