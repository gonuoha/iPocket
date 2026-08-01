import { cache } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export class DemoUserNotFoundError extends Error {
  constructor() {
    super("Demo user not found. Run npm run db:seed.");
    this.name = "DemoUserNotFoundError";
  }
}

export type DashboardUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  isPro: boolean;
};

export const getCurrentUser = cache(async (): Promise<DashboardUser> => {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isPro: true,
    },
  });

  if (!user?.name || !user.email) {
    redirect("/api/auth/signout?callbackUrl=/sign-in");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    isPro: user.isPro,
  };
});
