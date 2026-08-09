import { Button } from "@/components/ui/button";

type SuggestedSummaryProps = {
  summary: string | null;
  onAccept: () => void;
  onReject: () => void;
};

export function SuggestedSummary({
  summary,
  onAccept,
  onReject,
}: SuggestedSummaryProps) {
  if (!summary) {
    return null;
  }

  return (
    <div className="space-y-2 rounded-md border border-border bg-muted/40 p-3">
      <p className="text-sm">{summary}</p>
      <div className="flex items-center gap-2">
        <Button type="button" size="sm" onClick={onAccept}>
          Accept
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onReject}>
          Reject
        </Button>
      </div>
    </div>
  );
}
