# Sidebar Active Navigation

## Overview

Fix sidebar navigation so users can see which page they are on. UI review found no active/highlight state for item-type links, collection links, or most app routes. Only `Favorites` uses `SidebarNavLink`, and it highlights only on exact `/favorites` match.

**Source:** UI review (Playwright), screenshots in `.ui-review/output/screenshots/`.

---

## Requirements

### 1. Prefix-based active matching (Major)

**Problem:** Item types and collections use `SidebarLink` (hover only). `SidebarNavLink` exists but only checks `pathname === href` — insufficient for nested routes.

**Fix:**

- Extend `SidebarNavLink` to support prefix matching via an optional prop, e.g. `match?: "exact" | "prefix"` (default `"exact"`).
- Prefix match: active when `pathname === href` or `pathname.startsWith(href + "/")`.
- Set `aria-current="page"` on the active link.

**Examples:**

| Link | href | Active when |
| --- | --- | --- |
| Snippets | `/items/snippet` | `/items/snippet`, `/items/snippet?page=2` |
| Collection | `/collections/abc` | `/collections/abc` only (exact) |
| Favorites | `/favorites` | `/favorites` (exact) |
| Dashboard | `/dashboard` | `/dashboard` (exact) |

**Files:**

- `src/components/dashboard/sidebar-link.tsx` — matching logic, `aria-current`
- `src/components/dashboard/sidebar-content.tsx` — swap `SidebarLink` → `SidebarNavLink` for item types and collections

### 2. Active state visual design (Major)

**Problem:** Even on `/favorites`, active state (`bg-sidebar-accent`) is subtle and easy to miss in dark mode.

**Fix:**

- Keep `bg-sidebar-accent` as base active style.
- Add at least one stronger cue:
  - Left accent bar (`border-l-2` using item-type color where applicable), or
  - `font-medium` on active label, or
  - Slightly brighter foreground (`text-sidebar-accent-foreground` with higher contrast).
- Ensure active state is visible in collapsed (icon-rail) mode — use background on the icon container, not label-only styling.
- Hover styles must not override active styles.

**Files:** `src/components/dashboard/sidebar-link.tsx`, `sidebar-content.tsx`

### 3. Add Dashboard to sidebar nav (Medium)

**Problem:** Dashboard is the main post-login landing page but has no sidebar entry. Users rely on the top-bar logo.

**Fix:**

- Add a `Dashboard` nav item at the top of the primary nav (above Favorites).
- Use `LayoutDashboard` (or existing dashboard icon from lucide) + `SidebarNavLink` with exact match on `/dashboard`.
- Include in collapsed sidebar with `title` tooltip.

**Files:** `src/components/dashboard/sidebar-content.tsx`

### 4. Settings page affordance (Medium)

**Problem:** Settings lives only in the user dropdown. On `/settings`, sidebar looks identical to any other page.

**Fix (pick one):**

**A — Settings in primary nav (recommended):**
- Add `Settings` link below Dashboard (or above user menu section) with exact match on `/settings`.

**B — Highlight user menu trigger when on Settings:**
- In `SidebarUserMenu`, detect `pathname === "/settings"` and apply active ring/background on the trigger.

Do not duplicate Settings in both places.

**Files:** `sidebar-content.tsx` and/or `sidebar-user-menu.tsx`

### 5. Collections list link (Minor)

**Problem:** "View all collections" (`/collections`) has no active state when user is on the collections index.

**Fix:**

- Convert to `SidebarNavLink` with exact match on `/collections` (not prefix — avoid matching `/collections/[id]`).

**File:** `sidebar-content.tsx`

---

## Acceptance criteria

- [ ] On `/items/snippet`, the Snippets sidebar link shows active styling
- [ ] On `/collections/[id]`, the matching collection link is active; "View all collections" is not
- [ ] On `/collections`, "View all collections" is active
- [ ] On `/dashboard`, Dashboard link is active
- [ ] On `/settings`, Settings is indicated per chosen approach
- [ ] On `/favorites`, Favorites link remains active
- [ ] Active link has `aria-current="page"`
- [ ] Active state is visible at 375px (mobile drawer), 768px (tablet), and 1280px (desktop)
- [ ] Collapsed sidebar still shows active state on the icon

---

## References

- `src/components/dashboard/sidebar-link.tsx` — `SidebarNavLink` vs `SidebarLink`
- `src/components/dashboard/sidebar-content.tsx` — nav item definitions
- Screenshots: `items-snippet-mobile.png`, `settings-mobile.png`, `dashboard-mobile.png`
