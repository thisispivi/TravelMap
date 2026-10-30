import "./LanguageMenu.scss";

import { ReactNode, useRef, useState } from "react";

import { SUPPORTED_LOCALES, SupportedLocale } from "@/i18n/locale";
import { CountryFlag } from "@/shared/components/CountryFlag/CountryFlag";
import { Popover } from "@/shared/components/Popover/Popover";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { classNames } from "@/shared/lib/classNames";

/* English is drawn with the United Kingdom's flag, as the old switcher did. */
const LOCALE_FLAGS: Record<SupportedLocale, string> = {
  "en-US": "UnitedKingdom",
  "it-IT": "Italy",
};

/**
 * Names a locale in its own language, such as `English` or `Italiano`.
 * @param {SupportedLocale} locale - The locale
 * @returns {string} Its native name
 */
function nativeName(locale: SupportedLocale): string {
  const language = locale.slice(0, 2);
  const name =
    new Intl.DisplayNames([locale], { type: "language" }).of(language) ??
    language;
  return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);
}

/**
 * Properties accepted by the LanguageMenu component.
 * @property {string} label - The accessible name of the trigger and its menu
 * @property {"below" | "beside"} placement - Where the menu opens relative to the trigger
 * @property {string} triggerClassName - The owner's class for the trigger button
 */
interface LanguageMenuProps {
  label: string;
  placement: "below" | "beside";
  triggerClassName: string;
}

/**
 * LanguageMenu component
 * The current language's flag; pressing it lists every language by flag and
 * native name in a frosted popover. The site's rail and the editor's rail
 * both use it, so a language is chosen the same way in either app.
 * @component
 * @param {LanguageMenuProps} props - The menu props
 * @param {string} props.label - The accessible name of the trigger and its menu
 * @param {"below" | "beside"} props.placement - Where the menu opens
 * @param {string} props.triggerClassName - The owner's class for the trigger
 * @returns {ReactNode} The language menu
 */
export function LanguageMenu({
  label,
  placement,
  triggerClassName,
}: LanguageMenuProps): ReactNode {
  const { currLanguage, changeLanguage } = useLanguage([]);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        aria-expanded={anchor !== null}
        aria-haspopup="dialog"
        aria-label={label}
        className={triggerClassName}
        onClick={(event) =>
          setAnchor(anchor ? null : event.currentTarget.getBoundingClientRect())
        }
        ref={triggerRef}
        type="button"
      >
        <CountryFlag
          className="language-menu__flag"
          countryId={LOCALE_FLAGS[currLanguage]}
        />
      </button>
      <Popover
        anchor={anchor}
        label={label}
        onClose={() => setAnchor(null)}
        placement={placement}
        triggerRef={triggerRef}
      >
        <ul className="language-menu">
          {SUPPORTED_LOCALES.map((locale) => (
            <li key={locale}>
              <button
                aria-pressed={locale === currLanguage}
                className={classNames(
                  "language-menu__option",
                  locale === currLanguage && "language-menu__option--active",
                )}
                onClick={() => {
                  changeLanguage(locale);
                  setAnchor(null);
                }}
                type="button"
              >
                <CountryFlag
                  className="language-menu__flag"
                  countryId={LOCALE_FLAGS[locale]}
                />
                {nativeName(locale)}
              </button>
            </li>
          ))}
        </ul>
      </Popover>
    </>
  );
}
