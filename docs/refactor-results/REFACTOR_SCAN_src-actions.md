# Refactor Scan: `src/actions`

**Scanned:** 2026-08-11
**Agent:** refactor-scanner
**Scope:** `src/actions` (4 production files + 4 test files)

## Summary

The four action modules share substantial boilerplate: duplicated `ActionResult<T>` (4×), auth guards (14×), and Zod `safeParse` error handling (9×). `ai.ts` repeats Pro + rate-limit guards and Gemini error handling four times each. Roughly **150–200 LOC** reducible; `ai.ts` accounts for ~80 LOC of internal duplication.

## High impact

#### Duplicate `ActionResult<T>` type

- **Impact:** High
- **Category:** Type
- **Occurrences:** 4
- **Files:**
  - `src/actions/items.ts` (lines 28–30)
  - `src/actions/collections.ts` (lines 23–25)
  - `src/actions/settings.ts` (lines 10–12)
  - `src/actions/ai.ts` (lines 33–35)
- **Duplicated pattern:** Identical discriminated union for action success/failure
- **Suggested extraction:**
  - **Target:** `src/types/actions.ts` → `ActionResult<T>`
  - **Consumers:** All four action modules
- **Caveats:** None — zero behavioral risk

#### Duplicate auth guard

- **Impact:** High
- **Category:** Utility
- **Occurrences:** 14
- **Files:**
  - `src/actions/items.ts` (lines 39–43, 126–130, 173–177, 210–214, 236–240)
  - `src/actions/collections.ts` (lines 39–43, 103–107, 146–150, 166–170)
  - `src/actions/settings.ts` (lines 17–21)
  - `src/actions/ai.ts` (lines 84–88, 169–173, 259–263, 348–352)
- **Duplicated pattern:** `auth()` call + unauthorized return
- **Suggested extraction:**
  - **Target:** `src/lib/actions/require-session.ts` → `requireSession()`
  - **Signature:** `async function requireSession(): Promise<{ userId: string } | ActionError>`
  - **Consumers:** All action functions
- **Caveats:** None

#### Duplicate Zod `safeParse` + first-issue error

- **Impact:** High
- **Category:** Utility
- **Occurrences:** 9
- **Files:**
  - `src/actions/items.ts` (lines 45–52, 132–139)
  - `src/actions/collections.ts` (lines 45–52, 109–116)
  - `src/actions/settings.ts` (lines 23–30)
  - `src/actions/ai.ts` (lines 90–97, 175–182, 265–272, 354–361)
- **Duplicated pattern:** Schema validation with first Zod issue as error message
- **Suggested extraction:**
  - **Target:** `src/lib/actions/parse-action-input.ts` → `parseActionInput(schema, data)`
  - **Consumers:** All validated action functions
- **Caveats:** Pair with `requireSession()` at top of each action

#### Duplicate AI Pro + rate-limit guard

- **Impact:** High
- **Category:** Utility
- **Occurrences:** 4
- **Files:**
  - `src/actions/ai.ts` (lines 99–115, 184–200, 274–290, 372–379)
- **Duplicated pattern:** Pro subscription check + AI rate limit check
- **Suggested extraction:**
  - **Target:** `src/lib/actions/require-ai-access.ts` → `requireAiAccess(userId)`
  - **Consumers:** `generateSummary`, `generateAutoTags`, `explainCode`, `optimizePrompt`
- **Caveats:** Only applies to AI actions

## Medium impact

#### Actions bypass existing subscription limit helpers

- **Impact:** Medium
- **Category:** Utility
- **Occurrences:** 2
- **Files:**
  - `src/actions/items.ts` (lines 60–70)
  - `src/actions/collections.ts` (lines 54–65)
- **Duplicated pattern:** Inline free-tier limit checks
- **Suggested extraction:**
  - **Target:** Use existing `isAtItemLimit` / `isAtCollectionLimit` from `src/lib/subscription-limits.ts`
  - **Consumers:** `createItem`, `createCollection`
- **Caveats:** Add a message formatter for user-facing errors

#### Prisma unique-constraint handling (collections only)

- **Impact:** Medium
- **Category:** Utility
- **Occurrences:** 1 definition, 2 uses
- **Files:**
  - `src/actions/collections.ts` (lines 27–34, 77–82, 132–137)
- **Duplicated pattern:** `isUniqueConstraintError` helper for P2002
- **Suggested extraction:**
  - **Target:** `src/lib/db/prisma-errors.ts` → `isUniqueConstraintError(error)`
  - **Consumers:** `createCollection`, `updateCollection`
- **Caveats:** Extract now if touching collections, or wait for a third use elsewhere

#### Duplicate AI Gemini catch block

- **Impact:** Medium
- **Category:** Utility
- **Occurrences:** 4
- **Files:**
  - `src/actions/ai.ts` (lines 160–163, 250–253, 339–342, 431–434)
- **Duplicated pattern:** Gemini API error handling in catch blocks
- **Suggested extraction:**
  - **Target:** `src/lib/ai/handle-ai-error.ts` → `handleAiActionError(actionName, error)`
  - **Consumers:** All four AI action functions
- **Caveats:** None

#### Toggle-mutation shape

- **Impact:** Medium
- **Category:** Utility
- **Occurrences:** 3
- **Files:**
  - `src/actions/items.ts` (lines 207–251) — `toggleItemFavorite`, `toggleItemPin`
  - `src/actions/collections.ts` (lines 163–184) — `toggleCollectionFavorite`
- **Duplicated pattern:** auth → toggle → not-found → revalidate
- **Suggested extraction:**
  - **Target:** Generic toggle helper (only if a third toggle action is added)
- **Caveats:** Wait for third occurrence before abstracting

#### Test duplication in `ai.test.ts`

- **Impact:** Medium
- **Category:** Utility
- **Occurrences:** 16 near-identical guard tests
- **Files:**
  - `src/actions/ai.test.ts` (lines 60–103, 227–272, 343–388, 453–498)
- **Duplicated pattern:** Unauthorized, validation, pro, rate-limit tests × 4 actions
- **Suggested extraction:**
  - **Target:** `describe.each` or shared test utils
- **Caveats:** Test-only refactor

## Low impact

#### `defaultStats` fixture duplicated in tests

- **Impact:** Low
- **Category:** Utility
- **Occurrences:** 2
- **Files:**
  - `src/actions/items.test.ts` (lines 82–88)
  - `src/actions/collections.test.ts` (lines 49–55)

#### `@/auth` mock setup repeated

- **Impact:** Low
- **Category:** Utility
- **Occurrences:** 4
- **Files:** All four test files

## Already shared (no action needed)

- Zod schemas → `src/lib/validations/`
- DB operations → `src/lib/db/*`
- Revalidation helpers already local (`revalidateCollectionPaths`, `revalidateItemFavoritePaths`, `revalidateItemPinPaths`)
- AI prompts/truncation/Gemini client → `src/lib/ai/`
- Rate limiting → `checkAiRateLimit` in `src/lib/rate-limit.ts`

## Files scanned

- `src/actions/items.ts`
- `src/actions/collections.ts`
- `src/actions/settings.ts`
- `src/actions/ai.ts`
- `src/actions/items.test.ts`
- `src/actions/collections.test.ts`
- `src/actions/settings.test.ts`
- `src/actions/ai.test.ts`
- `context/coding-standards.md`
- `src/lib/subscription-limits.ts`

## Recommended extraction order

1. **`ActionResult<T>`** → `src/types/actions.ts` — zero behavioral risk, unblocks typed helpers
2. **`requireSession()`** → `src/lib/actions/require-session.ts` — 14 call sites
3. **`parseActionInput()`** → `src/lib/actions/parse-action-input.ts` — pairs with session at top of every validated action
4. **`requireAiAccess()`** → `src/lib/actions/require-ai-access.ts` — ~32 lines × 4 in `ai.ts`
5. **Adopt `isAtItemLimit` / `isAtCollectionLimit`** in create actions — uses existing `src/lib/subscription-limits.ts`
