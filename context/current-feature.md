# Current Feature: Forgot Password

## Status

In Progress

## Goals

- Add a "Forgot password?" link on the sign-in page pointing to `/forgot-password`
- Create a forgot-password page with email input and submit flow
- Create `POST /api/auth/forgot-password` to request a password reset
- Store reset tokens in the existing `VerificationToken` model (use a distinct identifier prefix, e.g. `password-reset:{email}`, to avoid clashing with email verification tokens)
- Send a password reset email via Resend with a link to `/reset-password?token=...`
- Create a reset-password page where the user sets a new password (with confirm)
- Create `POST /api/auth/reset-password` to validate token, hash new password with bcrypt, update user, and consume the token
- Handle expired/invalid/used tokens with clear error messaging
- Always return a generic success message on forgot-password request (do not reveal whether the email exists)
- Only send reset emails for credentials users (accounts with a password); OAuth-only accounts get the same generic response
- Redirect to sign-in with a success message after password reset
- Respect `SKIP_EMAIL_VERIFICATION` only where relevant; password reset emails should still require Resend to be configured

## Notes

Inline feature request — forgot password flow using the existing `VerificationToken` model.

**Existing patterns to reuse:**
- `VerificationToken` model (`identifier`, `token`, `expires`) — already used for email verification with `identifier = email`
- `src/lib/email/send-verification-email.ts` — Resend email pattern
- `src/lib/email/verification.ts` — token create/validate/consume pattern
- `src/app/(auth)/verify-email/page.tsx` — auth page layout via `AuthCard`
- bcrypt hashing in register route

**Token strategy:**
- Use namespaced identifier: `password-reset:{email}` so reset tokens don't collide with email verification tokens on the same address
- Shorter expiry recommended for reset tokens (e.g. 1 hour vs 24 hours for verification)

**Likely changes:**
- `src/lib/email/password-reset.ts` — create/validate/consume reset tokens
- `src/lib/email/send-password-reset-email.ts` — Resend email with reset link
- `src/app/api/auth/forgot-password/route.ts` — request reset
- `src/app/api/auth/reset-password/route.ts` — set new password
- `src/app/(auth)/forgot-password/page.tsx` + form component
- `src/app/(auth)/reset-password/page.tsx` + form component
- `src/components/auth/sign-in-form.tsx` — add forgot password link
- `src/proxy.ts` — add auth pages to matcher if needed (for logged-in redirect)

**Testing:**
1. Click "Forgot password?" on sign-in → forgot-password page loads
2. Submit email for credentials user → generic success, reset email received
3. Submit email for unknown/OAuth-only user → same generic success, no email sent
4. Click reset link → reset-password page with token
5. Set new password → success, sign in with new password works
6. Expired/invalid token → clear error
7. Old password no longer works after reset

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
