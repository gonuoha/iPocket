# Current Feature: Profile Page

## Status

In Progress

## Goals

- Build out `/profile` with user info: email, name, avatar (GitHub image or initials), and account creation date
- Show usage stats: total items, total collections, and breakdown by item type (snippets, prompts, notes, commands, links, files, images)
- Add change password action for email/password users only (not GitHub OAuth)
- Add delete account action with confirmation dialog to prevent accidental deletion
- Follow existing codebase patterns for data fetching (server components, `getCurrentUser`, Prisma helpers)
- Ensure route remains protected (authentication required)

## Notes

Spec: `context/features/profile-spec.md`

**Current state:** `/profile` exists as a minimal placeholder — shows avatar, name, email, and Pro badge only. No stats, creation date, change password, or delete account.

**Avatar logic:** Reuse `UserAvatar` — GitHub image from OAuth if available, otherwise initials from name/email.

**Change password:** Only show for users with a `password` field set (credentials sign-up). Can link to a change-password flow or inline form; reuse bcrypt patterns from register/reset-password.

**Delete account:** Confirmation dialog (shadcn `AlertDialog` if available). Delete user and cascade related data per Prisma schema (`onDelete: Cascade` on relations).

**Stats:** Reuse or extend existing helpers — `getUserItemStats` in `src/lib/db/items.ts` may cover totals; may need collection count and per-type breakdown query.

**Testing:**
1. Visit `/profile` while logged in — full profile renders
2. Visit `/profile` while logged out — redirected to sign-in
3. Stats match actual user data in dashboard
4. Credentials user sees change password; GitHub-only user does not
5. Delete account prompts confirmation; on confirm, user is signed out and data removed

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
