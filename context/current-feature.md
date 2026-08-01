# Current Feature: Auth UI - Sign In, Register & Sign Out

## Status

In Progress

## Goals

- Replace NextAuth default pages with custom sign-in and register UI
- Create `/sign-in` page with email/password fields, GitHub button, register link, validation, and error display
- Create `/register` page with name, email, password, confirm password, validation (match + email format), submit to `/api/auth/register`, redirect to sign-in on success
- Update sidebar footer with authenticated user avatar (GitHub image or initials fallback), name, and email
- Add avatar dropdown on click with "Sign out" action
- Avatar click navigates to `/profile`
- Create reusable avatar component handling image vs initials fallback
- Configure NextAuth to use custom `pages.signIn` at `/sign-in`
- Verify GitHub sign-in, credentials sign-in, sign-out, and registration flows end-to-end

## Notes

Phase 3 auth UI — builds on phase 1 (GitHub OAuth) and phase 2 (credentials + register API).

**Sign In (`/sign-in`):**
- Email and password inputs
- "Sign in with GitHub" button
- Link to `/register`
- Form validation and error display

**Register (`/register`):**
- Name, email, password, confirm password
- Validate passwords match and email format
- POST to `/api/auth/register`
- Redirect to `/sign-in` on success

**Sidebar footer:**
- Avatar: GitHub `image` if present, else initials from name (e.g. "Brad Traversy" → "BT")
- Display user name and email
- Dropdown on avatar click with "Sign out"
- Avatar navigates to `/profile`

**Reusable component:** Avatar component for image vs initials logic.

Spec: `context/features/auth-phase-3-spec.md`

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
