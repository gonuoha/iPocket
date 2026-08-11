import { describe, expect, it } from "vitest";

import { isUniqueConstraintError } from "./prisma-errors";

describe("isUniqueConstraintError", () => {
  it("returns true for Prisma P2002 errors", () => {
    expect(isUniqueConstraintError({ code: "P2002" })).toBe(true);
  });

  it("returns false for other Prisma error codes", () => {
    expect(isUniqueConstraintError({ code: "P2025" })).toBe(false);
  });

  it("returns false for non-object values", () => {
    expect(isUniqueConstraintError("P2002")).toBe(false);
    expect(isUniqueConstraintError(null)).toBe(false);
    expect(isUniqueConstraintError(undefined)).toBe(false);
  });

  it("returns false for objects without a code property", () => {
    expect(isUniqueConstraintError({ message: "duplicate" })).toBe(false);
  });
});
