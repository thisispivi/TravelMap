import { i18n } from "i18next";

export function showDate(date: Date, t: i18n["t"], length: "short" | "long") {
  return `  ${t(
    "weekdays." + date.getDay() + "." + length
  )} ${date.getDate()} ${t(
    "months." + date.getMonth() + "." + length
  )} ${date.getFullYear()}  `;
}
