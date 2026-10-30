/**
 * Derives a stable id from a display name, keeping it readable in the URL and
 * on disk. Country ids are the map polygon's name in this form, which is how
 * the site finds the polygon a country fills.
 * @param {string} name - The display name
 * @returns {string} The derived id
 */
export function toId(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, " ")
      .split(" ")
      /* Empty words are dropped first, so every word has a first letter. */
      .filter(Boolean)
      .map((word) => word[0]!.toUpperCase() + word.slice(1))
      .join("")
  );
}
