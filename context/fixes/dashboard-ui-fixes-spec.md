# Dashboard UI Fixes

## Overview

Fix dashboard layout and interaction issues found in the UI review: cramped tablet layout, undersized mobile controls, and hidden create actions on small screens. Touch-target sizing details are in `touch-targets-spec.md`.

**Source:** `.ui-review/dashboard-report-v2.json`, screenshots in `.ui-review/screenshots/`.

---

## Requirements

### 1. Tablet sidebar collapse (Major)

**Problem:** At 768px, the full 256px sidebar (`w-64`) stays visible, leaving ~512px for main content. Search bar and collection grid feel cramped. Mobile sheet works correctly; tablet does not.

**Current behavior:** `dashboard-shell.tsx` shows sidebar at `md:flex` with collapse toggle only shrinking to `w-16` — user must manually collapse.

**Fix (pick one approach):**

**A — Auto-collapse at tablet (recommended):**
- Default `collapsed: true` in sidebar context when viewport is `md` and below `lg` (768–1023px)
- Persist user preference in `localStorage` once they toggle
- Use `matchMedia` in `sidebar-context.tsx` or CSS-driven default

**B — Icon rail by default at `md`:**
- Change breakpoint so `md` starts at icon-only `w-16`; expand to `w-64` only at `lg+`

**C — Off-canvas at tablet:**
- Treat `md` like mobile: hide sidebar, show sheet on toggle (may feel regressive on tablet landscape)

**Files:**

- `src/components/dashboard/dashboard-shell.tsx` — aside breakpoints (`md:flex`, `w-64` / `w-16`)
- `src/components/dashboard/sidebar-context.tsx` — default collapsed state, viewport listener
- `src/components/dashboard/sidebar-content.tsx` — ensure icon-rail mode is usable

### 2. Mobile favorite and action buttons (Major)

**Problem:** Favorite toggles ~24×24px; collection card action menus ~32×32px on mobile.

**Fix:**

- Collection favorite buttons: increase `Button` hit area to 44px; keep star icon size
- Collection card overflow/menu triggers: use `size="icon"` (44px on mobile) instead of `icon-sm`
- Audit `CollectionsGrid` / `collection-card` components for all tappable icons

**Files:** `src/components/dashboard/collection-card.tsx` (or equivalent), `src/components/collections/collection-favorite-button.tsx`, `src/components/collections/collection-detail-actions.tsx`

### 3. Sidebar nav row height (Major)

**Problem:** Sidebar links use `py-1.5` (~32px row height). Collapse control is 28×28px (`icon-sm`).

**Fix:**

- `SidebarNavLink`: change to `min-h-11 py-2` (or `py-2.5`)
- `SidebarCollapseButton`: use `size="icon"` with 44px minimum

**Files:** `src/components/dashboard/sidebar-link.tsx`, `sidebar-collapse-button.tsx`

### 4. Header action buttons (Minor)

**Problem:** `New Item` ~79×28px; `New Collection` hidden below `sm`; search input `h-9`.

**Fix:**

- Bump `New Item` / `New Collection` to `min-h-11` (see touch-targets spec)
- **Mobile create access:** `New Collection` is `hidden sm:inline-flex` — mobile users cannot create collections from header
  - Option A: Show a single "+" `DropdownMenu` on mobile with "New Item" and "New Collection"
  - Option B: Always show both as icon+label or stacked in overflow menu
  - Option C: Add "New Collection" to mobile sidebar footer

**File:** `src/components/dashboard/top-bar.tsx`

### 5. "View all" link hit area (Minor)

**Problem:** Dashboard "View all" link (~50×20px) and sidebar "View all collections" are hard to tap.

**Fix:** Wrap in `inline-flex min-h-11 items-center px-2` or equivalent padding.

**Files:** `src/app/dashboard/page.tsx`, `src/components/dashboard/sidebar-content.tsx`

---

## Acceptance criteria

- [ ] At 768px viewport, main content area has adequate width (sidebar collapsed or icon-rail by default)
- [ ] User can expand full sidebar on tablet if desired
- [ ] All collection card actions and favorites meet 44px touch target on mobile
- [ ] Mobile users can create both items and collections without hunting
- [ ] Sidebar nav rows and collapse button meet touch-target minimum
- [ ] No horizontal overflow at 375px, 768px, 1280px (already passing — must not regress)

---

## References

- `context/fixes/touch-targets-spec.md`
- Screenshots: `dashboard-tablet-v2.png`, `dashboard-mobile-v2.png`, `dashboard-desktop-v2.png`
