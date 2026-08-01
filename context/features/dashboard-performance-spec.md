# Dashboard Performance & Data Layer Cleanup

## Overview

Address performance and data-layer issues found in the code-scanner audit. The dashboard currently over-fetches collection items, duplicates database queries across layout and page, and has inconsistent demo-user resolution. This feature optimizes queries, consolidates data fetching, and cleans up the user/data-layer API without changing UI behavior.

## Requirements

### Query optimization (High)

- Replace full `items` include in collection queries with aggregation for `dominantTypeColor` and unique types — use Prisma `groupBy` on `typeId` with count, or store `dominantTypeColor` on the collection model
- Add a `limit` parameter to `getPinnedItems` (default 20) with `take` in the Prisma query
- Keep `itemCount` via `_count` — do not fetch all items just for metadata

### Consolidate dashboard data fetching (Medium)

- Fetch demo user once per request instead of duplicate `getDashboardUserId()` / `getDashboardUser()` calls in layout and page
- Deduplicate overlapping stats queries (`getSidebarItemCounts` vs `getDashboardStats`)
- Share or dedupe collection fetches between layout sidebar and dashboard page where possible
- Introduce a single `getDashboardData(userId)` (or similar) that returns everything the layout + page need in one coordinated call

### Data layer cleanup (Medium)

- Fix `getSidebarData(userId)` to use the passed `userId` for user profile lookup instead of ignoring it and calling `getDashboardUser()` with hardcoded email
- Centralize demo-user resolution in `src/lib/db/user.ts` — single `getCurrentUser()` that returns `id` and profile
- Remove `export const dynamic = "force-dynamic"` from dashboard layout unless still required after consolidation

### Sidebar client boundary (Medium)

- Split `sidebar-content.tsx` so static nav/collections render as server components
- Keep a thin client wrapper only for collapse, mobile drawer, and `onNavigate` behavior

### Quick wins (Low)

- Use `isMobile` from `useIsMobile` in `toggleSidebar` instead of duplicating `window.matchMedia`
- Add graceful fallback when demo user is missing (setup prompt or `error.tsx` with link to `npm run db:seed`)

## Out of scope

- Auth implementation (demo user pattern stays until auth lands)
- Seed script split (`prisma/seed.ts` refactor)
- Full sidebar component extraction into separate files (optional follow-up)

## References

- Code-scanner findings (2026-08-01)
- `src/lib/db/collections.ts` — `collectionItemsInclude`, `getDominantTypeColor`
- `src/lib/db/items.ts` — `getPinnedItems`, `getSidebarItemCounts`
- `src/lib/db/sidebar.ts` — `getSidebarData`
- `src/lib/db/user.ts` — `DEMO_USER_EMAIL`, `getDashboardUserId`
- `src/app/dashboard/layout.tsx` — `force-dynamic`, sidebar data fetch
- `src/app/dashboard/page.tsx` — duplicate user/stats/collections fetch
- `src/components/dashboard/sidebar-content.tsx` — client boundary
