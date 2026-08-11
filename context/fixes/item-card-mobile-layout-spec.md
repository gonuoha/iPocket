# Item Card Mobile Layout

## Overview

Improve item card readability on narrow viewports. UI review found awkward title truncation, inconsistent metadata placement, and cramped header actions on the items list page.

**Source:** UI review (Playwright), screenshot: `items-snippet-mobile.png`.

---

## Requirements

### 1. Title truncation (Medium)

**Problem:** Titles use `truncate` in a flex row with date and pin icon, producing mid-word cuts like "Compound Component Patt.." and "Docker Compose for Next.js + Postg...".

**Fix:**

- Use `line-clamp-2` on title instead of single-line `truncate` for card view.
- On mobile (`< sm`), move date to a dedicated metadata row below the title (see §2) so the title gets full width.
- Prefer word boundaries: `break-words` + `line-clamp-2`; avoid fixed max-width that fights the grid.

**File:** `src/components/items/item-card.tsx`

### 2. Consistent metadata row (Medium)

**Problem:** Pin icon sits inline with title on some cards; date is top-right on others. Layout shifts between pinned and unpinned items.

**Fix:**

- Standardize card header:
  ```
  [icon]  Title (line-clamp-2)
          Description (line-clamp-2 or 3)
          [pin?] · [date]     ← single metadata row, muted text
  ```
- Pin: small icon or "Pinned" label in metadata row, not inline with title.
- Date: always in metadata row on mobile; may stay top-right on `sm+` if space allows without truncating title.

**File:** `src/components/items/item-card.tsx`

### 3. Description clamp on mobile (Minor)

**Problem:** `line-clamp-3` is fine on desktop but with tall titles leaves little room on mobile.

**Fix:**

- Use `line-clamp-2` below `sm`, keep `line-clamp-3` at `sm+`.
- Or fixed card min-height only if needed for grid alignment — prefer content-driven height.

**File:** `src/components/items/item-card.tsx`

### 4. Absolute action buttons vs content (Minor)

**Problem:** Favorite (`top-3 right-3`) and copy (`bottom-3 right-3`) overlap long titles/descriptions on small cards.

**Fix:**

- Add right padding to card content: `pr-12` already exists — verify it clears favorite button; bump to `pr-14` if copy button overlaps description.
- Consider stacking favorite + copy in a vertical action column on the right for mobile only.

**Files:** `item-card.tsx`, `item-favorite-button.tsx`, `item-copy-button.tsx`

---

## Out of scope

- Top bar "New Item" size and star icon tap targets — see `touch-targets-spec.md` and `dashboard-ui-fixes-spec.md`
- Item row layout on favorites page — separate component; apply same patterns if issues reproduce there

---

## Acceptance criteria

- [ ] Item titles on 375px show up to 2 lines before ellipsis, without competing with date in the same row
- [ ] Pin and date appear in a consistent metadata row across pinned and unpinned cards
- [ ] No overlap between action buttons and title/description text
- [ ] Grid layout unchanged at `sm`, `xl` breakpoints
- [ ] Item drawer open behavior unchanged

---

## References

- `src/components/items/item-card.tsx`
- `context/features/item-list-view-spec.md`
- Screenshot: `.ui-review/output/screenshots/items-snippet-mobile.png`
