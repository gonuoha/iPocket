import { beforeEach, describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      update: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";

import {
  handleCheckoutCompleted,
  handleSubscriptionDeleted,
  handleSubscriptionUpdated,
} from "./webhook-handlers";

const mockUserUpdate = vi.mocked(prisma.user.update);

describe("stripe webhook handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserUpdate.mockResolvedValue({} as never);
  });

  describe("handleCheckoutCompleted", () => {
    it("sets isPro and stores Stripe IDs", async () => {
      await handleCheckoutCompleted({
        metadata: { userId: "user-1" },
        customer: "cus_123",
        subscription: "sub_123",
      } as Stripe.Checkout.Session);

      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: {
          isPro: true,
          stripeCustomerId: "cus_123",
          stripeSubscriptionId: "sub_123",
        },
      });
    });

    it("no-ops when userId metadata is missing", async () => {
      await handleCheckoutCompleted({
        customer: "cus_123",
        subscription: "sub_123",
      } as Stripe.Checkout.Session);

      expect(mockUserUpdate).not.toHaveBeenCalled();
    });
  });

  describe("handleSubscriptionUpdated", () => {
    it.each(["active", "trialing"] as const)(
      "sets isPro to true for %s status",
      async (status) => {
        await handleSubscriptionUpdated({
          id: "sub_123",
          metadata: { userId: "user-1" },
          status,
        } as Stripe.Subscription);

        expect(mockUserUpdate).toHaveBeenCalledWith({
          where: { id: "user-1" },
          data: {
            isPro: true,
            stripeSubscriptionId: "sub_123",
          },
        });
      },
    );

    it.each(["past_due", "canceled", "unpaid"] as const)(
      "sets isPro to false for %s status",
      async (status) => {
        await handleSubscriptionUpdated({
          id: "sub_123",
          metadata: { userId: "user-1" },
          status,
        } as Stripe.Subscription);

        expect(mockUserUpdate).toHaveBeenCalledWith({
          where: { id: "user-1" },
          data: {
            isPro: false,
            stripeSubscriptionId: "sub_123",
          },
        });
      },
    );

    it("no-ops when userId metadata is missing", async () => {
      await handleSubscriptionUpdated({
        id: "sub_123",
        status: "active",
      } as Stripe.Subscription);

      expect(mockUserUpdate).not.toHaveBeenCalled();
    });
  });

  describe("handleSubscriptionDeleted", () => {
    it("revokes pro access and clears subscription ID", async () => {
      await handleSubscriptionDeleted({
        id: "sub_123",
        metadata: { userId: "user-1" },
      } as Stripe.Subscription);

      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: {
          isPro: false,
          stripeSubscriptionId: null,
        },
      });
    });

    it("no-ops when userId metadata is missing", async () => {
      await handleSubscriptionDeleted({
        id: "sub_123",
      } as Stripe.Subscription);

      expect(mockUserUpdate).not.toHaveBeenCalled();
    });
  });
});
