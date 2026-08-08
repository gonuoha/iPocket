# Homepage UI Fixes

## Overview

Address homepage-specific issues from the UI review: missing mobile navigation, marketing polish gaps, and scroll/animation edge cases. Touch-target sizing is covered in `touch-targets-spec.md`.

**Source:** `.ui-review/report.json`, screenshots in `.ui-review/screenshots/`.

---

## Requirements

### 1. Mobile navigation menu (Major)

**Problem:** Features and Pricing links use `hidden md:flex` in `homepage-navbar.tsx`. On mobile (375px), users cannot reach `#features` or `#pricing` from the navbar — only via hero "See Features" or footer links.

**Fix:**

- Add a hamburger menu for viewports below `md` using shadcn `Sheet` (same pattern as dashboard mobile sidebar).
- Menu items: Features (`#features`), Pricing (`#pricing`), Sign In (`/sign-in`), Get Started (`/register`).
- Close sheet on anchor link click; smooth-scroll to section.
- Hamburger trigger must meet 44px touch target (see touch-targets spec).

**Files:** `src/components/marketing/homepage-navbar.tsx` (new client sub-component or inline sheet)

### 2. Hero and navbar CTA button sizes (Minor)

**Problem:** Hero CTAs use `size="lg"` but measure ~36px tall — below 44px guideline.

**Fix:** Apply `min-h-11` via `buttonVariants` override or bump `lg` size for marketing pages only.

**Files:** `src/components/marketing/homepage-hero.tsx`, `homepage-navbar-actions.tsx`, `homepage-cta.tsx`

### 3. Social proof section (Minor)

**Problem:** No testimonials, customer logos, or usage metrics. CTA copy ("Join developers who…") is the only trust signal. Marketing checklist: **Fail**.

**Fix:**

- Add a new section between Features and AI (or between AI and Pricing) with at least one of:
  - Logo strip (placeholder dev-tool logos acceptable for v1)
  - 1–2 short testimonials
  - Simple metrics (e.g. "X snippets saved")
- Keep dark theme; match existing marketing typography.
- Wrap in `FadeInOnScroll` like other sections.

**Files:** New `src/components/marketing/homepage-social-proof.tsx`, compose in `src/app/(marketing)/page.tsx`, copy in `src/lib/marketing/homepage-content.ts`

### 4. Pricing "Most Popular" badge overlap (Minor)

**Problem:** Badge at `absolute -top-3` slightly overlaps the Pro card top border on desktop.

**Fix (pick one):**

- Add `mt-4` or `pt-4` to the Pro card article
- Move badge inside card with `mb-4` below it instead of absolute positioning
- Increase `-top-3` offset or add `overflow-visible` + padding on parent grid

**File:** `src/components/marketing/homepage-pricing.tsx` (lines 84–87)

### 5. Fade-in scroll initial state (Minor)

**Problem:** `FadeInOnScroll` renders `opacity-0` until IntersectionObserver fires. Content is in DOM but invisible before scroll/JS — can look like empty space in full-page captures and before hydration.

**Fix:**

- `fade-in-on-scroll.tsx` already respects `motion-reduce`. Extend fallback:
  - Add `supports-[not(intersection:1_of_1)]:opacity-100` or a no-JS CSS fallback
  - Or use `@starting-style` / reduce initial `translate-y` so content is readable if observer is slow
- Do not remove scroll animation for users who want it.

**File:** `src/components/marketing/fade-in-on-scroll.tsx`

### 6. Anchor scroll offset (Minor)

**Problem:** Fixed navbar (64px / `h-16`) overlaps section tops when jumping to `#features` or `#pricing`.

**Fix:**

- Add `scroll-padding-top: 5rem` (or `4.5rem`) on `html` in marketing layout, or on section targets via `scroll-mt-20`.
- Verify smooth scroll from navbar, mobile sheet, hero CTA, and footer links.

**Files:** `src/app/(marketing)/layout.tsx` or `globals.css`, section `id` attributes in feature/pricing components

---

## Acceptance criteria

- [ ] Mobile users can open nav menu and reach Features + Pricing
- [ ] Anchor jumps land with section headings visible below fixed navbar
- [ ] Social proof section renders between existing homepage sections
- [ ] Pro pricing badge no longer overlaps card border
- [ ] Below-fold content is readable before scroll on slow JS / reduced motion
- [ ] All seven original spec sections still present (`homepage-spec.md`)

---

## References

- `context/features/homepage-spec.md`
- `context/fixes/touch-targets-spec.md`
- Screenshots: `homepage-mobile.png`, `homepage-tablet.png`, `homepage-scrolled-full.png`
