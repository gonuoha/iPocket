export type UserPreferences = {
  showOverview: boolean;
};

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  showOverview: true,
};

export function parseUserPreferences(raw: unknown): UserPreferences {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_USER_PREFERENCES;
  }

  const value = raw as Record<string, unknown>;

  return {
    showOverview:
      typeof value.showOverview === "boolean"
        ? value.showOverview
        : DEFAULT_USER_PREFERENCES.showOverview,
  };
}
