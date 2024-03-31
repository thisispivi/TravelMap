import { i18n } from "i18next";

/**
 * Format a date based on the language
 *
 * @param {Date|undefined} date - The date to format
 * @param {i18n["language"]} lang - The language to format the date
 *
 * @returns {string} - The formatted date
 */
export function formatDate(
  date: Date | undefined,
  lang: i18n["language"],
): string {
  if (!lang.includes("en") && !lang.includes("it"))
    return "Unsupported language";

  if (!date) return "No date";

  const formattedDate = new Intl.DateTimeFormat(lang, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);

  return formattedDate;
}

/**
 * Format a date based on the language
 *
 * @param {Date|undefined} date - The date to format
 * @param {i18n["language"]} lang - The language to format the date
 *
 * @returns {string} - The formatted date
 */
export function formatDateMonthYear(
  date: Date | undefined,
  lang: i18n["language"],
): string {
  if (!lang.includes("en") && !lang.includes("it"))
    return "Unsupported language";

  if (!date) return "No date";

  const formattedDate = new Intl.DateTimeFormat(lang, {
    month: "long",
    year: "numeric",
  }).format(date);

  return formattedDate;
}
