import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  reset: number;
};

const FAIL_OPEN_RESULT: RateLimitResult = {
  success: true,
  remaining: -1,
  reset: 0,
};

function isRateLimitConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

function createRedis(): Redis | null {
  if (!isRateLimitConfigured()) {
    return null;
  }

  return Redis.fromEnv();
}

function createLimiter(prefix: string, requests: number, window: Duration): Ratelimit | null {
  const redis = createRedis();

  if (!redis) {
    return null;
  }

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: `ratelimit:${prefix}`,
  });
}

const loginLimiter = createLimiter("login", 5, "15 m");
const registerLimiter = createLimiter("register", 3, "1 h");
const forgotPasswordLimiter = createLimiter("forgot-password", 3, "1 h");
const resetPasswordLimiter = createLimiter("reset-password", 5, "15 m");
const resendVerificationLimiter = createLimiter("resend-verification", 3, "15 m");

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

function buildIdentifier(ip: string, email?: string): string {
  if (email) {
    return `${ip}:${email.toLowerCase()}`;
  }

  return ip;
}

async function checkLimiter(
  limiter: Ratelimit | null,
  identifier: string,
): Promise<RateLimitResult> {
  if (!limiter) {
    return FAIL_OPEN_RESULT;
  }

  try {
    const result = await limiter.limit(identifier);

    return {
      success: result.success,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error("Rate limit check failed, failing open:", error);
    return FAIL_OPEN_RESULT;
  }
}

export async function checkLoginRateLimit(
  request: Request,
  email?: string,
): Promise<RateLimitResult> {
  const ip = getClientIp(request);
  return checkLimiter(loginLimiter, buildIdentifier(ip, email));
}

export async function checkRegisterRateLimit(request: Request): Promise<RateLimitResult> {
  return checkLimiter(registerLimiter, getClientIp(request));
}

export async function checkForgotPasswordRateLimit(
  request: Request,
): Promise<RateLimitResult> {
  return checkLimiter(forgotPasswordLimiter, getClientIp(request));
}

export async function checkResetPasswordRateLimit(
  request: Request,
): Promise<RateLimitResult> {
  return checkLimiter(resetPasswordLimiter, getClientIp(request));
}

export async function checkResendVerificationRateLimit(
  request: Request,
  email: string,
): Promise<RateLimitResult> {
  const ip = getClientIp(request);
  return checkLimiter(resendVerificationLimiter, buildIdentifier(ip, email));
}

function getRetryAfterSeconds(reset: number): number {
  return Math.max(1, Math.ceil((reset - Date.now()) / 1000));
}

function formatRetryMessage(retryAfterSeconds: number): string {
  const retryMinutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
  const unit = retryMinutes === 1 ? "minute" : "minutes";

  return `Too many attempts. Please try again in ${retryMinutes} ${unit}.`;
}

export function rateLimitedResponse(result: RateLimitResult): NextResponse {
  const retryAfterSeconds = getRetryAfterSeconds(result.reset);

  return NextResponse.json(
    { error: formatRetryMessage(retryAfterSeconds) },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
      },
    },
  );
}
