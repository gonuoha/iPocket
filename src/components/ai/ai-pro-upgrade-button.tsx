import { Crown } from "lucide-react";

import { Button } from "@/components/ui/button";

type AiProUpgradeButtonProps = {
  onUpgrade?: () => void;
};

export function AiProUpgradeButton({ onUpgrade }: AiProUpgradeButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      className="size-7"
      onClick={onUpgrade}
      aria-label="AI features require Pro subscription"
      title="AI features require Pro subscription"
    >
      <Crown />
    </Button>
  );
}
