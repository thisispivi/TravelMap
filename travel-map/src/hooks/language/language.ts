import { i18n } from "i18next";
import { useTranslation } from "react-i18next";

import { normalizeLocale, SupportedLocale } from "@/i18n/locale";

export type UseLanguageReturn = {
  t: i18n["t"];
  currLanguage: SupportedLocale;
  changeLanguage: (lang: string) => void;
};

/**
 * Custom hook wrapping `react-i18next` to expose the translation function,
 * the current locale, and a typed `changeLanguage` helper.
 *
 * @param {string[]} namespaces - i18next namespaces to load.
 * @returns {UseLanguageReturn} Translation utilities.
 */
export function useLanguage(namespaces: string[]): UseLanguageReturn {
  const { i18n, t } = useTranslation(namespaces);
  const currLanguage = normalizeLocale(i18n.resolvedLanguage ?? i18n.language);
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(normalizeLocale(lang));
  };
  return { t, currLanguage, changeLanguage };
}
