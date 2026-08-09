"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_CODE_LANGUAGE,
  formatCodeLanguageLabel,
  getCodeLanguageOptions,
  normalizeCodeLanguage,
} from "@/lib/monaco-language";

type LanguageSelectProps = {
  id: string;
  value: string;
  onChange: (language: string) => void;
  disabled?: boolean;
};

export function LanguageSelect({
  id,
  value,
  onChange,
  disabled = false,
}: LanguageSelectProps) {
  const selectedLanguage = normalizeCodeLanguage(value);
  const options = getCodeLanguageOptions(selectedLanguage);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Language</Label>
      <Select
        value={selectedLanguage}
        onValueChange={(nextValue) => {
          if (nextValue == null) {
            return;
          }

          onChange(nextValue === DEFAULT_CODE_LANGUAGE ? "" : nextValue);
        }}
        disabled={disabled}
      >
        <SelectTrigger id={id} className="w-fit min-w-40">
          <SelectValue placeholder="Select language">
            {formatCodeLanguageLabel(selectedLanguage)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
