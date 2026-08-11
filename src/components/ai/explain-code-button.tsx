import { Crown, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

type ExplainCodeButtonProps = {
  isPro: boolean;
  disabled?: boolean;
  onExplain: () => void;
  onUpgrade?: () => void;
  isLoading?: boolean;
};

export function ExplainCodeButton({
  isPro,
  disabled = false,
  onExplain,
  onUpgrade,
  isLoading = false,
}: ExplainCodeButtonProps) {
  if (!isPro) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="size-7 text-zinc-400 hover:bg-white/10 hover:text-zinc-100"
        onClick={onUpgrade}
        aria-label="AI features require Pro subscription"
        title="AI features require Pro subscription"
      >
        <Crown />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onExplain}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      aria-label="Explain code"
      className="h-7 px-2 text-zinc-400 hover:bg-white/10 hover:text-zinc-100"
    >
      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Sparkles />
      )}
      Explain
    </Button>
  );
}
