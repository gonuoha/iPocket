import { afterEach, describe, expect, it } from "vitest";

const ENV_KEYS = ["APP_URL", "VERCEL_URL"] as const;

function clearEnv() {
  for (const key of ENV_KEYS) {
    delete process.env[key];
  }
}

describe("getAppUrl", () => {
  afterEach(() => {
    clearEnv();
  });

  it("prefers APP_URL when set", async () => {
    process.env.APP_URL = "https://ipocket.app/";
    process.env.VERCEL_URL = "ipocket-git-main-user.vercel.app";

    const { getAppUrl } = await import("./app-url");

    expect(getAppUrl()).toBe("https://ipocket.app");
  });

  it("uses VERCEL_URL when APP_URL is not set", async () => {
    process.env.VERCEL_URL = "ipocket-git-feature-user.vercel.app";

    const { getAppUrl } = await import("./app-url");

    expect(getAppUrl()).toBe("https://ipocket-git-feature-user.vercel.app");
  });

  it("falls back to localhost when no env vars are set", async () => {
    const { getAppUrl } = await import("./app-url");

    expect(getAppUrl()).toBe("http://localhost:3000");
  });
});
