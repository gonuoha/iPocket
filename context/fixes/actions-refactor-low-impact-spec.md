# Server Actions — Low-Impact Test Cleanup

## Overview

Consolidate duplicated test fixtures and mock setup across the four action test files. Pure test hygiene — no production code changes. Implement after high- and medium-impact refactors when touching action tests.

**Source:** `docs/refactor-results/REFACTOR_SCAN_src-actions.md` (refactor-scanner, 2026-08-11).

**Prerequisite:** Optional. Can be done independently or alongside medium-impact `ai.test.ts` cleanup.

---

## Requirements

### 1. Shared `defaultStats` fixture (Minor)

**Problem:** Identical stats object defined in two test files:

```typescript
const defaultStats = {
  itemCount: 0,
  collectionCount: 0,
  favoriteItemCount: 0,
  favoriteCollectionCount: 0,
  pinnedCount: 0,
};
```

**Locations:**

- `src/actions/items.test.ts` (lines 82–88)
- `src/actions/collections.test.ts` (lines 49–55)

**Fix:**

- Create `src/actions/__tests__/fixtures.ts`:

```typescript
import type { UserItemStats } from "@/lib/db/items"; // or inline type if not exported

export const defaultStats = {
  itemCount: 0,
  collectionCount: 0,
  favoriteItemCount: 0,
  favoriteCollectionCount: 0,
  pinnedCount: 0,
} satisfies UserItemStats; // adjust type import as needed
```

- Import `defaultStats` in `items.test.ts` and `collections.test.ts`.
- Remove local definitions.

**Files:**

- `src/actions/__tests__/fixtures.ts` (new)
- `src/actions/items.test.ts`
- `src/actions/collections.test.ts`

### 2. Shared auth mock setup (Minor)

**Problem:** All four action test files repeat the same `@/auth` mock:

```typescript
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));
```

Plus identical `mockAuth` setup and common `beforeEach` patterns for session mocking.

**Fix:**

- Create `src/actions/__tests__/mock-auth.ts`:

```typescript
import { vi } from "vitest";

export const mockAuth = vi.fn();

vi.mock("@/auth", () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
}));

export function mockAuthenticatedSession(userId = "user-1") {
  mockAuth.mockResolvedValue({ user: { id: userId } } as never);
}

export function mockUnauthenticated() {
  mockAuth.mockResolvedValue(null);
}
```

**Usage in test files:**

```typescript
import { mockAuth, mockAuthenticatedSession, mockUnauthenticated } from "./__tests__/mock-auth";

beforeEach(() => {
  vi.clearAllMocks();
  mockAuthenticatedSession();
});
```

- Apply to all four test files:
  - `items.test.ts`
  - `collections.test.ts`
  - `settings.test.ts`
  - `ai.test.ts`

**Note:** Vitest hoists `vi.mock` calls. The shared mock file must be imported at the top of each test file (before action imports) so the mock is registered. Follow the existing pattern in the codebase — if a single shared mock module causes hoisting issues, keep `vi.mock("@/auth")` in each file but export only the helper functions (`mockAuthenticatedSession`, `mockUnauthenticated`) from the shared module.

**Files:**

- `src/actions/__tests__/mock-auth.ts` (new)
- All four `src/actions/*.test.ts` files

### 3. Optional: shared test session user ID (Minor)

**Problem:** `"user-1"` string repeated across dozens of test assertions.

**Fix (optional, only if doing items 1–2):**

- Export `TEST_USER_ID = "user-1"` from `fixtures.ts`.
- Use in mock helpers and assertions where a user id is needed.

Do not refactor every hardcoded `"user-1"` if it makes diffs noisy — focus on `beforeEach` setup and new tests.

---

## Out of scope

- Production action code changes
- New action helper extractions (covered by high/medium specs)
- E2E or Playwright tests

---

## Acceptance criteria

- [ ] `defaultStats` defined once in `src/actions/__tests__/fixtures.ts`
- [ ] `items.test.ts` and `collections.test.ts` import shared fixture
- [ ] Auth mock helpers shared across all four action test files
- [ ] No change to test assertions or expected error messages
- [ ] `npm test` passes
- [ ] `npm run lint` passes

---

## References

- `docs/refactor-results/REFACTOR_SCAN_src-actions.md`
- `context/fixes/actions-refactor-high-impact-spec.md`
- `context/fixes/actions-refactor-medium-impact-spec.md`
- `src/actions/items.test.ts`, `collections.test.ts`, `settings.test.ts`, `ai.test.ts`
