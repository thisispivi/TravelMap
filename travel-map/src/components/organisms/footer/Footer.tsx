import "./Footer.scss";
import { DarkModeToggle } from "../../atoms/toggle/Toogle";
import { LanguageDropdown } from "../../atoms/language/Language";
import { useState } from "react";

interface FooterProps {
  className?: string;
  setDarkMode: (isDarkMode: boolean) => void;
  active?: boolean;
  currentLanguage: string;
  changeLanguage: (lang: string) => void;
}

export function Footer({
  className = "",
  active = true,
  setDarkMode,
  currentLanguage,
  changeLanguage,
}: FooterProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  return (
    <div
      className={`footer ${className} ${active ? "footer-active" : ""} ${
        showDropdown ? "footer-dropdown-active" : ""
      }`}
    >
      <LanguageDropdown
        currentLanguage={currentLanguage}
        onClick={changeLanguage}
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
      />
      <DarkModeToggle setDarkMode={setDarkMode} />
    </div>
  );
}
