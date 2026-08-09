"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/layout/page-container";

type BillingPeriod = "monthly" | "yearly";

type ProFeatureUpgradeProps = {
  feature: "files" | "images";
};

const COPY: Record<
  ProFeatureUpgradeProps["feature"],
  { title: string; description: string }
> = {
  files: {
    title: "Files are a Pro feature",
    description:
      "Store and organize documents, templates, and other files in iPocket. Upgrade to Pro to unlock file uploads.",
  },
  images: {
    title: "Images are a Pro feature",
    description:
      "Upload and browse images in a gallery view. Upgrade to Pro to unlock image uploads.",
  },
};

export function ProFeatureUpgrade({ feature }: ProFeatureUpgradeProps) {
  const [loadingPeriod, setLoadingPeriod] = useState<BillingPeriod | null>(null);
  const copy = COPY[feature];
  const isLoading = loadingPeriod !== null;

  async function handleUpgrade(period: BillingPeriod) {
    setLoadingPeriod(period);

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
      setLoadingPeriod(null);
    }
  }

  return (
    <PageContainer>
      <PageHeader title={copy.title} description={copy.description} />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() => handleUpgrade("monthly")}
          disabled={isLoading}
        >
          {loadingPeriod === "monthly" ? "Redirecting..." : "Upgrade $8/mo"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleUpgrade("yearly")}
          disabled={isLoading}
        >
          {loadingPeriod === "yearly"
            ? "Redirecting..."
            : "Upgrade $72/yr (save 25%)"}
        </Button>
      </div>
    </PageContainer>
  );
}
