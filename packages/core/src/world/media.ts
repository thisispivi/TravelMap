/**
 * Resolves an authored media path against the fork's configured media root.
 * `VITE_CDN_PATH` is the only build-time value this package reads, and it is
 * optional on purpose: a fork that has not set it yet serves media from paths
 * relative to the site instead of interpolating `undefined` into every URL.
 * @param {string} path - Authored media path, as stored in the dataset
 * @returns {string} A browser-ready media URL
 */
export function mediaUrl(path: string): string {
  return `${import.meta.env.VITE_CDN_PATH ?? ""}${path}`;
}
