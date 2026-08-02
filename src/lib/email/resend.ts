import { Resend } from "resend";

let resend: Resend | null = null;

export function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (!resend) {
    resend = new Resend(apiKey);
  }

  return resend;
}

export function getFromEmail(): string {
  const from = process.env.RESEND_FROM_EMAIL;

  if (!from) {
    throw new Error("RESEND_FROM_EMAIL is not configured");
  }

  return from;
}
