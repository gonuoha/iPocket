# Stripe Integration — Phase 1: Core Infrastructure

## Overview

Phase 1 lays the Stripe foundation for Memex Pro ($8/mo, $72/yr). No webhooks, feature gating, or billing UI yet — those ship in Phase 2.

This phase adds the Stripe SDK, server-side client helpers, checkout/portal API routes, JWT `isPro` session sync, and a usage-limits module with unit tests.

## Goals

- Install and configure the Stripe SDK with env-var helpers
- Create checkout and customer-portal API routes (authenticated)
- Sync `isPro` from the database on every JWT validation
- Add a reusable usage-limits module (50 items / 3 collections for free tier)
- Unit-test the usage-limits module

## Prerequisites

- Existing `User` model fields: `isPro`, `stripeCustomerId`, `stripeSubscriptionId` (no migration needed)
- Env vars already declared in `.env.example`:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_PUBLISHABLE_KEY` (not required for Checkout redirect flow)
  - `STRIPE_WEBHOOK_SECRET` (used in Phase 2)
  - `STRIPE_PRICE_ID_MONTHLY`
  - `STRIPE_PRICE_ID_YEARLY`
- Stripe Dashboard: create **Memex Pro** product with monthly ($8) and yearly ($72) prices before testing checkout

## Requirements

### 1. Install Stripe SDK

```bash
npm install stripe
```

### 2. Stripe Client — `src/lib/stripe/client.ts`

- Singleton `getStripe()` following the `src/lib/r2/client.ts` `getRequiredEnv()` pattern
- `getStripePriceId(period: "monthly" | "yearly")` helper
- Pin Stripe API version at install time

### 3. Subscription Helpers — `src/lib/stripe/subscription.ts`

| Function | Purpose |
|----------|---------|
| `getOrCreateStripeCustomer(userId, email)` | Return existing `stripeCustomerId` or create Stripe customer with `metadata.userId` |
| `createCheckoutSession(userId, email, period)` | Subscription-mode Checkout; success → `/settings?checkout=success`, cancel → `/settings?checkout=cancelled` |
| `createPortalSession(stripeCustomerId)` | Billing Portal session; return URL → `/settings` |

Checkout session must include:

- `metadata.userId` on the session
- `subscription_data.metadata.userId` on the subscription (needed for Phase 2 webhooks)
- `line_items` using the correct price ID for the selected period

Use `getAppUrl()` from `src/lib/app-url.ts` for redirect URLs.

### 4. Checkout API Route — `src/app/api/stripe/checkout/route.ts`

`POST /api/stripe/checkout`

- Auth required (`auth()` → 401)
- Body: `{ period: "monthly" | "yearly" }` validated with Zod
- Returns `{ url: string }` on success
- Returns 400 for invalid period, 500 on Stripe failure

### 5. Portal API Route — `src/app/api/stripe/portal/route.ts`

`POST /api/stripe/portal`

- Auth required
- Load `stripeCustomerId` from database
- Returns 400 if no customer ID
- Returns `{ url: string }` on success

### 6. JWT Session Sync — `src/auth.ts` + `src/types/next-auth.d.ts`

Add `isPro` to JWT and session. On every JWT callback validation, sync from database:

```typescript
if (token.sub) {
  const dbUser = await prisma.user.findUnique({
    where: { id: token.sub },
    select: { isPro: true },
  });
  token.isPro = dbUser?.isPro ?? false;
}
```

Map `token.isPro` → `session.user.isPro` in the session callback.

Extend type declarations:

- `Session.user.isPro: boolean`
- `JWT.isPro?: boolean`

Do **not** use `trigger === "update"` — always sync from DB so webhook updates (Phase 2) are picked up after page reload.

### 7. Usage Limits Module — `src/lib/subscription-limits.ts`

```typescript
export const FREE_ITEM_LIMIT = 50;
export const FREE_COLLECTION_LIMIT = 3;

export function isAtItemLimit(count: number, isPro: boolean): boolean;
export function isAtCollectionLimit(count: number, isPro: boolean): boolean;
```

- Pro users are never at limit
- Free users at limit when `count >= FREE_*_LIMIT`

Not wired into server actions yet — Phase 2 consumes this module.

## Files to Create

| File | Description |
|------|-------------|
| `src/lib/stripe/client.ts` | Stripe singleton + env helpers |
| `src/lib/stripe/subscription.ts` | Customer, checkout, portal helpers |
| `src/lib/subscription-limits.ts` | Free-tier limit constants and helpers |
| `src/lib/subscription-limits.test.ts` | Unit tests for usage-limits module |
| `src/app/api/stripe/checkout/route.ts` | Checkout session API |
| `src/app/api/stripe/portal/route.ts` | Customer portal API |

## Files to Modify

| File | Change |
|------|--------|
| `package.json` | Add `stripe` dependency |
| `src/auth.ts` | JWT + session `isPro` sync |
| `src/types/next-auth.d.ts` | Extend Session and JWT types |

## Unit Tests — `src/lib/subscription-limits.test.ts`

Co-locate with source. Cover:

| Case | Expected |
|------|----------|
| `isAtItemLimit(49, false)` | `false` |
| `isAtItemLimit(50, false)` | `true` |
| `isAtItemLimit(51, false)` | `true` |
| `isAtItemLimit(50, true)` | `false` (Pro bypasses limit) |
| `isAtCollectionLimit(2, false)` | `false` |
| `isAtCollectionLimit(3, false)` | `true` |
| `isAtCollectionLimit(4, false)` | `true` |
| `isAtCollectionLimit(3, true)` | `false` |
| `FREE_ITEM_LIMIT` equals `50` | constant assertion |
| `FREE_COLLECTION_LIMIT` equals `3` | constant assertion |

Run with `npm test`.

## Manual Testing (Phase 1)

No Stripe CLI required for Phase 1.

1. Set test-mode Stripe keys and price IDs in `.env`
2. Sign in as a free user
3. Call checkout API (or use a temporary test button):
   ```bash
   curl -X POST http://localhost:3000/api/stripe/checkout \
     -H "Content-Type: application/json" \
     -H "Cookie: <session-cookie>" \
     -d '{"period":"monthly"}'
   ```
4. Verify response contains a Stripe Checkout URL
5. Complete checkout in Stripe test mode — `isPro` will **not** update yet (webhooks are Phase 2)
6. Verify JWT session includes `isPro` after manually setting it in the database and reloading

## Out of Scope (Phase 2)

- Webhook route and handlers
- `isPro` updates from Stripe events
- Free-tier enforcement in `createItem` / `createCollection`
- Billing UI (`BillingCard`, `UpgradePrompt`)
- Profile/settings usage display
- Account deletion subscription cancellation
- Stripe CLI setup

## Notes

- Webhooks are the source of truth for `isPro` changes — implemented in Phase 2
- `STRIPE_PUBLISHABLE_KEY` is only needed if using Stripe.js client-side; Checkout redirect does not require it
- Reject or redirect Pro users who hit checkout while already subscribed (can defer to Phase 2 UI guard)
- Existing file-upload Pro gating (`src/actions/items.ts`, upload route) is unchanged

## References

- @docs/stripe-integration-plan.md
- @context/features/stripe-phase-2-spec.md
- @context/project-overview.md (Monetization section)
- @src/lib/r2/client.ts (env helper pattern)
- @src/lib/app-url.ts (redirect URL base)
