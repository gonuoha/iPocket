# Current Feature: Email Verification Toggle

## Status

In Progress

## Goals

- Add an environment variable to skip email verification (`SKIP_EMAIL_VERIFICATION`, default `false` — verification on unless explicitly skipped)
- When disabled: register creates user with `emailVerified` set immediately, no Resend email sent
- When disabled: credentials sign-in does not block unverified users
- When enabled: preserve current behavior (send verification email, block sign-in until verified)
- Centralize the flag in a small helper (e.g. `src/lib/email/config.ts`) so register route and auth callbacks stay in sync
- Document the env var in `.env.example` with a short comment explaining when to enable
- Update register API response so the UI can show the correct post-register state (verify email vs sign in)
- Update register form to handle both flows based on API response

## Notes

Inline feature request — without a Resend domain linked, only Resend sandbox addresses can receive verification emails. Need an easy toggle to disable verification during local/dev work.

**Recommended approach:** `SKIP_EMAIL_VERIFICATION=true|false`

- Defaults to `false` (verification enabled); set to `true` to skip during local/dev work
- No DB migration needed — when disabled, set `emailVerified: new Date()` on register
- GitHub OAuth auto-verify behavior can stay as-is (harmless when verification is off)

**Likely changes:**
- `src/lib/email/config.ts` — `isEmailVerificationEnabled()` helper
- `src/app/api/auth/register/route.ts` — branch on flag; return `{ success: true, verificationRequired: boolean }`
- `src/auth.ts` — skip credentials `emailVerified` check when flag is off
- `src/components/auth/register-form.tsx` — redirect to sign-in when verification not required
- `.env.example` — add `SKIP_EMAIL_VERIFICATION=false`

**Testing:**
1. `SKIP_EMAIL_VERIFICATION=true` → register any email → sign in immediately
2. `SKIP_EMAIL_VERIFICATION=false` (or unset) → register → verification email sent, sign-in blocked until verified
3. GitHub sign-in works in both modes

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
