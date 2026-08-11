import { vi } from "vitest";

import { TEST_USER_ID } from "./fixtures";

export const mockAuth = vi.fn();

vi.mock("@/auth", () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
}));

export function mockAuthenticatedSession(userId = TEST_USER_ID) {
  mockAuth.mockResolvedValue({ user: { id: userId } } as never);
}

export function mockUnauthenticated() {
  mockAuth.mockResolvedValue(null);
}
