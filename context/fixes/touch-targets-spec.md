# Touch Target Sizes

## Overview

UI review found many interactive elements below the 44×44px touch-target guideline (WCAG 2.5.5 / Apple HIG). Apply a consistent minimum across marketing and dashboard surfaces without changing visual density more than necessary — expand hit area via padding while keeping icon sizes unchanged where possible.

**Source:** `.ui-review/report.json` — cross-cutting findings at 375px, 768px, 1280px.

---

## Requirements

### Global guideline

- Interactive elements (buttons, icon buttons, nav links, text links used as primary actions) should have a **minimum 44×44px** hit area on touch devices.
- Prefer `min-h-11 min-w-11` (44px) or equivalent padding over enlarging icons.
- Desktop pointer users may keep compact visuals; use responsive classes (`min-h-11 md:min-h-8`) only where density matters on large screens.

### Button component (`src/components/ui/button.tsx`)

Current sizes are undersized for touch:

| Size | Current | Target (mobile) |
| --- | --- | --- |
| `default` | h-8 (32px) | h-11 (44px) or keep default + add touch variant |
| `sm` | h-7 (28px) | min-h-11 on marketing/dashboard action buttons |
| `lg` | h-9 (36px) | h-11 (44px) |
| `icon` | size-8 (32px) | size-11 (44px) on mobile |
| `icon-sm` | size-7 (28px) | size-11 on mobile, or deprecate for primary actions |

**Approach:** Add an optional `touch` size variant or bump `lg` / `icon` defaults. Avoid a blanket change to every `sm` button in dense lists — scope to nav, header, and primary actions first.

### Marketing navbar (`src/components/marketing/homepage-navbar.tsx`)

- Logo link (~101×28px), Sign In (~63×28px), Get Started (~92×28px) — all below minimum.
- Desktop nav anchor links (~46–58×20px) — increase padding to `py-2.5 px-3` or `min-h-11`.

**Files:** `homepage-navbar.tsx`, `homepage-navbar-actions.tsx`, `marketing-logo.tsx`

### Dashboard header (`src/components/dashboard/top-bar.tsx`)

- Search trigger ~320×36px — bump to `h-11`.
- Header buttons (`New Item` ~79×28px, `New Collection`, favorites icon) — use `min-h-11`; icon buttons use `size="icon"` with 44px hit area on mobile.

### Dashboard sidebar (`src/components/dashboard/sidebar-link.tsx`, `sidebar-collapse-button.tsx`)

- Nav rows use `py-1.5` (~32px tall) — increase to `min-h-11 py-2`.
- Collapse button uses `icon-sm` (28px) — use `icon` or `min-h-11 min-w-11`.

### Icon-only actions

Audit and fix hit areas in:

- `src/components/collections/collection-detail-actions.tsx` — menu trigger `icon-sm`
- Collection card action menus on dashboard grid
- Favorite toggles (24×24px reported on mobile)
- `src/app/dashboard/page.tsx` — "View all" link (~50×20px)
- `src/components/dashboard/sidebar-content.tsx` — "View all collections" link

Pattern for small icon buttons: wrap in `inline-flex min-h-11 min-w-11 items-center justify-center` or use `Button` with `size="icon"` at 44px.

---

## Acceptance criteria

- [ ] No primary nav, header, or sidebar control measures below 44×44px at 375px viewport
- [ ] Hero and navbar CTAs meet 44px height on mobile
- [ ] Icon-only buttons have 44px hit area; icon glyph may remain 16–20px
- [ ] Re-run UI review script or manual Playwright audit confirms improved measurements
- [ ] Desktop layout density is not noticeably degraded (use responsive sizing if needed)

---

## References

- Screenshots: `.ui-review/screenshots/homepage-mobile.png`, `dashboard-mobile-v2.png`
- Related: `homepage-ui-fixes-spec.md`, `dashboard-ui-fixes-spec.md`
