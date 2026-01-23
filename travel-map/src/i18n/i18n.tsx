import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import homeIt from "./locales/it-IT/home.json";
import homeEn from "./locales/en-US/home.json";
import errorEn from "./locales/en-US/error.json";
import errorIt from "./locales/it-IT/error.json";
import LanguageDetector from "i18next-browser-languagedetector";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, normalizeLocale } from "./locale";

const resources = {
  "en-US": { home: homeEn, error: errorEn },
  "it-IT": { home: homeIt, error: errorIt },
};

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    debug: false,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: [...SUPPORTED_LOCALES],
    load: "currentOnly",
    interpolation: { escapeValue: false },
    saveMissing: true,
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      convertDetectedLanguage: (lng: string) => normalizeLocale(lng),
    },
  });

export { i18next };
