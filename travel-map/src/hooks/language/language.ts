import { i18n } from "i18next";
import { useTranslation } from "react-i18next";

export type LanguageHook = {
  t: i18n["t"];
  currentLanguage: string;
  changeLanguage: (lang: string) => void;
};

/**
 * Custom hook to use i18n and t function from react-i18next
 * @param {string[]} namespaces - Array of namespaces to use
 * @returns {LanguageHook} - Object containing t function, current language and changeLanguage function
 */
export default function useLanguage(namespaces: string[]): LanguageHook {
  const { i18n, t } = useTranslation(namespaces);
  const currentLanguage = i18n.language;
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };
  return { t, currentLanguage, changeLanguage };
}
