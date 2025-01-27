import { JSX, useState } from "react";
import "./Language.scss";
import useLanguage from "../../../hooks/language/language";
import { Button, LanguageFlag } from "../../atoms";
import { LanguageIcon } from "../../../assets";

/**
 * LanguageSelector component
 *
 * The language selector component is used to change the language of the app.
 *
 * @component
 *
 * @returns {JSX.Element} - The language selector
 */
export default function LanguageSelector(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const { currLanguage, changeLanguage } = useLanguage([]);

  const possibleLanguages = ["it", "en"];

  return (
    <div className="language-selector">
      <Button
        className={`language-selector__activator ${
          isOpen ? "language-selector__activator--open" : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <LanguageIcon className="language-selector__language-icon" />
        <LanguageFlag
          className="language-selector__language-flag-icon"
          language={currLanguage}
        />
      </Button>
      {possibleLanguages.map((language) => (
        <Button
          className={`language-selector__button ${
            currLanguage.includes(language)
              ? "language-selector__button--active"
              : ""
          } language-selector__button--${language}
            ${isOpen ? "language-selector__button--open" : ""}
          `}
          key={language}
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
