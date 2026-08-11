# Homepage Mobile Overflow

## Overview

UI review detected ~43px horizontal scroll on the marketing homepage at 375px. Tablet and desktop pass. Fix overflow without changing section content or desktop layout.

**Source:** UI review (Playwright), screenshot: `home-mobile.png`.

---

## Requirements

### 1. Identify overflow source (Major)

**Problem:** Page is wider than viewport on mobile.

**Likely causes (audit in DevTools):**

- Hero chaos animation or dashboard preview mockup exceeding container width
- Pricing toggle or card grid with fixed/min widths
- Feature cards or AI section code block with `overflow-x-auto` expanding parent
- Negative margins or `w-screen` / `100vw` on a child inside padded layout
- Logo strip or footer columns not wrapping

**Fix process:**

1. Run Playwright or Chrome DevTools at 375px; inspect `document.documentElement.scrollWidth` vs `clientWidth`.
2. Walk sections top-to-bottom; add temporary `outline` to find the offending element.
3. Apply minimal fix per offender (see §2–4).

### 2. Container constraints (Major)

**Fix patterns (apply where needed):**

- Marketing page root: `overflow-x-hidden` only as last resort on `(marketing)/layout.tsx` — prefer fixing the child.
- Section wrappers: `max-w-full` + `overflow-hidden` on animated/mockup containers.
- Grids: replace fixed column widths with `minmax(0, 1fr)` or `w-full`.
- Code/pre blocks: `max-w-full overflow-x-auto` on the scroll container, not the page.

**Files to audit:**

- `src/app/(marketing)/layout.tsx`
- `src/app/(marketing)/page.tsx`
- `src/components/marketing/homepage-hero.tsx`
- `src/components/marketing/chaos-animation.tsx`
- `src/components/marketing/dashboard-preview.tsx`
- `src/components/marketing/homepage-pricing.tsx`
- `src/components/marketing/homepage-ai-section.tsx`
- `src/components/marketing/homepage-footer.tsx`

### 3. Hero and preview mockup (Medium)

**Problem:** `dashboard-preview.tsx` uses percentage sidebar (`w-[28%]`) inside a fixed-height box; sibling flex children can push past viewport if parent lacks `min-w-0`.

**Fix:**

- Parent flex containers: `min-w-0` on flex children that should shrink.
- Preview wrapper: `max-w-full` and contained padding; scale down mockup on `xs` if still too wide.

**Files:** `dashboard-preview.tsx`, `homepage-hero.tsx`, `chaos-animation.tsx`

### 4. Pricing section (Minor)

**Problem:** Monthly/Yearly toggle or side-by-side cards may not stack cleanly below `sm`.

**Fix:**

- Ensure pricing grid is single column below `md` (verify existing breakpoints).
- Toggle group: `flex-wrap` or `w-full justify-center` so it cannot exceed viewport.

**File:** `homepage-pricing.tsx`

---

## Acceptance criteria

- [ ] `document.documentElement.scrollWidth === clientWidth` at 375px on `/`
- [ ] No horizontal scrollbar on homepage mobile
- [ ] Desktop and tablet layouts unchanged (1280px, 768px)
- [ ] Anchor scroll and mobile nav sheet still work (`homepage-ui-fixes-spec.md`)
- [ ] No content clipped in hero or pricing on mobile

---

## References

- `context/fixes/homepage-ui-fixes-spec.md` — related marketing fixes (nav, anchors, CTAs)
- `context/features/homepage-spec.md` — section structure
- Screenshot: `.ui-review/output/screenshots/home-mobile.png`
