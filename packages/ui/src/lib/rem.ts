/**
 * Turns a rem length into the pixels that scripts and libraries such as MapLibre
 * need, at the reader's root font size, so a size written in code grows with the
 * browser's font setting just as the stylesheets' sizes do.
 * @param {number} rem - The length in rem
 * @returns {number} The length in CSS pixels
 */
export function remToPx(rem: number): number {
  const root = Number.parseFloat(
    getComputedStyle(document.documentElement).fontSize,
  );
  return rem * (root || 16);
}
