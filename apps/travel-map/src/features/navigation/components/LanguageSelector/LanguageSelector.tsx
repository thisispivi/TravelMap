import "./LanguageSelector.scss";

import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

import LanguageIcon from "@/assets/icons/Language.svg?react";
import { SUPPORTED_LOCALES } from "@/i18n/locale";
import { Button } from "@/shared/components/Button/Button";
import { useLanguage } from "@/shared/hooks/useLanguage";

import { LanguageFlag } from "../LanguageFlag/LanguageFlag";
const possibleLanguages = [...SUPPORTED_LOCALES] as const;
const LANGUAGE_LABELS: Record<string, string> = {
  "en-US": "English",
  "it-IT": "Italiano",
};

/**
 * Represents a panel pos.
 * @property {number} top - The top
 * @property {number} right - The right
 * @property {number} bottom - The bottom
 */
type PanelPos =
  | {
      top: number;
      right: number;
    }
  | {
      bottom: number;
      right: number;
    };
const PANEL_OFFSET_PX = 8;

/**
 * Positions the language panel above or below its trigger based on available space.
 * @param {HTMLElement} el - The language-button element
 * @returns {PanelPos} The viewport-relative panel position
 */
function computePanelPos(el: HTMLElement): PanelPos {
  const rect = el.getBoundingClientRect();
  const right = window.innerWidth - rect.right;
  return rect.bottom < window.innerHeight / 2
    ? { top: rect.bottom + PANEL_OFFSET_PX, right }
    : { bottom: window.innerHeight - rect.top + PANEL_OFFSET_PX, right };
}

/**
 * LanguageSelector component
 * Dropdown language switcher for supported locales. The panel is portaled
 * to the document body and anchored to the right edge of the trigger button.
 * It opens downward on desktop (top nav) and upward on mobile (bottom nav),
 * always staying within the viewport. A transparent backdrop captures
 * outside clicks to close the panel.
 * @component
 * @returns {ReactNode} The language selector
 */
export function LanguageSelector(): ReactNode {
  const { t } = useTranslation("home");
  const [isOpen, setIsOpen] = useState(false);
  const [panelPos, setPanelPos] = useState<PanelPos | null>(null);
  const { currLanguage, changeLanguage } = useLanguage([]);
  const buttonRef = useRef<HTMLDivElement>(null);

  /**
   * Opens or closes the language panel and positions it when opening.
   * @returns {void}
   */
  const handleToggle = (): void => {
    if (!isOpen && buttonRef.current)
      setPanelPos(computePanelPos(buttonRef.current));
    setIsOpen((prev) => !prev);
  };
  useEffect(() => {
    if (!isOpen || !buttonRef.current) return;
    const el = buttonRef.current;

    /**
     * Repositions the language panel after a viewport resize.
     * @returns {void}
     */
    const onResize = (): void => setPanelPos(computePanelPos(el));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isOpen]);
  const isAbove = panelPos ? "top" in panelPos : true;
  const slideY = isAbove ? -8 : 8;
  const langOptions = possibleLanguages.map((language, i) => (
    <m.button
      animate={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.15, delay: i * 0.04, ease: [0.4, 0, 0.2, 1] },
      }}
      aria-label={language}
      className={`language-selector__lang-option ${
        currLanguage === language
          ? "language-selector__lang-option--active"
          : ""
      }`}
      exit={{ opacity: 0, y: 4, transition: { duration: 0.1 } }}
      initial={{ opacity: 0, y: 4 }}
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
    </m.button>
  ));
  return (
    <LazyMotion features={domAnimation}>
      <div className="language-selector" ref={buttonRef}>
        {createPortal(
          <>
            <AnimatePresence>
              {isOpen ? (
                <m.div
                  animate={{ opacity: 1 }}
                  className="language-selector__backdrop"
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0 }}
                  key="lang-backdrop"
                  onClick={() => setIsOpen(false)}
                  transition={{ duration: 0.15 }}
                />
              ) : null}
            </AnimatePresence>
            <AnimatePresence>
              {isOpen && panelPos ? (
                <m.div
                  animate={{ opacity: 1, y: 0 }}
                  className="language-selector__panel"
                  exit={{ opacity: 0, y: slideY }}
                  initial={{ opacity: 0, y: slideY }}
                  key="lang-panel"
                  style={panelPos}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                >
                  {langOptions}
                </m.div>
              ) : null}
            </AnimatePresence>
          </>,
          document.body,
        )}
        <Button
          ariaLabel={t("language")}
          className={`language-selector__activator ${isOpen ? "language-selector__activator--open" : ""}`}
          onClick={handleToggle}
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
    </LazyMotion>
  );
}
