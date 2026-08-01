# Current Feature: Auth Credentials - Email/Password Provider

## Status

In Progress

## Goals

- Add Credentials provider for email/password authentication with registration
- Use bcryptjs for password hashing (already installed)
- Ensure User model has password field (migration if needed)
- Add Credentials provider placeholder in `auth.config.ts` (`authorize: () => null`)
- Override Credentials in `auth.ts` with bcrypt validation logic
- Create registration API route at `POST /api/auth/register`
- Validate registration input: name, email, password, confirmPassword match
- Check for existing user before creating account
- Hash password and create user in database
- Verify email/password sign-in via NextAuth default sign-in page
- Verify GitHub OAuth still works after changes

## Notes

Phase 2 auth — adds email/password alongside existing GitHub OAuth from phase 1.

**Registration API (`POST /api/auth/register`):**
- Accept: `name`, `email`, `password`, `confirmPassword`
- Validate passwords match
- Check if user already exists
- Hash password with bcryptjs
- Create user in database
- Return success/error response

**Credentials provider split pattern:**
- `auth.config.ts`: Credentials provider with `authorize: () => null` placeholder
- `auth.ts`: Override Credentials provider with actual bcrypt validation

**Testing:**
1. Register via curl against `POST /api/auth/register`
2. Sign in at `/api/auth/signin` with email/password
3. Confirm redirect to `/dashboard`
4. Confirm GitHub OAuth still works

Spec: `context/features/auth-phase-2-spec.md`

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
