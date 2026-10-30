import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

import { DEFAULT_LOCALE, normalizeLocale, SUPPORTED_LOCALES } from "./locale";

/**
 * Starts i18next the way both apps use it: translations fetched from
 * `/locales/<locale>/<namespace>.json`, the reader's choice remembered in
 * localStorage, and the shared `common` namespace loaded beside the app's own,
 * so a shared component can read `common:` keys wherever it is rendered.
 * @param {string[]} namespaces - The app's own namespaces, its default first
 * @returns {void}
 */
export function initI18n(namespaces: string[]): void {
  void i18next
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      ns: [...namespaces, "common"],
      defaultNS: namespaces[0],
      fallbackNS: "common",
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
}
