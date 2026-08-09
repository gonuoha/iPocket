"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FREE_COLLECTION_LIMIT,
  FREE_ITEM_LIMIT,
} from "@/lib/subscription-limits";

type BillingCardProps = {
  isPro: boolean;
  stripeCustomerId: string | null;
  itemCount: number;
  collectionCount: number;
};

export function BillingCard({
  isPro,
  stripeCustomerId,
  itemCount,
  collectionCount,
}: BillingCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkout = searchParams.get("checkout");

    if (checkout === "success") {
      toast.success("Welcome to iPocket Pro! Your subscription is now active.");
    } else if (checkout === "cancelled") {
      toast.info("Checkout cancelled. You can upgrade anytime from settings.");
    }

    if (checkout) {
      router.replace("/settings");
    }
  }, [router, searchParams]);

  async function handleManageSubscription() {
    setIsLoading(true);

    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        toast.error(data.error ?? "Unable to open billing portal");
        return;
      }

      window.location.href = data.url;
    } catch {
      toast.error("Unable to open billing portal");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Billing</h2>
        <Badge variant={isPro ? "default" : "outline"}>
          {isPro ? "Pro" : "Free"}
        </Badge>
      </div>

      {!isPro ? (
        <>
          <p className="mt-1 text-sm text-muted-foreground">
            Upgrade to Pro for unlimited items, collections, file uploads, and more.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-sm text-muted-foreground">Items</p>
              <p className="text-2xl font-semibold tabular-nums">
                {itemCount}
                <span className="text-base font-normal text-muted-foreground">
                  {" "}
                  / {FREE_ITEM_LIMIT}
                </span>
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-sm text-muted-foreground">Collections</p>
              <p className="text-2xl font-semibold tabular-nums">
                {collectionCount}
                <span className="text-base font-normal text-muted-foreground">
                  {" "}
                  / {FREE_COLLECTION_LIMIT}
                </span>
              </p>
            </div>
          </div>

          <Button
            type="button"
            className="mt-4"
            nativeButton={false}
            render={<Link href="/upgrade" />}
          >
            Upgrade to Pro
          </Button>
        </>
      ) : (
        <>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your subscription, payment method, and billing details.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={handleManageSubscription}
            disabled={isLoading || !stripeCustomerId}
          >
            {isLoading ? "Opening..." : "Manage subscription"}
          </Button>
        </>
      )}
    </div>
  );
}
