# Server Actions — High-Impact DRY Refactor

## Overview

Extract duplicated boilerplate from the four server action modules (`items.ts`, `collections.ts`, `settings.ts`, `ai.ts`) into shared types and helpers. This removes ~100–120 LOC of copy-paste and establishes a consistent action pattern for future mutations.

**Source:** `docs/refactor-results/REFACTOR_SCAN_src-actions.md` (refactor-scanner, 2026-08-11).

**Prerequisite:** None. Implement in the order below — each step unblocks the next.

---

## Requirements

### 1. Shared `ActionResult<T>` type (Major)

**Problem:** The same discriminated union is defined in all four action files.

**Fix:**

- Create `src/types/actions.ts` with:

```typescript
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

- Remove local `ActionResult` definitions from:
  - `src/actions/items.ts`
  - `src/actions/collections.ts`
  - `src/actions/settings.ts`
  - `src/actions/ai.ts`
- Import `ActionResult` from `@/types/actions` in each file.

**Files:**

- `src/types/actions.ts` (new)
- All four action modules

### 2. `requireSession()` helper (Major)

**Problem:** 14 identical auth guards across action functions:

```typescript
const session = await auth();
if (!session?.user?.id) {
  return { success: false, error: "Unauthorized" };
}
```

**Fix:**

- Create `src/lib/actions/require-session.ts`:

```typescript
import { auth } from "@/auth";
import type { ActionResult } from "@/types/actions";

type SessionSuccess = { userId: string };
type SessionFailure = ActionResult<never>;

export async function requireSession(): Promise<SessionSuccess | SessionFailure> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  return { userId: session.user.id };
}
```

- Replace all 14 auth guard blocks with:

```typescript
const sessionResult = await requireSession();
if (!sessionResult.success) {
  return sessionResult;
}
const { userId } = sessionResult;
```

- Use `userId` instead of `session.user.id` in the function body.
- Remove direct `auth` imports from action files that no longer call `auth()` directly.

**Call sites:**

| File | Functions |
| --- | --- |
| `items.ts` | `createItem`, `updateItem`, `deleteItem`, `toggleItemFavorite`, `toggleItemPin` |
| `collections.ts` | `createCollection`, `updateCollection`, `deleteCollection`, `toggleCollectionFavorite` |
| `settings.ts` | `updateEditorPreferences` |
| `ai.ts` | `generateSummary`, `generateAutoTags`, `explainCode`, `optimizePrompt` |

**Files:**

- `src/lib/actions/require-session.ts` (new)
- All four action modules

### 3. `parseActionInput()` helper (Major)

**Problem:** 9 identical Zod validation blocks:

```typescript
const parsed = someSchema.safeParse(data);
if (!parsed.success) {
  return {
    success: false,
    error: parsed.error.issues[0]?.message ?? "Invalid input",
  };
}
```

**Fix:**

- Create `src/lib/actions/parse-action-input.ts`:

```typescript
import type { ZodType } from "zod";
import type { ActionResult } from "@/types/actions";

type ParseSuccess<T> = { success: true; data: T };
type ParseFailure = ActionResult<never>;

export function parseActionInput<T>(
  schema: ZodType<T>,
  data: unknown,
): ParseSuccess<T> | ParseFailure {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  return { success: true, data: parsed.data };
}
```

- Replace all 9 validation blocks. Pattern at top of each validated action:

```typescript
const sessionResult = await requireSession();
if (!sessionResult.success) return sessionResult;
const { userId } = sessionResult;

const parsed = parseActionInput(createItemSchema, data);
if (!parsed.success) return parsed;
// use parsed.data
```

**Call sites:**

| File | Functions | Schema |
| --- | --- | --- |
| `items.ts` | `createItem`, `updateItem` | `createItemSchema`, `updateItemSchema` |
| `collections.ts` | `createCollection`, `updateCollection` | `createCollectionSchema`, `updateCollectionSchema` |
| `settings.ts` | `updateEditorPreferences` | `editorPreferencesSchema` |
| `ai.ts` | All four AI actions | Respective `*Schema` from `@/lib/validations/ai` |

**Files:**

- `src/lib/actions/parse-action-input.ts` (new)
- All four action modules

### 4. `requireAiAccess()` helper (Major)

**Problem:** All four AI actions repeat Pro subscription + rate-limit checks (~17 lines each):

```typescript
const isPro = await getUserIsPro(session.user.id);
if (!isPro) {
  return { success: false, error: "AI features require a Pro subscription" };
}
const rateLimit = await checkAiRateLimit(session.user.id);
if (!rateLimit.success) {
  return { success: false, error: "You've reached your AI limit. Try again later." };
}
```

**Fix:**

- Create `src/lib/actions/require-ai-access.ts`:

```typescript
import { getUserIsPro } from "@/lib/db/user";
import { checkAiRateLimit } from "@/lib/rate-limit";
import type { ActionResult } from "@/types/actions";

type AiAccessSuccess = { success: true };
type AiAccessFailure = ActionResult<never>;

export async function requireAiAccess(
  userId: string,
): Promise<AiAccessSuccess | AiAccessFailure> {
  const isPro = await getUserIsPro(userId);

  if (!isPro) {
    return {
      success: false,
      error: "AI features require a Pro subscription",
    };
  }

  const rateLimit = await checkAiRateLimit(userId);

  if (!rateLimit.success) {
    return {
      success: false,
      error: "You've reached your AI limit. Try again later.",
    };
  }

  return { success: true };
}
```

- Call after session + input validation in each AI action:

```typescript
const access = await requireAiAccess(userId);
if (!access.success) return access;
```

- Remove direct `getUserIsPro` and `checkAiRateLimit` imports from `ai.ts` if no longer used.

**Consumers:** `generateSummary`, `generateAutoTags`, `explainCode`, `optimizePrompt`

**Files:**

- `src/lib/actions/require-ai-access.ts` (new)
- `src/actions/ai.ts`

---

## Tests

- Add unit tests for each new helper in co-located `*.test.ts` files:
  - `src/lib/actions/require-session.test.ts`
  - `src/lib/actions/parse-action-input.test.ts`
  - `src/lib/actions/require-ai-access.test.ts`
- Run existing action tests — all must pass unchanged (same error messages, same behavior).
- No changes to `ai.test.ts` guard assertions expected; mocks for `@/auth`, `getUserIsPro`, `checkAiRateLimit` still apply at the action boundary.

---

## Acceptance criteria

- [ ] `ActionResult<T>` defined once in `src/types/actions.ts`
- [ ] No local `ActionResult` type in any action file
- [ ] `requireSession()` used at all 14 auth guard sites
- [ ] `parseActionInput()` used at all 9 validation sites
- [ ] `requireAiAccess()` used in all four AI actions
- [ ] Error messages unchanged: `"Unauthorized"`, `"Invalid input"`, Pro/rate-limit strings
- [ ] `npm test` passes
- [ ] `npm run lint` passes
- [ ] No new `'use client'` or API route changes

---

## References

- `docs/refactor-results/REFACTOR_SCAN_src-actions.md`
- `src/actions/items.ts`, `collections.ts`, `settings.ts`, `ai.ts`
- `context/coding-standards.md` — Server Actions conventions
- `src/lib/rate-limit.ts` — existing `checkAiRateLimit`
