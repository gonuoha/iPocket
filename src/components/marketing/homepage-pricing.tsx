"use client";

import Link from "next/link";
import { useState } from "react";

import { FadeInOnScroll } from "@/components/marketing/fade-in-on-scroll";
import { buttonVariants } from "@/components/ui/button";
import { PRICING_PLANS } from "@/lib/marketing/homepage-content";
import { cn } from "@/lib/utils";

type BillingPeriod = "monthly" | "yearly";

export function HomepagePricing() {
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const { free, pro } = PRICING_PLANS;

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

        <FadeInOnScroll className="mb-8 flex justify-center gap-2">
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
            Monthly
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
            Yearly <span className="text-[0.6875rem] opacity-90">Save 25%</span>
          </button>
        </FadeInOnScroll>

        <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
          <FadeInOnScroll>
            <article className="h-full rounded-2xl border border-border bg-card p-8">
              <h3 className="text-xl font-semibold">{free.name}</h3>
              <div className="mt-2 mb-6">
                <span className="text-4xl font-bold">{free.monthlyPrice}</span>
                <span className="text-muted-foreground">{free.period}</span>
              </div>
              <ul className="mb-6 space-y-1.5">
                {free.features.map((feature) => (
                  <li
                    key={feature}
                    className="text-[0.9375rem] text-muted-foreground before:font-semibold before:text-green-500 before:content-['✓_']"
                  >
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={cn(buttonVariants({ variant: free.variant }), "w-full")}
              >
                {free.cta}
              </Link>
            </article>
          </FadeInOnScroll>

          <FadeInOnScroll className="mt-4 sm:mt-0">
            <article className="relative h-full rounded-2xl border border-primary bg-card p-8 pt-10 shadow-lg ring-1 ring-primary">
              <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                Most Popular
              </span>
              <h3 className="text-xl font-semibold">{pro.name}</h3>
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
              <Link
                href="/register"
                className={cn(buttonVariants({ variant: pro.variant }), "w-full")}
              >
                {pro.cta}
              </Link>
            </article>
          </FadeInOnScroll>
        </div>
      </div>
    </section>
  );
}
