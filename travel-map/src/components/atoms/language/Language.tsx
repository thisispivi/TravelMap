import { useRef } from "react";
import { LanguageIcon } from "../../../icons/Language";
import { ReactComponent as ItalianIcon } from "../../../icons/Italian.svg";
import { ReactComponent as EnglishIcon } from "../../../icons/UnitedKingdom.svg";
import "./Language.scss";
import { Backdrop } from "../backdrop/Backdrop";

interface LanguageDropdownProps {
  onClick: (lang: string) => void;
  currentLanguage: string;
  className?: string;
  showDropdown?: boolean;
  setShowDropdown?: (showDropdown: boolean) => void;
}

export const LanguageDropdown = ({
  onClick,
  currentLanguage,
  className = "",
  showDropdown = false,
  setShowDropdown = () => {
    return;
  },
}: LanguageDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const items = [
    {
      label: "English",
      value: "en",
    },
    {
      label: "Italiano",
      value: "it",
    },
  ];

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };

  const handleItemClick = (value: string) => {
    onClick(value);
    setTimeout(() => {
      setShowDropdown(false);
    }, 200);
  };

  const getFlag = (lang: string) => {
    if (lang.includes("en")) return <EnglishIcon />;
    if (lang.includes("it")) return <ItalianIcon />;
    return <EnglishIcon />;
  };

  return (
    <>
      {showDropdown && (
        <Backdrop onClick={() => setShowDropdown(false)} visible={false} />
      )}
      <div
        className={`dropdown-wrapper ${className}`}
        ref={dropdownRef}
        onClick={handleDropdownToggle}
      >
        <LanguageIcon />
        <div className="current-language">{getFlag(currentLanguage)}</div>
        <div className={`menu ${showDropdown ? "active" : ""}`}>
          {items.map((item) => (
            <div
              onClick={() => handleItemClick(item.value)}
              key={item.value}
              className={`menu-item ${
                currentLanguage.includes(item.value) ? "active" : ""
              }`}
            >
              {item.label}
              {getFlag(item.value)}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
