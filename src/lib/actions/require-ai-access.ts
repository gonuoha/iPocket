import { getUserIsPro } from "@/lib/db/user";
import { checkAiRateLimit } from "@/lib/rate-limit";
import type { ActionResult } from "@/types/actions";

type AiAccessSuccess = { success: true };
type AiAccessFailure = ActionResult<never>;

export async function requireAiAccess(
  userId: string,
): Promise<AiAccessSuccess | AiAccessFailure> {
  const isPro = await getUserIsPro(userId);

  if (!isPro) {
    return {
      success: false,
      error: "AI features require a Pro subscription",
    };
  }

  const rateLimit = await checkAiRateLimit(userId);

  if (!rateLimit.success) {
    return {
      success: false,
      error: "You've reached your AI limit. Try again later.",
    };
  }

  return { success: true };
}
