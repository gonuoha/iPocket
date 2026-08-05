import { describe, expect, it } from "vitest";

import { getUserInitials } from "./get-user-initials";

describe("getUserInitials", () => {
  it("returns initials from a full name", () => {
    expect(getUserInitials("Jane Doe")).toBe("JD");
  });

  it("returns a single initial for one name", () => {
    expect(getUserInitials("Jane")).toBe("J");
  });

  it("limits initials to two characters", () => {
    expect(getUserInitials("Jane Middle Doe")).toBe("JM");
  });

  it("uppercases initials", () => {
    expect(getUserInitials("jane doe")).toBe("JD");
  });
});
