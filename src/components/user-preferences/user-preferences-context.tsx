"use client";

import { createContext, useContext } from "react";

import {
  DEFAULT_USER_PREFERENCES,
  type TypeColorPosition,
  type UserPreferences,
} from "@/lib/user-preferences";

type UserPreferencesContextValue = {
  typeColorPosition: TypeColorPosition;
};

const UserPreferencesContext =
  createContext<UserPreferencesContextValue | null>(null);

export function UserPreferencesProvider({
  children,
  initialPreferences,
}: {
  children: React.ReactNode;
  initialPreferences: UserPreferences;
}) {
  return (
    <UserPreferencesContext.Provider
      value={{ typeColorPosition: initialPreferences.typeColorPosition }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useTypeColorPosition(): TypeColorPosition {
  const context = useContext(UserPreferencesContext);

  return (
    context?.typeColorPosition ?? DEFAULT_USER_PREFERENCES.typeColorPosition
  );
}
