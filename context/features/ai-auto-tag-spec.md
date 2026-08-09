# AI Auto-Tagging

## Overview

Add AI-powered tag suggestions for items using the Gemini **3.5 Flash-Lite** model. Users click a **Suggest Tags** button in the tags area, and the AI returns 3–5 freeform tag suggestions based on the item's title and content. Each suggestion has accept/reject controls. Pro-only feature with both UI-level and server-side gating.

This is the **first AI feature** and establishes the shared AI foundation (Gemini client, server action pattern, rate limit config) for subsequent AI features (summaries, code explanation, prompt optimization). See `@docs/ai-integration-plan.md` for the broader roadmap.

## Goals

- Pro users can generate contextual tag suggestions while creating or editing an item
- Suggestions are reviewable — nothing is saved until the user accepts tags and submits the form
- Server enforces Pro status, auth, validation, and rate limits
- Reusable AI infrastructure for future features

## Prerequisites

- User is authenticated (existing NextAuth session)
- Pro subscription (`User.isPro`) for AI access
- Gemini API key configured in server environment (document in `.env.example`)
- `@google/genai` package installed
- Upstash Redis configured (optional — rate limit fails open if unavailable, matching auth rate limits)

## Requirements

### 1. Dependencies & Environment

```bash
npm install @google/genai
```

Add to `.env.example` (server-only, no `NEXT_PUBLIC_` prefix):

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | Google AI Studio API key |
| `GEMINI_MODEL` | Optional override; default `gemini-3.5-flash-lite` |

### 2. Gemini Client — `src/lib/ai/gemini.ts`

Create a lazy singleton Gemini client (server-only module):

- Export `AI_MODEL` constant: `"gemini-3.5-flash-lite"` (or read from `process.env.GEMINI_MODEL` with that default)
- Export `getGeminiClient()` — throws a clear error if API key is missing
- Never import this file from client components

Keep it minimal — no feature-specific prompt logic in this file.

### 3. AI Prompts — `src/lib/ai/prompts.ts`

Export `buildAutoTagPrompt(input)` returning `{ systemInstruction, userContent }`:

**System instruction:**

- Role: tag suggester for a developer knowledge hub
- Return only valid JSON matching the schema
- Suggest 3–5 lowercase, hyphenated tags (e.g. `react`, `use-effect`, `bash`)
- Tags must be relevant to title and content
- Do not duplicate tags already on the item
- Do not use generic tags like `misc` or `untagged`

**User content:** title, item type, truncated content, existing tags list.

### 4. Input Truncation — `src/lib/ai/truncate-content.ts`

Export `truncateForAi(content: string, maxLength = 2000): string`:

- Trim whitespace
- If length ≤ max, return as-is
- Otherwise truncate to `maxLength` chars and append `…` (or slice at word boundary if simple)
- Unit-testable utility

### 5. Validation — `src/lib/validations/ai.ts`

```typescript
export const generateAutoTagsSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  content: z.string().trim().min(1, "Content is required").max(100_000),
  type: z.enum(["snippet", "prompt", "command", "note", "link", "file", "image"]),
  existingTags: z.array(z.string().trim().min(1).max(40)).max(50).default([]),
});
```

Response schema (for parsing model output):

```typescript
export const autoTagsResponseSchema = z.object({
  tags: z.array(z.string().trim().min(1).max(40)).min(3).max(5),
});
```

If the model returns fewer than 3 or more than 5 tags, normalize in the action: accept 1–8 from model but prefer returning 3–5 to the client; on unparseable JSON, return a service error.

### 6. AI Rate Limiting — `src/lib/rate-limit.ts`

Add AI rate limit config to the **existing** rate limit utility (do not create a separate Redis client):

| Limiter | Prefix | Limit | Window | Key |
|---------|--------|-------|--------|-----|
| AI requests | `ai` | 20 requests | 1 hour | `userId` |

Export:

```typescript
export async function checkAiRateLimit(userId: string): Promise<RateLimitResult>
```

- Key by `userId` only (authenticated, Pro-gated endpoint)
- Fail open if Upstash unavailable (log error, return `FAIL_OPEN_RESULT`) — same as auth limiters
- Only call after Pro check passes (free users never consume quota)

### 7. Server Action — `src/actions/ai.ts`

Export `generateAutoTags(data: unknown)`:

```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// Returns: { success: true, data: { tags: string[] } }
```

**Flow:**

1. `auth()` — return `{ success: false, error: "Unauthorized" }` if no session
2. `generateAutoTagsSchema.safeParse(data)` — return first Zod issue message on failure
3. `getUserIsPro(session.user.id)` — return `{ success: false, error: "AI features require a Pro subscription" }` if false
4. `checkAiRateLimit(session.user.id)` — return `{ success: false, error: "You've reached your AI limit. Try again later." }` if limited
5. Truncate `content` to 2000 chars via `truncateForAi`
6. Call Gemini `generateContent` with:
   - Model: `AI_MODEL`
   - `systemInstruction` from prompts
   - Structured output / JSON schema for `{ tags: string[] }`
   - `thinkingConfig: { thinkingLevel: "minimal" }`
   - Do **not** pass `temperature`, `top_p`, or `top_k`
7. Parse response with `autoTagsResponseSchema`
8. Filter out tags that match `existingTags` (case-insensitive)
9. Return deduplicated suggestions

**Errors:**

- Missing API key / Gemini failure → `{ success: false, error: "AI is temporarily unavailable" }` (log details server-side)
- Empty suggestions after filtering → `{ success: false, error: "No new tags could be suggested. Try adding more content." }`

Do **not** persist tags to the database in this action — suggestions only.

### 8. Server Action Tests — `src/actions/ai.test.ts`

Mock: `@/auth`, `@/lib/db/user`, `@/lib/rate-limit`, `@/lib/ai/gemini`, Gemini `generateContent`.

| Case | Expected |
|------|----------|
| No session | `Unauthorized` |
| Invalid payload | Zod error message |
| Free user (`isPro: false`) | Pro subscription error |
| Rate limited | Rate limit error |
| Pro user, valid input | `{ success: true, data: { tags } }` |
| Pro user, Gemini throws | Service unavailable error |
| Existing tags filtered | Returned tags exclude duplicates |

### 9. UI Component — `src/components/ai/suggested-tags.tsx`

Client component for displaying suggestions:

**Props:**

```typescript
type SuggestedTagsProps = {
  tags: string[];
  onAccept: (tag: string) => void;
  onReject: (tag: string) => void;
  onDismiss: () => void;
};
```

**Layout:**

- Row of suggested tag badges below the tags input
- Each badge: tag label + accept (`Check` icon button) + reject (`X` icon button)
- Optional **Dismiss all** text button to clear suggestions
- Use shadcn `Badge` + `Button` (ghost/icon variants)

Accepted tags are removed from the suggestion list. Rejected tags are removed from the list (not shown again until next generate).

### 10. Suggest Tags Button — `src/components/ai/suggest-tags-button.tsx`

Client component:

**Props:**

```typescript
type SuggestTagsButtonProps = {
  isPro: boolean;
  disabled?: boolean;
  onSuggest: () => void;
  isLoading?: boolean;
};
```

- **Pro users:** `Button` variant `ghost`, size `sm`, `Sparkles` icon, label "Suggest Tags"
- **Free users:** do not render (hidden per requirements)
- `disabled` when loading or when title/content empty (parent decides)
- `aria-busy` when loading; show `Loader2` spinner instead of icon

### 11. Item Create Dialog — `src/components/items/item-create-dialog.tsx`

In the tags field section:

```
[Label: Tags]
[Input: comma-separated tags]  [Suggest Tags]   ← ghost button, Pro only
[SuggestedTags panel when suggestions exist]
```

**Behavior:**

- `isPro` already available as prop — pass to `SuggestTagsButton`
- Enable Suggest Tags only when `title.trim()` and `content.trim()` are non-empty (for types with content). For `link` type, require `url` instead of content if content is empty.
- On click: `useTransition` → call `generateAutoTags({ title, content, type, existingTags })`
- `existingTags` parsed from comma-separated `formState.tags`
- On success: set local `suggestedTags` state
- On accept: append tag to `formState.tags` (comma-separated), dedupe case-insensitively
- On error: `toast.error(result.error)`
- Suggestions clear on dialog close / type change

### 12. Item Drawer Edit — `src/components/items/item-drawer.tsx`

Same UX as create dialog in `ItemDrawerEditor` tags section.

**Prop wiring:**

- Add `isPro: boolean` prop to `ItemDrawer`
- Pass `isPro` from `DashboardShell` (already has `isPro` from layout)

### 13. Upgrade Prompt (Optional Enhancement)

Not required for v1 since the button is hidden for free users. If a free user somehow triggers the action, the server error message is sufficient. Optionally add `ai_feature` to `UpgradeReason` in a follow-up.

## UI Wireframe

```
Tags
┌──────────────────────────────────────┐  ┌──────────────┐
│ react, hooks, typescript             │  │ ✨ Suggest   │
└──────────────────────────────────────┘  └──────────────┘

Suggested:
┌─────────────┐  ┌──────────────┐  ┌────────────┐
│ use-effect ✓✕│  │ custom-hook ✓✕│  │ frontend ✓✕│
└─────────────┘  └──────────────┘  └────────────┘
                                    [Dismiss all]
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/lib/ai/gemini.ts` | Gemini client singleton + `AI_MODEL` |
| `src/lib/ai/prompts.ts` | Auto-tag prompt builder |
| `src/lib/ai/truncate-content.ts` | Content truncation utility |
| `src/lib/validations/ai.ts` | Zod request/response schemas |
| `src/lib/validations/ai.test.ts` | Schema unit tests |
| `src/lib/ai/truncate-content.test.ts` | Truncation unit tests |
| `src/actions/ai.ts` | `generateAutoTags` server action |
| `src/actions/ai.test.ts` | Action unit tests |
| `src/components/ai/suggest-tags-button.tsx` | Trigger button |
| `src/components/ai/suggested-tags.tsx` | Accept/reject suggestion UI |

## Files to Modify

| File | Change |
|------|--------|
| `package.json` | Add `@google/genai` |
| `.env.example` | Document Gemini env vars |
| `src/lib/rate-limit.ts` | Add `checkAiRateLimit` |
| `src/components/items/item-create-dialog.tsx` | Suggest Tags UI + action wiring |
| `src/components/items/item-drawer.tsx` | Suggest Tags in edit mode |
| `src/components/dashboard/dashboard-shell.tsx` | Pass `isPro` to `ItemDrawer` |

## Out of Scope

- Auto-saving tags to the database (user must Save / Create)
- AI summaries, code explanation, prompt optimization (separate specs)
- Streaming responses
- Tag suggestions in item drawer **view** mode (edit and create only)
- Usage analytics / `AiUsageLog` table
- Caching duplicate requests in Redis

## Test Plan

- [ ] Pro user: create dialog → enter title + content → Suggest Tags → accept tags → tags appear in input → Create item with tags
- [ ] Pro user: drawer edit → Suggest Tags → accept/reject → Save persists accepted tags
- [ ] Free user: Suggest Tags button not visible
- [ ] Empty title/content: button disabled
- [ ] Rate limit: 21st request in an hour shows toast error
- [ ] `npm test` passes (new action + validation + truncation tests)
- [ ] `npm run build` passes

## References

- `@docs/ai-integration-plan.md` — architecture and Gemini model details
- `@context/features/item-create-spec.md` — create dialog patterns
- `@context/features/item-drawer-edit-spec.md` — edit mode and tags field
- `@context/features/rate-limiting-spec.md` — Upstash rate limit patterns
- `@src/actions/items.ts` — `ActionResult` and Pro gating patterns
- `@src/lib/subscription-limits.ts` — subscription limits (separate from AI rate limits)
