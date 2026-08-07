import { cache } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type SettingsData = {
  user: {
    email: string;
    hasPassword: boolean;
  };
};

export const getSettingsData = cache(async (): Promise<SettingsData> => {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      password: true,
    },
  });

  if (!user?.email) {
    redirect("/api/auth/signout?callbackUrl=/sign-in");
  }

  return {
    user: {
      email: user.email,
      hasPassword: Boolean(user.password),
    },
  };
});
