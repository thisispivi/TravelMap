import { useState } from "react";
import { flushSync } from "react-dom";

import { readStoredString, writeStoredString } from "../lib/storage";

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
 * Reads the remembered theme, falling back to the operating system's.
 * @returns {boolean} Whether the dark theme should be active
 */
export function readInitialDarkTheme(): boolean {
  const storedTheme = readStoredString("theme");
  if (storedTheme) return storedTheme === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * Puts the theme class on `body`, where `_tokens.scss` switches every colour
 * token, and remembers the choice.
 * @param {boolean} isDark - Whether the dark theme is active
 * @returns {void}
 */
export function applyTheme(isDark: boolean): void {
  writeStoredString("theme", isDark ? "dark" : "light");
  document.body.classList.toggle("body--dark", isDark);
  document.body.classList.toggle("body--light", !isDark);
}

/**
 * Holds the light/dark theme. The class is applied in the toggle rather than
 * in an effect so the switch can run inside a view transition: the browser
 * cross-fades the old and new themes, including the map canvas, without
 * animating any property by hand.
 * @returns {ThemeDetector} The current theme and its toggle handler
 */
export function useThemeDetector(): ThemeDetector {
  const [isDarkTheme, setIsDarkTheme] = useState(readInitialDarkTheme);

  /**
   * Toggles between the light and dark application themes.
   * @returns {void}
   */
  const handleDarkModeSwitch = (): void => {
    const next = !isDarkTheme;

    /**
     * Applies the new theme to the document and to React in one step.
     * @returns {void}
     */
    const commit = (): void => {
      applyTheme(next);
      flushSync(() => setIsDarkTheme(next));
    };

    if (document.startViewTransition) document.startViewTransition(commit);
    else commit();
  };

  return { isDarkTheme, handleDarkModeSwitch };
}
