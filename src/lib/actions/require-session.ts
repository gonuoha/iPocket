import { auth } from "@/auth";
import type { ActionResult } from "@/types/actions";

type SessionSuccess = { success: true; userId: string };
type SessionFailure = ActionResult<never>;

export async function requireSession(): Promise<
  SessionSuccess | SessionFailure
> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  return { success: true, userId: session.user.id };
}
