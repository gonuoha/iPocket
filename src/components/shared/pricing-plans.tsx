"use client";

import { cn } from "@/lib/utils";

export type BillingPeriod = "monthly" | "yearly";

type BillingPeriodToggleProps = {
  period: BillingPeriod;
  onPeriodChange: (period: BillingPeriod) => void;
  monthlyLabel?: string;
  yearlyLabel?: string;
  className?: string;
};

export function BillingPeriodToggle({
  period,
  onPeriodChange,
  monthlyLabel = "Monthly",
  yearlyLabel = "Yearly",
  className,
}: BillingPeriodToggleProps) {
  return (
    <div className={cn("flex flex-wrap justify-center gap-2", className)}>
      <button
        type="button"
        onClick={() => onPeriodChange("monthly")}
        className={cn(
          "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
          period === "monthly"
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-card text-muted-foreground hover:text-foreground",
        )}
      >
        {monthlyLabel}
      </button>
      <button
        type="button"
        onClick={() => onPeriodChange("yearly")}
        className={cn(
          "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
          period === "yearly"
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-card text-muted-foreground hover:text-foreground",
        )}
      >
        {yearlyLabel}{" "}
        <span className="text-[0.6875rem] opacity-90">Save 25%</span>
      </button>
    </div>
  );
}

export function PricingFeatureList({ features }: { features: string[] }) {
  return (
    <ul className="space-y-1.5">
      {features.map((feature) => (
        <li
          key={feature}
          className="text-[0.9375rem] text-muted-foreground before:font-semibold before:text-green-500 before:content-['✓_']"
        >
          {feature}
        </li>
      ))}
    </ul>
  );
}

type PricingPlanCardProps = {
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
  footer?: React.ReactNode;
  className?: string;
};

export function PricingPlanCard({
  name,
  price,
  period,
  features,
  highlighted = false,
  footer,
  className,
}: PricingPlanCardProps) {
  return (
    <article
      className={cn(
        "relative h-full rounded-2xl border bg-card p-8",
        highlighted
          ? "border-primary pt-10 shadow-lg ring-1 ring-primary"
          : "border-border",
        className,
      )}
    >
      {highlighted ? (
        <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
          Most Popular
        </span>
      ) : null}
      <h3 className="text-xl font-semibold">{name}</h3>
      <div className="mt-2 mb-6">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-muted-foreground">{period}</span>
      </div>
      <PricingFeatureList features={features} />
      {footer ? <div className="mt-6">{footer}</div> : null}
    </article>
  );
}
