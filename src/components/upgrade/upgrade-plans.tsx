"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import {
  BillingPeriodToggle,
  PricingPlanCard,
  type BillingPeriod,
} from "@/components/shared/pricing-plans";
import { Button } from "@/components/ui/button";
import { PRICING_PLANS } from "@/lib/marketing/homepage-content";

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
      <BillingPeriodToggle
        period={period}
        onPeriodChange={setPeriod}
        monthlyLabel="$8 / month"
        yearlyLabel="$72 / year"
        className="mb-8"
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <PricingPlanCard
          name={free.name}
          price={free.monthlyPrice}
          period={free.period}
          features={free.features}
          footer={
            <p className="text-sm text-muted-foreground">Your current plan</p>
          }
        />

        <PricingPlanCard
          name={pro.name}
          price={period === "yearly" ? pro.yearlyPrice : pro.monthlyPrice}
          period={period === "yearly" ? pro.yearlyPeriod : pro.monthlyPeriod}
          features={pro.features}
          highlighted
          footer={
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
          }
        />
      </div>
    </div>
  );
}
