import type Stripe from "stripe";

import { prisma } from "@/lib/prisma";

export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const userId = session.metadata?.userId;
  const customerId = session.customer as string | null;
  const subscriptionId = session.subscription as string | null;

  if (!userId || !customerId || !subscriptionId) {
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      isPro: true,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
    },
  });
}

export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
): Promise<void> {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    return;
  }

  const isActive = subscription.status === "active" || subscription.status === "trialing";

  await prisma.user.update({
    where: { id: userId },
    data: {
      isPro: isActive,
      stripeSubscriptionId: subscription.id,
    },
  });
}

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
): Promise<void> {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      isPro: false,
      stripeSubscriptionId: null,
    },
  });
}
