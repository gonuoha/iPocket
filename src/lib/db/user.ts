import { prisma } from "@/lib/prisma";

const DEMO_USER_EMAIL = "demo@ipocket.io";

export type DashboardUser = {
  id: string;
  name: string;
  email: string;
  isPro: boolean;
};

export async function getDashboardUserId(): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
    select: { id: true },
  });

  if (!user) {
    throw new Error("Demo user not found. Run npm run db:seed.");
  }

  return user.id;
}

export async function getDashboardUser(): Promise<DashboardUser> {
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
    throw new Error("Demo user not found. Run npm run db:seed.");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isPro: user.isPro,
  };
}
