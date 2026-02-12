import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import { DEFAULT_LOCALE, normalizeLocale, SUPPORTED_LOCALES } from "./locale";
import errorEn from "./locales/en-US/error.json";
import homeEn from "./locales/en-US/home.json";
import errorIt from "./locales/it-IT/error.json";
import homeIt from "./locales/it-IT/home.json";

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
