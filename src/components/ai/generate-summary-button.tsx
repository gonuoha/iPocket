import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

type GenerateSummaryButtonProps = {
  isPro: boolean;
  disabled?: boolean;
  onGenerate: () => void;
  isLoading?: boolean;
};

export function GenerateSummaryButton({
  isPro,
  disabled = false,
  onGenerate,
  isLoading = false,
}: GenerateSummaryButtonProps) {
  if (!isPro) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={onGenerate}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      aria-label="Generate summary"
      title="Generate summary"
      className="shrink-0"
    >
      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Sparkles />
      )}
    </Button>
  );
}
