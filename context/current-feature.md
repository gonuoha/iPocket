# Current Feature: Auth Setup - NextAuth + GitHub Provider

## Status

In Progress

## Goals

- Install NextAuth v5 (`next-auth@beta`) and `@auth/prisma-adapter`
- Set up split auth config pattern for edge compatibility (`auth.config.ts` + `auth.ts`)
- Add GitHub OAuth provider with JWT session strategy
- Create API route at `src/app/api/auth/[...nextauth]/route.ts`
- Protect `/dashboard/*` routes using Next.js 16 proxy (`src/proxy.ts`)
- Redirect unauthenticated users to sign-in
- Extend Session type with `user.id` in `src/types/next-auth.d.ts`
- Verify auth flow: `/dashboard` redirects to sign-in, GitHub sign-in returns to dashboard

## Notes

Phase 1 auth setup using NextAuth defaults for sign-in pages (no custom `pages.signIn`).

**Files to create:**
- `src/auth.config.ts` — edge-compatible config (providers only, no adapter)
- `src/auth.ts` — full config with Prisma adapter and JWT strategy
- `src/app/api/auth/[...nextauth]/route.ts` — export handlers from `auth.ts`
- `src/proxy.ts` — route protection with redirect logic (same level as `app/`)
- `src/types/next-auth.d.ts` — extend Session type

**Key gotchas:**
- Use `next-auth@beta` (not `@latest`, which installs v4)
- Proxy must use named export: `export const proxy = auth(...)` (not default)
- Use `session: { strategy: 'jwt' }` with split config pattern
- Follow latest Auth.js docs for edge compatibility and Prisma adapter

**Environment variables:** `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`

Spec: `context/features/auth-phase-1-spec.md`

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
