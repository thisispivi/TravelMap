import { useTranslation } from "react-i18next";

export const useLanguage = (namespaces: string[]) => {
  const { i18n, t } = useTranslation(namespaces);
  const currentLanguage = i18n.language;
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };
  return { t, currentLanguage, changeLanguage };
};
