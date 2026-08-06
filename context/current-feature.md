# Current Feature

## Status

Not Started

## Goals

<!-- What success looks like for the active feature -->

## Notes

<!-- Additional context, constraints, or details from spec -->

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
- 2026-08-05: Completed **Item Drawer — Edit Mode** — Edit toggles inline edit mode with Save/Cancel actions; Title/Description/Tags for all types plus type-specific Content/Language/URL fields; Zod-validated `updateItem` server action (`src/actions/items.ts`) with ownership check and tag disconnect/connect-or-create via new `updateItem` query in `lib/db/items.ts`; toast feedback and `router.refresh()` on save
- 2026-08-05: Completed **Item Delete** — AlertDialog confirmation on drawer delete button; `deleteItem` server action and db helper with ownership check; success/error toasts, drawer close, and path revalidation for `/items/[type]` and `/dashboard`
- 2026-08-05: Completed **Item Create** — Dialog modal from top bar New Item button with type selector (snippet, prompt, command, note, link) and dynamic fields; Zod-validated `createItem` server action and db helper with tag connect-or-create; success toast, modal close, and `router.refresh()`; unit tests for schema and action
- 2026-08-05: Completed **Code Editor** — Monaco `CodeEditor` component with dark theme, macOS window dots, copy button, and language header; replaces textarea for snippet and command content in item drawer (view/edit) and create dialog; fluid height capped at 400px with themed scrollbars
- 2026-08-05: Completed **Markdown Editor** — `MarkdownEditor` with Write/Preview tabs, `react-markdown` + `remark-gfm`, dark-themed `.markdown-preview` styles, and copy button; replaces textarea for note and prompt content in create dialog and item drawer (view/edit); 200px default height
- 2026-08-05: Completed **File Upload with Cloudflare R2** — `/api/items/upload` and `/api/items/[id]/download` routes, `FileUpload` drag-and-drop component with progress, `lib/file-upload.ts` validation utilities (extension/MIME/size checks, ownership check), R2 client/storage helpers, `createItem`/`deleteItem` wired for file/image types with Pro gating and R2 cleanup on delete, image preview and file info in ItemDrawer, item type selector converted to a `Select` dropdown, unit tests for validation and server actions
- 2026-08-06: Completed **Image Gallery View** — `ImageThumbnailCard` and `ImageGalleryGrid` for `/items/images` with 16:9 thumbnails, `object-cover`, and hover zoom; type-specific rendering in items page
- 2026-08-06: Completed **File List View** — `FileList` and `FileListRow` for `/items/files` with extension icons, file size, upload date, row hover highlight, ItemDrawer on click, and direct download; `FileListItem` type and `getFileItemsByType` db helper
- 2026-08-06: Completed **Item Copy** — shared `getItemCopyText` utility with content → url → fileName → description → title priority; reusable `ItemCopyButton` on item cards and in the item drawer with clipboard write, toast feedback, and copied state
- 2026-08-06: Completed **Collection Create** — `CollectionCreateDialog` from top bar New Collection button with name/description fields; Zod-validated `createCollection` server action and db helper with user scoping and duplicate-name handling; success/error toasts, path revalidation, and `router.refresh()`; unit tests for schema and action; dashboard Overview section restyled as a grouping-only container
- 2026-08-06: Completed **Add Item to Collections** — `ItemCollection` junction table migration replacing single `collectionId` FK; searchable `CollectionMultiSelect` in `ItemCreateDialog` and `ItemDrawer`; collection ownership validation in Zod schemas and `createItem`/`updateItem` server actions; collections fetched in layouts and passed through dashboard shell; unit tests for schema and action collection assignment
