import { describe, expect, it } from "vitest";

import { APP_MONACO_THEME_IDS, resolveMonacoThemeId } from "./monaco-app-theme";

describe("resolveMonacoThemeId", () => {
  it("maps the app-matched preference to a theme per app theme", () => {
    expect(resolveMonacoThemeId("app", "light")).toBe(APP_MONACO_THEME_IDS.light);
    expect(resolveMonacoThemeId("app", "dark")).toBe(APP_MONACO_THEME_IDS.dark);
    expect(resolveMonacoThemeId("app", "dark-blue")).toBe(
      APP_MONACO_THEME_IDS["dark-blue"],
    );
  });

  it("honors an explicit editor theme in every app theme", () => {
    expect(resolveMonacoThemeId("vs-dark", "dark")).toBe("vs-dark");
    expect(resolveMonacoThemeId("monokai", "dark-blue")).toBe("monokai");
    expect(resolveMonacoThemeId("github-dark", "light")).toBe("github-dark");
  });
});
