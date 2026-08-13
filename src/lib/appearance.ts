import {
  DEFAULT_USER_PREFERENCES,
  isAppearance,
  type Appearance,
} from "@/lib/user-preferences";

export const APPEARANCE_COOKIE_NAME = "memex-appearance";

export const APPEARANCE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type Theme = "light" | "dark" | "dark-blue";

export { isAppearance };

export function parseAppearance(
  value: unknown,
  fallback: Appearance = DEFAULT_USER_PREFERENCES.appearance,
): Appearance {
  return isAppearance(value) ? value : fallback;
}

export function getSystemIsDark(): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function resolveTheme(
  appearance: Appearance,
  systemIsDark: boolean = getSystemIsDark(),
): Theme {
  if (appearance === "system") {
    return systemIsDark ? "dark" : "light";
  }

  return appearance;
}

export function isDarkTheme(theme: Theme): boolean {
  return theme === "dark" || theme === "dark-blue";
}

export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.theme = theme;
}

export function setAppearanceCookie(appearance: Appearance): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${APPEARANCE_COOKIE_NAME}=${appearance};path=/;max-age=${APPEARANCE_COOKIE_MAX_AGE};samesite=lax`;
}

const DEFAULT_APPEARANCE = DEFAULT_USER_PREFERENCES.appearance;

const FALLBACK_THEME: Theme =
  DEFAULT_APPEARANCE === "system" ? "dark" : DEFAULT_APPEARANCE;

export const APPEARANCE_INLINE_SCRIPT = `(function(){try{var c=document.cookie.match(/(?:^|; )${APPEARANCE_COOKIE_NAME}=([^;]*)/);var a=c?decodeURIComponent(c[1]):'${DEFAULT_APPEARANCE}';var t=a==='light'?'light':a==='dark-blue'?'dark-blue':a==='dark'?'dark':a==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):'${FALLBACK_THEME}';document.documentElement.dataset.theme=t;}catch(e){}})();`;
