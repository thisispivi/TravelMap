import { useState, useEffect, useRef } from "react";
import { LanguageIcon } from "../icons/Language";
import { ReactComponent as ItalianIcon } from "../icons/Italian.svg";
import { ReactComponent as EnglishIcon } from "../icons/UnitedKingdom.svg";

interface LanguageDropdownProps {
  onClick: (lang: string) => void;
  currentLanguage: string;
  className?: string;
}

export const LanguageDropdown = ({
  onClick,
  currentLanguage,
  className = "",
}: LanguageDropdownProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
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

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setTimeout(() => {
        setShowDropdown(false);
      }, 200);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
  );
};
