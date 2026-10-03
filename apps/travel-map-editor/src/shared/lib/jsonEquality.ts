/**
 * Serializes a JSON value with every object's keys sorted, so two documents
 * that differ only in key order produce the same text.
 * @param {unknown} value - A JSON-serializable value
 * @returns {string} The canonical text
 */
function canonicalJson(value: unknown): string {
  return JSON.stringify(value, (_key, nested: unknown) =>
    nested && typeof nested === "object" && !Array.isArray(nested)
      ? Object.fromEntries(
          Object.entries(nested).toSorted(([first], [second]) =>
            first.localeCompare(second),
          ),
        )
      : nested,
  );
}

/**
 * Reports whether two documents hold the same data. Key order is ignored on
 * purpose: the server writes keys in schema order and the editor builds them
 * in whatever order an edit produced, and treating that as a change made every
 * save look unsaved and saved it again, forever.
 * @param {unknown} first - One document
 * @param {unknown} second - The other document
 * @returns {boolean} Whether they serialize to the same data
 */
export function isSameJson(first: unknown, second: unknown): boolean {
  return canonicalJson(first) === canonicalJson(second);
}
