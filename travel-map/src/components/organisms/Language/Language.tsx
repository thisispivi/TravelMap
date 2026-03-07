import "./Language.scss";

import { AnimatePresence, motion } from "framer-motion";
import { JSX, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { LanguageIcon } from "@/assets";
import { useLanguage } from "@/hooks/language/language";
import { SUPPORTED_LOCALES } from "@/i18n/locale";

import { Button, LanguageFlag } from "../../atoms";

const possibleLanguages = [...SUPPORTED_LOCALES] as const;

/**
 * LanguageSelector component
 *
 * The language selector component is used to change the language of the app.
 *
 * @component
 *
 * @returns {JSX.Element} - The language selector
 */
export function LanguageSelector(): JSX.Element {
  const { t } = useTranslation("home");
  const [isOpen, setIsOpen] = useState(false);
  const { currLanguage, changeLanguage } = useLanguage([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  return (
    <div className="language-selector" ref={ref}>
      <div className="language-selector__options">
        <AnimatePresence>
          {isOpen
            ? possibleLanguages.map((language, i) => (
                <motion.div
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    transition: {
                      duration: 0.18,
                      delay: i * 0.06,
                      ease: [0.4, 0, 0.2, 1],
                    },
                  }}
                  className="language-selector__option"
                  exit={{
                    opacity: 0,
                    scale: 0.75,
                    y: 8,
                    transition: { duration: 0.14 },
                  }}
                  initial={{ opacity: 0, scale: 0.75, y: 8 }}
                  key={language}
                >
                  <motion.button
                    aria-label={language}
                    className={`button language-selector__lang-button ${
                      currLanguage === language
                        ? "language-selector__lang-button--active"
                        : ""
                    }`}
                    onClick={() => {
                      changeLanguage(language);
                      setIsOpen(false);
                    }}
                    type="button"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <LanguageFlag language={language} />
                  </motion.button>
                </motion.div>
              ))
            : null}
        </AnimatePresence>
      </div>
      <Button
        ariaLabel={t("language")}
        className={`language-selector__activator ${
          isOpen ? "language-selector__activator--open" : ""
        }`}
        onClick={() => setIsOpen((open) => !open)}
        tooltipContent={t("language")}
        tooltipId="base-tooltip"
      >
        <LanguageIcon className="language-selector__language-icon" />
        <LanguageFlag
          className="language-selector__language-flag-icon"
          language={currLanguage}
        />
      </Button>
    </div>
  );
}
