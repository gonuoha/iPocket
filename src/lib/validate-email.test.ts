import { describe, expect, it } from "vitest";

import { isValidEmail } from "./validate-email";

describe("isValidEmail", () => {
  it("accepts a valid email address", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
  });

  it("rejects addresses without a domain", () => {
    expect(isValidEmail("user@")).toBe(false);
  });

  it("rejects addresses without an @ symbol", () => {
    expect(isValidEmail("user.example.com")).toBe(false);
  });
});
