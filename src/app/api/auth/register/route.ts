import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { isEmailVerificationEnabled } from "@/lib/email/config";
import { sendVerificationEmail } from "@/lib/email/send-verification-email";
import { createVerificationToken } from "@/lib/email/verification";
import { prisma } from "@/lib/prisma";
import { checkRegisterRateLimit, rateLimitedResponse } from "@/lib/rate-limit";

type RegisterRequestBody = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export async function POST(request: Request) {
  const rateLimit = await checkRegisterRateLimit(request);

  if (!rateLimit.success) {
    return rateLimitedResponse(rateLimit);
  }

  let body: RegisterRequestBody;

  try {
    body = (await request.json()) as RegisterRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, email, password, confirmPassword } = body;

  if (!name || !email || !password || !confirmPassword) {
    return NextResponse.json(
      { error: "Name, email, password, and confirmPassword are required" },
      { status: 400 },
    );
  }

  if (password !== confirmPassword) {
    return NextResponse.json(
      { error: "Passwords do not match" },
      { status: 400 },
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const verificationRequired = isEmailVerificationEnabled();

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      ...(verificationRequired ? {} : { emailVerified: new Date() }),
    },
  });

  if (!verificationRequired) {
    return NextResponse.json({ success: true, verificationRequired: false }, { status: 201 });
  }

  try {
    const token = await createVerificationToken(email);
    await sendVerificationEmail({ email, name, token });
  } catch {
    await prisma.user.delete({ where: { id: user.id } });

    return NextResponse.json(
      { error: "Unable to send verification email. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, verificationRequired: true }, { status: 201 });
}
