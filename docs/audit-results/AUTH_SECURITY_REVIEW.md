# Auth Security Review

**Last audit:** 2026-08-02
**Auditor:** auth-auditor agent
**Scope:** NextAuth v5, credentials/GitHub providers, email verification, password reset, profile

## Summary

The auth implementation follows solid fundamentals: bcrypt hashing, cryptographically secure tokens, enumeration-resistant password reset, and session-scoped profile mutations. Four issues were found — none critical. Top priorities: fix the open redirect on credentials sign-in (phishing vector), add a POST confirmation step for email verification (prefetch-safe), and invalidate JWT sessions after password change/reset.

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 0 |
| Medium | 3 |
| Low | 2 |

## Critical

No issues found.

## High

No issues found.

## Medium

#### Open redirect after credentials sign-in

- **Severity:** Medium
- **File:** `src/components/auth/sign-in-form.tsx`
- **Line(s):** 14, 52
- **Issue:** `callbackUrl` is read directly from query parameters and assigned to `window.location.href` after a successful credentials login. Because `signIn` uses `redirect: false`, NextAuth's built-in redirect callback validation is bypassed. An attacker can craft `/sign-in?callbackUrl=https://evil.com` and, after the victim signs in on the legitimate site, redirect them to a phishing page while their session cookie is already set.
- **Fix:** Validate `callbackUrl` before redirecting — allow only relative paths starting with `/` (reject `//`, `http:`, `https:`, and `javascript:`). Example: `if (!callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) callbackUrl = "/dashboard"`. Alternatively, add a `redirect` callback in `src/auth.ts` and use NextAuth's validated redirect URL from the sign-in result.

#### Email verification consumes token on GET

- **Severity:** Medium
- **File:** `src/app/(auth)/verify-email/page.tsx`
- **Line(s):** 31
- **Issue:** `verifyEmailToken()` runs during server-side page render (HTTP GET) and atomically sets `emailVerified` and deletes the token. Email security gateways (Microsoft Safe Links, Mimecast, Gmail link scanners) prefetch GET links before the user clicks, which can consume the single-use token and leave the user unable to verify. This is a state-changing operation over an unsafe HTTP method.
- **Fix:** Split into validate-on-GET and confirm-on-POST. On GET, call a read-only `validateVerificationToken()` that checks expiry without mutating state, then render a confirmation page with a form that POSTs to `/api/auth/verify-email` (or a server action) to perform the actual verification. The password reset flow already follows this pattern correctly — `reset-password/page.tsx` validates on GET but only mutates on POST.

#### JWT sessions persist after password change or reset

- **Severity:** Medium
- **File:** `src/auth.ts`, `src/app/api/auth/change-password/route.ts`, `src/app/api/auth/reset-password/route.ts`
- **Line(s):** 14 (`session: { strategy: "jwt" }`), 61–64 (change-password), 34–35 (reset-password)
- **Issue:** The app uses JWT session strategy with no invalidation mechanism when a password is changed or reset. If an attacker has a stolen session token, the victim changing or resetting their password does not revoke the attacker's access. JWTs remain valid until their default expiry (30 days in Auth.js).
- **Fix:** Store a `passwordChangedAt` timestamp on the user record. Include it in the JWT via the `jwt` callback on sign-in, and on each `jwt`/`session` callback compare against the database value — reject or force re-auth if the DB timestamp is newer. Alternatively, switch to database sessions (`strategy: "database"`) and delete all sessions on password change/reset.

## Low

#### Registration reveals existing accounts

- **Severity:** Low
- **File:** `src/app/api/auth/register/route.ts`
- **Line(s):** 46–48
- **Issue:** A duplicate email returns HTTP 409 with `"User already exists"`, while the forgot-password flow correctly uses a generic message. This allows an attacker to enumerate which email addresses have registered accounts.
- **Fix:** Return the same generic success response as registration completion (e.g. "If this email is not already registered, check your inbox") and only send a verification email for new accounts. Or return 201 with a generic message regardless of whether the email exists.

#### No server-side password length policy

- **Severity:** Low
- **File:** `src/app/api/auth/register/route.ts`, `src/app/api/auth/reset-password/route.ts`, `src/app/api/auth/change-password/route.ts`
- **Line(s):** 27–32 (register), 23–28 (reset), 30–35 (change-password)
- **Issue:** Server routes check that password fields are present but enforce no minimum length or complexity. A single-character password passes server validation (client forms also lack length checks).
- **Fix:** Add a shared `validatePassword(password: string)` helper enforcing a minimum length (e.g. 8 characters) and call it in all three routes.

## Passed Checks

- Passwords hashed with bcrypt cost factor 12 before storage (`register/route.ts:50`, `reset-password/route.ts:34`, `change-password/route.ts:59`)
- Credentials `authorize` returns `null` on all failure paths with no user enumeration (`auth.ts:29–51`)
- Email verification gate blocks unverified credentials sign-in via `signIn` callback (`auth.ts:74–83`)
- GitHub OAuth users auto-marked as verified on sign-in (`auth.ts:65–71`)
- Verification tokens generated with `crypto.randomBytes(32)` — 256 bits of entropy (`verification.ts:13`)
- Verification tokens expire after 24 hours and are single-use, deleted in a transaction with `emailVerified` update (`verification.ts:5`, 45–58)
- One active verification token per email — previous tokens deleted on re-registration (`verification.ts:16`)
- Password reset tokens use `crypto.randomBytes(32)` with 1-hour expiry (`password-reset.ts:26–27`)
- Password reset tokens isolated from email-verification tokens via `password-reset:` identifier prefix (`password-reset.ts:5`, 21–23)
- Password reset is single-use — token deleted atomically with password update in a transaction (`password-reset.ts:82–95`)
- Forgot-password returns a generic message regardless of whether the email exists (`forgot-password/route.ts:12–13`, 48)
- Password reset emails only sent for accounts with a stored password (skips GitHub-only accounts) (`forgot-password/route.ts:39`)
- Reset-password page validates token on GET without consuming it; mutation only on POST (`reset-password/page.tsx:32`, `reset-password/route.ts`)
- Profile data fetch requires authenticated session, redirects to sign-in if missing (`profile.ts:33–37`)
- Profile layout inherits auth guard via `getDashboardLayoutData()` → `getCurrentUser()` (`dashboard.ts:49–51`, `user.ts:22–27`)
- Change-password requires session and verifies current password before update (`change-password/route.ts:14–18`, 53–57)
- Change-password scopes update to `session.user.id` — no IDOR (`change-password/route.ts:61–63`)
- Account deletion requires session and deletes only the authenticated user (`account/route.ts:7–15`)
- Delete account uses typed confirmation phrase in UI before API call (`delete-account-button.tsx:20`, 31)
- `/profile` and `/dashboard` protected by middleware proxy; unauthenticated users redirected to sign-in (`proxy.ts:20–28`)
- JWT payload contains only `sub`, `name`, `email`, `picture` — no password or secrets (`auth.ts:87–95`)
- `auth.config.ts` edge stub returns `null` from `authorize` — no credentials logic duplicated on edge (`auth.config.ts:12`)
- User deletion cascades to related data via Prisma `onDelete: Cascade` (`schema.prisma`)
- Email addresses in forgot-password validated server-side with `isValidEmail()` (`forgot-password/route.ts:30–32`)
- Registration rolls back user creation if verification email fails to send (`register/route.ts:69–75`)

## Files Reviewed

- `prisma/schema.prisma`
- `src/auth.ts`
- `src/auth.config.ts`
- `src/proxy.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/forgot-password/route.ts`
- `src/app/api/auth/reset-password/route.ts`
- `src/app/api/auth/change-password/route.ts`
- `src/app/api/auth/account/route.ts`
- `src/app/(auth)/layout.tsx`
- `src/app/(auth)/sign-in/page.tsx`
- `src/app/(auth)/register/page.tsx`
- `src/app/(auth)/forgot-password/page.tsx`
- `src/app/(auth)/reset-password/page.tsx`
- `src/app/(auth)/verify-email/page.tsx`
- `src/app/profile/page.tsx`
- `src/app/profile/layout.tsx`
- `src/components/auth/auth-card.tsx`
- `src/components/auth/sign-in-form.tsx`
- `src/components/auth/register-form.tsx`
- `src/components/auth/forgot-password-form.tsx`
- `src/components/auth/reset-password-form.tsx`
- `src/components/profile/account-information-card.tsx`
- `src/components/profile/change-password-form.tsx`
- `src/components/profile/delete-account-button.tsx`
- `src/components/profile/usage-statistics-card.tsx`
- `src/lib/email/config.ts`
- `src/lib/email/verification.ts`
- `src/lib/email/password-reset.ts`
- `src/lib/email/send-verification-email.ts`
- `src/lib/email/send-password-reset-email.ts`
- `src/lib/email/resend.ts`
- `src/lib/app-url.ts`
- `src/lib/validate-email.ts`
- `src/lib/db/profile.ts`
- `src/lib/db/user.ts`
- `src/lib/db/dashboard.ts`

## Out of Scope

NextAuth v5 built-in protections were excluded from this audit: CSRF token validation, session cookie flags (`httpOnly`, `sameSite`, `secure`), OAuth `state` parameter validation, and JWT signing/verification. Rate limiting was not flagged as a missing feature per audit guidelines — it may be handled at the infrastructure layer.
