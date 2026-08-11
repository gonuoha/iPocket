# Register — GitHub OAuth

## Overview

Sign-in offers email/password plus "Sign in with GitHub". Register offers only the email/password form. UI review flagged inconsistent auth UX and missing OAuth on the register page.

**Source:** UI review (Playwright), screenshots: `sign-in-mobile.png`, `register-mobile.png`.

---

## Requirements

### 1. GitHub sign-up button (Major)

**Problem:** `RegisterForm` has no OAuth option. Users who prefer GitHub must go to sign-in first.

**Fix:**

- Mirror the sign-in layout below the "Create account" button:
  1. Divider with "Or continue with" (same markup/classes as `sign-in-form.tsx`)
  2. Outline `Button`: "Sign up with GitHub"
- Reuse the same `signIn("github", { callbackUrl })` pattern from sign-in.
- Default `callbackUrl` to `/dashboard` (register page has no search params today — use `/dashboard` or read from a future `callbackUrl` query param for parity).

**Handler:**

```typescript
function handleGitHubSignUp() {
  void signIn("github", { callbackUrl: "/dashboard" });
}
```

- Disable the GitHub button while `isSubmitting` (same as sign-in).
- Do not show GitHub button on the post-registration verification success state (`isComplete`).

**Files:**

- `src/components/auth/register-form.tsx` — UI + handler
- Import `signIn` from `next-auth/react`

### 2. Visual parity with sign-in (Minor)

**Problem:** Auth pages should feel like one flow.

**Fix:**

- Copy divider and button classes from `sign-in-form.tsx` (lines ~216–233) — do not invent new spacing.
- Button label: **"Sign up with GitHub"** (not "Sign in with GitHub").
- Keep "Already have an account? Sign in" below the GitHub block (same order as sign-in: form → primary CTA → divider → GitHub → footer link).

### 3. No server changes required

GitHub OAuth is already configured (`auth.config.ts`, `auth.ts`). New GitHub users are created via the Prisma adapter on first OAuth sign-in; `events.signIn` sets `emailVerified` for GitHub accounts.

Verify only — no new API routes or providers needed unless testing reveals a register-specific edge case.

---

## Acceptance criteria

- [ ] Register page shows "Or continue with" divider and "Sign up with GitHub" button
- [ ] Clicking GitHub initiates NextAuth GitHub flow and redirects to `/dashboard` on success
- [ ] Layout matches sign-in page structure (spacing, button variant, divider)
- [ ] GitHub button hidden during verification-email success state
- [ ] GitHub button disabled while form is submitting
- [ ] No regression on email/password registration flow

---

## References

- `src/components/auth/sign-in-form.tsx` — reference implementation (`handleGitHubSignIn`, divider markup)
- `src/components/auth/register-form.tsx` — target file
- `context/features/auth-phase-1-spec.md` — GitHub provider setup
- `context/features/auth-phase-2-spec.md` — credentials + GitHub coexistence
