import { i18n } from "i18next";
import { useTranslation } from "react-i18next";

import { normalizeLocale, SupportedLocale } from "@/i18n/locale";

/**
 * Translation utilities returned by `useLanguage`.
 * @property {i18n["t"]} t - The i18next translation function
 * @property {SupportedLocale} currLanguage - The normalized active locale
 * @property {(lang: string) => void} changeLanguage - Changes the active locale
 */
export type LanguageData = {
  t: i18n["t"];
  currLanguage: SupportedLocale;
  changeLanguage: (lang: string) => void;
};

/**
 * Custom hook wrapping `react-i18next` to expose the translation function,
 * the current locale, and a typed `changeLanguage` helper.
 * @param {string[]} namespaces - i18next namespaces to load.
 * @returns {LanguageData} Translation utilities.
 */
export function useLanguage(namespaces: string[]): LanguageData {
  const { i18n, t } = useTranslation(namespaces);
  const currLanguage = normalizeLocale(i18n.resolvedLanguage ?? i18n.language);

  /**
   * Change language.
   * @param {string} lang - The lang
   * @returns {void}
   */
  const changeLanguage = (lang: string): void => {
    i18n.changeLanguage(normalizeLocale(lang));
  };

  return { t, currLanguage, changeLanguage };
}
