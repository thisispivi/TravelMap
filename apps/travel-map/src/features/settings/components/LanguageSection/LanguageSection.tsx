import "./LanguageSection.scss";

import { CountryFlag } from "@travelmap/ui/components/CountryFlag/CountryFlag";
import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { LOCALE_FLAGS, nativeName } from "@travelmap/ui/i18n/locale";
import { classNames } from "@travelmap/ui/lib/classNames";
import { ReactNode } from "react";

import { siteConfig } from "@/data/world";

import { offeredLocales } from "../../lib/about";
import { SettingsSection } from "../SettingsSection/SettingsSection";

/**
 * LanguageSection component
 * Every language on offer by its own name, as native radio buttons, so arrow keys
 * and screen readers need nothing extra.
 * @component
 * @returns {ReactNode} The language card
 */
export function LanguageSection(): ReactNode {
  const { t, currLanguage, changeLanguage } = useLanguage(["home"]);

  return (
    <SettingsSection title={t("settings.language.title")}>
      <div
        aria-label={t("settings.language.title")}
        className="language-section"
        role="radiogroup"
      >
        {offeredLocales(siteConfig?.locales, currLanguage).map((locale) => (
          <label
            className={classNames(
              "language-section__option",
              locale === currLanguage && "language-section__option--active",
            )}
            key={locale}
          >
            <input
              checked={locale === currLanguage}
              className="language-section__radio"
              name="settings-language"
              onChange={() => changeLanguage(locale)}
              type="radio"
            />
            <CountryFlag
              className="language-section__flag"
              countryId={LOCALE_FLAGS[locale]}
            />
            <span lang={locale}>{nativeName(locale)}</span>
          </label>
        ))}
      </div>
    </SettingsSection>
  );
}
