import { beforeEach, describe, expect, it, vi } from "vitest";

import type { EditorPreferences } from "@/lib/editor-preferences";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/settings", () => ({
  updateEditorPreferences: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { auth } from "@/auth";
import { updateEditorPreferences as updateEditorPreferencesInDb } from "@/lib/db/settings";
import { revalidatePath } from "next/cache";

import { updateEditorPreferences } from "./settings";

const mockAuth = vi.mocked(auth);
const mockUpdateEditorPreferencesInDb = vi.mocked(updateEditorPreferencesInDb);
const mockRevalidatePath = vi.mocked(revalidatePath);

const preferences: EditorPreferences = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: false,
  minimap: true,
  theme: "monokai",
};

describe("updateEditorPreferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized when there is no session", async () => {
    mockAuth.mockResolvedValue(null);

    const result = await updateEditorPreferences(preferences);

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockUpdateEditorPreferencesInDb).not.toHaveBeenCalled();
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it("returns a validation error for invalid input", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);

    const result = await updateEditorPreferences({
      ...preferences,
      theme: "invalid-theme",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
    expect(mockUpdateEditorPreferencesInDb).not.toHaveBeenCalled();
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it("saves preferences and revalidates settings", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockUpdateEditorPreferencesInDb.mockResolvedValue(preferences);

    const result = await updateEditorPreferences(preferences);

    expect(result).toEqual({ success: true, data: preferences });
    expect(mockUpdateEditorPreferencesInDb).toHaveBeenCalledWith(
      "user-1",
      preferences,
    );
    expect(mockRevalidatePath).toHaveBeenCalledWith("/settings");
  });

  it("returns an error when the database update fails", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockUpdateEditorPreferencesInDb.mockRejectedValue(new Error("db error"));

    const result = await updateEditorPreferences(preferences);

    expect(result).toEqual({
      success: false,
      error: "Failed to save editor preferences",
    });
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });
});
