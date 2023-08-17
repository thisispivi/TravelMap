import { useState, useEffect, useRef } from "react";
import { LanguageIcon } from "../icons/Language";
import { ReactComponent as ItalianIcon } from "../icons/Italian.svg";
import { ReactComponent as EnglishIcon } from "../icons/English.svg";

interface LanguageDropdownProps {
  onClick: (lang: string) => void;
  currentLanguage: string;
  iconColorClass?: string;
}

export const LanguageDropdown = ({
  onClick,
  currentLanguage,
  iconColorClass = "",
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
    const style = {
      marginLeft: "8px",
      width: "20px",
      height: "20px",
    };
    switch (lang) {
      case "en":
        return <EnglishIcon style={style} />;
      case "it":
        return <ItalianIcon style={style} />;
      default:
        return <EnglishIcon style={style} />;
    }
  };

  return (
    <div className="dropdown-wrapper" ref={dropdownRef}>
      <LanguageIcon onClick={handleDropdownToggle} className={iconColorClass} />
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
