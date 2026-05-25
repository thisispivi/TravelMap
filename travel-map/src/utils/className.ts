type ClassNameValue = string | false | null | undefined;

/**
 * classNames
 *
 * Joins conditional CSS class names while dropping empty values.
 *
 * @param {ClassNameValue[]} values - Class names or falsy values to ignore
 * @returns {string} The normalized class name string
 */
export function classNames(...values: ClassNameValue[]): string {
  return values.filter(Boolean).join(" ");
}
