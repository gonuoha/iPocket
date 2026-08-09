import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

type SuggestTagsButtonProps = {
  isPro: boolean;
  disabled?: boolean;
  onSuggest: () => void;
  isLoading?: boolean;
};

export function SuggestTagsButton({
  isPro,
  disabled = false,
  onSuggest,
  isLoading = false,
}: SuggestTagsButtonProps) {
  if (!isPro) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onSuggest}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className="shrink-0"
    >
      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Sparkles />
      )}
      Suggest Tags
    </Button>
  );
}
