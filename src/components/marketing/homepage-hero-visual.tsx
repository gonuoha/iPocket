import { ArrowRight } from "lucide-react";

import { ChaosAnimation } from "@/components/marketing/chaos-animation";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";

export function HomepageHeroVisual() {
  return (
    <div className="mx-auto grid w-full min-w-0 max-w-4xl items-center gap-4 max-[900px]:gap-6 min-[901px]:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
      <div className="min-h-[280px] min-w-0 overflow-hidden rounded-2xl border border-border bg-secondary/50 p-4 max-sm:min-h-[240px]">
        <p className="mb-3 text-xs font-medium tracking-wider text-muted-foreground uppercase">
          Your knowledge today...
        </p>
        <ChaosAnimation />
      </div>

      <div
        className="flex min-w-0 shrink-0 items-center justify-center text-primary motion-safe:animate-[homepage-arrow-pulse_2s_ease-in-out_infinite] max-[900px]:rotate-90"
        aria-hidden="true"
      >
        <ArrowRight className="size-12 shrink-0" strokeWidth={2.5} />
      </div>

      <DashboardPreview className="min-w-0" />
    </div>
  );
}
