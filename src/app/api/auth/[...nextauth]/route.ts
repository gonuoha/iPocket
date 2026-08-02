import { NextRequest } from "next/server";

import { handlers } from "@/auth";
import { checkLoginRateLimit, rateLimitedResponse } from "@/lib/rate-limit";

const { GET, POST: authPOST } = handlers;

async function getCredentialsEmail(request: Request): Promise<string | undefined> {
  const cloned = request.clone();

  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const body = (await cloned.json()) as { email?: string };
      return body.email?.trim();
    }

    const formData = await cloned.formData();
    const email = formData.get("email");

    return typeof email === "string" ? email.trim() : undefined;
  } catch {
    return undefined;
  }
}

export async function POST(request: NextRequest) {
  const { pathname } = new URL(request.url);

  if (pathname.endsWith("/callback/credentials")) {
    const email = await getCredentialsEmail(request);
    const rateLimit = await checkLoginRateLimit(request, email);

    if (!rateLimit.success) {
      return rateLimitedResponse(rateLimit);
    }
  }

  return authPOST(request);
}

export { GET };
