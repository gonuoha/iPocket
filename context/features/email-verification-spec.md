# Email Verification on Register

## Overview

Require email verification for credentials-based registration. Send a verification link via Resend on sign-up; block credentials sign-in until the user confirms their address.

## Requirements

### Registration flow

- On `POST /api/auth/register`, create the user with `emailVerified: null`
- Generate a secure 32-byte hex token (24-hour expiry) and store it in `VerificationToken` (identifier = email)
- Send a verification email via Resend with a link to `/verify-email?token=...`
- Roll back user creation if the email fails to send
- Replace the post-register redirect with a "check your email" confirmation in the register form

### Verification page (`/verify-email`)

- Validate the token from the query string
- On success: set `User.emailVerified`, delete the consumed token, show success UI with link to sign-in
- On expired token: show clear message with link to re-register
- On invalid/missing token: show clear error messaging

### Auth enforcement

- Block credentials sign-in when `emailVerified` is null (via `signIn` callback redirect to `/sign-in?error=email_not_verified`)
- Set `emailVerified` automatically for GitHub OAuth users on sign-in
- Update sign-in form to display verification-specific errors

### Email integration

- Install and use the `resend` package
- Resend client in `src/lib/email/resend.ts`
- Token helpers in `src/lib/email/verification.ts`
- Send helper in `src/lib/email/send-verification-email.ts`
- Base URL helper in `src/lib/app-url.ts` (uses `AUTH_URL`, falls back to `VERCEL_URL` or localhost)

### Environment variables

Document in `.env.example`:

- `RESEND_API_KEY` — Resend API key
- `RESEND_FROM_EMAIL` — verified sender address (e.g. Resend sandbox `onboarding@resend.dev`)

## Files changed

- `src/app/api/auth/register/route.ts` — token creation + email send
- `src/app/(auth)/verify-email/page.tsx` — verification UI
- `src/auth.ts` — `signIn` callback for verification enforcement
- `src/components/auth/register-form.tsx` — "check your email" state
- `src/components/auth/sign-in-form.tsx` — verification error handling
- `src/lib/email/` — Resend and verification helpers
- `src/lib/app-url.ts` — app base URL for email links
- `.env.example` — `RESEND_FROM_EMAIL`

## Notes

### Schema

Uses existing Prisma fields — no migration required:

- `User.emailVerified` (`DateTime?`)
- `VerificationToken` (`identifier`, `token`, `expires`)

### Token lifecycle

- One active token per email (previous tokens deleted on new registration)
- Tokens expire after 24 hours
- Token is consumed (deleted) on successful verification

## Testing

1. Register a new account → receive verification email
2. Register form shows "check your email" (no immediate redirect to sign-in)
3. Click verification link → `emailVerified` set, success page shown
4. Sign in with credentials before verifying → blocked with clear error
5. Sign in after verifying → works
6. GitHub OAuth sign-in → works, user marked as verified
7. Expired or invalid token → appropriate error page
