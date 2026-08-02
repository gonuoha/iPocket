import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { resetPasswordWithToken } from "@/lib/email/password-reset";

type ResetPasswordRequestBody = {
  token?: string;
  password?: string;
  confirmPassword?: string;
};

export async function POST(request: Request) {
  let body: ResetPasswordRequestBody;

  try {
    body = (await request.json()) as ResetPasswordRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { token, password, confirmPassword } = body;

  if (!token || !password || !confirmPassword) {
    return NextResponse.json(
      { error: "Token, password, and confirmPassword are required" },
      { status: 400 },
    );
  }

  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const result = await resetPasswordWithToken(token, passwordHash);

  if (result.status === "expired") {
    return NextResponse.json(
      { error: "This password reset link has expired. Please request a new one." },
      { status: 400 },
    );
  }

  if (result.status === "invalid") {
    return NextResponse.json(
      { error: "This password reset link is invalid or has already been used." },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true });
}
