# Current Feature: Email Verification on Register

## Status

In Progress

## Goals

- Send a verification email via Resend when a user registers with email/password
- Generate a secure, expiring verification token and store it (use existing `VerificationToken` model)
- Include a clickable verification link in the email that confirms the user's address
- Create a verification route/page (e.g. `/verify-email` or API handler) that validates the token and sets `User.emailVerified`
- Block credentials sign-in until `emailVerified` is set
- Update register UX to show a "check your email" confirmation instead of redirecting straight to sign-in
- Add Resend client using `RESEND_API_KEY` from environment
- Document any additional env vars needed (e.g. sender address) in `.env.example`
- Ensure GitHub OAuth users are treated as verified (or set `emailVerified` on first OAuth sign-in)
- Handle expired/invalid tokens with clear error messaging

## Notes

Inline feature request — verify email on register using Resend. `RESEND_API_KEY` is configured in `.env`.

**Existing schema support:**
- `User.emailVerified` (`DateTime?`) — set on successful verification
- `VerificationToken` model — available for token storage (identifier + token + expires)

**Current register flow:** `POST /api/auth/register` creates user immediately with no verification step.

**Likely changes:**
- `src/app/api/auth/register/route.ts` — create user with `emailVerified: null`, send Resend email
- New verification handler — validate token, update user, delete/consume token
- `src/auth.ts` — reject credentials login if `emailVerified` is null
- `src/components/auth/register-form.tsx` — post-register "check your email" state
- `src/lib/email/` or `src/lib/resend.ts` — Resend integration
- Install `resend` package

**Testing:**
1. Register new account → receive verification email
2. Click link → `emailVerified` set, success message
3. Sign in with credentials before verify → blocked with clear error
4. Sign in after verify → works
5. GitHub sign-in still works

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
