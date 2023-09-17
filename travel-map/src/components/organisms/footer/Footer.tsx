import "./Footer.scss";
import { DarkModeToggle } from "../../atoms";
import { LanguageDropdown } from "../../atoms";
import { useState } from "react";
import { Info } from "../../atoms/info/Info";

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
  const [isOpened, setIsOpened] = useState(false);
  return (
    <div
      className={`footer ${className} ${active ? "footer-active" : ""} ${
        showDropdown || isOpened ? "footer-dropdown-active" : ""
      }`}
    >
      <Info isOpened={isOpened} setIsOpened={setIsOpened} />
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
