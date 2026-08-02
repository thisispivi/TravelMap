/*
 * City ids become gallery URL segments and every id becomes a directory name,
 * so anything outside this set would break routing or the filesystem layout.
 */
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;

/**
 * Builds the dataset path a country document is stored at.
 * @param {string} id - Country identifier
 * @returns {string} Dataset-relative JSON path
 */
export function countryPath(id: string): string {
  return `${id}/${id}.json`;
}

/**
 * Builds the dataset path a city document is stored at.
 * @param {string} countryId - Owning country identifier
 * @param {string} id - City identifier
 * @returns {string} Dataset-relative JSON path
 */
export function cityPath(countryId: string, id: string): string {
  return `${countryId}/${id}/${id}.json`;
}

/**
 * Builds the dataset path a trip document is stored at.
 * @param {string} id - Trip identifier
 * @returns {string} Dataset-relative JSON path
 */
export function tripPath(id: string): string {
  return `trips/${id}.json`;
}

/**
 * Explains why an identifier cannot be used, if it cannot.
 * @param {string} id - Proposed identifier
 * @param {string[]} taken - Identifiers already present in the dataset
 * @returns {string | null} Validation message, or null when the id is usable
 */
export function idError(id: string, taken: string[]): string | null {
  if (!id) return "An id is required.";
  if (!ID_PATTERN.test(id))
    return "Use letters, digits, hyphens, and underscores only.";
  if (taken.includes(id)) return `The id "${id}" is already used.`;
  return null;
}

/**
 * Derives a stable id from a display name, keeping it readable in the URL and
 * on disk.
 * @param {string} name - The display name
 * @returns {string} The derived id
 */
export function toId(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0]!.toUpperCase() + word.slice(1))
    .join("");
}

/**
 * Derives a free id by appending a counter until nothing collides, so an
 * automated creation never fails on a name the dataset already uses.
 * @param {string} preferred - The id the caller would like
 * @param {string[]} taken - Identifiers already present in the dataset
 * @returns {string} An unused identifier
 */
export function uniqueId(preferred: string, taken: string[]): string {
  if (!taken.includes(preferred)) return preferred;
  let counter = 2;
  while (taken.includes(`${preferred}${counter}`)) counter += 1;
  return `${preferred}${counter}`;
}
