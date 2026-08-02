# Current Feature: Profile Action Feedback & Safer Account Deletion

## Status

In Progress

## Goals

- Add user-facing notifications (toast) for profile actions such as successful password change and failed actions
- Replace inline success/error messages in the change password flow with toast notifications where appropriate
- Require a conscious confirmation step before account deletion (e.g. user must type a specific phrase such as `DELETE` before the delete button is enabled)
- Keep delete account dialog centered and clearly communicate that the action is irreversible
- Follow existing UI patterns (shadcn/ui, Dialog, existing profile components)
- Ensure error states still surface clearly via toast or inline feedback

## Notes

Inline feature request — no separate spec file.

**Current state:**
- Change password shows inline success/error messages inside the dialog; dialog closes immediately on success via `onSuccess`, so the success message may not be visible
- Delete account only requires clicking "Yes, delete my account" — no typed confirmation
- No toast/notification system exists in the project yet (no `sonner` or shadcn toast component)

**Notifications:**
- Add a toast system (likely shadcn `sonner`) and mount `Toaster` in the root layout
- Show success toast on password change; show error toasts for API failures
- Consider toast for delete account errors; success ends with sign-out redirect

**Safer account deletion:**
- In `DeleteAccountButton` dialog, add an input requiring the user to type `DELETE` (or similar fixed phrase) to enable the destructive confirm button
- Reset confirmation input when dialog closes
- Optionally disable delete while input does not match

**Files likely touched:**
- `src/components/profile/change-password-form.tsx`
- `src/components/profile/delete-account-button.tsx`
- `src/app/layout.tsx` (Toaster provider)
- New: `src/components/ui/sonner.tsx` (or toast component)

**Testing:**
1. Change password successfully — toast appears, dialog closes
2. Change password with wrong current password — error toast or inline error shown
3. Open delete account dialog — confirm button disabled until phrase typed correctly
4. Type wrong phrase — confirm stays disabled
5. Type `DELETE` — confirm enabled, deletion proceeds
6. Cancel/close dialog — confirmation input resets

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
