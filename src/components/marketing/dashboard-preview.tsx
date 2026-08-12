import {
  DASHBOARD_MOCK_CARDS,
  SYSTEM_ITEM_TYPE_COLORS,
} from "@/lib/marketing/homepage-content";
import { cn } from "@/lib/utils";

const MOCK_NAV_ITEMS = [
  { label: "Dashboard", active: true },
  { label: "Snippets", active: false },
  { label: "Prompts", active: false },
  { label: "Commands", active: false },
  { label: "Collections", active: false },
] as const;

export function DashboardPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "min-h-[280px] min-w-0 overflow-hidden rounded-2xl border border-border bg-secondary/50 p-4",
        className,
      )}
    >
      <p className="mb-3 text-xs font-medium tracking-wider text-muted-foreground uppercase">
        ...with Memex
      </p>
      <div className="flex h-[220px] overflow-hidden rounded-lg border border-border bg-card">
        <aside className="w-[28%] min-w-20 border-r border-border bg-background p-3">
          <div className="mb-3 text-[0.65rem] font-semibold text-primary">
            Memex
          </div>
          <nav className="flex flex-col gap-1">
            {MOCK_NAV_ITEMS.map((item) => (
              <span
                key={item.label}
                className={
                  item.active
                    ? "rounded bg-secondary px-2 py-1 text-[0.6rem] text-foreground"
                    : "px-2 py-1 text-[0.6rem] text-muted-foreground"
                }
              >
                {item.label}
              </span>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 flex-1 overflow-hidden p-2">
          <div className="grid grid-cols-2 gap-1.5">
            {DASHBOARD_MOCK_CARDS.map((card) => (
              <div
                key={card.title}
                className="rounded-md bg-secondary px-2 py-1.5 text-[0.55rem]"
                style={{
                  borderTop: `2px solid ${SYSTEM_ITEM_TYPE_COLORS[card.type]}`,
                }}
              >
                <span className="block font-medium leading-tight text-foreground">
                  {card.title}
                </span>
                <span className="text-[0.5rem] text-muted-foreground">
                  {card.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
