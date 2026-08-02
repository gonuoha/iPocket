# Current Feature: Rate Limiting for Auth

## Status

In Progress

## Goals

- Add rate limiting to auth-related API routes to prevent brute force, credential stuffing, and email abuse
- Create reusable `src/lib/rate-limit.ts` utility using Upstash Redis and `@upstash/ratelimit` (sliding window)
- Protect login (5/15min, IP+email), register (3/hr, IP), forgot-password (3/hr, IP), reset-password (5/15min, IP), and resend-verification (3/15min, IP+email)
- Return 429 responses with JSON error, `Retry-After` header, and user-friendly toast messages on the frontend
- Fail open if Upstash is unavailable; extract IP from `x-forwarded-for` or request

## Notes

- Upstash free tier allows 10k requests/day (sufficient for auth limiting)
- Login limiting is tricky with NextAuth credentials — may need a custom sign-in handler
- Rate limit checks should return `{ success, remaining, reset }`
- Env vars required: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- Consider adding rate limiting middleware for cleaner implementation later

## History

- 2026-07-30: Completed **Dashboard UI Phase 1** — shadcn/ui init (button, input), `/dashboard` route, dark mode by default, top bar with search and New Item button (display only), sidebar and main placeholders
- 2026-07-30: Completed **Dashboard UI Phase 2** — collapsible sidebar with item types and collections, mobile drawer, single sidebar search, main header layout, user profile at bottom
- 2026-07-30: Started Dashboard UI Phase 3
- 2026-07-30: Completed **Dashboard UI Phase 3** — main area with stats cards, collections grid, pinned items, and 10 recent items
- 2026-07-31: Started **Prisma + PostgreSQL Setup**
- 2026-07-31: Completed **Prisma + PostgreSQL Setup** — Prisma 7 with PostgreSQL, initial schema, NextAuth models, Docker Compose, migrations, seed for system item types
- 2026-07-31: Started **Seed Data**
- 2026-07-31: Completed **Seed Data** — demo user, system item types, 5 collections, 18 sample items, bcrypt password hashing, ESLint eol-last rule
- 2026-07-31: Started **Dashboard Collections**
- 2026-07-31: Completed **Dashboard Collections** — real collection data and stats from Prisma, dominant type border colors, type badges on cards
- 2026-07-31: Started **Dashboard Items**
- 2026-07-31: Completed **Dashboard Items** — pinned and recent items from Prisma, type-derived icon and border styling, tag display
- 2026-07-31: Started **Stats & Sidebar**
- 2026-07-31: Completed **Stats & Sidebar** — dashboard stats and sidebar from Prisma (item types, favorite/recent collections, nav counts, user profile)
- 2026-08-01: Started **Add Pro Badge to Sidebar**
- 2026-08-01: Completed **Add Pro Badge to Sidebar** — PRO badge on File and Image item types in sidebar using shadcn Badge, subtle outline styling
- 2026-08-01: Completed **Dashboard Performance & Data Layer Cleanup** — groupBy collection aggregation, cached dashboard data fetches, pinned items limit, server-rendered sidebar with client wrappers, demo-user error UI
- 2026-08-01: Completed **Auth Setup - NextAuth + GitHub Provider** — NextAuth v5 with GitHub OAuth, Prisma adapter, JWT sessions, API route, and proxy protection for dashboard routes
- 2026-08-02: Completed **Auth Credentials - Email/Password Provider** — Credentials provider with bcrypt validation, registration API, split config placeholder, GitHub OAuth preserved
- 2026-08-02: Completed **Auth UI - Sign In, Register & Sign Out** — custom sign-in/register pages, UserAvatar component, sidebar dropdown with sign out, profile page, session-based user loading
- 2026-08-02: Completed **Email Verification on Register** — Resend verification emails on sign-up, `/verify-email` token flow, credentials login blocked until verified, GitHub OAuth auto-verified
- 2026-08-02: Completed **Email Verification Toggle** — `SKIP_EMAIL_VERIFICATION` env flag to bypass verification in local dev, register/auth/UI branch on flag
- 2026-08-02: Completed **Forgot Password** — forgot/reset password pages, Resend reset emails via namespaced VerificationToken, generic forgot-password response, sign-in success redirect
- 2026-08-02: Completed **Profile Page** — account info with avatar and member date, usage stats with per-type breakdown, change password for credentials users, delete account with centered confirmation dialog, inline item type display in sidebar
- 2026-08-02: Completed **Profile Action Feedback & Safer Account Deletion** — Sonner toasts for password change success/errors, typed DELETE confirmation before account deletion, consistent item type ordering in sidebar and profile
