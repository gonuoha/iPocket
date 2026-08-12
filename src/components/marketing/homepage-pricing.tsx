"use client";

import Link from "next/link";
import { useState } from "react";

import { FadeInOnScroll } from "@/components/marketing/fade-in-on-scroll";
import {
  BillingPeriodToggle,
  PricingPlanCard,
  type BillingPeriod,
} from "@/components/shared/pricing-plans";
import { buttonVariants } from "@/components/ui/button";
import { PRICING_PLANS } from "@/lib/marketing/homepage-content";
import { cn } from "@/lib/utils";

type HomepagePricingProps = {
  isLoggedIn: boolean;
  isPro: boolean;
};

export function HomepagePricing({ isLoggedIn, isPro }: HomepagePricingProps) {
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const { free, pro } = PRICING_PLANS;

  function renderProCta() {
    if (!isLoggedIn) {
      return (
        <Link
          href="/register"
          className={cn(buttonVariants({ variant: pro.variant }), "w-full")}
        >
          {pro.cta}
        </Link>
      );
    }

    if (isPro) {
      return (
        <Link
          href="/settings"
          className={cn(buttonVariants({ variant: pro.variant }), "w-full")}
        >
          Manage subscription
        </Link>
      );
    }

    return (
      <Link
        href="/upgrade"
        className={cn(buttonVariants({ variant: pro.variant }), "w-full")}
      >
        {pro.cta}
      </Link>
    );
  }

  return (
    <section id="pricing" className="scroll-mt-20 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <FadeInOnScroll className="mx-auto mb-12 max-w-xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Start free. Upgrade when you need more power.
          </p>
        </FadeInOnScroll>

        <FadeInOnScroll className="mb-8">
          <BillingPeriodToggle period={period} onPeriodChange={setPeriod} />
        </FadeInOnScroll>

        <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
          <FadeInOnScroll>
            <PricingPlanCard
              name={free.name}
              price={free.monthlyPrice}
              period={free.period}
              features={free.features}
              footer={
                <Link
                  href={isLoggedIn ? "/dashboard" : "/register"}
                  className={cn(buttonVariants({ variant: free.variant }), "w-full")}
                >
                  {isLoggedIn ? "Go to Dashboard" : free.cta}
                </Link>
              }
            />
          </FadeInOnScroll>

          <FadeInOnScroll className="mt-4 sm:mt-0">
            <PricingPlanCard
              name={pro.name}
              price={period === "yearly" ? pro.yearlyPrice : pro.monthlyPrice}
              period={period === "yearly" ? pro.yearlyPeriod : pro.monthlyPeriod}
              features={pro.features}
              highlighted
              footer={renderProCta()}
            />
          </FadeInOnScroll>
        </div>
      </div>
    </section>
  );
}
