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
  setShowDropdown = () => {},
}: LanguageDropdownProps) => {
  const dropdownRef = useRef<any>(null);
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
    switch (lang) {
      case "en":
        return <EnglishIcon />;
      case "it":
        return <ItalianIcon />;
      default:
        return <EnglishIcon />;
    }
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
                item.value === currentLanguage ? "active" : ""
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
