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
  const [isOpened, setIsOpened] = useState(0);

  const handleToggle = () => {
    if (isOpened === 0) {
      setIsOpened(1);
      setTimeout(() => setIsOpened(2), 400);
    } else {
      setIsOpened(0);
    }
  };

  return (
    <div
      className={`footer ${className} ${active ? "footer-active" : ""} ${
        showDropdown || isOpened ? "footer-dropdown-active" : ""
      }`}
    >
      <Info isOpened={isOpened} setIsOpened={handleToggle} />
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
