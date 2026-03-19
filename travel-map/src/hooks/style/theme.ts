import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Hook to detect the current theme of the user's system
 * @returns {ThemeDetector} - Object containing the current theme and a function to set the theme
 */
export function useThemeDetector(): ThemeDetector {
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) return storedTheme === "dark";
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    localStorage.setItem("theme", prefers ? "dark" : "light");
    return prefers;
  });

  const handleDarkModeSwitch = useCallback(() => {
    setIsDarkTheme((prev) => {
      const newTheme = !prev;
      localStorage.setItem("theme", newTheme ? "dark" : "light");
      return newTheme;
    });
  }, []);

  useEffect(() => {
    const body = document.querySelector("body");
    if (isDarkTheme) {
      body?.classList.add("body--dark");
      body?.classList.remove("body--light");
    } else {
      body?.classList.add("body--light");
      body?.classList.remove("body--dark");
    }
  }, [isDarkTheme]);

  return useMemo(
    () => ({ isDarkTheme, handleDarkModeSwitch }),
    [isDarkTheme, handleDarkModeSwitch],
  );
}

export type ThemeDetector = {
  isDarkTheme: boolean;
  handleDarkModeSwitch: () => void;
};
