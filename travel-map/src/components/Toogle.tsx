import Toggle from "react-toggle";
import { useMediaQuery } from "react-responsive";
import { useEffect, useMemo, useState } from "react";
import { ReactComponent as MoonIcon } from "../icons/Moon.svg";
import { ReactComponent as SunIcon } from "../icons/Sun.svg";

interface DarkModeToggleProps {
  className?: string;
  setDarkMode: (isDark: boolean) => void;
}

export function DarkModeToggle({
  className,
  setDarkMode,
}: DarkModeToggleProps) {
  const systemPrefersDark = useMediaQuery(
    {
      query: "(prefers-color-scheme: dark)",
    },
    undefined
  );
  const value = useMemo(() => {
    const localValue = localStorage.getItem("darkMode");
    if (localValue) {
      return localValue === "true";
    }
    return systemPrefersDark;
  }, [systemPrefersDark]);

  const [isDark, setIsDark] = useState(value);

  useEffect(() => {
    if (isDark) {
      document.body.classList.add("dark");
      setDarkMode(true);
    } else {
      document.body.classList.remove("dark");
      setDarkMode(false);
    }
  }, [isDark, setDarkMode]);

  useEffect(() => {
    localStorage.setItem("darkMode", isDark.toString());
  }, [isDark]);

  return (
    <Toggle
      checked={isDark}
      onChange={({ target }) => setIsDark(target.checked)}
      icons={{ checked: <SunIcon />, unchecked: <MoonIcon /> }}
      aria-label="Dark mode toggle"
      className={className}
    />
  );
}
