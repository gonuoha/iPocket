import { getAppUrl } from "@/lib/app-url";
import { getFromEmail, getResend } from "@/lib/email/resend";

type SendPasswordResetEmailParams = {
  email: string;
  name: string | null;
  token: string;
};

export async function sendPasswordResetEmail({
  email,
  name,
  token,
}: SendPasswordResetEmailParams): Promise<void> {
  const resetUrl = new URL("/reset-password", getAppUrl());
  resetUrl.searchParams.set("token", token);
  const greeting = name ? `Hi ${name},` : "Hi,";

  const { error } = await getResend().emails.send({
    from: getFromEmail(),
    to: email,
    subject: "Reset your iPocket password",
    html: `
      <p>${greeting}</p>
      <p>We received a request to reset your password. Click the link below to choose a new one:</p>
      <p><a href="${resetUrl.toString()}">Reset password</a></p>
      <p>This link expires in 1 hour. If you didn't request a password reset, you can ignore this email.</p>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }
}
