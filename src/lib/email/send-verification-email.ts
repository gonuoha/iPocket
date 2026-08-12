import { getAppUrl } from "@/lib/app-url";
import { getFromEmail, getResend } from "@/lib/email/resend";

type SendVerificationEmailParams = {
  email: string;
  name: string;
  token: string;
};

export async function sendVerificationEmail({
  email,
  name,
  token,
}: SendVerificationEmailParams): Promise<void> {
  const verifyUrl = `${getAppUrl()}/verify-email?token=${encodeURIComponent(token)}`;

  const { error } = await getResend().emails.send({
    from: getFromEmail(),
    to: email,
    subject: "Verify your Memex account",
    html: `
      <p>Hi ${name},</p>
      <p>Thanks for signing up for Memex. Click the link below to verify your email address:</p>
      <p><a href="${verifyUrl}">Verify email</a></p>
      <p>This link expires in 24 hours. If you didn't create an account, you can ignore this email.</p>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }
}
