# Accessibility Fixes

## Overview

Minor accessibility improvements from the UI review. Focus states and color contrast already pass; no `<img>` alt-text issues (icons are SVG). This spec covers remaining gaps.

**Source:** `.ui-review/report.json` — `hasSkipLink: false` on homepage and dashboard.

---

## Requirements

### 1. Skip to main content link (Minor)

**Problem:** No skip link on homepage or dashboard. Keyboard users must tab through navbar/sidebar before reaching primary content.

**Fix:**

- Add a visually hidden "Skip to main content" link as the first focusable element in the document (or layout).
- Link targets the page `<main>` element via `href="#main-content"`.
- On focus, reveal link (standard sr-only / focus:not-sr-only pattern):

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] ..."
>
  Skip to main content
</a>
```

- Add `id="main-content"` to `<main>` in:
  - `src/app/(marketing)/page.tsx`
  - Dashboard shell main: `src/components/dashboard/dashboard-shell.tsx`

**Optional:** Shared `SkipToContent` component in `src/components/layout/skip-to-content.tsx`, rendered from root `layout.tsx` or per-layout.

### 2. Anchor scroll offset (homepage)

Covered in `homepage-ui-fixes-spec.md` — listed here for accessibility traceability.

- Fixed navbar must not obscure section headings when navigating via keyboard-activated anchor links.
- Apply `scroll-padding-top` on `html` or `scroll-mt-*` on section targets.

### 3. Stronger focus-visible rings (Minor)

**Problem:** UI review (Aug 2026) found focus states present but weak — thin 1px outline, hard to see on dark sidebar and form backgrounds.

**Fix:**

- Apply consistent `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background` on:
  - `SidebarNavLink` / `SidebarLink`
  - Dashboard top-bar icon buttons and search trigger
  - Auth form inputs (verify `Input` component default)
- Use `outline-none` only when replacing with a visible ring — never remove focus indicator entirely.
- Respect `motion-reduce`: ring is sufficient; avoid animated focus transitions.

**Files:** `sidebar-link.tsx`, `top-bar.tsx`, `src/components/ui/input.tsx`, `src/components/ui/button.tsx`

### 4. Maintain passing checks

Do not regress these review passes:

- **Focus states:** Visible outline/ring on Tab (logo, inputs, links, buttons)
- **Color:** `text-muted-foreground` on dark backgrounds meets contrast for body text
- **Non-color indicators:** Item-type colors on cards include text labels, not color alone

---

## Acceptance criteria

- [ ] Skip link is first tab stop on `/` and `/dashboard`
- [ ] Activating skip link moves focus to `<main>` content
- [ ] Skip link is visible when focused, hidden otherwise
- [ ] Homepage anchor navigation leaves target headings readable below navbar
- [ ] Sidebar links and top-bar controls show a clearly visible 2px focus ring on keyboard Tab
- [ ] Existing contrast and alt-text checks unchanged

---

## References

- `context/fixes/homepage-ui-fixes-spec.md` (anchor scroll)
- WCAG 2.4.1 Bypass Blocks, 2.5.5 Target Size (see `touch-targets-spec.md`)
