# Current Feature: Dashboard Performance & Data Layer Cleanup

## Status

In Progress

## Goals

- Replace collection item over-fetching with aggregation (`groupBy` or denormalized `dominantTypeColor`) so queries no longer load all items for metadata
- Add a default limit (20) to `getPinnedItems` to prevent unbounded result sets
- Consolidate dashboard data fetching into a single coordinated call — one user lookup, deduplicated stats and collections between layout and page
- Fix `getSidebarData` to use the passed `userId` for user profile instead of ignoring it
- Centralize demo-user resolution in `src/lib/db/user.ts` with a single `getCurrentUser()` API
- Remove `force-dynamic` from dashboard layout if no longer needed after consolidation
- Split sidebar into server-rendered static content with a thin client wrapper for interactivity
- Use `isMobile` hook consistently in `toggleSidebar` (no duplicate `matchMedia`)
- Add graceful fallback UI when demo user seed data is missing

## Notes

From code-scanner audit (2026-08-01). Priority order:

1. Collection query optimization — biggest scalability risk with Pro-tier unlimited items
2. Dashboard query deduplication — cuts DB round-trips roughly in half
3. Pinned items limit — quick guard against unbounded fetches

UI behavior must not change — this is a performance and data-layer refactor only. Auth is out of scope; demo user pattern remains until auth lands. Seed script split is deferred.

Spec: `context/features/dashboard-performance-spec.md`

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
