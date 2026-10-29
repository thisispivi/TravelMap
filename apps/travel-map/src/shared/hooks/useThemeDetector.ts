import { useEffect, useState } from "react";

import { readStoredString, writeStoredString } from "@/shared/lib/storage";

/**
 * Theme state returned by `useThemeDetector`.
 * @property {boolean} isDarkTheme - Whether the dark theme is active
 * @property {() => void} handleDarkModeSwitch - Toggles the active theme
 */
export type ThemeDetector = {
  isDarkTheme: boolean;
  handleDarkModeSwitch: () => void;
};

/**
 * Hook to detect the current theme of the user's system
 * @returns {ThemeDetector} The current theme and its toggle handler
 */
export function useThemeDetector(): ThemeDetector {
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const storedTheme = readStoredString("theme");
    if (storedTheme) return storedTheme === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  /**
   * Toggles between the light and dark application themes.
   * @returns {void}
   */
  const handleDarkModeSwitch = (): void => {
    setIsDarkTheme((prev) => !prev);
  };

  useEffect(() => {
    writeStoredString("theme", isDarkTheme ? "dark" : "light");
    const body = document.querySelector("body");
    if (isDarkTheme) {
      body?.classList.add("body--dark");
      body?.classList.remove("body--light");
    } else {
      body?.classList.add("body--light");
      body?.classList.remove("body--dark");
    }
  }, [isDarkTheme]);

  return { isDarkTheme, handleDarkModeSwitch };
}
