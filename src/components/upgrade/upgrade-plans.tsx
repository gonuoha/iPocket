"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PRICING_PLANS } from "@/lib/marketing/homepage-content";
import { cn } from "@/lib/utils";

type BillingPeriod = "monthly" | "yearly";

export function UpgradePlans() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const [isLoading, setIsLoading] = useState(false);
  const { free, pro } = PRICING_PLANS;

  useEffect(() => {
    if (searchParams.get("checkout") === "cancelled") {
      toast.info("Checkout cancelled. You can upgrade anytime.");
      router.replace("/upgrade");
    }
  }, [router, searchParams]);

  async function handleUpgrade() {
    setIsLoading(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        toast.error(data.error ?? "Checkout failed");
        return;
      }

      window.location.href = data.url;
    } catch {
      toast.error("Checkout failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-8 flex justify-center gap-2">
        <button
          type="button"
          onClick={() => setPeriod("monthly")}
          className={cn(
            "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
            period === "monthly"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          $8 / month
        </button>
        <button
          type="button"
          onClick={() => setPeriod("yearly")}
          className={cn(
            "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
            period === "yearly"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          $72 / year{" "}
          <span className="text-[0.6875rem] opacity-90">Save 25%</span>
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <article className="h-full rounded-2xl border border-border bg-card p-8">
          <h2 className="text-xl font-semibold">{free.name}</h2>
          <div className="mt-2 mb-6">
            <span className="text-4xl font-bold">{free.monthlyPrice}</span>
            <span className="text-muted-foreground">{free.period}</span>
          </div>
          <ul className="space-y-1.5">
            {free.features.map((feature) => (
              <li
                key={feature}
                className="text-[0.9375rem] text-muted-foreground before:font-semibold before:text-green-500 before:content-['✓_']"
              >
                {feature}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted-foreground">Your current plan</p>
        </article>

        <article className="relative h-full rounded-2xl border border-primary bg-card p-8 pt-10 shadow-lg ring-1 ring-primary">
          <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            Most Popular
          </span>
          <h2 className="text-xl font-semibold">{pro.name}</h2>
          <div className="mt-2 mb-6">
            <span className="text-4xl font-bold">
              {period === "yearly" ? pro.yearlyPrice : pro.monthlyPrice}
            </span>
            <span className="text-muted-foreground">
              {period === "yearly" ? pro.yearlyPeriod : pro.monthlyPeriod}
            </span>
          </div>
          <ul className="mb-6 space-y-1.5">
            {pro.features.map((feature) => (
              <li
                key={feature}
                className="text-[0.9375rem] text-muted-foreground before:font-semibold before:text-green-500 before:content-['✓_']"
              >
                {feature}
              </li>
            ))}
          </ul>
          <Button
            type="button"
            className="w-full"
            onClick={handleUpgrade}
            disabled={isLoading}
          >
            {isLoading
              ? "Redirecting..."
              : period === "yearly"
                ? "Upgrade — $72/year"
                : "Upgrade — $8/month"}
          </Button>
        </article>
      </div>
    </div>
  );
}
