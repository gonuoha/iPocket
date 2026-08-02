import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type ChangePasswordRequestBody = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: ChangePasswordRequestBody;

  try {
    body = (await request.json()) as ChangePasswordRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { currentPassword, newPassword, confirmPassword } = body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json(
      { error: "Current password, new password, and confirmPassword are required" },
      { status: 400 },
    );
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (!user?.password) {
    return NextResponse.json(
      { error: "Password change is not available for this account" },
      { status: 400 },
    );
  }

  const isValid = await bcrypt.compare(currentPassword, user.password);

  if (!isValid) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: passwordHash },
  });

  return NextResponse.json({ success: true });
}
