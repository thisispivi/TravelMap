import { useState } from "react";
import Button from "../../atoms/Buttons/Button";
import "./Language.scss";
import useLanguage from "../../../hooks/language/language";
import { LanguageFlag } from "../../atoms";
import { LanguageIcon } from "../../../assets";

export default function LanguageSelctor() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentLanguage, changeLanguage } = useLanguage([]);

  const possibleLanguages = ["it", "en"];

  return (
    <div className="language-selector">
      <Button
        className={`language-selector__activator ${
          isOpen ? "language-selector__activator--open" : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <LanguageIcon className={`language-selector__language-icon`} />
        <LanguageFlag
          language={currentLanguage}
          className={`language-selector__language-flag-icon`}
        />
      </Button>
      {possibleLanguages.map((language) => (
        <Button
          key={language}
          className={`language-selector__button ${
            currentLanguage === language
              ? "language-selector__button--active"
              : ""
          } language-selector__button--${language}
            ${isOpen ? "language-selector__button--open" : ""}
          `}
          onClick={() => {
            changeLanguage(language);
            setIsOpen(false);
          }}
        >
          <LanguageFlag language={language} />
        </Button>
      ))}
    </div>
  );
}
