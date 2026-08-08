import Stripe from "stripe";

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(getRequiredEnv("STRIPE_SECRET_KEY"), {
      apiVersion: "2026-07-29.dahlia",
      typescript: true,
    });
  }

  return stripeInstance;
}

export function getStripePriceId(period: "monthly" | "yearly"): string {
  return period === "yearly"
    ? getRequiredEnv("STRIPE_PRICE_ID_YEARLY")
    : getRequiredEnv("STRIPE_PRICE_ID_MONTHLY");
}
