import { useEffect, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";

import { createStoredChoice } from "../lib/storage";
import { isMotionReduced } from "./useMotionPreference";

/* Every theme a reader can ask for; a first visit follows the system. */
export const THEME_PREFERENCES = ["light", "dark", "system"] as const;

/** A theme a reader can ask for. */
export type ThemePreference = (typeof THEME_PREFERENCES)[number];

/**
 * Theme state returned by `useThemeDetector`.
 * @property {boolean} isDarkTheme - Whether the dark theme is active
 * @property {() => void} handleDarkModeSwitch - Toggles the active theme
 * @property {ThemePreference} themePreference - The reader's choice
 * @property {(next: ThemePreference) => void} setThemePreference - Changes it
 */
export type ThemeDetector = {
  isDarkTheme: boolean;
  handleDarkModeSwitch: () => void;
  themePreference: ThemePreference;
  setThemePreference: (next: ThemePreference) => void;
};

const DARK_QUERY = "(prefers-color-scheme: dark)";
const themeChoice = createStoredChoice("theme", THEME_PREFERENCES, "system");

/**
 * Reads the operating system's theme.
 * @returns {boolean} Whether the system asks for dark
 */
function readSystemDark(): boolean {
  return window.matchMedia(DARK_QUERY).matches;
}

/**
 * Follows the operating system's theme.
 * @param {() => void} listener - Called when it changes
 * @returns {() => void} Stops following
 */
function subscribeToSystemTheme(listener: () => void): () => void {
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

/**
 * Turns a preference into the theme it means right now.
 * @param {ThemePreference} preference - The reader's choice
 * @param {boolean} isSystemDark - Whether the system asks for dark
 * @returns {boolean} Whether the dark theme should be active
 */
function resolveDark(
  preference: ThemePreference,
  isSystemDark: boolean,
): boolean {
  return preference === "system" ? isSystemDark : preference === "dark";
}

/**
 * Reads the remembered theme, falling back to the operating system's.
 * @returns {boolean} Whether the dark theme should be active
 */
export function readInitialDarkTheme(): boolean {
  return resolveDark(themeChoice.read(), readSystemDark());
}

/**
 * Puts the theme class on `body`, where `_tokens.scss` switches every colour
 * token. It remembers nothing: only a reader's own choice is stored, or a first
 * visit would pin the system's theme of that day for good.
 * @param {boolean} isDark - Whether the dark theme is active
 * @returns {void}
 */
export function applyTheme(isDark: boolean): void {
  document.body.classList.toggle("body--dark", isDark);
  document.body.classList.toggle("body--light", !isDark);
}

/**
 * Holds the theme, shared by everything that reads it. The class is applied in
 * the setter rather than in an effect so the switch can run inside a view
 * transition: the browser cross-fades the old and new themes, including the map
 * canvas, without animating any property by hand.
 * @returns {ThemeDetector} The current theme and what changes it
 */
export function useThemeDetector(): ThemeDetector {
  const themePreference = useSyncExternalStore(
    themeChoice.subscribe,
    themeChoice.read,
  );
  const isSystemDark = useSyncExternalStore(
    subscribeToSystemTheme,
    readSystemDark,
  );
  const isDarkTheme = resolveDark(themePreference, isSystemDark);

  /* A system change arrives with no press to run the setter from. */
  useEffect(() => applyTheme(isDarkTheme), [isDarkTheme]);

  /**
   * Remembers a preference and applies it to the document and to React in one
   * step.
   * @param {ThemePreference} next - The new preference
   * @returns {void}
   */
  const setThemePreference = (next: ThemePreference): void => {
    /**
     * Applies the new theme.
     * @returns {void}
     */
    const commit = (): void => {
      applyTheme(resolveDark(next, readSystemDark()));
      flushSync(() => themeChoice.write(next));
    };

    if (document.startViewTransition && !isMotionReduced())
      document.startViewTransition(commit);
    else commit();
  };

  /**
   * Toggles between the light and dark application themes.
   * @returns {void}
   */
  const handleDarkModeSwitch = (): void =>
    setThemePreference(isDarkTheme ? "light" : "dark");

  return {
    isDarkTheme,
    handleDarkModeSwitch,
    themePreference,
    setThemePreference,
  };
}
