# Current Feature: Item Drawer — Edit Mode

## Status

In Progress

## Goals

- Edit button in the item drawer's action bar toggles the drawer into inline edit mode (same drawer, no navigation)
- Edit mode replaces the action bar with Save and Cancel buttons
- Cancel discards changes and returns to view mode; Save persists via server action, returns to view mode, and refreshes drawer data
- Toast notification on save success or error
- Editable fields for all types: Title (required text input), Description (optional textarea), Tags (comma-separated input → tag array)
- Type-specific editable fields shown only for relevant item type: Content (textarea) for snippet/prompt/command/note, Language (text input) for snippet/command, URL (text input) for link
- Item type, collections, and created/updated dates remain display-only in edit mode
- `updateItem(itemId, data)` server action in `src/actions/items.ts` validates with Zod, checks session via `auth()`, validates ownership, calls query function, returns `{ success, data, error }`
- `updateItem` query function in `src/lib/db/items.ts`: disconnect all existing tags, connect-or-create new ones, return updated `ItemDetail`

## Notes

- Zod schema: `title` non-empty trimmed string; `description`, `content`, `url`, `language` string or null (optional); `tags` array of trimmed non-empty strings
- Return Zod errors in `{ success: false, error }` so the client can display them
- No form library — controlled inputs with local state
- Client-side: disable Save button when title is empty
- Server-side Zod validation is the source of truth
- Content textarea is plain text, not a code editor (comes later)
- After save, call `router.refresh()` so the underlying card/row list reflects changes
- Spec: `context/features/item-drawer-edit-spec.md`

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
- 2026-08-02: Completed **Rate Limiting for Auth** — Upstash Redis sliding-window limits on login, register, forgot/reset password, and resend-verification; custom login route, 429 with Retry-After, inline form errors, fail-open when Redis unavailable, GitHub OAuth emailVerified fix via events.signIn
- 2026-08-05: Completed **Items List View** — dynamic `/items/[type]` route with type-filtered ItemCard grid, db helpers, auth protection, sidebar plural labels with per-type counts, shared `getItemTypeLabel` helper
- 2026-08-05: Completed **Three-Column Item Listing** — responsive items grid with three columns on xl screens, matching collections grid breakpoints
- 2026-08-05: Completed **Item Drawer** — right-side Sheet drawer opens on ItemCard/ItemRow click, full item detail via `/api/items/[id]` with auth check, skeleton loading state, action bar (Favorite, Pin, Copy, Edit, icon-only Delete)
