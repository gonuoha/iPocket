import { Check, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type SuggestedTagsProps = {
  tags: string[];
  onAccept: (tag: string) => void;
  onReject: (tag: string) => void;
  onDismiss: () => void;
};

export function SuggestedTags({
  tags,
  onAccept,
  onReject,
  onDismiss,
}: SuggestedTagsProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="gap-1 pr-1 font-normal"
          >
            {tag}
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="size-5"
              onClick={() => onAccept(tag)}
              aria-label={`Accept tag ${tag}`}
            >
              <Check />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="size-5"
              onClick={() => onReject(tag)}
              aria-label={`Reject tag ${tag}`}
            >
              <X />
            </Button>
          </Badge>
        ))}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-auto px-0 text-muted-foreground"
        onClick={onDismiss}
      >
        Dismiss all
      </Button>
    </div>
  );
}
