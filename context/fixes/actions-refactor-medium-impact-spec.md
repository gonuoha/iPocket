# Server Actions — Medium-Impact DRY Refactor

## Overview

Second-phase cleanup of `src/actions` duplication: adopt existing subscription helpers, extract Prisma error handling and AI catch blocks, and reduce test boilerplate. Implement after the high-impact spec (`actions-refactor-high-impact-spec.md`).

**Source:** `docs/refactor-results/REFACTOR_SCAN_src-actions.md` (refactor-scanner, 2026-08-11).

**Prerequisite:** High-impact refactor complete (`ActionResult`, `requireSession`, `parseActionInput`, `requireAiAccess`).

---

## Requirements

### 1. Adopt subscription limit helpers (Major)

**Problem:** `createItem` and `createCollection` inline free-tier limit checks that duplicate logic already in `src/lib/subscription-limits.ts`:

```typescript
// items.ts — inline
if (!isPro) {
  const stats = await getUserItemStats(session.user.id);
  if (stats.itemCount >= FREE_ITEM_LIMIT) { ... }
}

// collections.ts — inline
if (!isPro) {
  const stats = await getUserItemStats(session.user.id);
  if (stats.collectionCount >= FREE_COLLECTION_LIMIT) { ... }
}
```

Existing helpers (used by UI, not actions):

```typescript
isAtItemLimit(count, isPro)
isAtCollectionLimit(count, isPro)
```

**Fix:**

- Add user-facing error message helpers to `src/lib/subscription-limits.ts`:

```typescript
export function itemLimitErrorMessage(): string {
  return `Free plan is limited to ${FREE_ITEM_LIMIT} items. Upgrade to Pro for unlimited items.`;
}

export function collectionLimitErrorMessage(): string {
  return `Free plan is limited to ${FREE_COLLECTION_LIMIT} collections. Upgrade to Pro for unlimited collections.`;
}
```

- Refactor `createItem`:

```typescript
const isPro = await getUserIsPro(userId);
if (!isPro) {
  const stats = await getUserItemStats(userId);
  if (isAtItemLimit(stats.itemCount, isPro)) {
    return { success: false, error: itemLimitErrorMessage() };
  }
}
```

- Refactor `createCollection` similarly with `isAtCollectionLimit` and `collectionLimitErrorMessage()`.
- Remove direct `FREE_ITEM_LIMIT` / `FREE_COLLECTION_LIMIT` imports from action files if only used for error strings.

**Files:**

- `src/lib/subscription-limits.ts`
- `src/lib/subscription-limits.test.ts` — add tests for new message helpers
- `src/actions/items.ts`
- `src/actions/collections.ts`

### 2. Extract Prisma unique-constraint helper (Medium)

**Problem:** `isUniqueConstraintError` is defined locally in `collections.ts` and used in `createCollection` and `updateCollection`.

**Fix:**

- Create `src/lib/db/prisma-errors.ts`:

```typescript
export function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}
```

- Import in `collections.ts`; remove local definition.
- Add `src/lib/db/prisma-errors.test.ts` with cases for P2002 object, non-Prisma errors, null.

**Files:**

- `src/lib/db/prisma-errors.ts` (new)
- `src/lib/db/prisma-errors.test.ts` (new)
- `src/actions/collections.ts`

### 3. Extract AI Gemini catch handler (Medium)

**Problem:** All four AI actions have identical catch blocks:

```typescript
} catch (error) {
  console.error("generateSummary failed:", error);
  return { success: false, error: "AI is temporarily unavailable" };
}
```

**Fix:**

- Create `src/lib/ai/handle-ai-error.ts`:

```typescript
import type { ActionResult } from "@/types/actions";

export function handleAiActionError(
  actionName: string,
  error: unknown,
): ActionResult<never> {
  console.error(`${actionName} failed:`, error);
  return { success: false, error: "AI is temporarily unavailable" };
}
```

- Replace all four catch blocks:

```typescript
} catch (error) {
  return handleAiActionError("generateSummary", error);
}
```

- Add `src/lib/ai/handle-ai-error.test.ts` — verify log + return shape.

**Consumers:** `generateSummary`, `generateAutoTags`, `explainCode`, `optimizePrompt`

**Files:**

- `src/lib/ai/handle-ai-error.ts` (new)
- `src/lib/ai/handle-ai-error.test.ts` (new)
- `src/actions/ai.ts`

### 4. Deduplicate AI guard tests (Medium)

**Problem:** `ai.test.ts` repeats the same four guard tests (unauthorized, validation, pro, rate-limit) for each of the four AI actions — 16 near-identical blocks.

**Fix:**

- Add `src/actions/__tests__/ai-guard-tests.ts` (or `src/actions/test-utils/ai-guards.ts`) with a shared runner:

```typescript
export function describeAiActionGuards(
  actionName: string,
  invoke: (input: unknown) => Promise<ActionResult<unknown>>,
  validInput: unknown,
  validationInput: unknown,
  validationError: string,
) { ... }
```

- Use `describe.each` over the four actions:

```typescript
describe.each([
  ["generateAutoTags", generateAutoTags, validInput, { ...validInput, title: "" }, "Title is required"],
  ["generateSummary", generateSummary, ...],
  // ...
])("%s guards", (name, action, valid, invalid, errMsg) => {
  describeAiActionGuards(name, action, valid, invalid, errMsg);
});
```

- Keep action-specific success-path and Gemini-failure tests in their existing `describe` blocks.
- Net reduction: ~120 lines in `ai.test.ts`.

**Files:**

- `src/actions/ai.test.ts`
- `src/actions/__tests__/ai-guard-tests.ts` (new, or equivalent shared util)

### 5. Toggle-mutation helper — deferred (Minor)

**Problem:** `toggleItemFavorite`, `toggleItemPin`, and `toggleCollectionFavorite` share auth → toggle → not-found → revalidate shape.

**Decision:** Do **not** extract yet. Only three occurrences with different revalidation helpers and error messages (`"Item not found"` vs `"Collection not found"`). Revisit when a fourth toggle action is added.

**Action:** No code change. Document in PR that this was intentionally deferred.

---

## Tests

- Extend `subscription-limits.test.ts` for message helpers.
- New tests for `prisma-errors.ts` and `handle-ai-error.ts`.
- Refactored `ai.test.ts` must cover the same guard scenarios with fewer lines.
- All existing action tests pass without behavior changes.

---

## Acceptance criteria

- [ ] `createItem` and `createCollection` use `isAtItemLimit` / `isAtCollectionLimit`
- [ ] Limit error messages unchanged from current user-facing strings
- [ ] `isUniqueConstraintError` lives in `src/lib/db/prisma-errors.ts`
- [ ] All four AI catch blocks use `handleAiActionError`
- [ ] `ai.test.ts` guard tests consolidated (no loss of coverage)
- [ ] Toggle-mutation helper explicitly deferred (not implemented)
- [ ] `npm test` passes
- [ ] `npm run lint` passes

---

## References

- `docs/refactor-results/REFACTOR_SCAN_src-actions.md`
- `context/fixes/actions-refactor-high-impact-spec.md` — prerequisite
- `src/lib/subscription-limits.ts` — existing limit helpers
- `src/actions/ai.test.ts` — guard test duplication
- `src/actions/collections.ts` — `isUniqueConstraintError` (lines 27–34)
