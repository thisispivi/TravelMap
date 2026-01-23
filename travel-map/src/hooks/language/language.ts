import { i18n } from "i18next";
import { useTranslation } from "react-i18next";
import { SupportedLocale, normalizeLocale } from "@/i18n/locale";

export type LanguageHook = {
  t: i18n["t"];
  currLanguage: SupportedLocale;
  changeLanguage: (lang: string) => void;
};

/**
 * Custom hook to use i18n and t function from react-i18next
 * @param {string[]} namespaces - Array of namespaces to use
 * @returns {LanguageHook} - Object containing t function, current language and changeLanguage function
 */
export function useLanguage(namespaces: string[]): LanguageHook {
  const { i18n, t } = useTranslation(namespaces);
  const currLanguage = normalizeLocale(i18n.resolvedLanguage ?? i18n.language);
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(normalizeLocale(lang));
  };
  return { t, currLanguage, changeLanguage };
}
