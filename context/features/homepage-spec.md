# Homepage

## Overview

Replace the current prototype HTML injection at `/` with a real Next.js marketing homepage built from `prototypes/homepage/`. Match the mockup's layout, copy, and animations while using Tailwind CSS, shadcn/ui, and existing app conventions.

**Route:** `/` (public, `(marketing)` route group)

---

## Requirements

### Replace placeholder implementation

- Remove `getHomepageMarkup()`, `dangerouslySetInnerHTML`, and the `prototypes/homepage/styles.css` import from the marketing layout
- Remove `public/homepage/script.js` usage once interactivity is ported to React
- Keep `prototypes/homepage/` as the visual reference only (do not ship prototype assets in production)

### Page sections (match mockup)

1. **Navbar** — fixed top bar: logo, anchor links (`#features`, `#pricing`), Sign In, Get Started
2. **Hero** — headline with gradient accent, subtitle, CTAs, and the chaos → arrow → dashboard visual
3. **Features** (`#features`) — 6 cards: Code Snippets, AI Prompts, Instant Search, Commands, Files & Docs, Collections
4. **AI** (`#ai`) — Pro badge, checklist, code editor mockup with AI-generated tags demo
5. **Pricing** (`#pricing`) — Free vs Pro cards, monthly/yearly toggle ($8/mo, $72/yr)
6. **CTA** — final signup prompt
7. **Footer** — logo, link columns, dynamic copyright year

### Visual & responsive behavior

- Dark theme consistent with the app
- Item-type accent colors on feature cards and dashboard mockup cards (use system item type colors from seed/`getItemTypeStyles`, not hardcoded prototype values)
- Hero visual stacks vertically on mobile; transform arrow rotates 90° to point down
- Smooth scroll for in-page anchor links (`#features`, `#pricing`)
- Scroll fade-in for below-the-fold sections
- Navbar gains stronger background/border after scrolling

### Animations (client-only)

- **Chaos icons:** `requestAnimationFrame` drift, wall bounce, cursor repulsion, rotation, scale pulse (port logic from `prototypes/homepage/script.js`)
- **Transform arrow:** CSS pulse
- **Scroll reveal:** IntersectionObserver (or equivalent) for section fade-in
- Respect `prefers-reduced-motion` — disable chaos animation and reduce motion elsewhere

---

## Component architecture

Split into server and client components. Default to server; add `'use client'` only where browser APIs or local state are required.

```
src/components/marketing/
  homepage-navbar.tsx          # client — scroll state
  homepage-hero.tsx            # server — composes hero text + visual
  homepage-hero-visual.tsx     # server — layout wrapper
  chaos-animation.tsx          # client — icon physics
  dashboard-preview.tsx        # server — static mockup
  homepage-features.tsx        # server
  homepage-ai-section.tsx      # server
  homepage-pricing.tsx         # client — billing period toggle
  homepage-cta.tsx             # server
  homepage-footer.tsx          # server
  fade-in-on-scroll.tsx        # client — reusable scroll reveal wrapper
```

`src/app/(marketing)/page.tsx` should compose these sections. Keep shared copy, feature lists, and pricing tiers in a small `src/lib/marketing/homepage-content.ts` constant file to stay DRY.

Use shadcn `Button`, `Badge`, and `cn()` from the project. Prefer `Link` from `next/link` over raw `<a>` for internal routes.

---

## Links & navigation

| Element | Destination |
| --- | --- |
| Logo | `/` |
| Sign In | `/sign-in` |
| Get Started / Get Started Free / Upgrade to Pro | `/register` |
| Features (nav, footer, hero secondary CTA) | `#features` |
| Pricing (nav, footer) | `#pricing` |
| Footer placeholders (Changelog, About, Blog, Contact, Privacy, Terms) | `#` until real pages exist |

When the user is authenticated, optional enhancement: show **Dashboard** instead of Sign In / Get Started in the navbar (use `auth()` in the marketing layout or a small server wrapper). Not required for v1 if scope is tight.

Logged-in users visiting `/` are not redirected (homepage stays public).

---

## Technical notes

- Marketing layout keeps page `metadata` (title, description); remove Inter override if `globals.css` already sets the app font
- Hero dashboard mockup is decorative — static markup, not live dashboard data
- Pricing toggle is UI-only (no Stripe checkout yet); all upgrade buttons go to `/register`
- Copyright year: render with `new Date().getFullYear()` in a server component
- No new API routes or database queries needed
- Follow Tailwind v4 conventions (`globals.css` `@theme`, no `tailwind.config`)

---

## Cleanup checklist

- [ ] Delete `src/lib/marketing/get-homepage-markup.ts`
- [ ] Remove `public/homepage/script.js` if no longer referenced
- [ ] Remove prototype CSS import from `(marketing)/layout.tsx`

---

## References

- Visual & copy source: `prototypes/homepage/` (`index.html`, `styles.css`, `script.js`)
- Mockup spec: `context/features/homepage-mockup-spec.md`
- Item type colors/icons: `src/lib/item-type-styles.ts`, `prisma/seed.ts`
- Auth routes: `/sign-in`, `/register`
