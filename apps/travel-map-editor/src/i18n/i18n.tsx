import {
  DEFAULT_LOCALE,
  normalizeLocale,
  SUPPORTED_LOCALES,
} from "@app/i18n/locale";
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

i18next
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    ns: ["editor"],
    defaultNS: "editor",
    debug: false,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: [...SUPPORTED_LOCALES],
    load: "currentOnly",
    interpolation: { escapeValue: false },
    saveMissing: false,
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      convertDetectedLanguage: (lng: string) => normalizeLocale(lng),
    },
    backend: { loadPath: "/locales/{{lng}}/{{ns}}.json" },
  });
