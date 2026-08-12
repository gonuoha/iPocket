import { Loader2, Sparkles } from "lucide-react";

import { AiProUpgradeButton } from "@/components/ai/ai-pro-upgrade-button";
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
    return <AiProUpgradeButton onUpgrade={onUpgrade} />;
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
