import { ReactNode } from "react";

import { CountryFlag } from "@/shared/components/CountryFlag/CountryFlag";

/** Maps each supported language prefix to its country flag identifier. */
const FLAG_BY_LANGUAGE: Record<string, string> = {
  de: "Germany",
  en: "UnitedKingdom",
  es: "Spain",
  hu: "Hungary",
  it: "Italy",
  ja: "Japan",
  mt: "Malta",
  pt: "Portugal",
};

/**
 * Properties accepted by the LanguageFlag component.
 * @property {string} language - The language
 * @property {string} [className] - The class name
 */
interface LanguageFlagProps {
  language: string;
  className?: string;
}

/**
 * LanguageFlag component
 * Given the current i18n language, it returns the flag of the language
 * @component
 * @param {LanguageFlagProps} props - The props of the component
 * @param {string} props.language - The current language
 * @param {string} [props.className=""] - The class to apply to the flag
 * @returns {ReactNode} The language flag
 */
export function LanguageFlag({
  language,
  className = "",
}: LanguageFlagProps): ReactNode {
  const countryId = FLAG_BY_LANGUAGE[language.slice(0, 2)];
  return countryId ? (
    <CountryFlag className={className} countryId={countryId} />
  ) : null;
}
