import { prisma } from "@/lib/prisma";

const DEMO_USER_EMAIL = "demo@ipocket.io";

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
