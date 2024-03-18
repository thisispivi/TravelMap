import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import homeIt from "./locales/it/home.json";
import homeEn from "./locales/en/home.json";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: { home: homeEn },
  it: { home: homeIt },
};

i18next.use(LanguageDetector).use(initReactI18next).init({
  resources,
  debug: false,
  fallbackLng: "en",
  saveMissing: true,
});

export default i18next;
