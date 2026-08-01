import { cache } from "react";

import { prisma } from "@/lib/prisma";

const DEMO_USER_EMAIL = "demo@ipocket.io";

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
  isPro: boolean;
};

async function fetchDemoUser(): Promise<DashboardUser> {
  const user = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
    select: {
      id: true,
      name: true,
      email: true,
      isPro: true,
    },
  });

  if (!user?.name) {
    throw new DemoUserNotFoundError();
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isPro: user.isPro,
  };
}

export const getCurrentUser = cache(fetchDemoUser);
