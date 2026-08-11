import { auth } from "@/auth";

type SessionSuccess = { success: true; userId: string };
type SessionFailure = { success: false; error: string };

export async function requireSession(): Promise<
  SessionSuccess | SessionFailure
> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  return { success: true, userId: session.user.id };
}
