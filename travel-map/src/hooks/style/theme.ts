import { useEffect, useState } from "react";

/**
 * Hook to detect the current theme of the user's system
 * @returns {ThemeDetector} - Object containing the current theme and a function to set the theme
 */
export default function useThemeDetector(): ThemeDetector {
  const getInitialTheme = () => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) return storedTheme === "dark";
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    localStorage.setItem("theme", prefers ? "dark" : "light");
    return prefers;
  };
  const [isDarkTheme, setIsDarkTheme] = useState(getInitialTheme());
  const handleDarkModeSwitch = () => {
    const newTheme = isDarkTheme ? "light" : "dark";
    localStorage.setItem("theme", newTheme);
    setIsDarkTheme(!isDarkTheme);
  };

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

  return { isDarkTheme, handleDarkModeSwitch };
}

export type ThemeDetector = {
  isDarkTheme: boolean;
  handleDarkModeSwitch: () => void;
};
