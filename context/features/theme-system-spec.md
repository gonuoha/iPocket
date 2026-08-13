# Theme System — Slate Horizon

## Overview

Replace the current neutral grayscale palette with a cohesive **Slate Horizon** theme: cool blue-tinted surfaces, sky-blue primary accents, and harmonized semantic colors for item types. The theme targets software engineers, researchers, and students who spend long sessions saving, searching, and reading snippets — it should feel focused and calm, not flashy.

**Default mode:** dark (unchanged). **Also ship:** a matching light mode token set so a future appearance toggle can be added without rework.

**Visual reference (current UI):** `.ui-review/output/screenshots/` — dashboard, items list, homepage, auth, settings.

**Inspiration palette (user-provided):**

| Swatch | Role | Approx. hex | oklch |
| --- | --- | --- | --- |
| Sky blue | Primary accent, links, focus rings | `#5BB5E8` | `oklch(0.72 0.13 225)` |
| Pale blue | Muted surfaces, secondary fills (light mode) | `#B8DFF0` | `oklch(0.88 0.06 225)` |
| Cool off-white | Light-mode background | `#EEF2F6` | `oklch(0.96 0.01 240)` |
| Pure white | Cards, elevated surfaces (light mode) | `#FFFFFF` | `oklch(1 0 0)` |

The current near-black base is retained as a **companion variant** (`Obsidian`, see Alternatives) — Slate Horizon is the new default dark palette, not a light-only theme.

---

## Design principles

1. **Reduce eye strain** — Avoid pure `#000` / `#fff` pairings. Use blue-shifted neutrals so long reading sessions (notes, markdown, search results) feel softer than a generic IDE theme.
2. **Color carries meaning** — Item-type hues stay distinct and saturated enough to scan quickly; UI chrome stays muted so content colors pop.
3. **Hierarchy through surface, not shadow** — Dark mode uses 3–4 surface steps (background → card → muted → accent). No heavy drop shadows.
4. **Accessible contrast** — Body text ≥ 4.5:1 on its surface; large text and UI labels ≥ 3:1. Primary buttons must pass 4.5:1 for label text.
5. **Token-first** — All theme colors flow from CSS custom properties in `globals.css`. No new hardcoded hex/oklch in components except Monaco syntax highlighting (editor-only).
6. **Dark-first, light-ready** — Implement both `:root` (light) and `.dark` blocks even if the app still forces `.dark` on `<html>`.

---

## Theme identity: Slate Horizon

**Personality:** A quiet research workspace — think annotated papers, terminal sessions, and bookmarked docs. Cool, trustworthy, slightly academic. Distinct from generic "startup purple gradient" or "GitHub green" themes.

**What changes vs. today:**

| Area | Current | Slate Horizon |
| --- | --- | --- |
| Dark background | Neutral `oklch(0.145 0 0)` | Deep blue-slate `oklch(0.145 0.018 245)` |
| Cards / sidebar | Neutral gray steps | Blue-tinted slate steps |
| Primary (buttons, focus) | White / near-white | Sky blue (`--primary`) |
| Primary CTA text | Black on white button | Dark slate on sky blue |
| Marketing gradients | White + pink tail | Sky blue → pale blue → soft violet |
| Markdown / prose | Hardcoded neutral oklch | Uses `--foreground`, `--muted-foreground`, `--primary` |
| Item type colors | Tailwind-default hex | Harmonized set (same semantics, cooler/warmer balance) |

---

## Color tokens

All values use **oklch**. Update `:root` (light) and `.dark` in `src/app/globals.css`. Do **not** create `tailwind.config.*` (Tailwind v4).

### Shared

```css
--radius: 0.625rem; /* unchanged */

/* Semantic — same in both modes */
--destructive: oklch(0.58 0.22 25);          /* light */
--destructive: oklch(0.65 0.20 22);            /* .dark — slightly brighter for dark bg */
```

### Light mode (`:root`)

```css
--background: oklch(0.96 0.01 240);           /* cool off-white */
--foreground: oklch(0.20 0.025 245);          /* deep slate text */

--card: oklch(1 0 0);                         /* pure white */
--card-foreground: oklch(0.20 0.025 245);

--popover: oklch(1 0 0);
--popover-foreground: oklch(0.20 0.025 245);

--primary: oklch(0.55 0.14 225);              /* deeper sky blue — contrast on white */
--primary-foreground: oklch(0.99 0.005 240);

--secondary: oklch(0.92 0.02 230);            /* pale blue wash */
--secondary-foreground: oklch(0.25 0.03 245);

--muted: oklch(0.93 0.015 235);
--muted-foreground: oklch(0.50 0.02 245);

--accent: oklch(0.90 0.03 225);               /* hover / selected row */
--accent-foreground: oklch(0.22 0.03 245);

--border: oklch(0.88 0.015 235);
--input: oklch(0.88 0.015 235);
--ring: oklch(0.55 0.14 225);

--chart-1: oklch(0.55 0.14 225);
--chart-2: oklch(0.60 0.12 280);
--chart-3: oklch(0.65 0.14 160);
--chart-4: oklch(0.60 0.16 50);
--chart-5: oklch(0.50 0.02 245);

--sidebar: oklch(0.98 0.008 240);
--sidebar-foreground: oklch(0.20 0.025 245);
--sidebar-primary: oklch(0.55 0.14 225);
--sidebar-primary-foreground: oklch(0.99 0.005 240);
--sidebar-accent: oklch(0.92 0.02 230);
--sidebar-accent-foreground: oklch(0.22 0.03 245);
--sidebar-border: oklch(0.88 0.015 235);
--sidebar-ring: oklch(0.55 0.14 225);
```

### Dark mode (`.dark`) — **default shipped experience**

```css
--background: oklch(0.145 0.018 245);         /* deep blue-slate (not pure black) */
--foreground: oklch(0.96 0.008 240);          /* cool white */

--card: oklch(0.19 0.020 245);
--card-foreground: oklch(0.96 0.008 240);

--popover: oklch(0.19 0.020 245);
--popover-foreground: oklch(0.96 0.008 240);

--primary: oklch(0.72 0.13 225);              /* sky blue — from inspiration swatch */
--primary-foreground: oklch(0.16 0.025 245);  /* dark slate on primary buttons */

--secondary: oklch(0.24 0.022 245);
--secondary-foreground: oklch(0.92 0.008 240);

--muted: oklch(0.24 0.022 245);
--muted-foreground: oklch(0.68 0.02 240);

--accent: oklch(0.27 0.028 240);              /* sidebar hover, selected nav */
--accent-foreground: oklch(0.96 0.008 240);

--border: oklch(0.96 0.01 240 / 10%);
--input: oklch(0.96 0.01 240 / 14%);
--ring: oklch(0.72 0.13 225 / 55%);

--chart-1: oklch(0.72 0.13 225);
--chart-2: oklch(0.65 0.14 285);
--chart-3: oklch(0.70 0.12 165);
--chart-4: oklch(0.72 0.14 55);
--chart-5: oklch(0.55 0.02 245);

--sidebar: oklch(0.17 0.019 245);             /* slightly darker than main bg */
--sidebar-foreground: oklch(0.92 0.01 240);
--sidebar-primary: oklch(0.72 0.13 225);
--sidebar-primary-foreground: oklch(0.16 0.025 245);
--sidebar-accent: oklch(0.24 0.025 242);
--sidebar-accent-foreground: oklch(0.96 0.008 240);
--sidebar-border: oklch(0.96 0.01 240 / 10%);
--sidebar-ring: oklch(0.72 0.13 225 / 50%);
```

### Extended semantic tokens (add to both modes)

Add these **new** custom properties for areas that today use hardcoded colors. Map them in `@theme inline` so Tailwind utilities exist (`bg-prose-code`, `text-prose-link`, etc.).

```css
/* In :root and .dark — values differ per mode */

--prose-link: var(--primary);
--prose-link-hover: /* light: oklch(0.48 0.15 225); dark: oklch(0.78 0.12 225) */;
--prose-code-bg: /* light: oklch(0.92 0.02 235); dark: oklch(0.26 0.02 245) */;
--prose-pre-bg: /* light: oklch(0.94 0.015 240); dark: oklch(0.22 0.022 245) */;
--scrollbar-thumb: /* light: oklch(0.70 0.02 240 / 40%); dark: oklch(0.68 0.02 240 / 40%) */;
--scrollbar-thumb-hover: /* 60% opacity variant */;
--overlay: oklch(0.14 0.02 245 / 50%);        /* dialog/sheet backdrop — replace bg-black/10 */
--gradient-hero-from: var(--primary);
--gradient-hero-via: oklch(0.78 0.10 230);    /* pale blue */
--gradient-hero-to: oklch(0.62 0.14 285);     /* soft violet — replaces pink tail */
--gradient-cta-from: oklch(0.72 0.13 225 / 15%);
--gradient-cta-to: oklch(0.62 0.14 285 / 10%);
--favorite: oklch(0.82 0.16 85);              /* star / favorite — warm gold, unchanged role */
```

Register in `@theme inline`:

```css
--color-prose-link: var(--prose-link);
--color-prose-code-bg: var(--prose-code-bg);
--color-prose-pre-bg: var(--prose-pre-bg);
--color-overlay: var(--overlay);
--color-favorite: var(--favorite);
```

---

## Item type semantic colors

Update the canonical constant in **one place** and keep seed data in sync.

| Type | Current | Slate Horizon | Rationale |
| --- | --- | --- | --- |
| snippet | `#3b82f6` | `#4DA3E8` | Aligns with primary sky-blue family |
| prompt | `#8b5cf6` | `#9B8AFB` | Cooler violet, less neon on slate |
| command | `#f97316` | `#E8944A` | Warm orange — shell/terminal association |
| note | `#fde047` | `#D4B84A` | Amber note — readable on dark without glare |
| file | `#6b7280` | `#7B8A9A` | Cool slate gray |
| image | `#ec4899` | `#D46BA8` | Softer magenta |
| link | `#10b981` | `#3DB88A` | Teal-green — distinct from primary blue |

**Files to update:**

- `src/lib/marketing/homepage-content.ts` — `SYSTEM_ITEM_TYPE_COLORS`
- `prisma/seed.ts` — `itemTypes` color fields

**Do not** run a data migration for existing production rows in this task. Seed + constants are the source of truth for new environments; document that existing DB type colors update on re-seed only.

---

## Component & file changes

### 1. `src/app/globals.css` (primary)

- Replace `:root` and `.dark` token blocks with values above.
- Add extended semantic tokens and `@theme inline` mappings.
- Refactor `.markdown-preview` rules to use `var(--foreground)`, `var(--muted-foreground)`, `var(--prose-link)`, `var(--prose-code-bg)`, `var(--prose-pre-bg)` instead of hardcoded `oklch(...)`.
- Refactor `.code-editor` and `.markdown-editor` scrollbar rules to use `--scrollbar-thumb` / `--scrollbar-thumb-hover`.
- Add utility class `.text-gradient-hero` for marketing headlines:

```css
.text-gradient-hero {
  background-image: linear-gradient(
    135deg,
    var(--gradient-hero-from),
    var(--gradient-hero-via),
    var(--gradient-hero-to)
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

### 2. Marketing components

| File | Change |
| --- | --- |
| `homepage-hero.tsx` | Replace inline `backgroundImage` gradient with `text-gradient-hero` class |
| `homepage-ai-section.tsx` | Same gradient treatment for accent headline text |
| `homepage-cta.tsx` | Replace `from-primary/15 to-pink-500/10` with `from-[var(--gradient-cta-from)] to-[var(--gradient-cta-to)]` or a small `.bg-gradient-cta` class in globals.css |
| `homepage-features.tsx` | No structural change — uses `SYSTEM_ITEM_TYPE_COLORS` |
| `dashboard-preview.tsx` | No change — uses item type colors |

### 3. Overlay / backdrop

Replace `bg-black/10` on dialog and alert-dialog overlays with `bg-overlay` (or `bg-[var(--color-overlay)]` if utility naming differs). Keep `backdrop-blur-xs`.

Files:

- `src/components/ui/dialog.tsx`
- `src/components/ui/alert-dialog.tsx`
- Check Sheet component if it uses `bg-black/*`

### 4. Favorites (stars)

Where star icons use `text-yellow-400` or similar Tailwind yellow, switch to `text-favorite` so gold stays consistent and theme-aware.

Search for: `yellow-400`, `yellow-500`, `text-amber`

### 5. Sonner toasts

`src/components/ui/sonner.tsx` uses `theme="dark"`. Leave as-is until a user-facing theme toggle exists.

### 6. Root layout

`src/app/layout.tsx` — keep `className="dark ..."` on `<html>`. No `next-themes` in this task.

### 7. Monaco editor

**Out of scope** for app chrome — editor themes (`vs-dark`, `monokai`, `github-dark`) remain user preferences in settings. Optionally tweak `src/lib/monaco-themes.ts` custom theme background to `oklch(0.19 0.020 245)` so the editor pane blends with card surfaces — only if visually jarring after token update.

---

## Alternative themes (document only — do not implement unless asked)

These are vetted directions for a future `data-theme` attribute or settings toggle.

### Obsidian (current direction, refined)

Neutral chroma-0 palette; primary stays high-contrast white on dark. Best for users who want a VS Code–like feel. Use if Slate Horizon feedback says "too blue."

### Paper (light-first)

`:root` tokens as default; minimal chrome; `#EEF2F6` background. Ideal for students in bright environments. Ship when light-mode toggle lands.

### Terminal

`--background: oklch(0.12 0.03 155)` (deep green-black), `--primary: oklch(0.75 0.15 145)` (phosphor green), muted item-type colors. Niche; high nostalgia for CLI users.

### Ink & Amber

Dark base `oklch(0.13 0.01 50)` (warm charcoal), `--primary: oklch(0.72 0.14 65)` (amber). Research / academic journal vibe; pairs well with long-form notes.

---

## Accessibility checklist

Before marking complete, verify in browser (dark mode):

- [ ] Body text on `--background` and `--card` ≥ 4.5:1
- [ ] `--muted-foreground` on `--background` ≥ 4.5:1 (metadata, dates, placeholders)
- [ ] `--primary` button label (`--primary-foreground`) ≥ 4.5:1
- [ ] Focus ring (`--ring`) visible on inputs and buttons
- [ ] Item type colors on `--card` background ≥ 3:1 for icons and left borders
- [ ] Favorite star (`--favorite`) ≥ 3:1 on sidebar
- [ ] `prefers-reduced-motion` unchanged (no new animations)

Use DevTools contrast checker or WebAIM on: dashboard, items grid, item drawer, sign-in, homepage hero.

---

## Implementation steps

1. Update `globals.css` token blocks (`:root`, `.dark`) and extended semantics.
2. Refactor markdown preview + scrollbar CSS to use tokens.
3. Add `@theme inline` entries for new semantic colors.
4. Update marketing gradient usage (hero, AI section, CTA).
5. Replace overlay `bg-black/10` with `--overlay`.
6. Update `SYSTEM_ITEM_TYPE_COLORS` and `prisma/seed.ts`.
7. Grep for remaining hardcoded theme colors: `oklch(`, `pink-500`, `bg-black`, `text-yellow-4` — fix or justify.
8. Run `npm run lint`, `npm test`, `npm run build`.
9. Visual check against `.ui-review/output/screenshots/` — same layout, updated palette.

---

## Acceptance criteria

- [ ] Dark mode uses blue-slate surfaces and sky-blue primary (not neutral gray / white primary).
- [ ] Light mode tokens exist in `:root` even if not user-selectable yet.
- [ ] No new hardcoded hex/oklch in components (except Monaco syntax colors in `homepage-ai-section.tsx` demo block).
- [ ] Markdown preview respects theme tokens in both modes (toggle `.dark` on `<html>` locally to verify).
- [ ] Marketing homepage gradient uses blue → violet, not pink.
- [ ] Item type colors updated in constants + seed.
- [ ] Dialog/sheet overlays use `--overlay`.
- [ ] Lint, tests, and build pass.

---

## Out of scope

- User-facing theme picker / `next-themes` integration (follow-up spec).
- Persisting appearance preference in the database.
- Changing Monaco editor theme list or defaults.
- Migrating existing `ItemType.color` rows in production DB.
- Redesigning layout, typography, or spacing.

---

## References

- Current tokens: `src/app/globals.css`
- UI screenshots: `.ui-review/output/screenshots/`
- Item type colors: `src/lib/marketing/homepage-content.ts`, `prisma/seed.ts`, `src/lib/item-type-styles.ts`
- Marketing: `src/components/marketing/`
- Coding standards (Tailwind v4, dark-first): `context/coding-standards.md`
- Homepage spec (gradients, item colors): `context/features/homepage-spec.md`
