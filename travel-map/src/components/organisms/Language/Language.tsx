import "./Language.scss";

import { AnimatePresence, motion } from "framer-motion";
import { JSX, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { LanguageIcon } from "@/assets";
import { useLanguage } from "@/hooks/language/language";
import { useResponsive } from "@/hooks/style/responsive";
import { SUPPORTED_LOCALES } from "@/i18n/locale";

import { Button, LanguageFlag } from "../../atoms";

const possibleLanguages = [...SUPPORTED_LOCALES] as const;

const LANGUAGE_LABELS: Record<string, string> = {
  "en-US": "English",
  "it-IT": "Italiano",
};

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
  const {
    window: { width },
  } = useResponsive();
  const isMobile = width <= 680;

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
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="language-selector__panel"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            style={isMobile ? { x: "-50%" } : { y: "-50%" }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            {possibleLanguages.map((language, i) => (
              <motion.button
                animate={{
                  opacity: 1,
                  ...(isMobile ? { y: 0 } : { x: 0 }),
                  transition: {
                    duration: 0.15,
                    delay: i * 0.04,
                    ease: [0.4, 0, 0.2, 1],
                  },
                }}
                aria-label={language}
                className={`language-selector__lang-option ${
                  currLanguage === language
                    ? "language-selector__lang-option--active"
                    : ""
                }`}
                exit={{
                  opacity: 0,
                  ...(isMobile ? { y: 8 } : { x: -8 }),
                  transition: { duration: 0.1 },
                }}
                initial={{ opacity: 0, ...(isMobile ? { y: 8 } : { x: -8 }) }}
                key={language}
                onClick={() => {
                  changeLanguage(language);
                  setIsOpen(false);
                }}
                type="button"
              >
                <LanguageFlag
                  className="language-selector__lang-option__flag"
                  language={language}
                />
                <span className="language-selector__lang-option__label">
                  {LANGUAGE_LABELS[language] ?? language}
                </span>
              </motion.button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
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
