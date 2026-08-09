"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { FadeInOnScroll } from "@/components/marketing/fade-in-on-scroll";
import { buttonVariants } from "@/components/ui/button";
import { PRICING_PLANS } from "@/lib/marketing/homepage-content";
import { cn } from "@/lib/utils";

type BillingPeriod = "monthly" | "yearly";

type HomepagePricingProps = {
  isLoggedIn: boolean;
  isPro: boolean;
};

export function HomepagePricing({ isLoggedIn, isPro }: HomepagePricingProps) {
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const [isLoading, setIsLoading] = useState(false);
  const { free, pro } = PRICING_PLANS;

  async function handleProCheckout() {
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
      <button
        type="button"
        className={cn(buttonVariants({ variant: pro.variant }), "w-full")}
        onClick={handleProCheckout}
        disabled={isLoading}
      >
        {isLoading ? "Redirecting..." : pro.cta}
      </button>
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
                href={isLoggedIn ? "/dashboard" : "/register"}
                className={cn(buttonVariants({ variant: free.variant }), "w-full")}
              >
                {isLoggedIn ? "Go to Dashboard" : free.cta}
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
              {renderProCta()}
            </article>
          </FadeInOnScroll>
        </div>
      </div>
    </section>
  );
}
