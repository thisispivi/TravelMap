const LOCAL_DATE = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/;

/**
 * Parses a naive date as local wall-clock time instead of UTC midnight.
 * @param {string} value - A YYYY-MM-DD or YYYY-MM-DDTHH:mm local date
 * @returns {Date} The corresponding local Date
 */
export function parseLocalDate(value: string): Date {
  const match = LOCAL_DATE.exec(value);

  if (!match) throw new Error(`Invalid local date: ${value}`);

  const [, year, month, day, hours = "00", minutes = "00"] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours),
    Number(minutes),
  );

  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day) ||
    date.getHours() !== Number(hours) ||
    date.getMinutes() !== Number(minutes)
  ) {
    throw new Error(`Invalid local date: ${value}`);
  }

  return date;
}

/**
 * Formats a local Date without introducing a timezone conversion.
 * @param {Date} date - The local date to format
 * @returns {string} A YYYY-MM-DD or YYYY-MM-DDTHH:mm value
 */
export function formatLocalDate(date: Date): string {
  const datePart = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part) => String(part).padStart(2, "0"))
    .join("-");

  if (date.getHours() === 0 && date.getMinutes() === 0) return datePart;

  return `${datePart}T${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}
