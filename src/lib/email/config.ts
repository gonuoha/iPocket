export function isEmailVerificationEnabled(): boolean {
  return process.env.SKIP_EMAIL_VERIFICATION !== "true";
}
